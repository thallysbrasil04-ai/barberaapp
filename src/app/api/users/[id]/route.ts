import { auth } from "@/lib/auth";
import { updateUser } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.role && body.role !== session.user.role) {
      return NextResponse.json({ ok: false, error: "Não pode alterar própria role" }, { status: 400 });
    }

    const user = await updateUser(id, body);
    return NextResponse.json({ ok: true, data: user });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
