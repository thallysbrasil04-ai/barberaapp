import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit expiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetRateLimit("exp-key");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("expira após o windowMs", async () => {
    await checkRateLimit("exp-key", 1, 60_000);
    expect((await checkRateLimit("exp-key", 1, 60_000)).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect((await checkRateLimit("exp-key", 1, 60_000)).allowed).toBe(true);
  });
});
