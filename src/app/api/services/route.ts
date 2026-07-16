import { auth } from "@/lib/auth";
import { listServices, createService } from "@/services/service.service";
import { NextResponse } from "next/server";

export async function GET() {
  const services = await listServices();
  return NextResponse.json({ ok: true, data: services });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const result = await createService(body);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
