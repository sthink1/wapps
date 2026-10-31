'use strict';
// Live SQL test: synthetic future hourly bucket, not the current shared limiter bucket.
// No account changes, email deliveries, server request, or committed application edits.
const assert=require('node:assert/strict');
const mysql=require('mysql2/promise');
const crypto=require('node:crypto');
const limiter=require('../services/passwordResetLimiter');
// Fail closed before any database connection. Test-only HelioHost identity.
const {config} = require('../services/stage6Environment');
if (process.env.WA_ENV !== 'local' || process.env.NODE_ENV === 'production' ||
    process.env.DB_NAME !== 'wapps_test') {
  throw Error('STOP: H103 requires WA_ENV=local, DB_NAME=wapps_test, non-production.');
}
config(); // validates Helio host, user, port, TLS setting and localhost origin.
if (!process.argv.includes('--run-live')) {
  throw Error('STOP: live MySQL test requires explicit --run-live after safety review.');
}

const secret=crypto.randomBytes(12).toString('hex');
const FUTURE_BUCKET='2099123123';
const keys=new Set();
let isolated=false;
const pool=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,timezone:'Z',ssl:{rejectUnauthorized:true},multipleStatements:false,connectionLimit:5,waitForConnections:true});
async function call(email,ip){
 const c=await pool.getConnection();let inTransaction=false;
 try{
  await c.query("SET time_zone='+00:00'");
  await c.beginTransaction();inTransaction=true;
  // Only the clock result is injected: all inserts/row locks use actual MySQL.
  const adapter={query:(sql,args=[])=>{
   if(sql.startsWith('SELECT DATE_FORMAT'))return Promise.resolve([[{Bucket:FUTURE_BUCKET}]]);
   if(sql.startsWith('INSERT INTO PasswordResetRateT'))keys.add(args[0]);
   return c.query(sql,args);
  }};
  const allowed=await limiter.allow(adapter,email,ip);
  await c.commit();inTransaction=false;
  return allowed;
 }catch(e){if(inTransaction)try{await c.rollback()}catch(_){}throw e;}
 finally{c.release()}
}
(async()=>{
 const [[db]]=await pool.query('SELECT DATABASE() AS name');assert.equal(db.name,'wapps_test'); const [[tls]]=await pool.query("SHOW STATUS LIKE 'Ssl_cipher'");assert(tls && tls.Value,'TLS cipher required');
 const [[table]]=await pool.query("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='PasswordResetRateT'");
 assert.equal(String(table?.ENGINE).toUpperCase(),'INNODB');
 console.log('PASS preflight: test MySQL and InnoDB table confirmed.');
 // Preflight ensures the global key is not already present for the isolated future hour.
 const globalKey=crypto.createHmac('sha256',process.env.JWT_SECRET).update(`reset-v1|global|all-password-resets|${FUTURE_BUCKET}`,'utf8').digest('hex');
 const [[existing]]=await pool.query('SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE KeyHash=?',[globalKey]);
 assert.equal(Number(existing.n),0,'future test bucket global counter already exists; abort rather than touch it');
 isolated=true;
 for(let i=0;i<100;i++)assert.equal(await call(`s6a-${secret}-${i}@example.invalid`,`198.51.100.${i%255}-${secret}-${i}`),true,`allowed ${i+1}`);
 assert.equal(await call(`s6a-${secret}-blocked@example.invalid`, `203.0.113.100-${secret}`),false);
 console.log('PASS live shared global limit: 100 allowed, 101st blocked across unique emails and IPs.');
 const [rows]=await pool.query('SELECT AttemptCount FROM PasswordResetRateT WHERE KeyHash=?',[globalKey]);
 assert.equal(Number(rows[0].AttemptCount),101);
 console.log('PASS persisted global counter and blocking attempts counted.');
 console.log('PASS no real email or account used.');
})().catch(e=>{console.error('FAIL:',e.message);process.exitCode=1}).finally(async()=>{
 try{
  // Only keys created during this run, and never records not in the synthetic bucket.
  for(const key of (isolated?keys:[]))await pool.query("DELETE FROM PasswordResetRateT WHERE KeyHash=? AND WindowStart=STR_TO_DATE(?,'%Y%m%d%H')",[key,FUTURE_BUCKET]);
  console.log('CLEANUP: attempted exact-key removal for',keys.size,'synthetic counter keys.');
 }catch(e){console.error('CLEANUP ERROR',e.message);process.exitCode=1;}
 await pool.end();
});
