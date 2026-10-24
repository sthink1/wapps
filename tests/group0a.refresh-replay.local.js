'use strict';
// Run from WA project root: node --env-file=.env.test tests/group0a.refresh-replay.local.js
// Uses the user's clipboard as a short-lived local transfer for the HttpOnly cookie.
const {execFileSync} = require('node:child_process');
const crypto = require('node:crypto');
const {pool} = require('../dbConnection');
const HOST='http://localhost:8080';
const USER_ID=62;
const hash = s => crypto.createHash('sha256').update(s,'utf8').digest('hex');
const pass = m => console.log('PASS '+m);
const fail = m => {throw new Error(m)};
function clipboard() {
  if(process.platform!=='win32') fail('Windows PowerShell is required for this clipboard workflow.');
  const shell='powershell.exe';
  let value;
  try { value=execFileSync(shell,['-NoProfile','-NonInteractive','-Command','Get-Clipboard -Raw'],{encoding:'utf8',timeout:10000,windowsHide:true,maxBuffer:4096}).trim(); }
  finally {
    // Clear clipboard even when contents are invalid; never persist or print credential.
    try {execFileSync(shell,['-NoProfile','-NonInteractive','-Command','Set-Clipboard -Value ""'],{timeout:10000,windowsHide:true,stdio:'ignore'});}catch(_){}
  }
  if(!/^[a-f0-9]{96}$/.test(value||''))fail('Clipboard does not contain a 96-character wa_refresh cookie value. No HTTP requests sent.');
  return value;
}
async function refresh(secret){
  const controller = new AbortController();
  const id = setTimeout(()=>controller.abort(),15000);
  try {
    return await fetch(HOST+'/users/refresh-session',{
      method:'POST',redirect:'manual',signal:controller.signal,
      headers:{Origin:HOST,'Content-Type':'application/json',Cookie:'wa_refresh='+secret}
    });
  } finally {clearTimeout(id);}
}
async function run(){
  if(process.env.WA_ENV!=='local' || process.env.DB_NAME!=='sql5838929')fail('Guard failed: WA_ENV=local and DB_NAME=sql5838929 are required.');
  const [identity]=await pool.query('SELECT DATABASE() AS db, @@session.time_zone AS tz');
  if(identity[0]?.db!=='sql5838929'||identity[0]?.tz!=='+00:00')fail('Guard failed: unexpected MySQL database or timezone.');
  pass('local test configuration, sql5838929 and UTC verified');
  const old=clipboard();
  const [prior]=await pool.query(`SELECT r.WebRefreshTokenID AS rid,r.WebSessionID AS sid,r.ConsumedAt AS consumed,r.RevokedAt AS revoked,s.UserID AS uid,s.RevokedAt AS sessionRevoked
     FROM WebRefreshTokenT r JOIN WebSessionT s ON r.WebSessionID=s.WebSessionID WHERE r.TokenHash=? LIMIT 1`,[hash(old)]);
  if(prior.length!==1||Number(prior[0].uid)!==USER_ID||prior[0].consumed||prior[0].revoked||prior[0].sessionRevoked)fail('Guard failed: clipboard cookie is not a current active charter test session in sql5838929. No HTTP requests sent.');
  pass('current cookie belongs to active charter test session; clipboard cleared');
  console.log('TEST: rotating cookie over local HTTP. Chrome will retain its old cookie; sign in again afterward.');
  const first=await refresh(old);
  if(first.status!==200)fail('Initial refresh returned HTTP '+first.status+'; no replay attempted.');
  const body=await first.json().catch(()=>({}));
  if(typeof body.token!=='string'||!body.token)fail('Initial response was 200 but did not return an access token.');
  pass('first refresh returned HTTP 200 and an access token');
  const sc=first.headers.get('set-cookie')||'';
  const next=(sc.match(/(?:^|[,;\s])wa_refresh=([a-f0-9]{96})/)||[])[1];
  if(!next||next===old)fail('New distinct HttpOnly refresh cookie missing from response. No replay attempted.');
  const [state]=await pool.query('SELECT ConsumedAt AS consumed FROM WebRefreshTokenT WHERE WebRefreshTokenID=?',[prior[0].rid]);
  const [children]=await pool.query('SELECT WebRefreshTokenID AS id,WebSessionID AS sid,ConsumedAt AS consumed,RevokedAt AS revoked FROM WebRefreshTokenT WHERE TokenHash=? AND ParentTokenID=? LIMIT 1',[hash(next),prior[0].rid]);
  if(!state[0]?.consumed||children.length!==1||Number(children[0].sid)!==Number(prior[0].sid)||children[0].consumed||children[0].revoked)fail('Rotation database assertions failed. No replay attempted.');
  pass('old token consumed; replacement is a distinct unconsumed child token');
  const replay=await refresh(old);
  const replayData=await replay.json().catch(()=>({}));
  if(replay.status!==401||replayData.error!=='REFRESH_INVALID')fail('Replay result unexpected: HTTP '+replay.status+' error '+String(replayData.error||'missing'));
  pass('replaying consumed token rejected with HTTP 401 REFRESH_INVALID');
  const [session]=await pool.query('SELECT RevokedAt AS revoked FROM WebSessionT WHERE WebSessionID=? AND UserID=?',[prior[0].sid,USER_ID]);
  const [childAfter]=await pool.query('SELECT ConsumedAt AS consumed,RevokedAt AS revoked FROM WebRefreshTokenT WHERE WebRefreshTokenID=?',[children[0].id]);
  if(session.length!==1||childAfter.length!==1)fail('Cannot determine token-family state.');
  if(!session[0].revoked && !childAfter[0].revoked && !childAfter[0].consumed){
    console.log('LIMITATION: replay did NOT revoke token family; replacement token remains active. This matches current browserSession.js behavior.');
  }else if(session[0].revoked||childAfter[0].revoked){
    pass('replay also revoked web session or replacement token');
  }else{
    console.log('OBSERVATION: replacement token was consumed by another request; inspect concurrent activity.');
  }
  console.log('COMPLETE: Test generated a new server-side cookie that Chrome did not receive. Sign in afresh before subsequent tests.');
}
run().catch(e=>{console.error('FAIL:',e.message);process.exitCode=1}).finally(async()=>{await pool.end().catch(()=>{})});
