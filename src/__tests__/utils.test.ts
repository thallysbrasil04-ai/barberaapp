import { describe, it, expect } from "vitest";
import { formatPhone, formatCurrency, formatDate } from "@/lib/utils";

describe("formatPhone", () => {
  it("formata telefone com DDD", () => {
    expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
  });

  it("formata telefone fixo", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("formatCurrency", () => {
  it("formata valor em reais", () => {
    const result = formatCurrency(50);
    expect(result).toContain("50");
    expect(result).toContain(",");
  });

  it("formata zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatDate", () => {
  it("formata data ISO", () => {
    const result = formatDate("2026-07-17");
    expect(result).toContain("07/2026");
  });
});
