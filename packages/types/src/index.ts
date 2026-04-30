import { z } from 'zod';

// ─── Enums ─────────────────────────────────────────────────────────────────────

export const FacilityTypeEnum = z.enum([
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

export const OwnershipEnum = z.enum(['public', 'private', 'mission', 'ngo', 'military']);

export const VerificationStatusEnum = z.enum([
  'unverified',
  'community_submitted',
  'source_verified',
  'admin_verified',
  'stale',
  'rejected',
]);

export const DayOfWeekEnum = z.enum([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]);

// ─── Query Schemas ─────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});

export const FacilityLevelEnum = z.enum(['tertiary', 'secondary', 'primary']);

export const FacilityQuerySchema = PaginationSchema.extend({
  state: z.string().optional(),
  lga: z.string().optional(),
  facility_type: FacilityTypeEnum.optional(),
  level: FacilityLevelEnum.optional(),
  ownership: OwnershipEnum.optional(),
  service: z.string().optional(),
  verified: z.enum(['true', 'false']).optional(),
  q: z.string().optional(),
});

export const ClinicScheduleQuerySchema = PaginationSchema.extend({
  state: z.string().optional(),
  facility_id: z.string().uuid().optional(),
  specialty: z.string().optional(),
  day: DayOfWeekEnum.optional(),
  referral_required: z.enum(['true', 'false']).optional(),
});

// ─── Contribution Schemas ─────────────────────────────────────────────────────

export const FacilityContributionSchema = z.object({
  name: z.string().min(2).max(255),
  facilityType: FacilityTypeEnum,
  ownership: OwnershipEnum,
  state: z.string().min(2).max(100),
  lga: z.string().min(2).max(100).optional(),
  ward: z.string().max(150).optional(),
  address: z.string().optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  openingHours: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  services: z.array(z.string()).optional(),
  dataSource: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  submitterEmail: z.string().email().optional(),
  submitterName: z.string().optional(),
});

export const FacilityEditSuggestionSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  facilityType: FacilityTypeEnum.optional(),
  ownership: OwnershipEnum.optional(),
  state: z.string().min(2).max(100).optional(),
  lga: z.string().min(2).max(100).optional(),
  ward: z.string().max(150).optional(),
  address: z.string().optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  openingHours: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  reason: z.string().min(5).max(1000),
  submitterName: z.string().max(255).optional(),
  submitterEmail: z.string().email().optional().or(z.literal('')),
});

export const ClinicScheduleContributionSchema = z.object({
  facilityId: z.string().uuid(),
  clinicName: z.string().min(2).max(255),
  dayOfWeek: DayOfWeekEnum,
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  specialty: z.string().optional(),
  appointmentProcess: z.string().optional(),
  referralRequired: z.boolean().optional(),
  notes: z.string().optional(),
  dataSource: z.string().optional(),
  submitterEmail: z.string().email().optional(),
});

// ─── Inferred Types ──────────────────────────────────────────────────────────

export type FacilityQuery = z.infer<typeof FacilityQuerySchema>;
export type ClinicScheduleQuery = z.infer<typeof ClinicScheduleQuerySchema>;
export type FacilityContribution = z.infer<typeof FacilityContributionSchema>;
export type FacilityEditSuggestion = z.infer<typeof FacilityEditSuggestionSchema>;
export type ClinicScheduleContribution = z.infer<typeof ClinicScheduleContributionSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
