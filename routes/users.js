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

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [results] = await pool.query('SELECT * FROM UsersT WHERE UserName = ?', [username]);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.PasswordHash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Credentials are valid - generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const tempToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store verification code in database
        await pool.query(
            'INSERT INTO LoginVerificationT SET UserID = ?, VerificationCode = ?, TempToken = ?, ExpiresAt = ?, IsVerified = 0',
            [user.UserID, verificationCode, tempToken, expiresAt]
        );

        // Send verification code via email
        try {
            await sendVerificationCode({
                email: user.Email,
                verificationCode: verificationCode,
                username: user.UserName
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            return res.status(500).json({ error: 'Failed to send verification code. Email service error.(be)' });
        }

        // Return temporary token instead of final JWT
        res.status(200).json({
            message: 'Verification code sent to your email.',
            tempToken: tempToken,
            userId: user.UserID
        });
    } catch (error) {
        console.error('Login error:', error.message);
        handleDbError(error, res, 'Error during login');
    }
});

router.post('/logout', auth, async (req,res)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  try { await sessions.revokeCurrent(pool,req.user);sessions.clearCookie(res,req);res.json({message:'Logged out successfully'}); }
  catch(e){handleDbError(e,res,'Error logging out');}
});

router.post('/refresh-session',async(req,res)=>{
  try { sessions.requireOrigin(req);const result=await sessions.rotate(pool,sessions.cookie(req));sessions.setCookie(res,req,result.refresh.secret,result.refresh.expires);res.set('Cache-Control','no-store');res.json({token:result.token}); }
  catch(e){res.status(e.status||503).json({error:e.status?e.message:'AUTH_SERVICE_UNAVAILABLE'});}
});

router.get('/session-status',auth,(req,res)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});res.set('Cache-Control','no-store');res.json({authenticated:true,userId:req.user.userId,username:req.user.username,client:req.user.client});});

router.post('/change-password',auth,async(req,res)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  try {sessions.requireOrigin(req);}catch(e){return res.status(403).json({error:'ORIGIN_NOT_ALLOWED'});}
  const {currentPassword,newPassword,confirmPassword}=req.body||{};
  if(typeof currentPassword!=='string'||typeof newPassword!=='string'||newPassword.length<8||newPassword!==confirmPassword)
    return res.status(400).json({error:'Current password and matching new password of at least eight characters required.'});
  const c=await pool.getConnection();
  try {
    await c.beginTransaction();
    const [users]=await c.query('SELECT PasswordHash FROM UsersT WHERE UserID=? LIMIT 1 FOR UPDATE',[req.user.userId]);
    if(!users.length||!(await bcrypt.compare(currentPassword,users[0].PasswordHash))){await c.rollback();return res.status(401).json({error:'Incorrect current password.'});}
    if(await bcrypt.compare(newPassword,users[0].PasswordHash)){await c.rollback();return res.status(400).json({error:'New password must differ from current password.'});}
    const passwordHash=await bcrypt.hash(newPassword,10);
    await c.query('UPDATE UsersT SET PasswordHash=? WHERE UserID=?',[passwordHash,req.user.userId]);
    await sessions.revokeAll(c,req.user.userId);
    await c.commit();sessions.clearCookie(res,req);res.set('Cache-Control','no-store');
    try{const [info]=await pool.query('SELECT Email,UserName FROM UsersT WHERE UserID=?',[req.user.userId]);if(info.length)await sendPasswordChangedNotice({email:info[0].Email,username:info[0].UserName});}
    catch(mailErr){console.error('Password-change confirmation email failed:',mailErr.message);}
    res.json({message:'Password changed. Please log in again.'});
  } catch(e){try{await c.rollback();}catch(_){}handleDbError(e,res,'Error changing password');}
  finally{c.release();}
});


router.post('/verify-code', async (req, res) => {
    const { tempToken, verificationCode, keepMeLoggedIn = false } = req.body;

    if (!tempToken || !verificationCode) {
        return res.status(400).json({ error: 'Temporary token and verification code are required.(be)' });
    }

    try {
        // Find the verification record
        const [verifications] = await pool.query(
            'SELECT * FROM LoginVerificationT WHERE TempToken = ? AND IsVerified = 0 ORDER BY VerificationID DESC LIMIT 1',
            [tempToken]
        );

        if (verifications.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired verification request.(be)' });
        }

        const verification = verifications[0];

        // Check if code has expired
        const now = new Date();
        if (now > new Date(verification.ExpiresAt)) {
            return res.status(401).json({ error: 'Verification code has expired. Please log in again.(be)' });
        }

        // Check if code matches
        if (String(verificationCode) !== String(verification.VerificationCode)) {
            return res.status(401).json({ error: 'Invalid verification code.(be)' });
        }

        // Preserve subscription entitlements and original redirect behavior.
        const [users] = await pool.query('SELECT UserID, UserName FROM UsersT WHERE UserID = ?', [verification.UserID]);
        if (users.length === 0) return res.status(401).json({ error: 'User not found.(be)' });
        const user=users[0];
        const entitlement = await getOrCreateDevelopmentTrial(user.UserID);

        // Single transaction: consume the email code and create session together.
        const conn=await pool.getConnection();let issued;
        try {
          await conn.beginTransaction();
          const [used]=await conn.query(
            'UPDATE LoginVerificationT SET IsVerified=1 WHERE VerificationID=? AND IsVerified=0 AND ExpiresAt>UTC_TIMESTAMP() AND VerificationCode=?',
            [verification.VerificationID,String(verificationCode)]
          );
          if(used.affectedRows!==1){const e=Error('VERIFICATION_ALREADY_USED_OR_EXPIRED');e.status=401;throw e;}
          issued=await sessions.create(conn,user,keepMeLoggedIn===true);
          await conn.commit();
        }catch(e){try{await conn.rollback();}catch(_){}if(e.status)return res.status(e.status).json({error:e.message});throw e;}
        finally{conn.release();}
        const token=issued.token;
        if(issued.refresh){sessions.setCookie(res,req,issued.refresh.secret,issued.refresh.expires);}
        else sessions.clearCookie(res,req);
        res.set('Cache-Control','no-store');

        // First-time users see the subscription page so the development entitlement
        // is explained. Expired users also go there so they can enter a promo code.
        const redirectTo = entitlement.created || !entitlement.status.active
            ? 'subscription.html'
            : 'home.html';

        res.status(200).json({
            message: 'Login successful',
            token,
            redirectTo,
            subscription: entitlement.status
        });
    } catch (error) {
        handleDbError(error, res, 'Error during code verification');
    }
});


// Stage 6A — shared MySQL 5.5-compatible limiter; no in-memory counters.
const resetLimiter = require('../services/passwordResetLimiter');
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
    const allowed=await resetLimiter.allow(c,email,req.ip||req.socket?.remoteAddress||'unknown');
    if(!allowed){
      await c.commit();
      return res.status(200).json({message:GENERIC_RESET_MESSAGE});
    }
    const [users]=await c.query('SELECT UserID,UserName,Email FROM UsersT WHERE Email=? LIMIT 1 FOR UPDATE',[email]);
    if(users.length){
      const user=users[0];const secret=crypto.randomBytes(48).toString('hex');
      await c.query('UPDATE PasswordResetT SET RevokedAt=UTC_TIMESTAMP() WHERE UserID=? AND UsedAt IS NULL AND RevokedAt IS NULL',[user.UserID]);
      await c.query('INSERT INTO PasswordResetT (UserID,TokenHash,CreatedAt,ExpiresAt,UsedAt,RevokedAt) VALUES (?,?,UTC_TIMESTAMP(),DATE_ADD(UTC_TIMESTAMP(),INTERVAL 30 MINUTE),NULL,NULL)',[user.UserID,resetHash(secret)]);
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
    }catch(e){console.error('Password reset delivery failed:',e.message);}
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
    const [rows]=await pool.query(`SELECT PasswordResetID FROM PasswordResetT
      WHERE TokenHash=? AND UsedAt IS NULL AND RevokedAt IS NULL
      AND ExpiresAt>UTC_TIMESTAMP() LIMIT 1`,[resetHash(token)]);
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
    const [rows]=await c.query(`SELECT p.PasswordResetID,p.UserID,u.Email,u.UserName,u.PasswordHash
       FROM PasswordResetT p JOIN UsersT u ON u.UserID=p.UserID
       WHERE p.TokenHash=? AND p.UsedAt IS NULL AND p.RevokedAt IS NULL AND p.ExpiresAt>UTC_TIMESTAMP() LIMIT 1 FOR UPDATE`,[resetHash(token)]);
    if(!rows.length){await c.rollback();return res.status(401).json({error:'RESET_EXPIRED_OR_USED'});}
    const row=rows[0];
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
  try{await sendPasswordChangedNotice(userEmail);}catch(e){console.error('Password change notice failed:',e.message);}
  res.json({message:'Password reset successful. Please log in again.'});
});

router.get('/is-admin',auth,(req,res)=>{
  if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  const adminUsername=process.env.ADMIN_USERNAME;
  if(!adminUsername)return res.status(500).json({error:'Admin username not configured.'});
  res.json({isAdmin:req.user.username===adminUsername,username:req.user.username});
});

module.exports = router;
