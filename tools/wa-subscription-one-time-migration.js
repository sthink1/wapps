#!/usr/bin/env node
'use strict';
// One-time migration of 18 reviewed users; no mutations on --check.
// Intentionally NEVER imported by server.js or any production module.
const fs = require('node:fs');
const path = require('node:path');
const EXPECTED = [
  [1,'sthink',2,3,'PROMO','2026-12-31',1,1,4,'ADMIN_GRANT','2200-01-01'],
  [40,'eg',3,4,'ADMIN_GRANT','2030-12-31',1,null,4,'ADMIN_GRANT','2030-12-31'],
  [42,'egalvin',4,3,'PROMO','2026-12-31',1,1,3,'PROMO','2026-12-31'],
  [43,'malcolm4',null,null,null,null,null,null,3,'ADMIN_GRANT','2200-01-01'],
  [44,'laurel',7,3,'ADMIN_GRANT','2030-12-31',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [45,'sthink6386',6,3,'DEVELOPMENT_TRIAL','2026-10-19',1,null,3,'DEVELOPMENT_TRIAL','2026-10-19'],
  [48,'mpgoutlook',5,3,'DEVELOPMENT_TRIAL','2026-10-16',1,null,3,'DEVELOPMENT_TRIAL','2026-10-16'],
  [49,'cotravel',8,3,'DEVELOPMENT_TRIAL','2026-10-21',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [51,'mmintonec',9,3,'DEVELOPMENT_TRIAL','2026-10-22',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [52,'janet',null,null,null,null,null,null,3,'ADMIN_GRANT','2200-01-01'],
  [53,'jlm4212',10,3,'DEVELOPMENT_TRIAL','2026-10-26',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [54,'b0ulderagalvin',11,3,'DEVELOPMENT_TRIAL','2026-10-29',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [55,'dswim',12,3,'DEVELOPMENT_TRIAL','2026-10-29',1,null,3,'DEVELOPMENT_TRIAL','2026-10-29'],
  [56,'mpgiii',13,3,'DEVELOPMENT_TRIAL','2026-11-01',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [57,'mgalvinnj',14,3,'DEVELOPMENT_TRIAL','2026-11-03',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [58,'kelsey',15,3,'DEVELOPMENT_TRIAL','2026-11-09',1,null,3,'ADMIN_GRANT','2200-01-01'],
  [63,'glaw',20,3,'DEVELOPMENT_TRIAL','2026-11-17',1,null,3,'DEVELOPMENT_TRIAL','2026-11-17'],
  [64,'charter',21,3,'DEVELOPMENT_TRIAL','2026-12-02',1,null,3,'DEVELOPMENT_TRIAL','2026-12-02']
];
function dateOnly(v) {
  if (v === null || v === undefined) return null;
  return v instanceof Date ? v.toISOString().slice(0,10) : String(v).slice(0,10);
}
function matchRow(row, expected, target=false) {
  if (!row) return expected[2] === null && !target;
  const [id,_name,rowId,plan,type,end,active,promo,newPlan,newType,newEnd]=expected;
  if (target) return Number(row.UserID)===id && Number(row.PlanID)===newPlan &&
    row.AccessType===newType && dateOnly(row.EndDate)===newEnd && Number(row.Active)===1 &&
    (newType === 'PROMO' ? Number(row.PromoCodeID)===1 : row.PromoCodeID==null);
  return Number(row.UserID)===id && Number(row.UserSubscriptionID)===rowId &&
    Number(row.PlanID)===plan && row.AccessType===type && dateOnly(row.EndDate)===end &&
    Number(row.Active)===active && (promo===null ? row.PromoCodeID==null : Number(row.PromoCodeID)===promo);
}
function classify(rowsById) {
  const source=EXPECTED.every(e=>matchRow(rowsById.get(e[0])||null,e,false));
  const migrated=EXPECTED.every(e=>matchRow(rowsById.get(e[0])||null,e,true));
  return source ? 'SOURCE' : migrated ? 'MIGRATED' : 'MISMATCH';
}
async function collect(connection) {
  const [rows]=await connection.query(`SELECT UserSubscriptionID, UserID, PlanID, AccessType,
    StartDate, EndDate, Active, PromoCodeID, CreatedDate, ModifiedDate
    FROM UserSubscriptionT WHERE UserID IN (${EXPECTED.map(()=>'?').join(',')}) FOR UPDATE`, EXPECTED.map(e=>e[0]));
  return new Map(rows.map(r=>[Number(r.UserID),r]));
}
async function main(args, pool) {
  const apply=args.includes('--apply');
  const backupArg=args.find(x=>x.startsWith('--backup-file='));
  if(!args.includes('--check') && !apply) throw Error('Use --check or --apply.');
  if(args.includes('--check') && apply) throw Error('Choose only one mode.');
  if(process.env.DB_NAME!=='wapps_test') throw Error('Safety: DB_NAME must be exactly wapps_test.');
  if(apply && !args.includes('--confirm-staging-wapps-test')) throw Error('Apply requires --confirm-staging-wapps-test.');
  if(apply && !backupArg) throw Error('Apply requires --backup-file=ABSOLUTE_PATH.');
  const backupFile=backupArg && backupArg.slice('--backup-file='.length);
  if(apply && (!path.isAbsolute(backupFile) || path.resolve(backupFile).startsWith(path.resolve(process.cwd())+path.sep)))
    throw Error('Backup file must be outside the WA project and use an absolute path.');
  const conn=await pool.getConnection();
  let committed=false;
  try {
    await conn.beginTransaction();
    const [dbRows]=await conn.query('SELECT DATABASE() AS db');
    if(!dbRows.length || dbRows[0].db!=='wapps_test') throw Error('Connected database mismatch.');
    // Lock users as well as subscriptions, including the two without existing subscriptions.
    const [users]=await conn.query(`SELECT UserID, UserName FROM UsersT WHERE UserID IN
      (${EXPECTED.map(()=>'?').join(',')}) ORDER BY UserID FOR UPDATE`,EXPECTED.map(e=>e[0]));
    if(users.length!==18 || !EXPECTED.every(e=>users.some(u=>Number(u.UserID)===e[0] && String(u.UserName).toLowerCase()===e[1].toLowerCase())))
      throw Error('The 18-user identity snapshot has changed. No migration performed.');
    const [plans]=await conn.query('SELECT PlanID, PlanName FROM SubscriptionPlanT WHERE PlanID IN (3,4)');
    if(plans.length!==2 || !plans.some(p=>Number(p.PlanID)===3 && p.PlanName==='Platinum') || !plans.some(p=>Number(p.PlanID)===4 && p.PlanName==='Diamond'))
      throw Error('Subscription plan identity changed. No migration performed.');
    const [counts]=await conn.query(`SELECT
      (SELECT COUNT(*) FROM UserSubscriptionT) AS subscriptions,
      (SELECT COUNT(*) FROM AdminSubscriptionGrantT) AS grants,
      (SELECT COUNT(*) FROM AdminSubscriptionGrantT WHERE Active=1) AS activeGrants,
      (SELECT COUNT(*) FROM PromoRedemptionT) AS redemptions`);
    if(Number(counts[0].grants)!==13 || Number(counts[0].activeGrants)!==11 || Number(counts[0].redemptions)!==3)
      throw Error('Historical grant/promo counts changed. No migration performed.');
    const before=await collect(conn);
    const state=classify(before);
    const expectedCount=state==='SOURCE'?16:state==='MIGRATED'?18:null;
    if(state==='MISMATCH' || Number(counts[0].subscriptions)!==expectedCount)
      throw Error('Subscription snapshot mismatch. Inspect manually; no writes performed.');
    if(!apply) {
      console.log(`CHECK PASS: ${state}; subscription rows ${expectedCount}; grants 13; active grants 11; redemptions 3.`);
      await conn.rollback();return {state,changed:0};
    }
    if(state==='MIGRATED') {
      console.log('Already migrated. No changes.');
      await conn.rollback();return {state,changed:0};
    }
    // Write pre-migration evidence OUTSIDE the WA tree, exclusive-create to prevent overwrite.
    const backup={environment:'wapps_test',recordedAt:new Date().toISOString(),
      users:EXPECTED.map(e=>({userId:e[0],username:e[1],subscription:before.get(e[0])||null})),
      counts:counts[0]};
    fs.writeFileSync(backupFile,JSON.stringify(backup,null,2),{flag:'wx',mode:0o600});
    let changes=0;
    for(const e of EXPECTED) {
      if(e[2]!==null && e[3]===e[8] && e[4]===e[9] && e[5]===e[10]) continue;
      const current=before.get(e[0]);
      let result;
      if(!current) {
        [result]=await conn.query(`INSERT INTO UserSubscriptionT
          (UserID,PlanID,AccessType,StartDate,EndDate,Active,PromoCodeID,ModifiedDate)
          VALUES(?,?,?,CURDATE(),?,1,NULL,NOW())`,[e[0],e[8],e[9],e[10]]);
      } else {
        [result]=await conn.query(`UPDATE UserSubscriptionT SET PlanID=?,AccessType=?,EndDate=?,
          Active=1,PromoCodeID=NULL,ModifiedDate=NOW() WHERE UserID=? AND UserSubscriptionID=?`,
          [e[8],e[9],e[10],e[0],e[2]]);
      }
      if(Number(result.affectedRows)!==1) throw Error(`Expected one changed row for UserID ${e[0]}.`);
      changes++;
    }
    if(changes!==11) throw Error(`Unexpected number of changes: ${changes}.`);
    const after=await collect(conn);
    if(classify(after)!=='MIGRATED') throw Error('Post-update validation failed; rolling back.');
    const [postCount]=await conn.query('SELECT COUNT(*) AS n FROM UserSubscriptionT');
    if(Number(postCount[0].n)!==18) throw Error('Final subscription count is not 18.');
    await conn.commit();committed=true;
    console.log('MIGRATION COMMITTED: 9 updates + 2 inserts. Grant table retained unchanged.');
    console.log(`Pre-migration evidence: ${backupFile}`);
    return {state:'MIGRATED',changed:11};
  } catch(err) {
    if(!committed) {try {await conn.rollback();} catch(_ignored) {}}
    throw err;
  } finally {conn.release();}
}
if(require.main===module) {
  // No pool import or network activity when package is merely installed.
  const args=process.argv.slice(2);
  if(!args.includes('--check') && !args.includes('--apply')) {
    console.error('Use --check or --apply; nothing executed.');process.exitCode=2;
  } else {
    const {pool}=require('../dbConnection');
    main(args,pool).catch(e=>{console.error(`Migration stopped: ${e.message}`);process.exitCode=1;})
      .finally(()=>pool.end());
  }
}
module.exports={EXPECTED,matchRow,classify,main};
