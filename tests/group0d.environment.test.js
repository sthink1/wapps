'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const modulePath=path.resolve(__dirname,'../services/stage6Environment.js');
function run(vars){const env={...process.env,WA_ENV:'local',DB_NAME:'sql5838929',NODE_ENV:'development',APP_PUBLIC_ORIGIN:'http://localhost:8080',WA_ALLOWED_ORIGINS:'http://localhost:8080',...vars};return spawnSync(process.execPath,['-e',`const c=require(${JSON.stringify(modulePath)}); console.log(c.current.mode+':'+c.current.secureCookie)`],{env,encoding:'utf8'});}
test('local test mode permits non-Secure cookie only on localhost',()=>{const r=run({});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/local:false/);});
test('hosted staging supports production NODE_ENV but refuses production DB',()=>{const r=run({WA_ENV:'staging',NODE_ENV:'production',APP_PUBLIC_ORIGIN:'https://stage.example.test',WA_ALLOWED_ORIGINS:'https://stage.example.test'});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/staging:true/);});
for(const [label,vars] of [
 ['unset environment',{WA_ENV:''}],['production mode',{WA_ENV:'production'}],
 ['production database',{DB_NAME:'sql999999'}],
 ['staging HTTP',{WA_ENV:'staging',NODE_ENV:'production',APP_PUBLIC_ORIGIN:'http://stage.example.test',WA_ALLOWED_ORIGINS:'http://stage.example.test'}],
 ['staging non-production Node',{WA_ENV:'staging',NODE_ENV:'development',APP_PUBLIC_ORIGIN:'https://stage.example.test',WA_ALLOWED_ORIGINS:'https://stage.example.test'}],
 ['origin mismatch',{WA_ALLOWED_ORIGINS:'https://other.example.test'}],
 ['production Node local',{NODE_ENV:'production'}],
 ['trailing URL path',{APP_PUBLIC_ORIGIN:'http://localhost:8080/test',WA_ALLOWED_ORIGINS:'http://localhost:8080/test'}],
])test(`reject ${label}`,()=>{const r=run(vars);assert.notEqual(r.status,0,label);});
test('connected database identity and UTC verified before startup',async()=>{
 const keys=['WA_ENV','DB_NAME','NODE_ENV','APP_PUBLIC_ORIGIN','WA_ALLOWED_ORIGINS'];
 const previous=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 Object.assign(process.env,{WA_ENV:'local',DB_NAME:'sql5838929',NODE_ENV:'development',APP_PUBLIC_ORIGIN:'http://localhost:8080',WA_ALLOWED_ORIGINS:'http://localhost:8080'});
 const c=require(modulePath);
 for(const k of keys){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}
 assert.deepEqual(await c.verifyDatabaseIdentity({query:async()=>[[{DatabaseName:'sql5838929',TimeZone:'+00:00'}]]}),{DatabaseName:'sql5838929',TimeZone:'+00:00'});
 await assert.rejects(()=>c.verifyDatabaseIdentity({query:async()=>[[{DatabaseName:'bad',TimeZone:'+00:00'}]]}));
 await assert.rejects(()=>c.verifyDatabaseIdentity({query:async()=>[[{DatabaseName:'sql5838929',TimeZone:'SYSTEM'}]]}));
});
