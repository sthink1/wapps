'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
assert.equal(process.env.DB_NAME,'wapps_test','Requires --env-file=.env.test');
const limiter=require('../services/passwordResetLimiter');
class FakeConnection{
  constructor(db){this.db=db;this.calls=0}
  async query(sql,args=[]){
    this.calls++;
    if(sql.startsWith('SELECT DATE_FORMAT'))return [[{Bucket:'2026101809'}]];
    if(sql.startsWith('INSERT INTO PasswordResetRateT')){
      const key=args[0];
      this.db.set(key,(this.db.get(key)||0)+1);
      return [{affectedRows:1}];
    }
    if(sql.startsWith('SELECT AttemptCount')){
      return [[{AttemptCount:this.db.get(args[0])}]];
    }
    throw Error('Unexpected SQL: '+sql);
  }
}
(async()=>{
 const db=new Map();
 for(let n=1;n<=5;n++)assert.equal(await limiter.allow(new FakeConnection(db),'a@example.invalid','192.0.2.1'),true);
 assert.equal(await limiter.allow(new FakeConnection(db),'a@example.invalid','192.0.2.1'),false);
 console.log('PASS email limit: 5 allowed, sixth blocked.');
 for(let n=0;n<14;n++)assert.equal(await limiter.allow(new FakeConnection(db),`other${n}@example.invalid`,'192.0.2.1'),true);
 assert.equal(await limiter.allow(new FakeConnection(db),'last@example.invalid','192.0.2.1'),false);
 console.log('PASS IP limit: 20 requests allowed, 21st blocked (including blocked email attempts).');
 assert.equal(await limiter.allow(new FakeConnection(db),'a@example.invalid','192.0.2.2'),false);
 console.log('PASS shared counters: separate mock connections observe same database state.');
 const keys=[...db.keys()];
 assert(keys.every(k=>/^[a-f0-9]{64}$/.test(k)));
 assert(keys.every(k=>!k.includes('example')));
 console.log('PASS data minimization: HMAC keys only, no raw IP or email.');
 console.log('LIMITATION: in-memory test double; run live DB validation separately.');
})().catch(e=>{console.error(e);process.exitCode=1});
