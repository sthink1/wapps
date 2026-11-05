'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'..','routes','budget.js'), 'utf8');
function fixture() {
  const routes = [];
  let queryImpl = async () => [[{ RecurrenceID: 12 }]];
  const db = {
    query: (...a) => queryImpl(...a),
    beginTransaction: async()=>{},commit:async()=>{},rollback:async()=>{},release:()=>{}
  };
  const express = { Router: () => {
    const router = {use:()=>{}};
    for(const method of ['get','post','put','delete'])router[method]=(p,...fns)=>routes.push({method,path:p,fn:fns[fns.length-1]});
    return router;
  }};
  const param=()=>({isInt(){return this},withMessage(){return this}});
  const handleDbError = (_e,res,msg)=>res.status(500).json({error:msg});
  const requireMock = n => {
    if(n==='express')return express;
    if(n==='express-validator')return {param,validationResult:()=>({isEmpty:()=>true})};
    if(n==='../dbConnection')return {pool:db,getNextUserSpecificID:async()=>1};
    if(n==='../middleware/auth')return (_req,_res,next)=>next&&next();
    if(n==='../utils')return {handleDbError,withTransaction:async work=>work(db)};
    throw new Error('Unexpected dependency '+n);
  };
  const mod={exports:{}};
  const context=vm.createContext({require:requireMock,module:mod,exports:mod.exports,console,Date,Set,Map,Number,Math,Boolean,String,Error});
  vm.runInContext(source,context,{filename:'budget.js'});
  const call = async (method,p,body={},params={UserInID:'1'})=>{
    const entry=routes.find(r=>r.method===method&&r.path===p);assert.ok(entry,`Route ${method} ${p} retained`);
    const out={statusCode:200,payload:null,status(s){this.statusCode=s;return this},json(j){this.payload=j;return this}};
    await entry.fn({body,params,user:{userId:62}},out);
    return out;
  };
  return {routes,context,call,setQuery:fn=>{queryImpl=fn}};
}
const valid={FromName:'test',Description:'test',DateBegin:'2026-11-05',Amount:100,Active:true,Estimated:false,Recurrence:{FrequencyType:'OneTime',IntervalNumber:1}};

test('budget route registrations and 404 status remain',()=>{
  const f=fixture(); for(const m of ['post','put','delete'])assert.ok(f.routes.some(r=>r.method===m&&r.path.startsWith('/in')));
});
test('malformed source input keeps intentional HTTP 400 and (be)',async()=>{
  const f=fixture();const r=await f.call('post','/in',{});assert.equal(r.statusCode,400);assert.match(r.payload.error,/\(be\)$/);
});
test('internal exception with (be) suffix is never sent as HTTP 400 on create',async()=>{
  const f=fixture();f.setQuery(async()=>{throw new Error('SYNTHETIC_PRIVATE_DETAIL(be)')});
  const r=await f.call('post','/in',valid);assert.equal(r.statusCode,500);assert.doesNotMatch(JSON.stringify(r.payload),/SYNTHETIC_PRIVATE_DETAIL/);
});
test('internal exception with (be) suffix is never sent as HTTP 400 on update',async()=>{
  const f=fixture();f.setQuery(async()=>{throw new Error('SYNTHETIC_PRIVATE_DETAIL(be)')});
  const r=await f.call('put','/in/:UserInID',valid);assert.equal(r.statusCode,500);assert.doesNotMatch(JSON.stringify(r.payload),/SYNTHETIC_PRIVATE_DETAIL/);
});
test('explicit missing Budget record retains HTTP 404 and original message',async()=>{
  const f=fixture();f.setQuery(async()=>[[]]);
  const r=await f.call('put','/in/:UserInID',valid);assert.equal(r.statusCode,404);assert.equal(r.payload.error,'Budget record not found(be)');
});
test('unexpected exceptions with a forged 404 status do not expose messages',async()=>{
  const f=fixture();f.setQuery(async()=>{let e=new Error('SYNTHETIC_SECRET(be)');e.status=404;throw e});
  const r=await f.call('delete','/in/:UserInID');assert.equal(r.statusCode,500);assert.doesNotMatch(JSON.stringify(r.payload),/SYNTHETIC_SECRET/);
});
test('expected validation errors use explicit typed flag independent of (be) suffix',()=>{
  const f=fixture();let e=vm.runInContext("budgetExpectedError('expected(be)')",f.context);
  assert.equal(vm.runInContext('isBudgetExpected',f.context)(e,400),true);
  assert.equal(vm.runInContext('isBudgetExpected',f.context)({status:400,message:'fake(be)'},400),false);
});
test('recurrence normalization and preview distinguish expected from unexpected errors',()=>{
  assert.match(source,/if\(isBudgetExpected\(e,400\)\) return \{error:e\.message/);
  assert.match(source,/return \{unexpectedError:e\}/);
  assert.match(source,/if\(isBudgetExpected\(x,400\)\) return bad/);
  assert.match(source,/return handleDbError\(x,res,'Error calculating Budget recurrence preview'\)/);
});
