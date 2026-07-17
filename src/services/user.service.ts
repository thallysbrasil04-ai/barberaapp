import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
  consentLGPD: boolean;
}): Promise<ApiResponse> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phone: data.phone }],
    },
  });

  if (existing) {
    return { ok: false, error: "E-mail ou telefone já cadastrado" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone.replace(/\D/g, ""),
      password: hashedPassword,
      cpf: data.cpf?.replace(/\D/g, ""),
      consentLGPD: data.consentLGPD,
      role: "CLIENT",
    },
  });

  return { ok: true, data: { id: user.id, name: user.name, email: user.email } };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      active: true,
      cpf: true,
      createdAt: true,
    },
  });
}

export async function listUsers(page = 1, limit = 20, role?: string) {
  const skip = (page - 1) * limit;
  const where = role ? { role } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateUser(id: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
}>) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      active: true,
    },
  });
}
