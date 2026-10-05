import { mkdir, writeFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '..', 'public', 'data', 'us');

const SERVICE = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer';
const LAYERS = {
  consolidatedCity: 3,
  incorporatedPlace: 4,
  cdp: 5,
  countySubdivision: 1
};

// Census identifies these MCD states as general-purpose local governments that
// can perform the same governmental functions as incorporated places.
const GENERAL_PURPOSE_MCD_STATES = new Set([
  '09', // Connecticut
  '23', // Maine
  '25', // Massachusetts
  '26', // Michigan
  '27', // Minnesota
  '33', // New Hampshire
  '34', // New Jersey
  '36', // New York
  '42', // Pennsylvania
  '44', // Rhode Island
  '50', // Vermont
  '55'  // Wisconsin
]);

const STATES = [
  ['01','AL','Alabama'],['02','AK','Alaska'],['04','AZ','Arizona'],['05','AR','Arkansas'],
  ['06','CA','California'],['08','CO','Colorado'],['09','CT','Connecticut'],['10','DE','Delaware'],
  ['11','DC','District of Columbia'],['12','FL','Florida'],['13','GA','Georgia'],['15','HI','Hawaii'],
  ['16','ID','Idaho'],['17','IL','Illinois'],['18','IN','Indiana'],['19','IA','Iowa'],
  ['20','KS','Kansas'],['21','KY','Kentucky'],['22','LA','Louisiana'],['23','ME','Maine'],
  ['24','MD','Maryland'],['25','MA','Massachusetts'],['26','MI','Michigan'],['27','MN','Minnesota'],
  ['28','MS','Mississippi'],['29','MO','Missouri'],['30','MT','Montana'],['31','NE','Nebraska'],
  ['32','NV','Nevada'],['33','NH','New Hampshire'],['34','NJ','New Jersey'],['35','NM','New Mexico'],
  ['36','NY','New York'],['37','NC','North Carolina'],['38','ND','North Dakota'],['39','OH','Ohio'],
  ['40','OK','Oklahoma'],['41','OR','Oregon'],['42','PA','Pennsylvania'],['44','RI','Rhode Island'],
  ['45','SC','South Carolina'],['46','SD','South Dakota'],['47','TN','Tennessee'],['48','TX','Texas'],
  ['49','UT','Utah'],['50','VT','Vermont'],['51','VA','Virginia'],['53','WA','Washington'],
  ['54','WV','West Virginia'],['55','WI','Wisconsin'],['56','WY','Wyoming']
];

const OUT_FIELDS = 'BASENAME,NAME,GEOID,STATE,INTPTLAT,INTPTLON,FUNCSTAT,LSADC';
const OFFSET_DEGREES = '0.00002'; // roughly 2 meters at the equator; GPS error is normally larger.

async function fetchLayer(layerId, stateFips) {
  const params = new URLSearchParams({
    where: `STATE='${stateFips}'`,
    outFields: OUT_FIELDS,
    returnGeometry: 'true',
    outSR: '4326',
    geometryPrecision: '5',
    maxAllowableOffset: OFFSET_DEGREES,
    f: 'geojson'
  });

  const url = `${SERVICE}/${layerId}/query?${params.toString()}`;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'WonderfulApps-TNNA-boundary-builder/1.0' }
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      if (!Array.isArray(data.features)) throw new Error('Response did not contain GeoJSON features.');
      return data.features;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
    }
  }
  throw new Error(`Census TIGERweb request failed for layer ${layerId}, state ${stateFips}: ${lastError}`);
}

function round(value) {
  return Number(Number(value).toFixed(5));
}

function normalizeRing(ring) {
  return ring.map(([lon, lat]) => [round(lon), round(lat)]);
}

function normalizeGeometry(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates.map(normalizeRing)];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((p) => p.map(normalizeRing));
  return [];
}

function bboxForPolygons(polygons) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        minLat = Math.min(minLat, lat);
        maxLon = Math.max(maxLon, lon);
        maxLat = Math.max(maxLat, lat);
      }
    }
  }
  return [round(minLon), round(minLat), round(maxLon), round(maxLat)];
}

function unionBbox(boxes) {
  if (!boxes.length) return null;
  return [
    Math.min(...boxes.map((b) => b[0])),
    Math.min(...boxes.map((b) => b[1])),
    Math.max(...boxes.map((b) => b[2])),
    Math.max(...boxes.map((b) => b[3]))
  ].map(round);
}

function isActiveGovernment(funcstat) {
  return ['A', 'B', 'C', 'G'].includes(String(funcstat || '').toUpperCase());
}

function isWashingtonDc(props, kind) {
  return kind === 'incorporated_place' &&
    String(props.STATE || '') === '11' &&
    String(props.GEOID || '') === '1150000';
}

function convertFeatures(rawFeatures, kind, priority) {
  return rawFeatures.map((feature) => {
    const props = feature.properties || {};
    if (kind !== 'cdp' && !isActiveGovernment(props.FUNCSTAT) && !isWashingtonDc(props, kind)) return null;
    if (kind === 'cdp' && String(props.FUNCSTAT || '').toUpperCase() !== 'S') return null;

    const polygons = normalizeGeometry(feature.geometry);
    if (!polygons.length) return null;

    const name = String(props.BASENAME || props.NAME || '').trim();
    if (!name) return null;

    return {
      name,
      geoid: String(props.GEOID || ''),
      kind,
      priority,
      bbox: bboxForPolygons(polygons),
      polygons
    };
  }).filter(Boolean);
}

function dedupe(features) {
  const seen = new Set();
  return features.filter((feature) => {
    const key = `${feature.kind}|${feature.geoid}|${feature.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildState([fips, abbr, stateName]) {
  process.stdout.write(`${abbr}: downloading places... `);

  const [consolidatedRaw, incorporatedRaw, cdpRaw] = await Promise.all([
    fetchLayer(LAYERS.consolidatedCity, fips),
    fetchLayer(LAYERS.incorporatedPlace, fips),
    fetchLayer(LAYERS.cdp, fips)
  ]);

  let features = [
    ...convertFeatures(incorporatedRaw, 'incorporated_place', 1),
    ...convertFeatures(consolidatedRaw, 'consolidated_city', 2)
  ];

  if (GENERAL_PURPOSE_MCD_STATES.has(fips)) {
    const mcdRaw = await fetchLayer(LAYERS.countySubdivision, fips);
    features.push(...convertFeatures(mcdRaw, 'general_purpose_mcd', 3));
  }

  features.push(...convertFeatures(cdpRaw, 'cdp', 4));
  features = dedupe(features).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));

  const bbox = unionBbox(features.map((f) => f.bbox));
  const fileName = `${fips}-${abbr}.json`;
  const payload = {
    source: 'U.S. Census Bureau TIGERweb',
    vintage: 'January 1, 2026',
    stateFips: fips,
    state: stateName,
    stateAbbreviation: abbr,
    featureOrder: ['incorporated_place', 'consolidated_city', 'general_purpose_mcd', 'cdp'],
    features
  };

  await writeFile(path.join(outputDir, fileName), JSON.stringify(payload));
  const bytes = (await stat(path.join(outputDir, fileName))).size;
  console.log(`${features.length} areas, ${(bytes / 1024 / 1024).toFixed(2)} MB`);

  return { fips, abbr, name: stateName, file: fileName, bbox, count: features.length, bytes };
}

async function main() {
  console.log('TNNA U.S. boundary builder');
  console.log('Source: U.S. Census Bureau TIGERweb, January 1, 2026 vintage');
  console.log('Coverage: incorporated places, consolidated cities, CDPs, plus general-purpose MCDs in 12 states.');
  console.log('No county boundaries are included.');
  console.log('');

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const states = [];
  for (const state of STATES) {
    states.push(await buildState(state));
  }

  const totalBytes = states.reduce((sum, state) => sum + state.bytes, 0);
  const totalFeatures = states.reduce((sum, state) => sum + state.count, 0);

  const manifest = {
    source: 'U.S. Census Bureau TIGERweb',
    vintage: 'January 1, 2026',
    generatedAt: new Date().toISOString(),
    country: 'United States',
    countiesIncluded: false,
    featureCount: totalFeatures,
    totalBytes,
    states: states.map(({ bytes, ...state }) => state)
  };

  await writeFile(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest));

  console.log('');
  console.log(`Complete: ${totalFeatures} named areas in ${(totalBytes / 1024 / 1024).toFixed(2)} MB of JSON.`);
  console.log(`Output: ${outputDir}`);
  console.log('Next: npx cap sync android');
}

main().catch((error) => {
  console.error('\nBoundary build failed.');
  console.error(error);
  process.exitCode = 1;
});
