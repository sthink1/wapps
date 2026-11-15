'use strict';
// T08 bounded route-error compatibility checks against read-only source copies.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const {markExpectedClientError: mark, isExpectedClientError: marked} = require('../services/stage6ExpectedClientError');
const SECRET = 'SYNTHETIC_R16_75_T08_INTERNAL_SECRET';
const plain = x => JSON.parse(JSON.stringify(x));
function err(message, status, expected=false) {
  const value = Object.assign(new Error(message), {status});
  return expected ? mark(value) : value;
}
function response(){return {statusCode:200,body:null,writes:0,status(n){this.statusCode=n;return this;},json(obj){this.body=obj;this.writes++;return this;}};}
function extractFunction(source,name) {
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,`Function ${name} absent`);
  const brace=source.indexOf('{',start);let depth=0;
  for(let i=brace;i<source.length;i++) {if(source[i]==='{')depth++;else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);}
  throw Error('Unclosed function '+name);
}
function fn(file,name,bindings={}) {return vm.runInNewContext('('+extractFunction(read(file),name)+')',bindings);}
function central(){const src=read('server.js');const start=src.indexOf('// Centralized Error-Handling Middleware');const end=src.indexOf('// Do not listen or start maintenance',start);assert.ok(start>0&&end>start);const uses=[],logs=[];vm.runInNewContext(src.slice(start,end),{app:{use:f=>uses.push(f)},logger:{error:x=>logs.push(x)},isExpectedClientError:marked});assert.equal(uses.length,1);return {handler:uses[0],logs};}
function runCentral(error){const c=central(),res=response();c.handler(error,{},res,()=>{throw Error('unexpected next')});return {res,logs:c.logs};}
function loadSubscriptions(raised){const routes=[];const router={use(){},get(p,...h){routes.push({method:'GET',path:p,handlers:h});},post(p,...h){routes.push({method:'POST',path:p,handlers:h});},put(){},delete(){}};
 const req=id=>{if(id==='express')return {Router:()=>router};if(id==='../services/stage6ExpectedClientError')return {isExpectedClientError:marked};if(id==='../middleware/subscriptionAccess')return {authenticateToken:()=>{},isAdminUser:async()=>false};if(id==='../services/subscriptionService')return {redeemPromoCode:async()=>{throw raised}};throw Error('Unexpected '+id)};
 const ctx={module:{exports:{}},exports:{},require:req};vm.runInNewContext(read('routes/subscriptions.js'),ctx);return routes;
}
async function subscription(raised){const routes=loadSubscriptions(raised);const h=routes.find(x=>x.method==='POST'&&x.path==='/promo').handlers[0];const res=response();let delegated=null;await h({user:{userId:1},body:{code:'synthetic'}},res,e=>{delegated=e});return {res,delegated};}
function loadEtfMarker(){const source=read('routes/etf.js');const segment=source.slice(source.indexOf('const etfClientErrors = new WeakSet();'),source.indexOf('// Simple in-memory cache'));assert.match(segment,/function etfClientError/);return vm.runInNewContext('(()=>{'+segment+';return {etfClientError,isEtfClientError}})()');}
function loadBudgetMarker(){const source=read('routes/budget.js');const segment=source.slice(source.indexOf('function budgetExpectedError'),source.indexOf('function isoDate'));return vm.runInNewContext('(()=>{'+segment+';return {budgetExpectedError,isBudgetExpected}})()');}
const familyTree=fn('routes/familyTree.js','safeFamilyTreeErrorMessage',{isExpectedClientError:marked});
const familyDetail=fn('routes/familyTree.js','safeFamilyTreeErrorDetail',{isExpectedClientError:marked});
const privacyCreator=fn('routes/ftPrivacy.js','error',{markExpectedClientError:mark,Error});
const privacySend=fn('routes/ftPrivacy.js','sendError',{isExpectedClientError:marked,console:{error:()=>{}}});
const notifications=fn('routes/notifications.js','sendSafeNotificationError',{isExpectedClientError:marked});

test('T08-A Family Tree approved errors preserve messages and selective domain fields',()=>{
 for(const status of [400,403,404,409]){const value=err('Approved Family Tree validation.',status,true);value.responseCode='FT_REVIEW';value.review={category:'synthetic'};assert.equal(familyTree(value),'Approved Family Tree validation.');assert.equal(familyDetail(value,'responseCode'),'FT_REVIEW');assert.equal(familyDetail(value,'review').category,'synthetic');}
});
test('T08-B Family Tree unexpected errors cannot expose messages or domain fields',()=>{
 for(const status of [400,403,404,409,500,503]){const value=err(SECRET,status);value.responseCode=SECRET;value.review={message:SECRET};assert.equal(familyTree(value),'Internal Server Error');assert.equal(familyDetail(value,'responseCode'),undefined);assert.equal(familyDetail(value,'review'),undefined);}
});
test('T08-C Family Tree privacy preserves flat message and deliberate 403/404; unexpected sanitization',()=>{
 for(const status of [403,404]){const value=privacyCreator('Privacy access denied.',status);assert.equal(marked(value),true);const res=response();privacySend(res,value);assert.equal(res.statusCode,status);assert.deepEqual(plain(res.body),{message:'Privacy access denied.'});}
 for(const status of [400,403,500]){const res=response();privacySend(res,err(SECRET,status));assert.equal(res.statusCode,status);assert.deepEqual(plain(res.body),{message:'Privacy request failed.'});}
});
test('T08-D Notifications preserves message field, appropriate status and protected sanitization',()=>{
 const value=err('This unsubscribe link is not valid.',404,true);const res=response();notifications(res,value);assert.equal(res.statusCode,404);assert.deepEqual(plain(res.body),{message:'This unsubscribe link is not valid.'});
 for(const status of [400,404,500,503]){const r=response();notifications(r,err(SECRET,status));assert.equal(r.statusCode,status);assert.deepEqual(plain(r.body),{message:status>=500?'Internal Server Error':'Request failed'});}
});
test('T08-E Subscriptions approved promo errors preserve flat error and unexpected 4xx delegation sanitizes',async()=>{
 for(const status of [400,404]){const {res,delegated}=await subscription(err('Promotion rejected.',status,true));assert.equal(delegated,null);assert.equal(res.statusCode,status);assert.deepEqual(plain(res.body),{error:'Promotion rejected.'});}
 for(const status of [400,403,404]){const {res,delegated}=await subscription(err(SECRET,status));assert.equal(res.writes,0);assert.ok(delegated);assert.equal(delegated.status,status);assert.equal(delegated.message,'Request failed');const actual=runCentral(delegated);assert.equal(actual.res.statusCode,status);assert.deepEqual(plain(actual.res.body),{error:{message:'Request failed'}});}
});
test('T08-F Budget local marker remains distinct; approved error status preserved in local branch',()=>{
 const {budgetExpectedError,isBudgetExpected}=loadBudgetMarker();const value=budgetExpectedError('Date invalid(be)',400);assert.equal(isBudgetExpected(value,400),true);assert.equal(value.message,'Date invalid(be)');assert.equal(value.status,400);assert.equal(marked(value),false);
 const unexpected=Object.assign(new Error(SECRET),{status:400,budgetExpected:false});assert.equal(isBudgetExpected(unexpected,400),false);
 assert.match(read('routes/budget.js'),/if\(isBudgetExpected\(e,400\)\) return res\.status\(400\)\.json\(\{error:e\.message\}\)/);
});
test('T08-G ETF local marker retains intentional 400 and does not trust spoofed error',()=>{
 const {etfClientError,isEtfClientError}=loadEtfMarker();const expected=etfClientError('Category already exists (be)');assert.equal(isEtfClientError(expected),true);assert.equal(marked(expected),false);assert.equal(isEtfClientError(new Error(SECRET)),false);
 assert.match(read('routes/etf.js'),/if \(isEtfClientError\(err\)\)\s*\{\s*return res\.status\(400\)\.json\(\{ message: err\.message \}\)/);
});
test('T08-H Users refresh-session retains flat auth errors and safe unexpected fallback by source inspection',()=>{
 const source=read('routes/users.js');const start=source.indexOf("router.post('/refresh-session'");const end=source.indexOf("router.get('/session-status'",start);assert.ok(start>0&&end>start);const block=source.slice(start,end);
 assert.match(block,/status<500&&isExpectedClientError\(e\)&&e\.message\?e\.message:'AUTH_SERVICE_UNAVAILABLE'/);
 assert.match(block,/res\.status\(status\)\.json\(\{error:publicError\}\)/);
 assert.match(block,/sessions\.rotate\(/);
});
test('T08-I Proposed central handler keeps nested form for delegated unexpected 4xx and marked expected 4xx',()=>{
 const unexpected=runCentral(err(SECRET,403));assert.equal(unexpected.res.statusCode,403);assert.deepEqual(plain(unexpected.res.body),{error:{message:'Request failed'}});assert.ok(!JSON.stringify(unexpected.logs).includes(SECRET));
 const expected=runCentral(err('Approved request message.',403,true));assert.equal(expected.res.statusCode,403);assert.deepEqual(plain(expected.res.body),{error:{message:'Approved request message.'}});
});
