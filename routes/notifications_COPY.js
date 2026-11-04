const express = require('express');
const crypto = require('crypto');
const { pool } = require('../dbConnection');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getPreferences,
    updatePreferences,
    getUnsubscribeInfo,
    unsubscribeByToken
} = require('../services/notificationService');

router.get('/preferences', auth, async (req, res) => {
    try {
        const preferences = await getPreferences(req.user.userId);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/preferences', auth, async (req, res) => {
    try {
        const allowed = ['marketingEmail', 'marketingSMS', 'familyTreeEmail', 'appNoticeEmail'];
        const updates = {};

        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
                if (typeof req.body[key] !== 'boolean') {
                    return res.status(400).json({ message: `${key} must be true or false.` });
                }
                updates[key] = req.body[key];
            }
        }

        const preferences = await updatePreferences(req.user.userId, updates);
        res.json({ message: 'Notification preferences saved.', preferences });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Public endpoint used by unsubscribe.html. No login is required.
router.get('/unsubscribe/:token', async (req, res) => {
    try {
        const info = await getUnsubscribeInfo(req.params.token);
        if (!info) {
            return res.status(404).json({ message: 'This unsubscribe link is not valid.' });
        }

        const email = String(info.RecipientEmail || '');
        const at = email.indexOf('@');
        const maskedEmail = at > 0
            ? `${email.slice(0, 1)}***${email.slice(at)}`
            : email;

        res.json({
            category: info.NotificationCategory,
            channel: info.Channel,
            destination: info.Channel === 'EMAIL' ? maskedEmail : 'your phone number'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public endpoint used by unsubscribe.html. No login is required.
router.post('/unsubscribe/:token', async (req, res) => {
    try {
        const result = await unsubscribeByToken(req.params.token);
        res.json({
            message: 'Notifications have been stopped for this category.',
            ...result
        });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});



function verificationTokenHash(token) {
    return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

// Public Family Network verification. No WA login is required.
router.get('/network-verification/:token', async (req, res) => {
    try {
        const tokenHash = verificationTokenHash(req.params.token);
        const [rows] = await pool.query(
            `SELECT v.NetworkVerificationID,v.PersonID,v.FamilyTreeID,v.EmailAddress,v.ExpiresAt,v.RespondedAt,v.Response,
                    p.FirstName,p.MiddleName,p.LastName,p.SuffixName,ft.FamilyTreeCode
             FROM FTNetworkVerificationT v
             JOIN FTPersonT p ON p.PersonID=v.PersonID
             JOIN FamilyTreeT ft ON ft.FamilyTreeID=v.FamilyTreeID
             WHERE v.TokenHash=? LIMIT 1`,
            [tokenHash]
        );
        if (!rows.length) return res.status(404).json({ message: 'This Family Network verification link is not valid.' });
        const row = rows[0];
        if (!row.RespondedAt && new Date(row.ExpiresAt).getTime() < Date.now()) return res.status(410).json({ message: 'This Family Network verification link has expired.' });
        res.json({
            personName: [row.FirstName,row.MiddleName,row.LastName,row.SuffixName].filter(Boolean).join(' '),
            familyTreeCode: row.FamilyTreeCode,
            responded: !!row.RespondedAt,
            response: row.Response || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/network-verification/:token', async (req, res) => {
    const response = String((req.body || {}).response || '').toUpperCase();
    if (!['APPROVED','DECLINED'].includes(response)) return res.status(400).json({ message: 'Response must be APPROVED or DECLINED.' });
    const c = await pool.getConnection();
    try {
        await c.beginTransaction();
        const tokenHash = verificationTokenHash(req.params.token);
        const [rows] = await c.query(`SELECT * FROM FTNetworkVerificationT WHERE TokenHash=? LIMIT 1 FOR UPDATE`, [tokenHash]);
        if (!rows.length) { const e=new Error('This Family Network verification link is not valid.'); e.status=404; throw e; }
        const row=rows[0];
        if (row.RespondedAt) { await c.rollback(); return res.json({ message: row.Response==='APPROVED'?'This Family Network request was already approved.':'This Family Network request was already declined.' }); }
        if (new Date(row.ExpiresAt).getTime() < Date.now()) { const e=new Error('This Family Network verification link has expired.'); e.status=410; throw e; }
        const [emailRows] = await c.query(`SELECT ContactID FROM FTContactT WHERE PersonID=? AND LOWER(TRIM(ContactType))='email' AND LOWER(TRIM(ContactValue))=LOWER(TRIM(?)) LIMIT 1`, [row.PersonID,row.EmailAddress]);
        if (!emailRows.length) { const e=new Error('The Person email address has changed. A new Family Network verification is required.'); e.status=409; throw e; }
        if (response==='APPROVED') {
            const [profileRows]=await c.query('SELECT IncludeInSearch FROM FTNetworkT WHERE PersonID=? LIMIT 1',[row.PersonID]);
            if (!profileRows.length || Number(profileRows[0].IncludeInSearch)!==1) { const e=new Error('This Person is no longer marked for Family Network Search.'); e.status=409; throw e; }
            await c.query(`UPDATE FTNetworkT SET VerificationStatus='VERIFIED',VerifiedEmail=?,VerifiedAt=NOW(),DeclinedAt=NULL,UpdatedAt=NOW() WHERE PersonID=?`,[row.EmailAddress,row.PersonID]);
        } else {
            await c.query(`UPDATE FTNetworkT SET IncludeInSearch=0,VerificationStatus='DECLINED',VerifiedEmail=NULL,VerifiedAt=NULL,DeclinedAt=NOW(),UpdatedAt=NOW() WHERE PersonID=?`,[row.PersonID]);
        }
        await c.query(`UPDATE FTNetworkVerificationT SET RespondedAt=NOW(),Response=? WHERE NetworkVerificationID=?`,[response,row.NetworkVerificationID]);
        await c.commit();
        res.json({ message: response==='APPROVED'?'Family Network participation has been approved.':'Family Network participation has been declined.' });
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        res.status(error.status || 500).json({ message: error.message });
    } finally { c.release(); }
});


module.exports = router;
