'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../dbConnection.js'), 'utf8');
const baseline = { WA_ENV:'staging', DB_HOST:'morty2.heliohost.org', DB_USER:'wapps_test',
  DB_PASSWORD:'synthetic-never-used', DB_NAME:'wapps_test', DB_PORT:'3306',
  DB_SSL:'required', DB_CONNECTION_LIMIT:'5' };
let cases = 0;
function load(patch={}) {
  const env = {...baseline,...patch}; let created = null;
  const connection = {
    query: async()=> [[{ SessionTimeZone:'+00:00', SessionNow:'mock', UtcNow:'mock' }]],
    release() {}
  };
  const fakePool = {
    getConnection: async()=>connection, on() {}
  };
  const mysql = { createPool(options) { created=options; return fakePool; } };
  const log = {info(){},error(){}};
  const m = {exports:{}};
  const requireStub = name => {
    if (name==='dotenv') return {config(){}};
    if (name==='mysql2/promise') return mysql;
    if (name==='./logger') return log;
    throw Error('Unexpected import: '+name);
  };
  vm.runInNewContext(source, {require:requireStub,process:{env,exit:()=>{throw Error('process.exit attempted');}},module:m,exports:m.exports,Number,String,Error,Date,Set,console,setInterval:()=>0},
    {filename:'dbConnection.js',timeout:3000});
  return {created,ready:m.exports.ready};
}
async function main() {
  const staging=load(); assert.equal(staging.created.connectionLimit,5);
  assert.equal(staging.created.ssl.rejectUnauthorized,true);await staging.ready;cases++;
  const prod=load({WA_ENV:'production',DB_NAME:'wapps_future_candidate',DB_USER:'wapps_future_candidate'});
  assert.equal(prod.created.connectionLimit,5);assert.equal(prod.created.ssl.rejectUnauthorized,true);
  await prod.ready;cases++;
  const local=load({WA_ENV:'local',DB_NAME:'sql5838929',DB_SSL:'',DB_CONNECTION_LIMIT:'50'});
  assert.equal(local.created.ssl,undefined);assert.equal(local.created.connectionLimit,50);await local.ready;cases++;
  for (const patch of [
    {DB_PORT:'0'}, {DB_PORT:'x'}, {DB_PORT:'65536'}, {DB_CONNECTION_LIMIT:'abc'},
    {DB_CONNECTION_LIMIT:'0'}, {DB_CONNECTION_LIMIT:'6'}, {DB_SSL:''}, {DB_SSL:'disable'}
  ]) { assert.throws(()=>load(patch));cases++; }
  for (const patch of [ {WA_ENV:'production',DB_SSL:''}, {WA_ENV:'production',DB_CONNECTION_LIMIT:'50'} ]) {
    assert.throws(()=>load(patch));cases++;
  }
  console.log(`PASS ${cases} isolated DB connection assertions; mocked mysql pool; zero network or database operations`);
}
main().catch(e=>{console.error(e);process.exitCode=1});
