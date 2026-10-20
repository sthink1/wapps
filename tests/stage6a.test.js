'use strict';
// Standalone simulation tests: test security logic without live DB writes.
// Uses a small fake jsonwebtoken adapter where real dependency is not present.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const Module=require('module');
const originalLoad=Module._load;
process.env.DB_NAME='sql5838929';process.env.JWT_SECRET='local-test';
let tokenCounter=0;
Module._load=function(request,parent,isMain){
 if(request==='jsonwebtoken')return {sign(payload,secret,opts){assert.equal(secret,'local-test');return JSON.stringify({...payload,exp:Date.now()+8*3600000,serial:++tokenCounter});},verify(raw,secret){if(secret!=='local-test')throw Error('wrong key');const p=JSON.parse(raw);if(p.exp<Date.now())throw Error('expired');return p;}};
 return originalLoad.apply(this,arguments);
};
const session=require('../services/browserSession');
const {verifyAccessToken,AuthenticationError}=require('../services/verifyAccessToken');
Module._load=originalLoad;
function makeConn(){
 const state={users:{7:1},sessions:[],tokens:[],nextSession:1,nextToken:1,tnnaRevoked:false,queries:[]};
 const c={
  async beginTransaction(){state.tx=true},async commit(){state.tx=false},async rollback(){state.tx=false},release(){},
  async query(sql,args=[]){state.queries.push(sql);
   if(sql.startsWith('SELECT SecurityVersion'))return [[{SecurityVersion:state.users[args[0]]}]];
   if(sql.startsWith('INSERT INTO WebSessionT')){const id=state.nextSession++;state.sessions.push({id,userId:args[0],sid:args[1],remembered:args[2],expire:args[3],abs:args[4],revoked:false});return [{insertId:id}];}
   if(sql.startsWith('INSERT INTO WebRefreshTokenT')){const id=state.nextToken++;state.tokens.push({id,sid:args[0],hash:args[1],parent:args[2],expire:args[3],consumed:false,revoked:false});return [{insertId:id}];}
   if(sql.includes('FROM WebRefreshTokenT r JOIN')){const token=state.tokens.find(t=>t.hash===args[0]);if(!token)return [[]];const ss=state.sessions.find(s=>s.id===token.sid);return [[{WebRefreshTokenID:token.id,WebSessionID:ss.id,ConsumedAt:token.consumed?new Date():null,RevokedAt:token.revoked?new Date():null,TokenExpires:token.expire,UserID:ss.userId,IsRemembered:ss.remembered,SessionRevoked:ss.revoked?new Date():null,AbsoluteExpiresAt:ss.abs,SessionExpires:ss.expire,SessionPublicID:ss.sid,UserName:'test',SecurityVersion:state.users[ss.userId]}]];}
   if(sql.startsWith('UPDATE WebRefreshTokenT SET ConsumedAt')){const t=state.tokens.find(t=>t.id===args[0]);if(t.consumed)return [{affectedRows:0}];t.consumed=true;return [{affectedRows:1}];}
   if(sql.startsWith('UPDATE WebSessionT SET ExpiresAt')){let ss=state.sessions.find(s=>s.id===args[1]);ss.expire=args[0];return [{affectedRows:1}];}
   if(sql.startsWith('UPDATE WebSessionT SET RevokedAt')){state.sessions.forEach(s=>{if(s.userId===args[0]&&(!args[1]||s.sid===args[1]))s.revoked=true});return [{affectedRows:1}];}
   if(sql.startsWith('UPDATE TNNARefreshTokenT')){state.tnnaRevoked=true;return [{affectedRows:1}];}
   if(sql.startsWith('UPDATE UserSecurityT')){state.users[args[0]]++;return [{affectedRows:1}];}
   if(sql.includes('FROM WebSessionT')&&sql.includes('AbsoluteExpiresAt')){return [state.sessions.filter(s=>s.userId===args[0]&&s.sid===args[1]&&!s.revoked&&s.expire>args[2]&&s.abs>args[3]).map(s=>({WebSessionID:s.id}))];}
   throw Error('Unknown simulated query: '+sql);
  }
 };return {c,state,pool:{getConnection:async()=>c,query:(...a)=>c.query(...a)}};
}
(async()=>{
 const {c,state,pool}=makeConn();
 const user={UserID:7,UserName:'test'};
 const w=await session.create(c,user,true);assert.equal(state.sessions.length,1);assert.equal(state.tokens.length,1);assert.equal(w.refresh.secret.length,96);
 let decoded=await verifyAccessToken(w.token,{database:c,jwtSecret:'local-test'});assert.equal(decoded.client,'web');
 const r=await session.rotate(pool,w.refresh.secret);assert.equal(state.tokens.length,2);assert.equal(state.tokens[0].consumed,true);assert.equal(r.refresh.secret.length,96);
 await assert.rejects(session.rotate(pool,w.refresh.secret),e=>e.message==='REFRESH_INVALID');
 await session.revokeCurrent(pool,{userId:7,sessionPublicId:decoded.sessionPublicId});
 await assert.rejects(verifyAccessToken(r.token,{database:c,jwtSecret:'local-test'}),e=>e instanceof AuthenticationError&&e.code==='SESSION_EXPIRED_OR_REVOKED');
 const ordinary=await session.create(c,user,false);assert.equal(ordinary.refresh,null);
 await session.revokeAll(c,7);assert.equal(state.users[7],2);assert.equal(state.tnnaRevoked,true);
 await assert.rejects(verifyAccessToken(ordinary.token,{database:c,jwtSecret:'local-test'}),e=>e.code==='ACCOUNT_CREDENTIALS_REVOKED');
 const tJwt=JSON.stringify({userId:7,username:'test',client:'tnna',securityVersion:2,exp:Date.now()+1000});
 const t=await verifyAccessToken(tJwt,{database:c,jwtSecret:'local-test'});assert.equal(t.client,'tnna');
 assert.throws(()=>session.requireOrigin({get:key=>key==='Origin'?'https://wrong.example':'localhost:8080',protocol:'http'}),/ORIGIN_NOT_ALLOWED/);
 assert.throws(()=>session.requireOrigin({get:()=>null,protocol:'http'}),/ORIGIN_REQUIRED/);
 const web=await session.create(c,user,true);const response={cookie(name,secret,options){assert.equal(options.httpOnly,true);assert.equal(options.path,'/users');},clearCookie(){}};
 session.setCookie(response,{},web.refresh.secret,web.refresh.expires);session.clearCookie(response,{});
 console.log('Stage 6A backend simulation tests passed (12 assertions/groups; no live DB writes)');
})().catch(e=>{console.error(e);process.exitCode=1});
