import { Hono } from 'hono';
import { createDb, contributions } from '@nova/db';
import { successResponse, errorResponse, HTTP } from '@nova/utils';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../middleware/auth';
import type { Env } from '../index';

export const contributionsRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/contributions — Admin only
contributionsRouter.get('/', requireAdmin(), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const status = c.req.query('status') as 'pending' | 'approved' | 'rejected' | undefined;
  const rows = await db.query.contributions.findMany({
    where: status ? eq(contributions.status, status) : undefined,
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    limit: 50,
  });
  return c.json(successResponse(rows));
});

// GET /api/v1/contributions/:id — Admin only
contributionsRouter.get('/:id', requireAdmin(), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  if (!id) return c.json(errorResponse('Missing contribution id.', 'BAD_REQUEST'), HTTP.BAD_REQUEST);
  const row = await db.query.contributions.findFirst({ where: eq(contributions.id, id) });
  if (!row) return c.json(errorResponse('Contribution not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
  return c.json(successResponse(row));
});

// PATCH /api/v1/contributions/:id/review — Admin only
contributionsRouter.patch('/:id/review', requireAdmin(), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  if (!id) return c.json(errorResponse('Missing contribution id.', 'BAD_REQUEST'), HTTP.BAD_REQUEST);

  let body: { status: 'approved' | 'rejected'; reviewNote?: string; reviewedBy?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json(errorResponse('Invalid JSON body.', 'BAD_REQUEST'), HTTP.BAD_REQUEST);
  }

  if (!['approved', 'rejected'].includes(body.status)) {
    return c.json(errorResponse('Status must be approved or rejected.', 'VALIDATION_ERROR'), HTTP.BAD_REQUEST);
  }

  const [updated] = await db
    .update(contributions)
    .set({
      status: body.status,
      reviewNote: body.reviewNote,
      reviewedBy: body.reviewedBy ?? 'admin',
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(contributions.id, id))
    .returning();

  if (!updated) return c.json(errorResponse('Contribution not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
  return c.json(successResponse(updated));
});
