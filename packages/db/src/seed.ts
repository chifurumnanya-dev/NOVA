import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { states, lgas, services, specialties, sources, facilities, facilityServices, clinicSchedules } from './schema';

const DB_URL = process.env.DATABASE_URL!;

// ─── Reference Data ────────────────────────────────────────────────────────────

const NIGERIAN_STATES = [
  { name: 'Abia', code: 'AB' }, { name: 'Adamawa', code: 'AD' },
  { name: 'Akwa Ibom', code: 'AK' }, { name: 'Anambra', code: 'AN' },
  { name: 'Bauchi', code: 'BA' }, { name: 'Bayelsa', code: 'BY' },
  { name: 'Benue', code: 'BE' }, { name: 'Borno', code: 'BO' },
  { name: 'Cross River', code: 'CR' }, { name: 'Delta', code: 'DE' },
  { name: 'Ebonyi', code: 'EB' }, { name: 'Edo', code: 'ED' },
  { name: 'Ekiti', code: 'EK' }, { name: 'Enugu', code: 'EN' },
  { name: 'FCT', code: 'FC' }, { name: 'Gombe', code: 'GO' },
  { name: 'Imo', code: 'IM' }, { name: 'Jigawa', code: 'JI' },
  { name: 'Kaduna', code: 'KD' }, { name: 'Kano', code: 'KN' },
  { name: 'Katsina', code: 'KT' }, { name: 'Kebbi', code: 'KE' },
  { name: 'Kogi', code: 'KO' }, { name: 'Kwara', code: 'KW' },
  { name: 'Lagos', code: 'LA' }, { name: 'Nasarawa', code: 'NA' },
  { name: 'Niger', code: 'NI' }, { name: 'Ogun', code: 'OG' },
  { name: 'Ondo', code: 'ON' }, { name: 'Osun', code: 'OS' },
  { name: 'Oyo', code: 'OY' }, { name: 'Plateau', code: 'PL' },
  { name: 'Rivers', code: 'RI' }, { name: 'Sokoto', code: 'SO' },
  { name: 'Taraba', code: 'TA' }, { name: 'Yobe', code: 'YO' },
  { name: 'Zamfara', code: 'ZA' },
];

const STATE_LGAS: Record<string, string[]> = {
  Lagos: ['Ikeja', 'Lagos Island', 'Lagos Mainland', 'Eti-Osa', 'Surulere', 'Agege', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikorodu', 'Kosofe', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Victoria Island'],
  Kano: ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nasarawa', 'Kumbotso', 'Ungogo', 'Tofa', 'Wudil'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Eleme', 'Tai', 'Ogu-Bolo', 'Andoni', 'Oyigbo'],
  Oyo: ['Ibadan North', 'Ibadan South-East', 'Ibadan North-West', 'Egbeda', 'Ona-Ara', 'Oluyole'],
  FCT: ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Abaji', 'Kwali'],
  Kaduna: ['Kaduna North', 'Kaduna South', 'Chikun', 'Igabi', 'Zaria', 'Sabon Gari'],
  Enugu: ['Enugu North', 'Enugu South', 'Enugu East', 'Igbo-Eze North', 'Udi'],
  Delta: ['Asaba', 'Warri', 'Sapele', 'Ughelli North', 'Isoko South'],
};

const FACILITY_TYPES = [
  'teaching_hospital', 'federal_medical_centre', 'general_hospital',
  'primary_health_centre', 'private_hospital', 'specialist_hospital',
  'diagnostic_centre', 'pharmacy', 'maternity_centre',
] as const;

const OWNERSHIPS = ['public', 'private', 'mission', 'ngo'] as const;
const VERIFICATION_STATUSES = ['unverified', 'community_submitted', 'source_verified', 'admin_verified'] as const;
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

const FACILITY_PREFIXES = [
  'General Hospital', 'Primary Health Centre', 'Specialist Hospital',
  'Federal Medical Centre', 'University Teaching Hospital', 'State Hospital',
  'Community Health Centre', 'Cottage Hospital', 'District Hospital',
  'Memorial Hospital', 'Clinic', 'Medical Centre',
];

const AREA_NAMES = [
  'Central', 'North', 'South', 'East', 'West', 'Main', 'Regional',
  'Old Town', 'New Layout', 'GRA', 'Industrial', 'Ring Road',
];

const CLINIC_NAMES = [
  'Cardiology Outpatient', 'Paediatric Clinic', 'Antenatal Clinic',
  'Surgical Outpatient', 'Ophthalmology Clinic', 'Nephrology Clinic',
  'Neurology Clinic', 'ENT Clinic', 'Dermatology Clinic', 'Orthopaedic Clinic',
  'Family Medicine Clinic', 'Haematology Clinic', 'Oncology Clinic',
  'Endocrinology Clinic', 'Psychiatry Clinic', 'Dental Clinic',
];

const SERVICES_LIST = [
  'Emergency care', 'Maternity care', 'Antenatal care', 'Immunisation',
  'Paediatrics', 'Surgery', 'Internal medicine', 'Cardiology', 'Dialysis',
  'Laboratory services', 'Radiology', 'Mental health', 'HIV services',
  'TB services', 'Family planning', 'Dental care', 'Eye care',
];

const SPECIALTIES_LIST = [
  'Cardiology', 'Paediatrics', 'Obstetrics and Gynaecology', 'Surgery',
  'Orthopaedics', 'Ophthalmology', 'ENT', 'Dermatology', 'Psychiatry',
  'Neurology', 'Nephrology', 'Oncology', 'Haematology', 'Endocrinology',
  'Gastroenterology', 'Urology', 'Dental surgery', 'Family medicine',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return +(Math.random() * (max - min) + min).toFixed(6);
}

// Nigeria bounding box: lat 4.2–13.9, lon 2.7–14.7
function randomNigerianCoords(): { lat: number; lon: number } {
  return {
    lat: randomFloat(4.2, 13.9),
    lon: randomFloat(2.7, 14.7),
  };
}

// ─── Main Seeder ──────────────────────────────────────────────────────────────

async function seed() {
  const client = neon(DB_URL);
  const db = drizzle(client, { schema });

  console.log('🌱 Starting NOVA database seeder...\n');

  // 1. States
  console.log('📍 Seeding states...');
  const stateRows = await db.insert(states)
    .values(NIGERIAN_STATES.map(s => ({ name: s.name, code: s.code })))
    .onConflictDoNothing()
    .returning();
  const stateMap = new Map(stateRows.map(s => [s.name, s.id]));
  console.log(`   ✅ ${stateRows.length} states`);

  // 2. LGAs
  console.log('📍 Seeding LGAs...');
  const lgaRows: typeof lgas.$inferInsert[] = [];
  for (const [stateName, lgaList] of Object.entries(STATE_LGAS)) {
    const stateId = stateMap.get(stateName);
    if (!stateId) continue;
    for (const lgaName of lgaList) {
      lgaRows.push({ stateId, name: lgaName });
    }
  }
  // For states without defined LGAs, add generic ones
  for (const s of stateRows) {
    if (!STATE_LGAS[s.name]) {
      for (let i = 1; i <= 5; i++) {
        lgaRows.push({ stateId: s.id, name: `${s.name} LGA ${i}` });
      }
    }
  }
  const insertedLgas = await db.insert(lgas).values(lgaRows).onConflictDoNothing().returning();
  const lgaByState = new Map<string, string[]>();
  for (const lga of insertedLgas) {
    const arr = lgaByState.get(lga.stateId) ?? [];
    arr.push(lga.id);
    lgaByState.set(lga.stateId, arr);
  }
  console.log(`   ✅ ${insertedLgas.length} LGAs`);

  // 3. Services
  console.log('⚕️  Seeding services...');
  const serviceRows = await db.insert(services)
    .values(SERVICES_LIST.map(name => ({ name, slug: slug(name) })))
    .onConflictDoNothing()
    .returning();
  const serviceIds = serviceRows.map(s => s.id);
  console.log(`   ✅ ${serviceRows.length} services`);

  // 4. Specialties
  console.log('🔬 Seeding specialties...');
  const specialtyRows = await db.insert(specialties)
    .values(SPECIALTIES_LIST.map(name => ({ name, slug: slug(name) })))
    .onConflictDoNothing()
    .returning();
  const specialtyIds = specialtyRows.map(s => s.id);
  console.log(`   ✅ ${specialtyRows.length} specialties`);

  // 5. Source
  console.log('📚 Seeding sources...');
  const [sourceRow] = await db.insert(sources)
    .values([{ name: 'Federal Ministry of Health Nigeria', url: 'https://health.gov.ng' }])
    .onConflictDoNothing()
    .returning();

  // 6. Facilities (10,000)
  console.log('🏥 Seeding 10,000 facilities...');
  const stateEntries = stateRows;
  const CHUNK = 500;
  const facilityIds: string[] = [];
  const facilityStateMap = new Map<string, string>(); // facilityId -> stateId

  for (let i = 0; i < 10_000; i += CHUNK) {
    const batch = [];
    for (let j = 0; j < CHUNK && i + j < 10_000; j++) {
      const state = pick(stateEntries);
      const lgaList = lgaByState.get(state.id) ?? [];
      const lgaId = lgaList.length > 0 ? pick(lgaList) : undefined;
      const coords = randomNigerianCoords();
      const facilityType = pick(FACILITY_TYPES);
      const ownership = pick(OWNERSHIPS);
      const verificationStatus = pick(VERIFICATION_STATUSES);
      const prefix = pick(FACILITY_PREFIXES);
      const area = pick(AREA_NAMES);
      const name = `${prefix} ${area} ${state.name}`;

      batch.push({
        name,
        facilityType,
        ownership,
        stateId: state.id,
        lgaId: lgaId ?? null,
        address: `${randomBetween(1, 200)} ${area} Road, ${state.name}`,
        phone: `+234 ${randomBetween(70, 90)}${randomBetween(1000000, 9999999)}`,
        latitude: coords.lat,
        longitude: coords.lon,
        verificationStatus,
        dataSource: 'Federal Ministry of Health Nigeria',
        sourceId: sourceRow?.id ?? null,
        confidenceScore: parseFloat((Math.random() * 0.6 + 0.3).toFixed(2)),
        isActive: true,
      });
    }

    const inserted = await db.insert(facilities).values(batch).returning({ id: facilities.id });
    for (const f of inserted) facilityIds.push(f.id);
    for (let k = 0; k < inserted.length; k++) {
      facilityStateMap.set(inserted[k].id, batch[k].stateId);
    }
    process.stdout.write(`   🏥 ${Math.min(i + CHUNK, 10_000)} / 10,000\r`);
  }
  console.log(`\n   ✅ 10,000 facilities inserted`);

  // 7. Facility Services
  console.log('🔧 Seeding facility-service links...');
  const fsChunk: typeof facilityServices.$inferInsert[] = [];
  for (const fId of facilityIds) {
    const numServices = randomBetween(2, 6);
    const shuffled = [...serviceIds].sort(() => Math.random() - 0.5).slice(0, numServices);
    for (const sId of shuffled) {
      fsChunk.push({ facilityId: fId, serviceId: sId });
    }
    if (fsChunk.length >= 2000) {
      await db.insert(facilityServices).values(fsChunk).onConflictDoNothing();
      fsChunk.length = 0;
    }
  }
  if (fsChunk.length > 0) {
    await db.insert(facilityServices).values(fsChunk).onConflictDoNothing();
  }
  console.log(`   ✅ Facility-service links done`);

  // 8. Clinic Schedules (10,000)
  console.log('📅 Seeding 10,000 clinic schedules...');
  for (let i = 0; i < 10_000; i += CHUNK) {
    const batch = [];
    for (let j = 0; j < CHUNK && i + j < 10_000; j++) {
      const facilityId = pick(facilityIds);
      const specialtyId = pick(specialtyIds);
      const day = pick(DAYS);
      const startHour = randomBetween(7, 10);
      const endHour = startHour + randomBetween(3, 6);
      const startTime = `${String(startHour).padStart(2, '0')}:00`;
      const endTime = `${String(Math.min(endHour, 17)).padStart(2, '0')}:00`;

      batch.push({
        facilityId,
        specialtyId,
        clinicName: pick(CLINIC_NAMES),
        dayOfWeek: day,
        startTime,
        endTime,
        referralRequired: Math.random() > 0.5,
        verificationStatus: pick(VERIFICATION_STATUSES),
        dataSource: 'Federal Ministry of Health Nigeria',
        isActive: true,
      });
    }
    await db.insert(clinicSchedules).values(batch);
    process.stdout.write(`   📅 ${Math.min(i + CHUNK, 10_000)} / 10,000\r`);
  }
  console.log(`\n   ✅ 10,000 clinic schedules inserted`);

  console.log('\n🎉 Seeding complete!\n');
}

seed().catch((err) => {
  console.error('❌ Seeder failed:', err);
  process.exit(1);
});
