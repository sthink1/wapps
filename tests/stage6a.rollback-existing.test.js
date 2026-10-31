'use strict';
// Group 4 isolated rollback regression. Only connection-local TEMPORARY tables.
// Does not touch UsersT, WebSessionT, UserSecurityT, or PasswordResetT.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {config}=require('../services/stage6Environment');
if(process.env.WA_ENV!=='local'||process.env.NODE_ENV==='production'||process.env.DB_NAME!=='wapps_test')
 throw Error('STOP: WA_ENV=local and HelioHost wapps_test required');
config();
const source=fs.readFileSync(path.resolve(__dirname,'../routes/users.js'),'utf8');
for(const route of ['/change-password','/reset-password']){
 const begin=source.indexOf(`router.post('${route}'`);assert(begin>=0,`Missing ${route}`);
 const next=source.indexOf('\nrouter.',begin+12);
 const body=source.slice(begin,next<0?undefined:next);
 for(const term of ['beginTransaction()','sessions.revokeAll(','.commit()','.rollback()'])
  assert(body.includes(term),`${route} missing ${term}`);
}
console.log('PASS source contract: transaction, revocation, commit and rollback found.');
if(!process.argv.includes('--run-live')){
 console.log('SAFE STOP: Source contract passed; add --run-live to exercise isolated temporary tables.');
 process.exit(0);
}
const mysql=require('mysql2/promise');
async function main(){
 assert(process.env.DB_PASSWORD,'Test database password missing');
 const pool=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,ssl:{rejectUnauthorized:true},multipleStatements:false,connectionLimit:1,timezone:'Z'});
 let c;
 try{
  c=await pool.getConnection();
  await c.query("SET time_zone='+00:00'");
  const [[db]]=await c.query('SELECT DATABASE() AS db');assert.equal(db.db,'wapps_test');
  const [[tls]]=await c.query("SHOW STATUS LIKE 'Ssl_cipher'");assert(tls?.Value,'TLS required');
  await c.query('CREATE TEMPORARY TABLE _wa_g4_security (UserID INT PRIMARY KEY,SecurityVersion INT NOT NULL,RevokedAt DATETIME NULL) ENGINE=InnoDB');
  await c.query('CREATE TEMPORARY TABLE _wa_g4_reset (PasswordResetID INT PRIMARY KEY,UsedAt DATETIME NULL,RevokedAt DATETIME NULL) ENGINE=InnoDB');
  await c.query('INSERT INTO _wa_g4_security VALUES (900000001,7,NULL)');
  await c.query('INSERT INTO _wa_g4_reset VALUES (900000001,NULL,NULL)');
  const state=async()=>{const [[s]]=await c.query('SELECT * FROM _wa_g4_security');const [[r]]=await c.query('SELECT * FROM _wa_g4_reset');return {s,r}};
  const original=await state();
  for(const [label,updates] of [
    ['change-password',["UPDATE _wa_g4_security SET SecurityVersion=SecurityVersion+1, RevokedAt=UTC_TIMESTAMP()"]],
    ['reset-password',["UPDATE _wa_g4_reset SET UsedAt=UTC_TIMESTAMP(), RevokedAt=UTC_TIMESTAMP()","UPDATE _wa_g4_security SET SecurityVersion=SecurityVersion+1"]]
  ]){
    let active=false;
    try{
      await c.beginTransaction();active=true;
      for(const q of updates)await c.query(q);
      await assert.rejects(c.query('SELECT NotARealGroup4Column FROM _wa_g4_security'));
    }finally{if(active)await c.rollback()}
    assert.deepEqual(await state(),original,`${label}: rollback did not restore fixtures`);
    console.log(`PASS ${label}: synthetic temporary-table records restored after fault.`);
  }
  console.log('PASS no shared account/session/password reset records accessed.');
  console.log('LIMITATION: validates real InnoDB rollback on isolated temporary tables, not real password HTTP handler fault injection.');
 }finally{
  if(c){try{await c.query('DROP TEMPORARY TABLE IF EXISTS _wa_g4_reset');await c.query('DROP TEMPORARY TABLE IF EXISTS _wa_g4_security')}finally{c.release()}}
  await pool.end();
 }
}
main().catch(e=>{console.error('FAIL',e);process.exitCode=1});
