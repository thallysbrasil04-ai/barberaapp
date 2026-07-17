import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({ ok: false, message: "Database already seeded", count });
    }
    console.log("Seeding database...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const barberPassword = await bcrypt.hash("barber123", 10);
    const clientPassword = await bcrypt.hash("client123", 10);

    await prisma.user.create({
      data: {
        name: "Admin", email: "admin@barberapp.com", phone: "11999999999",
        password: adminPassword, role: "ADMIN", active: true, consentLGPD: true,
      },
    });

    const barberUser = await prisma.user.create({
      data: {
        name: "Carlos Silva", email: "barber@barberapp.com", phone: "11988888888",
        password: barberPassword, role: "BARBER", active: true, consentLGPD: true,
      },
    });

    await prisma.barber.create({
      data: {
        userId: barberUser.id,
        bio: "Barbeiro especializado em cortes masculinos e degradê",
        specialties: "Corte, Barba, Degradê",
      },
    });

    const barber2User = await prisma.user.create({
      data: {
        name: "Rafael Oliveira", email: "barber2@barberapp.com", phone: "11977777777",
        password: barberPassword, role: "BARBER", consentLGPD: true,
      },
    });

    const barber2 = await prisma.barber.create({
      data: {
        userId: barber2User.id,
        bio: "Especialista em barboterapia e cortes clássicos",
        specialties: "Barboterapia, Corte Clássico, Hidratação",
      },
    });

    await prisma.user.create({
      data: {
        name: "João Cliente", email: "cliente@email.com", phone: "11966666666",
        password: clientPassword, role: "CLIENT", active: true, consentLGPD: true,
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
      await prisma.service.create({ data: service });
    }

    const days = [1, 2, 3, 4, 5, 6];
    const barbers = await prisma.barber.findMany();
    for (const barber of barbers) {
      for (const day of days) {
        await prisma.workingHours.create({
          data: {
            barberId: barber.id, dayOfWeek: day,
            startTime: "09:00", endTime: "18:00",
            breakStart: "12:00", breakEnd: "13:00", active: true,
          },
        });
      }
    }

    return NextResponse.json({ ok: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}