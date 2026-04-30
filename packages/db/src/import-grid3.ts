// Import the full GRID3 / NHFR Nigeria health facilities dataset (~51k rows)
// into the facilities table. Wipes the existing facilities (and any cascading
// rows in facility_services / clinic_schedules) before importing.
//
// Usage:
//   npm run db:import-grid3
//   npm run db:import-grid3 -- path/to/grid3.csv

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { facilities, lgas, sources, states } from './schema';

const DB_URL = process.env.DATABASE_URL!;
if (!DB_URL) {
  console.error('❌ DATABASE_URL is not set.');
  process.exit(1);
}

const DEFAULT_CSV = path.resolve(
  __dirname,
  '../../../datasets/GRID3_NGA_health_facilities_v2_0_3768559736750290399.csv',
);

// ── Mappings ─────────────────────────────────────────────────────────────────

type FacilityType = typeof facilities.$inferInsert['facilityType'];
type Ownership = typeof facilities.$inferInsert['ownership'];

// GRID3 facility_level_option → our facility_type enum
const FACILITY_TYPE_MAP: Record<string, FacilityType> = {
  'Primary Health Center': 'primary_health_centre',
  'Primary Health Clinic': 'primary_health_centre',
  'Health Post': 'primary_health_centre',
  'General Hospital': 'general_hospital',
  'Teaching/Tertiary Hospital': 'teaching_hospital',
  'Specialized Hospital': 'specialist_hospital',
};

// Detect the type by combining level option + ownership type (federal medical
// centres are usually labelled "General Hospital" in GRID3 with Federal ownership).
function deriveFacilityType(
  levelOption: string,
  ownershipType: string,
  facilityName: string,
): FacilityType {
  const opt = levelOption.replace(/ /g, ' ').trim();
  const owner = ownershipType.trim();
  const name = facilityName.toLowerCase();

  if (opt === 'Teaching/Tertiary Hospital') return 'teaching_hospital';
  if (opt === 'Specialized Hospital') return 'specialist_hospital';

  // A General Hospital owned by Federal Govt is essentially a Federal Medical Centre.
  if (opt === 'General Hospital' && owner === 'Federal Government') return 'federal_medical_centre';
  if (/federal medical|fmc\b/.test(name) && owner === 'Federal Government') return 'federal_medical_centre';

  if (opt === 'General Hospital') return 'general_hospital';
  return FACILITY_TYPE_MAP[opt] ?? 'primary_health_centre';
}

// GRID3 ownership + ownership_type → our ownership enum
function deriveOwnership(ownership: string, ownershipType: string): Ownership {
  const o = ownership.trim();
  const t = ownershipType.trim();
  if (t.includes('Military')) return 'military';
  if (t === 'Not For Profit') return 'ngo';
  if (o === 'Private' || t === 'For Profit') return 'private';
  if (o === 'Public') return 'public';
  return 'public';
}

// Confidence score by geocoordinates source (NHFR_2024 highest, others lower)
function deriveConfidence(geoSource: string, levelOption: string): number {
  const g = geoSource.trim();
  let base = 0.7;
  if (g === 'NHFR_2024') base = 0.95;
  else if (g === 'GRID3_EHEALTH') base = 0.9;
  else if (g.startsWith('GRID3')) base = 0.85;
  // Slight penalty if level is unknown
  if (levelOption.trim() === 'Unknown') base -= 0.1;
  return Math.max(0, Math.min(1, +base.toFixed(2)));
}

// ── Tiny CSV parser (handles BOM + quoted fields) ─────────────────────────────

function parseCsv(content: string): { header: string[]; rows: string[][] } {
  // Strip UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuote = false;

  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (inQuote) {
      if (c === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuote = true;
      } else if (c === ',') {
        cur.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && content[i + 1] === '\n') i++;
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = '';
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  // Drop trailing empty rows
  while (rows.length && rows[rows.length - 1].every((c) => c.length === 0)) rows.pop();

  const header = rows.shift() ?? [];
  return { header, rows };
}

function rowsToObjects(header: string[], rows: string[][]) {
  return rows.map((row) => {
    const o: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) o[header[i]] = (row[i] ?? '').trim();
    return o;
  });
}

// Normalize state names: GRID3 uses several variants we need to map back to
// the canonical names we seeded.
const STATE_NAME_NORMALIZE: Record<string, string> = {
  'federal capital territory': 'FCT',
  'fct-abuja': 'FCT',
  fct: 'FCT',
  'akwa-ibom': 'Akwa Ibom',
  akwaibom: 'Akwa Ibom',
  'cross-river': 'Cross River',
  nassarawa: 'Nasarawa',
};
function normalizeState(name: string): string {
  const n = name.trim();
  const lookup = STATE_NAME_NORMALIZE[n.toLowerCase()];
  return lookup ?? n;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function importGrid3() {
  const csvPath = path.resolve(process.argv[2] ?? DEFAULT_CSV);
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading ${path.basename(csvPath)}…`);
  const t0 = Date.now();
  const content = fs.readFileSync(csvPath, 'utf8');
  const { header, rows } = parseCsv(content);
  const records = rowsToObjects(header, rows);
  console.log(`   ${records.length.toLocaleString()} rows parsed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

  const sql = neon(DB_URL);
  const db = drizzle(sql, { schema });

  // 1. Wipe existing facility data so we start clean.
  console.log('🧹 Wiping existing facilities (and cascading rows)…');
  // Use raw HTTP driver for TRUNCATE since Drizzle v0.30 doesn't expose TRUNCATE.
  await sql('TRUNCATE TABLE facility_services, clinic_schedules, facilities RESTART IDENTITY CASCADE');
  console.log('   ✅ wiped');

  // 2. Load states (already seeded).
  const stateRows = await db.select().from(states);
  const stateByName = new Map<string, string>();
  for (const s of stateRows) stateByName.set(s.name, s.id);
  console.log(`📍 Loaded ${stateRows.length} states`);

  // 3. Load existing LGAs and prepare for upserts.
  const existingLgas = await db.select().from(lgas);
  const lgaByKey = new Map<string, string>(); // `${stateId}::${lgaName}` -> lgaId
  for (const l of existingLgas) lgaByKey.set(`${l.stateId}::${l.name}`, l.id);

  // 4. Ensure GRID3 source row exists.
  const existingSource = await db.query.sources.findFirst({
    where: (s, { eq }) => eq(s.name, 'GRID3 NHFR 2024'),
  });
  let gridSourceId = existingSource?.id;
  if (!gridSourceId) {
    const [inserted] = await db
      .insert(sources)
      .values({
        name: 'GRID3 NHFR 2024',
        url: 'https://grid3.org/',
        description:
          'Nigeria Health Facility Registry (2024) merged with GRID3 eHealth Africa coordinates.',
      })
      .returning();
    gridSourceId = inserted.id;
  }
  console.log(`📚 GRID3 source id: ${gridSourceId}`);

  // 5. Discover any new (state, lga) pairs and insert missing LGAs in one batch.
  const seenStateLga = new Set<string>();
  const newLgaRows: { stateId: string; name: string }[] = [];
  let skippedNoState = 0;
  for (const r of records) {
    const stateName = normalizeState(r.state);
    const stateId = stateByName.get(stateName);
    if (!stateId) {
      skippedNoState++;
      continue;
    }
    const lgaName = r.lga.trim();
    if (!lgaName) continue;
    const key = `${stateId}::${lgaName}`;
    if (lgaByKey.has(key) || seenStateLga.has(key)) continue;
    seenStateLga.add(key);
    newLgaRows.push({ stateId, name: lgaName });
  }
  if (newLgaRows.length > 0) {
    console.log(`📍 Inserting ${newLgaRows.length} new LGAs…`);
    const CHUNK = 500;
    for (let i = 0; i < newLgaRows.length; i += CHUNK) {
      const chunk = newLgaRows.slice(i, i + CHUNK);
      const inserted = await db.insert(lgas).values(chunk).returning();
      for (const l of inserted) lgaByKey.set(`${l.stateId}::${l.name}`, l.id);
    }
  }
  if (skippedNoState > 0) {
    console.warn(`⚠️  ${skippedNoState} rows skipped — state name not found in DB`);
  }

  // 6. Build facility insert rows.
  console.log('🏥 Mapping rows to facility inserts…');
  const facilityRows: typeof facilities.$inferInsert[] = [];
  let skippedNoCoords = 0;
  for (const r of records) {
    const stateName = normalizeState(r.state);
    const stateId = stateByName.get(stateName);
    if (!stateId) continue;
    const lgaId = lgaByKey.get(`${stateId}::${r.lga.trim()}`) ?? null;

    const lat = parseFloat(r.latitude);
    const lon = parseFloat(r.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      skippedNoCoords++;
      continue;
    }

    const facilityType = deriveFacilityType(
      r.facility_level_option,
      r.ownership_type,
      r.facility_name,
    );
    const ownership = deriveOwnership(r.ownership, r.ownership_type);
    const confidence = deriveConfidence(r.geocoordinates_source, r.facility_level_option);

    let lastVerifiedAt: Date | null = null;
    if (r.last_updated) {
      const d = new Date(r.last_updated);
      if (!Number.isNaN(d.getTime())) lastVerifiedAt = d;
    }

    facilityRows.push({
      name: r.facility_name || 'Unnamed facility',
      facilityType,
      ownership,
      stateId,
      lgaId,
      ward: r.ward || null,
      latitude: lat,
      longitude: lon,
      verificationStatus: 'source_verified',
      dataSource: 'GRID3 NHFR 2024',
      sourceUrl: r.globalid || null,
      sourceId: gridSourceId,
      confidenceScore: confidence,
      lastVerifiedAt,
      isActive: true,
      externalId: r.nhfr_uid || null,
      externalCode: r.nhfr_facility_code || null,
      metadata: {
        facility_level: r.facility_level || null,
        facility_level_option: r.facility_level_option || null,
        ownership_raw: r.ownership || null,
        ownership_type_raw: r.ownership_type || null,
        facility_name_source: r.facility_name_source || null,
        geocoordinates_source: r.geocoordinates_source || null,
        ward_name_disagreement: r.ward_name_disagreement === '1',
        lga_name_disagreement: r.lga_name_disagreement === '1',
        globalid: r.globalid || null,
      },
    });
  }
  if (skippedNoCoords > 0) {
    console.warn(`⚠️  ${skippedNoCoords} rows skipped — invalid coordinates`);
  }
  console.log(`   ${facilityRows.length.toLocaleString()} ready to insert`);

  // 7. Bulk insert in chunks.
  console.log('💾 Inserting facilities…');
  const CHUNK = 500;
  let inserted = 0;
  const tInsertStart = Date.now();
  for (let i = 0; i < facilityRows.length; i += CHUNK) {
    const chunk = facilityRows.slice(i, i + CHUNK);
    await db.insert(facilities).values(chunk);
    inserted += chunk.length;
    process.stdout.write(`   🏥 ${inserted.toLocaleString()} / ${facilityRows.length.toLocaleString()}\r`);
  }
  console.log(`\n   ✅ Inserted ${inserted.toLocaleString()} facilities in ${((Date.now() - tInsertStart) / 1000).toFixed(1)}s`);

  // 8. Quick distribution summary
  const counts = await sql`
    SELECT facility_type, count(*)::int AS n
    FROM facilities
    GROUP BY facility_type
    ORDER BY n DESC
  `;
  console.log('\n📊 By type:');
  for (const c of counts as any[]) console.log(`   ${c.facility_type.padEnd(24)} ${c.n.toLocaleString()}`);

  console.log('\n🎉 GRID3 import complete!');
}

importGrid3().catch((err) => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
