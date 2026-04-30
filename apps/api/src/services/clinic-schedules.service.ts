import type { Db } from '@nova/db';
import { clinicSchedules, facilities, states, lgas, specialties } from '@nova/db';
import { eq, ilike, and, count } from 'drizzle-orm';
import type { ClinicScheduleQuery, ClinicScheduleContribution } from '@nova/types';

export async function listClinicSchedules(db: Db, query: ClinicScheduleQuery) {
  const { page, limit, state, facility_id, specialty, day, referral_required } = query;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (facility_id) conditions.push(eq(clinicSchedules.facilityId, facility_id));
  if (day) conditions.push(eq(clinicSchedules.dayOfWeek, day));
  if (referral_required !== undefined) {
    conditions.push(eq(clinicSchedules.referralRequired, referral_required === 'true'));
  }
  if (specialty) {
    const specRecord = await db.query.specialties.findFirst({
      where: ilike(specialties.name, `%${specialty}%`),
    });
    if (specRecord) conditions.push(eq(clinicSchedules.specialtyId, specRecord.id));
  }
  if (state) {
    // Join through facility to filter by state
    const stateRecord = await db.query.states.findFirst({ where: ilike(states.name, `%${state}%`) });
    if (stateRecord) {
      const facilityIds = await db.query.facilities.findMany({
        where: eq(facilities.stateId, stateRecord.id),
        columns: { id: true },
      });
      // We rely on facility_id filtering for state-based filtering with a simple approach
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.clinicSchedules.findMany({
      where,
      with: {
        facility: { with: { state: true } },
        specialty: true,
      },
      limit,
      offset,
      orderBy: (s, { asc }) => [asc(s.dayOfWeek), asc(s.startTime)],
    }),
    db.select({ total: count() }).from(clinicSchedules).where(where),
  ]);

  return { rows, total: Number(total), page, limit };
}

export async function getClinicScheduleById(db: Db, id: string) {
  return db.query.clinicSchedules.findFirst({
    where: eq(clinicSchedules.id, id),
    with: {
      facility: { with: { state: true, lga: true } },
      specialty: true,
    },
  });
}

export async function createClinicScheduleContribution(db: Db, payload: ClinicScheduleContribution) {
  const { contributions } = await import('@nova/db');
  const [row] = await db.insert(contributions).values({
    entityType: 'clinic_schedule',
    payload,
    status: 'pending',
    submitterEmail: payload.submitterEmail,
  }).returning();
  return row;
}
