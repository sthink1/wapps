'use strict';
// Test database only. Creates two isolated remembered sessions, revokes both
// on completion. Does not read browser cookies or print credential secrets.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
if(process.env.DB_NAME!=='sql5838929') throw Error('STOP: DB_NAME must be sql5838929');
if(process.env.NODE_ENV==='production') throw Error('STOP: production mode prohibited');
const live=process.argv.includes('--run-live');
const mysql=require('mysql2/promise');
const {create,rotate,revokeCurrent}=require('../services/browserSession');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const pool=mysql.createPool({
 host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,
 port:Number(process.env.DB_PORT),database:process.env.DB_NAME,timezone:'Z',
 connectionLimit:5,waitForConnections:true,charset:'utf8mb4'
});
let own=[];
async function q(sql,args=[]){return pool.query(sql,args)}
async function newSession(user){
 const c=await pool.getConnection();let issued;
 try{
  await c.query("SET time_zone='+00:00'");
  await c.beginTransaction();
  issued=await create(c,user,true);
  await c.commit();
 }catch(e){try{await c.rollback()}catch(_){}throw e}finally{c.release()}
 const decoded=require('jsonwebtoken').verify(issued.token,process.env.JWT_SECRET);
 own.push({userId:user.UserID,sid:decoded.sid});
 return {secret:issued.refresh.secret,sid:decoded.sid};
}
async function countSuccessors(secret){
 const [r]=await q(`SELECT t.WebRefreshTokenID FROM WebRefreshTokenT t
  JOIN WebRefreshTokenT parent ON t.ParentTokenID=parent.WebRefreshTokenID
  WHERE parent.TokenHash=?`,[hash(secret)]);
 return r.length;
}
async function run(){
 try {
 const [db]=await q('SELECT DATABASE() AS db, @@session.time_zone AS tz');
 assert.equal(db[0].db,'sql5838929');
 const [eng]=await q(`SELECT TABLE_NAME,ENGINE FROM information_schema.TABLES
 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('WebSessionT','WebRefreshTokenT','UserSecurityT')`);
 assert.equal(eng.length,3,'Required Stage 6A tables missing');
 assert(eng.every(x=>x.ENGINE==='InnoDB'),'All three tables must use InnoDB for safe locking');
 const [u]=await q("SELECT u.UserID,u.UserName,s.SecurityVersion FROM UsersT u JOIN UserSecurityT s ON u.UserID=s.UserID WHERE u.UserID=62 AND u.UserName='charter' LIMIT 1");
 assert.equal(u.length,1,'Test account charter / UserID 62 with security row required');
 console.log('PASS preflight: correct test DB, InnoDB tables, charter security record');
 if(!live){console.log('DRY RUN ONLY: no sessions created. To execute, add --run-live.');return}
 console.log('Starting isolated live tests; only new test sessions will be revoked.');
 const user={UserID:u[0].UserID,UserName:u[0].UserName};
 const a=await newSession(user);
 const rotation=await rotate(pool,a.secret);
 assert(rotation.token&&rotation.refresh.secret);
 await assert.rejects(()=>rotate(pool,a.secret),e=>e.message==='REFRESH_INVALID'&&e.status===401);
 assert.equal(await countSuccessors(a.secret),1);
 console.log('PASS replay: first rotation succeeded; consumed credential rejected; exactly one successor');
 const b=await newSession(user);
 const results=await Promise.allSettled([rotate(pool,b.secret),rotate(pool,b.secret)]);
 const fulfilled=results.filter(x=>x.status==='fulfilled');
 const rejected=results.filter(x=>x.status==='rejected');
 assert.equal(fulfilled.length,1,`Expected 1 successful concurrent rotation; found ${fulfilled.length}`);
 assert.equal(rejected.length,1,`Expected 1 rejected concurrent rotation; found ${rejected.length}`);
 assert.equal(rejected[0].reason.message,'REFRESH_INVALID');
 assert.equal(rejected[0].reason.status,401);
 assert.equal(await countSuccessors(b.secret),1);
 console.log('PASS concurrency: one successful rotation; one rejected replay; exactly one successor');
}finally{for(const row of own){
 try{await revokeCurrent(pool,{userId:row.userId,sessionPublicId:row.sid})}
 catch(e){console.error('WARNING cleanup revocation failed for own session:',e.message)}
}if(own.length)console.log('Cleanup: revoked all sessions created by this test; audit rows retained.');
 await pool.end();
}}
run().catch(e=>{console.error('TEST FAILED:',e.message);process.exitCode=1});
