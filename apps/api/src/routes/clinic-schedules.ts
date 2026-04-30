import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '@nova/db';
import { ClinicScheduleQuerySchema, ClinicScheduleContributionSchema } from '@nova/types';
import { paginatedResponse, successResponse, errorResponse, HTTP } from '@nova/utils';
import {
  listClinicSchedules,
  getClinicScheduleById,
  createClinicScheduleContribution,
} from '../services/clinic-schedules.service';
import type { Env } from '../index';

export const clinicSchedulesRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/clinic-schedules
clinicSchedulesRouter.get('/', zValidator('query', ClinicScheduleQuerySchema, (result, c) => {
  if (!result.success) {
    return c.json(errorResponse('Invalid query parameters', 'VALIDATION_ERROR', result.error.flatten()), HTTP.BAD_REQUEST);
  }
}), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const query = c.req.valid('query');
  const { rows, total, page, limit } = await listClinicSchedules(db, query);
  return c.json(paginatedResponse(rows, total, page, limit));
});

// GET /api/v1/clinic-schedules/search (alias)
clinicSchedulesRouter.get('/search', zValidator('query', ClinicScheduleQuerySchema, (result, c) => {
  if (!result.success) {
    return c.json(errorResponse('Invalid query parameters', 'VALIDATION_ERROR', result.error.flatten()), HTTP.BAD_REQUEST);
  }
}), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const query = c.req.valid('query');
  const { rows, total, page, limit } = await listClinicSchedules(db, query);
  return c.json(paginatedResponse(rows, total, page, limit));
});

// POST /api/v1/clinic-schedules/contributions
clinicSchedulesRouter.post('/contributions', zValidator('json', ClinicScheduleContributionSchema, (result, c) => {
  if (!result.success) {
    return c.json(errorResponse('Invalid contribution data', 'VALIDATION_ERROR', result.error.flatten()), HTTP.BAD_REQUEST);
  }
}), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const payload = c.req.valid('json');
  const contribution = await createClinicScheduleContribution(db, payload);
  return c.json(successResponse(contribution, { message: 'Contribution submitted for review.' }), HTTP.CREATED);
});

// GET /api/v1/clinic-schedules/:id
clinicSchedulesRouter.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const schedule = await getClinicScheduleById(db, id);
  if (!schedule) {
    return c.json(errorResponse('Clinic schedule not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
  }
  return c.json(successResponse(schedule));
});
