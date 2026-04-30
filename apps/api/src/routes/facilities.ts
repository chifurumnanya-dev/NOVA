import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createDb } from '@nova/db';
import { FacilityQuerySchema, FacilityContributionSchema, FacilityEditSuggestionSchema } from '@nova/types';
import { paginatedResponse, successResponse, errorResponse, HTTP } from '@nova/utils';
import {
  listFacilities,
  getFacilityById,
  getFacilityStats,
  createFacilityContribution,
  createFacilityEditSuggestion,
  updateFacility,
} from '../services/facilities.service';
import type { Env } from '../index';

export const facilitiesRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/facilities
facilitiesRouter.get('/', zValidator('query', FacilityQuerySchema, (result, c) => {
  if (!result.success) {
    return c.json(errorResponse('Invalid query parameters', 'VALIDATION_ERROR', result.error.flatten()), HTTP.BAD_REQUEST);
  }
}), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const query = c.req.valid('query');
  const { rows, total, page, limit } = await listFacilities(db, query);
  return c.json(paginatedResponse(rows, total, page, limit));
});

// GET /api/v1/facilities/stats
facilitiesRouter.get('/stats', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const stats = await getFacilityStats(db);
  return c.json(successResponse(stats));
});

// GET /api/v1/facilities/search  (alias – same as list with q param)
facilitiesRouter.get('/search', zValidator('query', FacilityQuerySchema, (result, c) => {
  if (!result.success) {
    return c.json(errorResponse('Invalid query parameters', 'VALIDATION_ERROR', result.error.flatten()), HTTP.BAD_REQUEST);
  }
}), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const query = c.req.valid('query');
  const { rows, total, page, limit } = await listFacilities(db, query);
  return c.json(paginatedResponse(rows, total, page, limit));
});

// POST /api/v1/facilities/contributions
facilitiesRouter.post('/contributions', zValidator('json', FacilityContributionSchema, (result, c) => {
  if (!result.success) {
    return c.json(errorResponse('Invalid contribution data', 'VALIDATION_ERROR', result.error.flatten()), HTTP.BAD_REQUEST);
  }
}), async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const payload = c.req.valid('json');
  const contribution = await createFacilityContribution(db, payload);
  return c.json(successResponse(contribution, { message: 'Contribution submitted for review.' }), HTTP.CREATED);
});

// POST /api/v1/facilities/:id/suggest-edit
facilitiesRouter.post(
  '/:id/suggest-edit',
  zValidator('json', FacilityEditSuggestionSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        errorResponse('Invalid edit suggestion.', 'VALIDATION_ERROR', result.error.flatten()),
        HTTP.BAD_REQUEST,
      );
    }
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const id = c.req.param('id');
    const facility = await getFacilityById(db, id);
    if (!facility) {
      return c.json(errorResponse('Facility not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
    }
    const payload = c.req.valid('json');
    const contribution = await createFacilityEditSuggestion(db, id, payload);
    return c.json(
      successResponse(contribution, { message: 'Edit suggestion submitted for review.' }),
      HTTP.CREATED,
    );
  },
);

// GET /api/v1/facilities/:id
facilitiesRouter.get('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const facility = await getFacilityById(db, id);
  if (!facility) {
    return c.json(errorResponse('Facility not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
  }
  return c.json(successResponse(facility));
});

// PATCH /api/v1/facilities/:id
facilitiesRouter.patch('/:id', async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const id = c.req.param('id');
  const payload = await c.req.json();
  const updated = await updateFacility(db, id, payload);
  if (!updated) {
    return c.json(errorResponse('Facility not found.', 'NOT_FOUND'), HTTP.NOT_FOUND);
  }
  return c.json(successResponse(updated));
});
