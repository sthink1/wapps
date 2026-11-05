'use strict';
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const sessions = require('../services/browserSession');
const { pool } = require('../dbConnection');
const { getAdministratorStatus, requireAdministrator, webOnly, configuredAdministrator, usernameMatches } = require('../services/administratorAccess');
const router = express.Router();
const EXPIRY_MS = 2 * 60 * 60 * 1000;
const generic = (res, status, error) => res.status(status).json({error});
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
function sameHash(a,b) {
  if (!/^[a-f0-9]{64}$/.test(a || '') || !/^[a-f0-9]{64}$/.test(b || '')) return false;
  return crypto.timingSafeEqual(Buffer.from(a,'hex'), Buffer.from(b,'hex'));
}
function origin(req,res,next) {
  try { sessions.requireOrigin(req); next(); }
  catch (_) { generic(res,403,'ORIGIN_NOT_ALLOWED'); }
}
router.use(auth,webOnly);
router.get('/status', requireAdministrator, async (req,res,next) => {
  try {
    const status=await getAdministratorStatus(req.user);
    const [all]=await pool.query('SELECT UserID,UserName FROM UsersT WHERE IsAdministrator=1 ORDER BY UserID');
    res.json({configuredUsername:status.configuredUsername,username:status.username,isAdmin:status.isAdmin,designatedUsers:all});
  } catch (_) { next(new Error('Administrator status unavailable')); }
});
router.get('/target/:userId', requireAdministrator, async (req,res,next) => {
  try {
    const id=Number(req.params.userId);
    if (!Number.isSafeInteger(id)||id<1) return generic(res,400,'Invalid user ID.');
    const [rows]=await pool.query('SELECT UserID,UserName FROM UsersT WHERE UserID=? LIMIT 1',[id]);
    if (!rows.length) return generic(res,404,'Account not found.');
    res.json({userId:rows[0].UserID,username:rows[0].UserName});
  } catch (_) { next(new Error('Account lookup unavailable')); }
});
router.post('/prepare',origin,requireAdministrator,async(req,res,next)=>{
  let c;
  try {
    const targetId=Number(req.body && req.body.targetUserId);
    const password=req.body && req.body.password;
    if (!Number.isSafeInteger(targetId)||targetId<1 || typeof password!=='string' || !password) return generic(res,400,'Target account and current password required.');
    c=await pool.getConnection();
    await c.beginTransaction();
    const [locks]=await c.query('SELECT * FROM AdminTransferStateT WHERE ControlID=1 FOR UPDATE');
    if(locks.length!==1) throw new Error('Transfer schema not initialized');
    const state=locks[0];
    if(state.TokenHash && !state.CompletedAt && !state.CancelledAt && new Date(state.ExpiresAt)>new Date()) {
      await c.rollback();return generic(res,409,'Another administrator transfer is pending.');
    }
    const [actors]=await c.query('SELECT UserID,UserName,PasswordHash,IsAdministrator FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[req.user.userId]);
    const actor=actors[0];
    if(!actor || Number(actor.IsAdministrator)!==1 || !usernameMatches(actor.UserName,configuredAdministrator())) {
      await c.rollback();return generic(res,403,'Administrator access required.');
    }
    if (!(await bcrypt.compare(password,actor.PasswordHash))) {
      await c.rollback();return generic(res,403,'Current password not accepted.');
    }
    const [targets]=await c.query('SELECT UserID,UserName FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[targetId]);
    if(!targets.length || Number(actor.UserID)===targetId) {
      await c.rollback();return generic(res,400,'Select a different existing account.');
    }
    const target=targets[0];
    const token=crypto.randomBytes(32).toString('hex');
    const expires=new Date(Date.now()+EXPIRY_MS);
    await c.query(`UPDATE AdminTransferStateT SET InitiatorUserID=?,InitiatorUserName=?,InitiatorSessionPublicID=?,TargetUserID=?,TargetUserName=?,TokenHash=?,CreatedAt=UTC_TIMESTAMP(6),ExpiresAt=?,CompletedAt=NULL,CancelledAt=NULL WHERE ControlID=1`,
      [actor.UserID,actor.UserName,req.user.sessionPublicId,target.UserID,target.UserName,hash(token),expires]);
    await c.query('INSERT INTO AdminTransferAuditT(EventType,InitiatorUserID,FromUserID,ToUserID,FromUsername,ToUsername) VALUES(?,?,?,?,?,?)',
      ['PREPARED',actor.UserID,actor.UserID,target.UserID,actor.UserName,target.UserName]);
    await c.commit();
    res.json({targetUserId:target.UserID,targetUsername:target.UserName,expiresAt:expires.toISOString(),transferToken:token});
  } catch (_) {if(c){try{await c.rollback();}catch(_){}}next(new Error('Administrator transfer preparation failed'));}
  finally {if(c)c.release();}
});
async function pending(req,res,next) {
  try {
    const token=String(req.body && req.body.transferToken || '');
    const [rows]=await pool.query('SELECT * FROM AdminTransferStateT WHERE ControlID=1');
    const state=rows[0];
    if(!state||!sameHash(hash(token),state.TokenHash)||state.CompletedAt||state.CancelledAt||new Date(state.ExpiresAt)<=new Date()||
       Number(state.InitiatorUserID)!==Number(req.user.userId)||state.InitiatorSessionPublicID!==req.user.sessionPublicId)
      return generic(res,403,'Pending transfer authorization is invalid or expired.');
    res.json({targetUserId:state.TargetUserID,targetUsername:state.TargetUserName,
      configuredUsername:configuredAdministrator(),initiatorUsername:state.InitiatorUserName,
      renderMatches:usernameMatches(configuredAdministrator(),state.TargetUserName),expiresAt:state.ExpiresAt});
  } catch (_) {next(new Error('Pending transfer lookup unavailable'));}
}
router.post('/pending',origin,pending);
router.post('/cancel',origin,async(req,res,next)=>{
  let c;
  try {
    const token=String(req.body && req.body.transferToken || '');
    if(!/^[a-f0-9]{64}$/.test(token))return generic(res,403,'Invalid transfer authorization.');
    c=await pool.getConnection();
    await c.beginTransaction();
    const [rows]=await c.query('SELECT * FROM AdminTransferStateT WHERE ControlID=1 FOR UPDATE');
    const state=rows[0];
    if(!state||!sameHash(hash(token),state.TokenHash)||state.CompletedAt||state.CancelledAt||
       Number(state.InitiatorUserID)!==Number(req.user.userId)||state.InitiatorSessionPublicID!==req.user.sessionPublicId){
      await c.rollback();return generic(res,403,'Transfer authorization is invalid or already closed.');
    }
    // Cancellation is permitted only after Render has been restored to the
    // original administrator; otherwise cancellation would leave no matching admin.
    if(!usernameMatches(configuredAdministrator(),state.InitiatorUserName)){
      await c.rollback();return generic(res,409,'Restore Render ADMIN_USERNAME to the original administrator before cancelling.');
    }
    const [actors]=await c.query('SELECT UserID,UserName,IsAdministrator FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[state.InitiatorUserID]);
    if(actors.length!==1||Number(actors[0].IsAdministrator)!==1||
       !usernameMatches(actors[0].UserName,state.InitiatorUserName)){
      await c.rollback();return generic(res,409,'Original administrator designation has changed; cancellation denied.');
    }
    await c.query('UPDATE AdminTransferStateT SET CancelledAt=UTC_TIMESTAMP(6) WHERE ControlID=1');
    await c.query('INSERT INTO AdminTransferAuditT(EventType,InitiatorUserID,FromUserID,ToUserID,FromUsername,ToUsername) VALUES(?,?,?,?,?,?)',
      ['CANCELLED',state.InitiatorUserID,state.InitiatorUserID,state.TargetUserID,state.InitiatorUserName,state.TargetUserName]);
    await c.commit();
    res.json({message:'Pending administrator transfer cancelled. Existing administrator remains unchanged.'});
  } catch (_) {if(c){try{await c.rollback();}catch(_){}}next(new Error('Administrator transfer cancellation failed'));}
  finally {if(c)c.release();}
});
router.post('/complete',origin,async(req,res,next)=>{
  let c;
  try {
    const token=String(req.body && req.body.transferToken || '');
    if(!/^[a-f0-9]{64}$/.test(token))return generic(res,403,'Invalid transfer authorization.');
    c=await pool.getConnection();await c.beginTransaction();
    const [rows]=await c.query('SELECT * FROM AdminTransferStateT WHERE ControlID=1 FOR UPDATE');
    const state=rows[0];
    if(!state||!sameHash(hash(token),state.TokenHash)||state.CompletedAt||state.CancelledAt||new Date(state.ExpiresAt)<=new Date()||
       Number(state.InitiatorUserID)!==Number(req.user.userId)||state.InitiatorSessionPublicID!==req.user.sessionPublicId) {
      await c.rollback();return generic(res,403,'Transfer authorization is invalid or expired.');
    }
    // Render must have ALREADY changed; no database state is modified on mismatch.
    if(!usernameMatches(configuredAdministrator(),state.TargetUserName)) {
      await c.rollback();return generic(res,409,'Render ADMIN_USERNAME must match the proposed administrator.');
    }
    const [actors]=await c.query('SELECT UserID,UserName,IsAdministrator FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[state.InitiatorUserID]);
    const [targets]=await c.query('SELECT UserID,UserName FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[state.TargetUserID]);
    if(!actors.length||Number(actors[0].IsAdministrator)!==1||!usernameMatches(actors[0].UserName,state.InitiatorUserName)||
       !targets.length||!usernameMatches(targets[0].UserName,state.TargetUserName)) {
      await c.rollback();return generic(res,409,'Account designation changed; transfer cancelled.');
    }
    await c.query('UPDATE UsersT SET IsAdministrator=0 WHERE IsAdministrator<>0');
    await c.query('UPDATE UsersT SET IsAdministrator=1 WHERE UserID=?',[state.TargetUserID]);
    await c.query('UPDATE AdminTransferStateT SET CompletedAt=UTC_TIMESTAMP(6) WHERE ControlID=1');
    await c.query('INSERT INTO AdminTransferAuditT(EventType,InitiatorUserID,FromUserID,ToUserID,FromUsername,ToUsername) VALUES(?,?,?,?,?,?)',
      ['COMPLETED',state.InitiatorUserID,state.InitiatorUserID,state.TargetUserID,state.InitiatorUserName,state.TargetUserName]);
    await c.commit();
    res.json({message:'Administrator designation transferred. Sign in as the new administrator.',username:state.TargetUserName});
  } catch (_) {if(c){try{await c.rollback();}catch(_){}}next(new Error('Administrator transfer failed'));}
  finally {if(c)c.release();}
});
module.exports=router;
