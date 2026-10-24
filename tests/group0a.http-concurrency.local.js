'use strict';
// Stage 6 Group 0a, Section 8. Local-only; deliberately changes test-account password twice.
const readline = require('node:readline');
const crypto = require('node:crypto');
const {pool} = require('../dbConnection');
const BASE='http://localhost:8080', USER='charter', UID=62, DB='sql5838929';
const assert=(x,m)=>{if(!x)throw Error(m)};
const log=x=>console.log(x);
let currentPassword, temporaryPassword;
let restored=false, changed=false;
function prompt(question, masked=false){return new Promise((resolve,reject)=>{
  if (!process.stdin.isTTY || !process.stdout.isTTY) return reject(Error('Run in an interactive VS Code PowerShell terminal; input must be a TTY.'));
  process.stdout.write(question);
  if(!masked){const rl=readline.createInterface({input:process.stdin,output:process.stdout});rl.question('',v=>{rl.close();resolve(v.trim())});return;}
  const input=process.stdin;const buf=[];let complete=false;
  const wasRaw=input.isRaw;input.setRawMode(true);input.resume();
  const finish=(err)=>{if(complete)return;complete=true;input.removeListener('data',key);input.setRawMode(!!wasRaw);process.stdout.write('\n');if(err)reject(err);else resolve(buf.join(''));};
  const key=chunk=>{for(const b of chunk){if(b===3){finish(Error('Cancelled'));return;}if(b===13||b===10){finish();return;}if(b===127||b===8){buf.pop();continue;}if(b>=32&&b<=126)buf.push(String.fromCharCode(b));}};
  input.on('data',key);
});}
async function request(path,body,options={}){
  const headers={'Content-Type':'application/json',...(options.origin?{Origin:BASE}:{}),...(options.bearer?{Authorization:'Bearer '+options.bearer}:{}),...(options.cookie?{Cookie:'wa_refresh='+options.cookie}:{})};
  const res=await fetch(BASE+path,{method:'POST',headers,body:JSON.stringify(body||{}),signal:AbortSignal.timeout(25000)});
  const raw=await res.text();let data={};try{data=JSON.parse(raw)}catch{};
  return {status:res.status,data,cookie:res.headers.get('set-cookie')};
}
async function authGet(path,token){const r=await fetch(BASE+path,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(15000)});return r.status;}
async function checkDb(){
 assert(process.env.DB_NAME===DB,'STOP: DB_NAME is not sql5838929');
 assert(process.env.WA_ENV==='local','STOP: WA_ENV is not local');
 const [[db]]=await pool.query('SELECT DATABASE() AS db, @@session.time_zone AS tz');
 assert(db.db===DB,'STOP: actual DB differs');
 const [u]=await pool.query('SELECT UserID FROM UsersT WHERE UserName=?',[USER]);
 assert(u.length===1&&Number(u[0].UserID)===UID,'STOP: charter/UserID 62 mismatch');
 log('PASS local-only environment, database sql5838929, account charter (62)');
}
async function challenge(password){const r=await request('/users/login',{username:USER,password});assert(r.status===200&&typeof r.data.tempToken==='string',`Login challenge failed HTTP ${r.status}`);const code=await prompt('Enter the latest 6-digit email code (not echoed): ',true);assert(/^\d{6}$/.test(code),'Verification code should have six digits');return {tempToken:r.data.tempToken,verificationCode:code};}
async function webVerify(q,remember){return request('/users/verify-code',{...q,keepMeLoggedIn:remember});}
async function tnnaVerify(q,deviceId){return request('/tnna/verify-code',{...q,deviceId,platform:'Android',appVersion:'1.0.0',versionCode:1,updateEmailOptIn:false});}
function readCookie(str){const m=(str||'').match(/(?:^|[,;]\s*)wa_refresh=([a-f0-9]{96})/);assert(m,'No wa_refresh cookie on remembered web login');return m[1];}
async function restore(){
  log('RESTORE: obtaining fresh credentials using the temporary password.');
  const q=await challenge(temporaryPassword);const w=await webVerify(q,false);
  assert(w.status===200&&w.data.token,'Restore login verify failed HTTP '+w.status);
  const r=await request('/users/change-password',{currentPassword:temporaryPassword,newPassword:currentPassword,confirmPassword:currentPassword},{origin:true,bearer:w.data.token});
  assert(r.status===200,'Password restore failed HTTP '+r.status);
  restored=true;log('PASS original charter password restored');
}
async function main(){
 await checkDb();
 const start=await fetch(BASE+'/login.html',{signal:AbortSignal.timeout(5000)});assert(start.ok,'STOP: local server not running');
 log('WARNING: this test changes charter password, invalidates sessions, and creates TEST DB audit rows.');
 log('It does not update Render, production, installed TNNA apps, or project source.');
 const confirm=await prompt('Type TEST CHARTER to consent to the test-only password changes: ');
 assert(confirm==='TEST CHARTER','Cancelled: consent phrase incorrect');
 currentPassword=await prompt('Current charter password (hidden): ',true);
 temporaryPassword=await prompt('New TEMPORARY charter password, >= 8 characters (hidden): ',true);
 assert(temporaryPassword.length>=8&&temporaryPassword!==currentPassword,'Temporary password must differ and have >=8 characters');
 log('SETUP 1/4: create remembered web session for change-password and refresh race');
 const wq=await challenge(currentPassword);const wr=await webVerify(wq,true);assert(wr.status===200&&wr.data.token,'Web login failed HTTP '+wr.status);
 const webCookie=readCookie(wr.cookie),webToken=wr.data.token;
 log('SETUP 2/4: create TNNA refresh token');
 const deviceId='group0a-s8-'+crypto.randomBytes(9).toString('hex');const tq=await challenge(currentPassword);const tr=await tnnaVerify(tq,deviceId);
 assert(tr.status===200&&tr.data.refreshToken,'TNNA login failed HTTP '+tr.status);
 log('SETUP 3/4: create unconsumed web challenge');const pendingWeb=await challenge(currentPassword);
 log('SETUP 4/4: create unconsumed TNNA challenge');const pendingTnna=await challenge(currentPassword);const secondDevice=deviceId+'-new';
 log('RACE: launching change-password + four contender HTTP POSTs concurrently');
 const calls=[
  ['change-password',()=>request('/users/change-password',{currentPassword,newPassword:temporaryPassword,confirmPassword:temporaryPassword},{origin:true,bearer:webToken})],
  ['web verify-code',()=>webVerify(pendingWeb,false)],
  ['TNNA verify-code',()=>tnnaVerify(pendingTnna,secondDevice)],
  ['web refresh',()=>request('/users/refresh-session',{}, {origin:true,cookie:webCookie})],
  ['TNNA refresh',()=>request('/tnna/refresh',{refreshToken:tr.data.refreshToken,deviceId,platform:'Android',appVersion:'1.0.0',versionCode:1})],
 ];
 const settled=await Promise.allSettled(calls.map(x=>x[1]()));
 settled.forEach((r,i)=>log(`${calls[i][0]}: ${r.status==='fulfilled'?'HTTP '+r.value.status:'NETWORK ERROR'}`));
 const change=settled[0];assert(change.status==='fulfilled'&&change.value.status===200,'Password change did not succeed; inspect results before further tests');changed=true;
 for(let i=1;i<settled.length;i++){const x=settled[i];assert(x.status==='fulfilled',calls[i][0]+' network error');assert(x.value.status===200||x.value.status===401,calls[i][0]+' unexpected HTTP '+x.value.status);}
 log('VALIDATE: any successful pre-change credentials must now be rejected');
 const issued=[];
 // pre-change tokens and all race-created tokens
 issued.push(['initial web',webToken,'/users/session-status']);issued.push(['initial TNNA',tr.data.accessToken,'/tnna/me']);
 for(const [i,type,path] of [[1,'web','/users/session-status'],[2,'tnna','/tnna/me'],[3,'web','/users/session-status'],[4,'tnna','/tnna/me']]){
  const x=settled[i].value;if(x.status===200){const token=type==='web'?x.data.token:x.data.accessToken;assert(typeof token==='string',calls[i][0]+' did not return an access token');issued.push([calls[i][0],token,path]);}
 }
 for(const [name,token,path] of issued){const status=await authGet(path,token);assert(status===401,`SECURITY FAILURE: ${name} access token remains valid HTTP ${status}`);log('PASS '+name+' JWT rejected after password change');}
 const cookies=[['initial browser refresh',webCookie]];
 if(settled[3].value.status===200)cookies.push(['race browser refresh',readCookie(settled[3].value.cookie)]);
 for(const [name,c] of cookies){const r=await request('/users/refresh-session',{}, {origin:true,cookie:c});assert(r.status===401,`SECURITY FAILURE: ${name} still refreshes HTTP ${r.status}`);log('PASS '+name+' rejected');}
 const native=[['initial TNNA refresh',tr.data.refreshToken,deviceId]];
 if(settled[2].value.status===200)native.push(['new TNNA verification refresh',settled[2].value.data.refreshToken,secondDevice]);
 if(settled[4].value.status===200)native.push(['race TNNA refresh',settled[4].value.data.refreshToken,deviceId]);
 for(const [name,t,did] of native){assert(typeof t==='string',name+' missing');const r=await request('/tnna/refresh',{refreshToken:t,deviceId:did});assert(r.status===401,`SECURITY FAILURE: ${name} still refreshes HTTP ${r.status}`);log('PASS '+name+' rejected');}
 log('PASS all four HTTP contenders completed with acceptable race outcomes and no usable stale credentials');
 await restore();log('COMPLETE: Section 8 HTTP race batch passed and charter password restored. Test records remain in sql5838929.');
}
main().catch(e=>{console.error('FAIL:',e.message);if(changed&&!restored)console.error('IMPORTANT: charter password is still the TEMPORARY password. Do not assume it was restored.');process.exitCode=1;}).finally(async()=>{try{await pool.end()}catch{}});
