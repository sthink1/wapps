'use strict';
/*
  Stage 6A database rollback smoke test.
  TEMPORARY InnoDB tables only; no writes to UsersT or any application tables.
  Demonstrates MySQL rollback semantics and checks existing endpoint source shape.
  Does NOT inject faults into the real HTTP handlers.
*/
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');

if (process.env.DB_NAME !== 'sql5838929' || process.env.NODE_ENV === 'production') {
  throw new Error('STOP: run with .env.test, DB_NAME=sql5838929, not production.');
}
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  throw new Error('Missing test database configuration.');
}
const src = fs.readFileSync(path.resolve(__dirname,'../routes/users.js'),'utf8');
for (const route of ['/change-password','/reset-password']) {
  const at=src.indexOf("router.post('"+route+"'");
  assert(at>=0,`Missing endpoint ${route}`);
  const tail=src.slice(at,src.indexOf("\nrouter.",at+12)===-1?undefined:src.indexOf("\nrouter.",at+12));
  for(const marker of ['beginTransaction()', 'sessions.revokeAll(', '.commit()', '.rollback()']) {
    assert(tail.includes(marker),`${route}: expected ${marker}`);
  }
}
console.log('PASS source checks: both password routes have transaction, revocation, commit, rollback.');

async function run(){
  const pool=mysql.createPool({
    host:process.env.DB_HOST, user:process.env.DB_USER, password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME, port:Number(process.env.DB_PORT||3306),
    timezone:'Z', waitForConnections:true, connectionLimit:2
  });
  let c;
  try {
    c=await pool.getConnection();
    await c.query("SET time_zone='+00:00'");
    const [[db]]=await c.query('SELECT DATABASE() AS name');
    assert.equal(db.name,'sql5838929');
    await c.query('CREATE TEMPORARY TABLE _wa_stage6a_rollback_account (id INT PRIMARY KEY, password_hash VARCHAR(80) NOT NULL, security_version INT NOT NULL, revoked INT NOT NULL) ENGINE=InnoDB');
    await c.query('CREATE TEMPORARY TABLE _wa_stage6a_rollback_reset (id INT PRIMARY KEY, used INT NOT NULL, revoked INT NOT NULL) ENGINE=InnoDB');
    await c.query("INSERT INTO _wa_stage6a_rollback_account VALUES (1,'original-test-hash',7,0)");
    await c.query('INSERT INTO _wa_stage6a_rollback_reset VALUES (1,0,0)');
    async function snapshot(){
      const [[a]]=await c.query('SELECT * FROM _wa_stage6a_rollback_account WHERE id=1');
      const [[r]]=await c.query('SELECT * FROM _wa_stage6a_rollback_reset WHERE id=1');
      return {account:a,reset:r};
    }
    const initial=await snapshot();
    async function forcedFailure(steps){
      let caught=false;
      await c.beginTransaction();
      try{
        for(const sql of steps) await c.query(sql);
        // Deliberate SQL error, inside the current database transaction.
        await c.query('UPDATE _wa_stage6a_table_that_does_not_exist SET bad=1');
        throw Error('Fault injection unexpectedly succeeded');
      }catch(e){
        if(e.message==='Fault injection unexpectedly succeeded')throw e;
        caught=true;
        await c.rollback();
      }
      assert(caught,'Expected deliberate database error');
      assert.deepEqual(await snapshot(),initial,'Rollback did not restore all test-table values');
    }
    await forcedFailure([
      "UPDATE _wa_stage6a_rollback_account SET password_hash='new-test-hash' WHERE id=1",
      'UPDATE _wa_stage6a_rollback_account SET revoked=1 WHERE id=1',
      'UPDATE _wa_stage6a_rollback_account SET security_version=8 WHERE id=1'
    ]);
    console.log('PASS simulated password change: SQL error rolled back password, revocation, and version.');
    await forcedFailure([
      "UPDATE _wa_stage6a_rollback_account SET password_hash='reset-hash' WHERE id=1",
      'UPDATE _wa_stage6a_rollback_reset SET used=1,revoked=1 WHERE id=1',
      'UPDATE _wa_stage6a_rollback_account SET security_version=8,revoked=1 WHERE id=1'
    ]);
    console.log('PASS simulated password reset: SQL error rolled back password, token flags, and revocation.');
    console.log('PASS isolation: only connection-local TEMPORARY tables used; no existing account records changed.');
    console.log('LIMITATION: This verifies real MySQL rollback semantics, NOT fault injection into actual HTTP endpoints.');
  }finally{
    if(c) { try{await c.query('DROP TEMPORARY TABLE IF EXISTS _wa_stage6a_rollback_reset');await c.query('DROP TEMPORARY TABLE IF EXISTS _wa_stage6a_rollback_account');}finally{c.release()} }
    await pool.end();
  }
}
run().catch(e=>{console.error('TEST FAILED:',e.message);process.exitCode=1;});
