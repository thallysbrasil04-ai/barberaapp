import { getAvailableSlots } from "@/services/barber.service";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const barberId = url.searchParams.get("barberId");
    const date = url.searchParams.get("date");
    const serviceId = url.searchParams.get("serviceId");

    if (!barberId || !date) {
      return NextResponse.json({ ok: false, error: "Parâmetros inválidos" }, { status: 400 });
    }

    let duration = 30;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { duration: true },
      });
      if (service) duration = service.duration;
    }

    const slots = await getAvailableSlots(barberId, date, duration);
    return NextResponse.json({ ok: true, data: slots });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
