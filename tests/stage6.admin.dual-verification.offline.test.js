'use strict';
// Isolated security regression. Does NOT connect to MySQL, Render, or send emails.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
function evaluate(filename, modules, env) {
  const mod={exports:{}};
  vm.runInNewContext(read(filename), {
    module:mod,exports:mod.exports,require(id){ if(!Object.hasOwn(modules,id)) throw Error('Unexpected module: '+id); return modules[id]; },
    process:{env},console,Buffer,Date,setTimeout,clearTimeout
  },{filename,timeout:1000});
  return mod.exports;
}
function user(id,name,flag=0) {return {UserID:id,UserName:name,IsAdministrator:flag,PasswordHash:'offline-good-password-hash'};}
function fixture() {
  const env={ADMIN_USERNAME:'sthink'};
  const accounts=[user(1,'sthink',1),user(42,'egalvin',0),user(40,'eg',0)];
  const state={ControlID:1,TokenHash:null};
  const audit=[];const writes=[];
  const db={
    async query(sql,args=[]) {
      if(sql.includes('FROM UsersT WHERE UserID=?')) {
        const u=accounts.find(x=>x.UserID===Number(args[0]));
        if(sql.startsWith('SELECT UserID,UserName FROM')) return [[...(u?[{UserID:u.UserID,UserName:u.UserName}]:[])]];
        return [[...(u?[{...u}]:[])]];
      }
      if(sql.includes('FROM UsersT WHERE IsAdministrator=1')) return [accounts.filter(x=>x.IsAdministrator===1).map(x=>({...x}))];
      if(sql.includes('FROM AdminTransferStateT')) return [[{...state}]];
      if(sql.startsWith('UPDATE AdminTransferStateT SET InitiatorUserID=')) {
        Object.assign(state,{InitiatorUserID:args[0],InitiatorUserName:args[1],InitiatorSessionPublicID:args[2],TargetUserID:args[3],TargetUserName:args[4],TokenHash:args[5],CreatedAt:new Date(),ExpiresAt:args[6],CompletedAt:null,CancelledAt:null});
        writes.push(sql);return [{affectedRows:1}];
      }
      if(sql.startsWith('UPDATE AdminTransferStateT SET CancelledAt=')) {state.CancelledAt=new Date();writes.push(sql);return [{affectedRows:1}];}
      if(sql.startsWith('UPDATE AdminTransferStateT SET CompletedAt=')) {state.CompletedAt=new Date();writes.push(sql);return [{affectedRows:1}];}
      if(sql.startsWith('UPDATE UsersT SET IsAdministrator=0')) {accounts.forEach(x=>x.IsAdministrator=0);writes.push(sql);return [{affectedRows:accounts.length}];}
      if(sql.startsWith('UPDATE UsersT SET IsAdministrator=1')) {accounts.find(x=>x.UserID===Number(args[0])).IsAdministrator=1;writes.push(sql);return [{affectedRows:1}];}
      if(sql.startsWith('INSERT INTO AdminTransferAuditT')) {audit.push(args);writes.push(sql);return [{insertId:audit.length}];}
      throw Error('Unexpected SQL: '+sql);
    },
    async getConnection(){return {query:(...args)=>db.query(...args),async beginTransaction(){},async commit(){},async rollback(){},release(){}};}
  };
  const service=evaluate('services/administratorAccess.js',{'../dbConnection':{pool:db}},env);
  const routes=new Map(); const middleware=[];
  const router={use(...fn){middleware.push(...fn);},get(p,...fn){routes.set('GET '+p,fn);},post(p,...fn){routes.set('POST '+p,fn);}};
  const pass=(req,res,next)=>next();
  const route=evaluate('routes/adminManagement.js',{
    express:{Router:()=>router},crypto,
    bcrypt:{compare:async(passwd,hash)=>passwd==='correct-password' && hash==='offline-good-password-hash'},
    '../middleware/auth':pass,
    '../services/browserSession':{requireOrigin(req){if(req.origin!=='https://staging.test') throw Error('bad origin');}},
    '../dbConnection':{pool:db},
    '../services/administratorAccess':service
  },env);
  assert.equal(route,router);
  async function call(method,p,body={},subject={userId:1,username:'sthink',client:'web',sessionPublicId:'0123456789abcdef0123456789abcdef'}) {
    let status=200,result,error;
    const req={user:subject,body,params:{userId:p.includes(':')?1:42},origin:'https://staging.test'};
    const res={status(n){status=n;return this;},json(obj){result=obj;return this;}};
    const handler=routes.get(method+' '+p);
    assert.ok(handler,'Unknown route '+p);
    const chain=[...middleware,...handler];
    for(const cb of chain){
      let continued=false;
      await cb(req,res,(err)=>{if(err) error=err;else continued=true;});
      if(error || !continued)break;
    }
    if(error)throw error;
    return {status,result};
  }
  return {env,accounts,state,audit,writes,db,service,call};
}
test('configured administrator must match BOTH current username and flag',async()=>{
  const f=fixture();
  assert.equal(await f.service.isVerifiedAdministrator({userId:1,username:'spoofed'}),true);
  assert.equal(await f.service.isVerifiedAdministrator({userId:42,username:'sthink'}),false);
  f.accounts[0].IsAdministrator=0;
  assert.equal(await f.service.isVerifiedAdministrator({userId:1,username:'sthink'}),false);
});
test('hardcoded UserID 1 no longer confers privilege',async()=>{
  const f=fixture();f.env.ADMIN_USERNAME='egalvin';
  assert.equal(await f.service.isVerifiedAdministrator({userId:1,username:'sthink'}),false);
  assert.equal(await f.service.isVerifiedAdministrator({userId:42,username:'egalvin'}),false);
});
test('deleted/recreated username requires deliberate flag assignment',async()=>{
  const f=fixture();f.accounts.splice(0,1);f.accounts.push(user(50,'sthink',0));
  assert.equal(await f.service.isVerifiedAdministrator({userId:50,username:'sthink'}),false);
  f.accounts[2].IsAdministrator=1;
  assert.equal(await f.service.isVerifiedAdministrator({userId:50,username:'sthink'}),true);
});
test('missing config fails closed',async()=>{
  const f=fixture();f.env.ADMIN_USERNAME='';
  assert.equal(await f.service.isVerifiedAdministrator({userId:1}),false);
});
test('database failure does not become admin success',async()=>{
  const f=fixture();await assert.rejects(()=>f.service.isVerifiedAdministrator({userId:1},{query:async()=>{throw Error('offline database outage');}}));
});
test('prepare transfer requires current password',async()=>{
  const f=fixture();const r=await f.call('POST','/prepare',{targetUserId:42,password:'bad'});
  assert.equal(r.status,403);assert.equal(f.state.TokenHash,null);
});
test('prepare generates opaque hashed one-time authorization and audit record',async()=>{
  const f=fixture();const r=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  assert.equal(r.status,200);assert.match(r.result.transferToken,/^[a-f0-9]{64}$/);
  assert.notEqual(f.state.TokenHash,r.result.transferToken);assert.equal(f.audit.length,1);
});
test('Render mismatch blocks completion and preserves designation',async()=>{
  const f=fixture();const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  const r=await f.call('POST','/complete',{transferToken:p.result.transferToken});
  assert.equal(r.status,409);assert.equal(f.accounts[0].IsAdministrator,1);assert.equal(f.accounts[1].IsAdministrator,0);
});
test('after Render match, transfer atomically changes active designation',async()=>{
  const f=fixture();const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  f.env.ADMIN_USERNAME='egalvin';
  const r=await f.call('POST','/complete',{transferToken:p.result.transferToken});
  assert.equal(r.status,200);assert.equal(f.accounts[0].IsAdministrator,0);assert.equal(f.accounts[1].IsAdministrator,1);
  assert.equal(f.audit.length,2);
  assert.equal(await f.service.isVerifiedAdministrator({userId:42,username:'egalvin'}),true);
});
test('completed one-time token cannot be replayed',async()=>{
  const f=fixture();const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  f.env.ADMIN_USERNAME='egalvin';await f.call('POST','/complete',{transferToken:p.result.transferToken});
  const r=await f.call('POST','/complete',{transferToken:p.result.transferToken});assert.equal(r.status,403);
});
test('initiating session must match for completion',async()=>{
  const f=fixture();const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  f.env.ADMIN_USERNAME='egalvin';
  const r=await f.call('POST','/complete',{transferToken:p.result.transferToken},{userId:1,username:'sthink',client:'web',sessionPublicId:'ffffffffffffffffffffffffffffffff'});
  assert.equal(r.status,403);
});
test('expired transfer cannot complete',async()=>{
  const f=fixture();const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  f.state.ExpiresAt=new Date(Date.now()-1000);f.env.ADMIN_USERNAME='egalvin';
  const r=await f.call('POST','/complete',{transferToken:p.result.transferToken});assert.equal(r.status,403);
});
test('renamed target account prevents completion',async()=>{
  const f=fixture();const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  f.accounts[1].UserName='changed';f.env.ADMIN_USERNAME='egalvin';
  const r=await f.call('POST','/complete',{transferToken:p.result.transferToken});assert.equal(r.status,409);
});
test('transfer UI requires Render match before enabling completion',()=>{
  const ui=read('httpdocs/SubControl.html');
  assert.match(ui,/adminCompleteBtn'\)\.disabled = !state\.renderMatches/);
  assert.match(ui,/sessionStorage\.setItem\(ADMIN_TRANSFER_STORAGE/);
  assert.match(ui,/Render ADMIN_USERNAME/);
});
test('all active authorization implementations avoid UserID 1 shortcut',()=>{
  for(const file of ['middleware/subscriptionAccess.js','routes/subscriptions.js','routes/track.js','routes/tnna.js','routes/users.js']) {
    assert.doesNotMatch(read(file),/user\.userId\)\s*===\s*1/);
  }
});

test('administrator can cancel a prepared transfer while Render still matches initiator',async()=>{
  const f=fixture();
  const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  const r=await f.call('POST','/cancel',{transferToken:p.result.transferToken});
  assert.equal(r.status,200);assert.ok(f.state.CancelledAt);
  assert.equal(f.accounts[0].IsAdministrator,1);assert.equal(f.accounts[1].IsAdministrator,0);
  assert.equal(f.audit.at(-1)[0],'CANCELLED');
});
test('cancelled token cannot complete or be cancelled again',async()=>{
  const f=fixture();
  const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  await f.call('POST','/cancel',{transferToken:p.result.transferToken});
  assert.equal((await f.call('POST','/cancel',{transferToken:p.result.transferToken})).status,403);
  f.env.ADMIN_USERNAME='egalvin';
  assert.equal((await f.call('POST','/complete',{transferToken:p.result.transferToken})).status,403);
});
test('cannot cancel if Render has switched to the target, preserving recoverability',async()=>{
  const f=fixture();
  const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  f.env.ADMIN_USERNAME='egalvin';
  const r=await f.call('POST','/cancel',{transferToken:p.result.transferToken});
  assert.equal(r.status,409);assert.equal(f.state.CancelledAt,null);
  assert.equal(f.accounts[0].IsAdministrator,1);assert.equal(f.audit.length,1);
});
test('cancel requires same initiating web session',async()=>{
  const f=fixture();
  const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  const r=await f.call('POST','/cancel',{transferToken:p.result.transferToken},{userId:1,username:'sthink',client:'web',sessionPublicId:'ffffffffffffffffffffffffffffffff'});
  assert.equal(r.status,403);assert.equal(f.state.CancelledAt,null);
});
test('cancel rejects an invalid token and preserves active transfer',async()=>{
  const f=fixture();
  await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  const r=await f.call('POST','/cancel',{transferToken:'0'.repeat(64)});
  assert.equal(r.status,403);assert.equal(f.state.CancelledAt,null);
});
test('cancelled transfer can be replaced with a fresh authorization',async()=>{
  const f=fixture();
  const p=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  await f.call('POST','/cancel',{transferToken:p.result.transferToken});
  const next=await f.call('POST','/prepare',{targetUserId:42,password:'correct-password'});
  assert.equal(next.status,200);assert.notEqual(next.result.transferToken,p.result.transferToken);
});
test('cancellation control is present and status-based in SubControl',()=>{
  const html=read('httpdocs/SubControl.html');
  assert.match(html,/id="adminCancelBtn"/);
  assert.match(html,/adminApi\('cancel'/);
  assert.match(html,/state\.initiatorUsername/);
  assert.match(html,/#adminCurrentStatus\s*\{\s*display:\s*block/);
});
