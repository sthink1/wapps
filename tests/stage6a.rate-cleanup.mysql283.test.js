'use strict';
/* SAFEGUARD 4 - live test for existing cleanupOnce on test MySQL.
   Must stop WA server first. Refuses to run if unrelated expired rows exist. */
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const mysql=require('mysql2/promise');
const cleanup=require('../services/passwordResetRateCleanup');

if(process.env.DB_NAME!=='sql5838929'||process.env.NODE_ENV==='production')
 throw Error('STOP: only .env.test sql5838929 (nonproduction) is allowed.');
if(!process.env.DB_HOST||!process.env.DB_USER||!process.env.DB_PASSWORD)
 throw Error('STOP: missing test database settings.');
if(cleanup.BATCH!==250 || typeof cleanup.cleanupOnce!=='function')
 throw Error('STOP: revised cleanup capacity service not installed.');

const totalExpired=283;
const testKeys=[];
let pool,inserted=false;
function key(){
 return crypto.createHash('sha256').update('stage6a-cleanup283-'+crypto.randomBytes(32).toString('hex')).digest('hex');
}
async function count(sql,args=[]){
 const [[r]]=await pool.query(sql,args);return Number(r.n);
}
async function deleteOnlyOurKeys(){
 if(!pool || testKeys.length===0)return;
 let deleted=0;
 for(let i=0;i<testKeys.length;i+=50){
  const keys=testKeys.slice(i,i+50);
  const [r]=await pool.query(`DELETE FROM PasswordResetRateT WHERE KeyHash IN (${keys.map(()=>'?').join(',')})`,keys);
  deleted+=Number(r.affectedRows||0);
 }
 const left=await count(`SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE KeyHash IN (${testKeys.map(()=>'?').join(',')})`,testKeys);
 assert.equal(left,0,'Test cleanup failed: synthetic keys remain');
 console.log(`PASS exact-key cleanup: ${deleted} remaining test rows removed, none remain.`);
}
(async()=>{
 try{
  pool=mysql.createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,
   database:process.env.DB_NAME,port:Number(process.env.DB_PORT||3306),
   timezone:'Z',connectionLimit:2,waitForConnections:true});
  const [[db]]=await pool.query('SELECT DATABASE() AS db');
  assert.equal(db.db,'sql5838929');
  const [[engine]]=await pool.query("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='PasswordResetRateT'");
  assert.equal(String(engine?.ENGINE).toUpperCase(),'INNODB');
  const existing=await count("SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE WindowStart < DATE_SUB(UTC_TIMESTAMP(),INTERVAL 48 HOUR)");
  if(existing!==0)throw Error(`STOP: ${existing} pre-existing expired rows exist. The cleanup service deletes all expired rows. Test aborted before inserting any records. Ask for a safer plan.`);
  console.log('PASS preflight: sql5838929, InnoDB, and ZERO unrelated expired rows.');
  const recentKey=key();
  for(let i=0;i<totalExpired;i++)testKeys.push(key());
  testKeys.push(recentKey);
  // Batched parameterized inserts; SQL is MySQL 5.5 compatible.
  for(let i=0;i<totalExpired;i+=40){
   const slice=testKeys.slice(i,Math.min(totalExpired,i+40));
   const values=slice.map(()=>"(?, '2000-01-01 00:00:00', 1)").join(',');
   await pool.query(`INSERT INTO PasswordResetRateT (KeyHash,WindowStart,AttemptCount) VALUES ${values}`,slice);
  }
  await pool.query("INSERT INTO PasswordResetRateT (KeyHash,WindowStart,AttemptCount) VALUES (?,UTC_TIMESTAMP(),7)",[recentKey]);
  inserted=true;
  assert.equal(await count("SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE WindowStart < DATE_SUB(UTC_TIMESTAMP(),INTERVAL 48 HOUR)"),283);
  console.log('PASS setup: 283 synthetic expired rows plus one recent control row inserted.');
  // Calls the real production-shaped service, *not* a reimplementation of its loop.
  const log={info:()=>{},error:(...a)=>console.error(...a)};
  const result=await cleanup.cleanupOnce(pool,log);
  assert.equal(result.ok,true,'cleanupOnce reported failure');
  assert.equal(result.deleted,283,`Expected 283 deleted, got ${result.deleted}`);
  assert.equal(result.batches,2,'Expected two batches of at most 250 records');
  console.log('PASS live cleanupOnce: 283 expired records deleted in two batches.');
  const oldRemain=await count("SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE WindowStart < DATE_SUB(UTC_TIMESTAMP(),INTERVAL 48 HOUR)");
  assert.equal(oldRemain,0);
  const [[recent]]=await pool.query('SELECT AttemptCount,WindowStart FROM PasswordResetRateT WHERE KeyHash=?',[recentKey]);
  assert(recent,'Recent control row was unexpectedly deleted');
  assert.equal(Number(recent.AttemptCount),7);
  console.log('PASS preservation: zero expired rows remain and recent control row is unchanged.');
 }finally{
  if(pool){
   try{await deleteOnlyOurKeys()}finally{await pool.end()}
  }
 }
})().catch(e=>{console.error('TEST FAILED:',e.message);process.exitCode=1});
