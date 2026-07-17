import { auth } from "@/lib/auth";
import { listUsers } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const url = new URL(req.url);
    const role = url.searchParams.get("role") || undefined;
    const data = await listUsers(1, 20, role);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
