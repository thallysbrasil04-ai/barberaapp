import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedis = !!redisUrl && !!redisToken;

const redis = hasRedis
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// In-memory fallback
const memory = new Map<string, { count: number; resetAt: number }>();

export async function kvIncr(key: string, windowMs: number, max: number): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / windowMs)}`;
    const count = await redis.incr(windowKey);
    if (count === 1) await redis.expire(windowKey, Math.ceil(windowMs / 1000));
    return { allowed: count <= max, remaining: Math.max(0, max - count) };
  }

  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now > entry.resetAt) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count++;
  if (entry.count > max) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: max - entry.count };
}

export function kvReset(key: string) {
  memory.delete(key);
}
