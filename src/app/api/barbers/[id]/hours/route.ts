import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hours = await prisma.workingHours.findMany({
    where: { barberId: id },
    orderBy: { dayOfWeek: "asc" },
  });
  return NextResponse.json({ ok: true, data: hours });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  await prisma.workingHours.deleteMany({ where: { barberId: id } });

  const data = body.map((h: { dayOfWeek: number; startTime: string; endTime: string; breakStart?: string; breakEnd?: string; active: boolean }) => ({
    barberId: id,
    dayOfWeek: h.dayOfWeek,
    startTime: h.startTime,
    endTime: h.endTime,
    breakStart: h.breakStart || null,
    breakEnd: h.breakEnd || null,
    active: h.active,
  }));

  await prisma.workingHours.createMany({ data });

  const hours = await prisma.workingHours.findMany({
    where: { barberId: id },
    orderBy: { dayOfWeek: "asc" },
  });

  return NextResponse.json({ ok: true, data: hours });
}
