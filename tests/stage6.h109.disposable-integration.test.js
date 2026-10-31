'use strict';
/* H109: REAL credentialFence.lock and browserSession.create/rotate against a NEW,
 * EMPTY, DEDICATED MySQL database. Never use shared wapps_test or production.
 * No application source is modified. Requires two explicit CLI switches.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const mysql = require('mysql2/promise');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const dbName = process.env.H109_DB_NAME || '';
const host = process.env.H109_DB_HOST || '';
const user = process.env.H109_DB_USER || '';
const pass = process.env.H109_DB_PASSWORD || '';
if (!process.argv.includes('--run-live') || !process.argv.includes('--confirm-empty-disposable-db')) {
  console.log('SAFE STOP: H109 requires --run-live AND --confirm-empty-disposable-db. No connection opened.');
  process.exit(0);
}
if (process.env.NODE_ENV === 'production' || dbName !== 'wapps_h109_test' ||
    ['wapps_test','sql5838929'].includes(dbName) || host !== 'johnny.heliohost.org' || user !== 'wapps_h109_user' || !pass ||
    host.includes('onrender.com') || Number(process.env.H109_DB_PORT || 3306) !== 3306) {
  throw Error('H109_STOP: exact HelioHost H109 database/host/user required; production/shared DB refused');
}
assert.notEqual(pass,process.env.DB_PASSWORD,'H109_STOP: H109 password must differ from shared-stage credentials');
// Never sign test credentials with the project's configured JWT secret.
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
const local = false;
const options = {host,port:Number(process.env.H109_DB_PORT||3306),user,password:pass,database:dbName,
  timezone:'Z',multipleStatements:false,waitForConnections:true,connectionLimit:5,
  connectTimeout:10000,...(local?{}:{ssl:{rejectUnauthorized:true}})};
const fence = require('../services/credentialFence');
// browserSession imports stage6Environment.current solely for cookie flags; for this
// standalone test, stub that configuration module before requiring the REAL service.
// This changes neither application source nor production runtime configuration.
const envPath=require.resolve('../services/stage6Environment');
require.cache[envPath]={id:envPath,filename:envPath,loaded:true,exports:{current:{secureCookie:false}}};
const sessions=require('../services/browserSession');
const userId=900000001;
const username='h109_disposable_only';
const ddl=[
`CREATE TABLE UsersT (UserID INT PRIMARY KEY, UserName VARCHAR(100) NOT NULL) ENGINE=InnoDB`,
`CREATE TABLE UserSecurityT (UserID INT PRIMARY KEY, SecurityVersion INT NOT NULL) ENGINE=InnoDB`,
`CREATE TABLE WebSessionT (WebSessionID INT AUTO_INCREMENT PRIMARY KEY, UserID INT NOT NULL,
 SessionPublicID CHAR(32) NOT NULL, IsRemembered TINYINT NOT NULL, CreatedAt DATETIME NOT NULL,
 LastActivityAt DATETIME NOT NULL, ExpiresAt DATETIME NOT NULL, AbsoluteExpiresAt DATETIME NOT NULL,
 RevokedAt DATETIME NULL) ENGINE=InnoDB`,
`CREATE TABLE WebRefreshTokenT (WebRefreshTokenID INT AUTO_INCREMENT PRIMARY KEY,
 WebSessionID INT NOT NULL, TokenHash CHAR(64) NOT NULL UNIQUE,
 ParentTokenID INT NULL, CreatedAt DATETIME NOT NULL, ExpiresAt DATETIME NOT NULL,
 ConsumedAt DATETIME NULL, RevokedAt DATETIME NULL) ENGINE=InnoDB`
];
async function main(){
 let pool, a, b, aTx=false, bTx=false, pending, created=[];
 try {
  pool=mysql.createPool(options);
  const [[identity]]=await pool.query('SELECT DATABASE() AS db, CURRENT_USER() AS grantUser, @@session.time_zone AS tz');
  assert.equal(identity.db,dbName,'Connected database is not H109 dedicated database');
  assert.equal(String(identity.grantUser).split('@')[0],'wapps_h109_user','Unexpected authenticated database user');
  const [[tls]]=await pool.query("SHOW STATUS LIKE 'Ssl_cipher'");assert(tls?.Value,'TLS required');
  const [[count]]=await pool.query('SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()');
  assert.equal(Number(count.n),0,'H109 refuses to run unless the dedicated database is COMPLETELY EMPTY');
  // Independently repeat the read-only grant-scope check before any CREATE TABLE.
  const [grants]=await pool.query('SHOW GRANTS');
  const clauses=grants.flatMap(row=>Object.values(row).map(String));
  assert(clauses.length>0,'H109_STOP: database grants not visible');
  for(const clause of clauses){
   const global=/^GRANT\s+(.+?)\s+ON\s+\*\.\*/i.exec(clause);
   if(global){
    assert.equal(global[1].trim().toUpperCase(),'USAGE','H109_STOP: global database privileges detected');
    continue;
   }
   const m=clause.match(/\bON\s+(?:`([^`]+)`|([A-Za-z0-9_]+))\s*\.\s*\*/i);
   assert(m,'H109_STOP: unrecognized database grant scope');
   assert.equal((m[1]||m[2]).replace(/\\_/g,'_'),dbName,'H109_STOP: cross-database privileges detected');
  }
  console.log('PASS preflight: independently named, empty database; no shared staging tables.');
  console.log('PASS grant scope: USAGE only globally; database privileges limited to H109.');
  const names=['UsersT','UserSecurityT','WebSessionT','WebRefreshTokenT'];
  for(let i=0;i<ddl.length;i++){await pool.query(ddl[i]);created.push(names[i]);}
  await pool.query('INSERT INTO UsersT VALUES (?,?)',[userId,username]);
  await pool.query('INSERT INTO UserSecurityT VALUES (?,?)',[userId,7]);
  a=await pool.getConnection();b=await pool.getConnection();
  for(const c of [a,b]) {await c.query("SET time_zone='+00:00'"); await c.query('SET SESSION innodb_lock_wait_timeout=8');}
  // Cross-CONNECTION InnoDB contention, actual application credentialFence.lock.
  await a.beginTransaction();aTx=true;
  assert.equal(await fence.lock(a,userId),7);
  await a.query('UPDATE UserSecurityT SET SecurityVersion=8 WHERE UserID=?',[userId]);
  await b.beginTransaction();bTx=true;
  let settled=false;
  pending=fence.lock(b,userId).finally(()=>{settled=true});
  await delay(300);
  assert.equal(settled,false,'Second connection did not wait for InnoDB row lock');
  await a.rollback();aTx=false;
  assert.equal(await pending,7);pending=null;
  await b.rollback();bTx=false;
  assert.equal(fence.matches(7,7),true);
  console.log('PASS real credentialFence.lock: second connection waited and saw committed version after rollback.');
  const make=async()=>{const c=await pool.getConnection();try{await c.beginTransaction();const r=await sessions.create(c,{UserID:userId,UserName:username},true);await c.commit();return r.refresh.secret;}catch(e){await c.rollback().catch(()=>{});throw e;}finally{c.release();}};
  const one=await make();
  const rotated=await sessions.rotate(pool,one);
  assert(rotated.token && rotated.refresh.secret && rotated.refresh.secret!==one);
  await assert.rejects(()=>sessions.rotate(pool,one),e=>e.message==='REFRESH_INVALID'&&e.status===401);
  console.log('PASS real browserSession.rotate: consumed credential rejected; successor issued.');
  const two=await make();
  const outcomes=await Promise.allSettled([sessions.rotate(pool,two),sessions.rotate(pool,two)]);
  // H109 diagnostics only: do not print bearer tokens, refresh secrets, or SQL arguments.
  for(const [index, outcome] of outcomes.entries()) {
    if(outcome.status==='fulfilled') {
      console.log(`H109 DIAGNOSTIC concurrent request ${index+1}: fulfilled; refresh successor present=${Boolean(outcome.value?.refresh?.secret)}`);
    } else {
      const err=outcome.reason;
      console.log(`H109 DIAGNOSTIC concurrent request ${index+1}: rejected`, {
        name:err?.name, message:err?.message, code:err?.code,
        errno:err?.errno, sqlState:err?.sqlState, status:err?.status
      });
    }
  }
  const hash=crypto.createHash('sha256').update(two).digest('hex');
  const [[children]]=await pool.query(`SELECT COUNT(*) AS n FROM WebRefreshTokenT t JOIN WebRefreshTokenT p
    ON t.ParentTokenID=p.WebRefreshTokenID WHERE p.TokenHash=?`,[hash]);
  console.log(`H109 DIAGNOSTIC: successor count=${Number(children.n)} (expected 1)`);
  const successes=outcomes.filter(x=>x.status==='fulfilled');
  const failures=outcomes.filter(x=>x.status==='rejected');
  assert.equal(successes.length,1,'H109: expected exactly one concurrent refresh success');
  assert.equal(failures.length,1,'H109: expected exactly one concurrent refresh rejection');
  assert.equal(failures[0].reason.message,'REFRESH_INVALID');
  assert.equal(Number(children.n),1,'H109: expected exactly one refresh successor');
  console.log('PASS real simultaneous rotation: one success, one REFRESH_INVALID, exactly one successor.');
 } finally {
  if(aTx&&a)await a.rollback().catch(()=>{});
  if(pending)await pending.catch(()=>{});
  if(bTx&&b)await b.rollback().catch(()=>{});
  if(a)a.release();if(b)b.release();
  if(pool){
   for(const name of created.reverse()){
    try{await pool.query('DROP TABLE `'+name+'`');}
    catch(e){console.error('CLEANUP FAILED for test-only table '+name+': '+e.message);process.exitCode=1;}
   }
   if(created.length){const [[remain]]=await pool.query('SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()').catch(()=>[[{n:-1}]]);
    if(Number(remain.n)!==0){console.error('CLEANUP WARNING: dedicated database is not empty');process.exitCode=1;}
    else console.log('PASS cleanup: dedicated H109 database empty again.');}
   await pool.end();
  }
 }
}
main().catch(e=>{console.error('H109 FAIL:',e.stack||e);process.exitCode=1;});
