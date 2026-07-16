import { auth } from "@/lib/auth";
import { getDashboardMetrics } from "@/services/appointment.service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.user.role === "CLIENT") {
    return NextResponse.json({ ok: false, error: "Sem acesso" }, { status: 403 });
  }

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json({ ok: true, data: metrics });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro ao carregar métricas" }, { status: 500 });
  }
}
