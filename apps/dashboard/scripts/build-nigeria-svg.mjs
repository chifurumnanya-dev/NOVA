// Builds static SVG paths for Nigeria's outline + state boundaries from
// Natural Earth admin-0 (countries) and admin-1 (states/provinces) geojson.
// Run once: `node scripts/build-nigeria-svg.mjs`
// Outputs: src/lib/nigeria-svg.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COUNTRIES_URL = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json';
// geoBoundaries Nigeria ADM1 (states + FCT). LFS — must use media.githubusercontent.com.
const STATES_URL = 'https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1_simplified.geojson';

const BBOX = { minLon: 2.6, maxLon: 14.8, minLat: 4.0, maxLat: 14.0 };
const W = 1000;
const H = 800;

// Which states get a name label on the map (big or recognizable ones).
const LABEL_STATES = new Set([
  'Lagos',
  'Federal Capital Territory',
  'Kano',
  'Rivers',
  'Oyo',
  'Kaduna',
  'Borno',
  'Sokoto',
  'Edo',
  'Cross River',
  'Plateau',
  'Niger',
]);

// Display labels (geoBoundaries uses "Federal Capital Territory" but we'll show "Abuja (FCT)")
const LABEL_RENAME = {
  'Federal Capital Territory': 'FCT',
};

function project([lon, lat]) {
  const x = ((lon - BBOX.minLon) / (BBOX.maxLon - BBOX.minLon)) * W;
  const y = H - ((lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat)) * H;
  return [x, y];
}

function ringToPath(ring, simplifyEps = 0.6) {
  let last = null;
  let segs = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(ring[i]);
    if (last && Math.hypot(x - last[0], y - last[1]) < simplifyEps) continue;
    segs += (segs ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
    last = [x, y];
  }
  if (segs) segs += 'Z';
  return segs;
}

function geometryToPath(geom, eps = 0.6) {
  const parts = [];
  if (geom.type === 'Polygon') {
    for (const ring of geom.coordinates) parts.push(ringToPath(ring, eps));
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      for (const ring of poly) parts.push(ringToPath(ring, eps));
    }
  }
  return parts.join('');
}

// Polygon centroid by area-weighted average of triangle centroids
function ringCentroid(ring) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const f = x1 * y2 - x2 * y1;
    area += f;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  area *= 0.5;
  if (area === 0) return ring[0];
  return [cx / (6 * area), cy / (6 * area)];
}

function geometryCentroid(geom) {
  // Pick the largest polygon and return its centroid in lon/lat
  let best = null;
  let bestArea = -Infinity;

  const considerRing = (ring) => {
    let a = 0;
    for (let i = 0, n = ring.length - 1; i < n; i++) {
      const [x1, y1] = ring[i];
      const [x2, y2] = ring[i + 1];
      a += x1 * y2 - x2 * y1;
    }
    a = Math.abs(a) * 0.5;
    if (a > bestArea) {
      bestArea = a;
      best = ring;
    }
  };

  if (geom.type === 'Polygon') {
    considerRing(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) considerRing(poly[0]);
  }
  return best ? ringCentroid(best) : null;
}

const countries = await fetch(COUNTRIES_URL).then((r) => r.json());
const nigeria = countries.features.find(
  (f) => (f.properties?.NAME || f.properties?.name || f.properties?.ADMIN || '').toLowerCase() === 'nigeria',
);
if (!nigeria) {
  console.error('Could not find Nigeria in admin-0.');
  process.exit(1);
}
const outlinePath = geometryToPath(nigeria.geometry, 0.6);

// Collect all rings (outer + holes) of Nigeria's geometry as [lon,lat][] arrays
// for runtime point-in-polygon tests.
function ringsOf(geom) {
  const rings = [];
  if (geom.type === 'Polygon') {
    for (const ring of geom.coordinates) rings.push(ring);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) for (const ring of poly) rings.push(ring);
  }
  // Round to 3 decimals (~110m precision) to keep the bundle small
  return rings.map((r) => r.map(([lon, lat]) => [+lon.toFixed(3), +lat.toFixed(3)]));
}
const nigeriaRings = ringsOf(nigeria.geometry);

console.log('🗺  fetching Nigeria ADM1 from geoBoundaries…');
const states = await fetch(STATES_URL).then((r) => r.json());
console.log(`   ${states.features.length} ADM1 features`);

const statePaths = [];
const stateLabels = [];

for (const f of states.features) {
  const name = f.properties?.shapeName || 'Unknown';
  // Aggressive simplification — embraces a hand-drawn aesthetic
  const path = geometryToPath(f.geometry, 2.5);
  statePaths.push(path);

  if (LABEL_STATES.has(name)) {
    const c = geometryCentroid(f.geometry);
    if (c) {
      const [sx, sy] = project(c);
      stateLabels.push({ name: LABEL_RENAME[name] ?? name, x: +sx.toFixed(1), y: +sy.toFixed(1) });
    }
  }
}

const statesPath = statePaths.join('');

const out = `// Auto-generated by scripts/build-nigeria-svg.mjs — do not edit by hand
export const NIGERIA_VIEWBOX = '0 0 ${W} ${H}';
export const NIGERIA_BBOX = ${JSON.stringify(BBOX)};
export const NIGERIA_OUTLINE_PATH = ${JSON.stringify(outlinePath)};
export const NIGERIA_STATES_PATH = ${JSON.stringify(statesPath)};

export interface StateLabel { name: string; x: number; y: number }
export const NIGERIA_STATE_LABELS: StateLabel[] = ${JSON.stringify(stateLabels, null, 2)};

// Each ring is [lon, lat][]. Used for runtime point-in-polygon tests so we can
// filter facilities whose coords fall outside Nigeria's actual borders (vs. its
// bounding box). Pre-rounded to ~110m precision to keep the bundle small.
const NIGERIA_RINGS: [number, number][][] = ${JSON.stringify(nigeriaRings)};

// Standard ray-casting point-in-polygon. Returns true iff (lon, lat) lies inside
// any outer ring. Holes are rare for country boundaries; if Nigeria ever gets
// holes from the source data, this would need an even-odd refinement.
export function isInsideNigeria(lon: number, lat: number): boolean {
  for (const ring of NIGERIA_RINGS) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const intersect =
        (yi > lat) !== (yj > lat) &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi;
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

export function projectLonLat(lon: number, lat: number): [number, number] {
  const W = ${W};
  const H = ${H};
  const { minLon, maxLon, minLat, maxLat } = NIGERIA_BBOX;
  const x = ((lon - minLon) / (maxLon - minLon)) * W;
  const y = H - ((lat - minLat) / (maxLat - minLat)) * H;
  return [x, y];
}
`;

const outPath = path.resolve(__dirname, '..', 'src', 'lib', 'nigeria-svg.ts');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);
console.log(`✅ Wrote ${outPath}`);
console.log(`   outline ${outlinePath.length} chars, states ${statesPath.length} chars, ${stateLabels.length} labels`);
