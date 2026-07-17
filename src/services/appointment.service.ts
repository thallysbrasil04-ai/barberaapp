import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function createAppointment(data: {
  userId: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}): Promise<ApiResponse> {
  const conflict = await prisma.appointment.findUnique({
    where: {
      barberId_date_time: {
        barberId: data.barberId,
        date: data.date,
        time: data.time,
      },
    },
  });

  if (conflict) {
    return { ok: false, error: "Este horário já está reservado" };
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: data.userId,
      barberId: data.barberId,
      serviceId: data.serviceId,
      date: data.date,
      time: data.time,
      notes: data.notes ?? null,
      status: "AGENDADO",
    },
    include: {
      service: true,
      barber: { include: { user: { select: { name: true } } } },
    },
  });

  return { ok: true, data: appointment };
}

export async function listAppointments(filters: {
  barberId?: string;
  userId?: string;
  date?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { barberId, userId, date, status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (barberId) where.barberId = barberId;
  if (userId) where.userId = userId;
  if (date) where.date = date;
  if (status) where.status = status;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: {
        user: { select: { id: true, name: true, phone: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { appointments, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateAppointmentStatus(
  id: string,
  status: string
): Promise<ApiResponse> {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
  });
  return { ok: true, data: appointment };
}

type Period = "today" | "week" | "month" | "all";

function getDateRange(period: Period = "today") {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (period === "today") {
    return { start: todayStr, end: todayStr, label: todayStr };
  }

  if (period === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { start: start.toISOString().split("T")[0], end: todayStr, label: "week" };
  }

  if (period === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: start.toISOString().split("T")[0], end: todayStr, label: "month" };
  }

  return { start: "2000-01-01", end: todayStr, label: "all" };
}

function generateDayLabels(start: string, end: string) {
  const days: { date: string; label: string }[] = [];
  const startDate = new Date(start + "T12:00:00");
  const endDate = new Date(end + "T12:00:00");
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const day = current.getDay();
    const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    days.push({ date: dateStr, label: labels[day] });
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export async function getDashboardMetrics(period: Period = "today") {
  const today = new Date().toISOString().split("T")[0];
  const range = getDateRange(period);
  const dayLabels = generateDayLabels(range.start, range.end);

  const notCancelled = { status: { notIn: ["CANCELADO", "NAO_COMPARECEU"] } };
  const periodFilter = { date: { gte: range.start, lte: range.end } };

  const [
    totalClients,
    totalBarbers,
    totalServices,
    todayAppointments,
    todayConfirmed,
    statusCounts,
    dayGrouped,
    recentAppointments,
    revenuePeriodAgg,
    revenueAllAgg,
    topServices,
    barberStats,
    noShowCount,
    cancellationCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.barber.count({ where: { active: true } }),
    prisma.service.count({ where: { active: true } }),
    prisma.appointment.count({ where: { date: today, ...notCancelled } }),
    prisma.appointment.count({ where: { date: today, status: "CONFIRMADO" } }),
    prisma.appointment.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { ...(period !== "today" ? periodFilter : {}) },
    }),
    prisma.appointment.groupBy({
      by: ["date"],
      _count: { id: true },
      where: { date: { gte: range.start, lte: range.end }, ...notCancelled },
    }),
    prisma.appointment.findMany({
      where: { date: { gte: today }, status: { notIn: ["CANCELADO", "FINALIZADO", "NAO_COMPARECEU"] } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 6,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        barber: { select: { id: true, user: { select: { name: true } } } },
        service: { select: { id: true, name: true, price: true } },
      },
    }),
    prisma.appointment.findMany({
      where: { ...notCancelled, ...periodFilter },
      select: { service: { select: { price: true } } },
    }),
    prisma.appointment.findMany({
      where: { ...notCancelled },
      select: { service: { select: { price: true } } },
    }),
    prisma.appointment.groupBy({
      by: ["serviceId"],
      _count: { id: true },
      where: { ...notCancelled, ...periodFilter },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.appointment.groupBy({
      by: ["barberId"],
      _count: { id: true },
      where: periodFilter,
    }),
    prisma.appointment.count({ where: { status: "NAO_COMPARECEU" } }),
    prisma.appointment.count({ where: { status: "CANCELADO" } }),
  ]);

  const revenuePeriodTotal = revenuePeriodAgg.reduce((acc, curr) => acc + curr.service.price, 0);
  const revenueAllTotal = revenueAllAgg.reduce((acc, curr) => acc + curr.service.price, 0);
  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => { statusMap[s.status] = s._count.id; });

  const totalAppointments = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const completionRate = totalAppointments > 0
    ? Math.round(((totalAppointments - (statusMap["NAO_COMPARECEU"] || 0) - (statusMap["CANCELADO"] || 0)) / totalAppointments) * 100)
    : 0;

  const dayCountMap = new Map(dayGrouped.map((d) => [d.date, d._count.id]));
  const dayData = dayLabels.map((d) => ({ ...d, count: dayCountMap.get(d.date) || 0 }));

  const serviceIds = topServices.map((s) => s.serviceId);
  const servicesMap = serviceIds.length > 0
    ? new Map(
        (await prisma.service.findMany({
          where: { id: { in: serviceIds } },
          select: { id: true, name: true },
        })).map((s) => [s.id, s.name])
      )
    : new Map();
  const topServicesData = topServices.map((s) => ({
    name: servicesMap.get(s.serviceId) || "Desconhecido",
    count: s._count.id,
  }));

  const barberIds = barberStats.map((b) => b.barberId);
  const barbersMap = barberIds.length > 0
    ? new Map(
        (await prisma.barber.findMany({
          where: { id: { in: barberIds } },
          include: { user: { select: { name: true } } },
        })).map((b) => [b.id, b.user.name])
      )
    : new Map();
  const barberStatsData = barberStats.map((b) => ({
    name: barbersMap.get(b.barberId) || "Desconhecido",
    count: b._count.id,
  }));

  return {
    todayAppointments,
    todayConfirmed,
    totalClients,
    totalBarbers,
    totalServices,
    revenue: revenuePeriodTotal,
    revenueAll: revenueAllTotal,
    period,
    completionRate,
    nextAppointments: recentAppointments,
    dayData,
    statusDistribution: statusMap,
    topServices: topServicesData,
    barberStats: barberStatsData,
    noShowCount,
    cancellationCount,
  };
}
