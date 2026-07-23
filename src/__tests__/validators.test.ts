import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  serviceSchema,
  barberSchema,
  appointmentSchema,
  workingHoursSchema,
} from "@/validators";

describe("loginSchema", () => {
  it("aceita credenciais válidas", () => {
    const result = loginSchema.safeParse({ email: "teste@email.com", password: "12345678" });
    expect(result.success).toBe(true);
  });

  it("rejeita email inválido", () => {
    const result = loginSchema.safeParse({ email: "invalido", password: "12345678" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha curta", () => {
    const result = loginSchema.safeParse({ email: "teste@email.com", password: "123" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "João", email: "joao@email.com", phone: "11999999999",
    password: "12345678", confirmPassword: "12345678", consentLGPD: true,
  };

  it("aceita cadastro válido", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita senhas diferentes", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "outrasenha" });
    expect(result.success).toBe(false);
  });

  it("rejeita consentimento falso", () => {
    const result = registerSchema.safeParse({ ...valid, consentLGPD: false });
    expect(result.success).toBe(false);
  });

  it("rejeita nome curto", () => {
    const result = registerSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("aceita serviço válido", () => {
    const result = serviceSchema.safeParse({ name: "Corte", price: 50, duration: 30, category: "CORTE" });
    expect(result.success).toBe(true);
  });

  it("rejeita preço negativo", () => {
    const result = serviceSchema.safeParse({ name: "Corte", price: -1, duration: 30, category: "CORTE" });
    expect(result.success).toBe(false);
  });

  it("rejeita duração zero", () => {
    const result = serviceSchema.safeParse({ name: "Corte", price: 50, duration: 0, category: "CORTE" });
    expect(result.success).toBe(false);
  });
});

describe("appointmentSchema", () => {
  it("aceita agendamento válido", () => {
    const result = appointmentSchema.safeParse({
      barberId: "b1", serviceId: "s1", date: "2026-07-20", time: "10:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita sem campos obrigatórios", () => {
    const result = appointmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("workingHoursSchema", () => {
  it("aceita horários válidos", () => {
    const result = workingHoursSchema.safeParse([
      { dayOfWeek: 1, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00", active: true },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejeita dia inválido", () => {
    const result = workingHoursSchema.safeParse([
      { dayOfWeek: 7, startTime: "08:00", endTime: "18:00", active: true },
    ]);
    expect(result.success).toBe(false);
  });
});
