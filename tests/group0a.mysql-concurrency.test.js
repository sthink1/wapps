'use strict';
// Group 5B: real MySQL InnoDB locking, connection-local temporary table only.
// No real account row is read, locked, or modified. Explicit --run-live required.
const assert=require('node:assert/strict');
const fence=require('../services/credentialFence');
const {config}=require('../services/stage6Environment');
if(process.env.WA_ENV!=='local'||process.env.DB_NAME!=='wapps_test'||process.env.NODE_ENV==='production')
 throw Error('STOP: local HelioHost wapps_test environment required');
config();
if(!process.argv.includes('--run-live')){
 console.log('SAFE STOP: no MySQL access. Add --run-live after reviewing Group 5B safety.');
 process.exit(0);
}
const mysql=require('mysql2/promise');
assert(process.env.DB_PASSWORD,'Missing staging DB password');
const opt={host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USER,
 password:process.env.DB_PASSWORD,database:'wapps_test',ssl:{rejectUnauthorized:true},
 timezone:'Z',multipleStatements:false,connectTimeout:10000};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const USER_ID=900000001;
async function main(){
 let a,b,txA=false,txB=false,pending=null;
 try{
  a=await mysql.createConnection(opt);b=await mysql.createConnection(opt);
  for(const c of [a,b]){
   await c.query("SET time_zone='+00:00'");
   await c.query('SET SESSION innodb_lock_wait_timeout = 8');
   const [[id]]=await c.query('SELECT DATABASE() AS db, @@session.time_zone AS tz');
   assert.equal(id.db,'wapps_test');assert.equal(id.tz,'+00:00');
   const [[tls]]=await c.query("SHOW STATUS LIKE 'Ssl_cipher'");assert(tls?.Value,'TLS required');
  }
  // The same SQL name is connection-local. Each connection must build its own view
  // of the fixture; to test *cross-connection contention*, use an actual shared row.
  // Shared staging rows are prohibited. Abort rather than give a false concurrency PASS.
  console.log('SAFE HOLD: connection-local temporary tables cannot establish cross-connection row-lock contention.');
  console.log('PASS preflight: test DB, UTC and TLS verified; no shared records written.');
  console.log('NOT TESTED: real interconnection credential-fence lock serialization. Requires disposable isolated database/fixture account.');
 }finally{
  if(txA&&a)await a.rollback().catch(()=>{});
  if(pending)await pending.catch(()=>{});
  if(txB&&b)await b.rollback().catch(()=>{});
  if(a)await a.end();if(b)await b.end();
 }
}
main().catch(e=>{console.error('FAIL:',e.message);process.exitCode=1});
