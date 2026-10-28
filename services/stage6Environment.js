'use strict';
// Group 0d TEST-ONLY package. Deliberately does not support production deployment.
const TEST_DB = 'sql5838929';
const HELIO_TEST_DB = 'wapps_test';
const HELIO_HOST = 'johnny.heliohost.org';
const VALID_MODES = new Set(['local', 'staging']);
const LEGACY_CORS_ORIGINS = Object.freeze(['http://localhost', 'http://localhost:8080', 'https://localhost', 'capacitor://localhost', 'https://wapps.helioho.st', 'https://wapps-ypez.onrender.com']);
function config(env=process.env) {
  const mode = env.WA_ENV;
  if (!VALID_MODES.has(mode)) throw new Error('GROUP0D_WA_ENV_MUST_BE_LOCAL_OR_STAGING');
  const helioTest = env.DB_NAME === HELIO_TEST_DB;
  if (env.DB_NAME !== TEST_DB && !helioTest) throw new Error('GROUP0D_TEST_DATABASE_ONLY');
  if (helioTest && (env.DB_HOST !== HELIO_HOST || String(env.DB_PORT) !== '3306' || env.DB_USER !== 'wapps_test')) {
    throw new Error('GROUP0D_HELIO_TEST_IDENTITY_MISMATCH');
  }
  if (helioTest && env.DB_SSL !== 'required') throw new Error('GROUP0D_HELIO_TLS_REQUIRED');
  if (mode === 'staging' && env.NODE_ENV !== 'production') throw new Error('GROUP0D_STAGING_REQUIRES_NODE_ENV_PRODUCTION');
  if (mode === 'local' && env.NODE_ENV === 'production') throw new Error('GROUP0D_LOCAL_CANNOT_USE_PRODUCTION_NODE_ENV');
  const publicOrigin = String(env.APP_PUBLIC_ORIGIN || '');
  let url;
  try { url = new URL(publicOrigin); } catch (_) { throw new Error('GROUP0D_INVALID_PUBLIC_ORIGIN'); }
  if (url.origin !== publicOrigin || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('GROUP0D_PUBLIC_ORIGIN_MUST_BE_EXACT_ORIGIN');
  }
  if (mode === 'local' && publicOrigin !== 'http://localhost:8080') throw new Error('GROUP0D_LOCAL_ORIGIN_MUST_BE_LOCALHOST_8080');
  if (mode === 'staging' && (url.protocol !== 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
    throw new Error('GROUP0D_STAGING_REQUIRES_HOSTED_HTTPS_ORIGIN');
  }
  if (mode === 'staging' && publicOrigin !== 'https://wapps-stage6-test.onrender.com') throw new Error('GROUP0D_STAGING_ORIGIN_MUST_BE_STAGE6_TEST');
  if (mode === 'staging' && env.PUBLIC_BASE_URL !== publicOrigin) throw new Error('GROUP0D_STAGING_PUBLIC_BASE_URL_MISMATCH');
  if (mode === 'staging' && env.DB_NAME === HELIO_TEST_DB && Number(env.DB_CONNECTION_LIMIT) !== 5) throw new Error('GROUP0D_HELIO_STAGING_POOL_LIMIT_MUST_BE_FIVE');
  const allowedOrigins = (env.WA_ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (allowedOrigins.length !== 1 || allowedOrigins[0] !== publicOrigin) throw new Error('GROUP0D_ALLOWED_ORIGINS_MUST_EQUAL_PUBLIC_ORIGIN');
  return Object.freeze({mode, expectedDatabase: env.DB_NAME, publicOrigin, allowedOrigins:Object.freeze(allowedOrigins), secureCookie:mode==='staging'});
}
// Fail before user routers, pool creation, or background jobs start.
const current = config();
async function verifyDatabaseIdentity(pool) {
  const [rows] = await pool.query('SELECT DATABASE() AS DatabaseName, @@session.time_zone AS TimeZone');
  if (rows.length !== 1 || rows[0].DatabaseName !== current.expectedDatabase || rows[0].TimeZone !== '+00:00') {
    throw new Error('GROUP0D_CONNECTED_DATABASE_OR_TIMEZONE_MISMATCH');
  }
  return rows[0];
}
module.exports={config,current,verifyDatabaseIdentity,LEGACY_CORS_ORIGINS};
