'use strict';
// MySQL 5.5 live integration test for Safeguard 4.
// NO application HTTP routes or email functions are called.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const limiter = require('../services/passwordResetLimiter');

if (process.env.DB_NAME !== 'sql5838929' || process.env.NODE_ENV === 'production') {
  throw Error('STOP: Only DB_NAME=sql5838929 in a NON-production environment is allowed.');
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.JWT_SECRET) {
  throw Error('Missing test database connection or JWT_SECRET configuration.');
}

const nonce = crypto.randomBytes(12).toString('hex');
const keysCreated = new Set();
const newPool = () => mysql.createPool({
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER, password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, charset: 'utf8mb4', timezone: 'Z',
  connectionLimit: 5, waitForConnections: true, queueLimit: 0
});
let pool = null;
let secondPool = null;

async function consume(activePool, email, ip) {
  const c = await activePool.getConnection();
  let open = false;
  try {
    await c.query("SET time_zone = '+00:00'");
    await c.beginTransaction(); open = true;
    // Record keys that THIS test attempts to create; exact-key cleanup only.
    const db = {query: async (sql, args) => {
      if (sql.startsWith('INSERT INTO PasswordResetRateT')) keysCreated.add(args[0]);
      return c.query(sql, args);
    }};
    const allowed = await limiter.allow(db, email, ip);
    await c.commit(); open = false;
    return allowed;
  } catch (err) {
    if (open) try { await c.rollback(); } catch (_) {}
    throw err;
  } finally { c.release(); }
}

async function getCountsFor(keys, activePool) {
  const totals = new Map();
  for (const key of keys) {
    const [[row]] = await activePool.query('SELECT AttemptCount FROM PasswordResetRateT WHERE KeyHash = ?', [key]);
    totals.set(key, row ? Number(row.AttemptCount) : null);
  }
  return totals;
}

async function main() {
  pool = newPool();
  const [[db]] = await pool.query('SELECT DATABASE() AS db');
  assert.equal(db.db, 'sql5838929');
  const [[table]] = await pool.query("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='PasswordResetRateT'");
  assert(table && String(table.ENGINE).toUpperCase() === 'INNODB', 'PasswordResetRateT must be InnoDB');
  console.log('PASS preflight: sql5838929 and PasswordResetRateT/InnoDB confirmed.');

  // Test 1 — five requests allowed per email, sixth blocked.
  const emailA = `stage6a-${nonce}-email@example.invalid`;
  const ipA = `192.0.2.${(parseInt(nonce.slice(0, 2),16) % 200) + 1}-${nonce}`;
  for (let i=1; i<=5; i++) assert.equal(await consume(pool,emailA,ipA),true,`email request ${i}`);
  assert.equal(await consume(pool,emailA,ipA),false,'sixth email request');
  console.log('PASS live email limit: five allowed, sixth blocked.');

  // Test 2 — twenty per-IP requests, then block. Unique email per request.
  const ipB = `198.51.100.11-${nonce}`;
  for(let i=1;i<=20;i++) {
    assert.equal(await consume(pool,`stage6a-${nonce}-ip-${i}@example.invalid`,ipB),true,`IP request ${i}`);
  }
  assert.equal(await consume(pool,`stage6a-${nonce}-ip-21@example.invalid`,ipB),false,'21st IP request');
  console.log('PASS live IP limit: twenty allowed, twenty-first blocked.');

  // Test 3 — independent connections contest the SAME email counter.
  const emailC = `stage6a-${nonce}-concurrent@example.invalid`;
  const count = 10;
  const results = await Promise.all(Array.from({length:count},(_,i)=>
    consume(pool,emailC,`203.0.113.${i+1}-${nonce}`)));
  assert.equal(results.filter(Boolean).length,5,'exactly 5 concurrent requests must be allowed');
  assert.equal(results.filter(x=>!x).length,5,'exactly 5 concurrent requests must be blocked');
  console.log('PASS live concurrency: 10 simultaneous requests, exactly five allowed.');

  // Test 4 — reconnect via a new pool, counters are still present.
  secondPool = newPool();
  const priorKeys = [...keysCreated];
  const priorCounts = await getCountsFor(priorKeys,secondPool);
  assert.equal(priorCounts.size,keysCreated.size);
  assert([...priorCounts.values()].every(v=>Number.isSafeInteger(v) && v>=1));
  assert.equal(await consume(secondPool,emailA,`192.0.2.254-${nonce}`),false,
    'an email already over limit must stay blocked after new pool connection');
  console.log('PASS persistence: counters remain shared across a separate MySQL connection pool.');
  console.log('PASS privacy: no email was sent and no actual account credentials were used.');
  console.log('LIMITATION: separate pools test persistence across connections, not an actual Render restart.');
}

async function cleanup(){
  // Exact hashes only, recorded from this test's INSERT attempts; never truncate a table.
  // This removes ALL keys attempted by this test, including denied attempts.
  if (!pool || keysCreated.size===0) return;
  for (const key of keysCreated) {
    await pool.query('DELETE FROM PasswordResetRateT WHERE KeyHash=?',[key]);
  }
  const remaining = await getCountsFor(keysCreated,pool);
  assert([...remaining.values()].every(v=>v===null),'Test keys remain after cleanup');
  console.log(`PASS cleanup: ${keysCreated.size} test-only counter rows removed by exact hash.`);
}

(async()=>{
  let failure=null;
  try {await main();} catch(err){failure=err;console.error('TEST FAILED:',err.message);}
  try {await cleanup();} catch(err){failure ||= err;console.error('CLEANUP FAILED:',err.message);}
  try {if(secondPool) await secondPool.end(); if(pool) await pool.end();}
  catch(err){failure ||= err; console.error('POOL CLOSE FAILED:',err.message);}
  if(failure)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
