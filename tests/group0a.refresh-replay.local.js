'use strict';
// Group 5B isolated HTTP replay model. Removes clipboard/real-cookie/session dependency.
// LOCAL loopback mock only; does not start WA server.js or reach HelioHost.
const assert=require('node:assert/strict');
const http=require('node:http');
const crypto=require('node:crypto');
const old=crypto.randomBytes(48).toString('hex');
let consumed=false,child=null,rotationCount=0;
const app=http.createServer((req,res)=>{
 if(req.url!=='/users/refresh-session'||req.method!=='POST'){
  res.writeHead(404);return res.end();
 }
 const origin=`http://127.0.0.1:${app.address().port}`;
 if(req.headers.origin!==origin){res.writeHead(403,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'ORIGIN_NOT_ALLOWED'}))}
 if(req.headers.cookie!==`wa_refresh=${old}`||consumed){res.writeHead(401,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'REFRESH_INVALID'}))}
 consumed=true;child=crypto.randomBytes(48).toString('hex');rotationCount++;
 res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':`wa_refresh=${child}; HttpOnly; Path=/users`});
 res.end(JSON.stringify({token:'synthetic-access-token'}));
});
async function main(){
 await new Promise((ok,bad)=>{app.once('error',bad);app.listen(0,'127.0.0.1',ok)});
 try{
  const origin=`http://127.0.0.1:${app.address().port}`;
  const request=async(cookie,requestedOrigin=origin)=>{
   const r=await fetch(origin+'/users/refresh-session',{method:'POST',headers:{Origin:requestedOrigin,Cookie:`wa_refresh=${cookie}`}});
   return {status:r.status,data:await r.json(),setCookie:r.headers.get('set-cookie')};
  };
  const first=await request(old);assert.equal(first.status,200);assert.match(first.setCookie,/wa_refresh=[a-f0-9]{96}/);
  assert.notEqual(child,old);
  const replay=await request(old);assert.equal(replay.status,401);assert.equal(replay.data.error,'REFRESH_INVALID');
  const forged=await request(old,'https://invalid.example');assert.equal(forged.status,403);
  assert.equal(rotationCount,1);
  console.log('PASS loopback model: rotated once; consumed token replay returned 401; forged origin 403.');
  console.log('LIMITATION: this is a mock HTTP handler, NOT the real /users/refresh-session route or real cookie handling.');
  console.log('No clipboard, browser cookie, WA server, account or database used.');
 }finally{await new Promise(ok=>app.close(ok))}
}
main().catch(e=>{console.error('FAIL:',e);process.exitCode=1});
