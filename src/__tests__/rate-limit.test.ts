import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => resetRateLimit("test-key"));

  it("permite primeira requisição", async () => {
    const { allowed, remaining } = await checkRateLimit("test-key", 3, 60_000);
    expect(allowed).toBe(true);
    expect(remaining).toBe(2);
  });

  it("bloqueia após exceder máximo", async () => {
    await checkRateLimit("test-key", 3, 60_000);
    await checkRateLimit("test-key", 3, 60_000);
    await checkRateLimit("test-key", 3, 60_000);
    const { allowed } = await checkRateLimit("test-key", 3, 60_000);
    expect(allowed).toBe(false);
  });

  it("retorna contagem decrescente", async () => {
    await checkRateLimit("test-key", 5, 60_000);
    await checkRateLimit("test-key", 5, 60_000);
    const { remaining } = await checkRateLimit("test-key", 5, 60_000);
    expect(remaining).toBe(2);
  });

  it("chaves diferentes não interferem", async () => {
    await checkRateLimit("key-a", 1, 60_000);
    const { allowed } = await checkRateLimit("key-b", 1, 60_000);
    expect(allowed).toBe(true);
  });
});

describe("resetRateLimit", () => {
  it("reseta contagem para uma chave", async () => {
    await checkRateLimit("reset-key", 1, 60_000);
    expect((await checkRateLimit("reset-key", 1, 60_000)).allowed).toBe(false);
    resetRateLimit("reset-key");
    expect((await checkRateLimit("reset-key", 1, 60_000)).allowed).toBe(true);
  });
});
