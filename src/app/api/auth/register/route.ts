import { NextResponse } from "next/server";
import { registerUser } from "@/services/user.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await registerUser(body);
    return NextResponse.json(result, { status: result.ok ? 201 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
