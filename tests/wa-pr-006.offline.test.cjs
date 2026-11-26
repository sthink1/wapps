'use strict';

// No application server, real DB, real environment file, network, or email.
// Explicit module stubs isolate database and ingress assumptions. This suite
// exercises final source and route callbacks, not a substitute for live MySQL.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const stage = { mode: 'staging', publicOrigin: 'https://wapps-stage6-test.onrender.com' };
const flag = { WA_TRUST_RENDER_CF_IP: '1' };
const env = process.env;
// Fixed public test-only material; never read real credentials or dotenv.
env.JWT_SECRET = 'wa-pr-006-offline-synthetic-not-a-real-secret';
env.WA_TRUST_RENDER_CF_IP = '1';
env.WA_LOGIN_IP_LIMIT_ENABLED = '1';

function load(relative, stubs = {}) {
    const filename = path.join(root, relative);
    const source = fs.readFileSync(filename, 'utf8');
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    const nativeRequire = mod.require.bind(mod);
    mod.require = id => Object.hasOwn(stubs, id) ? stubs[id] : nativeRequire(id);
    mod._compile(source, filename);
    return mod.exports;
}

const ipService = load('services/clientIp.js', { './stage6Environment': { current: stage } });
const resetIp = load('services/passwordResetClientIp.js', { './clientIp': ipService });
const loginIp = load('services/loginIpLimiter.js', { './clientIp': ipService });
const reset = load('services/passwordResetLimiter.js', { './stage6Environment': {} });
const cleanup = load('services/passwordResetRateCleanup.js', {
    './stage6Environment': {}, './loginIpLimiter': loginIp
});
const req = (ip, xff = '198.51.100.99') => ({
    rawHeaders: ['X-Forwarded-For', xff, ...(ip === null ? [] : ['CF-Connecting-IP', ip])],
    socket: { remoteAddress: '10.0.0.7' },
    ip: '10.0.0.7'
});
const a = req('192.0.2.10');
const b = req('192.0.2.11');
const missing = req(null);

// This mock serializes transactions in a queue; the application SQL must still
// use real InnoDB locks in deployment. Every SQL shape/order is asserted here.
class MockLoginDb {
    constructor() {
        this.rows = new Map();
        this.clock = 1700000000;
        this.queue = Promise.resolve();
        this.commits = 0;
        this.rollbacks = 0;
        this.releases = 0;
        this.acquisitions = 0;
        this.fault = null;
    }
    async getConnection() {
        this.acquisitions++;
        const db = this;
        let unlock;
        let state;
        let phase = 0;
        let held = false;
        return {
            async beginTransaction() {
                const before = db.queue;
                db.queue = new Promise(resolve => { unlock = resolve; });
                await before;
                held = true;
                state = new Map(db.rows);
            },
            async query(sql, args = []) {
                assert(held, 'query inside transaction');
                if (sql.startsWith('INSERT INTO LoginIpRateT')) {
                    assert.equal(phase++, 0);
                    assert.match(sql, /ON DUPLICATE KEY UPDATE IpKey = VALUES\(IpKey\)/);
                    assert.match(args[0], /^[a-f0-9]{64}$/);
                    if (!state.has(args[0])) state.set(args[0], '[]');
                    return [{ affectedRows: 1 }];
                }
                if (sql.startsWith('SELECT RequestEvents')) {
                    assert.equal(phase++, 1);
                    assert.match(sql, /FOR UPDATE$/);
                    return [[{ RequestEvents: state.get(args[0]) }]];
                }
                if (sql.startsWith('SELECT UNIX_TIMESTAMP()')) {
                    assert.equal(phase++, 2);
                    if (db.fault === 'clock') return [[{ NowEpoch: null }]];
                    return [[{ NowEpoch: db.clock }]];
                }
                if (sql.startsWith('UPDATE LoginIpRateT')) {
                    assert.equal(phase++, 3);
                    if (db.fault === 'throw') throw Error('synthetic update failure');
                    if (db.fault === 'rows') return [{ affectedRows: 0 }];
                    assert.equal(args.length, 2);
                    assert(state.has(args[1]));
                    state.set(args[1], args[0]);
                    return [{ affectedRows: 1 }];
                }
                throw Error('Unexpected SQL in isolated login fixture');
            },
            async commit() {
                assert(held);
                assert(phase === 3 || phase === 4);
                db.rows = state;
                db.commits++;
                held = false;
                unlock();
            },
            async rollback() {
                db.rollbacks++;
                if (held) {
                    held = false;
                    unlock();
                }
            },
            release() {
                assert(!held);
                db.releases++;
            }
        };
    }
}

class MockResetDb {
    constructor() {
        this.rows = new Map();
        this.bucket = '2026112620';
        this.increments = [];
    }
    connection() {
        return { query: async (sql, args = []) => {
            if (sql.startsWith('SELECT DATE_FORMAT')) return [[{ Bucket: this.bucket }]];
            if (sql.startsWith('INSERT INTO PasswordResetRateT')) {
                assert.match(args[0], /^[a-f0-9]{64}$/);
                assert.equal(args[1], this.bucket);
                assert.match(sql, /AttemptCount=AttemptCount\+1/);
                this.increments.push(args[0]);
                this.rows.set(args[0], (this.rows.get(args[0]) || 0) + 1);
                return [{ affectedRows: 1 }];
            }
            if (sql.startsWith('SELECT AttemptCount')) {
                assert.match(sql, /FOR UPDATE$/);
                return [[{ AttemptCount: this.rows.get(args[0]) }]];
            }
            throw Error('Unexpected SQL in isolated reset fixture');
        } };
    }
}

function response() {
    return {
        statusCode: 200, payload: null, headers: {},
        status(code) { this.statusCode = code; return this; },
        json(body) { this.payload = body; return this; },
        set(name, value) { this.headers[name] = value; return this; }
    };
}

function routeFixture(pool, overrides = {}) {
    const routes = new Map();
    const register = (method, route, ...handlers) => routes.set(`${method} ${route}`, handlers.at(-1));
    const router = { post: (...args) => register('POST', ...args), get: (...args) => register('GET', ...args) };
    const chain = new Proxy({}, { get: () => () => chain });
    const stubs = {
        express: { Router: () => router },
        'express-validator': { body: () => chain, validationResult: () => ({ isEmpty: () => true }) },
        '../dbConnection': { pool },
        bcrypt: {}, jsonwebtoken: {},
        '../utils': { handleDbError: (_error, res) => res.status(500).json({ error: 'DATABASE_ERROR' }) },
        '../send_email': {},
        '../services/browserSession': { requireOrigin: () => {} },
        '../services/stage6ExpectedClientError': {},
        '../services/credentialFence': {},
        '../services/loginLimiter': {},
        '../services/loginIpLimiter': loginIp,
        '../services/loginVerification': {},
        '../middleware/auth': () => {},
        '../services/subscriptionService': {},
        '../services/notificationService': {},
        '../services/passwordResetLimiter': reset,
        '../services/passwordResetClientIp': resetIp,
        dotenv: { config: () => ({}) },
        ...overrides
    };
    load('routes/users.js', stubs);
    return routes;
}

test('staging verified CF identity, independent of XFF and socket peer', () => {
    assert.equal(ipService.verifiedClientIp(a, flag), '192.0.2.10');
    assert.equal(ipService.verifiedClientIp(req('192.0.2.10', '203.0.113.70'), flag), '192.0.2.10');
    assert.equal(ipService.verifiedClientIp(b, flag), '192.0.2.11');
    assert.equal(resetIp.clientIpForReset(a, flag), ipService.verifiedClientIp(a, flag));
});

test('missing, invalid, duplicate, joined and unverified headers never create shared identity', () => {
    const duplicate = req('192.0.2.10');
    duplicate.rawHeaders.push('cf-connecting-ip', '192.0.2.10');
    for (const value of [missing, req('garbage'), req('192.0.2.10, 192.0.2.11'),
        req('fe80::1%eth0'), duplicate, { socket: a.socket, get: () => '192.0.2.10' }]) {
        assert.equal(ipService.verifiedClientIp(value, flag), null);
    }
    assert.equal(ipService.verifiedClientIp(a, {}), null);
});

test('canonical IPv6 and IPv4-mapped forms cannot evade identity equality', () => {
    assert.equal(ipService.singleIP('2001:0DB8:0000:0000:0000:0000:0000:1'), '2001:db8::1');
    assert.equal(ipService.singleIP('::ffff:c000:020a'), '192.0.2.10');
    assert.equal(ipService.singleIP('::ffff:192.0.2.10'), '192.0.2.10');
    assert.equal(ipService.singleIP('192.000.2.10'), null);
});

test('local and production trust gates: production requires independent assurance', () => {
    const local = load('services/clientIp.js', { './stage6Environment': { current: {
        mode: 'local', publicOrigin: 'http://localhost:8080'
    } } });
    const production = load('services/clientIp.js', { './stage6Environment': { current: {
        mode: 'production', publicOrigin: 'https://production.example.invalid'
    } } });
    const prod = { ...flag, WA_PRODUCTION_RELEASE_GATE: 'owner-authorized',
        WA_PRODUCTION_ORIGIN: 'https://production.example.invalid' };
    assert.equal(local.verifiedClientIp(a, flag), null);
    assert.equal(production.verifiedClientIp(a, flag), null);
    assert.equal(production.verifiedClientIp(a, prod), null);
    assert.equal(production.verifiedClientIp(a, { ...prod, WA_PRODUCTION_CF_INGRESS_VERIFIED: '1',
        WA_PRODUCTION_ORIGIN: 'https://wrong.example.invalid' }), null);
    assert.equal(production.verifiedClientIp(a, { ...prod, WA_PRODUCTION_CF_INGRESS_VERIFIED: '1' }), '192.0.2.10');
});

test('login feature off or unknown provenance: no database or shared proxy bucket', async () => {
    const db = new MockLoginDb();
    env.WA_LOGIN_IP_LIMIT_ENABLED = '0';
    try { assert.equal(await loginIp.allow(db, a), true); }
    finally { env.WA_LOGIN_IP_LIMIT_ENABLED = '1'; }
    for (let i = 0; i < 40; i++) assert.equal(await loginIp.allow(db, missing), true);
    assert.equal(db.acquisitions, 0);
    assert.equal(db.rows.size, 0);
});

test('30/31 rolling boundary, independent IP, restart-equivalent reload, HMAC-only storage', async () => {
    const db = new MockLoginDb();
    const start = db.clock;
    for (let i = 0; i < 30; i++) assert.equal(await loginIp.allow(db, a), true);
    assert.equal(await loginIp.allow(db, a), false);
    const restarted = load('services/loginIpLimiter.js', { './clientIp': ipService });
    assert.equal(await restarted.allow(db, a), false);
    db.clock = start + 899;
    assert.equal(await restarted.allow(db, a), false);
    assert.equal(await restarted.allow(db, b), true);
    db.clock = start + 900;
    assert.equal(await restarted.allow(db, a), true);
    assert.equal(db.rows.size, 2);
    for (const [key, value] of db.rows) {
        assert.match(key, /^[a-f0-9]{64}$/);
        assert(!key.includes('192.0.2'));
        assert(JSON.parse(value).length <= 30);
    }
    assert.equal(db.commits, db.releases);
});

test('true rolling behavior: only individual expired events free quota', async () => {
    const db = new MockLoginDb();
    const start = db.clock;
    for (let i = 0; i < 15; i++) assert.equal(await loginIp.allow(db, a), true);
    db.clock += 450;
    for (let i = 0; i < 15; i++) assert.equal(await loginIp.allow(db, a), true);
    db.clock = start + 900;
    for (let i = 0; i < 15; i++) assert.equal(await loginIp.allow(db, a), true);
    assert.equal(await loginIp.allow(db, a), false);
    db.clock = start + 1350;
    assert.equal(await loginIp.allow(db, a), true);
});

test('40 parallel attempts across two service instances: exactly 30 allowed in serialized SQL mock', async () => {
    const db = new MockLoginDb();
    const other = load('services/loginIpLimiter.js', { './clientIp': ipService });
    const result = await Promise.all(Array.from({ length: 40 }, (_, i) =>
        (i % 2 ? loginIp : other).allow(db, a)));
    assert.equal(result.filter(Boolean).length, 30);
    assert.equal(result.filter(x => !x).length, 10);
    assert.equal(db.commits, 40);
    assert.equal(db.releases, 40);
});

test('verified limiter database failure, invalid clock and affected-row failure roll back and release', async () => {
    for (const fault of ['throw', 'clock', 'rows']) {
        const db = new MockLoginDb();
        db.fault = fault;
        await assert.rejects(loginIp.allow(db, a));
        assert.equal(db.rows.size, 0);
        assert.equal(db.rollbacks, 1);
        assert.equal(db.releases, 1);
    }
});

test('corrupt or future event history rejects safely, not reset into fresh quota', async () => {
    const db = new MockLoginDb();
    await loginIp.allow(db, a);
    const key = [...db.rows.keys()][0];
    for (const invalid of ['{}', '[1,0]', '[9999999999]', 'not-json', JSON.stringify(Array(31).fill(db.clock))]) {
        db.rows.set(key, invalid);
        await assert.rejects(loginIp.allow(db, a));
        assert.equal(db.rows.get(key), invalid);
    }
    assert.equal(db.rollbacks, 5);
});

test('IP HMAC domain separation and equivalent addresses share the same quota', async () => {
    const db = new MockLoginDb();
    await loginIp.allow(db, a);
    await loginIp.allow(db, req('::ffff:192.0.2.10'));
    const expected = crypto.createHmac('sha256', env.JWT_SECRET).update('login-ip-rate-v1|192.0.2.10').digest('hex');
    assert.equal(db.rows.size, 1);
    assert.equal(JSON.parse(db.rows.get(expected)).length, 2);
});

test('password reset verified 20/hour preserved and deterministic lock order retained', async () => {
    const db = new MockResetDb();
    for (let i = 0; i < 20; i++) {
        const before = db.increments.length;
        assert.equal(await reset.allow(db.connection(), `reset${i}@example.invalid`, resetIp.clientIpForReset(a)), true);
        const keys = db.increments.slice(before);
        assert.equal(keys.length, 3);
        assert.deepEqual(keys, [...keys].sort((x, y) => x.localeCompare(y)));
    }
    assert.equal(await reset.allow(db.connection(), 'blocked@example.invalid', resetIp.clientIpForReset(a)), false);
    assert.equal(await reset.allow(db.connection(), 'other@example.invalid', resetIp.clientIpForReset(b)), true);
    db.bucket = '2026112621';
    assert.equal(await reset.allow(db.connection(), 'next@example.invalid', resetIp.clientIpForReset(a)), true);
});

test('unverified reset fallback has two keys, no proxy 20 cap, email/global ceilings preserved', async () => {
    const db = new MockResetDb();
    for (let i = 0; i < 21; i++) {
        const before = db.increments.length;
        assert.equal(await reset.allow(db.connection(), `unverified${i}@example.invalid`, null), true);
        assert.equal(db.increments.length - before, 2);
    }
    for (let i = 0; i < 5; i++) assert.equal(await reset.allow(db.connection(), 'same@example.invalid', null), true);
    assert.equal(await reset.allow(db.connection(), 'same@example.invalid', null), false);
    for (let i = 27; i < 100; i++) assert.equal(await reset.allow(db.connection(), `global${i}@example.invalid`, null), true);
    assert.equal(await reset.allow(db.connection(), 'global101@example.invalid', null), false);
    assert([...db.rows.keys()].every(key => /^[a-f0-9]{64}$/.test(key)));
});

test('actual login route: unknown and malformed requests counted before lookup; denial has same 401 body', async () => {
    const db = new MockLoginDb();
    let lookups = 0;
    db.query = async (sql, args) => {
        assert.match(sql, /^SELECT UserID FROM UsersT WHERE UserName = \? LIMIT 1$/);
        assert.equal(args.length, 1);
        lookups++;
        return [[]];
    };
    const login = routeFixture(db).get('POST /login');
    let first;
    for (let i = 0; i < 30; i++) {
        const r = response();
        await login({ ...a, body: { username: `nonexistent-${i}`, password: 'synthetic' } }, r);
        assert.equal(r.statusCode, 401);
        first ||= r.payload;
        assert.deepEqual(r.payload, first);
    }
    const denied = response();
    await login({ ...a, body: { username: 'synthetic-known', password: 'synthetic' } }, denied);
    assert.equal(denied.statusCode, 401);
    assert.deepEqual(denied.payload, first);
    assert.equal(lookups, 30);
    const malformed = response();
    await login({ ...b, body: {} }, malformed);
    assert.equal(malformed.statusCode, 401);
    assert.equal(db.rows.size, 2);
    assert.equal(lookups, 30);
});

test('actual login route: permitted request still executes account fence/password/email protections', async () => {
    const db = new MockLoginDb();
    const callOrder = [];
    db.query = async () => [[{ UserID: 17 }]];
    let accountMode = 'password-block';
    let challengeCount = 0;
    let mailCount = 0;
    const accountConnection = {
        beginTransaction: async () => { callOrder.push('begin'); },
        query: async sql => {
            if (sql.startsWith('SELECT UserID, UserName')) return [[{ UserID: 17, UserName: 'synthetic', Email: 'test@example.invalid', PasswordHash: 'synthetic-hash' }]];
            assert.match(sql, /INSERT INTO LoginVerificationT/);
            challengeCount++;
            callOrder.push('challenge');
            return [{ affectedRows: 1 }];
        },
        commit: async () => { callOrder.push('commit'); },
        rollback: async () => { callOrder.push('rollback'); },
        release: () => { callOrder.push('release'); }
    };
    // Login IP service acquires its own mock connection first; the account path
    // gets a separate connection through the actual route. No overlap in locks.
    let acquisitions = 0;
    const pool = { query: db.query, getConnection: async () => {
        acquisitions++;
        return acquisitions % 2 === 1 ? db.getConnection() : accountConnection;
    } };
    const login = routeFixture(pool, {
        '../services/credentialFence': { lock: async () => { callOrder.push('fence'); return 9; } },
        '../services/loginLimiter': {
            load: async () => { callOrder.push('load'); return {}; },
            passwordAllowed: () => accountMode !== 'password-block',
            recordPasswordFailure: async () => { callOrder.push('record-failure'); },
            emailAllowed: () => accountMode !== 'email-block',
            reserveEmail: async () => { callOrder.push('reserve'); }
        },
        bcrypt: { compare: async () => { callOrder.push('bcrypt'); return accountMode !== 'wrong-password'; } },
        '../send_email': { sendVerificationCode: async () => { callOrder.push('mail'); mailCount++; } }
    }).get('POST /login');
    const run = async () => {
        const r = response();
        await login({ ...a, body: { username: 'synthetic', password: 'test-only' } }, r);
        return r;
    };
    assert.equal((await run()).statusCode, 401);
    assert.deepEqual(callOrder.splice(0), ['begin', 'fence', 'load', 'commit', 'release']);
    accountMode = 'wrong-password';
    assert.equal((await run()).statusCode, 401);
    assert.deepEqual(callOrder.splice(0), ['begin', 'fence', 'load', 'bcrypt', 'record-failure', 'commit', 'release']);
    accountMode = 'email-block';
    assert.equal((await run()).statusCode, 429);
    assert.deepEqual(callOrder.splice(0), ['begin', 'fence', 'load', 'bcrypt', 'commit', 'release']);
    accountMode = 'success';
    const success = await run();
    assert.equal(success.statusCode, 200);
    assert.match(success.payload.tempToken, /^[a-f0-9]{64}$/);
    assert.equal(success.payload.userId, 17);
    assert.deepEqual(callOrder.splice(0), ['begin', 'fence', 'load', 'bcrypt', 'reserve', 'challenge', 'commit', 'release', 'mail']);
    assert.equal(mailCount, 1);
    assert.equal(challengeCount, 1);
});

test('actual login route: verified limiter failure does not reach account lookup', async () => {
    const db = new MockLoginDb();
    db.fault = 'throw';
    db.query = async () => { throw Error('Account lookup must not occur'); };
    const login = routeFixture(db).get('POST /login');
    const r = response();
    await login({ ...a, body: { username: 'test', password: 'test' } }, r);
    assert.equal(r.statusCode, 500);
    assert.deepEqual(r.payload, { error: 'DATABASE_ERROR' });
    assert.equal(db.rollbacks, 1);
});

test('actual reset route: generic response, fallback, Origin denial, and commits preserved', async () => {
    const db = new MockResetDb();
    let commits = 0;
    let releases = 0;
    let acquisitions = 0;
    let lookups = 0;
    let originAllowed = true;
    const pool = { getConnection: async () => {
        acquisitions++;
        const c = db.connection();
        return {
            beginTransaction: async () => {}, commit: async () => { commits++; },
            rollback: async () => {}, release: () => { releases++; },
            query: async (sql, args) => {
                if (sql.startsWith('SELECT UserID FROM UsersT')) { lookups++; return [[]]; }
                return c.query(sql, args);
            }
        };
    } };
    const forgot = routeFixture(pool, { '../services/browserSession': {
        requireOrigin: () => { if (!originAllowed) throw Error('origin'); }
    } }).get('POST /forgot-password');
    const message = { message: 'If an account matches, password reset instructions will be sent.' };
    const run = async (request, email) => {
        const r = response();
        await forgot({ ...request, body: { email } }, r);
        return r;
    };
    for (let i = 0; i < 21; i++) {
        const r = await run(missing, `unknown${i}@example.invalid`);
        assert.deepEqual(r.payload, message);
        assert.equal(r.statusCode, 200);
        assert.equal(r.headers['Cache-Control'], 'no-store');
    }
    for (let i = 0; i < 21; i++) {
        const r = await run(a, `verified${i}@example.invalid`);
        assert.deepEqual(r.payload, message);
        assert.equal(r.statusCode, 200);
    }
    assert.equal(lookups, 41, '21 unverified and 20 verified reach account lookup');
    assert.equal(commits, 42);
    assert.equal(releases, 42);
    originAllowed = false;
    assert.equal((await run(a, 'blocked@example.invalid')).statusCode, 403);
    assert.equal(acquisitions, 42);
});

test('login IP cleanup uses indexed 48-hour predicate and bounded batches; failure reported safely', async () => {
    const quiet = { info() {}, error() {} };
    let calls = 0;
    const result = await cleanup.cleanupLoginIpOnce({ query: async sql => {
        calls++;
        assert.match(sql, /UpdatedAt < DATE_SUB\(UTC_TIMESTAMP\(\), INTERVAL 48 HOUR\)/);
        assert.match(sql, /ORDER BY UpdatedAt ASC LIMIT 250/);
        return [{ affectedRows: 250 }];
    } }, quiet);
    assert.deepEqual(result, { ok: true, deleted: 3000, batches: 12 });
    assert.equal(calls, 12);
    const failure = await cleanup.cleanupLoginIpOnce({ query: async () => { throw Error('synthetic'); } }, quiet);
    assert.equal(failure.ok, false);
});

test('actual Node HTTP rawHeaders: verified single header accepted, duplicate and missing header rejected', async () => {
    const http = require('node:http');
    // This is an isolated loopback transport fixture, not the WA server or an
    // assertion that a real ingress is trustworthy.
    const server = http.createServer((incoming, outgoing) => {
        outgoing.setHeader('Content-Type', 'application/json');
        outgoing.end(JSON.stringify({ identity: ipService.verifiedClientIp(incoming, flag) }));
    });
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    try {
        const port = server.address().port;
        const call = headers => new Promise((resolve, reject) => {
            const request = http.request({ hostname: '127.0.0.1', port, headers, agent: false }, response => {
                let body = '';
                response.setEncoding('utf8');
                response.on('data', chunk => { body += chunk; });
                response.on('end', () => {
                    try { resolve(JSON.parse(body).identity); }
                    catch (error) { reject(error); }
                });
                response.on('error', reject);
            });
            request.on('error', reject);
            request.end();
        });
        assert.equal(await call({ 'CF-Connecting-IP': '192.0.2.10', 'X-Forwarded-For': '203.0.113.77' }), '192.0.2.10');
        assert.equal(await call({ 'CF-Connecting-IP': ['192.0.2.10', '192.0.2.11'] }), null);
        assert.equal(await call({ 'X-Forwarded-For': '192.0.2.10' }), null);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('actual login route: 40 unverified unknown names retain generic response without IP counter writes', async () => {
    const db = new MockLoginDb();
    let lookups = 0;
    db.query = async () => { lookups++; return [[]]; };
    const login = routeFixture(db).get('POST /login');
    for (let i = 0; i < 40; i++) {
        const r = response();
        await login({ ...missing, body: { username: `synthetic-${i}`, password: 'test-only' } }, r);
        assert.equal(r.statusCode, 401);
        assert.equal(r.payload.error, 'Invalid credentials or login temporarily restricted. Please try again later.');
    }
    assert.equal(lookups, 40);
    assert.equal(db.acquisitions, 0);
    assert.equal(db.rows.size, 0);
});
