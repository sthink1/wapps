'use strict';
// Stage 6A — controlled TNNA credential revocation with guaranteed transaction rollback.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const { revokeAll } = require('../services/browserSession');
const { verifyAccessToken } = require('../services/verifyAccessToken');
const USER_ID = 62;
const EXPECTED_USER = 'charter';
const DB_NAME = 'sql5838929';

async function run() {
  assert.equal(process.env.DB_NAME, DB_NAME, 'STOP: .env.test must select sql5838929');
  assert.notEqual(process.env.NODE_ENV, 'production', 'STOP: production environment prohibited');
  assert(process.env.JWT_SECRET, 'JWT_SECRET missing');
  assert(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD, 'Test DB credentials missing');
  const pool = mysql.createPool({
    host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: DB_NAME, timezone: 'Z', waitForConnections: true, connectionLimit: 1
  });
  let c, inTransaction = false;
  try {
    c = await pool.getConnection();
    const [[database]] = await c.query('SELECT DATABASE() AS db');
    assert.equal(database.db, DB_NAME);
    const [engineRows] = await c.query("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('UsersT','UserSecurityT','TNNAUserT','TNNARefreshTokenT','WebSessionT')");
    for (const name of ['UsersT','UserSecurityT','TNNAUserT','TNNARefreshTokenT','WebSessionT']) {
      const table = engineRows.find(r => r.TABLE_NAME === name);
      assert(table && String(table.ENGINE).toUpperCase() === 'INNODB', `${name} must be InnoDB`);
    }
    const [accounts] = await c.query('SELECT UserID, UserName FROM UsersT WHERE UserID=?', [USER_ID]);
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].UserName.toLowerCase(), EXPECTED_USER);
    const [sec] = await c.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=?', [USER_ID]);
    assert.equal(sec.length, 1);
    const originalVersion = Number(sec[0].SecurityVersion);
    assert(Number.isSafeInteger(originalVersion) && originalVersion > 0);
    const [tnnaUsers] = await c.query('SELECT UserID FROM TNNAUserT WHERE UserID=?', [USER_ID]);
    assert.equal(tnnaUsers.length, 0, 'STOP: charter already has a TNNAUserT association; test intentionally does not modify it');
    const [priorTokens] = await c.query('SELECT RefreshTokenID FROM TNNARefreshTokenT WHERE UserID=?', [USER_ID]);
    assert.equal(priorTokens.length, 0, 'STOP: charter already has TNNA refresh records');
    console.log('PASS preflight: test database, InnoDB tables, charter-only isolation verified.');

    await c.beginTransaction();
    inTransaction = true;
    // Synthetic association exists only inside this transaction; no phone registration.
    await c.query('INSERT INTO TNNAUserT (UserID,UpdateEmailOptIn,FirstRegisteredAt,LastSeenAt) VALUES (?,0,UTC_TIMESTAMP(),UTC_TIMESTAMP())', [USER_ID]);
    const refreshSecret = crypto.randomBytes(48).toString('hex');
    const hash = crypto.createHash('sha256').update(refreshSecret, 'utf8').digest('hex');
    const [ins] = await c.query('INSERT INTO TNNARefreshTokenT (UserID,DeviceID,TokenHash,ExpiresAt,CreatedAt,LastUsedAt,RevokedAt) VALUES (?,NULL,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 30 DAY),UTC_TIMESTAMP(),UTC_TIMESTAMP(),NULL)', [USER_ID,hash]);
    const syntheticTokenID = ins.insertId;
    const accessToken = jwt.sign({userId:USER_ID,username:EXPECTED_USER,client:'tnna',securityVersion:originalVersion},process.env.JWT_SECRET,{expiresIn:'8h',algorithm:'HS256'});
    async function refreshLookup() {
      // Same eligibility WHERE / JOIN used by POST /tnna/refresh; no token rotation performed.
      const [tokens] = await c.query(`SELECT r.RefreshTokenID FROM TNNARefreshTokenT r
        JOIN UsersT u ON u.UserID=r.UserID
        JOIN TNNAUserT t ON t.UserID=r.UserID
        WHERE r.TokenHash=? AND r.RevokedAt IS NULL AND r.ExpiresAt>NOW()
        LIMIT 1 FOR UPDATE`,[hash]);
      return tokens;
    }
    const priorClaims = await verifyAccessToken(accessToken,{database:c,jwtSecret:process.env.JWT_SECRET});
    assert.equal(priorClaims.userId,USER_ID);
    assert.equal((await refreshLookup()).length,1);
    console.log('PASS before revocation: synthetic TNNA JWT accepted and refresh token eligible.');

    await revokeAll(c,USER_ID); // Exact app function used by change/reset password.
    const [[revoked]] = await c.query('SELECT RevokedAt FROM TNNARefreshTokenT WHERE RefreshTokenID=?',[syntheticTokenID]);
    assert(revoked.RevokedAt !== null,'Refresh token not revoked');
    const [[updatedSecurity]] = await c.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=?',[USER_ID]);
    assert.equal(Number(updatedSecurity.SecurityVersion),originalVersion+1);
    assert.equal((await refreshLookup()).length,0,'Refresh token still eligible');
    await assert.rejects(verifyAccessToken(accessToken,{database:c,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='ACCOUNT_CREDENTIALS_REVOKED');
    console.log('PASS after revokeAll: TNNA refresh rejected; existing JWT rejected due to SecurityVersion change.');

    await c.rollback();
    inTransaction=false;
    const [[restored]] = await c.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=?',[USER_ID]);
    assert.equal(Number(restored.SecurityVersion),originalVersion,'SecurityVersion did not restore');
    const [rolledUser] = await c.query('SELECT UserID FROM TNNAUserT WHERE UserID=?',[USER_ID]);
    assert.equal(rolledUser.length,0,'Synthetic TNNAUserT record not rolled back');
    const [rolledToken] = await c.query('SELECT RefreshTokenID FROM TNNARefreshTokenT WHERE UserID=?',[USER_ID]);
    assert.equal(rolledToken.length,0,'Synthetic refresh token not rolled back');
    console.log('PASS rollback: charter SecurityVersion restored; synthetic association and refresh token absent.');
    console.log('PASS isolation: no password updates, commits, live devices, or production access.');
    console.log('LIMITATION: tests real revokeAll and the refresh-eligibility SQL; does not send HTTP requests or change a real password.');
  } finally {
    if(c) {
      try { if(inTransaction) await c.rollback(); } finally {c.release();}
    }
    await pool.end();
  }
}
run().catch(e=>{console.error('TEST FAILED:',e.message);process.exitCode=1;});
