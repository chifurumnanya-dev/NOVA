import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { errorResponse, HTTP } from '@nova/utils';
import { facilitiesRouter } from './routes/facilities';
import { clinicSchedulesRouter } from './routes/clinic-schedules';
import { metaRouter } from './routes/meta';
import { contributionsRouter } from './routes/contributions';
import { rateLimit } from './middleware/rate-limit';

export interface Env {
  DATABASE_URL: string;
  ADMIN_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// ─── Global Middleware ─────────────────────────────────────────────────────────
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Admin-Secret'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
}));

// Anonymous rate limit: 100 req/hour
app.use('*', rateLimit({ windowMs: 60 * 60 * 1000, max: 100 }));

// ─── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (c) => c.json({
  name: 'NOVA API',
  version: 'v1',
  status: 'ok',
  docs: '/api/v1/health',
  github: 'https://github.com/nova-ng/nova',
}));

// ─── API v1 ────────────────────────────────────────────────────────────────────
const v1 = new Hono<{ Bindings: Env }>().basePath('/api/v1');

v1.route('/facilities', facilitiesRouter);
v1.route('/clinic-schedules', clinicSchedulesRouter);
v1.route('/contributions', contributionsRouter);
v1.route('/', metaRouter);

app.route('/', v1);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.notFound((c) =>
  c.json(errorResponse('Route not found.', 'NOT_FOUND'), HTTP.NOT_FOUND),
);

app.onError((err, c) => {
  console.error('[ERROR]', err);
  return c.json(errorResponse('An internal server error occurred.', 'INTERNAL_ERROR'), HTTP.INTERNAL_ERROR);
});

export default app;
