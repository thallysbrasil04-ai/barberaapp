import { auth } from "@/lib/auth";
import { updateService } from "@/services/service.service";
import { NextResponse } from "next/server";
import { serviceSchema } from "@/validators";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.price !== undefined || body.duration !== undefined || body.name !== undefined) {
      const parsed = serviceSchema.partial().safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, error: parsed.error.issues[0].message }, { status: 400 });
      }
    }

    const service = await updateService(id, body);
    return NextResponse.json({ ok: true, data: service });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
