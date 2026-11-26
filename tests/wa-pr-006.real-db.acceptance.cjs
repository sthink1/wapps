'use strict';

// Optional Step D test. This performs bounded synthetic writes to the NEW
// LoginIpRateT table only, not to existing accounts, reset counters, or mail.
// Do not run until separately authorized and test migration is confirmed.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const Module = require('node:module');

const env = process.env;
const liveApproved = process.argv.includes('--run-live-test-db');
if (!liveApproved || env.WA_ENV !== 'local' || env.NODE_ENV === 'production' ||
    env.WA_PRODUCTION_RELEASE_GATE || env.DB_HOST !== 'morty2.heliohost.org' ||
    env.DB_NAME !== 'wapps_test' || env.DB_USER !== 'wapps_test' ||
    String(env.DB_PORT) !== '3306' || env.DB_SSL !== 'required' || !env.DB_PASSWORD) {
    console.error('REFUSED: requires separately authorized local HelioHost wapps_test TLS configuration and --run-live-test-db.');
    process.exit(1);
}

// The script never loads the real JWT secret or trusts an actual HTTP header.
// A synthetic random per-run namespace prevents collisions with WA counters.
env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
env.WA_LOGIN_IP_LIMIT_ENABLED = '1';
env.WA_TRUST_RENDER_CF_IP = '1';
const originalLoad = Module._load;
let limiter;
try {
    Module._load = function (id, parent, isMain) {
        if (id === './stage6Environment' && parent?.filename.endsWith('clientIp.js')) {
            return { current: { mode: 'staging', publicOrigin: 'https://wapps-stage6-test.onrender.com' } };
        }
        return originalLoad.apply(this, arguments);
    };
    limiter = require('../services/loginIpLimiter');
} finally {
    Module._load = originalLoad;
}
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: { rejectUnauthorized: true },
    timezone: 'Z',
    connectionLimit: 3,
    waitForConnections: true,
    queueLimit: 50,
    connectTimeout: 10000
});

// Validate every borrowed connection before any test write. Session setting is
// connection-local only; no persistent configuration or server setting changes.
const testPool = {
    async getConnection() {
        const c = await pool.getConnection();
        try {
            await c.query("SET time_zone = '+00:00'");
            const [[identity]] = await c.query('SELECT DATABASE() AS Db, @@session.time_zone AS Tz');
            assert.equal(identity.Db, 'wapps_test');
            assert.equal(identity.Tz, '+00:00');
            const [tls] = await c.query("SHOW SESSION STATUS LIKE 'Ssl_cipher'");
            assert.equal(tls.length, 1);
            assert(tls[0].Value, 'TLS required');
            return c;
        } catch (error) {
            c.release();
            throw error;
        }
    }
};

async function query(sql, args = []) {
    const c = await testPool.getConnection();
    try { return await c.query(sql, args); }
    finally { c.release(); }
}

const ips = ['192.0.2.219', '198.51.100.219'];
const requests = ips.map(ip => ({ rawHeaders: ['CF-Connecting-IP', ip] }));
const keys = ips.map(ip => crypto.createHmac('sha256', env.JWT_SECRET)
    .update(`login-ip-rate-v1|${ip}`, 'utf8').digest('hex'));
let ownNamespace = false;
let passed = false;

async function run() {
    try {
        const [table] = await query(`SELECT ENGINE FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LoginIpRateT'`);
        assert.equal(table.length, 1, 'Apply separately authorized migration first');
        assert.equal(table[0].ENGINE.toLowerCase(), 'innodb');
        const [columns] = await query(`SELECT COLUMN_NAME, COLUMN_KEY, CHARACTER_MAXIMUM_LENGTH
            FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'LoginIpRateT'`);
        assert.equal(columns.length, 3);
        assert(columns.some(x => x.COLUMN_NAME === 'IpKey' && x.COLUMN_KEY === 'PRI' && Number(x.CHARACTER_MAXIMUM_LENGTH) === 64));
        assert(columns.some(x => x.COLUMN_NAME === 'RequestEvents' && Number(x.CHARACTER_MAXIMUM_LENGTH) >= 512));
        assert(columns.some(x => x.COLUMN_NAME === 'UpdatedAt' && x.COLUMN_KEY === 'MUL'));
        const [existing] = await query('SELECT IpKey FROM LoginIpRateT WHERE IpKey IN (?, ?)', keys);
        assert.equal(existing.length, 0, 'Random synthetic namespace must be absent');
        ownNamespace = true;

        // A bounded burst: 40 requests to one synthetic key, using at most three
        // TLS connections. Wait for every task to settle before any cleanup.
        const attempts = await Promise.allSettled(Array.from({ length: 40 }, () => limiter.allow(testPool, requests[0])));
        assert(attempts.every(x => x.status === 'fulfilled'), 'A concurrent DB operation failed');
        assert.equal(attempts.filter(x => x.value === true).length, 30);
        assert.equal(attempts.filter(x => x.value === false).length, 10);
        const [[first]] = await query('SELECT RequestEvents FROM LoginIpRateT WHERE IpKey = ?', [keys[0]]);
        assert.equal(JSON.parse(first.RequestEvents).length, 30);
        console.log('PASS: 40 parallel requests, exactly 30 admitted and 10 denied; 30 stored events.');
        assert.equal(await limiter.allow(testPool, requests[1]), true);
        const reloadedPath = require.resolve('../services/loginIpLimiter');
        delete require.cache[reloadedPath];
        const reloaded = require(reloadedPath);
        assert.equal(await reloaded.allow(testPool, requests[0]), false);
        console.log('PASS: second identity admitted independently; fresh limiter module observes persisted restriction.');

        // Seed only the owned synthetic row with 15 expired and 15 active events.
        // This validates individual-event aging without a 15-minute live wait.
        const [[clock]] = await query('SELECT UNIX_TIMESTAMP() AS NowEpoch');
        const now = Number(clock.NowEpoch);
        const events = [...Array(15).fill(now - 905), ...Array(15).fill(now - 100)];
        const [seeded] = await query('UPDATE LoginIpRateT SET RequestEvents = ?, UpdatedAt = UTC_TIMESTAMP() WHERE IpKey = ?',
            [JSON.stringify(events), keys[0]]);
        assert.equal(seeded.affectedRows, 1);
        for (let i = 0; i < 15; i++) assert.equal(await limiter.allow(testPool, requests[0]), true);
        assert.equal(await limiter.allow(testPool, requests[0]), false);
        console.log('PASS: exactly 15 expired events free 15 places; remaining active events still count.');

        const [damaged] = await query('UPDATE LoginIpRateT SET RequestEvents = ? WHERE IpKey = ?', ['not-json', keys[1]]);
        assert.equal(damaged.affectedRows, 1);
        await assert.rejects(limiter.allow(testPool, requests[1]));
        const [[unchanged]] = await query('SELECT RequestEvents FROM LoginIpRateT WHERE IpKey = ?', [keys[1]]);
        assert.equal(unchanged.RequestEvents, 'not-json');
        console.log('PASS: invalid stored history is not silently reset; transaction rolls back.');
        passed = true;
    } catch (_) {
        console.error('FAIL: live synthetic test did not meet an assertion or database operation failed (details omitted).');
    } finally {
        if (ownNamespace) {
            try {
                await query('DELETE FROM LoginIpRateT WHERE IpKey IN (?, ?)', keys);
                const [left] = await query('SELECT IpKey FROM LoginIpRateT WHERE IpKey IN (?, ?)', keys);
                assert.equal(left.length, 0);
                console.log('PASS: both synthetic keys absent after cleanup; no other rows targeted.');
            } catch (_) {
                passed = false;
                console.error('FAIL: synthetic cleanup could not be verified. Only these synthetic HMAC keys may require cleanup:');
                console.error(keys.join('\n'));
            }
        }
        await pool.end();
        process.exitCode = passed ? 0 : 1;
    }
}

run().catch(() => {
    console.error('FAIL: isolated test termination failed (details omitted).');
    process.exitCode = 1;
});
