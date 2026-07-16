import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function createService(data: {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: string;
}): Promise<ApiResponse> {
  const existing = await prisma.service.findUnique({ where: { name: data.name } });
  if (existing) {
    return { ok: false, error: "Já existe um serviço com este nome" };
  }

  const service = await prisma.service.create({ data });
  return { ok: true, data: service };
}

export async function listServices(activeOnly = false) {
  const where = activeOnly ? { active: true } : {};
  return prisma.service.findMany({
    where,
    orderBy: { category: "asc" },
  });
}

export async function updateService(id: string, data: Partial<{
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  active: boolean;
}>) {
  return prisma.service.update({ where: { id }, data });
}
