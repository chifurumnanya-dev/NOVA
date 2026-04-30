import type { Context, Next } from 'hono';
import { errorResponse, HTTP } from '@nova/utils';

interface RateLimitStore {
  count: number;
  resetAt: number;
}

// In-memory store (works fine on Cloudflare Workers per-isolate)
const store = new Map<string, RateLimitStore>();

interface RateLimitOptions {
  windowMs: number;   // e.g. 60 * 60 * 1000 (1 hour)
  max: number;        // e.g. 100
  keyFn?: (c: Context) => string;
}

export function rateLimit({ windowMs, max, keyFn }: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const key = keyFn ? keyFn(c) : (c.req.header('CF-Connecting-IP') ?? c.req.header('X-Forwarded-For') ?? 'global');
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, max - entry.count);
    const resetSec = Math.ceil((entry.resetAt - now) / 1000);

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return c.json(
        errorResponse(
          `Rate limit exceeded. Try again in ${resetSec} seconds.`,
          'RATE_LIMIT_EXCEEDED',
        ),
        HTTP.TOO_MANY_REQUESTS,
      );
    }

    await next();
  };
}
