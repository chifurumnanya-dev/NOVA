import { describe, it, expect } from 'vitest';
import { FacilityQuerySchema, FacilityContributionSchema, ClinicScheduleQuerySchema } from './index';

describe('Zod Schema Validation', () => {
  describe('FacilityQuerySchema', () => {
    it('should validate empty query', () => {
      const result = FacilityQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate valid filters', () => {
      const result = FacilityQuerySchema.safeParse({
        state: 'Lagos',
        facility_type: 'general_hospital',
        verified: 'true',
      });
      expect(result.success).toBe(true);
    });

    it('should fail on invalid facility_type', () => {
      const result = FacilityQuerySchema.safeParse({
        facility_type: 'not_a_type',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('FacilityContributionSchema', () => {
    it('should fail on missing required fields', () => {
      const result = FacilityContributionSchema.safeParse({
        name: 'Test Hospital',
      });
      expect(result.success).toBe(false);
    });

    it('should validate full contribution', () => {
      const result = FacilityContributionSchema.safeParse({
        name: 'Lagos Island Maternity Hospital',
        facilityType: 'maternity_centre',
        ownership: 'public',
        state: 'Lagos',
        lga: 'Lagos Island',
        address: '123 Hospital Way',
        phone: '+2348012345678',
        email: 'info@limh.gov.ng',
        latitude: 6.45,
        longitude: 3.39,
        services: ['Maternity care', 'Antenatal care'],
        dataSource: 'Ministry of Health',
        submitterEmail: 'contributor@example.com',
      });
      expect(result.success).toBe(true);
    });
  });
});
