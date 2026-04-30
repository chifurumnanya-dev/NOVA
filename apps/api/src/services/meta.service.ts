import type { Db } from '@nova/db';
import { states, lgas, services, specialties, facilities, clinicSchedules } from '@nova/db';
import { eq, count, sql } from 'drizzle-orm';

export async function listStates(db: Db) {
  return db.select().from(states).orderBy(states.name);
}

export async function listLgasByState(db: Db, stateCode: string) {
  const state = await db.query.states.findFirst({
    where: (s, { or, eq, ilike }) => or(eq(s.code, stateCode.toUpperCase()), ilike(s.name, stateCode)),
  });
  if (!state) return null;

  const lgaList = await db.select().from(lgas).where(eq(lgas.stateId, state.id)).orderBy(lgas.name);
  return { state, lgas: lgaList };
}

export async function listServices(db: Db) {
  return db.select().from(services).orderBy(services.name);
}

export async function listSpecialties(db: Db) {
  return db.select().from(specialties).orderBy(specialties.name);
}

export async function getGlobalStats(db: Db) {
  const [
    facilityCount,
    scheduleCount,
    stateCount,
    lgaCount,
    verifiedCount,
  ] = await Promise.all([
    db.select({ count: count() }).from(facilities),
    db.select({ count: count() }).from(clinicSchedules),
    db.select({ count: sql<number>`count(distinct ${facilities.stateId})` }).from(facilities),
    db.select({ count: sql<number>`count(distinct ${facilities.lgaId})` }).from(facilities),
    db.select({ count: count() }).from(facilities).where(
      sql`${facilities.verificationStatus} IN ('admin_verified', 'source_verified')`
    ),
  ]);

  return {
    total_facilities: Number(facilityCount[0].count),
    total_clinic_schedules: Number(scheduleCount[0].count),
    states_covered: Number(stateCount[0].count),
    lgas_covered: Number(lgaCount[0].count),
    verified_facilities: Number(verifiedCount[0].count),
  };
}
