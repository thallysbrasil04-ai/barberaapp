import { auth } from "@/lib/auth";
import { listUsers } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Não autorizado" }, { status: 403 });
  }

  const data = await listUsers();
  return NextResponse.json({ ok: true, data });
}
