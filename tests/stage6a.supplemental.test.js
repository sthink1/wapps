'use strict';
// Read-only security regression tests. No database connection and no live HTTP requests.
const assert = require('node:assert/strict');
const Module = require('node:module');
const crypto = require('node:crypto');
const originalLoad = Module._load;
process.env.DB_NAME = 'wapps_test';
process.env.JWT_SECRET = 'supplemental-test-secret';
// Fake JWT isolates session/claims logic; NOT a signature verification test.
Module._load = function(name, parent, main) {
  if (name === 'jsonwebtoken') return {
    sign(claims, key) { assert.equal(key, process.env.JWT_SECRET); return JSON.stringify(claims); },
    verify(token, key) { assert.equal(key, process.env.JWT_SECRET); return JSON.parse(token); }
  };
  return originalLoad.apply(this, arguments);
};
const session = require('../services/browserSession');
const {verifyAccessToken, AuthenticationError} = require('../services/verifyAccessToken');
Module._load = originalLoad;

function fakeDb() {
  const state = {version:1, sessions:[], tokens:[], tnnaRevoked:false, fail:false};
  const conn = {
    async beginTransaction(){}, async commit(){}, async rollback(){}, release(){},
    async query(sql, args=[]) {
      if (state.fail) throw new Error('DB_UNAVAILABLE');
      if (sql.startsWith('SELECT SecurityVersion')) return [[{SecurityVersion:state.version}]];
      if (sql.startsWith('INSERT INTO WebSessionT')) {const id=state.sessions.length+1;state.sessions.push({id,user:args[0],sid:args[1],remembered:args[2],expires:new Date(args[3]),absolute:new Date(args[4]),revoked:false});return [{insertId:id}];}
      if (sql.startsWith('INSERT INTO WebRefreshTokenT')) {const id=state.tokens.length+1;state.tokens.push({id,sessionId:args[0],hash:args[1],parent:args[2],expires:new Date(args[3]),consumed:false,revoked:false});return [{insertId:id}];}
      if (sql.includes('FROM WebRefreshTokenT r JOIN')) {const t=state.tokens.find(t=>t.hash===args[0]);if(!t)return [[]];const s=state.sessions.find(s=>s.id===t.sessionId);return [[{WebRefreshTokenID:t.id,WebSessionID:s.id,ConsumedAt:t.consumed?new Date():null,RevokedAt:t.revoked?new Date():null,TokenExpires:t.expires,UserID:s.user,IsRemembered:s.remembered,SessionRevoked:s.revoked?new Date():null,AbsoluteExpiresAt:s.absolute,SessionExpires:s.expires,SessionPublicID:s.sid,UserName:'test',SecurityVersion:state.version}]];}
      if (sql.startsWith('UPDATE WebRefreshTokenT SET ConsumedAt')) {const t=state.tokens.find(t=>t.id===args[0]);if(t.consumed)return [{affectedRows:0}];t.consumed=true;return [{affectedRows:1}];}
      if (sql.startsWith('UPDATE WebSessionT SET ExpiresAt')) {const s=state.sessions.find(s=>s.id===args[1]);s.expires=new Date(args[0]);return [{affectedRows:1}];}
      if (sql.startsWith('UPDATE WebSessionT SET RevokedAt')) {state.sessions.filter(s=>s.user===args[0]&&(args.length<2||s.sid===args[1])).forEach(s=>s.revoked=true);return [{affectedRows:1}];}
      if (sql.startsWith('UPDATE TNNARefreshTokenT')) {state.tnnaRevoked=true;return [{affectedRows:1}];}
      if (sql.startsWith('UPDATE UserSecurityT')) {state.version++;return [{affectedRows:1}];}
      if (sql.includes('FROM WebSessionT') && sql.includes('AbsoluteExpiresAt')) return [state.sessions.filter(s=>s.user===args[0]&&s.sid===args[1]&&!s.revoked&&s.expires>args[2]&&s.absolute>args[3]).map(s=>({WebSessionID:s.id}))];
      throw Error('Unexpected simulated SQL: '+sql);
    }
  };
  return {state,conn,pool:{getConnection:async()=>conn,query:(...args)=>conn.query(...args)}};
}
async function main() {
  let pass=0;
  async function check(label, cb){await cb();pass++;console.log('PASS '+String(pass).padStart(2,'0')+' '+label);}
  await check('Expiration constants: 8 hours, 180 days, 365 days',async()=>{
    assert.equal(session.ACCESS_MS,8*3600000);assert.equal(session.SLIDE_MS,180*86400000);assert.equal(session.ABS_MS,365*86400000);
  });
  await check('Ordinary login has no refresh credential and expires after 8 hours',async()=>{
    const d=fakeDb(),start=Date.now(),a=await session.create(d.conn,{UserID:7,UserName:'test'},false);
    assert.equal(a.refresh,null);assert.equal(d.state.tokens.length,0);
    assert.ok(Math.abs(d.state.sessions[0].expires.getTime()-start-session.ACCESS_MS)<3000);
  });
  await check('Remembered session starts with sliding and absolute caps',async()=>{
    const d=fakeDb(),start=Date.now(),a=await session.create(d.conn,{UserID:7,UserName:'test'},true);
    assert.match(a.refresh.secret,/^[0-9a-f]{96}$/);assert.equal(d.state.tokens.length,1);
    assert.ok(Math.abs(d.state.sessions[0].expires.getTime()-start-session.SLIDE_MS)<3000);
    assert.ok(Math.abs(d.state.sessions[0].absolute.getTime()-start-session.ABS_MS)<3000);
  });
  await check('Refresh rotation consumes prior token; replay rejected',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},true);
    const next=await session.rotate(d.pool,a.refresh.secret);
    assert.equal(d.state.tokens[0].consumed,true);assert.equal(d.state.tokens.length,2);
    await assert.rejects(session.rotate(d.pool,a.refresh.secret),e=>e.message==='REFRESH_INVALID'&&e.status===401);
    assert.match(next.refresh.secret,/^[0-9a-f]{96}$/);
  });
  await check('Expired refresh token rejected',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},true);
    d.state.tokens[0].expires=new Date(Date.now()-1000);
    await assert.rejects(session.rotate(d.pool,a.refresh.secret),e=>e.message==='REFRESH_INVALID');
  });
  await check('Expired session rejected on refresh',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},true);
    d.state.sessions[0].expires=new Date(Date.now()-1000);
    await assert.rejects(session.rotate(d.pool,a.refresh.secret),e=>e.message==='REFRESH_INVALID');
  });
  await check('Absolute cap rejected on refresh',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},true);
    d.state.sessions[0].absolute=new Date(Date.now()-1000);
    await assert.rejects(session.rotate(d.pool,a.refresh.secret),e=>e.message==='REFRESH_INVALID');
  });
  await check('Refresh cap never exceeds absolute expiration',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},true);
    const cap=new Date(Date.now()+3*86400000);d.state.sessions[0].absolute=cap;
    const next=await session.rotate(d.pool,a.refresh.secret);
    assert.equal(next.refresh.expires.getTime(),cap.getTime());assert.equal(d.state.sessions[0].expires.getTime(),cap.getTime());
  });
  await check('Revoked session rejects existing signed-claim token',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},false);
    await session.revokeCurrent(d.pool,{userId:7,sessionPublicId:d.state.sessions[0].sid});
    await assert.rejects(verifyAccessToken(a.token,{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='SESSION_EXPIRED_OR_REVOKED');
  });
  await check('Account-wide revoke invalidates website and TNNA token versions',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},false);
    await session.revokeAll(d.conn,7);assert.equal(d.state.version,2);assert.equal(d.state.tnnaRevoked,true);
    await assert.rejects(verifyAccessToken(a.token,{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='ACCOUNT_CREDENTIALS_REVOKED');
    const oldTnna=JSON.stringify({userId:7,client:'tnna',securityVersion:1});
    await assert.rejects(verifyAccessToken(oldTnna,{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='ACCOUNT_CREDENTIALS_REVOKED');
  });
  await check('Legacy JWT without client/version rejected',async()=>{
    const d=fakeDb();
    await assert.rejects(verifyAccessToken(JSON.stringify({userId:7,username:'legacy'}),{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='TOKEN_INVALID');
  });
  await check('DB outage fails closed with 503',async()=>{
    const d=fakeDb(),a=await session.create(d.conn,{UserID:7,UserName:'test'},false);d.state.fail=true;
    await assert.rejects(verifyAccessToken(a.token,{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e instanceof AuthenticationError&&e.code==='AUTH_SERVICE_UNAVAILABLE'&&e.status===503);
  });
  await check('Malformed and missing tokens rejected',async()=>{
    const d=fakeDb();await assert.rejects(verifyAccessToken(null,{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='TOKEN_MISSING');
    await assert.rejects(verifyAccessToken('not-json',{database:d.conn,jwtSecret:process.env.JWT_SECRET}),e=>e.code==='TOKEN_INVALID_OR_EXPIRED');
  });
  await check('Origin verification denies absent and cross-site origins',async()=>{
    assert.throws(()=>session.requireOrigin({get:()=>null,protocol:'http'}),/ORIGIN_REQUIRED/);
    assert.throws(()=>session.requireOrigin({get:k=>k==='Origin'?'https://evil.example':'localhost:8080',protocol:'http'}),/ORIGIN_NOT_ALLOWED/);
    assert.doesNotThrow(()=>session.requireOrigin({get:k=>k==='Origin'?'http://localhost:8080':'localhost:8080',protocol:'http'}));
  });
  console.log(`Supplemental Stage 6A: ${pass} simulation groups passed (no live DB writes).`);
  console.log('NOT tested here: JWT cryptographic validation, real MySQL concurrency/rollback, HTTP routes, reset email flow.');
}
main().catch(e=>{console.error('FAIL',e);process.exitCode=1});
