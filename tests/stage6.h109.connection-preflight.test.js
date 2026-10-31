'use strict';
// H109 READ-ONLY preflight. Never creates or modifies tables, accounts or records.
const assert = require('node:assert/strict');
if (!process.argv.includes('--check-connection')) {
  console.log('SAFE STOP: H109 connection preflight requires --check-connection. No connection opened.');
  process.exit(0);
}
const EXACT = Object.freeze({host:'johnny.heliohost.org',port:3306,user:'wapps_h109_user',database:'wapps_h109_test'});
const e=process.env;
assert.notEqual(e.NODE_ENV,'production','H109_STOP: production mode prohibited');
assert.equal(e.H109_DB_HOST,EXACT.host,'H109_STOP: unexpected host');
assert.equal(Number(e.H109_DB_PORT||3306),EXACT.port,'H109_STOP: unexpected port');
assert.equal(e.H109_DB_NAME,EXACT.database,'H109_STOP: unexpected database');
assert.equal(e.H109_DB_USER,EXACT.user,'H109_STOP: unexpected database username');
assert(e.H109_DB_PASSWORD,'H109_STOP: missing dedicated database password');
assert(e.H109_DB_PASSWORD !== e.DB_PASSWORD,'H109_STOP: H109 password must differ from shared-stage credentials');
const mysql=require('mysql2/promise');
(async()=>{
 const c=await mysql.createConnection({host:EXACT.host,port:EXACT.port,user:EXACT.user,
  password:e.H109_DB_PASSWORD,database:EXACT.database,ssl:{rejectUnauthorized:true},
  multipleStatements:false,connectTimeout:10000,timezone:'Z'});
 try {
  const [[id]]=await c.query('SELECT DATABASE() AS db, CURRENT_USER() AS authenticatedUser, @@session.time_zone AS tz');
  assert.equal(id.db,EXACT.database);
  assert.equal(String(id.authenticatedUser).split('@')[0],EXACT.user);
  const [[tls]]=await c.query("SHOW STATUS LIKE 'Ssl_cipher'");
  assert(tls?.Value,'H109_STOP: TLS is not active');
  const [[n]]=await c.query('SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE()');
  assert.equal(Number(n.n),0,'H109_STOP: disposable database is not empty');
  const [grants]=await c.query('SHOW GRANTS');
  const clauses=grants.flatMap(row=>Object.values(row).map(String));
  assert(clauses.length>0,'H109_STOP: database grants not visible');
  for(const clause of clauses){
   assert(!(/ON\s+\*\.\*/i.test(clause) && !/^GRANT\s+USAGE\s+ON\s+\*\.\*/i.test(clause)),'H109_STOP: global database privileges detected');
   assert(!/`?wapps_test`?\s*\./i.test(clause),'H109_STOP: shared-stage database privilege detected');
   const m=clause.match(/\bON\s+(?:`([^`]+)`|([A-Za-z0-9_]+))\s*\./i);
   if(m) assert.equal((m[1]||m[2]).replace(/\\_/g,'_'),EXACT.database,'H109_STOP: cross-database privileges detected');
  }
  console.log('PASS H109 read-only preflight: exact host/database/user, TLS active, zero tables.');
  console.log('PASS grant scope check: no global or alternate-database grants visible.');
  console.log('NOTE: This is not a write-permission test; no data or schema was modified.');
 }finally{await c.end()}
})().catch(err=>{console.error('H109 PRE-FLIGHT FAILED:',err.message);process.exitCode=1});
