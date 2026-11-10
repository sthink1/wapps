'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../routes/track.js'), 'utf8');
const begin = source.indexOf('async function loadCurrentPlans()');
const end = source.indexOf('\nasync function loadAppUsage(', begin);
assert.ok(begin >= 0 && end > begin, 'Cannot isolate loadCurrentPlans()');
const functionSource = source.slice(begin, end);
const marker = 'R16-69-SYNTHETIC_INTERNAL_DETAIL';

function fixture({db = 'ok', resend = 'ok', r2 = 'ok'} = {}) {
  const plan = {currentPlan:'Test', planType:'Test', currentCost:'$0', billing:'Test',
    nextPaidPlan:'Test', nextPaidCost:'$0', nextPaidLimit:'Test'};
  const limits = new Proxy({}, {get:()=>1000});
  const ctx = {
    CURRENT_PLAN_LIMITS: limits,
    PLAN_DETAILS: new Proxy({}, {get:()=>plan}),
    PRICING_REVIEWED: 'TEST',
    buildNumericPlanRow: ({id,resource,currentValue,note})=>({id,resource,status:'ok',currentValue,note}),
    buildProviderPlanRow: ({id,resource,status='provider',note})=>({id,resource,status,currentValue:null,note}),
    loadDatabaseSizeBytes: async()=>{if(db==='error')throw Object.assign(new Error(marker + '_DATABASE'),{status:400}); return 1234;},
    loadResendSentCounts: async()=>{if(resend==='error')throw Object.assign(new Error(marker + '_RESEND'),{status:404}); return {today:3, month:12, timeZone:'America/New_York'};},
    getStorageStats: async()=>{if(r2==='error')throw Object.assign(new Error(marker + '_R2'),{status:503}); return {totalBytes:5678,objectCount:4};},
    Date
  };
  vm.createContext(ctx);
  vm.runInContext(functionSource + '\nthis.run = loadCurrentPlans;',ctx);
  return ctx.run();
}
function get(result,id) {const row=result.rows.find(x=>x.id===id); assert.ok(row,`missing row ${id}`);return row;}

test('R16-69A all three provider failures retain unavailable status without exception details',async()=>{
  const result=await fixture({db:'error',resend:'error',r2:'error'});
  for(const id of ['database-size','resend-today','resend-month','r2-storage']) {
    const row=get(result,id);
    assert.equal(row.status,'unavailable');
    assert.equal(row.currentValue,null);
    assert.equal(row.note.includes(marker),false);
  }
});
test('R16-69B safe provider messages are informative and fixed',async()=>{
  const r=await fixture({db:'error',resend:'error',r2:'error'});
  assert.equal(get(r,'database-size').note,'Automatic database-size query is temporarily unavailable.');
  assert.equal(get(r,'resend-today').note,'Resend metrics are temporarily unavailable.');
  assert.equal(get(r,'resend-month').note,'Resend metrics are temporarily unavailable.');
  assert.equal(get(r,'r2-storage').note,'R2 storage metrics are temporarily unavailable.');
});
test('R16-69C healthy-provider numeric results remain intact',async()=>{
  const r=await fixture();
  assert.equal(get(r,'database-size').currentValue,1234);
  assert.equal(get(r,'resend-today').currentValue,3);
  assert.equal(get(r,'resend-month').currentValue,12);
  assert.equal(get(r,'r2-storage').currentValue,5678);
  assert.ok(['render-hours','r2-class-a','r2-class-b','r2-egress'].every(id=>r.rows.some(row=>row.id===id)));
  assert.ok(typeof r.generatedAt==='string');
  assert.equal(r.pricingReviewed,'TEST');
});
test('R16-69D each isolated failure leaves other provider results unchanged',async()=>{
  for(const which of ['db','resend','r2']) {
    const r=await fixture({[which]:'error'});
    assert.equal(get(r,'database-size').status,which==='db'?'unavailable':'ok');
    assert.equal(get(r,'resend-today').status,which==='resend'?'unavailable':'ok');
    assert.equal(get(r,'resend-month').status,which==='resend'?'unavailable':'ok');
    assert.equal(get(r,'r2-storage').status,which==='r2'?'unavailable':'ok');
    assert.equal(JSON.stringify(r).includes(marker),false);
  }
});
test('R16-69E three source sites have no raw exception messages',()=>{
  assert.equal((functionSource.match(/error\.message/g)||[]).length,0);
  for(const x of ['database-size','resend-today','resend-month','r2-storage'])assert.ok(functionSource.includes(x));
});
test('R16-69F administrator authorization remains attached to both routes',()=>{
  assert.match(source,/router\.get\('\/current-plans',\s*auth,\s*requireAdmin,/);
  assert.match(source,/router\.get\('\/free-tier-usage',\s*auth,\s*requireAdmin,/);
});
