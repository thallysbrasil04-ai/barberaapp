// Simulate what the API route does
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
  const services = await prisma.service.findMany({ orderBy: { category: 'asc' } });
  console.log('Services OK:', services.length);
} catch(e) {
  console.error('Services Error:', e.message);
}

try {
  const barbers = await prisma.user.findMany({
    where: { role: 'BARBER' },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true, active: true,
      barber: { select: { id: true, bio: true, specialties: true, active: true, workingHours: true } },
    },
    orderBy: { name: 'asc' },
  });
  console.log('Barbers OK:', barbers.length);
} catch(e) {
  console.error('Barbers Error:', e.message);
}

await prisma.$disconnect();
