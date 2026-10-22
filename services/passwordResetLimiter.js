'use strict';
const crypto=require('crypto');
// Fail closed unless the explicit Group 0d test-only environment contract passes.
require('./stage6Environment');
const EMAIL_LIMIT=5;
const IP_LIMIT=20;
// Conservative starting point for WA; this shared ceiling is subject to
// deliberate flooding/denial of service and should be tuned with traffic data.
const GLOBAL_LIMIT=100;
function digest(scope,value,bucket){
  if(!process.env.JWT_SECRET)throw Error('JWT_SECRET is required');
  return crypto.createHmac('sha256',process.env.JWT_SECRET)
    .update(`reset-v1|${scope}|${value}|${bucket}`,'utf8').digest('hex');
}
async function allow(c,email,ip) {
  // Database time prevents separate Node instances disagreeing on time buckets.
  const [[clock]]=await c.query("SELECT DATE_FORMAT(UTC_TIMESTAMP(),'%Y%m%d%H') AS Bucket");
  const bucket=String(clock.Bucket);
  if(!/^\d{10}$/.test(bucket))throw Error('INVALID_RESET_RATE_BUCKET');
  const keys=[
    {type:'global',key:digest('global','all-password-resets',bucket),limit:GLOBAL_LIMIT},
    {type:'email',key:digest('email',email,bucket),limit:EMAIL_LIMIT},
    {type:'ip',key:digest('ip',String(ip).trim().toLowerCase(),bucket),limit:IP_LIMIT}
  ].sort((a,b)=>a.key.localeCompare(b.key)); // deterministic locks across requests
  let permitted=true;
  for(const item of keys){
    // Each INSERT/UPDATE atomically increments across processes, with InnoDB row locks.
    await c.query(
      `INSERT INTO PasswordResetRateT (KeyHash,WindowStart,AttemptCount)
       VALUES (?,STR_TO_DATE(?,'%Y%m%d%H'),1)
       ON DUPLICATE KEY UPDATE AttemptCount=AttemptCount+1`,
      [item.key,bucket]
    );
    const [rows]=await c.query(
      'SELECT AttemptCount FROM PasswordResetRateT WHERE KeyHash=? FOR UPDATE',[item.key]
    );
    if(rows.length!==1)throw Error('RATE_COUNTER_MISSING');
    if(Number(rows[0].AttemptCount)>item.limit)permitted=false;
  }
  return permitted;
}
module.exports={allow,EMAIL_LIMIT,IP_LIMIT,GLOBAL_LIMIT};
