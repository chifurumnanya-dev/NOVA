import type { Db } from '@nova/db';
import { facilities, facilityServices, services, states, lgas } from '@nova/db';
import { eq, ilike, and, count, sql, inArray } from 'drizzle-orm';
import type { FacilityQuery, FacilityContribution, FacilityEditSuggestion } from '@nova/types';

const LEVEL_TO_TYPES = {
  tertiary: ['teaching_hospital', 'federal_medical_centre', 'specialist_hospital'],
  secondary: ['general_hospital', 'mission_hospital', 'private_hospital'],
  primary: ['primary_health_centre', 'maternity_centre'],
} as const;

export async function listFacilities(db: Db, query: FacilityQuery) {
  const { page, limit, state, lga, facility_type, level, ownership, verified, q } = query;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (state) {
    const stateRecord = await db.query.states.findFirst({ where: ilike(states.name, `%${state}%`) });
    if (stateRecord) conditions.push(eq(facilities.stateId, stateRecord.id));
  }
  if (lga) {
    const lgaRecord = await db.query.lgas.findFirst({ where: ilike(lgas.name, `%${lga}%`) });
    if (lgaRecord) conditions.push(eq(facilities.lgaId, lgaRecord.id));
  }
  if (facility_type) conditions.push(eq(facilities.facilityType, facility_type));
  if (level) conditions.push(inArray(facilities.facilityType, [...LEVEL_TO_TYPES[level]]));
  if (ownership) conditions.push(eq(facilities.ownership, ownership));
  if (verified !== undefined) {
    conditions.push(eq(facilities.verificationStatus, verified === 'true' ? 'admin_verified' : 'unverified'));
  }
  if (q) conditions.push(ilike(facilities.name, `%${q}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.facilities.findMany({
      where,
      with: { state: true, lga: true, facilityServices: { with: { service: true } } },
      limit,
      offset,
      orderBy: (f, { asc }) => [asc(f.name)],
    }),
    db.select({ total: count() }).from(facilities).where(where),
  ]);

  return { rows, total: Number(total), page, limit };
}

export async function getFacilityById(db: Db, id: string) {
  return db.query.facilities.findFirst({
    where: eq(facilities.id, id),
    with: {
      state: true,
      lga: true,
      facilityServices: { with: { service: true } },
      clinicSchedules: { with: { specialty: true } },
    },
  });
}

export async function getFacilityStats(db: Db) {
  const [totalFacilities, verifiedFacilities, byState, byType] = await Promise.all([
    db.select({ count: count() }).from(facilities),
    db.select({ count: count() }).from(facilities).where(eq(facilities.verificationStatus, 'admin_verified')),
    db.select({ state: states.name, count: count() })
      .from(facilities)
      .leftJoin(states, eq(facilities.stateId, states.id))
      .groupBy(states.name)
      .orderBy(sql`count(*) desc`)
      .limit(10),
    db.select({ type: facilities.facilityType, count: count() })
      .from(facilities)
      .groupBy(facilities.facilityType),
  ]);

  return {
    total: Number(totalFacilities[0].count),
    verified: Number(verifiedFacilities[0].count),
    by_state: byState,
    by_type: byType,
  };
}

export async function updateFacility(db: Db, id: string, payload: Partial<typeof facilities.$inferInsert>) {
  const [row] = await db.update(facilities)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(facilities.id, id))
    .returning();
  return row;
}

export async function createFacilityContribution(db: Db, payload: FacilityContribution) {
  const { contributions } = await import('@nova/db');
  const [row] = await db.insert(contributions).values({
    entityType: 'facility',
    payload,
    status: 'pending',
    submittedBy: payload.submitterName,
    submitterEmail: payload.submitterEmail,
  }).returning();
  return row;
}

export async function createFacilityEditSuggestion(
  db: Db,
  facilityId: string,
  payload: FacilityEditSuggestion,
) {
  const { contributions } = await import('@nova/db');
  const [row] = await db.insert(contributions).values({
    entityType: 'facility',
    entityId: facilityId,
    payload,
    status: 'pending',
    submittedBy: payload.submitterName,
    submitterEmail: payload.submitterEmail || undefined,
  }).returning();
  return row;
}
