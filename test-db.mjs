import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const services = await prisma.service.findMany();
  console.log('Services:', services.length);
  const barbers = await prisma.user.findMany({ where: { role: 'BARBER' }, select: { id: true, name: true, barber: { select: { id: true, bio: true, specialties: true, workingHours: true } } } });
  console.log('Barbers:', barbers.length);
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stack?.split('\n').slice(0, 5).join('\n'));
} finally {
  await prisma.$disconnect();
}
