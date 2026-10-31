'use strict';
const assert=require('node:assert/strict');
assert.equal(process.env.DB_NAME,'wapps_test');
const limiter=require('../services/passwordResetLimiter');
class FakeConn{
 constructor(rows){this.rows=rows;}
 async query(sql,args=[]){
  if(sql.startsWith('SELECT DATE_FORMAT'))return [[{Bucket:'2099123123'}]];
  if(sql.startsWith('INSERT INTO PasswordResetRateT')){this.rows.set(args[0],(this.rows.get(args[0])||0)+1);return [{affectedRows:1}];}
  if(sql.startsWith('SELECT AttemptCount'))return [[{AttemptCount:this.rows.get(args[0])}]];
  throw Error(`unexpected SQL: ${sql}`);
 }
}
(async()=>{
 assert.equal(limiter.EMAIL_LIMIT,5);
 assert.equal(limiter.IP_LIMIT,20);
 assert.equal(limiter.GLOBAL_LIMIT,100);
 const db=new Map(), conn=()=>new FakeConn(db);
 for(let i=0;i<5;i++)assert.equal(await limiter.allow(conn(),'email-only@example.invalid',`ip-email-${i}`),true);
 assert.equal(await limiter.allow(conn(),'email-only@example.invalid','ip-email-6'),false);
 console.log('PASS per-email: sixth attempt blocked across different IP values.');
 for(let i=0;i<20;i++)assert.equal(await limiter.allow(conn(),`ip-user-${i}@example.invalid`,'shared-ip'),true);
 assert.equal(await limiter.allow(conn(),'ip-last@example.invalid','shared-ip'),false);
 console.log('PASS per-IP: 21st attempt blocked across different emails.');
 // 6 email + 21 IP = 27 global attempts. Exactly 73 more allowed.
 for(let i=0;i<73;i++)assert.equal(await limiter.allow(conn(),`global-${i}@example.invalid`,`global-ip-${i}`),true);
 assert.equal(await limiter.allow(conn(),'global-block@example.invalid','new-ip-101'),false);
 console.log('PASS global: 100 total attempts, 101st blocked despite new email and IP.');
 assert(db.size>0 && [...db.keys()].every(k=>/^[a-f0-9]{64}$/.test(k)));
 console.log('PASS data minimization: global/email/IP keys are HMAC digests only.');
 console.log('NOTE: unit test uses mock SQL; live test tests transactional MySQL.');
})().catch(e=>{console.error('FAIL',e);process.exitCode=1});
