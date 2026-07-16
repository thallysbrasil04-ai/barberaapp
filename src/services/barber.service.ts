import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function createBarber(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  bio?: string;
  specialties?: string;
}): Promise<ApiResponse> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phone: data.phone }],
    },
  });

  if (existing) {
    return { ok: false, error: "E-mail ou telefone já cadastrado" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone.replace(/\D/g, ""),
      password: hashedPassword,
      role: "BARBER",
      barber: {
        create: {
          bio: data.bio ?? null,
          specialties: data.specialties ?? null,
        },
      },
    },
    include: { barber: true },
  });

  return { ok: true, data: { id: user.id, name: user.name, barberId: user.barber?.id } };
}

export async function listBarbers(activeOnly = false) {
  const where = activeOnly ? { barber: { active: true }, active: true } : {};
  return prisma.user.findMany({
    where: {
      role: "BARBER",
      ...(activeOnly ? { barber: { active: true }, active: true } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      active: true,
      barber: {
        select: {
          id: true,
          bio: true,
          specialties: true,
          active: true,
          workingHours: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getBarberById(id: string) {
  return prisma.barber.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      },
      workingHours: { orderBy: { dayOfWeek: "asc" } },
      blockedDates: true,
    },
  });
}

export async function updateBarber(
  barberId: string,
  data: { bio?: string; specialties?: string; active?: boolean }
) {
  return prisma.barber.update({
    where: { id: barberId },
    data,
  });
}

export async function upsertWorkingHours(
  barberId: string,
  hours: { dayOfWeek: number; startTime: string; endTime: string; active: boolean }[]
) {
  await prisma.workingHours.deleteMany({ where: { barberId } });

  return prisma.workingHours.createMany({
    data: hours.map((h) => ({ ...h, barberId })),
  });
}

export async function getAvailableSlots(barberId: string, date: string) {
  const barber = await prisma.barber.findUnique({
    where: { id: barberId },
    include: { workingHours: { where: { active: true } } },
  });

  if (!barber) return [];

  const dayOfWeek = new Date(date + "T12:00:00").getDay();
  const dayHours = barber.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

  if (!dayHours || !dayHours.active) return [];

  const blocked = await prisma.blockedDate.findFirst({
    where: { barberId, date },
  });

  if (blocked) return [];

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      date,
      status: { notIn: ["CANCELADO", "NAO_COMPARECEU"] },
    },
    select: { time: true },
  });

  const bookedTimes = new Set(existingAppointments.map((a) => a.time));

  const [startH, startM] = dayHours.startTime.split(":").map(Number);
  const [endH, endM] = dayHours.endTime.split(":").map(Number);

  let breakStartMin = -1;
  let breakEndMin = -1;
  if (dayHours.breakStart && dayHours.breakEnd) {
    const [bsH, bsM] = dayHours.breakStart.split(":").map(Number);
    const [beH, beM] = dayHours.breakEnd.split(":").map(Number);
    breakStartMin = bsH * 60 + bsM;
    breakEndMin = beH * 60 + beM;
  }

  const slots: string[] = [];
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current < end) {
    if (breakStartMin >= 0 && current >= breakStartMin && current < breakEndMin) {
      current = breakEndMin;
      continue;
    }

    const h = Math.floor(current / 60);
    const m = current % 60;
    const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    if (!bookedTimes.has(time)) {
      slots.push(time);
    }

    current += 30;
  }

  return slots;
}
