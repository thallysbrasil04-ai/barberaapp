import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const hours = await prisma.workingHours.findMany({
      where: { barberId: id },
      orderBy: { dayOfWeek: "asc" },
    });
    return NextResponse.json({ ok: true, data: hours });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;

    const isOwner = session.user.role === "BARBER" && session.user.barberId === id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Dados inválidos" }, { status: 400 });
    }

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
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
