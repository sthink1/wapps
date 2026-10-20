'use strict';
// Localhost HTTP calls to the actual routes/users.js callback, with isolated
// mocked DB, limiter and mail transport. No real DB, server.js, or email.
const assert=require('node:assert/strict');
const path=require('node:path');
const Module=require('node:module');
const http=require('node:http');
const express=require('express');
if(process.env.DB_NAME!=='sql5838929'||process.env.NODE_ENV==='production')throw Error('Test environment sql5838929 required');
const source=path.resolve(__dirname,'../routes/users.js');
let calls=0, emails=[], fails=false, counters=new Map(), commits=0, rollbacks=0, releases=0, inserted=0;
const realEmail='synthetic-existing@example.invalid';
const generic='If an account matches, password reset instructions will be sent.';
const pool={getConnection:async()=>({
 beginTransaction:async()=>{},
 commit:async()=>{commits++},rollback:async()=>{rollbacks++},release:()=>{releases++},
 query:async(sql,params)=>{
  if(sql.startsWith('SELECT UserID,UserName,Email FROM UsersT'))return [[params[0]===realEmail?{UserID:99999,UserName:'synthetic',Email:realEmail}:null].filter(Boolean)];
  if(sql.startsWith('UPDATE PasswordResetT'))return [{affectedRows:1}];
  if(sql.startsWith('INSERT INTO PasswordResetT')){inserted++;return [{insertId:inserted}];}
  throw Error('Unexpected SQL '+sql);
 }
})};
const limiter={allow:async(c,email,ip)=>{
 if(fails)throw Error('INJECTED_DB_FAILURE');
 assert.equal(typeof ip,'string');calls++;
 const key=ip+'|'+email;const n=(counters.get(key)||0)+1;counters.set(key,n);
 return n<=5;
}};
const reqOrigin=(req)=>{if(req.get('Origin')!==`http://${req.get('host')}`){let e=Error('origin');e.status=403;throw e}};
const stubs={
 '../dbConnection':{pool},
 '../send_email':{sendVerificationCode:async()=>{},sendPasswordResetLink:async(details)=>{emails.push(details)},sendPasswordChangedNotice:async()=>{}},
 '../services/browserSession':{requireOrigin:reqOrigin},
 '../services/passwordResetLimiter':limiter,
 '../middleware/auth':(req,res,next)=>next(),
 '../services/subscriptionService':{getOrCreateDevelopmentTrial:async()=>({})},
 '../services/notificationService':{getActiveConsentVersion:async()=>1,logConsent:async()=>{}},
 '../utils':{handleDbError:(_e,res)=>res.status(500).json({error:'DATABASE_ERROR'})}
};
const oldLoad=Module._load;let router;
try{
 Module._load=function(request,parent,isMain){if(parent?.filename===source&&Object.hasOwn(stubs,request))return stubs[request];return oldLoad.apply(this,arguments)};
 delete require.cache[source];router=require(source);
}finally{Module._load=oldLoad}
const app=express();app.use(express.json());app.use('/users',router);
async function run(){
 const server=http.createServer(app);
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok)});
 const port=server.address().port;
 const call=(email,originOverride)=>new Promise((ok,bad)=>{
   const data=JSON.stringify({email});
   const req=http.request({hostname:'127.0.0.1',port,method:'POST',path:'/users/forgot-password',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data),'Origin':originOverride??`http://127.0.0.1:${port}`}},res=>{
    let body='';res.on('data',x=>body+=x);res.on('end',()=>{try{ok({status:res.statusCode,body:JSON.parse(body)})}catch(e){bad(e)}})
   });req.on('error',bad);req.end(data)
 });
 try{
  const first=await call(realEmail);assert.deepEqual(first,{status:200,body:{message:generic}});
  for(let n=0;n<5;n++)assert.deepEqual(await call(realEmail),first);
  assert.equal(emails.length,5);assert.equal(inserted,5);
  console.log('PASS existing synthetic account: first five allowed, sixth generic and no extra email.');
  const absent=await call('unknown@example.invalid');assert.deepEqual(absent,first);
  assert.equal(emails.length,5);
  console.log('PASS nonexistent email: response indistinguishable, no email sent.');
  const before=rollbacks;fails=true;
  const failed=await call('other@example.invalid');assert.equal(failed.status,500);
  assert.equal(rollbacks,before+1);assert.equal(emails.length,5);
  console.log('PASS injected database failure: HTTP 500, rollback invoked, no email sent.');
  fails=false;
  const badOrigin=await call('a@example.invalid','https://untrusted.invalid');assert.equal(badOrigin.status,403);
  console.log('PASS origin check: untrusted Origin rejected.');
  assert.equal(releases,8); // six existing + one missing + one failed; invalid Origin skips connection
  console.log('PASS connection release on handled and failed requests.');
  console.log('LIMITATION: Local HTTP handlers use mocked DB/limiter/email; no real email delivery, MySQL concurrency, or Render proxy behavior verified.');
 }finally{await new Promise(resolve=>server.close(resolve))}
}
run().catch(e=>{console.error('FAIL',e.stack||e);process.exitCode=1});
