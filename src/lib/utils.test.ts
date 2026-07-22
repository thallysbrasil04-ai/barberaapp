import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatPhone, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats Brazilian currency", () => {
    expect(formatCurrency(55)).toBe("R$\u00a055,00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("R$\u00a00,00");
  });

  it("formats large values", () => {
    expect(formatCurrency(1200)).toBe("R$\u00a01.200,00");
  });

  it("formats decimal values", () => {
    expect(formatCurrency(49.9)).toBe("R$\u00a049,90");
  });
});

describe("formatDate", () => {
  it("formats a date string to pt-BR format", () => {
    const result = formatDate("2026-07-22");
    expect(result).toContain("22");
    expect(result).toContain("07");
    expect(result).toContain("2026");
  });
});

describe("formatPhone", () => {
  it("formats 11-digit phone", () => {
    expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
  });

  it("formats 10-digit phone", () => {
    expect(formatPhone("1199999999")).toBe("(11) 9999-9999");
  });

  it("returns original for invalid length", () => {
    expect(formatPhone("123")).toBe("123");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).not.toContain("hidden");
    expect(result).toContain("extra");
  });
});
