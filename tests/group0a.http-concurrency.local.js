'use strict';
// Group 5C: actual /users/refresh-session callback with isolated dependencies.
// NO server, MySQL, accounts, email, filesystem writes or HTTP requests.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve(__dirname,'../routes/users.js'),'utf8');
const handlers=new Map();
const secret=crypto.randomBytes(48).toString('hex');
let current=secret, rotations=0, cookies=0, databaseConnections=0, emails=0;
const response=()=>({statusCode:200,body:null,headers:{},cookies:[],status(n){this.statusCode=n;return this},json(b){this.body=b;return this},set(k,v){this.headers[k]=v;return this},cookie(k,v,o){this.cookies.push({k,v,o})},clearCookie(){this.cookies.push({clear:true})}});
const sessions={
 requireOrigin(req){if(req.get('Origin')!=='http://localhost:8080'){const e=Error('ORIGIN_NOT_ALLOWED');e.status=403;throw e}},
 cookie(req){return req.headers.cookie?.match(/wa_refresh=([a-f0-9]{96})/)?.[1]||null},
 async rotate(_pool,s){
  if(s!==current){const e=Error('REFRESH_INVALID');e.status=401;throw e}
  current=crypto.randomBytes(48).toString('hex');rotations++;
  return {token:'isolated-synthetic-access-token',refresh:{secret:current,expires:new Date(Date.now()+3600000)}};
 },
 setCookie(res,_req,s){res.cookie('wa_refresh',s,{httpOnly:true,path:'/users'})}
};
const noDb={getConnection(){databaseConnections++;throw Error('UNEXPECTED_DATABASE_CONNECTION')},query(){databaseConnections++;throw Error('UNEXPECTED_DATABASE_QUERY')}};
const validator={body:()=>{const b={};for(const x of ['trim','notEmpty','matches','isLength','isEmail','optional','custom','isBoolean','withMessage'])b[x]=()=>b;return b},validationResult:()=>({isEmpty:()=>true})};
const mocks={
 express:{Router:()=>({post:(p,...args)=>handlers.set(p,args.at(-1)),get(){}})},
 'express-validator':validator,'../dbConnection':{pool:noDb},bcrypt:{},jsonwebtoken:{},
 '../utils':{handleDbError(){throw Error('UNEXPECTED_ERROR_HANDLER')}},
 '../send_email':{sendVerificationCode(){emails++;throw Error('UNEXPECTED_EMAIL')},sendPasswordResetLink(){emails++;throw Error('UNEXPECTED_EMAIL')},sendPasswordChangedNotice(){emails++;throw Error('UNEXPECTED_EMAIL')}},
 crypto,'../services/browserSession':sessions,'../services/credentialFence':{},'../middleware/auth':()=>{},
 '../services/subscriptionService':{},'../services/notificationService':{},'../services/passwordResetLimiter':{},'dotenv':{config(){}}
};
vm.runInNewContext(source,{require:n=>{assert(Object.hasOwn(mocks,n),'Unexpected dependency: '+n);return mocks[n]},module:{exports:{}},exports:{},process:{env:{JWT_SECRET:'test-only'},exit(){throw Error('FORBIDDEN_EXIT')}},console,URL,Date,Map,String,Error,Buffer,setTimeout},{filename:'routes/users.js',timeout:3000});
const handler=handlers.get('/refresh-session');assert.equal(typeof handler,'function');
async function invoke(token,origin='http://localhost:8080'){
 const req={headers:{cookie:token?`wa_refresh=${token}`:''},get:k=>k==='Origin'?origin:null},res=response();
 await handler(req,res);return res;
}
(async()=>{
 const [a,b]=await Promise.all([invoke(secret),invoke(secret)]);
 assert.equal([a,b].filter(r=>r.statusCode===200).length,1);
 assert.equal([a,b].filter(r=>r.statusCode===401&&r.body?.error==='REFRESH_INVALID').length,1);
 assert.equal(rotations,1);assert.equal([a,b].filter(r=>r.cookies.length===1).length,1);
 const success=[a,b].find(r=>r.statusCode===200);
 assert.equal(success.headers['Cache-Control'],'no-store');assert.equal(success.cookies[0].k,'wa_refresh');
 const replay=await invoke(secret);assert.equal(replay.statusCode,401);assert.equal(replay.body.error,'REFRESH_INVALID');
 const invalidOrigin=await invoke(current,'https://invalid.example');assert.equal(invalidOrigin.statusCode,403);
 assert.equal(rotations,1);assert.equal(databaseConnections,0);assert.equal(emails,0);
 console.log('PASS actual users.js refresh-session handler: one simulated concurrent success, one 401 replay rejection.');
 console.log('PASS old-token replay 401, cross-origin request 403, cookie/cache response, no unexpected DB or email access.');
 console.log('LIMITATION: sessions.rotate is a controlled fake; real DB concurrency was tested separately in H109.');
 console.log('PASS isolation: no HTTP listener, database connection, email, account or source file modification.');
})().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1});
