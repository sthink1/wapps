const crypto = require('crypto');
const { pool } = require('../dbConnection');
const { sendNotificationEmail } = require('../send_email');

const OPTIONAL_CATEGORIES = new Set(['MARKETING', 'APP_NOTICE', 'FAMILY_TREE']);
const REQUIRED_CATEGORIES = new Set(['ACCOUNT', 'SUBSCRIPTION']);
const VALID_CATEGORIES = new Set([...OPTIONAL_CATEGORIES, ...REQUIRED_CATEGORIES]);
const VALID_CHANNELS = new Set(['EMAIL', 'SMS']);

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizePhone(value) {
    return String(value || '').replace(/[^\d+]/g, '');
}

function makeDestinationKey(destinationType, destinationValue) {
    return crypto
        .createHash('sha1')
        .update(`${destinationType}:${String(destinationValue || '').toLowerCase()}`)
        .digest('hex');
}

function publicBaseUrl() {
    return String(
        process.env.PUBLIC_BASE_URL ||
        process.env.APP_BASE_URL ||
        'http://localhost:8080'
    ).replace(/\/$/, '');
}

async function getUserByEmail(c, email) {
    if (!email) return null;
    const [rows] = await c.query(
        `SELECT UserID, UserName, Email, Phone1
         FROM UsersT
         WHERE LOWER(Email)=LOWER(?)
         LIMIT 1`,
        [email]
    );
    return rows[0] || null;
}

async function getUserByID(c, userID) {
    if (!userID) return null;
    const [rows] = await c.query(
        `SELECT UserID, UserName, Email, Phone1
         FROM UsersT
         WHERE UserID=?
         LIMIT 1`,
        [userID]
    );
    return rows[0] || null;
}

async function ensurePreferences(c, userID) {
    await c.query(
        `INSERT INTO NotificationPreferencesT
         (UserID, MarketingEmail, MarketingSMS, FamilyTreeEmail, AppNoticeEmail, CreatedAt, UpdatedAt)
         SELECT ?,0,0,1,1,NOW(),NULL
         FROM DUAL
         WHERE NOT EXISTS (
            SELECT 1 FROM NotificationPreferencesT WHERE UserID=?
         )`,
        [userID, userID]
    );

    const [rows] = await c.query(
        `SELECT * FROM NotificationPreferencesT WHERE UserID=? LIMIT 1`,
        [userID]
    );
    return rows[0];
}

async function isSuppressed(c, destinationType, destinationValue, category, channel) {
    const destinationKey = makeDestinationKey(destinationType, destinationValue);
    const [rows] = await c.query(
        `SELECT NotificationSuppressionID
         FROM NotificationSuppressionT
         WHERE DestinationKey=?
           AND NotificationCategory=?
           AND Channel=?
           AND IsActive=1
         LIMIT 1`,
        [destinationKey, category, channel]
    );
    return rows.length > 0;
}

function preferenceAllows(preferences, category, channel) {
    if (REQUIRED_CATEGORIES.has(category)) return true;
    if (!preferences) return category !== 'MARKETING';

    if (category === 'MARKETING' && channel === 'EMAIL') {
        return Number(preferences.MarketingEmail) === 1;
    }
    if (category === 'MARKETING' && channel === 'SMS') {
        return Number(preferences.MarketingSMS) === 1;
    }
    if (category === 'FAMILY_TREE' && channel === 'EMAIL') {
        return Number(preferences.FamilyTreeEmail) === 1;
    }
    if (category === 'APP_NOTICE' && channel === 'EMAIL') {
        return Number(preferences.AppNoticeEmail) === 1;
    }
    return true;
}

async function insertHistory(c, data) {
    const [result] = await c.query(
        `INSERT INTO NotificationHistoryT
         (
            UserID, RecipientEmail, RecipientPhone, NotificationCategory,
            Channel, Subject, TemplateName, RelatedApp, RelatedRecordID,
            NotificationText, Status, UnsubscribeToken, CreatedAt,
            SentAt, FailureReason
         )
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NULL,?)`,
        [
            data.userID || null,
            data.recipientEmail || null,
            data.recipientPhone || null,
            data.category,
            data.channel,
            data.subject || null,
            data.templateName || null,
            data.relatedApp || null,
            data.relatedRecordID || null,
            data.message || null,
            data.status,
            data.unsubscribeToken || null,
            data.failureReason || null
        ]
    );
    return result.insertId;
}

async function sendNotification({
    userID = null,
    recipientEmail = null,
    recipientPhone = null,
    category,
    channel = 'EMAIL',
    subject = null,
    message,
    templateName = null,
    relatedApp = null,
    relatedRecordID = null,
    explainFamilyTreeRecipient = false
}) {
    category = String(category || '').toUpperCase();
    channel = String(channel || '').toUpperCase();

    if (!VALID_CATEGORIES.has(category)) {
        throw new Error(`Unsupported notification category: ${category}`);
    }
    if (!VALID_CHANNELS.has(channel)) {
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
    if (!message) {
        throw new Error('Notification message is required.');
    }

    const c = await pool.getConnection();
    let historyID = null;

    try {
        let user = userID ? await getUserByID(c, userID) : null;
        let email = normalizeEmail(recipientEmail || (user && user.Email));
        let phone = normalizePhone(recipientPhone || (user && user.Phone1));

        if (!user && email) {
            user = await getUserByEmail(c, email);
            if (user) userID = user.UserID;
        }

        if (channel === 'EMAIL' && !email) {
            historyID = await insertHistory(c, {
                userID, recipientEmail: null, recipientPhone: phone || null,
                category, channel, subject, templateName, relatedApp,
                relatedRecordID, message, status: 'NO_ADDRESS',
                failureReason: 'No email address was available.'
            });
            return { status: 'NO_ADDRESS', historyID };
        }

        if (channel === 'SMS' && !phone) {
            historyID = await insertHistory(c, {
                userID, recipientEmail: email || null, recipientPhone: null,
                category, channel, subject, templateName, relatedApp,
                relatedRecordID, message, status: 'NO_ADDRESS',
                failureReason: 'No phone number was available.'
            });
            return { status: 'NO_ADDRESS', historyID };
        }

        const destinationType = channel === 'EMAIL' ? 'EMAIL' : 'PHONE';
        const destinationValue = channel === 'EMAIL' ? email : phone;

        if (OPTIONAL_CATEGORIES.has(category)) {
            if (await isSuppressed(c, destinationType, destinationValue, category, channel)) {
                historyID = await insertHistory(c, {
                    userID, recipientEmail: email || null, recipientPhone: phone || null,
                    category, channel, subject, templateName, relatedApp,
                    relatedRecordID, message, status: 'SUPPRESSED',
                    failureReason: 'Recipient previously stopped this notification category.'
                });
                return { status: 'SUPPRESSED', historyID };
            }

            if (userID) {
                const preferences = await ensurePreferences(c, userID);
                if (!preferenceAllows(preferences, category, channel)) {
                    historyID = await insertHistory(c, {
                        userID, recipientEmail: email || null, recipientPhone: phone || null,
                        category, channel, subject, templateName, relatedApp,
                        relatedRecordID, message, status: 'SUPPRESSED',
                        failureReason: 'Registered-user notification preference is off.'
                    });
                    return { status: 'SUPPRESSED', historyID };
                }
            }
        }

        if (channel === 'SMS') {
            historyID = await insertHistory(c, {
                userID, recipientEmail: email || null, recipientPhone: phone || null,
                category, channel, subject, templateName, relatedApp,
                relatedRecordID, message, status: 'NOT_CONFIGURED',
                failureReason: 'SMS delivery provider is not configured.'
            });
            return { status: 'NOT_CONFIGURED', historyID };
        }

        const unsubscribeToken = OPTIONAL_CATEGORIES.has(category)
            ? crypto.randomBytes(32).toString('hex')
            : null;

        historyID = await insertHistory(c, {
            userID,
            recipientEmail: email,
            recipientPhone: phone || null,
            category,
            channel,
            subject,
            templateName,
            relatedApp,
            relatedRecordID,
            message,
            status: 'PENDING',
            unsubscribeToken
        });

        const unsubscribeUrl = unsubscribeToken
            ? `${publicBaseUrl()}/unsubscribe.html?token=${encodeURIComponent(unsubscribeToken)}`
            : null;

        try {
            await sendNotificationEmail({
                email,
                subject,
                message,
                category,
                unsubscribeUrl,
                explainFamilyTreeRecipient: explainFamilyTreeRecipient && !user
            });

            await c.query(
                `UPDATE NotificationHistoryT
                 SET Status='SENT', SentAt=NOW(), FailureReason=NULL
                 WHERE NotificationHistoryID=?`,
                [historyID]
            );
            return { status: 'SENT', historyID, userID: userID || null };
        } catch (error) {
            await c.query(
                `UPDATE NotificationHistoryT
                 SET Status='FAILED', FailureReason=?
                 WHERE NotificationHistoryID=?`,
                [String(error.message || error).slice(0, 500), historyID]
            );
            throw error;
        }
    } finally {
        c.release();
    }
}

async function getPreferences(userID) {
    const c = await pool.getConnection();
    try {
        const preferences = await ensurePreferences(c, userID);
        return {
            marketingEmail: Number(preferences.MarketingEmail) === 1,
            marketingSMS: Number(preferences.MarketingSMS) === 1,
            familyTreeEmail: Number(preferences.FamilyTreeEmail) === 1,
            appNoticeEmail: Number(preferences.AppNoticeEmail) === 1
        };
    } finally {
        c.release();
    }
}

async function getActiveConsentVersion(c, consentType) {
    const [rows] = await c.query(
        `SELECT ConsentTextVersionID
         FROM ConsentTextVersionsT
         WHERE ConsentType=? AND IsActive=1
         ORDER BY EffectiveDate DESC, ConsentTextVersionID DESC
         LIMIT 1`,
        [consentType]
    );
    return rows.length ? rows[0].ConsentTextVersionID : null;
}

async function logConsent(c, {
    userID, email, phone, category, channel, action, consentTextVersionID, source
}) {
    await c.query(
        `INSERT INTO NotificationConsentHistoryT
         (UserID, EmailAddress, PhoneNumber, NotificationCategory, Channel,
          ConsentAction, ConsentTextVersionID, Source, CreatedAt)
         VALUES (?,?,?,?,?,?,?,?,NOW())`,
        [
            userID || null,
            email || null,
            phone || null,
            category,
            channel,
            action,
            consentTextVersionID || null,
            source
        ]
    );
}

async function setSuppression(c, destinationType, destinationValue, category, channel, active, reason) {
    const destinationKey = makeDestinationKey(destinationType, destinationValue);
    await c.query(
        `INSERT INTO NotificationSuppressionT
         (DestinationType, DestinationValue, DestinationKey, NotificationCategory, Channel,
          Reason, IsActive, CreatedAt, UpdatedAt)
         VALUES (?,?,?,?,?,?,?,NOW(),NULL)
         ON DUPLICATE KEY UPDATE
            DestinationValue=VALUES(DestinationValue),
            Reason=VALUES(Reason),
            IsActive=VALUES(IsActive),
            UpdatedAt=NOW()`,
        [destinationType, destinationValue, destinationKey, category, channel, reason, active ? 1 : 0]
    );
}

async function updatePreferences(userID, updates) {
    const c = await pool.getConnection();
    try {
        await c.beginTransaction();
        const user = await getUserByID(c, userID);
        if (!user) throw new Error('User not found.');

        const current = await ensurePreferences(c, userID);
        const next = {
            MarketingEmail: updates.marketingEmail === undefined ? Number(current.MarketingEmail) : (updates.marketingEmail ? 1 : 0),
            MarketingSMS: updates.marketingSMS === undefined ? Number(current.MarketingSMS) : (updates.marketingSMS ? 1 : 0),
            FamilyTreeEmail: updates.familyTreeEmail === undefined ? Number(current.FamilyTreeEmail) : (updates.familyTreeEmail ? 1 : 0),
            AppNoticeEmail: updates.appNoticeEmail === undefined ? Number(current.AppNoticeEmail) : (updates.appNoticeEmail ? 1 : 0)
        };

        await c.query(
            `UPDATE NotificationPreferencesT
             SET MarketingEmail=?, MarketingSMS=?, FamilyTreeEmail=?, AppNoticeEmail=?, UpdatedAt=NOW()
             WHERE UserID=?`,
            [next.MarketingEmail, next.MarketingSMS, next.FamilyTreeEmail, next.AppNoticeEmail, userID]
        );

        const changes = [
            ['MARKETING', 'EMAIL', 'MarketingEmail', 'MARKETING_EMAIL', normalizeEmail(user.Email), 'EMAIL'],
            ['MARKETING', 'SMS', 'MarketingSMS', 'MARKETING_SMS', normalizePhone(user.Phone1), 'PHONE'],
            ['FAMILY_TREE', 'EMAIL', 'FamilyTreeEmail', null, normalizeEmail(user.Email), 'EMAIL'],
            ['APP_NOTICE', 'EMAIL', 'AppNoticeEmail', null, normalizeEmail(user.Email), 'EMAIL']
        ];

        for (const [category, channel, field, consentType, destination, destinationType] of changes) {
            if (Number(current[field]) === Number(next[field])) continue;
            if (!destination) continue;

            const turnedOn = Number(next[field]) === 1;
            await setSuppression(
                c,
                destinationType,
                destination,
                category,
                channel,
                !turnedOn,
                turnedOn ? 'USER_RESUBSCRIBE' : 'USER_PREFERENCE'
            );

            const consentTextVersionID = consentType
                ? await getActiveConsentVersion(c, consentType)
                : null;

            await logConsent(c, {
                userID,
                email: channel === 'EMAIL' ? destination : user.Email,
                phone: channel === 'SMS' ? destination : null,
                category,
                channel,
                action: turnedOn ? 'OPT_IN' : 'OPT_OUT',
                consentTextVersionID,
                source: 'PREFERENCES'
            });
        }

        await c.commit();
        return getPreferences(userID);
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        throw error;
    } finally {
        c.release();
    }
}

async function getUnsubscribeInfo(token) {
    const [rows] = await pool.query(
        `SELECT NotificationHistoryID, UserID, RecipientEmail, RecipientPhone,
                NotificationCategory, Channel
         FROM NotificationHistoryT
         WHERE UnsubscribeToken=?
         LIMIT 1`,
        [token]
    );
    if (!rows.length) return null;
    const row = rows[0];
    if (!OPTIONAL_CATEGORIES.has(row.NotificationCategory)) return null;
    return row;
}

function maskEmail(email) {
    const value = String(email || '');
    const at = value.indexOf('@');
    if (at < 1) return value;
    const local = value.slice(0, at);
    const domain = value.slice(at);
    return `${local.slice(0, 1)}${'*'.repeat(Math.max(3, local.length - 1))}${domain}`;
}

async function unsubscribeByToken(token) {
    const c = await pool.getConnection();
    try {
        await c.beginTransaction();
        const [rows] = await c.query(
            `SELECT NotificationHistoryID, UserID, RecipientEmail, RecipientPhone,
                    NotificationCategory, Channel
             FROM NotificationHistoryT
             WHERE UnsubscribeToken=?
             LIMIT 1
             FOR UPDATE`,
            [token]
        );

        if (!rows.length || !OPTIONAL_CATEGORIES.has(rows[0].NotificationCategory)) {
            const err = new Error('This unsubscribe link is not valid.');
            err.status = 404;
            throw err;
        }

        const row = rows[0];
        const destinationType = row.Channel === 'EMAIL' ? 'EMAIL' : 'PHONE';
        const destinationValue = row.Channel === 'EMAIL'
            ? normalizeEmail(row.RecipientEmail)
            : normalizePhone(row.RecipientPhone);

        await setSuppression(
            c,
            destinationType,
            destinationValue,
            row.NotificationCategory,
            row.Channel,
            true,
            'UNSUBSCRIBE_LINK'
        );

        if (row.UserID) {
            if (row.NotificationCategory === 'MARKETING' && row.Channel === 'EMAIL') {
                await c.query('UPDATE NotificationPreferencesT SET MarketingEmail=0, UpdatedAt=NOW() WHERE UserID=?', [row.UserID]);
            } else if (row.NotificationCategory === 'MARKETING' && row.Channel === 'SMS') {
                await c.query('UPDATE NotificationPreferencesT SET MarketingSMS=0, UpdatedAt=NOW() WHERE UserID=?', [row.UserID]);
            } else if (row.NotificationCategory === 'FAMILY_TREE' && row.Channel === 'EMAIL') {
                await c.query('UPDATE NotificationPreferencesT SET FamilyTreeEmail=0, UpdatedAt=NOW() WHERE UserID=?', [row.UserID]);
            } else if (row.NotificationCategory === 'APP_NOTICE' && row.Channel === 'EMAIL') {
                await c.query('UPDATE NotificationPreferencesT SET AppNoticeEmail=0, UpdatedAt=NOW() WHERE UserID=?', [row.UserID]);
            }
        }

        await logConsent(c, {
            userID: row.UserID,
            email: row.RecipientEmail,
            phone: row.RecipientPhone,
            category: row.NotificationCategory,
            channel: row.Channel,
            action: 'OPT_OUT',
            consentTextVersionID: null,
            source: 'EMAIL_UNSUBSCRIBE'
        });

        await c.commit();
        return {
            category: row.NotificationCategory,
            channel: row.Channel,
            maskedDestination: row.Channel === 'EMAIL'
                ? maskEmail(row.RecipientEmail)
                : 'the selected phone number'
        };
    } catch (error) {
        try { await c.rollback(); } catch (_) {}
        throw error;
    } finally {
        c.release();
    }
}

module.exports = {
    sendNotification,
    getPreferences,
    updatePreferences,
    getUnsubscribeInfo,
    unsubscribeByToken,
    getActiveConsentVersion,
    logConsent,
    normalizeEmail,
    normalizePhone
};
