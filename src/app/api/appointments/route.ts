import { auth } from "@/lib/auth";
import { listAppointments, createAppointment } from "@/services/appointment.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
  const status = url.searchParams.get("status") || undefined;

  const filters: Record<string, unknown> = { date, status };
  if (session.user.role === "BARBER" && session.user.barberId) {
    filters.barberId = session.user.barberId;
  }
  if (session.user.role === "CLIENT") {
    filters.userId = session.user.id;
  }

  const data = await listAppointments(filters as Parameters<typeof listAppointments>[0]);
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const result = await createAppointment({
    ...body,
    userId: session.user.id,
  });
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
