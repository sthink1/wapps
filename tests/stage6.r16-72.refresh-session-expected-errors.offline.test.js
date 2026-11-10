'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const {markExpectedClientError: mark, isExpectedClientError: isExpected} = require('../services/stage6ExpectedClientError');
const PUBLIC_ORIGIN = 'https://r16-72.example.test';

// Evaluate the actual browserSession.js in a sandbox so module loading cannot
// access the production environment or database. No server or network calls.
const sessionSandbox = {
  module: {exports:{}}, exports: {}, process: {env: {JWT_SECRET: 'offline-test-only'}},
  Date, Buffer, console,
  require(spec) {
    if (spec === './stage6Environment') return {current:{publicOrigin:PUBLIC_ORIGIN,secureCookie:false}};
    if (spec === './stage6ExpectedClientError') return {markExpectedClientError:mark};
    if (spec === './credentialFence') return {lock:async()=>1};
    if (spec === 'crypto') return require('node:crypto');
    if (spec === 'jsonwebtoken') return {sign:()=> 'synthetic-jwt'};
    throw Error('Unexpected browserSession import: '+spec);
  }
};
vm.runInNewContext(read('services/browserSession.js'),sessionSandbox,{filename:'browserSession.js'});
const sessions = sessionSandbox.module.exports;

// Evaluate only the committed refresh-session catch body with the real shared
// expected-error classifier, avoiding module startup, DB and HTTP side effects.
const routeText = read('routes/users.js');
const routeStart = routeText.indexOf("router.post('/refresh-session'");
const catchStart = routeText.indexOf('  catch(e){',routeStart);
const catchEnd = routeText.indexOf('\n  }\n});',catchStart);
assert.ok(routeStart>=0&&catchStart>=0&&catchEnd>=0,'Refresh-session catch block must exist');
const catchBody=routeText.slice(catchStart+'  catch(e){'.length,catchEnd);
const handle=vm.runInNewContext('(function(e,res){'+catchBody+'\n})',{isExpectedClientError:isExpected});
function respond(error){const x={};const res={status(n){x.status=n;return this;},json(j){x.body=j;return this;}};handle(error,res);if(x.body)x.body=JSON.parse(JSON.stringify(x.body));return x;}
function fake(status,msg,marked=false){const e=Object.assign(new Error(msg),{status});return marked?mark(e):e;}

// Each test checks source-under-test behavior, not a separately rewritten handler.
test('R16-72A Origin absent: deliberate 403 retains ORIGIN_REQUIRED',()=>{
  let e; try {sessions.requireOrigin({get:()=>undefined})}catch(x){e=x}
  assert.ok(e);assert.ok(isExpected(e));assert.deepEqual(respond(e),{status:403,body:{error:'ORIGIN_REQUIRED'}});
});
test('R16-72B Origin mismatch: deliberate 403 retains ORIGIN_NOT_ALLOWED',()=>{
  let e;try{sessions.requireOrigin({get:()=> 'https://wrong.test'})}catch(x){e=x}
  assert.ok(e);assert.ok(isExpected(e));assert.deepEqual(respond(e),{status:403,body:{error:'ORIGIN_NOT_ALLOWED'}});
});
test('R16-72C Approved origin passes',()=>{
  assert.doesNotThrow(()=>sessions.requireOrigin({get:()=>PUBLIC_ORIGIN}));
});
test('R16-72D Invalid refresh secret: deliberate 401 retains REFRESH_INVALID',async()=>{
  let e;try{await sessions.rotate({getConnection(){throw Error('database must not be accessed')}},null)}catch(x){e=x}
  assert.ok(e);assert.ok(isExpected(e));assert.deepEqual(respond(e),{status:401,body:{error:'REFRESH_INVALID'}});
});
test('R16-72E Unknown refresh secret: deliberate 401 retained; connection released',async()=>{
  let released=0;
  const pool={getConnection:async()=>({query:async()=>[[]],release(){released++},rollback:async()=>{}})};
  let e;try{await sessions.rotate(pool,'a'.repeat(96))}catch(x){e=x}
  assert.ok(e);assert.ok(isExpected(e));assert.deepEqual(respond(e),{status:401,body:{error:'REFRESH_INVALID'}});
  assert.equal(released,1);
});
test('R16-72F All intentional refresh 401 creation points are marked',()=>{
  const s=read('services/browserSession.js');
  const lines=s.split('\n').filter(line=>line.includes("Error('REFRESH_INVALID')"));
  assert.equal(lines.length,4);
  assert.ok(lines.every(line=>line.includes('throw markExpectedClientError(e)')));
});
test('R16-72G Unexpected unmarked 400,401,403,404,409 sanitized with same status',()=>{
  for(const status of [400,401,403,404,409]){
    const result=respond(fake(status,'R16-72-INTERNAL-DETAIL'));
    assert.deepEqual(result,{status,body:{error:'AUTH_SERVICE_UNAVAILABLE'}});
  }
});
test('R16-72H Unexpected unmarked 500,503 retain safe existing 5xx contract',()=>{
  for(const status of [500,503])assert.deepEqual(respond(fake(status,'R16-72-INTERNAL-DETAIL')),{status,body:{error:'AUTH_SERVICE_UNAVAILABLE'}});
});
test('R16-72I Invalid status defaults to 503 and sanitized body',()=>{
  assert.deepEqual(respond(new Error('R16-72-INTERNAL-DETAIL')),{status:503,body:{error:'AUTH_SERVICE_UNAVAILABLE'}});
});
test('R16-72J Marked 5xx still sanitized and deliberate marked 4xx preserved',()=>{
  for(const status of [500,503])assert.deepEqual(respond(fake(status,'R16-72-INTERNAL-DETAIL',true)),{status,body:{error:'AUTH_SERVICE_UNAVAILABLE'}});
  for(const status of [400,403,404,409])assert.deepEqual(respond(fake(status,'Approved test message',true)),{status,body:{error:'Approved test message'}});
});
test('R16-72K Session lifetime, cookie, and transaction invariants present',()=>{
  const session=read('services/browserSession.js');
  assert.match(session,/const ACCESS_MS = 8\*60\*60\*1000;/);
  assert.match(session,/sameSite:'lax'/);
  assert.match(session,/await c\.commit\(\);return \{token:jwtToken/);
});
