import { getAvailableSlots } from "@/services/barber.service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const barberId = url.searchParams.get("barberId");
  const date = url.searchParams.get("date");

  if (!barberId || !date) {
    return NextResponse.json({ ok: false, error: "Parâmetros inválidos" }, { status: 400 });
  }

  const slots = await getAvailableSlots(barberId, date);
  return NextResponse.json({ ok: true, data: slots });
}
