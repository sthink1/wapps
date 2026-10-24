'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {lock,matches}=require('../services/credentialFence');
const src=(f)=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
test('lock obtains SecurityVersion using a per-account FOR UPDATE',async()=>{
 const q=[]; const v=await lock({async query(sql,args){q.push([sql,args]);return [[{SecurityVersion:6}]];}},42);
 assert.equal(v,6);assert.match(q[0][0],/FOR UPDATE/);assert.deepEqual(q[0][1],[42]);
});
test('missing security account refuses issuance',async()=>{
 await assert.rejects(()=>lock({async query(){return [[]];}},4),/ACCOUNT_SECURITY_UNAVAILABLE/);
});
test('challenge versions reject old/zero/missing and accept current',()=>{
 assert.equal(matches(0,2),false);assert.equal(matches(null,2),false);
 assert.equal(matches(1,2),false);assert.equal(matches(2,2),true);
});
test('web challenge issuance records version and verifies current version',()=>{
 const s=src('routes/users.js');
 assert.match(s,/LoginVerificationT \(UserID,VerificationCode,TempToken,ExpiresAt,IsVerified,SecurityVersion\)/);
 assert.match(s,/fence\.lock\(c,user\.UserID\)/);
 assert.match(s,/fence\.matches\(grants\[0\]\.SecurityVersion,current\)/);
 assert.match(s,/PasswordHash!==user\.PasswordHash/);
});
test('TNNA challenge and both refresh operations lock account first',()=>{
 const t=src('routes/tnna.js'),b=src('services/browserSession.js');
 assert.match(t,/fence\.matches\(verification\.SecurityVersion,current\)/);
 assert.match(t,/const current=await fence\.lock\(c,candidate\[0\]\.UserID\)/);
 assert.match(b,/const current=await fence\.lock\(c,candidate\[0\]\.UserID\)/);
});
test('password reset grants and consumption use current version',()=>{
 const s=src('routes/users.js');
 assert.match(s,/RevokedAt,SecurityVersion\)/);
 assert.match(s,/fence\.matches\(row\.SecurityVersion,current\)/);
 assert.match(s,/p\.SecurityVersion=s\.SecurityVersion/);
});
