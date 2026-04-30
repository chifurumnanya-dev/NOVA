import { Hono } from 'hono';
import { createDb } from '@nova/db';
import { successResponse, errorResponse, HTTP } from '@nova/utils';
import {
  listStates,
  listLgasByState,
  listServices,
  listSpecialties,
  getGlobalStats,
} from '../services/meta.service';
import type { Env } from '../index';

export const metaRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/health
metaRouter.get('/health', (c) =>
  c.json(successResponse({ status: 'ok', version: 'v1', timestamp: new Date().toISOString() })),
);

// GET /api/v1/stats
metaRouter.get('/stats', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const stats = await getGlobalStats(db);
  return c.json(successResponse(stats));
});

// GET /api/v1/states
metaRouter.get('/states', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const data = await listStates(db);
  return c.json(successResponse(data));
});

// GET /api/v1/states/:state/lgas
metaRouter.get('/states/:state/lgas', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const state = c.req.param('state');
  const result = await listLgasByState(db, state);
  if (!result) {
    return c.json(errorResponse('State not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
  }
  return c.json(successResponse(result));
});

// GET /api/v1/services
metaRouter.get('/services', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const data = await listServices(db);
  return c.json(successResponse(data));
});

// GET /api/v1/specialties
metaRouter.get('/specialties', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const data = await listSpecialties(db);
  return c.json(successResponse(data));
});
