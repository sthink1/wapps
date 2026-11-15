'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {isExpectedClientError,markExpectedClientError} = require('../services/stage6ExpectedClientError');

// Reads the proposed server from an isolated extracted package, not the WA installation.
const source = fs.readFileSync(path.join(__dirname,'../server.js'), 'utf8');
const baselineSha = crypto.createHash('sha256').update(source).digest('hex');
assert.equal(baselineSha, '00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81');
const logs = [];
const registrations = [];
const stub = () => {};
const app = {use(...args){registrations.push(args)},get:stub,post:stub,listen(){throw new Error('Unexpected app.listen')} };
const express = Object.assign(()=>app,{json:()=>stub,urlencoded:()=>stub,static:()=>stub});
const logger={info:()=>{},error:(x)=>logs.push(String(x))};
function fakeRequire(id){
  switch(id){
    case 'dotenv':return {config:()=>({})};
    case './services/stage6Environment':return {current:{allowedOrigins:[]},LEGACY_CORS_ORIGINS:[]};
    case 'express':return express;
    case 'cors':return ()=>stub;
    case 'path':return path;
    case 'fs':return {existsSync:()=>true,mkdirSync:()=>{throw Error('Unexpected mkdirSync')}};
    case 'multer':return ()=>({none:()=>stub});
    case './send_email':return {sendEmail:stub};
    case './morgan':return stub;
    case './logger':return logger;
    case './dbConnection':return {pool:{},ready:Promise.resolve()};
    case './services/passwordResetRateCleanup':return {start:stub};
    case './services/stage6ExpectedClientError':return {isExpectedClientError};
    case './middleware/subscriptionAccess':return {authenticateToken:stub,requireAppAccess:()=>stub};
    case './middleware/usageActivity':return ()=>stub;
    case './routes/ftPrivacy':return {publicRouter:stub,privateRouter:stub,protection:stub};
    default: if(id.startsWith('./routes/'))return stub;
    throw new Error('Unrecognized import '+id);
  }
}
// Remove startup invocation in memory, while evaluating all original registrations.
const noStart = source.replace(/\nstart\(\)\.catch\(err => \{[\s\S]*?\n\}\);\s*$/, '\n/* test harness: startup deliberately omitted */\n');
assert.ok(noStart.includes('/* test harness: startup deliberately omitted */'));
vm.runInNewContext(noStart,{require:fakeRequire,__dirname,process:{env:{PORT:8080}},console:{log:stub,error:stub},module:{exports:{}}},{filename:'server.js'});
const errorRegistration=registrations.filter(args=>args.length===1&&typeof args[0]==='function'&&args[0].length===4);
assert.equal(errorRegistration.length,1,'Exactly one 4-arity central error middleware');
const handleError=errorRegistration[0][0];
const pathRegistrations=registrations.filter(args=>typeof args[0]==='string'||Array.isArray(args[0]));
const sensitive=['/users','/subscriptions','/admin-management','/notifications','/track','/tnna','/weights','/activities','/weightActivities','/interestEarned','/budget','/familytree','/etf'];
function makesRes(headersSent=false){return {statusCode:200,body:undefined,headersSent,headers:{},writes:0,set(k,v){this.headers[k.toLowerCase()]=v;return this;},status(x){this.statusCode=x;return this;},json(v){this.body=v;this.writes++;return this;}}}
function matchesPath(prefix,p){return p===prefix||p.startsWith(prefix+'/')}
function useRouteCache(pathname,res){for(const entry of pathRegistrations){const prefixes=Array.isArray(entry[0])?entry[0]:[entry[0]];if(prefixes.some(p=>matchesPath(p,pathname))){const f=entry[1];if(typeof f==='function'&&f.length===3){f({path:pathname},res,stub);}}}}
function runError({pathname,status=400,marked=false,viaRoute=false,headersSent=false}){
 const secret='T11_SYNTHETIC_NONREAL_SECRET__DO_NOT_EXPOSE';
 const err=Object.assign(new Error(secret),{status});if(marked)markExpectedClientError(err);
 const response=makesRes(headersSent);let delegated;
 if(viaRoute)useRouteCache(pathname,response);
 const begin=logs.length;
 handleError(err,{path:pathname},response,e=>delegated=e);
 return {response,delegated,logged:logs.slice(begin),secret,err};
}

test('T11-A every protected API prefix and child has no-store for parser-stage synthetic 400 and 500',()=>{
 for(const p of sensitive)for(const endpoint of [p,p+'/synthetic'])for(const status of [400,500]){
  const r=runError({pathname:endpoint,status});
  assert.equal(r.response.headers['cache-control'],'no-store',endpoint+' '+status);
  assert.equal(r.response.statusCode,status);
  assert.ok(!JSON.stringify(r.response.body).includes(r.secret));
  assert.ok(!JSON.stringify(r.logged).includes(r.secret));
 }
});
test('T11-B route-level no-store remains for protected paths before ordinary responses, 401, and 403',()=>{
 for(const p of sensitive)for(const endpoint of [p,p+'/synthetic']){
  const res=makesRes();useRouteCache(endpoint,res);
  assert.equal(res.headers['cache-control'],'no-store',endpoint);
  for(const status of [401,403]){
    const r=runError({pathname:endpoint,status,viaRoute:true});
    assert.equal(r.response.headers['cache-control'],'no-store');
    assert.ok(!JSON.stringify(r.response.body).includes(r.secret));
  }
 }
});
test('T11-C unrelated public paths and look-alike prefix are not assigned new no-store',()=>{
 const publicPaths=['/','/send-email','/api/geocode','/users-extra','/etf-stats','/familytrees','/contact-us'];
 for(const p of publicPaths){
  const r=runError({pathname:p,status:400});
  assert.equal(r.response.headers['cache-control'],undefined,p);
  assert.ok(!JSON.stringify(r.logged).includes(r.secret));
 }
});
test('T11-D messages are never included in central logs for marked/unmarked client or server errors',()=>{
 for(const p of ['/users','/budget','/etf','/notifications'])for(const status of [400,401,403,404,409,500,503])for(const marked of [false,true]){
  const r=runError({pathname:p,status,marked});
  assert.ok(!JSON.stringify(r.logged).includes(r.secret));
  assert.equal(r.logged.length,1);
  assert.match(r.logged[0],new RegExp(`HTTP ${status}; message omitted`));
  assert.equal(r.response.headers['cache-control'],'no-store');
  if(status>=500||!marked)assert.ok(!JSON.stringify(r.response.body).includes(r.secret));
 }
});
test('T11-E headers-sent does not overwrite a response or write cache headers',()=>{
 const r=runError({pathname:'/users',status:500,headersSent:true});
 assert.equal(r.delegated,r.err);
 assert.equal(r.response.writes,0);
 assert.equal(r.response.headers['cache-control'],undefined);
 assert.ok(!JSON.stringify(r.logged).includes(r.secret));
});
test('T11-F handler log text and catch-all do not record request URL',()=>{
 const s=source;
 assert.match(s,/404 - Not Found \(request URL omitted\)/);
 assert.match(s,/Request error \(HTTP \$\{statusCode\}; message omitted\)/);
 assert.ok(!s.includes('logger.error(err.message)'));
});
