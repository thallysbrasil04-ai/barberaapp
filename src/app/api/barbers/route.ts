import { auth } from "@/lib/auth";
import { listBarbers, createBarber } from "@/services/barber.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const activeOnly = url.searchParams.get("activeOnly") === "true";
  const session = await auth();

  if (!session?.user || session.user.role === "CLIENT") {
    const barbers = await listBarbers(true);
    return NextResponse.json({ ok: true, data: barbers });
  }

  const barbers = await listBarbers(activeOnly);
  return NextResponse.json({ ok: true, data: barbers });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const result = await createBarber(body);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
