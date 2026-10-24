'use strict';
// WA Group 0a, Phase 7F. TEST ONLY. Run with node --env-file=.env.test.
const crypto = require('node:crypto');
const readline = require('node:readline');
const {pool} = require('../dbConnection');
const BASE = 'http://localhost:8080';
const USER = 'charter';
const ID = 62;
const DEVICE = 'WA-GROUP0A-7F-' + crypto.randomBytes(10).toString('hex');
let secret = null;
let rotated = null;
let exitCode = 0;

function prompt(label, hidden = false) {
  if (!hidden || !process.stdin.isTTY || !process.stdin.setRawMode) {
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    return new Promise(resolve=>rl.question(label, answer=>{rl.close();resolve(answer);}));
  }
  return new Promise((resolve,reject)=>{
    let value='';
    process.stdout.write(label);
    const input=process.stdin;
    readline.emitKeypressEvents(input);
    input.setRawMode(true); input.resume();
    const onKey=(str,key)=>{
      if(key?.ctrl && key.name==='c') { cleanup(); reject(Error('Cancelled')); return; }
      if(key?.name==='return'||key?.name==='enter') { cleanup(); process.stdout.write('\n'); resolve(value); return; }
      if(key?.name==='backspace') { value=value.slice(0,-1); return; }
      if(typeof str==='string' && str.length===1 && str>=' ') value+=str;
    };
    function cleanup(){input.off('keypress',onKey);input.setRawMode(false);input.pause();}
    input.on('keypress',onKey);
  });
}
async function post(path, body) {
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try {
    const res=await fetch(BASE+path,{method:'POST',headers:{'Content-Type':'application/json','Origin':BASE},body:JSON.stringify(body),signal:controller.signal});
    let data={};try{data=await res.json();}catch(_){}
    return {status:res.status, data};
  } finally {clearTimeout(timeout);}
}
function assert(cond,message){if(!cond)throw Error(message);console.log('PASS '+message);}
async function main(){
  assert(process.env.WA_ENV==='local' && process.env.DB_NAME==='sql5838929','test-only environment variables');
  const [db]=await pool.query('SELECT DATABASE() AS db, @@session.time_zone AS tz');
  assert(db[0]?.db==='sql5838929' && db[0]?.tz==='+00:00','connected to sql5838929 with UTC session');
  const [users]=await pool.query('SELECT UserID,UserName FROM UsersT WHERE UserID=? AND UserName=?',[ID,USER]);
  assert(users.length===1,'disposable charter account exists');
  const [devices]=await pool.query('SELECT DeviceID FROM TNNADeviceT WHERE DeviceID=?',[DEVICE]);
  assert(devices.length===0,'synthetic device ID is unused');
  console.log('This will write TNNA test registration, consent, device and refresh-token records for charter.');
  console.log('No installed phones are accessed or modified. Credentials are never printed.');
  const password=await prompt('Current charter password (hidden): ',true);
  if(!password)throw Error('Password required');
  const login=await post('/users/login',{username:USER,password});
  assert(login.status===200 && typeof login.data.tempToken==='string','web login challenge sent by email');
  const code=await prompt('Enter the emailed six-digit verification code: ');
  assert(/^\d{6}$/.test(code),'verification code format valid');
  const verified=await post('/tnna/verify-code',{tempToken:login.data.tempToken,verificationCode:code,deviceId:DEVICE,platform:'Android',appVersion:'0.0.0-test',versionCode:0,updateEmailOptIn:false});
  assert(verified.status===200 && verified.data.user?.userId===ID && typeof verified.data.accessToken==='string' && /^[a-f0-9]{96}$/.test(verified.data.refreshToken||''),'TNNA verify-code issued access and refresh credentials');
  secret=verified.data.refreshToken;
  const refresh=await post('/tnna/refresh',{refreshToken:secret,deviceId:DEVICE,platform:'Android',appVersion:'0.0.0-test',versionCode:0});
  assert(refresh.status===200 && typeof refresh.data.accessToken==='string' && /^[a-f0-9]{96}$/.test(refresh.data.refreshToken||'') && refresh.data.refreshToken!==secret,'TNNA refresh rotated token and issued access token');
  rotated=refresh.data.refreshToken;
  const replay=await post('/tnna/refresh',{refreshToken:secret,deviceId:DEVICE});
  assert(replay.status===401,'old TNNA refresh token replay rejected (HTTP 401)');
  const logout=await post('/tnna/logout',{refreshToken:rotated});
  assert(logout.status===200,'TNNA logout succeeded');
  const after=await post('/tnna/refresh',{refreshToken:rotated,deviceId:DEVICE});
  assert(after.status===401,'TNNA refresh rejected after logout');
  console.log('COMPLETE: TNNA HTTP functional flow passed. Test audit/registration rows remain in sql5838929.');
}
(async()=>{try{await main();}catch(e){exitCode=1;console.error('FAIL:',e.message);}finally{if(rotated){try{await post('/tnna/logout',{refreshToken:rotated});}catch(_){}}if(secret && !rotated){try{await post('/tnna/logout',{refreshToken:secret});}catch(_){}} try{await pool.end();}catch(_){}process.exitCode=exitCode;}})();
