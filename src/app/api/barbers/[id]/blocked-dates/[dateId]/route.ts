import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; dateId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const { id, dateId } = await params;

    const isOwner = session.user.role === "BARBER" && session.user.barberId === id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const blocked = await prisma.blockedDate.findUnique({ where: { id: dateId } });
    if (!blocked) {
      return NextResponse.json({ ok: false, error: "Data não encontrada" }, { status: 404 });
    }

    await prisma.blockedDate.delete({ where: { id: dateId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
