import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  varchar,
  integer,
  real,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const verificationStatusEnum = pgEnum('verification_status', [
  'unverified',
  'community_submitted',
  'source_verified',
  'admin_verified',
  'stale',
  'rejected',
]);

export const facilityTypeEnum = pgEnum('facility_type', [
  'teaching_hospital',
  'federal_medical_centre',
  'general_hospital',
  'primary_health_centre',
  'private_hospital',
  'mission_hospital',
  'specialist_hospital',
  'diagnostic_centre',
  'laboratory',
  'pharmacy',
  'maternity_centre',
  'dialysis_centre',
  'emergency_centre',
]);

export const ownershipEnum = pgEnum('ownership', [
  'public',
  'private',
  'mission',
  'ngo',
  'military',
]);

export const contributionStatusEnum = pgEnum('contribution_status', [
  'pending',
  'approved',
  'rejected',
]);

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

// ─── Geographic Tables ────────────────────────────────────────────────────────

export const states = pgTable('states', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  geojson: jsonb('geojson'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const lgas = pgTable('lgas', {
  id: uuid('id').primaryKey().defaultRandom(),
  stateId: uuid('state_id').references(() => states.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  stateIdx: index('lgas_state_idx').on(table.stateId),
}));

// ─── Reference Tables ─────────────────────────────────────────────────────────

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull().unique(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const specialties = pgTable('specialties', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull().unique(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Facilities ───────────────────────────────────────────────────────────────

export const facilities = pgTable('facilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  facilityType: facilityTypeEnum('facility_type').notNull(),
  ownership: ownershipEnum('ownership').notNull().default('public'),
  stateId: uuid('state_id').references(() => states.id).notNull(),
  lgaId: uuid('lga_id').references(() => lgas.id),
  ward: varchar('ward', { length: 150 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 150 }),
  website: varchar('website', { length: 255 }),
  openingHours: text('opening_hours'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('unverified'),
  dataSource: varchar('data_source', { length: 255 }),
  sourceUrl: text('source_url'),
  sourceId: uuid('source_id').references(() => sources.id),
  submittedBy: varchar('submitted_by', { length: 255 }),
  verifiedBy: varchar('verified_by', { length: 255 }),
  lastVerifiedAt: timestamp('last_verified_at'),
  confidenceScore: real('confidence_score').default(0),
  isActive: boolean('is_active').default(true),
  externalId: varchar('external_id', { length: 100 }),
  externalCode: varchar('external_code', { length: 80 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  stateIdx: index('facilities_state_idx').on(table.stateId),
  lgaIdx: index('facilities_lga_idx').on(table.lgaId),
  typeIdx: index('facilities_type_idx').on(table.facilityType),
  ownershipIdx: index('facilities_ownership_idx').on(table.ownership),
  verificationIdx: index('facilities_verification_idx').on(table.verificationStatus),
  externalIdx: index('facilities_external_idx').on(table.externalId),
}));

export const facilityServices = pgTable('facility_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  facilityId: uuid('facility_id').references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Clinic Schedules ─────────────────────────────────────────────────────────

export const clinicSchedules = pgTable('clinic_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  facilityId: uuid('facility_id').references(() => facilities.id, { onDelete: 'cascade' }).notNull(),
  specialtyId: uuid('specialty_id').references(() => specialties.id),
  clinicName: varchar('clinic_name', { length: 255 }).notNull(),
  dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
  startTime: varchar('start_time', { length: 20 }).notNull(),
  endTime: varchar('end_time', { length: 20 }).notNull(),
  appointmentProcess: text('appointment_process'),
  referralRequired: boolean('referral_required').default(false),
  notes: text('notes'),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('unverified'),
  dataSource: varchar('data_source', { length: 255 }),
  sourceUrl: text('source_url'),
  submittedBy: varchar('submitted_by', { length: 255 }),
  verifiedBy: varchar('verified_by', { length: 255 }),
  lastVerifiedAt: timestamp('last_verified_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  facilityIdx: index('schedules_facility_idx').on(table.facilityId),
  specialtyIdx: index('schedules_specialty_idx').on(table.specialtyId),
  dayIdx: index('schedules_day_idx').on(table.dayOfWeek),
}));

// ─── Contributions ────────────────────────────────────────────────────────────

export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'facility' | 'clinic_schedule'
  entityId: uuid('entity_id'), // null for new submissions
  payload: jsonb('payload').notNull(),
  status: contributionStatusEnum('status').notNull().default('pending'),
  submittedBy: varchar('submitted_by', { length: 255 }),
  submitterEmail: varchar('submitter_email', { length: 255 }),
  reviewedBy: varchar('reviewed_by', { length: 255 }),
  reviewNote: text('review_note'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Users & API Keys ─────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  lastUsedAt: timestamp('last_used_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  before: jsonb('before'),
  after: jsonb('after'),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const statesRelations = relations(states, ({ many }) => ({
  lgas: many(lgas),
  facilities: many(facilities),
}));

export const lgasRelations = relations(lgas, ({ one, many }) => ({
  state: one(states, { fields: [lgas.stateId], references: [states.id] }),
  facilities: many(facilities),
}));

export const facilitiesRelations = relations(facilities, ({ one, many }) => ({
  state: one(states, { fields: [facilities.stateId], references: [states.id] }),
  lga: one(lgas, { fields: [facilities.lgaId], references: [lgas.id] }),
  source: one(sources, { fields: [facilities.sourceId], references: [sources.id] }),
  facilityServices: many(facilityServices),
  clinicSchedules: many(clinicSchedules),
}));

export const facilityServicesRelations = relations(facilityServices, ({ one }) => ({
  facility: one(facilities, { fields: [facilityServices.facilityId], references: [facilities.id] }),
  service: one(services, { fields: [facilityServices.serviceId], references: [services.id] }),
}));

export const clinicSchedulesRelations = relations(clinicSchedules, ({ one }) => ({
  facility: one(facilities, { fields: [clinicSchedules.facilityId], references: [facilities.id] }),
  specialty: one(specialties, { fields: [clinicSchedules.specialtyId], references: [specialties.id] }),
}));
