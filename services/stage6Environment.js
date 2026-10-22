'use strict';
// Group 0d TEST-ONLY package. Deliberately does not support production deployment.
const TEST_DB = 'sql5838929';
const VALID_MODES = new Set(['local', 'staging']);
const LEGACY_CORS_ORIGINS = Object.freeze(['http://localhost', 'http://localhost:8080', 'https://localhost', 'capacitor://localhost', 'https://wapps.helioho.st', 'https://wapps-ypez.onrender.com']);
function config(env=process.env) {
  const mode = env.WA_ENV;
  if (!VALID_MODES.has(mode)) throw new Error('GROUP0D_WA_ENV_MUST_BE_LOCAL_OR_STAGING');
  if (env.DB_NAME !== TEST_DB) throw new Error('GROUP0D_TEST_DATABASE_ONLY');
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
  const allowedOrigins = (env.WA_ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (allowedOrigins.length !== 1 || allowedOrigins[0] !== publicOrigin) throw new Error('GROUP0D_ALLOWED_ORIGINS_MUST_EQUAL_PUBLIC_ORIGIN');
  return Object.freeze({mode, expectedDatabase: TEST_DB, publicOrigin, allowedOrigins:Object.freeze(allowedOrigins), secureCookie:mode==='staging'});
}
// Fail before user routers, pool creation, or background jobs start.
const current = config();
async function verifyDatabaseIdentity(pool) {
  const [rows] = await pool.query('SELECT DATABASE() AS DatabaseName, @@session.time_zone AS TimeZone');
  if (rows.length !== 1 || rows[0].DatabaseName !== TEST_DB || rows[0].TimeZone !== '+00:00') {
    throw new Error('GROUP0D_CONNECTED_DATABASE_OR_TIMEZONE_MISMATCH');
  }
  return rows[0];
}
module.exports={config,current,verifyDatabaseIdentity,LEGACY_CORS_ORIGINS};
