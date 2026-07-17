import { auth } from "@/lib/auth";
import { updateAppointmentStatus } from "@/services/appointment.service";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO", "NAO_COMPARECEU"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ ok: false, error: "Status inválido" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return NextResponse.json({ ok: false, error: "Agendamento não encontrado" }, { status: 404 });
    }

    if (session.user.role === "CLIENT") {
      if (appointment.userId !== session.user.id) {
        return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
      }
      if (body.status !== "CANCELADO") {
        return NextResponse.json({ ok: false, error: "Clientes só podem cancelar" }, { status: 403 });
      }
    }

    if (session.user.role === "BARBER") {
      if (appointment.barberId !== session.user.barberId) {
        return NextResponse.json({ ok: false, error: "Este agendamento não é seu" }, { status: 403 });
      }
    }

    const result = await updateAppointmentStatus(id, body.status);
    return NextResponse.json(result);
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
    const body = await req.json();

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return NextResponse.json({ ok: false, error: "Agendamento não encontrado" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        date: body.date ?? appointment.date,
        time: body.time ?? appointment.time,
        barberId: body.barberId ?? appointment.barberId,
        serviceId: body.serviceId ?? appointment.serviceId,
        notes: body.notes ?? appointment.notes,
      },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
