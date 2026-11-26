'use strict';

const crypto = require('node:crypto');

const WINDOW_SECONDS = 15 * 60;
const PASSWORD_LIMIT = 5;
const EMAIL_LIMIT = 3;

// All callers must hold the credential-fence lock for this account and use
// the same transaction until the counter update and challenge insertion commit.
// IDs come from UsersT, not from the supplied username or request headers.
function accountKey(userID) {
    if (!Number.isSafeInteger(Number(userID)) || Number(userID) <= 0) {
        throw new Error('LOGIN_RATE_INVALID_ACCOUNT');
    }
    if (!process.env.JWT_SECRET) {
        throw new Error('LOGIN_RATE_SECRET_REQUIRED');
    }
    return crypto.createHmac('sha256', process.env.JWT_SECRET)
        .update(`login-rate-v1|${Number(userID)}`, 'utf8')
        .digest('hex');
}

function activeEvents(value, now, limit) {
    const events = JSON.parse(value);
    if (!Array.isArray(events) || events.length > limit ||
        events.some((event, index) => !Number.isSafeInteger(event) || event < 0 ||
            event > now || (index > 0 && event < events[index - 1]))) {
        throw new Error('LOGIN_RATE_INVALID_COUNTER');
    }
    return events.filter(event => event > now - WINDOW_SECONDS);
}

async function load(connection, userID) {
    const key = accountKey(userID);
    await connection.query(
        `INSERT INTO LoginRateT (AccountKey, PasswordFailures, EmailIssuances, UpdatedAt)
         VALUES (?, '[]', '[]', UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE AccountKey = VALUES(AccountKey)`,
        [key]
    );
    const [rows] = await connection.query(
        `SELECT PasswordFailures, EmailIssuances
         FROM LoginRateT WHERE AccountKey = ? FOR UPDATE`,
        [key]
    );
    if (rows.length !== 1) {
        throw new Error('LOGIN_RATE_COUNTER_MISSING');
    }
    // Read database time after waiting for the account and counter locks.
    const [[clock]] = await connection.query('SELECT UNIX_TIMESTAMP() AS NowEpoch');
    const now = Number(clock.NowEpoch);
    if (!Number.isSafeInteger(now) || now <= 0) {
        throw new Error('LOGIN_RATE_INVALID_CLOCK');
    }
    return {
        key,
        now,
        passwordFailures: activeEvents(rows[0].PasswordFailures, now, PASSWORD_LIMIT),
        emailIssuances: activeEvents(rows[0].EmailIssuances, now, EMAIL_LIMIT)
    };
}

function passwordAllowed(state) {
    return state.passwordFailures.length < PASSWORD_LIMIT;
}

function emailAllowed(state) {
    return state.emailIssuances.length < EMAIL_LIMIT;
}

async function save(connection, state) {
    // Recording a failure or issuance always changes an event list.
    const [updated] = await connection.query(
        `UPDATE LoginRateT SET PasswordFailures = ?, EmailIssuances = ?,
             UpdatedAt = UTC_TIMESTAMP() WHERE AccountKey = ?`,
        [JSON.stringify(state.passwordFailures), JSON.stringify(state.emailIssuances), state.key]
    );
    if (updated.affectedRows !== 1) {
        throw new Error('LOGIN_RATE_UPDATE_FAILED');
    }
}

async function recordPasswordFailure(connection, state) {
    if (!passwordAllowed(state)) {
        throw new Error('LOGIN_RATE_PASSWORD_LIMIT');
    }
    state.passwordFailures.push(state.now);
    await save(connection, state);
}

async function reserveEmail(connection, state) {
    if (!emailAllowed(state)) {
        throw new Error('LOGIN_RATE_EMAIL_LIMIT');
    }
    state.emailIssuances.push(state.now);
    await save(connection, state);
}

module.exports = {
    WINDOW_SECONDS,
    PASSWORD_LIMIT,
    EMAIL_LIMIT,
    load,
    passwordAllowed,
    emailAllowed,
    recordPasswordFailure,
    reserveEmail
};
