'use strict';
/**
 * Stage 6 R08 Step 15 — isolated authenticated Origin-guard regression.
 * Run from WA project root:
 *   node tests/stage6.r08.authenticated-origin.offline.test.js
 *
 * Only reads routes/users.js, middleware/auth.js and services/browserSession.js.
 * Never loads the real dbConnection, starts a server, sends email or writes files.
 * Actual requireOrigin from browserSession.js and actual auth middleware/route
 * callbacks execute with narrowly scoped in-memory module dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const PUBLIC_ORIGIN = 'https://wapps-stage6-test.onrender.com';
const counts = { db: 0, queries: 0, revocations: 0, cookieChanges: 0, emails: 0, bcrypt: 0, fence: 0, rotated: 0, authVerified: 0 };
const forbidden = name => { throw Error('FORBIDDEN SIDE EFFECT: ' + name); };
const pool = {
  getConnection() { counts.db++; return forbidden('database connection'); },
  query() { counts.queries++; return forbidden('database query'); }
};
const validator = {body() {const o={};for(const k of ['trim','notEmpty','matches','isLength','isEmail','optional','custom','isBoolean','withMessage'])o[k]=()=>o;return o;}, validationResult:()=>({isEmpty:()=>true})};
function moduleVM(source, filename, modules, extra={}) {
  const module={exports:{}};
  const sandbox={module,exports:module.exports,
    require: spec => { assert(Object.hasOwn(modules,spec),`Unexpected require in ${filename}: ${spec}`);return modules[spec]; },
    process:{env:{JWT_SECRET:'offline-test-only-secret'},exit:()=>forbidden('process.exit')},
    console,URL,Date,Map,Error,String,Buffer,Number,Boolean,setTimeout, ...extra};
  vm.runInNewContext(source,sandbox,{filename,timeout:3000});
  return module.exports;
}
const sessions = moduleVM(read('services/browserSession.js'),'services/browserSession.js',{
  './stage6Environment':{current:{publicOrigin:PUBLIC_ORIGIN,secureCookie:true}},
  crypto,
  jsonwebtoken:{sign:()=>forbidden('JWT signing')},
  './credentialFence':{}
});
const safeSessions = {
  ...sessions,
  revokeCurrent:async()=>{counts.revocations++;forbidden('revokeCurrent');},
  revokeAll:async()=>{counts.revocations++;forbidden('revokeAll');},
  clearCookie:()=>{counts.cookieChanges++;forbidden('clearCookie');},
  setCookie:()=>{counts.cookieChanges++;forbidden('setCookie');},
  rotate:async()=>{counts.rotated++;forbidden('rotate');}
};
const auth = moduleVM(read('middleware/auth.js'),'middleware/auth.js',{
  '../dbConnection':{pool},
  '../services/verifyAccessToken':{
    AuthenticationError:class AuthenticationError extends Error {},
    async verifyAccessToken() {
      counts.authVerified++;
      // Synthetic web claims; no JWT or real identity used.
      return {userId:777,username:'offline-fixture',client:'web',sessionPublicId:'offline-session'};
    }
  }
});
const routes=new Map();
const router={post(path,...callbacks){routes.set('POST '+path,callbacks);},get(){}};
moduleVM(read('routes/users.js'),'routes/users.js',{
  express:{Router:()=>router},'express-validator':validator,
  '../dbConnection':{pool},
  bcrypt:{compare:async()=>{counts.bcrypt++;forbidden('bcrypt.compare');},hash:async()=>{counts.bcrypt++;forbidden('bcrypt.hash');}},
  jsonwebtoken:{},'../utils':{handleDbError:()=>forbidden('handleDbError')},
  '../send_email':{
    sendVerificationCode:()=>{counts.emails++;forbidden('sendVerificationCode');},
    sendPasswordResetLink:()=>{counts.emails++;forbidden('sendPasswordResetLink');},
    sendPasswordChangedNotice:()=>{counts.emails++;forbidden('sendPasswordChangedNotice');}
  },
  crypto,'../services/browserSession':safeSessions,
  '../services/credentialFence':{lock:()=>{counts.fence++;forbidden('credentialFence.lock');}},
  '../middleware/auth':auth,
  '../services/subscriptionService':{},'../services/notificationService':{},
  '../services/passwordResetLimiter':{},
  '../services/passwordResetClientIp':{clientIpForReset:()=>forbidden('clientIpForReset')},
  dotenv:{config:()=>{}}
});
function request(origin,route) {
  const headers={authorization:'Bearer offline-not-a-real-token'};
  if(origin!==null)headers.origin=origin;
  return {
    body: route==='/change-password' ? {currentPassword:'synthetic-current',newPassword:'synthetic-new-password',confirmPassword:'synthetic-new-password'} : {},
    headers,
    get(key){return headers[key.toLowerCase()] || undefined;},
    user:null
  };
}
function response(){return {
  statusCode:200,body:null,ended:false,headers:{},
  status(v){this.statusCode=v;return this;},
  json(v){this.body=v;this.ended=true;return this;},
  set(k,v){this.headers[k.toLowerCase()]=v;return this;},
  cookie(){counts.cookieChanges++;forbidden('response.cookie');},
  clearCookie(){counts.cookieChanges++;forbidden('response.clearCookie');}
};}
async function call(route,origin){
  const callbacks=routes.get('POST '+route);
  assert(callbacks,`Route not found: ${route}`);
  const req=request(origin,route),res=response();
  // Execute actual Express route callback order without opening any HTTP listener.
  for(const callback of callbacks){
    if(res.ended)break;
    let nextCalled=false, nextError=null;
    await callback(req,res,err=>{nextCalled=true;nextError=err||null;});
    assert.equal(nextError,null,'middleware error');
    if(!res.ended && !nextCalled)break;
  }
  return res;
}
function assertNoEffects(){
  for(const [name,n] of Object.entries(counts)){
    if(name==='authVerified')continue;
    assert.equal(n,0,`${name} must not have been called`);
  }
}
(async()=>{
  let passed=0;
  for(const route of ['/logout','/change-password']){
    for(const [label,origin] of [['missing Origin',null],['foreign Origin','https://example.com']]){
      const res=await call(route,origin);
      assert.equal(res.statusCode,403,`${route}: ${label} should be HTTP 403`);
      assert.equal(res.body?.error,'ORIGIN_NOT_ALLOWED',`${route}: wrong error`);
      assertNoEffects();
      passed++;
      console.log(`PASS ${route}: authenticated fixture, ${label} => 403, no database, revocation, credential processing, cookies, or email`);
    }
  }
  assert.equal(counts.authVerified,4,'actual auth middleware should have executed for all four cases');
  // Exact-origin check isolated from handlers: authorized requests must not be
  // rejected by the Origin guard; we intentionally do not execute mutating paths.
  for(const origin of [PUBLIC_ORIGIN]){
    assert.doesNotThrow(()=>sessions.requireOrigin({get:k=>k==='Origin'?origin:undefined}));
    passed++;
    console.log('PASS real browserSession.requireOrigin: exact staging Origin accepted (no route mutation attempted)');
  }
  assertNoEffects();
  console.log(`PASS ${passed}/${passed} isolated assertions; no HTTP listener, real database, email, file mutations, or real credentials.`);
  console.log('LIMITATION: Authentication claims and database operations are mocked; these tests verify route ordering and actual Origin guard logic, not hosted database or network behavior.');
})().catch(e=>{console.error('FAIL:',e.stack||e);process.exitCode=1;});
