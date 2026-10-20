'use strict';
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../services/verifyAccessToken');
const secret = 'test-only-not-a-real-secret';
const sid = 'f'.repeat(32);
const mint = data => jwt.sign(data, secret, { expiresIn: '8h' });
function db(version = 1, sessionExists = true, fails = false) {
  return { async query(sql) {
    if (fails) throw Error('database disconnected');
    if (sql.includes('UserSecurityT')) return [[{ SecurityVersion: version }]];
    return [sessionExists ? [{ WebSessionID: 1 }] : []];
  } };
}
async function throwsCode(p, code) {
  await assert.rejects(p, error => error.code === code);
}
(async () => {
  const webToken = mint({ userId: 61, username: 'test', client: 'web', sid, securityVersion: 1 });
  const nativeToken = mint({ userId: 61, username: 'test', client: 'tnna', securityVersion: 1 });
  const valid = await verifyAccessToken(webToken, { database: db(), jwtSecret: secret });
  assert.equal(valid.userId, 61);
  assert.equal(valid.sessionPublicId, sid);
  assert.equal((await verifyAccessToken(nativeToken,{database:db(),jwtSecret:secret})).client,'tnna');
  await throwsCode(verifyAccessToken(webToken,{database:db(2),jwtSecret:secret}), 'ACCOUNT_CREDENTIALS_REVOKED');
  await throwsCode(verifyAccessToken(webToken,{database:db(1,false),jwtSecret:secret}), 'SESSION_EXPIRED_OR_REVOKED');
  await throwsCode(verifyAccessToken(webToken,{database:db(1,true,true),jwtSecret:secret}), 'AUTH_SERVICE_UNAVAILABLE');
  await throwsCode(verifyAccessToken(mint({userId:61,username:'test'}),{database:db(),jwtSecret:secret}), 'TOKEN_INVALID');
  console.log('Stage 6A verifier tests passed (six cases)');
})().catch(err => { console.error(err); process.exitCode=1; });
