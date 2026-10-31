'use strict';
// Group 4: actual revokeAll and verifyAccessToken, synthetic in-memory TNNA identity.
// No existing accounts, MySQL connections, or staging records accessed.
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const {revokeAll}=require('../services/browserSession');
const {verifyAccessToken}=require('../services/verifyAccessToken');
const USER_ID=900000001;
const secret='group4-test-jwt-secret-only-do-not-use-for-production';
const state={version:7,web:[{revoked:false}],tnna:[{revoked:false}],queries:[]};
const adapter={async query(sql,args=[]){
 state.queries.push({sql,args});
 if(sql.startsWith('UPDATE WebSessionT SET RevokedAt')){
   assert.deepEqual(args,[USER_ID]);state.web.forEach(s=>s.revoked=true);return [{affectedRows:state.web.length}];
 }
 if(sql.startsWith('UPDATE TNNARefreshTokenT SET RevokedAt')){
   assert.deepEqual(args,[USER_ID]);state.tnna.forEach(t=>t.revoked=true);return [{affectedRows:state.tnna.length}];
 }
 if(sql.startsWith('UPDATE UserSecurityT SET SecurityVersion')){
   assert.deepEqual(args,[USER_ID]);state.version++;return [{affectedRows:1}];
 }
 if(sql.startsWith('SELECT SecurityVersion FROM UserSecurityT')){
   assert.deepEqual(args,[USER_ID]);return [[{SecurityVersion:state.version}]];
 }
 throw Error('Unexpected SQL in isolated TNNA test: '+sql);
}};
async function main(){
 const token=jwt.sign({userId:USER_ID,username:'group4-synthetic',client:'tnna',securityVersion:state.version},secret,{expiresIn:'8h',algorithm:'HS256'});
 const accepted=await verifyAccessToken(token,{database:adapter,jwtSecret:secret});
 assert.equal(accepted.userId,USER_ID);assert.equal(accepted.client,'tnna');
 console.log('PASS synthetic TNNA JWT accepted before revocation.');
 await revokeAll(adapter,USER_ID);
 assert.equal(state.version,8);assert(state.web.every(s=>s.revoked));assert(state.tnna.every(t=>t.revoked));
 await assert.rejects(verifyAccessToken(token,{database:adapter,jwtSecret:secret}),e=>e.code==='ACCOUNT_CREDENTIALS_REVOKED');
 assert.equal(state.queries.filter(q=>q.sql.startsWith('UPDATE ')).length,3);
 console.log('PASS actual revokeAll targets three account-scoped tables; prior TNNA JWT rejected.');
 console.log('PASS no charter or other staging account accessed; no DB connection.');
 console.log('LIMITATION: simulated SQL; not an actual TNNA refresh HTTP or MySQL transaction test.');
}
main().catch(e=>{console.error('FAIL',e);process.exitCode=1});
