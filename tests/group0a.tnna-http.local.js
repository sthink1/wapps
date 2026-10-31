'use strict';
// Group 5C: actual TNNA route callbacks under strict, isolated SQL adapter.
// No real MySQL, HTTP, user accounts, devices or external email.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve(__dirname,'../routes/tnna.js'),'utf8');
const handlers=new Map();
const USER=900000019,DEVICE='group5c-synthetic-only',TEMP='fixture-challenge',CODE='123456';
const version={VersionCode:1,VersionName:'test',MinimumSupportedVersionCode:1,DownloadUrl:'https://example.invalid/test',ReleaseNotes:'',ReleasedAt:new Date()};
const state={challengeUsed:false,userExists:false,deviceExists:false, tokens:[],commits:0,rollbacks:0,emails:0,queries:0};
let working=null;
const digest=v=>crypto.createHash('sha256').update(v,'utf8').digest('hex');
const connection={
 async beginTransaction(){assert.equal(working,null);working={challengeUsed:state.challengeUsed,userExists:state.userExists,deviceExists:state.deviceExists,tokens:state.tokens.map(t=>({...t}))}},
 async commit(){assert(working);Object.assign(state,working);working=null;state.commits++},
 async rollback(){assert(working);working=null;state.rollbacks++},release(){},
 async query(sql,args=[]){state.queries++;assert(working,'Unexpected query outside transaction');const s=sql.replace(/\s+/g,' ').trim();
  if(s.startsWith('SELECT UserID FROM LoginVerificationT'))return [working.challengeUsed?[]:[{UserID:USER}]];
  if(s.startsWith('SELECT VerificationID,UserID,VerificationCode,ExpiresAt,SecurityVersion FROM LoginVerificationT'))return [working.challengeUsed?[]:[{VerificationID:1,UserID:USER,VerificationCode:CODE,ExpiresAt:new Date(Date.now()+60000),SecurityVersion:7}]];
  if(s.startsWith('UPDATE LoginVerificationT SET IsVerified')){working.challengeUsed=true;return [{affectedRows:1}]}
  if(s.startsWith('SELECT UserID, UserName, Email FROM UsersT'))return [[{UserID:USER,UserName:'synthetic',Email:'synthetic@example.invalid'}]];
  if(s.startsWith('INSERT INTO TNNAUserT')){working.userExists=true;return [{affectedRows:1}]}
  if(s.startsWith('INSERT INTO TNNADeviceT')){assert.equal(args[0],DEVICE);working.deviceExists=true;return [{affectedRows:1}]}
  if(s.startsWith('INSERT INTO TNNARefreshTokenT')){assert.equal(args[0],USER);working.tokens.push({id:working.tokens.length+1,device:args[1],hash:args[2],expiry:args[3],revoked:false});return [{insertId:working.tokens.length}]}
  if(s.startsWith('SELECT UserID FROM TNNARefreshTokenT WHERE TokenHash'))return [working.tokens.filter(t=>t.hash===args[0]).map(()=>({UserID:USER})).slice(0,1)];
  if(s.startsWith('SELECT r.RefreshTokenID'))return [working.tokens.filter(t=>t.hash===args[0]&&!t.revoked&&t.expiry>new Date()).map(t=>({RefreshTokenID:t.id,UserID:USER,DeviceID:t.device,ExpiresAt:t.expiry,UserName:'synthetic',Email:'synthetic@example.invalid',UpdateEmailOptIn:0})).slice(0,1)];
  if(s.startsWith('UPDATE TNNARefreshTokenT SET RevokedAt')){const t=working.tokens.find(t=>t.id===args[0]);assert(t);t.revoked=true;return [{affectedRows:1}]}
  if(s.startsWith('UPDATE TNNAUserT SET LastSeenAt'))return [{affectedRows:1}];
  throw Error('Unexpected TNNA transaction SQL: '+s.slice(0,160));
 }
};
const pool={getConnection:async()=>connection,async query(sql,args=[]){state.queries++;const s=sql.replace(/\s+/g,' ').trim();
 if(s.startsWith('SELECT VersionCode, VersionName'))return [[version]];
 if(s.startsWith('UPDATE TNNARefreshTokenT SET RevokedAt')){const t=state.tokens.find(t=>t.hash===args[0]&&!t.revoked);if(t)t.revoked=true;return [{affectedRows:t?1:0}]}
 throw Error('Unexpected TNNA pool SQL: '+s.slice(0,160));}};
const mocks={express:{Router:()=>({post:(p,...args)=>handlers.set(p,args.at(-1)),get(){},put(){}})},crypto,jsonwebtoken:{sign:()=> 'synthetic-tnna-jwt'},'../dbConnection':{pool},
 '../services/browserSession':{securityVersion:async()=>7},'../services/credentialFence':{lock:async(_c,id)=>{assert.equal(id,USER);return 7},matches:(a,b)=>a===b},
 '../middleware/auth':()=>{},'../utils':{handleDbError:(e,res)=>{throw e}},'../send_email':{sendNotificationEmail(){state.emails++;throw Error('NO_EMAIL_ALLOWED')}},
 '../services/notificationService':{getActiveConsentVersion:async()=>1,logConsent:async()=>{}},'dotenv':{config(){}}};
vm.runInNewContext(source,{require:n=>{assert(Object.hasOwn(mocks,n),'Unexpected dependency: '+n);return mocks[n]},module:{exports:{}},exports:{},process:{env:{JWT_SECRET:'test-only'}},console,Date,Number,String,Boolean,Error,Buffer},{filename:'routes/tnna.js',timeout:3000});
const response=()=>({statusCode:200,body:null,status(n){this.statusCode=n;return this},json(data){this.body=data;return this}});
async function call(name,body){const h=handlers.get(name);assert.equal(typeof h,'function');const res=response();await h({body},res);return res}
(async()=>{
 let r=await call('/verify-code',{tempToken:TEMP,verificationCode:CODE,deviceId:DEVICE,platform:'Android',appVersion:'test',versionCode:1,updateEmailOptIn:false});
 assert.equal(r.statusCode,200);assert.match(r.body.refreshToken,/^[a-f0-9]{96}$/);assert.equal(state.tokens.length,1);assert(state.userExists&&state.deviceExists&&state.challengeUsed);
 const first=r.body.refreshToken;
 r=await call('/refresh',{refreshToken:first,deviceId:DEVICE+'-wrong'});assert.equal(r.statusCode,401);assert.equal(state.tokens.length,1);assert.equal(state.tokens[0].revoked,false);
 r=await call('/refresh',{refreshToken:first,deviceId:DEVICE});assert.equal(r.statusCode,200);const second=r.body.refreshToken;assert.notEqual(second,first);assert.equal(state.tokens.length,2);assert(state.tokens[0].revoked);
 r=await call('/refresh',{refreshToken:first,deviceId:DEVICE});assert.equal(r.statusCode,401);
 r=await call('/logout',{refreshToken:second});assert.equal(r.statusCode,200);assert(state.tokens[1].revoked);
 r=await call('/refresh',{refreshToken:second,deviceId:DEVICE});assert.equal(r.statusCode,401);
 assert.equal(state.emails,0);assert.equal(working,null);
 console.log('PASS actual tnna.js handlers: synthetic verify, device mismatch 401, refresh rotation, replay 401, logout and post-logout rejection.');
 console.log('PASS isolation: all SQL in strict in-memory adapter; no real MySQL, email, HTTP listener, account or device.');
 console.log('LIMITATION: simulated SQL transactions; does not validate full HTTP middleware, concurrency or real database side effects.');
})().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1});
