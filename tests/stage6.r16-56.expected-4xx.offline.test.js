'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const SECRET = 'SYNTHETIC_INTERNAL_DETAILS_R16_56';
const { markExpectedClientError: mark, isExpectedClientError: isMarked } = require('../services/stage6ExpectedClientError');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

function extractFunction(text, name) {
  const start = text.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing function ${name}`);
  const brace = text.indexOf('{', start);
  assert.ok(brace > start);
  let depth = 0;
  for (let i = brace; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(text.slice(Math.max(0,start-6),start) === 'async ' ? start-6 : start, i + 1);
  }
  throw new Error('Unclosed function ' + name);
}
function loadFunction(filename, name, inject = {}) {
  return vm.runInNewContext('(' + extractFunction(read(filename), name) + ')', inject);
}
function mockRes() { return { statusCode:200, body:null, status(n){this.statusCode=n;return this;},json(o){this.body=o;return this;} }; }
function err(message, status, expected = false) {
  const error = Object.assign(new Error(message), {status});
  return expected ? mark(error) : error;
}
const ft = loadFunction('routes/familyTree.js','safeFamilyTreeErrorMessage',{isExpectedClientError:isMarked});
const ftDetail = loadFunction('routes/familyTree.js','safeFamilyTreeErrorDetail',{isExpectedClientError:isMarked});
const notify = loadFunction('routes/notifications.js','sendSafeNotificationError',{isExpectedClientError:isMarked});

function notifyResult(error) { const res=mockRes();notify(res,error);return res; }
async function subscriptionPromoResult(error) {
  const routes=[];
  const router={use(){},get:(route,...handlers)=>routes.push({method:'GET',route,handlers}),post:(route,...handlers)=>routes.push({method:'POST',route,handlers}),put(){},delete(){}};
  const noop=()=>{};
  const sandbox={ module:{exports:{}}, exports:{}, require(spec) {
    if(spec==='express')return {Router:()=>router};
    if(spec==='../middleware/subscriptionAccess')return {authenticateToken:noop,isAdminUser:noop};
    if(spec==='../services/stage6ExpectedClientError')return {isExpectedClientError:isMarked};
    if(spec==='../services/subscriptionService')return {redeemPromoCode:async()=>{throw error}};
    throw new Error('unexpected require '+spec);
  }};
  vm.runInNewContext(read('routes/subscriptions.js'),sandbox,{filename:'subscriptions.js'});
  const route=routes.find(r=>r.method==='POST'&&r.route==='/promo');
  assert.ok(route);
  const res=mockRes();let delegated=null;
  await route.handlers[0]({user:{userId:9},body:{code:'synthetic'}},res,e=>{delegated=e});
  return {res,delegated};
}

test('R16-56A Family Tree: deliberate application 400/403/404/409 messages remain visible',()=>{
  for(const status of [400,403,404,409])assert.equal(ft(err('Expected validation message.',status,true)),'Expected validation message.');
});
test('R16-56B Family Tree: unexpected 4xx messages sanitized',()=>{
  for(const status of [400,403,404,409])assert.equal(ft(err(SECRET,status)),'Internal Server Error');
});
test('R16-56C Family Tree: 500 and 503 messages sanitized even when marked',()=>{
  for(const status of [500,503])assert.equal(ft(err(SECRET,status,true)),'Internal Server Error');
});
test('R16-56D Family Tree: review and responseCode details require marked expected errors',()=>{
  const raw=err(SECRET,409);raw.responseCode=SECRET;raw.review={marker:SECRET};
  assert.equal(ftDetail(raw,'responseCode'),undefined);
  assert.equal(ftDetail(raw,'review'),undefined);
  mark(raw);assert.equal(ftDetail(raw,'responseCode'),SECRET);
});
test('R16-56E Family Tree: requireTree missing-code exception marked at creation',async()=>{
  const fn=loadFunction('routes/familyTree.js','requireTree',{markExpectedClientError:mark});
  let actual;try{await fn({},'',1)}catch(e){actual=e}
  assert.ok(actual);assert.equal(actual.status,400);assert.equal(isMarked(actual),true);
  assert.equal(ft(actual),'FamilyTreeCode is required.');
});
test('R16-56F Family Tree: all explicit 4xx status assignments are marked',()=>{
  const s=read('routes/familyTree.js');
  const assigns=[...s.matchAll(/\b(err|error|e)\.status\s*=\s*4\d\d\s*;/g)];
  assert.ok(assigns.length>=70);
  for(const m of assigns){const after=s.slice(m.index+m[0].length,m.index+m[0].length+75);assert.match(after,new RegExp('^\\s*markExpectedClientError\\('+m[1]+'\\)\\s*;'));}
});
test('R16-56G Family Tree: Favorite Pets errors marked at creation',()=>{
  const s=read('routes/familyTree.js');
  const lines=s.split('\n').filter(x=>/Object\.assign\(new Error/.test(x)&&/status:\s*4\d\d/.test(x));
  assert.ok(lines.length>=9);
  assert.ok(lines.every(x=>x.includes('markExpectedClientError(Object.assign(')));
});
test('R16-56H Notifications: expected unsubscribe 404 remains visible',()=>{
  const res=notifyResult(err('This unsubscribe link is not valid.',404,true));
  assert.equal(res.statusCode,404);assert.equal(res.body.message,'This unsubscribe link is not valid.');
});
test('R16-56I Notifications: unexpected 400/404 details are hidden',()=>{
  for(const status of [400,404]){const res=notifyResult(err(SECRET,status));assert.equal(res.statusCode,status);assert.equal(res.body.message,'Request failed');}
});
test('R16-56J Notifications: unexpected 500/503 details are hidden',()=>{
  for(const status of [500,503]){const res=notifyResult(err(SECRET,status));assert.equal(res.statusCode,status);assert.equal(res.body.message,'Internal Server Error');}
});
test('R16-56K Notifications: unsubscribe service marks its deliberate 404 error',()=>{
  const s=read('services/notificationService.js');
  assert.match(s,/new Error\('This unsubscribe link is not valid\.'\);\s*err\.status\s*=\s*404;\s*markExpectedClientError\(err\);/);
});
test('R16-56L Subscriptions: expected 400 and 404 are returned',async()=>{
  for(const status of [400,404]){const x=await subscriptionPromoResult(err('Expected validation message.',status,true));assert.equal(x.delegated,null);assert.equal(x.res.statusCode,status);assert.equal(x.res.body.error,'Expected validation message.');}
});
test('R16-56M Subscriptions: unexpected 400/404/500 delegated, no raw response',async()=>{
  for(const status of [400,404,500]){const e=err(SECRET,status);const x=await subscriptionPromoResult(e);assert.ok(x.delegated);assert.equal(x.res.body,null);if(status<500){assert.notEqual(x.delegated,e);assert.equal(x.delegated.message,'Request failed');assert.equal(x.delegated.status,status);}else{assert.equal(x.delegated,e);}}
});
test('R16-56N Subscription service: actual missing-code validation error is marked',async()=>{
  const sandbox={module:{exports:{}},exports:{},require(spec){
    if(spec==='./stage6ExpectedClientError')return {markExpectedClientError:mark};
    if(spec==='../dbConnection')return {pool:{getConnection:()=>{throw new Error('Database unexpectedly used in an offline test')}}};
    throw new Error('Unexpected import '+spec);
  }};
  vm.runInNewContext(read('services/subscriptionService.js'),sandbox,{filename:'subscriptionService.js'});
  await assert.rejects(sandbox.module.exports.redeemPromoCode(1,''),e=>{
    assert.equal(e.status,400);assert.equal(isMarked(e),true);assert.equal(e.message,'Please enter a promotional code.');return true;
  });
});
test('R16-56O Shared marker does not trust numeric status or matching public message',()=>{
  const fake=err('This unsubscribe link is not valid.',404);
  assert.equal(isMarked(fake),false);
  assert.equal(mark(fake),fake);assert.equal(isMarked(fake),true);
});
