import "server-only";

import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

/**
 * Small in-memory fixed-window limiter. It lives in one server process,
 * which is enough for a single self-hosted instance.
 */
export function createLimiter(max: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return {
    isBlocked(key: string) {
      const bucket = buckets.get(key);
      return !!bucket && bucket.resetAt > Date.now() && bucket.count >= max;
    },
    hit(key: string) {
      const now = Date.now();
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) buckets.set(key, { count: 1, resetAt: now + windowMs });
      else bucket.count += 1;
      if (buckets.size > 5000) {
        for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
      }
    },
    reset(key: string) {
      buckets.delete(key);
    },
  };
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
