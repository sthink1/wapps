// File: routes/users.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { pool } = require('../dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { handleDbError } = require('../utils');
const { sendVerificationCode, sendPasswordResetLink, sendPasswordChangedNotice } = require('../send_email');
const crypto = require('crypto');
const sessions = require('../services/browserSession');
const { isExpectedClientError } = require('../services/stage6ExpectedClientError');
const fence = require('../services/credentialFence');
const loginLimiter = require('../services/loginLimiter');
const loginVerification = require('../services/loginVerification');
const auth = require('../middleware/auth');
const { getOrCreateDevelopmentTrial } = require('../services/subscriptionService');
const { getActiveConsentVersion, logConsent } = require('../services/notificationService');

require('dotenv').config();

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in .env');
    process.exit(1);
}

router.post('/register', [
    body('username')
        .trim()
        .notEmpty().withMessage('User Name cannot be blank.(be)')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('User Name can only contain letters, numbers, underscores, and hyphens.(be)'),
    body('password')
        .trim()
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.(be)'),
    body('email')
        .isEmail().withMessage('Please provide a valid email.(be)'),
    body('phone1')
        .trim()
        .notEmpty().withMessage('Phone 1 cannot be blank.(be)')
        .custom(value => {
            const cleanedPhone = value.replace(/[^\d]/g, '');
            if (!/^\d{10}$/.test(cleanedPhone)) {
                throw new Error('Phone number must be 10 digits (e.g., 123-456-7890).(be)');
            }
            return true;
        }),
    body('phone2')
        .optional({ nullable: true })
        .custom(value => {
            if (value && value.trim() !== '') {
                const cleanedPhone = value.replace(/[^\d]/g, '');
                if (!/^\d{10}$/.test(cleanedPhone)) {
                    throw new Error('Phone number must be 10 digits (e.g., 123-456-7890). (be)');
                }
            }
            return true;
        }),
    body('marketingEmail')
        .optional()
        .isBoolean().withMessage('Marketing email preference must be true or false.(be)'),
    body('marketingSMS')
        .optional()
        .isBoolean().withMessage('Marketing text preference must be true or false.(be)'),
    body('termsAccepted')
        .custom(value => {
            if (value !== true) {
                throw new Error('You must agree to the Terms of Use and Privacy Policy to register.(be)');
            }
            return true;
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    let {
        username,
        password,
        email,
        phone1,
        phone2,
        marketingEmail = false,
        marketingSMS = false
    } = req.body;

    username = username.toLowerCase();
    email = email.trim().toLowerCase();

    const formatPhone = (phone) => {
        const cleaned = phone.replace(/[^\d]/g, '');
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };
    phone1 = formatPhone(phone1);
    phone2 = phone2 && phone2.trim() !== '' ? formatPhone(phone2) : null;

    const c = await pool.getConnection();

    try {
        await c.beginTransaction();

        const [usernameResults] = await c.query(
            'SELECT UserID FROM UsersT WHERE LOWER(UserName) = ? LIMIT 1',
            [username]
        );
        if (usernameResults.length > 0) {
            await c.rollback();
            return res.status(400).json({ error: 'User already exists. (be)' });
        }

        const [emailResults] = await c.query(
            'SELECT UserID FROM UsersT WHERE LOWER(Email) = LOWER(?) LIMIT 1',
            [email]
        );
        if (emailResults.length > 0) {
            await c.rollback();
            return res.status(400).json({ error: 'Email already exists. (be)' });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const [insertUser] = await c.query(
            'INSERT INTO UsersT SET ?',
            {
                UserName: username,
                PasswordHash: hash,
                Email: email,
                Phone1: phone1,
                Phone2: phone2 || null
            }
        );

        const userID = insertUser.insertId;

        await c.query(
            `INSERT INTO NotificationPreferencesT
             (UserID, MarketingEmail, MarketingSMS, FamilyTreeEmail, AppNoticeEmail, CreatedAt, UpdatedAt)
             VALUES (?,?,?,?,?,NOW(),NULL)`,
            [userID, marketingEmail ? 1 : 0, marketingSMS ? 1 : 0, 1, 1]
        );

        const marketingEmailVersionID = await getActiveConsentVersion(c, 'MARKETING_EMAIL');
        const marketingSMSVersionID = await getActiveConsentVersion(c, 'MARKETING_SMS');
        const termsVersionID = await getActiveConsentVersion(c, 'TERMS');
        const privacyVersionID = await getActiveConsentVersion(c, 'PRIVACY');

        if (!termsVersionID || !privacyVersionID) {
            throw new Error('Terms/Privacy consent versions are not configured. Run notification_schema.sql.');
        }

        // Record the user's explicit selection, including an OPT_OUT when the
        // optional marketing box was left unchecked at registration.
        await logConsent(c, {
            userID,
            email,
            phone: null,
            category: 'MARKETING',
            channel: 'EMAIL',
            action: marketingEmail ? 'OPT_IN' : 'OPT_OUT',
            consentTextVersionID: marketingEmailVersionID,
            source: 'REGISTER'
        });

        await logConsent(c, {
            userID,
            email,
            phone: phone1,
            category: 'MARKETING',
            channel: 'SMS',
            action: marketingSMS ? 'OPT_IN' : 'OPT_OUT',
            consentTextVersionID: marketingSMSVersionID,
            source: 'REGISTER'
        });

        await c.query(
            `INSERT INTO UserAgreementHistoryT
             (UserID, AgreementType, ConsentTextVersionID, AcceptedAt)
             VALUES (?,?,?,NOW()), (?,?,?,NOW())`,
            [
                userID, 'TERMS', termsVersionID,
                userID, 'PRIVACY', privacyVersionID
            ]
        );

        await c.query('INSERT INTO UserSecurityT (UserID,SecurityVersion,UpdatedAt) VALUES (?,1,UTC_TIMESTAMP())',[userID]);
        await c.commit();

        // Registration does not log the user in. The user must complete the
        // normal login + email verification flow before receiving a final JWT.
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        handleDbError(error, res, 'Error registering user');
    } finally {
        c.release();
    }
});

// Shared password authentication for WA and TNNA. Rate decisions, password
// validation and email reservation are serialized by the account fence.
router.post('/login', async (req, res) => {
    const { username, password } = req.body || {};
    const invalidCredentials = () => res.status(401).json({
        error: 'Invalid credentials or login temporarily restricted. Please try again later.'
    });
    if (typeof username !== 'string' || username.length === 0 || username.length > 50 ||
        typeof password !== 'string' || password.length === 0) {
        return invalidCredentials();
    }

    try {
        const [results] = await pool.query(
            'SELECT UserID FROM UsersT WHERE UserName = ? LIMIT 1', [username]
        );
        if (results.length !== 1) {
            // No counter row is created for arbitrary nonexistent usernames.
            return invalidCredentials();
        }

        const c = await pool.getConnection();
        let user;
        let verificationCode;
        let tempToken;
        try {
            await c.beginTransaction();
            const version = await fence.lock(c, results[0].UserID);
            const [fresh] = await c.query(
                `SELECT UserID, UserName, Email, PasswordHash FROM UsersT
                 WHERE UserID = ? AND UserName = ? LIMIT 1 FOR UPDATE`,
                [results[0].UserID, username]
            );
            if (fresh.length !== 1) {
                await c.rollback();
                return invalidCredentials();
            }
            user = fresh[0];
            const rate = await loginLimiter.load(c, user.UserID);
            if (!loginLimiter.passwordAllowed(rate)) {
                await c.commit();
                return invalidCredentials();
            }
            if (!await bcrypt.compare(password, user.PasswordHash)) {
                await loginLimiter.recordPasswordFailure(c, rate);
                await c.commit();
                return invalidCredentials();
            }
            if (!loginLimiter.emailAllowed(rate)) {
                await c.commit();
                return res.status(429).json({
                    error: 'Too many verification-code requests. Please wait up to 15 minutes and try again.'
                });
            }

            verificationCode = crypto.randomInt(100000, 1000000).toString();
            tempToken = crypto.randomBytes(32).toString('hex');
            // Reserve an issuance before sending mail. Failed or uncertain
            // delivery does not refund the quota; challenge insert is atomic.
            await loginLimiter.reserveEmail(c, rate);
            await c.query(
                `INSERT INTO LoginVerificationT
                 (UserID, VerificationCode, TempToken, ExpiresAt, IsVerified, SecurityVersion, FailedAttempts)
                 VALUES (?, ?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), 0, ?, 0)`,
                [user.UserID, verificationCode, tempToken, version]
            );
            await c.commit();
        } catch (error) {
            try { await c.rollback(); } catch (_) {}
            throw error;
        } finally {
            c.release();
        }

        try {
            await sendVerificationCode({
                email: user.Email,
                verificationCode,
                username: user.UserName
            });
        } catch (emailError) {
            console.error('Login verification email delivery failed (details omitted)');
            return res.status(500).json({ error: 'Failed to send verification code. Email service error.(be)' });
        }

        return res.status(200).json({
            message: 'Verification code sent to your email.',
            tempToken,
            userId: user.UserID
        });
    } catch (error) {
        console.error('Login operation failed (details omitted)');
        return handleDbError(error, res, 'Error during login');
    }
});

router.post('/logout', auth, async (req,res)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  try { sessions.requireOrigin(req); } catch(e) { return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'}); }
  try { await sessions.revokeCurrent(pool,req.user);sessions.clearCookie(res,req);res.json({message:'Logged out successfully'}); }
  catch(e){handleDbError(e,res,'Error logging out');}
});

router.post('/refresh-session',async(req,res)=>{
  try { sessions.requireOrigin(req);const result=await sessions.rotate(pool,sessions.cookie(req));sessions.setCookie(res,req,result.refresh.secret,result.refresh.expires);res.set('Cache-Control','no-store');res.json({token:result.token}); }
  catch(e){
    // Preserve expected 4xx auth errors; never disclose unexpected 5xx details.
    const status=Number.isInteger(e&&e.status)&&e.status>=400&&e.status<=599?e.status:503;
    const publicError=status<500&&isExpectedClientError(e)&&e.message?e.message:'AUTH_SERVICE_UNAVAILABLE';
    res.status(status).json({error:publicError});
  }
});

router.get('/session-status', auth, async (req, res) => {
  if (req.user.client !== 'web') return res.status(403).json({ error: 'WEB_SESSION_REQUIRED' });
  res.set('Cache-Control', 'no-store');
  try {
    // Query the validated current session; never infer KMLI from browser storage.
    const [rows] = await pool.query(
      'SELECT IsRemembered FROM WebSessionT WHERE UserID=? AND SessionPublicID=? AND RevokedAt IS NULL LIMIT 1',
      [req.user.userId, req.user.sessionPublicId]
    );
    if (rows.length !== 1) return res.status(401).json({ error: 'SESSION_INVALID' });
    return res.json({
      authenticated: true,
      userId: req.user.userId,
      username: req.user.username,
      client: req.user.client,
      keepMeLoggedIn: Number(rows[0].IsRemembered) === 1
    });
  } catch (error) {
    return handleDbError(error, res, 'Error checking session status');
  }
});

router.post('/change-password',auth,async(req,res)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  try {sessions.requireOrigin(req);}catch(e){return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});}
  const {currentPassword,newPassword,confirmPassword}=req.body||{};
  if(typeof currentPassword!=='string'||typeof newPassword!=='string'||newPassword.length<8||newPassword!==confirmPassword)
    return res.status(400).json({error:'Current password and matching new password of at least eight characters required.'});
  const c=await pool.getConnection();
  try {
    await c.beginTransaction();
    await fence.lock(c,req.user.userId);
    const [users]=await c.query('SELECT PasswordHash FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[req.user.userId]);
    if(!users.length||!(await bcrypt.compare(currentPassword,users[0].PasswordHash))){await c.rollback();return res.status(401).json({error:'Incorrect current password.'});}
    if(await bcrypt.compare(newPassword,users[0].PasswordHash)){await c.rollback();return res.status(400).json({error:'New password must differ from current password.'});}
    const passwordHash=await bcrypt.hash(newPassword,10);
    await c.query('UPDATE UsersT SET PasswordHash=? WHERE UserID=?',[passwordHash,req.user.userId]);
    await sessions.revokeAll(c,req.user.userId);
    await c.commit();sessions.clearCookie(res,req);res.set('Cache-Control','no-store');
    try{const [info]=await pool.query('SELECT Email,UserName FROM UsersT WHERE UserID=?',[req.user.userId]);if(info.length)await sendPasswordChangedNotice({email:info[0].Email,username:info[0].UserName});}
    catch(mailErr){console.error('Password-change confirmation email failed (details omitted)');}
    res.json({message:'Password changed. Please log in again.'});
  } catch(e){try{await c.rollback();}catch(_){}handleDbError(e,res,'Error changing password');}
  finally{c.release();}
});


router.post('/verify-code', async (req, res) => {
    const { tempToken, verificationCode, keepMeLoggedIn = false } = req.body || {};
    if (typeof tempToken !== 'string' || typeof verificationCode !== 'string') {
        return res.status(400).json({ error: 'Verification required' });
    }
    let c;
    let issued;
    let user;
    try {
        const candidate = await loginVerification.findCandidate(pool, tempToken);
        if (!candidate) {
            return res.status(401).json({ error: loginVerification.INVALID_MESSAGE });
        }
        c = await pool.getConnection();
        await c.beginTransaction();
        const verification = await loginVerification.verifyLocked(c, candidate, tempToken, verificationCode);
        if (!verification.ok) {
            // Commit a normal denial so an incorrect attempt cannot be refunded.
            await c.commit();
            return res.status(401).json({ error: verification.message });
        }
        const [users] = await c.query(
            'SELECT UserID, UserName FROM UsersT WHERE UserID = ? LIMIT 1', [verification.userID]
        );
        if (!users.length) {
            await c.rollback();
            return res.status(401).json({ error: loginVerification.INVALID_MESSAGE });
        }
        user = users[0];
        issued = await sessions.create(c, user, keepMeLoggedIn === true);
        await c.commit();
    } catch (error) {
        if (c) {
            try { await c.rollback(); } catch (_) {}
        }
        return handleDbError(error, res, 'Error during code verification');
    } finally {
        if (c) c.release();
    }
    if (issued.refresh) sessions.setCookie(res, req, issued.refresh.secret, issued.refresh.expires);
    else sessions.clearCookie(res, req);
    res.set('Cache-Control', 'no-store');
    // Subscription work happens after security issuance; preserve previous redirect.
    try {
        const entitlement = await getOrCreateDevelopmentTrial(user.UserID);
        return res.json({
            message: 'Login successful',
            token: issued.token,
            redirectTo: entitlement.created || !entitlement.status.active ? 'subscription.html' : 'home.html',
            subscription: entitlement.status
        });
    } catch (error) {
        return handleDbError(error, res, 'Error reading subscription after login');
    }
});

// Stage 6A — shared MySQL 5.5-compatible limiter; no in-memory counters.
const resetLimiter = require('../services/passwordResetLimiter');
const {clientIpForReset} = require('../services/passwordResetClientIp');
function resetHash(v){return crypto.createHash('sha256').update(v,'utf8').digest('hex');}
const GENERIC_RESET_MESSAGE='If an account matches, password reset instructions will be sent.';
router.post('/forgot-password',async(req,res)=>{
  res.set('Cache-Control','no-store');
  try {sessions.requireOrigin(req);}catch(_){return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});}
  const email=String(req.body?.email||'').trim().toLowerCase();
  if(!email||email.length>254)return res.status(200).json({message:GENERIC_RESET_MESSAGE});
  const c=await pool.getConnection();let mail=null;
  try {
    await c.beginTransaction();
    // Count requests even for unknown email addresses; keys never store raw PII.
    // Keep counter increments committed even for blocked requests.
    const allowed=await resetLimiter.allow(c,email,clientIpForReset(req));
    if(!allowed){
      await c.commit();
      return res.status(200).json({message:GENERIC_RESET_MESSAGE});
    }
    const [candidate]=await c.query('SELECT UserID FROM UsersT WHERE Email=? LIMIT 1',[email]);
    let users=[], version=0;
    if(candidate.length){
      version=await fence.lock(c,candidate[0].UserID);
      [users]=await c.query('SELECT UserID,UserName,Email FROM UsersT WHERE UserID=? AND Email=? LIMIT 1 FOR UPDATE',[candidate[0].UserID,email]);
    }
    if(users.length){
      const user=users[0];const secret=crypto.randomBytes(48).toString('hex');
      await c.query('UPDATE PasswordResetT SET RevokedAt=UTC_TIMESTAMP() WHERE UserID=? AND UsedAt IS NULL AND RevokedAt IS NULL',[user.UserID]);
      await c.query('INSERT INTO PasswordResetT (UserID,TokenHash,CreatedAt,ExpiresAt,UsedAt,RevokedAt,SecurityVersion) VALUES (?,?,UTC_TIMESTAMP(),DATE_ADD(UTC_TIMESTAMP(),INTERVAL 30 MINUTE),NULL,NULL,?)',[user.UserID,resetHash(secret),version]);
      mail={email:user.Email,username:user.UserName,secret};
    }
    await c.commit();
  }catch(e){try{await c.rollback();}catch(_){}return handleDbError(e,res,'Error preparing password reset');}
  finally{c.release();}
  if(mail){
    try{
      const base=process.env.APP_PUBLIC_ORIGIN;
      if(!base||!/^https?:\/\//.test(base))throw new Error('APP_PUBLIC_ORIGIN not configured');
      const url=new URL('/forgotPassWord.html',base);url.searchParams.set('token',mail.secret);
      await sendPasswordResetLink({email:mail.email,username:mail.username,resetUrl:url.toString()});
    }catch(e){console.error('Password reset delivery failed (details omitted)');}
  }
  res.json({message:GENERIC_RESET_MESSAGE});
});

// Read-only status check for a link opened from the password-reset email.
// Never consumes a token, changes a password, or discloses account details.
router.post('/validate-reset-token',async(req,res)=>{
  res.set('Cache-Control','no-store');
  try{sessions.requireOrigin(req);}catch(_){return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});}
  const token=req.body?.token;
  if(typeof token!=='string'||!/^[0-9a-f]{96}$/.test(token))
    return res.status(401).json({valid:false});
  try{
    const [rows]=await pool.query(`SELECT p.PasswordResetID FROM PasswordResetT p JOIN UserSecurityT s ON s.UserID=p.UserID
      WHERE p.TokenHash=? AND p.UsedAt IS NULL AND p.RevokedAt IS NULL
      AND p.SecurityVersion>0 AND p.SecurityVersion=s.SecurityVersion
      AND p.ExpiresAt>UTC_TIMESTAMP() LIMIT 1`,[resetHash(token)]);
    if(!rows.length)return res.status(401).json({valid:false});
    return res.json({valid:true});
  }catch(e){return handleDbError(e,res,'Error validating password reset link');}
});

router.post('/reset-password',async(req,res)=>{
  res.set('Cache-Control','no-store');
  try {sessions.requireOrigin(req);}catch(_){return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});}
  const {token,newPassword,confirmPassword}=req.body||{};
  if(typeof token!=='string'||!/^[0-9a-f]{96}$/.test(token)||typeof newPassword!=='string'||newPassword.length<8||newPassword!==confirmPassword)
    return res.status(400).json({error:'Invalid reset link or password confirmation.'});
  const c=await pool.getConnection();let userEmail=null;
  try{
    await c.beginTransaction();
    const [candidate]=await c.query('SELECT UserID FROM PasswordResetT WHERE TokenHash=? LIMIT 1',[resetHash(token)]);
    if(!candidate.length){await c.rollback();return res.status(401).json({error:'RESET_EXPIRED_OR_USED'});}
    const current=await fence.lock(c,candidate[0].UserID);
    const [rows]=await c.query(`SELECT p.PasswordResetID,p.UserID,p.SecurityVersion,u.Email,u.UserName,u.PasswordHash
       FROM PasswordResetT p JOIN UsersT u ON u.UserID=p.UserID
       WHERE p.TokenHash=? AND p.UsedAt IS NULL AND p.RevokedAt IS NULL AND p.ExpiresAt>UTC_TIMESTAMP() LIMIT 1 FOR UPDATE`,[resetHash(token)]);
    if(!rows.length){await c.rollback();return res.status(401).json({error:'RESET_EXPIRED_OR_USED'});}
    const row=rows[0];
    if(row.UserID!==candidate[0].UserID||!fence.matches(row.SecurityVersion,current)){await c.rollback();return res.status(401).json({error:'RESET_EXPIRED_OR_USED'});}
    if(await bcrypt.compare(newPassword,row.PasswordHash)){await c.rollback();return res.status(400).json({error:'New password must differ from current password.'});}
    const passwordHash=await bcrypt.hash(newPassword,10);
    await c.query('UPDATE UsersT SET PasswordHash=? WHERE UserID=?',[passwordHash,row.UserID]);
    await c.query('UPDATE PasswordResetT SET UsedAt=UTC_TIMESTAMP() WHERE PasswordResetID=?',[row.PasswordResetID]);
    await c.query('UPDATE PasswordResetT SET RevokedAt=UTC_TIMESTAMP() WHERE UserID=? AND UsedAt IS NULL AND RevokedAt IS NULL',[row.UserID]);
    await sessions.revokeAll(c,row.UserID);
    await c.commit();userEmail={email:row.Email,username:row.UserName};
  }catch(e){try{await c.rollback();}catch(_){}return handleDbError(e,res,'Error resetting password');}
  finally{c.release();}
  sessions.clearCookie(res,req);
  try{await sendPasswordChangedNotice(userEmail);}catch(e){console.error('Password change notice failed (details omitted)');}
  res.json({message:'Password reset successful. Please log in again.'});
});

router.get('/is-admin',auth,async(req,res,next)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  try {
    const status=await require('../services/administratorAccess').getAdministratorStatus(req.user);
    if(!status.configuredUsername)return res.status(500).json({error:'Admin username not configured.'});
    res.json({isAdmin:status.isAdmin,username:status.username});
  } catch(e) { next(e); }
});

module.exports = router;
