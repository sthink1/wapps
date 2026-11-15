'use strict';
// R16-75 T07: offline synthetic tests of the authoritative source-compatible
// catch-all handler and authentication / subscription middleware.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..'); // Works from an isolated copy or WA test folder
const packageRoot = ROOT;
const read = p => fs.readFileSync(p,'utf8');
function load(code, mockedRequire, extra = {}) {
 const ctx={module:{exports:{}},exports:{},require:mockedRequire,process:{env:{JWT_SECRET:'synthetic-test-only'}},...extra};
 vm.runInNewContext(code, ctx);
 return ctx.module.exports;
}
function response() {return {statusCode:200,body:null,headers:{},writes:0,status(n){this.statusCode=n;return this;},json(obj){this.body=obj;this.writes++;return this;},set(k,v){this.headers[k]=v;return this;}};}
function exact(obj){return JSON.parse(JSON.stringify(obj));}
const source=read(path.join(packageRoot,'server.js'));
const target=source.indexOf('// Catch-all route for undefined endpoints');
const end=source.indexOf('// Centralized Error-Handling Middleware',target);
const catchall=source.slice(target,end);
function getCatchAll(){const uses=[];const logs=[];vm.runInNewContext(catchall,{app:{use:fn=>uses.push(fn)},logger:{error:msg=>logs.push(msg)}});assert.equal(uses.length,1);return {fn:uses[0],logs};}
const authSource=read(path.join(ROOT,'middleware/auth.js'));
const accessSource=read(path.join(ROOT,'middleware/subscriptionAccess.js'));
const authModule=load(authSource, id => {
 if(id==='../dbConnection')return {pool:{}};
 if(id==='../services/verifyAccessToken'){class AuthenticationError extends Error {constructor(status,code){super(code);this.status=status;this.code=code;}}return {AuthenticationError,verifyAccessToken:async token=>{if(token==='invalid')throw new AuthenticationError(401,'TOKEN_INVALID');return {userId:17,client:token==='native'?'native':'web'};}};}
 throw Error('Unexpected import '+id);
});
let grants={allowed:false,reason:'SUBSCRIPTION_REQUIRED',app:{AppName:'Budget'}};
const access=load(accessSource,id=>{
 if(id==='jsonwebtoken')return {};
 if(id==='../services/subscriptionService')return {getAppAccess:async()=>grants};
 if(id==='../services/administratorAccess')return {isVerifiedAdministrator:async()=>false};
 if(id==='./auth')return authModule;
 throw Error('Unexpected import '+id);
});
function req(token){return {user:{userId:17,client:'web'},get:key=>key==='Authorization'&&token?'Bearer '+token:'',path:'/budget/money'};}
const usesIndex=source.indexOf('// API routes');
const catchallIndex=source.indexOf('// Catch-all route for undefined endpoints');
function guarded(){return source.slice(usesIndex,catchallIndex);}

test('T07-A catch-all 404 retains exact flat response and sanitized log',()=>{
 const {fn,logs}=getCatchAll(); const res=response();fn({path:'/missing/very-secret',originalUrl:'/missing/very-secret?token=SYNTHETIC_T07_SECRET'},res);
 assert.equal(res.statusCode,404);assert.deepEqual(exact(res.body),{error:'Endpoint not found'});assert.equal(res.writes,1);
 assert.equal(logs.length,1);assert.equal(logs[0],'404 - Not Found (request URL omitted)');
 assert.ok(!JSON.stringify(logs).includes('SYNTHETIC_T07_SECRET'));
});
test('T07-B direct auth: no bearer => existing 401 flat error, no next',async()=>{
 const res=response();let nextCount=0;await authModule(req(null),res,()=>nextCount++);
 assert.equal(res.statusCode,401);assert.deepEqual(exact(res.body),{error:'Access denied. No token provided.'});assert.equal(nextCount,0);
});
test('T07-C direct auth: invalid bearer => existing coded 401, no next',async()=>{
 const res=response();let nextCount=0;await authModule(req('invalid'),res,()=>nextCount++);
 assert.equal(res.statusCode,401);assert.deepEqual(exact(res.body),{error:'TOKEN_INVALID'});assert.equal(nextCount,0);
});
test('T07-D native token on browser endpoint => flat 403, no next',async()=>{
 const res=response();let nextCount=0;await access.authenticateToken(req('native'),res,()=>nextCount++);
 assert.equal(res.statusCode,403);assert.deepEqual(exact(res.body),{error:'WEB_SESSION_REQUIRED'});assert.equal(nextCount,0);
});
test('T07-E subscription denied => existing 403 fields, no next',async()=>{
 const res=response();let nextCount=0;const request=req('valid');request.user={userId:17,client:'web'};
 grants={allowed:false,reason:'SUBSCRIPTION_REQUIRED',app:{AppName:'Budget'}};
 await access.requireAppAccess('budget')(request,res,()=>nextCount++);
 assert.equal(res.statusCode,403);assert.deepEqual(exact(res.body),{error:'Subscription access denied.',reason:'SUBSCRIPTION_REQUIRED',app:'Budget'});assert.equal(nextCount,0);
});
test('T07-F positive auth and subscription allowed => next invoked, no 401/403',async()=>{
 const r=req('valid'); const res=response();let count=0;
 await access.authenticateToken(r,res,()=>count++); assert.equal(count,1); assert.equal(r.user.userId,17);
 grants={allowed:true,reason:'ACTIVE_SUBSCRIPTION',app:{AppName:'Budget'}};
 await access.requireAppAccess('budget')(r,res,()=>count++);
 assert.equal(count,2);assert.equal(res.writes,0);assert.equal(r.subscriptionAccess.allowed,true);
});
test('T07-G source route order and route-level no-store preserved',()=>{
 const block=guarded();
 for(const name of ["'/users'","'/subscriptions'","'/admin-management'","'/budget'","'/familytree'","'/etf'"]){assert.ok(block.includes(name),'Missing route '+name);}
 assert.ok(block.includes("res.set('Cache-Control', 'no-store')"));
 assert.ok(source.indexOf('// Catch-all route for undefined endpoints') > source.indexOf("app.use('/etf'"));
 assert.ok(source.indexOf('// Centralized Error-Handling Middleware')>source.indexOf('// Catch-all route for undefined endpoints'));
 // Raw route responses, not the central error handler, implement these 401/403 shapes.
 assert.ok(!accessSource.includes('isExpectedClientError'));
});
