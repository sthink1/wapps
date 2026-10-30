'use strict';
const express = require('express');
const crypto = require('crypto');
const {pool} = require('../dbConnection');
const {sendNotification} = require('../services/notificationService');
const publicRouter = express.Router();
const privateRouter = express.Router();
const codePattern = /^(?=.{4,128}$)(?!.*[\x00-\x1F\x7F])[\s\S]+$/u;
const personPath = /^\/persons\/(\d+)(?:\/|$)/;
function hashToken(token){return crypto.createHash('sha256').update(token).digest('hex');}
function error(message,status=400){const e=new Error(message);e.status=status;return e;}
function sendError(res,e){res.status(e.status||500).json({message:e.status?e.message:'Privacy request failed.'}); if(!e.status)console.error('FT privacy',e);}
function canonicalCode(s){return String(s ?? '').trim().toUpperCase();}
function exactPrivacyKey(s){return typeof s === 'string' ? s : '';}
async function withTx(callback){const c=await pool.getConnection();try{await c.beginTransaction();const result=await callback(c);await c.commit();return result;}catch(e){await c.rollback();throw e;}finally{c.release();}}
async function getTree(c,code,userId){
  const [rows]=await c.query(`SELECT ft.FamilyTreeID,ft.FamilyTreeCode FROM FamilyTreeT ft JOIN FTFamilyTreeUserT u ON u.FamilyTreeID=ft.FamilyTreeID WHERE ft.FamilyTreeCode=? AND u.UserID=? LIMIT 1`,[canonicalCode(code),userId]);
  if(!rows.length){
    // Historical/merged Family Tree codes may be aliases to the active Tree.
    const [aliases]=await c.query('SELECT FamilyTreeID,MergedIntoFamilyTreeID FROM FamilyTreeT WHERE FamilyTreeCode=? LIMIT 1',[canonicalCode(code)]);
    let next=aliases[0]||null;const seen=new Set();
    for(let n=0;next&&n<25;n++){
      if(seen.has(Number(next.FamilyTreeID)))break;seen.add(Number(next.FamilyTreeID));
      if(!next.MergedIntoFamilyTreeID){
        const [access]=await c.query('SELECT ft.FamilyTreeID,ft.FamilyTreeCode FROM FamilyTreeT ft JOIN FTFamilyTreeUserT u ON u.FamilyTreeID=ft.FamilyTreeID WHERE ft.FamilyTreeID=? AND u.UserID=? LIMIT 1',[next.FamilyTreeID,userId]);
        if(access.length)return access[0];break;
      }
      const [v]=await c.query('SELECT FamilyTreeID,MergedIntoFamilyTreeID FROM FamilyTreeT WHERE FamilyTreeID=? LIMIT 1',[next.MergedIntoFamilyTreeID]);next=v[0]||null;
    }
    if(await isAdmin(c,userId)){
      const [adminTrees]=await c.query('SELECT FamilyTreeID,FamilyTreeCode FROM FamilyTreeT WHERE FamilyTreeCode=? LIMIT 1',[canonicalCode(code)]);
      if(adminTrees.length)return adminTrees[0];
    }
    throw error('You are not authorized for this Family Tree.',403);
  }
  return rows[0];
}
async function inTree(c,personID,treeID){const [[row]]=await c.query('SELECT 1 AS n FROM FTFamilyTreePersonT WHERE PersonID=? AND FamilyTreeID=? LIMIT 1',[personID,treeID]);if(!row)throw error('Person does not belong to this Family Tree.',404);}
async function isAdmin(c,userID){const [[row]]=await c.query('SELECT UserName FROM UsersT WHERE UserID=? LIMIT 1',[userID]);return Boolean(row&&String(row.UserName).toLowerCase()==='sthink');}
async function notifyCreator(personID,subject,message){try{const [rows]=await pool.query('SELECT u.Email FROM FTPersonT p JOIN UsersT u ON u.UserID=p.CreatedByUserID WHERE p.PersonID=? LIMIT 1',[personID]);if(rows.length&&rows[0].Email)await sendNotification({recipientEmail:rows[0].Email,category:'FAMILY_TREE',channel:'EMAIL',subject,message,templateName:'FAMILY_TREE_PRIVACY_NOTICE',relatedApp:'FAMILY_TREE',relatedRecordID:personID});}catch(e){console.error('Family Tree privacy creator notice failed',e);}}
async function isUnlocked(c,personID,userID,pageToken){if(!/^[0-9a-f]{64}$/i.test(String(pageToken||'')))return false;const [[row]]=await c.query('SELECT 1 AS yes FROM FTPrivacyUnlockT WHERE PersonID=? AND UserID=? AND SessionHash=? AND ExpiresAt>NOW() LIMIT 1',[personID,userID,hashToken(pageToken)]);return !!row;}
async function hasAccess(c,personID,userID,session){if(await isAdmin(c,userID))return true;return isUnlocked(c,personID,userID,session);}
async function privacyRow(c,personID){const [[row]]=await c.query('SELECT PersonID,IsPrivate FROM FTPersonPrivacyT WHERE PersonID=? LIMIT 1',[personID]);return row||{PersonID:personID,IsPrivate:0};}
async function checkedContact(c,personID){
 const [rows]=await c.query(`SELECT ct.ContactID,ct.ContactValue FROM FTContactT ct WHERE ct.PersonID=? AND ct.IsPrimary=1 AND LOWER(TRIM(ct.ContactType))='email' AND TRIM(ct.ContactValue)<>'' ORDER BY ct.ContactID DESC LIMIT 1`,[personID]);
 if(!rows.length)throw error('A primary email Contact is required before changing privacy.');
 const contact=rows[0];
 const [ver]=await c.query('SELECT Response,EmailAddress FROM FTContactEmailVerificationT WHERE ContactID=? ORDER BY VerificationID DESC LIMIT 1',[contact.ContactID]);
 if(!ver.length||ver[0].Response!=='VERIFIED'||String(ver[0].EmailAddress).trim().toLowerCase()!==String(contact.ContactValue).trim().toLowerCase())throw error('The primary Contact email must be verified before changing privacy.');
 return contact;
}
privateRouter.get('/status/:personID',async(req,res)=>{try{
 const personID=Number(req.params.personID);const c=await pool.getConnection();try{const tree=await getTree(c,req.query.familyTreeCode,req.user.userId);await inTree(c,personID,tree.FamilyTreeID);const p=await privacyRow(c,personID);const [[pending]]=await c.query(`SELECT RequestedAction,ExpiresAt FROM FTPrivacyRequestT WHERE PersonID=? AND Response IS NULL AND ExpiresAt>NOW() ORDER BY RequestID DESC LIMIT 1`,[personID]);res.json({PersonID:personID,IsPrivate:!!p.IsPrivate,Authorized:!p.IsPrivate||await hasAccess(c,personID,req.user.userId,req.headers['x-ft-page-token']),PendingAction:pending?.RequestedAction||null,PendingUntil:pending?.ExpiresAt||null,IsAdmin:await isAdmin(c,req.user.userId)});}finally{c.release();}
 }catch(e){sendError(res,e);}});
privateRouter.post('/request/:personID',async(req,res)=>{try{
 const personID=Number(req.params.personID);const action=String(req.body.action||'').toUpperCase();const key=exactPrivacyKey(req.body.keyCode),confirm=exactPrivacyKey(req.body.confirmKeyCode);
 if(action!=='PRIVATE'&&action!=='PUBLIC')throw error('Choose GO PRIVATE or GO PUBLIC.');
 if(action==='PRIVATE'&&(!codePattern.test(key)||key!==confirm||['0000','1111','1234','AAAA','ABCD'].includes(key.toUpperCase())))throw error('Enter matching key codes of at least four characters (letters, numbers, or symbols; maximum 128). Avoid predictable codes.');
 const result=await withTx(async c=>{const tree=await getTree(c,req.body.familyTreeCode,req.user.userId);await inTree(c,personID,tree.FamilyTreeID);const [[p]]=await c.query('SELECT CreatedByUserID,FirstName,LastName FROM FTPersonT WHERE PersonID=? LIMIT 1',[personID]);if(!p)throw error('Person not found.',404);
 const current=await privacyRow(c,personID);if((action==='PRIVATE')===Boolean(current.IsPrivate))throw error('Person already has that verified privacy setting.');const contact=await checkedContact(c,personID);
 await c.query("UPDATE FTPrivacyRequestT SET Response='SUPERSEDED',RespondedAt=NOW() WHERE PersonID=? AND Response IS NULL",[personID]);
 const raw=crypto.randomBytes(32).toString('hex');const [r]=await c.query(`INSERT INTO FTPrivacyRequestT (PersonID,FamilyTreeID,ContactID,EmailAddress,RequestedAction,ProposedKeyCode,TokenHash,RequestedByUserID,RequestedAt,ExpiresAt) VALUES (?,?,?,?,?,?,?,?,NOW(),DATE_ADD(NOW(),INTERVAL 24 HOUR))`,[personID,tree.FamilyTreeID,contact.ContactID,String(contact.ContactValue).trim(),action,action==='PRIVATE'?key:null,hashToken(raw),req.user.userId]);
 return {raw,requestID:r.insertId,email:contact.ContactValue,action,personName:[p.FirstName,p.LastName].filter(Boolean).join(' '),creatorID:p.CreatedByUserID};});
 const base=String(process.env.PUBLIC_BASE_URL||process.env.APP_BASE_URL||'http://localhost:8080').replace(/\/$/,'');const link=`${base}/FTPrivacyVerification.html?token=${encodeURIComponent(result.raw)}`;
 try{await sendNotification({recipientEmail:result.email,category:'FAMILY_TREE',channel:'EMAIL',subject:`Family Tree privacy change approval — ${result.personName}`,message:`Someone requested GO ${result.action==='PRIVATE'?'PRIVATE':'PUBLIC'} for ${result.personName}. Please review and approve or decline within 24 hours. If you did not expect this request, decline it.`,templateName:'FAMILY_TREE_PRIVACY_APPROVAL',relatedApp:'FAMILY_TREE',relatedRecordID:personID,actionButtons:[{label:'REVIEW PRIVACY REQUEST',url:link,kind:'approve'}]});}catch(e){console.error('Privacy approval email delivery failed',e);return res.status(502).json({message:'Request saved, but approval email could not be delivered. Retry only after checking the email service.'});}
 await notifyCreator(personID,'Family Tree Privacy Change Requested',`A GO ${action} request was submitted for ${result.personName}. The primary email recipient has 24 hours to approve. Privacy remains unchanged until approval.`);
 res.json({message:'Privacy change requested. Current privacy setting remains unchanged until email approval.',PendingAction:action});
 }catch(e){sendError(res,e);}});
privateRouter.post('/unlock/:personID',async(req,res)=>{try{
 const personID=Number(req.params.personID),userID=req.user.userId,key=exactPrivacyKey(req.body.keyCode);
 if(!codePattern.test(key))throw error('Enter your key code (at least four characters; letters, numbers, or symbols).');
 const result=await withTx(async c=>{const tree=await getTree(c,req.body.familyTreeCode,userID);await inTree(c,personID,tree.FamilyTreeID);const p=await privacyRow(c,personID);if(!p.IsPrivate)return {message:'Person is public.'};
 if(await isAdmin(c,userID))return {message:'Administrator access authorized.'};
 const [[attempts]]=await c.query("SELECT COUNT(*) AS n FROM FTPrivacyAttemptT WHERE PersonID=? AND UserID=? AND IsCorrect=0 AND AttemptedAt>DATE_SUB(NOW(),INTERVAL 15 MINUTE)",[personID,userID]);if(attempts.n>=5)throw error('Too many incorrect attempts. Try again after 15 minutes.',429);
 const [[record]]=await c.query('SELECT KeyCode FROM FTPersonPrivacyT WHERE PersonID=?',[personID]);const ok=Boolean(record&&record.KeyCode===key);
 await c.query('INSERT INTO FTPrivacyAttemptT (PersonID,UserID,IsCorrect,AttemptedAt) VALUES (?,?,?,NOW())',[personID,userID,ok?1:0]);if(!ok)return {badKey:true};
 const pageToken=crypto.randomBytes(32).toString('hex');await c.query('DELETE FROM FTPrivacyUnlockT WHERE PersonID=? AND UserID=?',[personID,userID]);await c.query('INSERT INTO FTPrivacyUnlockT(PersonID,UserID,SessionHash,ExpiresAt) VALUES (?,?,?,DATE_ADD(NOW(),INTERVAL 20 MINUTE))',[personID,userID,hashToken(pageToken)]);return {message:'Key accepted for this page visit.',pageToken};});if(result.badKey)return res.status(403).json({message:'Incorrect key code.'});res.json(result);
 }catch(e){sendError(res,e);}});
async function fetchRequest(c,token,lock){if(!/^[0-9a-f]{64}$/.test(token))throw error('Invalid approval link.',400);
 const [rows]=await c.query(`SELECT r.*,c.ContactValue,c.IsPrimary,c.ContactType FROM FTPrivacyRequestT r LEFT JOIN FTContactT c ON c.ContactID=r.ContactID WHERE r.TokenHash=? LIMIT 1 ${lock?'FOR UPDATE':''}`,[hashToken(token)]);if(!rows.length)throw error('Approval request not found.',404);return rows[0];}
function activeRequest(r){return !r.RespondedAt && new Date(r.ExpiresAt)>new Date()&&r.ContactType==='Email'&&Number(r.IsPrimary)===1&&String(r.ContactValue||'').trim().toLowerCase()===String(r.EmailAddress).trim().toLowerCase();}
publicRouter.get('/:token',async(req,res)=>{try{const c=await pool.getConnection();try{const r=await fetchRequest(c,req.params.token,false);res.json({valid:activeRequest(r),action:r.RequestedAction,message:activeRequest(r)?`Review GO ${r.RequestedAction} request. No change occurs until you approve.`:'This privacy request has expired or is no longer valid.'});}finally{c.release();}}catch(e){sendError(res,e);}});
publicRouter.post('/:token',async(req,res)=>{try{const decision=String(req.body.decision||'').toUpperCase();if(!['APPROVE','DECLINE'].includes(decision))throw error('Choose approve or decline.');
 const result=await withTx(async c=>{const r=await fetchRequest(c,req.params.token,true);if(!activeRequest(r))throw error('Request has expired or is no longer valid.',409);
 const [emailState]=await c.query('SELECT Response,EmailAddress FROM FTContactEmailVerificationT WHERE ContactID=? ORDER BY VerificationID DESC LIMIT 1',[r.ContactID]);
 if(decision==='APPROVE'&&(!emailState.length||emailState[0].Response!=='VERIFIED'||String(emailState[0].EmailAddress).trim().toLowerCase()!==String(r.EmailAddress).trim().toLowerCase()))throw error('The primary Contact email is no longer verified.',409);
 if(decision==='APPROVE'){
 const isPrivate=r.RequestedAction==='PRIVATE'?1:0;
 await c.query(`INSERT INTO FTPersonPrivacyT(PersonID,IsPrivate,KeyCode,VerifiedAt,UpdatedByUserID) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE IsPrivate=VALUES(IsPrivate),KeyCode=CASE WHEN VALUES(IsPrivate)=1 THEN VALUES(KeyCode) ELSE KeyCode END,VerifiedAt=VALUES(VerifiedAt),UpdatedByUserID=VALUES(UpdatedByUserID)`,[r.PersonID,isPrivate,isPrivate?r.ProposedKeyCode:null,new Date(),r.RequestedByUserID]);
 await c.query('DELETE FROM FTPrivacyUnlockT WHERE PersonID=?',[r.PersonID]);}
 await c.query('UPDATE FTPrivacyRequestT SET RespondedAt=NOW(),Response=? WHERE RequestID=?',[decision==='APPROVE'?'APPROVED':'DECLINED',r.RequestID]);return {personID:r.PersonID,action:r.RequestedAction,message:decision==='APPROVE'?`GO ${r.RequestedAction} approved.`:'Privacy change declined. Current setting unchanged.'};});await notifyCreator(result.personID,'Family Tree Privacy Decision',`The GO ${result.action} request was ${decision==='APPROVE'?'approved':'declined'}.`);res.json({message:result.message});
 }catch(e){sendError(res,e);}});

/* Attach AFTER authentication and BEFORE the existing Family Tree routes.
   Every ordinary JSON response is redacted on the server before reaching browsers. */
function redactPerson(obj){const safe={PersonID:obj.PersonID,IsPrivate:true};for(const k of ['FirstName','MiddleName','LastName','SuffixName','FamilyTreeCode','OldestFamilyTreeCode'])if(Object.prototype.hasOwnProperty.call(obj,k))safe[k]=obj[k];return safe;}
async function protection(req,res,next){try{
 const userID=req.user.userId;const path=req.path;const match=path.match(personPath);
 const c=await pool.getConnection();try{
 if(match){const id=Number(match[1]),code=req.query.familyTreeCode||req.body?.familyTreeCode;const tree=await getTree(c,code,userID);await inTree(c,id,tree.FamilyTreeID);const p=await privacyRow(c,id);
 if(p.IsPrivate){
   const authorized=await hasAccess(c,id,userID,req.headers['x-ft-page-token']);
   // Keep full focal-Person data for authorized GETs, including images.
   // Other private people appearing in responses remain redacted.
   if(authorized&&req.method==='GET')req._privacyFullPersonID=id;
   if(!authorized&&!(/^\/persons\/\d+\/(ancestor|relationships)$/.test(path)))return res.status(423).json({code:'PRIVATE_LOCKED',message:'This Person is private. Enter the key code.'});
 }
 }
 }finally{c.release();}
 const original=res.json.bind(res);
 res.json=function(data){
   (async()=>{try{if(!data||typeof data!=='object')return original(data);
     const ids=new Set();const crawl=(v,depth=0)=>{if(!v||typeof v!=='object'||depth>18)return;if(Array.isArray(v)){v.forEach(x=>crawl(x,depth+1));return;}if(Number.isInteger(Number(v.PersonID))&&Number(v.PersonID)>0)ids.add(Number(v.PersonID));Object.values(v).forEach(x=>crawl(x,depth+1));};crawl(data);
     if(!ids.size)return original(data);
     const [rows]=await pool.query(`SELECT PersonID FROM FTPersonPrivacyT WHERE IsPrivate=1 AND PersonID IN (${[...ids].map(()=>'?').join(',')})`,[...ids]);const locked=new Set(rows.map(x=>Number(x.PersonID)));
     const sanitize=(v,depth=0)=>{if(!v||typeof v!=='object'||depth>18)return v;if(Array.isArray(v))return v.map(x=>sanitize(x,depth+1));if(locked.has(Number(v.PersonID))&&!(req._privacyFullPersonID&&Number(v.PersonID)===req._privacyFullPersonID))return redactPerson(v);const out={};for(const [k,x] of Object.entries(v))out[k]=sanitize(x,depth+1);return out;};
     return original(sanitize(data));
   }catch(e){console.error('Family Tree privacy response filter',e);return res.status(500).send('Unable to safely return Family Tree data.');}})();return res;
 };
 next();
 }catch(e){sendError(res,e);}}
module.exports={publicRouter,privateRouter,protection};
