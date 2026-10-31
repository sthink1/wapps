'use strict';
// Group 4 isolated cleanup regression: REAL cleanupOnce service, in-memory SQL adapter.
// Deliberately makes NO MySQL connection and never deletes a staging row.
const assert = require('node:assert/strict');
const {cleanupOnce, BATCH, MAX_BATCHES, DELETE_SQL} = require('../services/passwordResetRateCleanup');
assert.equal(BATCH,250);
assert.equal(MAX_BATCHES,12);
assert.match(DELETE_SQL,/DELETE FROM PasswordResetRateT/);
assert.match(DELETE_SQL,/WindowStart\s*<\s*DATE_SUB\(UTC_TIMESTAMP\(\),\s*INTERVAL 48 HOUR\)/);
assert.match(DELETE_SQL,/ORDER BY WindowStart ASC LIMIT 250/);

async function main(){
  const now=Date.now();
  const rows=Array.from({length:283},(_,id)=>({id,window:new Date(now-72*3600000),value:1}));
  rows.push({id:283,window:new Date(now),value:7});
  const log={info:()=>{},error:(m)=>{throw Error('Unexpected cleanup service error: '+m)}};
  let calls=0;
  const pool={async query(sql){
    assert.equal(sql,DELETE_SQL,'Unexpected SQL; fail closed without modifying fixtures');
    calls++;
    const expired=rows.filter(r=>r.window.getTime()<now-48*3600000)
      .sort((a,b)=>a.window-b.window||a.id-b.id).slice(0,BATCH);
    for(const item of expired){const index=rows.indexOf(item);assert(index!==-1);rows.splice(index,1)}
    return [{affectedRows:expired.length}];
  }};
  const result=await cleanupOnce(pool,log);
  assert.deepEqual(result,{ok:true,deleted:283,batches:2,mayHaveMore:false});
  assert.equal(calls,2);
  assert.deepEqual(rows.map(r=>({id:r.id,value:r.value})),[{id:283,value:7}]);
  console.log('PASS isolated cleanupOnce: 283 expired fixtures deleted in batches of 250 and 33.');
  console.log('PASS recent fixture preserved; no live MySQL records accessed.');
  let badCalls=0;
  const bad=await cleanupOnce({query:async()=>{badCalls++;return [{affectedRows:251}]}},{info:()=>{},error:()=>{}});
  assert.deepEqual(bad,{ok:false,deleted:0,batches:0});assert.equal(badCalls,1);
  console.log('PASS cleanup service rejects an invalid >250 affected-row result.');
  console.log('LIMITATION: SQL is contract-checked but execution uses a simulated adapter; not live MySQL DELETE semantics.');
}
main().catch(e=>{console.error('FAIL',e);process.exitCode=1});
