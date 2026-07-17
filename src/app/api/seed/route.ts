import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const adminPassword = await bcrypt.hash("admin123", 10);
    const barberPassword = await bcrypt.hash("barber123", 10);
    const clientPassword = await bcrypt.hash("client123", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@barberapp.com" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@barberapp.com",
        phone: "11999999999",
        password: adminPassword,
        role: "ADMIN",
        active: true,
        consentLGPD: true,
      },
    });

    const barberUser = await prisma.user.upsert({
      where: { email: "barber@barberapp.com" },
      update: {},
      create: {
        name: "Carlos Silva",
        email: "barber@barberapp.com",
        phone: "11988888888",
        password: barberPassword,
        role: "BARBER",
        active: true,
        consentLGPD: true,
      },
    });

    const barber = await prisma.barber.upsert({
      where: { userId: barberUser.id },
      update: {},
      create: {
        userId: barberUser.id,
        bio: "Barbeiro especializado em cortes masculinos e degradê",
        specialties: "Corte, Barba, Degradê",
      },
    });

    const barber2User = await prisma.user.upsert({
      where: { email: "barber2@barberapp.com" },
      update: {},
      create: {
        name: "Rafael Oliveira",
        email: "barber2@barberapp.com",
        phone: "11977777777",
        password: barberPassword,
        role: "BARBER",
        consentLGPD: true,
      },
    });

    await prisma.barber.upsert({
      where: { userId: barber2User.id },
      update: {},
      create: {
        userId: barber2User.id,
        bio: "Especialista em barboterapia e cortes clássicos",
        specialties: "Barboterapia, Corte Clássico, Hidratação",
      },
    });

    await prisma.user.upsert({
      where: { email: "cliente@email.com" },
      update: {},
      create: {
        name: "João Cliente",
        email: "cliente@email.com",
        phone: "11966666666",
        password: clientPassword,
        role: "CLIENT",
        active: true,
        consentLGPD: true,
      },
    });

    const services = [
      { name: "Corte Degradê", description: "Corte degradê com máquina e tesoura", price: 55, duration: 40, category: "CORTE" },
      { name: "Corte Social", description: "Corte clássico social", price: 45, duration: 30, category: "CORTE" },
      { name: "Barba Completa", description: "Aparação e modelagem de barba", price: 35, duration: 25, category: "BARBA" },
      { name: "Barboterapia", description: "Barba com toalha quente e pós-barba", price: 50, duration: 40, category: "BARBA" },
      { name: "Hidratação Capilar", description: "Hidratação profunda com queratina", price: 60, duration: 45, category: "HIDRATAÇÃO" },
      { name: "Sobrancelha", description: "Design de sobrancelha", price: 25, duration: 15, category: "SOBRANCELHA" },
      { name: "Combo Corte + Barba", description: "Corte degradê + barba completa", price: 80, duration: 60, category: "COMBO" },
      { name: "Combo Completo", description: "Corte + barba + hidratação", price: 120, duration: 90, category: "COMBO" },
    ];

    for (const service of services) {
      await prisma.service.upsert({
        where: { name: service.name },
        update: {},
        create: service,
      });
    }

    const days = [1, 2, 3, 4, 5, 6];
    const allBarbers = await prisma.barber.findMany();
    for (const b of allBarbers) {
      for (const day of days) {
        await prisma.workingHours.upsert({
          where: { barberId_dayOfWeek: { barberId: b.id, dayOfWeek: day } },
          update: {},
          create: {
            barberId: b.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "18:00",
            breakStart: "12:00",
            breakEnd: "13:00",
            active: true,
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Banco semeado!",
      accounts: {
        admin: "admin@barberapp.com / admin123",
        barber: "barber@barberapp.com / barber123",
        barber2: "barber2@barberapp.com / barber123",
        client: "cliente@email.com / client123",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Erro ao semear" }, { status: 500 });
  }
}
