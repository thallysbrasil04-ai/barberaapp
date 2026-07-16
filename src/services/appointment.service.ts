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

function getWeekDays() {
  const days = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export async function getDashboardMetrics() {
  const today = new Date().toISOString().split("T")[0];
  const weekDays = getWeekDays();

  const [
    todayAppointments,
    totalClients,
    totalBarbers,
    totalServices,
    revenueResult,
    statusCounts,
    weekData,
    recentAppointments,
    todayConfirmed,
    noShowCount,
    cancellationCount,
  ] = await Promise.all([
    prisma.appointment.count({ where: { date: today, status: { notIn: ["CANCELADO", "NAO_COMPARECEU"] } } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.barber.count({ where: { active: true } }),
    prisma.service.count({ where: { active: true } }),
    prisma.appointment.findMany({
      where: { status: { notIn: ["CANCELADO", "NAO_COMPARECEU"] } },
      select: { service: { select: { price: true } } },
    }),
    prisma.appointment.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    Promise.all(
      weekDays.map((date) =>
        prisma.appointment.count({
          where: { date, status: { notIn: ["CANCELADO", "NAO_COMPARECEU"] } },
        })
      )
    ),
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
    prisma.appointment.count({ where: { date: today, status: "CONFIRMADO" } }),
    prisma.appointment.count({ where: { status: "NAO_COMPARECEU" } }),
    prisma.appointment.count({ where: { status: "CANCELADO" } }),
  ]);

  const revenue = revenueResult.reduce((acc, curr) => acc + curr.service.price, 0);
  const statusMap: Record<string, number> = {};
  statusCounts.forEach((s) => { statusMap[s.status] = s._count.id; });
  const completionRate = totalClients > 0
    ? Math.round(((totalClients - noShowCount - cancellationCount) / totalClients) * 100)
    : 0;

  return {
    todayAppointments,
    totalClients,
    totalBarbers,
    totalServices,
    revenue,
    todayConfirmed,
    completionRate,
    nextAppointments: recentAppointments,
    weekData: weekDays.map((date, i) => ({ date, count: weekData[i] })),
    statusDistribution: statusMap,
    noShowCount,
    cancellationCount,
  };
}
