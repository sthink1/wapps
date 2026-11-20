
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {EXPECTED,main}=require('../tools/wa-subscription-one-time-migration');
function fakeDB(mutate=false) {
  const entries=new Map(EXPECTED.filter(e=>e[2]!==null).map(e=>[e[0],{
    UserID:e[0],UserSubscriptionID:e[2],PlanID:e[3],AccessType:e[4],StartDate:'2026-09-01',
    EndDate:e[5],Active:e[6],PromoCodeID:e[7],CreatedDate:'2026-09-01',ModifiedDate:null
  }]));
  if(mutate)entries.get(49).EndDate='2025-01-01';
  const events={updates:0,inserts:0,commits:0,rollbacks:0,releases:0};
  const c={
    async beginTransaction() {},
    async commit(){events.commits++;},
    async rollback(){events.rollbacks++;},
    release(){events.releases++;},
    async query(sql,params=[]) {
      if(sql.startsWith('SELECT DATABASE()'))return [[{db:'wapps_test'}]];
      if(sql.includes('FROM UsersT WHERE UserID IN'))return [EXPECTED.map(e=>({UserID:e[0],UserName:e[1]}))];
      if(sql.includes('FROM SubscriptionPlanT WHERE PlanID IN'))return [[{PlanID:3,PlanName:'Platinum'},{PlanID:4,PlanName:'Diamond'}]];
      if(sql.includes('AS subscriptions,')&&sql.includes('AS grants,'))return [[{subscriptions:entries.size,grants:13,activeGrants:11,redemptions:3}]];
      if(sql.includes('FROM UserSubscriptionT WHERE UserID IN'))return [[...entries.values()].map(x=>({...x}))];
      if(sql.startsWith('SELECT COUNT(*) AS n'))return [[{n:entries.size}]];
      if(sql.includes('INSERT INTO UserSubscriptionT')){
        const [uid,plan,type,end]=params;assert.ok(!entries.has(uid));
        entries.set(uid,{UserID:uid,UserSubscriptionID:1000+uid,PlanID:plan,AccessType:type,StartDate:'2026-11-18',EndDate:end,Active:1,PromoCodeID:null});
        events.inserts++;return [{affectedRows:1}];
      }
      if(sql.includes('UPDATE UserSubscriptionT')) {
        const [plan,type,end,uid,rowid]=params;const r=entries.get(uid);
        assert.equal(r.UserSubscriptionID,rowid);Object.assign(r,{PlanID:plan,AccessType:type,EndDate:end,Active:1,PromoCodeID:null});
        events.updates++;return [{affectedRows:1}];
      }
      throw Error('Unexpected mock SQL '+sql);
    }
  };
  return {pool:{getConnection:async()=>c},events,entries};
}
test('Dry-run checks complete source snapshot without mutation',async()=>{
  process.env.DB_NAME='wapps_test';const d=fakeDB();
  const x=await main(['--check'],d.pool);
  assert.equal(x.state,'SOURCE');assert.equal(d.events.updates,0);
  assert.equal(d.events.inserts,0);assert.equal(d.events.commits,0);assert.equal(d.events.rollbacks,1);
});
test('Guarded apply performs 9 updates and 2 inserts, then a rerun is no-op',async()=>{
  process.env.DB_NAME='wapps_test';const d=fakeDB();const f=path.join(os.tmpdir(),'wa-sub-migration-'+process.pid+'-mock.json');
  try {
    const x=await main(['--apply','--confirm-staging-wapps-test','--backup-file='+f],d.pool);
    assert.equal(x.changed,11);assert.equal(d.events.updates,9);assert.equal(d.events.inserts,2);
    assert.equal(d.events.commits,1);assert.equal(fs.existsSync(f),true);
    assert.equal(JSON.parse(fs.readFileSync(f,'utf8')).users.length,18);
    const again=await main(['--apply','--confirm-staging-wapps-test','--backup-file='+f],d.pool);
    assert.equal(again.changed,0);assert.equal(d.events.commits,1);
  }finally {fs.rmSync(f,{force:true});}
});
test('Changed source record blocks all migration writes',async()=>{
  process.env.DB_NAME='wapps_test';const d=fakeDB(true);
  await assert.rejects(main(['--check'],d.pool),/snapshot mismatch/i);
  assert.equal(d.events.updates,0);assert.equal(d.events.commits,0);
});
test('Wrong DB_NAME and absent apply flags fail before DB access',async()=>{
  const d=fakeDB();process.env.DB_NAME='some_other_database';
  await assert.rejects(main(['--check'],d.pool),/DB_NAME/);
  process.env.DB_NAME='wapps_test';
  await assert.rejects(main(['--apply'],d.pool),/confirm-staging/);
  assert.equal(d.events.releases,0);
});
