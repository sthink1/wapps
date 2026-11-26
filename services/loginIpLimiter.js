'use strict';

const crypto = require('node:crypto');
const { verifiedClientIp } = require('./clientIp');

const WINDOW_SECONDS = 15 * 60;
const LIMIT = 30;

function enabled(env = process.env) {
    return env.WA_LOGIN_IP_LIMIT_ENABLED === '1';
}

function keyFor(ip) {
    if (!process.env.JWT_SECRET) throw new Error('LOGIN_IP_RATE_SECRET_REQUIRED');
    return crypto.createHmac('sha256', process.env.JWT_SECRET)
        .update(`login-ip-rate-v1|${ip}`, 'utf8')
        .digest('hex');
}

function activeEvents(value, now) {
    const events = JSON.parse(value);
    if (!Array.isArray(events) || events.length > LIMIT ||
        events.some((event, index) => !Number.isSafeInteger(event) || event < 0 ||
            event > now || (index > 0 && event < events[index - 1]))) {
        throw new Error('LOGIN_IP_RATE_INVALID_COUNTER');
    }
    return events.filter(event => event > now - WINDOW_SECONDS);
}

async function allow(pool, req) {
    // No shared-proxy or unknown identity bucket. Account limits remain in force.
    if (!enabled()) return true;
    const ip = verifiedClientIp(req);
    if (ip === null) return true;
    const key = keyFor(ip);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // The insert/upsert acquires the unique row lock even for a new identity.
        await connection.query(
            `INSERT INTO LoginIpRateT (IpKey, RequestEvents, UpdatedAt)
             VALUES (?, '[]', UTC_TIMESTAMP())
             ON DUPLICATE KEY UPDATE IpKey = VALUES(IpKey)`,
            [key]
        );
        const [rows] = await connection.query(
            'SELECT RequestEvents FROM LoginIpRateT WHERE IpKey = ? FOR UPDATE',
            [key]
        );
        if (rows.length !== 1) throw new Error('LOGIN_IP_RATE_COUNTER_MISSING');
        const [[clock]] = await connection.query('SELECT UNIX_TIMESTAMP() AS NowEpoch');
        const now = Number(clock.NowEpoch);
        if (!Number.isSafeInteger(now) || now <= 0) throw new Error('LOGIN_IP_RATE_INVALID_CLOCK');
        const events = activeEvents(rows[0].RequestEvents, now);
        if (events.length >= LIMIT) {
            await connection.commit();
            return false;
        }
        events.push(now);
        const [updated] = await connection.query(
            `UPDATE LoginIpRateT SET RequestEvents = ?, UpdatedAt = UTC_TIMESTAMP()
             WHERE IpKey = ?`,
            [JSON.stringify(events), key]
        );
        if (updated.affectedRows !== 1) throw new Error('LOGIN_IP_RATE_UPDATE_FAILED');
        // Commit separately before account lookup/password validation; even an
        // unknown username or later failure consumes the IP request allowance.
        await connection.commit();
        return true;
    } catch (error) {
        try { await connection.rollback(); } catch (_) { /* Preserve original failure. */ }
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { WINDOW_SECONDS, LIMIT, enabled, allow };
