import { auth } from "@/lib/auth";
import { listAppointments, createAppointment } from "@/services/appointment.service";
import { NextResponse } from "next/server";
import { appointmentSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const status = url.searchParams.get("status") || undefined;

    if (!date) {
      return NextResponse.json({ ok: false, error: "Data é obrigatória" }, { status: 400 });
    }

    const filters: Record<string, unknown> = { date, status };
    if (session.user.role === "BARBER" && session.user.barberId) {
      filters.barberId = session.user.barberId;
    }
    if (session.user.role === "CLIENT") {
      filters.userId = session.user.id;
    }

    const data = await listAppointments(filters as Parameters<typeof listAppointments>[0]);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = appointmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const result = await createAppointment({
      ...parsed.data,
      userId: session.user.id,
    });
    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
