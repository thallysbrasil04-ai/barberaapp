import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function generatePassword(): string {
  return randomBytes(12).toString("base64url") + "A1!";
}

async function main() {
  console.log("🌱 Iniciando seed...");

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || generatePassword();
  const barberPassword = process.env.SEED_BARBER_PASSWORD || generatePassword();
  const clientPassword = process.env.SEED_CLIENT_PASSWORD || generatePassword();

  const adminHashed = await bcrypt.hash(adminPassword, 10);
  const barberHashed = await bcrypt.hash(barberPassword, 10);
  const clientHashed = await bcrypt.hash(clientPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@barberapp.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@barberapp.com",
      phone: "11999999999",
      password: adminHashed,
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
      password: barberHashed,
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
      password: barberHashed,
      role: "BARBER",
      consentLGPD: true,
    },
  });

  const barber2 = await prisma.barber.upsert({
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
      password: clientHashed,
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
  for (const barberId of [barber.id, barber2.id]) {
    for (const day of days) {
      await prisma.workingHours.upsert({
        where: { barberId_dayOfWeek: { barberId, dayOfWeek: day } },
        update: {},
        create: {
          barberId,
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

  console.log("✅ Seed concluído!");
  console.log("   Admin: admin@barberapp.com");
  console.log("   Barber: barber@barberapp.com");
  console.log("   Client: cliente@email.com");
  if (process.env.SEED_ADMIN_PASSWORD) {
    console.log("   Senhas definidas via variáveis de ambiente.");
  } else {
    console.log("   ⚠️  Senhas geradas aleatoriamente. Defina SEED_*_PASSWORD para controlar.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
