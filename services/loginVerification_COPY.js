'use strict';

const crypto = require('node:crypto');
const fence = require('./credentialFence');

const ATTEMPT_LIMIT = 5;
const INVALID_MESSAGE = 'Invalid or expired verification request. Check your code or log in again.';

function validToken(token) {
    // Both existing clients receive a 32-byte random, lowercase hex token.
    return typeof token === 'string' && /^[0-9a-f]{64}$/.test(token);
}

async function findCandidate(pool, token) {
    if (!validToken(token)) {
        return null;
    }
    const [rows] = await pool.query(
        `SELECT VerificationID, UserID FROM LoginVerificationT
         WHERE TempToken = ? AND IsVerified = 0 AND ExpiresAt > UTC_TIMESTAMP()
         AND FailedAttempts < ? ORDER BY VerificationID DESC LIMIT 1`,
        [token, ATTEMPT_LIMIT]
    );
    return rows[0] || null;
}

function matchesCode(stored, supplied) {
    const expected = String(stored);
    if (typeof supplied !== 'string' || !/^[0-9]{6}$/.test(supplied) ||
        !/^[0-9]{6}$/.test(expected)) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(expected, 'ascii'), Buffer.from(supplied, 'ascii'));
}

// Called inside an active transaction. The caller MUST commit a normal denied
// result (including a counted wrong code), or roll back on an exception.
// A success consumes the challenge inside the same transaction as session issue.
async function verifyLocked(connection, candidate, token, code) {
    const version = await fence.lock(connection, candidate.UserID);
    // Lock by primary key, not by the unindexed TempToken scan.
    const [rows] = await connection.query(
        `SELECT VerificationID, UserID, TempToken, SecurityVersion, VerificationCode, FailedAttempts
         FROM LoginVerificationT WHERE VerificationID = ? AND IsVerified = 0
         AND ExpiresAt > UTC_TIMESTAMP() FOR UPDATE`,
        [candidate.VerificationID]
    );
    const challenge = rows[0];
    if (!challenge || challenge.UserID !== candidate.UserID ||
        challenge.TempToken !== token || !fence.matches(challenge.SecurityVersion, version)) {
        return { ok: false };
    }
    const attempts = Number(challenge.FailedAttempts);
    if (!Number.isInteger(attempts) || attempts < 0 || attempts > ATTEMPT_LIMIT) {
        throw new Error('LOGIN_CHALLENGE_INVALID_COUNTER');
    }
    if (attempts >= ATTEMPT_LIMIT) {
        return { ok: false };
    }
    if (!matchesCode(challenge.VerificationCode, code)) {
        const [updated] = await connection.query(
            `UPDATE LoginVerificationT SET FailedAttempts = FailedAttempts + 1
             WHERE VerificationID = ? AND IsVerified = 0 AND FailedAttempts = ?
             AND SecurityVersion = ? AND ExpiresAt > UTC_TIMESTAMP()`,
            [challenge.VerificationID, attempts, version]
        );
        if (updated.affectedRows !== 1) {
            // A challenge can expire between the locked read and the write.
            // Deny on any mismatch; no session is created.
            return { ok: false };
        }
        return { ok: false };
    }
    const [used] = await connection.query(
        `UPDATE LoginVerificationT SET IsVerified = 1
         WHERE VerificationID = ? AND IsVerified = 0 AND FailedAttempts < ?
         AND SecurityVersion = ? AND ExpiresAt > UTC_TIMESTAMP()`,
        [challenge.VerificationID, ATTEMPT_LIMIT, version]
    );
    if (used.affectedRows !== 1) {
        return { ok: false };
    }
    return { ok: true, userID: challenge.UserID, version };
}

module.exports = { ATTEMPT_LIMIT, INVALID_MESSAGE, findCandidate, verifyLocked };
