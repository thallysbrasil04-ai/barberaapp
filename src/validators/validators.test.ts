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
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      name: "João Silva",
      email: "joao@example.com",
      phone: "11999999999",
      password: "password123",
      confirmPassword: "password123",
      consentLGPD: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "João Silva",
      email: "joao@example.com",
      phone: "11999999999",
      password: "password123",
      confirmPassword: "different123",
      consentLGPD: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects without LGPD consent", () => {
    const result = registerSchema.safeParse({
      name: "João Silva",
      email: "joao@example.com",
      phone: "11999999999",
      password: "password123",
      confirmPassword: "password123",
      consentLGPD: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("serviceSchema", () => {
  it("accepts valid service", () => {
    const result = serviceSchema.safeParse({
      name: "Corte Degradê",
      description: "Corte degradê",
      price: 55,
      duration: 40,
      category: "CORTE",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = serviceSchema.safeParse({
      name: "Corte",
      price: -10,
      duration: 30,
      category: "CORTE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero duration", () => {
    const result = serviceSchema.safeParse({
      name: "Corte",
      price: 55,
      duration: 0,
      category: "CORTE",
    });
    expect(result.success).toBe(false);
  });
});

describe("barberSchema", () => {
  it("accepts valid barber", () => {
    const result = barberSchema.safeParse({
      name: "Carlos Silva",
      email: "carlos@example.com",
      phone: "11988888888",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = barberSchema.safeParse({
      name: "Ca",
      email: "carlos@example.com",
      phone: "11988888888",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("appointmentSchema", () => {
  it("accepts valid appointment", () => {
    const result = appointmentSchema.safeParse({
      barberId: "barber123",
      serviceId: "service123",
      date: "2026-07-22",
      time: "10:00",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing time", () => {
    const result = appointmentSchema.safeParse({
      barberId: "barber123",
      serviceId: "service123",
      date: "2026-07-22",
      time: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("workingHoursSchema", () => {
  it("accepts valid working hours", () => {
    const result = workingHoursSchema.safeParse([
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", active: true },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", active: true },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects invalid day of week", () => {
    const result = workingHoursSchema.safeParse([
      { dayOfWeek: 8, startTime: "09:00", endTime: "18:00", active: true },
    ]);
    expect(result.success).toBe(false);
  });
});
