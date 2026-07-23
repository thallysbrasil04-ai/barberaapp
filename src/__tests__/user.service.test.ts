import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { registerUser } from "@/services/user.service";

const mockPrisma = vi.mocked(prisma);

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria usuário com dados válidos", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "u1", name: "João", email: "joao@email.com",
      phone: "11999999999", password: "hash", role: "CLIENT",
      cpf: null, avatar: null, active: true, consentLGPD: true,
      createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await registerUser({
      name: "João", email: "joao@email.com", phone: "11999999999",
      password: "12345678", cpf: undefined, consentLGPD: true,
    });

    expect(result.ok).toBe(true);
    expect(mockPrisma.user.create).toHaveBeenCalledOnce();
  });

  it("rejeita email duplicado", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "existing", email: "joao@email.com",
    } as never);

    const result = await registerUser({
      name: "João", email: "joao@email.com", phone: "11999999999",
      password: "12345678", cpf: undefined, consentLGPD: true,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("E-mail ou telefone já cadastrado");
  });

  it("rejeita telefone duplicado", async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: "existing", phone: "11999999999",
    } as never);

    const result = await registerUser({
      name: "João", email: "joao@test.com", phone: "11999999999",
      password: "12345678", cpf: undefined, consentLGPD: true,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("E-mail ou telefone já cadastrado");
  });
});
