// File: routes/tnna.js
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');
const { handleDbError } = require('../utils');
const { sendNotificationEmail } = require('../send_email');
const { getActiveConsentVersion, logConsent } = require('../services/notificationService');

require('dotenv').config();

const ACCESS_TOKEN_TTL = '8h';
const REFRESH_TOKEN_DAYS = 180;

function hashToken(token) {
    return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function newRefreshToken() {
    return crypto.randomBytes(48).toString('hex');
}

function refreshExpiry() {
    return new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
}

function createAccessToken(user) {
    return jwt.sign(
        { userId: user.UserID, username: user.UserName, client: 'tnna' },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_TTL }
    );
}

async function getCurrentVersion(connection = pool) {
    const [rows] = await connection.query(
        `SELECT VersionCode, VersionName, MinimumSupportedVersionCode,
                DownloadUrl, ReleaseNotes, ReleasedAt
           FROM TNNAVersionT
          WHERE IsCurrent = 1
          ORDER BY VersionCode DESC
          LIMIT 1`
    );

    if (!rows.length) {
        throw new Error('TNNA current version is not configured.');
    }

    return rows[0];
}

async function upsertTnnaUser(connection, userID, updateEmailOptIn) {
    const preferenceValue = updateEmailOptIn === true ? 1 : 0;

    await connection.query(
        `INSERT INTO TNNAUserT
             (UserID, UpdateEmailOptIn, FirstRegisteredAt, LastSeenAt)
         VALUES (?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
             UpdateEmailOptIn = VALUES(UpdateEmailOptIn),
             LastSeenAt = NOW()`,
        [userID, preferenceValue]
    );
}

async function touchTnnaUser(connection, userID) {
    await connection.query(
        'UPDATE TNNAUserT SET LastSeenAt = NOW() WHERE UserID = ?',
        [userID]
    );
}

async function upsertDevice(connection, { deviceId, userID, platform, appVersion, versionCode }) {
    if (!deviceId) return;

    await connection.query(
        `INSERT INTO TNNADeviceT
             (DeviceID, UserID, Platform, AppVersion, VersionCode, FirstSeenAt, LastSeenAt)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
             UserID = VALUES(UserID),
             Platform = VALUES(Platform),
             AppVersion = VALUES(AppVersion),
             VersionCode = VALUES(VersionCode),
             LastSeenAt = NOW()`,
        [
            String(deviceId).slice(0, 64),
            userID,
            String(platform || 'Android').slice(0, 20),
            String(appVersion || '').slice(0, 30) || null,
            Number.isInteger(Number(versionCode)) ? Number(versionCode) : null
        ]
    );
}

async function issueRefreshToken(connection, userID, deviceId) {
    const refreshToken = newRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const expiresAt = refreshExpiry();

    await connection.query(
        `INSERT INTO TNNARefreshTokenT
             (UserID, DeviceID, TokenHash, ExpiresAt, CreatedAt, LastUsedAt, RevokedAt)
         VALUES (?, ?, ?, ?, NOW(), NOW(), NULL)`,
        [userID, String(deviceId || '').slice(0, 64) || null, tokenHash, expiresAt]
    );

    return refreshToken;
}

router.get('/version', async (req, res) => {
    try {
        const version = await getCurrentVersion();
        res.json({
            versionCode: version.VersionCode,
            versionName: version.VersionName,
            minimumSupportedVersionCode: version.MinimumSupportedVersionCode,
            downloadUrl: version.DownloadUrl,
            releaseNotes: version.ReleaseNotes || '',
            releasedAt: version.ReleasedAt
        });
    } catch (error) {
        handleDbError(error, res, 'Error reading TNNA version');
    }
});

// TNNA uses the existing /users/login endpoint for user-name/password validation
// and email verification-code delivery. This endpoint completes the verification
// specifically for the native app and issues the persistent refresh credential.
router.post('/verify-code', async (req, res) => {
    const {
        tempToken,
        verificationCode,
        deviceId,
        platform = 'Android',
        appVersion,
        versionCode,
        updateEmailOptIn = false
    } = req.body;

    if (!tempToken || !verificationCode || !deviceId) {
        return res.status(400).json({
            error: 'Temporary token, verification code, and device ID are required.(be)'
        });
    }

    const c = await pool.getConnection();
    try {
        await c.beginTransaction();

        const [verifications] = await c.query(
            `SELECT VerificationID, UserID, VerificationCode, ExpiresAt
               FROM LoginVerificationT
              WHERE TempToken = ? AND IsVerified = 0
              ORDER BY VerificationID DESC
              LIMIT 1
              FOR UPDATE`,
            [tempToken]
        );

        if (!verifications.length) {
            await c.rollback();
            return res.status(401).json({ error: 'Invalid or expired verification request.(be)' });
        }

        const verification = verifications[0];
        if (new Date() > new Date(verification.ExpiresAt)) {
            await c.rollback();
            return res.status(401).json({ error: 'Verification code has expired. Please log in again.(be)' });
        }

        if (String(verificationCode) !== String(verification.VerificationCode)) {
            await c.rollback();
            return res.status(401).json({ error: 'Invalid verification code.(be)' });
        }

        await c.query(
            'UPDATE LoginVerificationT SET IsVerified = 1 WHERE VerificationID = ?',
            [verification.VerificationID]
        );

        const [users] = await c.query(
            'SELECT UserID, UserName, Email FROM UsersT WHERE UserID = ? LIMIT 1',
            [verification.UserID]
        );
        if (!users.length) {
            await c.rollback();
            return res.status(401).json({ error: 'User not found.(be)' });
        }

        const user = users[0];
        await upsertTnnaUser(c, user.UserID, updateEmailOptIn === true);
        const updateConsentVersionID = await getActiveConsentVersion(c, 'TNNA_UPDATE_EMAIL');
        await logConsent(c, {
            userID: user.UserID,
            email: user.Email,
            phone: null,
            category: 'TNNA_UPDATE',
            channel: 'EMAIL',
            action: updateEmailOptIn === true ? 'OPT_IN' : 'OPT_OUT',
            consentTextVersionID: updateConsentVersionID,
            source: 'TNNA_LOGIN'
        });
        await upsertDevice(c, {
            deviceId,
            userID: user.UserID,
            platform,
            appVersion,
            versionCode
        });

        const refreshToken = await issueRefreshToken(c, user.UserID, deviceId);
        const accessToken = createAccessToken(user);
        await c.commit();

        const version = await getCurrentVersion();
        res.json({
            message: 'TNNA login successful',
            accessToken,
            refreshToken,
            user: {
                userId: user.UserID,
                username: user.UserName,
                email: user.Email,
                updateEmailOptIn: updateEmailOptIn === true
            },
            currentVersion: {
                versionCode: version.VersionCode,
                versionName: version.VersionName,
                downloadUrl: version.DownloadUrl
            }
        });
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        handleDbError(error, res, 'Error verifying TNNA login');
    } finally {
        c.release();
    }
});

router.post('/refresh', async (req, res) => {
    const {
        refreshToken,
        deviceId,
        platform = 'Android',
        appVersion,
        versionCode
    } = req.body;

    if (!refreshToken || !deviceId) {
        return res.status(400).json({ error: 'Refresh token and device ID are required.(be)' });
    }

    const c = await pool.getConnection();
    try {
        await c.beginTransaction();

        const tokenHash = hashToken(refreshToken);
        const [tokens] = await c.query(
            `SELECT r.RefreshTokenID, r.UserID, r.DeviceID, r.ExpiresAt,
                    u.UserName, u.Email, t.UpdateEmailOptIn
               FROM TNNARefreshTokenT r
               JOIN UsersT u ON u.UserID = r.UserID
               JOIN TNNAUserT t ON t.UserID = r.UserID
              WHERE r.TokenHash = ?
                AND r.RevokedAt IS NULL
                AND r.ExpiresAt > NOW()
              LIMIT 1
              FOR UPDATE`,
            [tokenHash]
        );

        if (!tokens.length) {
            await c.rollback();
            return res.status(401).json({ error: 'TNNA login has expired. Please log in again.(be)' });
        }

        const row = tokens[0];
        if (row.DeviceID && row.DeviceID !== String(deviceId).slice(0, 64)) {
            await c.rollback();
            return res.status(401).json({ error: 'TNNA login is not valid for this device.(be)' });
        }

        // Rotate the refresh token every time it is successfully used.
        await c.query(
            'UPDATE TNNARefreshTokenT SET RevokedAt = NOW(), LastUsedAt = NOW() WHERE RefreshTokenID = ?',
            [row.RefreshTokenID]
        );

        await touchTnnaUser(c, row.UserID);
        await upsertDevice(c, {
            deviceId,
            userID: row.UserID,
            platform,
            appVersion,
            versionCode
        });

        const rotatedRefreshToken = await issueRefreshToken(c, row.UserID, deviceId);
        const accessToken = createAccessToken({ UserID: row.UserID, UserName: row.UserName });
        await c.commit();

        res.json({
            accessToken,
            refreshToken: rotatedRefreshToken,
            user: {
                userId: row.UserID,
                username: row.UserName,
                email: row.Email,
                updateEmailOptIn: Boolean(row.UpdateEmailOptIn)
            }
        });
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        handleDbError(error, res, 'Error refreshing TNNA login');
    } finally {
        c.release();
    }
});

router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(200).json({ message: 'Logged out' });
    }

    try {
        await pool.query(
            'UPDATE TNNARefreshTokenT SET RevokedAt = NOW() WHERE TokenHash = ? AND RevokedAt IS NULL',
            [hashToken(refreshToken)]
        );
        res.status(200).json({ message: 'Logged out' });
    } catch (error) {
        handleDbError(error, res, 'Error logging out of TNNA');
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.UserID, u.UserName, u.Email, t.UpdateEmailOptIn, t.FirstRegisteredAt, t.LastSeenAt
               FROM UsersT u
               JOIN TNNAUserT t ON t.UserID = u.UserID
              WHERE u.UserID = ?
              LIMIT 1`,
            [req.user.userId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'TNNA account record not found.' });
        }

        const row = rows[0];
        res.json({
            userId: row.UserID,
            username: row.UserName,
            email: row.Email,
            updateEmailOptIn: Boolean(row.UpdateEmailOptIn),
            firstRegisteredAt: row.FirstRegisteredAt,
            lastSeenAt: row.LastSeenAt
        });
    } catch (error) {
        handleDbError(error, res, 'Error reading TNNA account');
    }
});

router.put('/update-email-preference', auth, async (req, res) => {
    if (typeof req.body.updateEmailOptIn !== 'boolean') {
        return res.status(400).json({ error: 'updateEmailOptIn must be true or false.(be)' });
    }

    const c = await pool.getConnection();
    try {
        await c.beginTransaction();
        const [rows] = await c.query(
            `SELECT t.UpdateEmailOptIn, u.Email
               FROM TNNAUserT t
               JOIN UsersT u ON u.UserID = t.UserID
              WHERE t.UserID = ?
              LIMIT 1
              FOR UPDATE`,
            [req.user.userId]
        );
        if (!rows.length) {
            await c.rollback();
            return res.status(404).json({ error: 'TNNA account record not found.' });
        }

        const nextValue = req.body.updateEmailOptIn ? 1 : 0;
        await c.query(
            'UPDATE TNNAUserT SET UpdateEmailOptIn = ?, LastSeenAt = NOW() WHERE UserID = ?',
            [nextValue, req.user.userId]
        );

        if (Number(rows[0].UpdateEmailOptIn) !== nextValue) {
            const updateConsentVersionID = await getActiveConsentVersion(c, 'TNNA_UPDATE_EMAIL');
            await logConsent(c, {
                userID: req.user.userId,
                email: rows[0].Email,
                phone: null,
                category: 'TNNA_UPDATE',
                channel: 'EMAIL',
                action: nextValue ? 'OPT_IN' : 'OPT_OUT',
                consentTextVersionID: updateConsentVersionID,
                source: 'TNNA_PREFERENCES'
            });
        }

        await c.commit();
        res.json({ updateEmailOptIn: Boolean(nextValue) });
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        handleDbError(error, res, 'Error updating TNNA email preference');
    } finally {
        c.release();
    }
});

async function requireAdmin(req, res, next) {
    try {
        const [rows] = await pool.query(
            'SELECT UserName FROM UsersT WHERE UserID = ? LIMIT 1',
            [req.user.userId]
        );
        if (!rows.length || rows[0].UserName !== process.env.ADMIN_USERNAME) {
            return res.status(403).json({ error: 'Administrator access required.' });
        }
        next();
    } catch (error) {
        handleDbError(error, res, 'Error checking administrator access');
    }
}

router.get('/admin/users', auth, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.UserID, u.UserName, u.Email,
                    t.UpdateEmailOptIn, t.FirstRegisteredAt, t.LastSeenAt,
                    COUNT(d.DeviceID) AS DeviceCount,
                    MAX(d.VersionCode) AS HighestVersionCode,
                    MAX(d.AppVersion) AS HighestAppVersion,
                    MAX(d.LastSeenAt) AS LastDeviceSeenAt
               FROM TNNAUserT t
               JOIN UsersT u ON u.UserID = t.UserID
               LEFT JOIN TNNADeviceT d ON d.UserID = t.UserID
              GROUP BY u.UserID, u.UserName, u.Email,
                       t.UpdateEmailOptIn, t.FirstRegisteredAt, t.LastSeenAt
              ORDER BY t.LastSeenAt DESC, u.UserName ASC`
        );
        res.json(rows);
    } catch (error) {
        handleDbError(error, res, 'Error listing TNNA users');
    }
});

router.post('/admin/send-update', auth, requireAdmin, async (req, res) => {
    try {
        const version = await getCurrentVersion();
        const [users] = await pool.query(
            `SELECT u.Email
               FROM TNNAUserT t
               JOIN UsersT u ON u.UserID = t.UserID
              WHERE t.UpdateEmailOptIn = 1
              ORDER BY u.UserID`
        );

        const subject = req.body.subject || `Town Notification ${version.VersionName} update available`;
        const message = req.body.message ||
            `A new Town Notification version (${version.VersionName}) is available. ` +
            `Open the Town Notification download page to install the update.`;

        let sent = 0;
        const failed = [];
        for (const user of users) {
            try {
                await sendNotificationEmail({
                    email: user.Email,
                    subject,
                    message,
                    category: 'APP_NOTICE',
                    actionButtons: [{
                        label: 'Download Town Notification Update',
                        url: version.DownloadUrl,
                        kind: 'approve'
                    }]
                });
                sent += 1;
            } catch (error) {
                failed.push({ email: user.Email, error: error.message });
            }
        }

        res.json({ eligible: users.length, sent, failed });
    } catch (error) {
        handleDbError(error, res, 'Error sending TNNA update email');
    }
});

module.exports = router;
