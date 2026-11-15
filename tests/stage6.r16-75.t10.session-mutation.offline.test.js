'use strict';
// R16-75-T10: isolated, dependency-free browser-session and unsafe-request checks.
// Uses synthetic JWT-looking tokens and simulated fetch responses; no network/DB/browser.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../httpdocs/js/waPlatform.js'), 'utf8');

const token = hours => 'synthetic.' + Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000) + hours*3600})).toString('base64url') + '.test';
const CURRENT = token(1), ROTATED = token(2), EXPIRED = token(-1);
function boot({ access=CURRENT, response, locking=true }={}) {
  const calls=[];
  const store = new Map(access ? [['token',access]] : []);
  let queue=Promise.resolve();
  const root = {
    location:{origin:'http://localhost:8080'},
    localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    navigator: locking ? {locks:{request:(_n,_o,fn)=>{const job=queue.then(fn);queue=job.catch(()=>{});return job;}}}: {},
    atob:s=>Buffer.from(s,'base64').toString('binary'),
    fetch:async (p,opts)=>{calls.push({p,opts});return response(p,opts,calls.length);}
  };
  vm.runInNewContext(source,{window:root,Headers,URL,Date,Error,TypeError,Promise});
  return { WA:root.WA, calls, store };
}
const json=(body,status=200)=>Response.json(body,{status});

test('T10-A: GET 401 rotates once and retries GET with updated bearer, not old token',async()=>{
  // Use explicit request count to avoid accidental cross-endpoint behavior.
  let gets=0;
  const c=boot({response:p=>p==='/users/refresh-session'?json({token:ROTATED}):++gets===1?json({error:'EXPIRED'},401):json({ok:true})});
  const r=await c.WA.api.json('/budget/money');
  assert.equal(r.ok,true);
  assert.deepEqual(c.calls.map(x=>x.p),['/budget/money','/users/refresh-session','/budget/money']);
  assert.equal(c.calls[0].opts.headers.get('Authorization'),`Bearer ${CURRENT}`);
  assert.equal(c.calls[2].opts.headers.get('Authorization'),`Bearer ${ROTATED}`);
  assert.equal(c.store.get('token'),ROTATED);
});

test('T10-B: GET 401 refresh failure returns the original unauthorized response and does not replay GET',async()=>{
  const c=boot({response:p=>p==='/users/refresh-session'?json({error:'REFRESH_DENIED'},401):json({error:'ORIGINAL_401'},401)});
  const r=await c.WA.api.request('/budget/money');
  assert.equal(r.status,401);
  assert.deepEqual(await r.json(),{error:'ORIGINAL_401'});
  assert.deepEqual(c.calls.map(x=>x.p),['/budget/money','/users/refresh-session']);
});

test('T10-C: 403 returns its server message and code without refresh or replay',async()=>{
  const c=boot({response:()=>json({error:'FORBIDDEN',code:'ROLE_DENIED'},403)});
  await assert.rejects(c.WA.api.json('/admin-management'),err=>err.status===403&&err.message==='FORBIDDEN'&&err.code==='ROLE_DENIED');
  assert.deepEqual(c.calls.map(x=>x.p),['/admin-management']);
});

test('T10-D: 503 nested server error retains status and public message; no refresh or retry',async()=>{
  const c=boot({response:()=>json({error:{message:'Internal Server Error',code:'SERVICE_UNAVAILABLE'}},503)});
  await assert.rejects(c.WA.api.json('/budget/money'),err=>err.status===503&&err.message==='Internal Server Error'&&err.code==='SERVICE_UNAVAILABLE');
  assert.deepEqual(c.calls.map(x=>x.p),['/budget/money']);
});

test('T10-E: denied POST is submitted exactly once, does not refresh, and preserves its body',async()=>{
  const form=JSON.stringify({account:'synthetic',amount:15});
  const c=boot({response:()=>json({error:'DENIED'},401)});
  const r=await c.WA.api.request('/budget/money',{method:'POST',body:form});
  assert.equal(r.status,401);
  assert.equal(c.calls.length,1);
  assert.equal(c.calls[0].opts.body,form);
  assert.equal(c.store.get('token'),CURRENT);
});

test('T10-F: POST 503 not replayed and API error still propagated',async()=>{
  const c=boot({response:()=>json({error:{message:'Internal Server Error'}},503)});
  await assert.rejects(c.WA.api.json('/budget/money',{method:'POST',body:'{}'}),err=>err.status===503&&err.message==='Internal Server Error');
  assert.equal(c.calls.length,1);
});

test('T10-G: POST transport timeout/rejection is propagated without a retry',async()=>{
  const c=boot({response:()=>{throw new Error('synthetic network timeout');}});
  await assert.rejects(c.WA.api.request('/budget/money',{method:'POST',body:'{}'}),/synthetic network timeout/);
  assert.equal(c.calls.length,1);
});

test('T10-H: logout success sends one server revocation before removing the local token',async()=>{
  let sawToken=false;
  const c=boot({response:p=>{if(p==='/users/logout')sawToken=c.store.get('token')===CURRENT;return json({message:'ok'});}});
  const r=await c.WA.session.logout();
  assert.equal(r.serverRevoked,true);assert.equal(sawToken,true);
  assert.deepEqual(c.calls.map(x=>x.p),['/users/logout']);
  assert.equal(c.store.has('token'),false);
  assert.equal((await c.WA.session.restore()).reason,'explicit_logout');
});

test('T10-I: logout transport failure fails closed locally but reports revocation unconfirmed',async()=>{
  const c=boot({response:()=>{throw new Error('offline');}});
  const r=await c.WA.session.logout();
  assert.equal(r.serverRevoked,false);assert.ok(r.error);
  assert.equal(c.store.has('token'),false);
  assert.equal((await c.WA.session.restore()).reason,'explicit_logout');
  assert.equal(c.calls.length,1);
});

test('T10-J: expired session refresh rejection prevents sending protected GET',async()=>{
  const c=boot({access:EXPIRED,response:p=>p==='/users/refresh-session'?json({error:'REFRESH_DENIED'},401):json({ok:true})});
  await assert.rejects(c.WA.api.request('/budget/money'),err=>err.status===401);
  assert.deepEqual(c.calls.map(x=>x.p),['/users/refresh-session']);
});

test('T10-K: form-like POST payload preserved; no automatic replay after 401 (UI unsaved-state not tested)',async()=>{
  const original='draftField=unsaved%20value&amount=9';
  const c=boot({response:()=>json({error:'NOT_AUTHORIZED'},401)});
  const result=await c.WA.api.request('/budget/in',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:original});
  assert.equal(result.status,401);assert.equal(c.calls.length,1);
  assert.equal(c.calls[0].opts.body,original);
  assert.equal(c.store.get('token'),CURRENT);
});
