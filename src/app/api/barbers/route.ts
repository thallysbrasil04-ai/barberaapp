import { auth } from "@/lib/auth";
import { listBarbers, createBarber } from "@/services/barber.service";
import { NextResponse } from "next/server";
import { barberSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get("activeOnly") === "true";
    const session = await auth();

    if (!session?.user || session.user.role === "CLIENT") {
      const barbers = await listBarbers(true);
      return NextResponse.json({ ok: true, data: barbers });
    }

    const barbers = await listBarbers(activeOnly);
    return NextResponse.json({ ok: true, data: barbers });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = barberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const result = await createBarber(parsed.data);
    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
