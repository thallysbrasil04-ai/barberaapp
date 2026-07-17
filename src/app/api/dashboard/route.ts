import { auth } from "@/lib/auth";
import { getDashboardMetrics } from "@/services/appointment.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  if (session.user.role === "CLIENT") {
    return NextResponse.json({ ok: false, error: "Sem acesso" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const period = (url.searchParams.get("period") as "today" | "week" | "month") || "today";
    const metrics = await getDashboardMetrics(period);
    return NextResponse.json({ ok: true, data: metrics });
  } catch (e) {
    console.error("Dashboard error:", e);
    return NextResponse.json({ ok: false, error: "Erro ao carregar métricas" }, { status: 500 });
  }
}
