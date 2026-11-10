'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {markExpectedClientError, isExpectedClientError} = require('../services/stage6ExpectedClientError');
const source = fs.readFileSync(path.resolve(__dirname,'../routes/ftPrivacy.js'),'utf8');
const SENTINEL = 'R16-64-SYNTHETIC-INTERNAL-DETAIL';

function moduleWithDatabase(query) {
  const routes = [];
  const router = () => ({
    get(route, handler) { routes.push({method:'GET',route,handler}); },
    post(route, handler) { routes.push({method:'POST',route,handler}); }
  });
  const pool = { getConnection: async () => ({
    query: async (...args) => query(...args),
    release() {}, beginTransaction: async () => {},
    rollback: async () => {}, commit: async () => {}
  }) };
  const context = {
    module:{exports:{}}, exports:{}, crypto,
    process: {env:{}}, console:{ error(){} },
    require(spec) {
      if(spec==='express') return {Router:router};
      if(spec==='crypto') return crypto;
      if(spec==='../dbConnection') return {pool};
      if(spec==='../services/notificationService') return {sendNotification:async()=>{}};
      if(spec==='../services/stage6ExpectedClientError') return {markExpectedClientError,isExpectedClientError};
      throw new Error(`Unexpected import: ${spec}`);
    }
  };
  vm.runInNewContext(source,context,{filename:'ftPrivacy.js'});
  const route = (method,url) => {
    const result=routes.find(r=>r.method===method&&r.route===url);
    assert.ok(result,`${method} ${url} exists`);
    return result.handler;
  };
  return {context,route};
}
function response() {
  return {statusCode:200, body:null, status(n){this.statusCode=n;return this;},
    json(data){this.body=data;return this;}};
}
const noDb = () => { throw new Error('Database call was unexpected in this scenario'); };
async function call(route, req) {
  const res=response();
  await route(req,res);
  return res;
}

test('R16-64A deliberate privacy error factory marks expected client errors',()=>{
  const {context}=moduleWithDatabase(noDb);
  assert.equal(vm.runInNewContext('isExpectedClientError(error("expected",400))',context),true);
});
test('R16-64B intentional 400/403/404/409/429 messages and status preserved',()=>{
  const {context}=moduleWithDatabase(noDb);
  for(const status of [400,403,404,409,429]) {
    const r=response();
    context.error('Expected validation message.',status);
    context.sendError(r,context.error('Expected validation message.',status));
    assert.equal(r.statusCode,status);
    assert.equal(r.body.message,'Expected validation message.');
  }
});
test('R16-64C unmarked 400/403/404/409/429 messages never exposed',()=>{
  const {context}=moduleWithDatabase(noDb);
  for(const status of [400,403,404,409,429]) {
    const e=Object.assign(new Error(SENTINEL),{status});
    const r=response();context.sendError(r,e);
    assert.equal(r.statusCode,status);
    assert.equal(r.body.message,'Privacy request failed.');
    assert.ok(!JSON.stringify(r.body).includes(SENTINEL));
  }
});
test('R16-64D unexpected 500 and 503 suppressed, including marked errors',()=>{
  const {context}=moduleWithDatabase(noDb);
  for(const status of [500,503]) {
    const r=response();context.sendError(r,context.error(SENTINEL,status));
    assert.equal(r.statusCode,status);
    assert.equal(r.body.message,'Privacy request failed.');
  }
});
test('R16-64E invalid GO PRIVATE/PUBLIC action returns expected 400',async()=>{
  const {route}=moduleWithDatabase(noDb);
  const r=await call(route('POST','/request/:personID'),{params:{personID:'14'},body:{action:'WRONG'}});
  assert.equal(r.statusCode,400);
  assert.equal(r.body.message,'Choose GO PRIVATE or GO PUBLIC.');
});
test('R16-64F invalid privacy unlock key returns expected 400',async()=>{
  const {route}=moduleWithDatabase(noDb);
  const r=await call(route('POST','/unlock/:personID'),{params:{personID:'14'},user:{userId:1},body:{keyCode:'abc'}});
  assert.equal(r.statusCode,400);
  assert.match(r.body.message,/Enter your key code/);
});
test('R16-64G invalid public approval token returns expected 400',async()=>{
  const {route}=moduleWithDatabase(noDb);
  const r=await call(route('GET','/:token'),{params:{token:'bad-token'}});
  assert.equal(r.statusCode,400);
  assert.equal(r.body.message,'Invalid approval link.');
});
test('R16-64H unknown public approval token retains expected 404',async()=>{
  const {route}=moduleWithDatabase(async()=>[[]]);
  const r=await call(route('GET','/:token'),{params:{token:'a'.repeat(64)}});
  assert.equal(r.statusCode,404);
  assert.equal(r.body.message,'Approval request not found.');
});
test('R16-64I unexpected DB error with status 400 is sanitized on public route',async()=>{
  const {route}=moduleWithDatabase(async()=>{throw Object.assign(new Error(SENTINEL),{status:400})});
  const r=await call(route('GET','/:token'),{params:{token:'a'.repeat(64)}});
  assert.equal(r.statusCode,400);
  assert.equal(r.body.message,'Privacy request failed.');
});
test('R16-64J unauthorized tree preserves approved 403',async()=>{
  const {route}=moduleWithDatabase(async()=>[[]]);
  const r=await call(route('GET','/status/:personID'),{params:{personID:'14'},query:{familyTreeCode:'X'},user:{userId:42},headers:{}});
  assert.equal(r.statusCode,403);
  assert.equal(r.body.message,'You are not authorized for this Family Tree.');
});
test('R16-64K middleware has unchanged private-lock branch and redaction logic',()=>{
  assert.match(source,/PRIVATE_LOCKED/);
  assert.match(source,/function redactPerson\(/);
  assert.match(source,/FTPrivacyUnlockT/);
});
