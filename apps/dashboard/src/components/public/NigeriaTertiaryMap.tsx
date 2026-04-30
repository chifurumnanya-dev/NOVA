import {
  NIGERIA_VIEWBOX,
  NIGERIA_OUTLINE_PATH,
  NIGERIA_STATES_PATH,
  NIGERIA_STATE_LABELS,
  projectLonLat,
  isInsideNigeria,
} from '@/lib/nigeria-svg';
import { unstable_noStore as noStore } from 'next/cache';
import { API_BASE_V1_URL, BUILD_FETCH_TIMEOUT_MS } from '@/lib/config';

type Tier = 'teaching' | 'specialized';

const TIER_BY_TYPE: Record<string, Tier> = {
  teaching_hospital: 'teaching',
  federal_medical_centre: 'specialized',
  specialist_hospital: 'specialized',
};

const RADIUS: Record<Tier, number> = {
  teaching: 4.8,
  specialized: 3.4,
};

const COLOR: Record<Tier, string> = {
  teaching: '#4f46e5',
  specialized: '#059669',
};

const COLOR_DARK: Record<Tier, string> = {
  teaching: '#3730a3',
  specialized: '#065f46',
};

// Pre-computed positions on the SVG canvas, after lon/lat projection and
// gentle anti-collision spreading so dense clusters (Lagos, Abuja) stay readable.
interface Placed {
  f: MapFacility;
  x: number;
  y: number;
}

// Nigerian geopolitical zones — used to seed plausible referral patterns
const REGION_OF: Record<string, 'SW' | 'SE' | 'SS' | 'NC' | 'NE' | 'NW'> = {
  Lagos: 'SW', Ogun: 'SW', Oyo: 'SW', Osun: 'SW', Ondo: 'SW', Ekiti: 'SW',
  Anambra: 'SE', Enugu: 'SE', Ebonyi: 'SE', Imo: 'SE', Abia: 'SE',
  Edo: 'SS', Delta: 'SS', Bayelsa: 'SS', Rivers: 'SS',
  'Cross River': 'SS', 'Akwa Ibom': 'SS',
  FCT: 'NC', 'Federal Capital Territory': 'NC', Niger: 'NC', Kogi: 'NC',
  Kwara: 'NC', Plateau: 'NC', Nasarawa: 'NC', Benue: 'NC',
  Borno: 'NE', Yobe: 'NE', Adamawa: 'NE', Bauchi: 'NE', Gombe: 'NE', Taraba: 'NE',
  Kano: 'NW', Kaduna: 'NW', Katsina: 'NW', Sokoto: 'NW',
  Zamfara: 'NW', Kebbi: 'NW', Jigawa: 'NW',
};

// Regional referral apex (well-known teaching hospitals in each zone)
const REGIONAL_APEX_STATE: Record<string, string> = {
  SW: 'Lagos',  // LUTH/LASUTH
  SE: 'Enugu',  // UNTH
  SS: 'Edo',    // UBTH (Benin)
  NC: 'FCT',    // National Hospital Abuja
  NE: 'Borno',  // UMTH Maiduguri
  NW: 'Kano',   // Aminu Kano Teaching Hospital
};

// National apex states — receive periodic inter-regional referrals
const NATIONAL_APEX_STATES = ['Lagos', 'FCT', 'Federal Capital Territory', 'Oyo', 'Kaduna'];

type ReferralKind = 'convergence' | 'crosscountry' | 'lateral' | 'interteaching';

interface AnimatedReferral {
  source: Placed;
  dest: Placed;
  begin: number;       // initial offset so referrals don't all start at t=0
  cycle: number;       // independent repeat period for this referral (sec)
  travelDur: number;   // seconds for the pulse to traverse the path
  holdAfter: number;   // seconds the line stays visible after pulse arrives
  kind: ReferralKind;
  side: 1 | -1;        // which way the curve bows
  curvature: number;   // 0 = straight; ~0.15 = gentle arc
  key: string;
}

function pickApexInState(state: string, teaching: Placed[]): Placed | null {
  const inState = teaching.filter(
    (t) =>
      t.f.state === state ||
      (state === 'FCT' && t.f.state === 'Federal Capital Territory'),
  );
  if (inState.length === 0) return null;
  const preferred = inState.find((c) =>
    /university teaching hospital|national hospital|federal teaching|aminu kano/i.test(c.f.name),
  );
  return preferred ?? inState[0];
}

// Quadratic Bezier path that bows perpendicular to the line by `curvature * length`.
// Used both for the visible <path> and for <animateMotion> so the pulse rides the arc.
function curvedPath(s: Placed, d: Placed, curvature: number, side: 1 | -1): string {
  const dx = d.x - s.x;
  const dy = d.y - s.y;
  const len = Math.hypot(dx, dy) || 1;
  const mx = (s.x + d.x) / 2;
  const my = (s.y + d.y) / 2;
  // Perpendicular unit vector × curvature × length
  const px = (-dy / len) * side;
  const py = (dx / len) * side;
  const cx = mx + px * len * curvature;
  const cy = my + py * len * curvature;
  return `M${s.x},${s.y} Q${cx},${cy} ${d.x},${d.y}`;
}

// All zones run concurrently — each referral is its own independent loop with
// its own period. They never sync up because cycles vary slightly per pair.
function buildAnimatedSchedule(placed: Placed[]): AnimatedReferral[] {
  const teaching = placed.filter((p) => TIER_BY_TYPE[p.f.type] === 'teaching');
  const specialized = placed.filter((p) => TIER_BY_TYPE[p.f.type] === 'specialized');

  const regionalApex: Record<string, Placed | null> = {};
  for (const [r, st] of Object.entries(REGIONAL_APEX_STATE)) {
    regionalApex[r] = pickApexInState(st, teaching);
  }
  const apexList = Object.values(regionalApex).filter((x): x is Placed => x !== null);
  const nationalHubs = NATIONAL_APEX_STATES.map((st) => pickApexInState(st, teaching))
    .filter((x): x is Placed => x !== null)
    .filter((v, i, arr) => arr.findIndex((x) => x.f.id === v.f.id) === i);

  const referrals: AnimatedReferral[] = [];
  const seen = new Set<string>();
  const add = (r: Omit<AnimatedReferral, 'key'> & { key?: string }): void => {
    if (r.source.f.id === r.dest.f.id) return;
    const key = r.key ?? `${r.source.f.id}::${r.dest.f.id}::${r.begin.toFixed(2)}`;
    if (seen.has(key)) return;
    seen.add(key);
    referrals.push({ ...r, key });
  };

  // ── Radial convergences ──────────────────────────────────────────────────
  // Every region operates concurrently. Each apex pulls from 6 surrounding
  // facilities; each spoke runs its own loop, staggered so spokes within
  // a region arrive in waves rather than all together.
  const regionOrder: (keyof typeof REGIONAL_APEX_STATE)[] = ['SW', 'SE', 'SS', 'NC', 'NE', 'NW'];
  regionOrder.forEach((region, regionIdx) => {
    const apex = regionalApex[region];
    if (!apex) return;
    const sources = specialized
      .filter((s) => REGION_OF[s.f.state] === region && s.f.id !== apex.f.id)
      .slice(0, 6);
    sources.forEach((s, i) => {
      const cycle = 9.5 + i * 0.55 + regionIdx * 0.18;
      // Stagger spokes around the cycle so the wave rotates around the apex
      const begin = (i / sources.length) * cycle + regionIdx * 0.35;
      add({
        source: s,
        dest: apex,
        begin,
        cycle,
        travelDur: 2.6,
        holdAfter: 1.4,
        kind: 'convergence',
        side: ((i % 2 === 0 ? 1 : -1) as 1 | -1),
        curvature: 0.17,
        key: `conv-${region}-${i}`,
      });
    });
  });

  // ── Secondary convergences ───────────────────────────────────────────────
  // Non-apex teaching hospitals also draw referrals from their two nearest
  // specialized neighbours. Brings the inner network alive between the
  // major regional spokes.
  const nonApexTeaching = teaching.filter(
    (t) => !apexList.some((a) => a.f.id === t.f.id),
  );
  nonApexTeaching.slice(0, 8).forEach((t, ti) => {
    const pool = specialized
      .filter((s) => s.f.id !== t.f.id)
      .map((s) => ({ s, d: Math.hypot(s.x - t.x, s.y - t.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    pool.forEach(({ s }, j) => {
      const cycle = 11 + ((ti + j) % 4) * 0.7;
      add({
        source: s,
        dest: t,
        begin: ti * 0.8 + j * (cycle / 2),
        cycle,
        travelDur: 2.4,
        holdAfter: 1.2,
        kind: 'convergence',
        side: (((ti + j) % 2 === 0 ? -1 : 1) as 1 | -1),
        curvature: 0.15,
        key: `conv2-${ti}-${j}`,
      });
    });
  });

  // ── Inter-teaching (purple, periodic) ────────────────────────────────────
  // Apex-to-apex consultations. Long cycles → these appear periodically,
  // not constantly. Their distinctive purple reads as a different signal.
  const apexPairs: [Placed, Placed][] = [];
  for (let i = 0; i + 1 < apexList.length; i++) apexPairs.push([apexList[i], apexList[i + 1]]);
  if (apexList.length >= 4) {
    apexPairs.push([apexList[0], apexList[apexList.length - 1]]);
    apexPairs.push([apexList[1], apexList[apexList.length - 2]]);
  }
  apexPairs.slice(0, 6).forEach(([a, b], i) => {
    add({
      source: a,
      dest: b,
      begin: 4 + i * 3.2,
      cycle: 15 + (i % 3) * 1.3,
      travelDur: 3.6,
      holdAfter: 2.4,
      kind: 'interteaching',
      side: ((i % 2 === 0 ? 1 : -1) as 1 | -1),
      curvature: 0.24,
      key: `interteach-${i}`,
    });
  });

  // ── Cross-country to national hubs (periodic, dramatic) ──────────────────
  if (nationalHubs.length > 0) {
    const candidates = specialized.filter((s) => !NATIONAL_APEX_STATES.includes(s.f.state));
    const stride = Math.max(1, Math.floor(candidates.length / 6));
    for (let k = 0, i = 0; k < candidates.length && i < 6; k += stride, i++) {
      add({
        source: candidates[k],
        dest: nationalHubs[i % nationalHubs.length],
        begin: 2 + i * 2.4,
        cycle: 13 + (i % 2) * 1.5,
        travelDur: 3.4,
        holdAfter: 2.0,
        kind: 'crosscountry',
        side: ((i % 2 === 0 ? -1 : 1) as 1 | -1),
        curvature: 0.2,
        key: `cross-${i}`,
      });
    }
  }

  // ── Lateral inter-facility (background, ambient) ─────────────────────────
  const lateralBudget = 22;
  let lateralCount = 0;
  const usedLateral = new Set<string>();
  for (const s of specialized) {
    if (lateralCount >= lateralBudget) break;
    const sameRegion = specialized.filter(
      (p) => p.f.id !== s.f.id && REGION_OF[p.f.state] === REGION_OF[s.f.state],
    );
    const pool = sameRegion.length > 0 ? sameRegion : specialized.filter((p) => p.f.id !== s.f.id);
    if (pool.length === 0) continue;
    // Two nearest neighbours per source so the lateral mesh is denser
    const nearest = pool
      .map((p) => ({ p, d: Math.hypot(p.x - s.x, p.y - s.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { p: n } of nearest) {
      if (lateralCount >= lateralBudget) break;
      const undirectedKey = [s.f.id, n.f.id].sort().join('|');
      if (usedLateral.has(undirectedKey)) continue;
      usedLateral.add(undirectedKey);
      const cycle = 9 + (lateralCount % 5) * 0.65;
      add({
        source: s,
        dest: n,
        begin: (lateralCount * 0.7) % cycle,
        cycle,
        travelDur: 1.9,
        holdAfter: 1.0,
        kind: 'lateral',
        side: ((lateralCount % 2 === 0 ? 1 : -1) as 1 | -1),
        curvature: 0.13,
        key: `lat-${undirectedKey}`,
      });
      lateralCount++;
    }
  }

  return referrals;
}

// Force-based separation: nudge any pair closer than minDist apart, in a few
// passes. Keeps the visual centroid of clusters intact so positions remain
// faithful to the underlying geography.
function spreadOverlap(points: Placed[], minDist: number): Placed[] {
  const arr = points.map((p) => ({ ...p }));
  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        let dx = arr[j].x - arr[i].x;
        let dy = arr[j].y - arr[i].y;
        let dist = Math.hypot(dx, dy);
        if (dist === 0) {
          // Identical coords: deterministic tiny offset based on index
          dx = ((j - i) % 2 === 0 ? 1 : -1) * 0.3;
          dy = ((j - i) % 3 === 0 ? 1 : -1) * 0.3;
          dist = Math.hypot(dx, dy);
        }
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          arr[i].x -= nx * push;
          arr[i].y -= ny * push;
          arr[j].x += nx * push;
          arr[j].y += ny * push;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return arr;
}

interface ApiFacility {
  id: string;
  name: string;
  facilityType: string;
  latitude: number | null;
  longitude: number | null;
  state?: { name: string };
}

interface MapFacility {
  id: string;
  name: string;
  type: string;
  state: string;
  lat: number;
  lon: number;
}

async function fetchTier(facilityType: string, limit = 150): Promise<MapFacility[]> {
  try {
    const url = `${API_BASE_V1_URL}/facilities?facility_type=${facilityType}&limit=${limit}`;
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(BUILD_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: ApiFacility[] = json?.data ?? [];
    return list
      .filter(
        (f) =>
          f.latitude != null &&
          f.longitude != null &&
          isInsideNigeria(f.longitude as number, f.latitude as number),
      )
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: f.facilityType,
        state: f.state?.name ?? '',
        lat: f.latitude as number,
        lon: f.longitude as number,
      }));
  } catch {
    return [];
  }
}

export default async function NigeriaTertiaryMap() {
  noStore();

  const [teaching, federal, specialist] = await Promise.all([
    fetchTier('teaching_hospital'),
    fetchTier('federal_medical_centre'),
    fetchTier('specialist_hospital'),
  ]);

  const tertiary: MapFacility[] = [...teaching, ...federal, ...specialist];

  const counts = {
    teaching: teaching.length,
    specialized: federal.length + specialist.length,
  };

  // Render order: specialized first, then Teaching Hospitals on top
  const ordered = [...tertiary].sort((a, b) => {
    const order: Record<string, number> = {
      federal_medical_centre: 0,
      specialist_hospital: 0,
      teaching_hospital: 1,
    };
    return (order[a.type] ?? 0) - (order[b.type] ?? 0);
  });

  // Project to SVG space, then spread overlapping markers so clusters remain readable
  const projected: Placed[] = ordered.map((f) => {
    const [x, y] = projectLonLat(f.lon, f.lat);
    return { f, x, y };
  });
  const placed = spreadOverlap(projected, 7);

  // Animated referral schedule: every referral runs on its own independent
  // loop with its own period — all zones operate concurrently, never in sync.
  const schedule = buildAnimatedSchedule(placed);

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 overflow-hidden">
      <div className="flex items-start justify-between mb-2 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
            Live Coverage
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Tertiary Care across Nigeria
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {tertiary.length} verified tertiary facilities · sourced live from the NOVA database
          </p>
        </div>
        <div className="hidden sm:flex flex-col gap-1.5 text-[11px] text-slate-600 font-medium flex-shrink-0">
          <Legend size={8} label="Teaching Hospital" color={COLOR.teaching} />
          <Legend size={6} label="Specialized / FMC" color={COLOR.specialized} />
        </div>
      </div>

      <div className="aspect-[5/4] sm:aspect-[5/3.5] w-full relative">
        <svg
          viewBox={NIGERIA_VIEWBOX}
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="nigeriaClip">
              <path d={NIGERIA_OUTLINE_PATH} />
            </clipPath>
            {/* Premium dot gradients — light at top-left, darker at bottom-right for subtle 3D */}
            <radialGradient id="dotGradTeaching" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="55%" stopColor={COLOR.teaching} />
              <stop offset="100%" stopColor={COLOR_DARK.teaching} />
            </radialGradient>
            <radialGradient id="dotGradSpec" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="55%" stopColor={COLOR.specialized} />
              <stop offset="100%" stopColor={COLOR_DARK.specialized} />
            </radialGradient>
            {/* Refined drop shadow — tight, soft */}
            <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" />
              <feOffset dx="0" dy="0.6" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.35" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Soft glow for referral flow lines — blooms slightly so the curves feel alive */}
            <filter id="flowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* State interiors: very light grey with green inter-state borders */}
          <path
            d={NIGERIA_STATES_PATH}
            fill="rgb(248 250 252)"
            stroke="rgb(110 231 183)"
            strokeWidth={0.6}
            strokeLinejoin="round"
            fillRule="evenodd"
          />

          {/* Country outline — slate grey, as before */}
          <path
            d={NIGERIA_OUTLINE_PATH}
            fill="none"
            stroke="rgb(148 163 184)"
            strokeWidth={1.4}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* State labels */}
          {NIGERIA_STATE_LABELS.map((l) => (
            <text
              key={l.name}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill="rgb(100 116 139)"
              style={{ pointerEvents: 'none', letterSpacing: '0.02em' }}
            >
              {l.name}
            </text>
          ))}

          <g clipPath="url(#nigeriaClip)">
            {/* Animated referral network — convergences, cross-country flows,
                inter-teaching, and lateral inter-facility referrals. Each one
                has its own independent loop — all zones run concurrently. */}
            {schedule.map((r) => {
              const dur = `${r.cycle}s`;
              const begin = `${r.begin.toFixed(2)}s`;

              // Slot = pre-fade(0.4) + travel + hold + post-fade(0.6).
              // The remainder of r.cycle is "rest" (line invisible) → periodic firing.
              const fadeIn = 0.4;
              const fadeOut = 0.6;
              const slotLen = fadeIn + r.travelDur + r.holdAfter + fadeOut;
              const tFadeInEnd = fadeIn / r.cycle;
              const tTravelEnd = (fadeIn + r.travelDur) / r.cycle;
              const tHoldEnd = (fadeIn + r.travelDur + r.holdAfter) / r.cycle;
              const tSlotEnd = slotLen / r.cycle;

              const path = curvedPath(r.source, r.dest, r.curvature, r.side);

              // Visual weight by kind — calmer overall so the network reads as activity, not noise
              const weightMap: Record<ReferralKind, { line: number; pulseCore: number; pulseHalo: number; peak: number }> = {
                convergence: { line: 0.55, pulseCore: 1.05, pulseHalo: 2.1, peak: 0.4 },
                crosscountry: { line: 0.85, pulseCore: 1.5, pulseHalo: 3.0, peak: 0.5 },
                interteaching: { line: 1.05, pulseCore: 1.6, pulseHalo: 3.2, peak: 0.6 },
                lateral: { line: 0.4, pulseCore: 0.85, pulseHalo: 1.7, peak: 0.22 },
              };
              const weight = weightMap[r.kind];

              // Color palette — greens for referrals, distinctive purple for inter-teaching
              const paletteMap: Record<ReferralKind, { line: string; halo: string; core: string }> = {
                convergence:   { line: 'rgb(16 185 129)', halo: 'rgb(52 211 153)', core: 'rgb(5 150 105)' },
                crosscountry:  { line: 'rgb(5 150 105)',  halo: 'rgb(16 185 129)', core: 'rgb(4 120 87)' },
                interteaching: { line: 'rgb(168 85 247)', halo: 'rgb(192 132 252)', core: 'rgb(147 51 234)' },
                lateral:       { line: 'rgb(20 184 166)', halo: 'rgb(45 212 191)', core: 'rgb(13 148 136)' },
              };
              const palette = paletteMap[r.kind];

              // After-arrival ring expands for ~1s, then is gone for the rest of the cycle
              const splashEnd = Math.min(1, (fadeIn + r.travelDur + 1.0) / r.cycle);

              return (
                <g key={r.key}>
                  {/* Curved line: fades in, lingers, fades out.
                      5 frames (0, peak, peak, 0, 0) give natural fade w/o invalid keyTimes. */}
                  <path
                    d={path}
                    fill="none"
                    stroke={palette.line}
                    strokeWidth={weight.line}
                    strokeLinecap="round"
                    opacity={0}
                    filter="url(#flowGlow)"
                  >
                    <animate
                      attributeName="opacity"
                      values={`0;${weight.peak};${weight.peak};0;0`}
                      keyTimes={`0;${tFadeInEnd.toFixed(4)};${tHoldEnd.toFixed(4)};${tSlotEnd.toFixed(4)};1`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Outer halo pulse — soft glow trailing the core */}
                  <circle r={weight.pulseHalo} fill={palette.halo} opacity={0}>
                    <animateMotion
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                      path={path}
                      keyTimes={`0;${tFadeInEnd.toFixed(4)};${tTravelEnd.toFixed(4)};1`}
                      keyPoints="0;0;1;1"
                      calcMode="linear"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.45;0.45;0;0"
                      keyTimes={`0;${tFadeInEnd.toFixed(4)};${tTravelEnd.toFixed(4)};${tSlotEnd.toFixed(4)};1`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Bright core pulse — the traveling spark */}
                  <circle r={weight.pulseCore} fill={palette.core} opacity={0}>
                    <animateMotion
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                      path={path}
                      keyTimes={`0;${tFadeInEnd.toFixed(4)};${tTravelEnd.toFixed(4)};1`}
                      keyPoints="0;0;1;1"
                      calcMode="linear"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0;0"
                      keyTimes={`0;${tFadeInEnd.toFixed(4)};${tTravelEnd.toFixed(4)};${tSlotEnd.toFixed(4)};1`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Arrival splash — a ring expands at the destination when the pulse lands */}
                  <circle
                    cx={r.dest.x}
                    cy={r.dest.y}
                    r={1}
                    fill="none"
                    stroke={palette.core}
                    strokeWidth={0.6}
                    opacity={0}
                  >
                    <animate
                      attributeName="r"
                      values={`1;1;${(weight.pulseHalo * 2.4).toFixed(2)};${(weight.pulseHalo * 2.4).toFixed(2)}`}
                      keyTimes={`0;${tTravelEnd.toFixed(4)};${splashEnd.toFixed(4)};1`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0;0.7;0;0"
                      keyTimes={`0;${tTravelEnd.toFixed(4)};${splashEnd.toFixed(4)};1`}
                      dur={dur}
                      begin={begin}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}

            {placed.map(({ f, x, y }, i) => {
              const tier = TIER_BY_TYPE[f.type];
              if (!tier) return null;
              const r = RADIUS[tier];
              const gradId = tier === 'teaching' ? 'dotGradTeaching' : 'dotGradSpec';
              // Deterministic per-marker phase so the cluster breathes asynchronously
              const phase = ((i * 137) % 100) / 100; // 0..1
              const dur = tier === 'teaching' ? 4.2 : 5.0;
              const begin = `-${(phase * dur).toFixed(2)}s`;
              const rMin = r;
              const rMax = r * 1.12;

              // Ambient activity — 60% of facilities pulse on a rotating
              // stagger. Interleaved index pattern (i*7 % 10 < 6) gives a
              // visually uniform 60% coverage across the network. Each
              // active node fires its own loop with a per-facility cycle
              // and phase, so the active subset visibly rotates over time.
              const isActive = ((i * 7) % 10) < 6;
              const actCycle = 7.5 + (i % 5) * 0.55; // 7.5–9.7s
              const actPhase = ((i * 73) % 100) / 100;
              const actBegin = `-${(actPhase * actCycle).toFixed(2)}s`;
              const actColor = COLOR[tier];
              return (
                <g key={f.id ?? `${f.name}-${i}`} filter="url(#dotShadow)">
                  {/* Ambient activity ring — slow expanding glow on the
                      active 60%. Three slightly offset waves layered so the
                      pulse reads as continuous motion, not a single ping. */}
                  {isActive && (
                    <>
                      <circle cx={x} cy={y} r={r} fill="none" stroke={actColor} strokeWidth={0.5} opacity={0}>
                        <animate
                          attributeName="r"
                          values={`${r};${(r * 3.2).toFixed(2)}`}
                          keyTimes="0;1"
                          dur={`${actCycle}s`}
                          begin={actBegin}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0;0.55;0"
                          keyTimes="0;0.25;1"
                          dur={`${actCycle}s`}
                          begin={actBegin}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-width"
                          values="0.7;0.4;0.1"
                          keyTimes="0;0.5;1"
                          dur={`${actCycle}s`}
                          begin={actBegin}
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Second wave, half-cycle out of phase, smaller reach */}
                      <circle cx={x} cy={y} r={r} fill="none" stroke={actColor} strokeWidth={0.4} opacity={0}>
                        <animate
                          attributeName="r"
                          values={`${r};${(r * 2.2).toFixed(2)}`}
                          keyTimes="0;1"
                          dur={`${actCycle}s`}
                          begin={`-${(((actPhase + 0.5) % 1) * actCycle).toFixed(2)}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0;0.4;0"
                          keyTimes="0;0.3;1"
                          dur={`${actCycle}s`}
                          begin={`-${(((actPhase + 0.5) % 1) * actCycle).toFixed(2)}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Inner core glow — gentle brightness modulation on the dot itself */}
                      <circle cx={x} cy={y} r={r * 1.35} fill={actColor} opacity={0}>
                        <animate
                          attributeName="opacity"
                          values="0;0.18;0"
                          keyTimes="0;0.4;1"
                          dur={`${actCycle}s`}
                          begin={actBegin}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                  {/* Slow ripple — only on teaching hospitals, layered above
                      ambient activity for visual hierarchy. */}
                  {tier === 'teaching' && (
                    <circle cx={x} cy={y} r={r} fill="none" stroke={COLOR.teaching} strokeWidth={0.6} opacity={0}>
                      <animate
                        attributeName="r"
                        values={`${r};${r * 2.6}`}
                        dur="3.4s"
                        begin={begin}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.45;0"
                        dur="3.4s"
                        begin={begin}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={`url(#${gradId})`}
                    stroke="white"
                    strokeWidth={0.9}
                  >
                    <animate
                      attributeName="r"
                      values={`${rMin};${rMax};${rMin}`}
                      dur={`${dur}s`}
                      begin={begin}
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
                      keyTimes="0; 0.5; 1"
                    />
                  </circle>
                  {/* Specular highlight for premium feel */}
                  <circle
                    cx={x - r * 0.32}
                    cy={y - r * 0.38}
                    r={r * 0.28}
                    fill="white"
                    opacity={0.55}
                    pointerEvents="none"
                  />
                  <title>{`${f.name} · ${labelFor(f.type)}${f.state ? ' · ' + f.state : ''}`}</title>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Mobile legend */}
        <div className="sm:hidden absolute top-2 right-2 flex flex-col gap-1 text-[10px] bg-white/90 backdrop-blur rounded-lg border border-slate-200 px-2 py-1.5">
          <Legend size={7} label="Teaching" color={COLOR.teaching} compact />
          <Legend size={5} label="Specialized / FMC" color={COLOR.specialized} compact />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium">
        <Stat color={COLOR.teaching} label={`${counts.teaching} teaching hospitals`} />
        <Stat color={COLOR.specialized} label={`${counts.specialized} specialized / fmc hospitals`} />
      </div>
    </div>
  );
}

function Legend({
  size,
  label,
  color,
  haloed = false,
  compact = false,
}: {
  size: number;
  label: string;
  color: string;
  haloed?: boolean;
  compact?: boolean;
}) {
  return (
    <span className="flex items-center gap-2">
      <span className="relative flex items-center justify-center" style={{ width: 18, height: 14 }}>
        {haloed && (
          <span
            className="absolute rounded-full border"
            style={{ width: size * 1.8, height: size * 1.8, borderColor: color, opacity: 0.5 }}
          />
        )}
        <span
          className="rounded-full flex items-center justify-center"
          style={{ width: size, height: size, background: color, boxShadow: `0 0 6px ${color}50` }}
        >
          {haloed && <span className="w-[30%] h-[30%] rounded-full bg-white/90" />}
        </span>
      </span>
      <span className={compact ? 'text-slate-700' : ''}>{label}</span>
    </span>
  );
}

function Stat({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function labelFor(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
