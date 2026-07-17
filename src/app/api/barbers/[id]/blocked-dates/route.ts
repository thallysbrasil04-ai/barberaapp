import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dates = await prisma.blockedDate.findMany({
      where: { barberId: id },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ ok: true, data: dates });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    if (!body.date) {
      return NextResponse.json({ ok: false, error: "Data é obrigatória" }, { status: 400 });
    }

    const existing = await prisma.blockedDate.findUnique({
      where: { barberId_date: { barberId: id, date: body.date } },
    });

    if (existing) {
      return NextResponse.json({ ok: false, error: "Esta data já está bloqueada" }, { status: 400 });
    }

    const blocked = await prisma.blockedDate.create({
      data: { barberId: id, date: body.date, reason: body.reason || null },
    });

    return NextResponse.json({ ok: true, data: blocked }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
