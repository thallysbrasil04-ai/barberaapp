import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const userId = session.user.id;

    const anonEmail = `removido-${userId.slice(0, 8)}@anon.barberapp`;

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "Usuário Removido",
        email: anonEmail,
        phone: "00000000000",
        password: "",
        cpf: null,
        avatar: null,
        active: false,
        consentLGPD: false,
      },
    });

    await prisma.appointment.updateMany({
      where: { userId },
      data: { notes: "Usuário removido" },
    });

    return NextResponse.json({ ok: true, message: "Dados anonimizados com sucesso" });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro ao anonimizar dados" }, { status: 500 });
  }
}
