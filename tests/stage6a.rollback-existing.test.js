'use strict';
// Stage 6A limited rollback test: test database, selected existing test-only rows,
// no CREATE/ALTER/DROP; all modifications occur inside uncommitted transactions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

if (process.env.DB_NAME !== 'sql5838929' || process.env.NODE_ENV === 'production') {
  throw Error('STOP: this test requires .env.test (sql5838929), non-production mode.');
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  throw Error('STOP: missing test database connection settings.');
}
const src = fs.readFileSync(path.resolve(__dirname, '../routes/users.js'), 'utf8');
for (const route of ['/change-password', '/reset-password']) {
  const anchor = src.indexOf(`router.post('${route}'`);
  assert(anchor >= 0, `Missing ${route}`);
  const next = src.indexOf('\nrouter.', anchor + 12);
  const body = src.slice(anchor, next === -1 ? undefined : next);
  for (const fragment of ['beginTransaction()', 'sessions.revokeAll(', '.commit()', '.rollback()']) {
    assert(body.includes(fragment), `${route} missing ${fragment}`);
  }
}
console.log('PASS source checks: transaction, revocation, commit, rollback found in password routes.');

async function main(){
 const pool = mysql.createPool({
   host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),
   user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,
   timezone:'Z',waitForConnections:true,connectionLimit:2
 });
 let conn;
 try {
   conn = await pool.getConnection();
   await conn.query("SET time_zone = '+00:00'");
   const [[db]] = await conn.query('SELECT DATABASE() AS db');
   assert.equal(db.db, 'sql5838929');
   const [engines] = await conn.query(`SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES
       WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('WebSessionT','UserSecurityT','PasswordResetT')`);
   assert.equal(engines.length,3,'Required security tables missing');
   assert(engines.every(t=>t.ENGINE==='InnoDB'),'Rollback test requires InnoDB tables');

   const [[user]] = await conn.query("SELECT UserID FROM UsersT WHERE UserID=62 AND UserName='charter' LIMIT 1");
   assert(user,'Expected charter test account UserID 62');
   const [[security]] = await conn.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=62 LIMIT 1');
   const [[session]] = await conn.query('SELECT WebSessionID,RevokedAt FROM WebSessionT WHERE WebSessionID=7 AND UserID=62 LIMIT 1');
   const [[reset]] = await conn.query('SELECT PasswordResetID,UsedAt,RevokedAt,ExpiresAt FROM PasswordResetT WHERE PasswordResetID=5 AND UserID=62 LIMIT 1');
   assert(security && session && reset,'Expected existing Stage 6A test rows missing; test stopped without changes');
   assert(session.RevokedAt!==null,'Session 7 must already be revoked');
   assert(new Date(reset.ExpiresAt).getTime()<Date.now(),'Reset link 5 must be expired');

   async function state(){
     const [[s]]=await conn.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=62');
     const [[w]]=await conn.query('SELECT RevokedAt FROM WebSessionT WHERE WebSessionID=7 AND UserID=62');
     const [[r]]=await conn.query('SELECT UsedAt,RevokedAt FROM PasswordResetT WHERE PasswordResetID=5 AND UserID=62');
     return {securityVersion:Number(s.SecurityVersion),sessionRevokedAt:w.RevokedAt===null?null:new Date(w.RevokedAt).getTime(),
       resetUsedAt:r.UsedAt===null?null:new Date(r.UsedAt).getTime(),resetRevokedAt:r.RevokedAt===null?null:new Date(r.RevokedAt).getTime()};
   }
   const original=await state();
   console.log('PASS preflight: sql5838929, InnoDB, isolated charter test rows verified.');
   async function simulate(label,statements){
     await conn.beginTransaction();
     let failed=false;
     try {
       for(const [sql,params] of statements) await conn.query(sql,params);
       // A deliberately invalid SQL statement raises a database error without CREATE privilege.
       await conn.query('SELECT NotARealStage6AColumn FROM UserSecurityT WHERE UserID=62');
       throw Error('Injected query unexpectedly succeeded.');
     } catch(err) {
       if(err.message==='Injected query unexpectedly succeeded.') throw err;
       failed=true;
       await conn.rollback();
     } finally {
       if(!failed) await conn.rollback();
     }
     assert(failed,'Expected injected SQL failure');
     assert.deepEqual(await state(),original,`${label}: state differed after rollback`);
     console.log(`PASS ${label}: deliberate SQL error; transaction rolled back; original records verified.`);
   }
   await simulate('change-password rollback simulation',[
     ['UPDATE UserSecurityT SET SecurityVersion=SecurityVersion+1 WHERE UserID=?',[62]],
     ['UPDATE WebSessionT SET RevokedAt=NULL WHERE WebSessionID=? AND UserID=?',[7,62]]
   ]);
   await simulate('reset-password rollback simulation',[
     ['UPDATE PasswordResetT SET UsedAt=UTC_TIMESTAMP(), RevokedAt=UTC_TIMESTAMP() WHERE PasswordResetID=? AND UserID=?',[5,62]],
     ['UPDATE UserSecurityT SET SecurityVersion=SecurityVersion+1 WHERE UserID=?',[62]]
   ]);
   console.log('PASS isolation: no CREATE TABLE privilege needed; no changes committed to test records.');
   console.log('LIMITATION: This tests real InnoDB rollback on existing security records, not fault injection into HTTP handlers.');
 } finally {
   if(conn){try{await conn.rollback();}finally{conn.release();}}
   await pool.end();
 }
}
main().catch(err=>{console.error('TEST FAILED:',err.message);process.exitCode=1;});
