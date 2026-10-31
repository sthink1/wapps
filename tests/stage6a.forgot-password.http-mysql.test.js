'use strict';
// Local HTTP -> actual routes/users.js -> actual passwordResetLimiter -> real MySQL.
// Uses synthetic 2099 bucket, nonexistent emails, mock email transport.
// Does NOT run server.js or connect to production.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const Module=require('node:module');
const path=require('node:path');
const http=require('node:http');
const express=require('express');
const mysql=require('mysql2/promise');

// Live test gate: no network or database operations unless explicitly authorized.
const {config}=require('../services/stage6Environment');
if(process.env.WA_ENV!=='local' || process.env.DB_NAME!=='wapps_test' || process.env.NODE_ENV==='production')
  throw Error('STOP: requires WA_ENV=local, DB_NAME=wapps_test, nonproduction.');
config();
if(!process.argv.includes('--run-live'))
  throw Error('STOP: add --run-live only after reviewing database safety.');
if(!process.env.JWT_SECRET)throw Error('JWT_SECRET required.');
if(!process.env.DB_HOST||!process.env.DB_USER||!process.env.DB_PASSWORD)
  throw Error('Test database credentials missing.');

const FUTURE_BUCKET='2099123122'; // isolated from prior 2099123123 integration tests
const tag=crypto.randomBytes(12).toString('hex');
const syntheticEmail=`stage6a-http-${tag}@example.invalid`;
const otherEmail=`stage6a-other-${tag}@example.invalid`;
const keys=new Set();
let mailCalls=0,connections=0,released=0,commits=0,rollbacks=0,isolated=false;
const expectedMessage='If an account matches, password reset instructions will be sent.';
const db=mysql.createPool({
 host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,
 database:process.env.DB_NAME,port:Number(process.env.DB_PORT||3306),
 timezone:'Z',ssl:{rejectUnauthorized:true},multipleStatements:false,waitForConnections:true,connectionLimit:4
});
const pool={
 async getConnection(){
  const c=await db.getConnection();connections++;
  return {
    beginTransaction:()=>c.beginTransaction(),
    commit:async()=>{await c.commit();commits++},
    rollback:async()=>{await c.rollback();rollbacks++},
    release:()=>{released++;c.release()},
    query:(sql,args=[])=>{
      if(sql.startsWith('SELECT DATE_FORMAT'))return Promise.resolve([[{Bucket:FUTURE_BUCKET}]]);
      if(sql.startsWith('INSERT INTO PasswordResetRateT'))keys.add(args[0]);
      return c.query(sql,args);
    }
  };
 },
 query:(sql,args)=>db.query(sql,args)
};
const source=path.resolve(__dirname,'../routes/users.js');
const reqOrigin=req=>{
 const expected=`${req.protocol}://${req.get('host')}`;
 if(req.get('Origin')!==expected){const e=Error('ORIGIN_NOT_ALLOWED');e.status=403;throw e;}
};
const stubs={
 '../dbConnection':{pool},
 '../send_email':{
   sendVerificationCode:async()=>{throw Error('unexpected verification email')},
   sendPasswordResetLink:async()=>{mailCalls++;throw Error('UNEXPECTED_EMAIL')},
   sendPasswordChangedNotice:async()=>{throw Error('unexpected change notification')}
 },
 '../services/browserSession':{requireOrigin:reqOrigin},
 '../middleware/auth':(_req,_res,next)=>next(),
 '../services/subscriptionService':{getOrCreateDevelopmentTrial:async()=>{throw Error('unexpected entitlement')}},
 '../services/notificationService':{getActiveConsentVersion:async()=>{throw Error('unexpected consent')},logConsent:async()=>{throw Error('unexpected consent')}},
 '../utils':{handleDbError:(_e,res)=>res.status(500).json({error:'DATABASE_ERROR'})}
};
const load=Module._load;let router;
try {
 Module._load=function(request,parent,isMain){
   if(parent?.filename===source&&Object.prototype.hasOwnProperty.call(stubs,request))
     return stubs[request];
   return load.apply(this,arguments);
 };
 delete require.cache[source];
 router=require(source);
}finally{Module._load=load}

const app=express();
app.use(express.json({limit:'10kb'}));
app.use('/users',router);
const web=http.createServer(app);

async function call(email,forgedOrigin=false){
 const port=web.address().port;
 const body=JSON.stringify({email});
 return new Promise((resolve,reject)=>{
  const req=http.request({
   hostname:'127.0.0.1',port,path:'/users/forgot-password',method:'POST',
   headers:{'content-type':'application/json','content-length':Buffer.byteLength(body),
            origin:forgedOrigin?'https://untrusted.invalid':`http://127.0.0.1:${port}`}
  },res=>{
   let s='';res.on('data',v=>s+=v);
   res.on('end',()=>{try{resolve({status:res.statusCode,body:JSON.parse(s)})}catch(e){reject(e)}})
  });
  req.on('error',reject);req.end(body);
 });
}
async function main(){
 let started=false;
 try{
  const [[current]]=await db.query('SELECT DATABASE() AS db');
  assert.equal(current.db,'wapps_test');
  const [[tls]]=await db.query("SHOW STATUS LIKE 'Ssl_cipher'");
  assert(tls && tls.Value,'TLS cipher required');
  const [[table]]=await db.query("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='PasswordResetRateT'");
  assert.equal(String(table?.ENGINE).toUpperCase(),'INNODB');
  // Verify synthetic global slot is empty before writing anything.
  const globalKey=crypto.createHmac('sha256',process.env.JWT_SECRET)
   .update(`reset-v1|global|all-password-resets|${FUTURE_BUCKET}`,'utf8').digest('hex');
  const [[old]]=await db.query('SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE KeyHash=?',[globalKey]);
  assert.equal(Number(old.n),0,'Synthetic global slot already occupied: stop without modification.');
  isolated=true;
  console.log('PASS preflight: test database and isolated future global window verified.');
  await new Promise((ok,bad)=>{web.once('error',bad);web.listen(0,'127.0.0.1',ok)});started=true;
  const expected={status:200,body:{message:expectedMessage}};
  for(let i=0;i<6;i++)assert.deepEqual(await call(syntheticEmail),expected);
  const [[emailCounter]]=await db.query('SELECT AttemptCount FROM PasswordResetRateT WHERE KeyHash=?',[
    crypto.createHmac('sha256',process.env.JWT_SECRET)
     .update(`reset-v1|email|${syntheticEmail}|${FUTURE_BUCKET}`,'utf8').digest('hex')
  ]);
  assert.equal(Number(emailCounter.AttemptCount),6);
  console.log('PASS real HTTP/MySQL: six requests returned generic response; email limiter counter reached six (sixth blocked).');
  assert.deepEqual(await call(otherEmail),expected);
  assert.equal(mailCalls,0);
  console.log('PASS unknown synthetic address: generic response, zero email attempts.');
  const [[globalCounter]]=await db.query('SELECT AttemptCount FROM PasswordResetRateT WHERE KeyHash=?',[globalKey]);
  assert.equal(Number(globalCounter.AttemptCount),7);
  console.log('PASS real global counter: seven HTTP requests persisted in isolated future window.');
  assert.equal((await call(otherEmail,true)).status,403);
  assert.equal(connections,released);
  assert.equal(commits,7);
  console.log('PASS invalid Origin rejected, all DB connections released.');
  console.log('LIMITATION: email address is nonexistent and mail transport is disabled; verifies actual HTTP route+MySQL limiter, not real email delivery or Render proxy.');
 }finally{
  if(started)await new Promise(resolve=>web.close(resolve));
  // Cleanup: use exact hash AND synthetic bucket; verify each removal.
  let removed=0;
  try{
   for(const key of (isolated?keys:[])){
    const [r]=await db.query(
      "DELETE FROM PasswordResetRateT WHERE KeyHash=? AND WindowStart=STR_TO_DATE(?,'%Y%m%d%H')",
      [key,FUTURE_BUCKET]
    );
    removed+=Number(r.affectedRows||0);
   }
   const hashes=[...keys];
   for(const key of (isolated?hashes:[])){
    const [[r]]=await db.query('SELECT COUNT(*) AS n FROM PasswordResetRateT WHERE KeyHash=?',[key]);
    assert.equal(Number(r.n),0,`Cleanup left row for ${key.slice(0,8)}`);
   }
   if(isolated)console.log(`PASS cleanup: ${removed} rows removed; ${keys.size} synthetic keys verified absent.`);
   else console.log('CLEANUP: skipped; isolation preflight was not completed.');
  }catch(e){console.error('CLEANUP FAILED:',e.message);process.exitCode=1}
  await db.end();
 }
}
main().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1});
