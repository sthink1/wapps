 'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const service=fs.readFileSync(path.join(root,'services/subscriptionService.js'),'utf8');
const routes=fs.readFileSync(path.join(root,'routes/subscriptions.js'),'utf8');
const html=fs.readFileSync(path.join(root,'httpdocs/SubControl.html'),'utf8');
const {EXPECTED,matchRow,classify}=require('../tools/wa-subscription-one-time-migration');
test('No runtime dependency on legacy grant table',()=>{
  assert.doesNotMatch(service,/AdminSubscriptionGrantT|grantAdminFreeUsage|updateAdminFreeGrant|revokeAdminFreeGrant/);
  assert.doesNotMatch(routes,/\/admin\/grants|\/admin\/grant'/);
});
test('Direct admin routes retained',()=>{
  assert.match(routes,/router\.get\('\/admin\/user\/:userId\/subscription', requireAdmin/);
  assert.match(routes,/router\.put\('\/admin\/user\/:userId\/subscription', requireAdmin/);
});
test('Status and promo routes retained',()=>{
  for(const x of ["'/status'","'/promo'","'/admin/promos'","'/admin/promo-redemptions'"])assert.ok(routes.includes(x));
});
test('UI retained and legacy controls absent',()=>{
  for(const x of ['Administrator Management','Promo Codes','Subscription Administration','Current Promo Redemptions'])assert.ok(html.includes(x));
  for(const x of ['Grant Free Usage','Current Free Access Grants','grantEditForm','grantTableBody'])assert.ok(!html.includes(x));
});
test('Migration contains 18 unique users and 11 mutations',()=>{
  assert.equal(EXPECTED.length,18);assert.equal(new Set(EXPECTED.map(e=>e[0])).size,18);
  const mutations=EXPECTED.filter(e=>e[2]===null || e[3]!==e[8] || e[4]!==e[9] || e[5]!==e[10]);
  assert.equal(mutations.length,11);assert.equal(mutations.filter(e=>e[2]===null).length,2);
});
test('Expected source and target snapshots match independently',()=>{
  const old=new Map(),next=new Map();
  for(const e of EXPECTED){
    if(e[2]!==null)old.set(e[0],{UserID:e[0],UserSubscriptionID:e[2],PlanID:e[3],AccessType:e[4],EndDate:e[5],Active:e[6],PromoCodeID:e[7]});
    next.set(e[0],{UserID:e[0],UserSubscriptionID:e[2]||1000+e[0],PlanID:e[8],AccessType:e[9],EndDate:e[10],Active:1,PromoCodeID:e[9]==='PROMO'?1:null});
  }
  assert.equal(classify(old),'SOURCE');assert.equal(classify(next),'MIGRATED');
  next.get(49).EndDate='2030-01-01';assert.equal(classify(next),'MISMATCH');
});
test('Migration does not run on import',()=>assert.equal(typeof require('../tools/wa-subscription-one-time-migration').main,'function'));
