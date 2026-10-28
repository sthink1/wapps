'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname,'../httpdocs/js/waPlatform.js'),'utf8');
function boot({ token, cookieToken='NEW', locks=true, handler } = {}) {
  const store = new Map(token ? [['token',token]] : []);
  const calls=[];
  let serial=Promise.resolve();
  const w={
    location:{origin:'http://localhost:8080'},
    localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    navigator:locks?{locks:{request:(_name,_opts,cb)=>{const result=serial.then(cb);serial=result.catch(()=>{});return result;}}}:{},
    atob: s=>Buffer.from(s,'base64').toString('binary'),
    fetch:async (p,opts)=>{calls.push({p,opts});if(handler)return handler(p,opts);if(p==='/users/refresh-session')return Response.json({token:cookieToken});if(p==='/users/session-status')return Response.json({authenticated:true});if(p==='/users/logout')return Response.json({message:'ok'});return Response.json({ok:true});}
  };
  vm.runInNewContext(source,{window:w,Headers,URL,Date,Error,TypeError,Promise});
  return {WA:w.WA,calls,store};
}
function jwt(exp){return 'h.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.sig';}
const valid=jwt(Math.floor(Date.now()/1000)+3600),expired=jwt(1);
test('restores a valid web session using session-status without rotation',async()=>{
  const b=boot({token:valid});const s=await b.WA.session.restore();assert.equal(s.authenticated,true);assert.equal(b.calls.length,1);assert.equal(b.calls[0].p,'/users/session-status');
});
test('expired token triggers one refresh then GET request',async()=>{
  const b=boot({token:expired,cookieToken:valid});assert.equal((await b.WA.api.json('/budget/money')).ok,true);assert.deepEqual(b.calls.map(x=>x.p),['/users/refresh-session','/budget/money']);assert.equal(b.store.get('token'),valid);
});
test('401 GET is retried once after rotation; 403 does not rotate',async()=>{
  let seen=0;const b=boot({token:valid,cookieToken:jwt(Math.floor(Date.now()/1000)+7200),handler:(p)=>{
    if(p==='/users/refresh-session')return Response.json({token:jwt(Math.floor(Date.now()/1000)+7200)});
    if(p==='/data'){seen++;return seen===1?Response.json({error:'EXPIRED'},{status:401}):Response.json({ok:true});}
  }});assert.equal((await b.WA.api.json('/data')).ok,true);assert.equal(b.calls.length,3);
  const c=boot({token:valid,handler:()=>Response.json({error:'FORBIDDEN'},{status:403})});await assert.rejects(c.WA.api.json('/admin'),e=>e.status===403);assert.equal(c.calls.length,1);
});
test('unsafe POST returns original 401 and is not repeated',async()=>{
  let hits=0;const b=boot({token:valid,cookieToken:jwt(Math.floor(Date.now()/1000)+7300),handler:p=>p==='/users/refresh-session'?Response.json({token:jwt(Math.floor(Date.now()/1000)+7300)}):(hits++,Response.json({error:'UNAUTHORIZED'},{status:401}))});
  const r=await b.WA.api.request('/budget/money',{method:'POST',body:'{}'});assert.equal(r.status,401);assert.equal(hits,1);
});
test('logout revokes server before clearing token',async()=>{
  const b=boot({token:valid});const r=await b.WA.session.logout();assert.equal(r.serverRevoked,true);assert.equal(b.calls[0].p,'/users/logout');assert.equal(b.store.get('token'),undefined);assert.equal((await b.WA.session.restore()).reason,'explicit_logout');
});
test('logout failure clears local token without claiming server revocation',async()=>{
  const b=boot({token:valid,handler:()=>{throw Error('offline');}});const r=await b.WA.session.logout();assert.equal(r.serverRevoked,false);assert.equal(b.store.get('token'),undefined);assert.ok(r.error);
});
test('cross-tab lock unavailable fails closed',async()=>{
  const b=boot({token:expired,locks:false});const r=await b.WA.session.restore();assert.equal(r.authenticated,false);assert.equal(r.error.message,'CROSS_TAB_LOCK_UNAVAILABLE');
});
test('same-origin only: never send Bearer to external origin',async()=>{
  const b=boot({token:valid});await assert.rejects(b.WA.api.request('https://evil.invalid/'),/ABSOLUTE_LOCAL_PATH_REQUIRED|SAME_ORIGIN_PATH_REQUIRED/);assert.equal(b.calls.length,0);
});
test('concurrent refresh within tab is single-flight',async()=>{
  const b=boot({token:expired,cookieToken:valid});const [a,c]=await Promise.all([b.WA.session.restore(),b.WA.session.restore()]);assert.equal(a.authenticated,true);assert.equal(c.authenticated,true);assert.equal(b.calls.filter(x=>x.p==='/users/refresh-session').length,1);
});

test('refresh failure with expired token does not send protected API request', async () => {
  const b=boot({token:expired,handler:p=>p==='/users/refresh-session'?Response.json({error:'REFRESH_INVALID'},{status:401}):Response.json({ok:true})});
  await assert.rejects(b.WA.api.request('/budget/money'),e=>e.status===401);
  assert.deepEqual(b.calls.map(c=>c.p),['/users/refresh-session']);
});
test('mutation 401 neither refreshes nor replays; original response preserved',async()=>{
  const b=boot({token:valid,handler:p=>Response.json({error:'DENIED'},{status:401})});
  const r=await b.WA.api.request('/budget/money',{method:'POST',body:'{}'});
  assert.equal(r.status,401);assert.deepEqual(b.calls.map(c=>c.p),['/budget/money']);
});
test('expired remembered session refreshes then revokes server on logout',async()=>{
  const b=boot({token:expired,cookieToken:valid});const r=await b.WA.session.logout();
  assert.equal(r.serverRevoked,true);assert.equal(b.store.has('token'),false);
  assert.deepEqual(b.calls.map(c=>c.p),['/users/refresh-session','/users/logout']);
});
test('expired ordinary session with rejected refresh clears local token and reports unconfirmed revocation',async()=>{
  const b=boot({token:expired,handler:p=>p==='/users/refresh-session'?Response.json({error:'REFRESH_INVALID'},{status:401}):Response.json({ok:true})});
  const r=await b.WA.session.logout();assert.equal(r.serverRevoked,false);
  assert.equal(b.store.has('token'),false);assert.deepEqual(b.calls.map(c=>c.p),['/users/refresh-session']);
});
test('explicit logout prevents restoration until a new login',async()=>{
  const b=boot({token:valid});await b.WA.session.logout();
  assert.equal((await b.WA.session.restore()).reason,'explicit_logout');
  b.WA.session.setAccessToken(valid);
  assert.equal((await b.WA.session.restore()).authenticated,true);
});
test('ordinary expired session without refresh cookie returns login_required',async()=>{
  const b=boot({token:expired,handler:p=>p==='/users/refresh-session'?Response.json({error:'REFRESH_INVALID'},{status:401}):Response.json({ok:true})});
  const r=await b.WA.session.restore();assert.equal(r.authenticated,false);assert.equal(r.reason,'login_required');
});
test('server remains authority on remembered versus ordinary browser restart',async()=>{
  const ordinary=boot({token:valid});assert.equal((await ordinary.WA.session.restore()).authenticated,true);
  const expiredOrdinary=boot({token:expired,handler:p=>p==='/users/refresh-session'?Response.json({error:'REFRESH_INVALID'},{status:401}):Response.json({ok:true})});
  assert.equal((await expiredOrdinary.WA.session.restore()).authenticated,false);
  const remembered=boot({token:expired,cookieToken:valid});assert.equal((await remembered.WA.session.restore()).authenticated,true);
});
test('caller-supplied Authorization header cannot override WA token',async()=>{
  const b=boot({token:valid});await b.WA.api.request('/budget/money',{headers:{Authorization:'Bearer malicious'}});
  assert.equal(b.calls[0].opts.headers.get('Authorization'),`Bearer ${valid}`);
});
test('two tabs with shared lock and storage rotate the refresh cookie once',async()=>{
  const store=new Map([['token',expired]]), calls=[];let serial=Promise.resolve(),refreshes=0;
  const make=()=>{
    const w={location:{origin:'http://localhost:8080'},
      localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
      navigator:{locks:{request:(_name,_opts,cb)=>{const p=serial.then(cb);serial=p.catch(()=>{});return p;}}},
      atob:s=>Buffer.from(s,'base64').toString('binary'),
      fetch:async(p,opts)=>{calls.push({p,opts});if(p==='/users/refresh-session'){refreshes++;return Response.json({token:valid});}return Response.json({ok:true});}};
    vm.runInNewContext(source,{window:w,Headers,URL,Date,Error,TypeError,Promise});return w.WA;
  };
  const a=make(),b=make();const [x,y]=await Promise.all([a.session.restore(),b.session.restore()]);
  assert.equal(x.authenticated,true);assert.equal(y.authenticated,true);assert.equal(refreshes,1);
});
test('refresh response cannot overwrite an intervening explicit different-account login',async()=>{
  let release;const gate=new Promise(resolve=>release=resolve);
  const newLogin=jwt(Math.floor(Date.now()/1000)+8100);
  const b=boot({token:expired,handler:async p=>{if(p==='/users/refresh-session'){await gate;return Response.json({token:valid});}return Response.json({ok:true});}});
  const pending=b.WA.session.restore();
  // Wait for the asynchronous lock callback to start (without time-based sleeps).
  await Promise.resolve();await Promise.resolve();
  b.WA.session.setAccessToken(newLogin);release();
  const r=await pending;assert.equal(r.authenticated,false);assert.equal(b.store.get('token'),newLogin);
});
