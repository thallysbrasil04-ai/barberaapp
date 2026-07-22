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
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const data = await listUsers(page, limit, role);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
