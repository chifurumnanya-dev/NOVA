import type { Context, Next } from 'hono';
import { createDb } from '@nova/db';
import { apiKeys } from '@nova/db';
import { eq } from 'drizzle-orm';
import { errorResponse, HTTP } from '@nova/utils';

// Simple SHA-256 hash using Web Crypto API (available in CF Workers)
async function hashKey(raw: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface AuthEnv {
  DATABASE_URL: string;
  ADMIN_SECRET?: string;
}

/**
 * requireApiKey: validates X-Api-Key header against hashed keys in DB.
 * Attach to write-only or elevated routes.
 */
export function requireApiKey() {
  return async (c: Context<{ Bindings: AuthEnv }>, next: Next) => {
    const rawKey = c.req.header('X-Api-Key');
    if (!rawKey) {
      return c.json(
        errorResponse('Missing X-Api-Key header.', 'UNAUTHORIZED'),
        HTTP.UNAUTHORIZED,
      );
    }

    try {
      const keyHash = await hashKey(rawKey);
      const db = createDb(c.env.DATABASE_URL);
      const key = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.keyHash, keyHash),
      });

      if (!key || key.revokedAt) {
        return c.json(errorResponse('Invalid or revoked API key.', 'UNAUTHORIZED'), HTTP.UNAUTHORIZED);
      }

      // Update last used timestamp (fire-and-forget)
      db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id)).catch(() => {});

      await next();
    } catch (err) {
      return c.json(errorResponse('Authentication error.', 'INTERNAL_ERROR'), HTTP.INTERNAL_ERROR);
    }
  };
}

/**
 * requireAdmin: validates X-Admin-Secret header against env var.
 * Simple secret-based guard for admin routes.
 */
export function requireAdmin() {
  return async (c: Context<{ Bindings: AuthEnv }>, next: Next) => {
    const secret = c.req.header('X-Admin-Secret');
    const adminSecret = c.env.ADMIN_SECRET;

    if (!adminSecret) {
      return c.json(errorResponse('Admin access is not configured.', 'FORBIDDEN'), HTTP.FORBIDDEN);
    }

    if (!secret || secret !== adminSecret) {
      return c.json(errorResponse('Unauthorized. Invalid admin secret.', 'FORBIDDEN'), HTTP.FORBIDDEN);
    }

    await next();
  };
}
