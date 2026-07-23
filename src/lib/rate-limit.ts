import { kvIncr, kvReset } from "./kv";

export async function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60_000): Promise<{ allowed: boolean; remaining: number }> {
  return kvIncr(key, windowMs, maxAttempts);
}

export function resetRateLimit(key: string) {
  kvReset(key);
}
