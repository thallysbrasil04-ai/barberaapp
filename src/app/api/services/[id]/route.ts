import { auth } from "@/lib/auth";
import { updateService } from "@/services/service.service";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const service = await updateService(id, body);
  return NextResponse.json({ ok: true, data: service });
}
