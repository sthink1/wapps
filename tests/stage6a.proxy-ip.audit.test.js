'use strict';
/* Read-only server configuration audit and loopback-only Express proxy behavior test.
   Does not contact Render, send emails, or access databases. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const express=require('express');
const http=require('node:http');

const serverSource=fs.readFileSync(path.resolve(__dirname,'../server.js'),'utf8');
const matches=[...serverSource.matchAll(/(?:app|server)\.set\s*\(\s*['"`]trust proxy['"`]/g)];
console.log('SOURCE AUDIT: express trust proxy setting found:',matches.length ? 'YES (review manually)' : 'NO');
console.log('SOURCE AUDIT: current reset limiter uses req.ip, so deployed proxy configuration must be verified.');
async function probe(setting,forwarded){
 const app=express();
 if(setting!==undefined)app.set('trust proxy',setting);
 app.get('/_test', (req,res)=>res.json({ip:req.ip,ips:req.ips,remote:req.socket.remoteAddress}));
 const server=http.createServer(app);
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok)});
 try{
  const addr=server.address();
  return await new Promise((ok,bad)=>{
   const req=http.request({host:'127.0.0.1',port:addr.port,path:'/_test',headers:{'X-Forwarded-For':forwarded}},res=>{
    let body='';res.on('data',c=>body+=c);res.on('end',()=>{try{ok(JSON.parse(body))}catch(e){bad(e)}});
   });req.once('error',bad);req.end();
  });
 }finally{await new Promise(ok=>server.close(ok))}
}
(async()=>{
 const forwarded='198.51.100.77, 203.0.113.18';
 const untrusted=await probe(undefined,forwarded);
 assert(!untrusted.ip.includes('198.51.100.77'));
 assert.equal(untrusted.ips.length,0);
 console.log('PASS default proxy mode: untrusted X-Forwarded-For ignored; direct peer used.');
 const one=await probe(1,forwarded);
 assert.equal(one.ip,'203.0.113.18');
 console.log('PASS trust proxy=1: Express trusts one hop and chooses rightmost forwarded address.');
 const all=await probe(true,forwarded);
 assert.equal(all.ip,'198.51.100.77');
 console.log('PASS trust proxy=true: leftmost forwarded address accepted; can be unsafe if headers are spoofable.');
 console.log('LIMITATION: these are localhost probes; they do NOT establish the trusted proxy-hop count or header sanitization on Render.');
 console.log('No database connections, emails, existing WA requests, or production changes.');
})().catch(e=>{console.error('FAIL',e.stack||e);process.exitCode=1});
