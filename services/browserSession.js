'use strict';
// Test-only package: production credentials are deliberately rejected.
if (process.env.DB_NAME !== 'sql5838929') {
  throw new Error('Stage 6A local-testing package is restricted to test database sql5838929');
}
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const ACCESS_MS = 8*60*60*1000;
const SLIDE_MS = 180*24*60*60*1000;
const ABS_MS = 365*24*60*60*1000;
const COOKIE = 'wa_refresh';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const newSecret = () => crypto.randomBytes(48).toString('hex');
const nowDate = () => new Date();
const soonest = (a,b) => new Date(Math.min(a.getTime(),b.getTime()));
function cookieOptions(req, maxAge) {
  return { httpOnly:true, secure: process.env.NODE_ENV === 'production', sameSite:'lax', path:'/users', ...(maxAge===undefined?{}:{maxAge}) };
}
function setCookie(res,req,secret,expires) { res.cookie(COOKIE, secret, cookieOptions(req,Math.max(0,expires-Date.now()))); }
function clearCookie(res,req) { res.clearCookie(COOKIE,cookieOptions(req)); }
function cookie(req) { const m=(req.headers.cookie||'').match(/(?:^|;\s*)wa_refresh=([a-f0-9]{96})(?:;|$)/);return m?m[1]:null; }
function requireOrigin(req) {
  const origin=req.get('Origin');
  if (!origin) { const e=new Error('ORIGIN_REQUIRED');e.status=403;throw e; }
  const expected=`${req.protocol}://${req.get('host')}`;
  // Render terminates TLS upstream: deployed host is HTTPS even if local proxy connection is HTTP.
  const deployExpected=`https://${req.get('host')}`;
  if (origin !== expected && !(process.env.NODE_ENV==='production' && origin===deployExpected)) {
    const e=new Error('ORIGIN_NOT_ALLOWED');e.status=403;throw e;
  }
}
async function securityVersion(c,userId) {
  const [r]=await c.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=? LIMIT 1',[userId]);
  if(r.length!==1) throw Error('USER_SECURITY_MISSING');return Number(r[0].SecurityVersion);
}
function accessToken(user,sid,version) {return jwt.sign({userId:user.UserID,username:user.UserName,client:'web',sid,securityVersion:version},process.env.JWT_SECRET,{expiresIn:'8h',algorithm:'HS256'});}
async function create(c,user,remembered) {
  const created=nowDate(); const absolute=new Date(created.getTime()+(remembered?ABS_MS:ACCESS_MS));
  const expire=soonest(new Date(created.getTime()+(remembered?SLIDE_MS:ACCESS_MS)),absolute);const sid=crypto.randomBytes(16).toString('hex');
  const [result]=await c.query('INSERT INTO WebSessionT (UserID,SessionPublicID,IsRemembered,CreatedAt,LastActivityAt,ExpiresAt,AbsoluteExpiresAt,RevokedAt) VALUES (?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP(),?,?,NULL)',[user.UserID,sid,remembered?1:0,expire,absolute]);
  const version=await securityVersion(c,user.UserID);let refresh=null;
  if(remembered){const secret=newSecret(); await c.query('INSERT INTO WebRefreshTokenT (WebSessionID,TokenHash,ParentTokenID,CreatedAt,ExpiresAt,ConsumedAt,RevokedAt) VALUES (?,?,NULL,UTC_TIMESTAMP(),?,NULL,NULL)',[result.insertId,hash(secret),expire]); refresh={secret,expires:expire};}
  return { token:accessToken(user,sid,version),refresh };
}
async function rotate(pool,secret) {
  if(!/^[a-f0-9]{96}$/.test(secret||'')) {const e=Error('REFRESH_INVALID');e.status=401;throw e;}
  const c=await pool.getConnection();try {
    await c.beginTransaction();
    const [rows]=await c.query(`SELECT r.WebRefreshTokenID,r.WebSessionID,r.ConsumedAt,r.RevokedAt,r.ExpiresAt AS TokenExpires,s.UserID,s.IsRemembered,s.RevokedAt AS SessionRevoked,s.AbsoluteExpiresAt,s.ExpiresAt AS SessionExpires,s.SessionPublicID,u.UserName,sec.SecurityVersion
      FROM WebRefreshTokenT r JOIN WebSessionT s ON s.WebSessionID=r.WebSessionID JOIN UsersT u ON u.UserID=s.UserID JOIN UserSecurityT sec ON sec.UserID=u.UserID
      WHERE r.TokenHash=? LIMIT 1 FOR UPDATE`,[hash(secret)]);
    const r=rows[0], now=nowDate();
    if(!r||r.ConsumedAt||r.RevokedAt||r.SessionRevoked||!r.IsRemembered||new Date(r.TokenExpires)<=now||new Date(r.SessionExpires)<=now||new Date(r.AbsoluteExpiresAt)<=now){const e=Error('REFRESH_INVALID');e.status=401;throw e;}
    const nextExpiry=soonest(new Date(now.getTime()+SLIDE_MS),new Date(r.AbsoluteExpiresAt));
    const [consumed]=await c.query('UPDATE WebRefreshTokenT SET ConsumedAt=UTC_TIMESTAMP() WHERE WebRefreshTokenID=? AND ConsumedAt IS NULL',[r.WebRefreshTokenID]);
    if(consumed.affectedRows!==1) throw new Error('REFRESH_CONCURRENT_MODIFICATION');
    const next=newSecret();
    await c.query('INSERT INTO WebRefreshTokenT (WebSessionID,TokenHash,ParentTokenID,CreatedAt,ExpiresAt,ConsumedAt,RevokedAt) VALUES (?,?,?,UTC_TIMESTAMP(),?,NULL,NULL)',[r.WebSessionID,hash(next),r.WebRefreshTokenID,nextExpiry]);
    await c.query('UPDATE WebSessionT SET ExpiresAt=?,LastActivityAt=UTC_TIMESTAMP() WHERE WebSessionID=?',[nextExpiry,r.WebSessionID]);
    const jwtToken=accessToken({UserID:r.UserID,UserName:r.UserName},r.SessionPublicID,Number(r.SecurityVersion));
    await c.commit();return {token:jwtToken,refresh:{secret:next,expires:nextExpiry}};
  }catch(e){try{await c.rollback();}catch(_){}throw e;}finally{c.release();}
}
async function revokeCurrent(pool,claims){await pool.query('UPDATE WebSessionT SET RevokedAt=UTC_TIMESTAMP() WHERE UserID=? AND SessionPublicID=? AND RevokedAt IS NULL',[claims.userId,claims.sessionPublicId]);}
async function revokeAll(c,userId){await c.query('UPDATE WebSessionT SET RevokedAt=UTC_TIMESTAMP() WHERE UserID=? AND RevokedAt IS NULL',[userId]);await c.query('UPDATE TNNARefreshTokenT SET RevokedAt=UTC_TIMESTAMP() WHERE UserID=? AND RevokedAt IS NULL',[userId]);await c.query('UPDATE UserSecurityT SET SecurityVersion=SecurityVersion+1,UpdatedAt=UTC_TIMESTAMP() WHERE UserID=?',[userId]);}
module.exports={create,rotate,revokeCurrent,revokeAll,accessToken,securityVersion,requireOrigin,setCookie,clearCookie,cookie,COOKIE,ACCESS_MS,SLIDE_MS,ABS_MS};
