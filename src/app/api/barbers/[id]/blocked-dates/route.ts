import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dates = await prisma.blockedDate.findMany({
    where: { barberId: id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ ok: true, data: dates });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

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
}


