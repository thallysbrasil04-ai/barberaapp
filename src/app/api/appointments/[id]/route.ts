import { auth } from "@/lib/auth";
import { updateAppointmentStatus } from "@/services/appointment.service";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = await updateAppointmentStatus(id, body.status);
  return NextResponse.json(result);
}
