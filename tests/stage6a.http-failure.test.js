'use strict';
// Actual route callbacks, loaded via VM with isolated dependencies. No database/network access.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve(__dirname,'../routes/users.js'),'utf8');
const original={hash:'original-hash',version:4,webRevoked:false,tnnaRevoked:false,resetUsed:false,resetRevoked:false};
const expectedStatus=500;
function makeCase(route, failure){
  const database={...original};const state={active:false,commit:0,rollback:0,release:0,queries:[],emails:0,cookieClears:0};
  let working=null;
  const conn={
    async beginTransaction(){assert.equal(state.active,false);state.active=true;working={...database};},
    async query(sql,args=[]){assert(state.active,'query outside transaction');state.queries.push(sql);
      if(sql.includes('SELECT PasswordHash FROM UsersT'))return [[{PasswordHash:working.hash}]];
      if(sql.startsWith('SELECT UserID FROM PasswordResetT WHERE TokenHash='))return [[{UserID:777}]];
      if(sql.includes('FROM PasswordResetT p JOIN UsersT u'))return [[{PasswordResetID:999,UserID:777,SecurityVersion:working.version,Email:'test@example.invalid',UserName:'isolated',PasswordHash:working.hash}]];
      if(sql.startsWith('UPDATE UsersT SET PasswordHash=')){working.hash=args[0];return [{affectedRows:1}];}
      if(sql.startsWith('UPDATE PasswordResetT SET UsedAt=')){working.resetUsed=true;return [{affectedRows:1}];}
      if(sql.startsWith('UPDATE PasswordResetT SET RevokedAt=')){working.resetRevoked=true;return [{affectedRows:1}];}
      throw Error('Unexpected query: '+sql.slice(0,100));
    },
    async commit(){assert(state.active);Object.assign(database,working);state.commit++;state.active=false;},
    async rollback(){assert(state.active);state.rollback++;state.active=false;working=null;},
    release(){state.release++;}
  };
  const pool={getConnection:async()=>conn,query:async()=>[[]]};
  const routes=new Map();const router={post(p,...callbacks){routes.set(p,callbacks.at(-1));},get(){}};
  const validator=new Proxy({}, {get:(_,name)=>name==='validationResult'?()=>({isEmpty:()=>true}):()=>new Proxy({}, {get:()=>()=>new Proxy({}, {get:()=>()=>({})})})});
  const mocks={
    express:{Router:()=>router},'express-validator':{body:()=>{const b={};for(const n of ['trim','notEmpty','matches','isLength','isEmail','optional','custom','isBoolean','withMessage'])b[n]=()=>b;return b;},validationResult:()=>({isEmpty:()=>true})},
    '../dbConnection':{pool},bcrypt:{compare:async(input,hash)=>input==='current-good'&&hash==='original-hash',hash:async()=> 'new-hash'},jsonwebtoken:{},
    '../utils':{handleDbError:(error,res)=>res.status(expectedStatus).json({error:'DB_OPERATION_FAILED'})},
    '../send_email':{sendVerificationCode:async()=>{},sendPasswordResetLink:async()=>{},sendPasswordChangedNotice:async()=>{state.emails++;}},
    '../services/browserSession':{requireOrigin:()=>{},revokeAll:async()=>{assert(state.active);working.webRevoked=true;working.tnnaRevoked=true;working.version++;if(failure==='revocation')throw Error('SIMULATED_DB_REVOCATION_ERROR');},clearCookie:()=>{state.cookieClears++;}},
    '../services/credentialFence':{lock:async(conn,userId)=>{assert.equal(userId,777);return working.version;},matches:(a,b)=>a===b},
    '../services/passwordResetLimiter':{allow:async()=>true}, '../middleware/auth':(req,res,next)=>next(), '../services/subscriptionService':{getOrCreateDevelopmentTrial:async()=>{}},
    '../services/notificationService':{getActiveConsentVersion:async()=>1,logConsent:async()=>{}},'dotenv':{config:()=>{}},crypto
  };
  const sandbox={require:name=>{if(Object.hasOwn(mocks,name))return mocks[name];throw Error('Unexpected require: '+name);},module:{exports:{}},exports:{},process:{env:{JWT_SECRET:'in-memory-test-only'}},console,URL,Date,Map,String,Error,Buffer,setTimeout};
  vm.runInNewContext(source,sandbox,{filename:'routes/users.js',timeout:3000});
  const handler=routes.get(route);assert.equal(typeof handler,'function',route+' route missing');
  const res={statusCode:200,body:null,status(n){this.statusCode=n;return this;},json(body){this.body=body;return this;},set(){return this;}};
  const req=route==='/change-password'?{user:{userId:777,client:'web'},body:{currentPassword:'current-good',newPassword:'new-password',confirmPassword:'new-password'}}:
    {body:{token:'a'.repeat(96),newPassword:'new-password',confirmPassword:'new-password'}};
  return {handler,req,res,database,state};
}
(async()=>{
  for(const route of ['/change-password','/reset-password']){
    const t=makeCase(route,'revocation');
    await t.handler(t.req,t.res);
    assert.equal(t.res.statusCode,500,route+' must return HTTP 500');
    assert.equal(t.res.body.error,'DB_OPERATION_FAILED');
    assert.equal(t.state.rollback,1,'rollback must be called');
    assert.equal(t.state.commit,0,'commit must not be called');
    assert.equal(t.state.release,1,'connection released once');
    assert.equal(t.state.emails,0,'no success email');
    assert.equal(t.state.cookieClears,0,'no success cookie modification');
    assert.deepEqual(t.database,original,'no stored fields altered');
    console.log('PASS '+route+': actual route caught injected revocation failure, returned 500, rolled back, released connection, and preserved all mocked stored data.');
  }
  console.log('PASS isolation: actual route handlers tested with in-memory database mocks; no MySQL connection, HTTP listener, or existing account writes.');
  console.log('LIMITATION: This exercises actual route callbacks with mocked dependencies, not a live HTTP request or production database fault.');
})().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1;});
