// src/lib/rate-limit.ts

type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

type RateLimitEntry = {
    count: number;
    resetTime: number;
};

// In-memory store
const ipStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of ipStore.entries()) {
            if (now > entry.resetTime) {
                ipStore.delete(ip);
            }
        }
    }, 5 * 60 * 1000);
}

/**
 * A lightweight in-memory rate limiter.
 * Note: In serverless environments (like Vercel), this state is kept per-instance
 * and may be wiped between cold starts. It is meant to stop aggressive bursts.
 */
export function rateLimit(ip: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = ipStore.get(ip);

    // If no entry or entry expired, create a new one
    if (!entry || now > entry.resetTime) {
        ipStore.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            limit,
            remaining: limit - 1,
            reset: now + windowMs,
        };
    }

    // If limit exceeded
    if (entry.count >= limit) {
        return {
            success: false,
            limit,
            remaining: 0,
            reset: entry.resetTime,
        };
    }

    // Increment count
    entry.count += 1;
    ipStore.set(ip, entry);

    return {
        success: true,
        limit,
        remaining: limit - entry.count,
        reset: entry.resetTime,
    };
}
