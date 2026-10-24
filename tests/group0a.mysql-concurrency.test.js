'use strict';
/*
 * Group 0a: test-only InnoDB credential-version row-lock verification.
 * Existing account: UserID 62, UserName charter, ONLY in sql5838929.
 * Makes one UPDATE in an uncommitted transaction, then ROLLBACK.
 * Does not insert, delete, send mail, call HTTP, or commit changes.
 * Run alone (not concurrently with other tests or a login for charter).
 */
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const fence = require('../services/credentialFence');

const DB = 'sql5838929';
const USER_ID = 62;
const USER_NAME = 'charter';
if (process.env.DB_NAME !== DB || process.env.NODE_ENV === 'production' || process.env.WA_ENV !== 'local') {
  throw Error('STOP: requires .env.test, DB_NAME=sql5838929 and WA_ENV=local');
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  throw Error('STOP: missing .env.test database credentials');
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const connectionOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: DB,
  timezone: 'Z',
  connectTimeout: 10000,
  multipleStatements: false
};

async function main() {
  let a, b;
  let txA = false, txB = false;
  let lockB = null;
  let original;
  try {
    a = await mysql.createConnection(connectionOptions);
    b = await mysql.createConnection(connectionOptions);
    for (const conn of [a, b]) {
      await conn.query("SET time_zone = '+00:00'");
      await conn.query('SET SESSION innodb_lock_wait_timeout = 8');
      const [[info]] = await conn.query('SELECT DATABASE() AS db, @@session.time_zone AS tz');
      assert.equal(info.db, DB);
      assert.equal(info.tz, '+00:00');
    }

    const [engines] = await a.query(`SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('UsersT','UserSecurityT')`);
    for (const name of ['UsersT', 'UserSecurityT']) {
      const row = engines.find(r => r.TABLE_NAME === name);
      assert(row && String(row.ENGINE).toUpperCase() === 'INNODB', `${name} must be InnoDB`);
    }
    const [users] = await a.query('SELECT UserID,UserName FROM UsersT WHERE UserID=?', [USER_ID]);
    assert.equal(users.length, 1, 'Expected a single test account');
    assert.equal(String(users[0].UserName).toLowerCase(), USER_NAME);
    const [security] = await a.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=?', [USER_ID]);
    assert.equal(security.length, 1, 'Test account security row missing');
    original = Number(security[0].SecurityVersion);
    assert(Number.isSafeInteger(original) && original > 0 && original < 2147483647);
    console.log('PASS preflight: test DB, UTC, InnoDB and charter security row verified.');

    await a.beginTransaction(); txA = true;
    const held = await fence.lock(a, USER_ID);
    assert.equal(held, original);
    await a.query('UPDATE UserSecurityT SET SecurityVersion=SecurityVersion+1 WHERE UserID=?', [USER_ID]);
    const [[uncommitted]] = await a.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=?', [USER_ID]);
    assert.equal(Number(uncommitted.SecurityVersion), original + 1);
    assert.equal(fence.matches(original, original + 1), false, 'Stale challenge must be rejected');
    console.log('PASS stale credential-version challenge rejected after simulated password change.');

    await b.beginTransaction(); txB = true;
    let settled = false;
    let lockError;
    lockB = fence.lock(b, USER_ID).then(value => { settled = true; return value; }, err => { settled = true; lockError = err; throw err; });
    await delay(350);
    assert(!settled, `Second connection did not wait for account lock: ${lockError?.message || ''}`);
    console.log('PASS concurrent credential issuance waits for the account security lock.');

    await a.rollback(); txA = false;
    const observed = await lockB;
    assert.equal(observed, original, 'Second connection must see the original committed version');
    assert.equal(fence.matches(original, observed), true);
    console.log('PASS queued credential issuance resumes after rollback and observes committed version.');

    await b.rollback(); txB = false;
    const [[final]] = await a.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=?', [USER_ID]);
    assert.equal(Number(final.SecurityVersion), original);
    console.log('PASS original SecurityVersion restored; no test changes committed.');
    console.log('LIMITATION: tests database row-lock serialization and challenge matcher, not concurrent real HTTP endpoint behavior.');
  } finally {
    // Release A first to unblock B if an assertion fails while B waits.
    if (txA && a) { try { await a.rollback(); } catch (_) {} }
    if (lockB) { try { await lockB; } catch (_) {} }
    if (txB && b) { try { await b.rollback(); } catch (_) {} }
    if (a) { try { await a.end(); } catch (_) {} }
    if (b) { try { await b.end(); } catch (_) {} }
  }
}
main().catch(error => { console.error('TEST FAILED:', error.message); process.exitCode = 1; });
