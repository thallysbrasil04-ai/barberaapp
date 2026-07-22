import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, whatsapp, data } = body;

    if (!nome || !email || !whatsapp) {
      return NextResponse.json({ ok: false, error: "Dados obrigatórios" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: "E-mail inválido" }, { status: 400 });
    }

    const phoneDigits = whatsapp.replace(/\D/g, "");
    if (!/^\d{10,11}$/.test(phoneDigits)) {
      return NextResponse.json({ ok: false, error: "WhatsApp inválido" }, { status: 400 });
    }

    await prisma.lead.create({
      data: {
        name: nome.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneDigits,
        source: "landing-page",
        notes: data ? `Data de interesse: ${data}` : null,
      },
    });

    return NextResponse.json({ ok: true, message: "Lead salvo com sucesso" });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count(),
    ]);

    return NextResponse.json({ ok: true, data: leads, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ ok: false, error: "Erro interno" }, { status: 500 });
  }
}
