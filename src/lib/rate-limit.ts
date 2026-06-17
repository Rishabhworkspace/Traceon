// src/lib/rate-limit.ts

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix timestamp (ms) at which the current window resets */
  reset: number;
};

// ---------------------------------------------------------------------------
// Singleton Redis client
// Instantiated once per cold-start; reused across requests in the same instance.
// ---------------------------------------------------------------------------

let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    });
  }
  return redis;
}

// ---------------------------------------------------------------------------
// Duration helpers
// ---------------------------------------------------------------------------

type UpstashDuration = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`;

/**
 * Converts a millisecond window into an Upstash-compatible duration string.
 * Upstash accepts: "N ms" | "N s" | "N m" | "N h" | "N d"
 */
function msToUpstashDuration(ms: number): UpstashDuration {
  if (ms < 1_000) {
    return `${ms} ms`;
  }
  const seconds = ms / 1_000;
  if (seconds < 60) {
    return `${Math.round(seconds)} s`;
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${Math.round(minutes)} m`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Math.round(hours)} h`;
  }
  return `${Math.round(hours / 24)} d`;
}

// ---------------------------------------------------------------------------
// Limiter cache
// Cache Ratelimit instances per (limit, window) combination so we don't
// re-create them on every request.
// ---------------------------------------------------------------------------

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const key = `${limit}:${windowMs}`;
  const cached = limiterCache.get(key);
  if (cached) {
    return cached;
  }
  const limiter = new Ratelimit({
    redis: getRedisClient(),
    limiter: Ratelimit.slidingWindow(limit, msToUpstashDuration(windowMs)),
    prefix: "rl",
  });
  limiterCache.set(key, limiter);
  return limiter;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Serverless-safe rate limiter backed by Upstash Redis (sliding window).
 *
 * Preserves the original contract:
 *   - success    — whether the request is allowed
 *   - limit      — total allowed requests per window
 *   - remaining  — requests remaining in the current window
 *   - reset      — Unix timestamp (ms) when the window resets
 *
 * Fail-open: if Redis is unavailable the request is allowed and a warning
 * is written to the console so on-call engineers are alerted without
 * causing a customer-facing 500.
 */
export async function rateLimit(
  ip: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const limiter = getLimiter(limit, windowMs);
    const result = await limiter.limit(ip);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      // Upstash returns reset as a Unix timestamp in milliseconds
      reset: result.reset,
    };
  } catch (err) {
    console.warn(
      "[rate-limit] Redis unavailable. Allowing request (fail-open).",
      err
    );

    // Fail open: allow the request, report a synthetic "no limit consumed"
    const now = Date.now();
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }
}
