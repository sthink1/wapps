'use strict';

// Reproducible, network-isolated (loopback only) test of the delivered handlers.
// Does not import .env, start WA, use real accounts, send mail or connect to SQL.
// Actual route/service source is executed; Express registration, bcrypt, JWT,
// session/consent services and the SQL engine are test doubles. InnoDB and
// actual Express integration are separate acceptance gates.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const http = require('node:http');

const root = path.resolve(__dirname, '..');
const fenceArg = process.argv.indexOf('--fence');
const fencePath = fenceArg < 0 ? path.join(root, 'services', 'credentialFence.js') : process.argv[fenceArg + 1];
const fenceSource = fs.readFileSync(fencePath, 'utf8');
const expectedFenceHash = '7cf2c7c48bb6cd8aa947f54347f527d1e5342f2aa49840aa4081737e8fca6ba7';
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fencePath)).digest('hex'), expectedFenceHash,
    'Unchanged credentialFence.js differs from reviewed baseline; reconcile before testing.');
const SYNTHETIC_SECRET = 'offline-test-only-never-use-in-wa';
const START = 1800000000;
const ACCOUNT_PASSWORD = 'SyntheticPassword!';
const WRONG_PASSWORD = 'WrongSyntheticPassword!';
const BASE_ACCOUNT = {
    UserID: 1, UserName: 'alpha', Email: 'alpha@example.invalid', PasswordHash: 'fake-hash-a', SecurityVersion: 1
};
const SECOND_ACCOUNT = {
    UserID: 2, UserName: 'beta', Email: 'beta@example.invalid', PasswordHash: 'fake-hash-b', SecurityVersion: 1
};
const INVALID_LOGIN = 'Invalid credentials or login temporarily restricted. Please try again later.';
const INVALID_CODE = 'Invalid verification request. Please log in again.';
const WRONG_CODE = 'Invalid verification code. Please try again.';
const EXHAUSTED_CODE = 'Maximum verification attempts reached. Please return to Login to request a new verification code.';
const EXPIRED_CODE = 'Your verification code has expired. Please log in again.';
const nativeFields = { deviceId: 'synthetic-device', platform: 'Android', appVersion: 'test', versionCode: 1 };
const sql = value => value.replace(/\s+/g, ' ').trim();
const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trimEnd();
const keyFor = id => crypto.createHmac('sha256', SYNTHETIC_SECRET).update(`login-rate-v1|${id}`).digest('hex');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const rows = result => [structuredClone(result), []];
const affected = count => [{ affectedRows: count }, []];

class SimulatedDatabase {
    constructor() {
        this.now = START;
        this.state = {
            accounts: [structuredClone(BASE_ACCOUNT), structuredClone(SECOND_ACCOUNT)],
            rates: {}, challenges: [], webSessions: [], nativeRefresh: [], nativeUsers: [], devices: [], consents: [], nextID: 1
        };
        this.emails = [];
        this.logs = [];
        this.comparisons = 0;
        this.poolReads = 0;
        this.commits = 0;
        this.rollbacks = 0;
        this.openConnections = 0;
        this.queue = Promise.resolve();
        this.fail = null;
        this.zero = null;
        this.failMail = false;
        this.expireOnWrite = false;
        this.entitlement = { created: false, status: { active: true } };
        this.pool = {
            query: (query, params = []) => this.read(query, params),
            getConnection: async () => {
                this.inject('getConnection');
                this.openConnections++;
                return new SimulatedConnection(this);
            }
        };
    }

    inject(label) {
        if (this.fail && label.includes(this.fail)) {
            this.fail = null;
            throw new Error('SYNTHETIC_PRIVATE_DIAGNOSTIC');
        }
    }

    takeZero(label) {
        if (this.zero && label.includes(this.zero)) {
            this.zero = null;
            return true;
        }
        return false;
    }

    async acquire() {
        // Deliberately conservative global simulator lock; acquired ONLY when
        // the real credentialFence.js issues its account FOR UPDATE query.
        // This cannot prove real per-account InnoDB locking or deadlock behavior.
        let release;
        const previous = this.queue;
        this.queue = new Promise(resolve => { release = resolve; });
        await previous;
        return release;
    }

    active(challenge) {
        return challenge.IsVerified === 0 && challenge.ExpiresAt > this.now;
    }

    async read(query, params) {
        const q = sql(query);
        this.poolReads++;
        this.inject(q);
        if (q === 'SELECT UserID FROM UsersT WHERE UserName = ? LIMIT 1') {
            assert.equal(typeof params[0], 'string');
            return rows(this.state.accounts.filter(a => normalize(a.UserName) === normalize(params[0]))
                .map(a => ({ UserID: a.UserID })));
        }
        if (q.startsWith('SELECT VerificationID, UserID FROM LoginVerificationT')) {
            assert.equal(params.length, 1);
            assert.equal(q, 'SELECT VerificationID, UserID FROM LoginVerificationT WHERE TempToken = ? AND IsVerified = 0 ORDER BY VerificationID DESC LIMIT 1');
            const candidates = this.state.challenges.filter(c => c.TempToken === params[0] &&
                c.IsVerified === 0).sort((a, b) => b.VerificationID - a.VerificationID);
            return rows(candidates.slice(0, 1).map(c => ({ VerificationID: c.VerificationID, UserID: c.UserID })));
        }
        if (q.startsWith('SELECT VersionCode, VersionName, MinimumSupportedVersionCode,')) {
            return rows([{ VersionCode: 1, VersionName: 'test', DownloadUrl: 'https://example.invalid/test.apk' }]);
        }
        throw new Error(`Unexpected pool SQL: ${q}`);
    }

    rate(id = 1) {
        const row = this.state.rates[keyFor(id)];
        return row && {
            failures: JSON.parse(row.PasswordFailures), issuances: JSON.parse(row.EmailIssuances)
        };
    }

    challenge(token) {
        const challenge = this.state.challenges.find(c => c.TempToken === token);
        assert.ok(challenge, 'Expected synthetic challenge');
        return challenge;
    }
}

class SimulatedConnection {
    constructor(db) {
        this.db = db;
        this.begun = false;
        this.unlock = null;
        this.account = null;
        this.state = null;
        this.released = false;
    }

    async beginTransaction() {
        this.db.inject('beginTransaction');
        assert.equal(this.begun, false);
        this.begun = true;
    }

    async commit() {
        this.db.inject('commit');
        assert.ok(this.begun && this.unlock, 'Transaction did not lock credential fence');
        this.db.state = this.state;
        this.db.commits++;
        this.finish();
    }

    async rollback() {
        if (this.begun) this.db.rollbacks++;
        this.finish();
    }

    finish() {
        if (this.unlock) this.unlock();
        this.unlock = null;
        this.begun = false;
        this.state = null;
    }

    release() {
        assert.equal(this.begun, false, 'Leaked active transaction');
        assert.equal(this.released, false, 'Duplicate release');
        this.released = true;
        this.db.openConnections--;
    }

    async query(query, params = []) {
        const q = sql(query);
        assert.ok(this.begun, 'SQL outside transaction');
        this.db.inject(q);
        if (q === 'SELECT SecurityVersion FROM UserSecurityT WHERE UserID=? FOR UPDATE') {
            assert.equal(this.unlock, null, 'Unexpected lock order');
            this.unlock = await this.db.acquire();
            this.state = structuredClone(this.db.state);
            this.account = params[0];
            return rows(this.state.accounts.filter(a => a.UserID === this.account)
                .map(a => ({ SecurityVersion: a.SecurityVersion })));
        }
        assert.ok(this.unlock, `Sensitive SQL before fence lock: ${q}`);
        const account = this.state.accounts.find(a => a.UserID === this.account);
        if (q.startsWith('SELECT UserID, UserName, Email, PasswordHash FROM UsersT')) {
            assert.equal(params[0], this.account);
            return rows(account && normalize(account.UserName) === normalize(params[1]) ? [account] : []);
        }
        if (q.startsWith('INSERT INTO LoginRateT ')) {
            assert.equal(params[0], keyFor(this.account));
            if (!this.state.rates[params[0]]) this.state.rates[params[0]] = {
                PasswordFailures: '[]', EmailIssuances: '[]', UpdatedAt: this.db.now
            };
            return affected(1);
        }
        if (q.startsWith('SELECT PasswordFailures, EmailIssuances FROM LoginRateT')) {
            assert.equal(params[0], keyFor(this.account));
            assert.ok(q.endsWith('FOR UPDATE'));
            return rows(this.state.rates[params[0]] ? [this.state.rates[params[0]]] : []);
        }
        if (q === 'SELECT UNIX_TIMESTAMP() AS NowEpoch') return rows([{ NowEpoch: this.db.now }]);
        if (q.startsWith('UPDATE LoginRateT SET PasswordFailures')) {
            assert.equal(params[2], keyFor(this.account));
            if (this.db.takeZero(q)) return affected(0);
            this.state.rates[params[2]] = { PasswordFailures: params[0], EmailIssuances: params[1], UpdatedAt: this.db.now };
            return affected(1);
        }
        if (q.startsWith('INSERT INTO LoginVerificationT ')) {
            const [UserID, VerificationCode, TempToken, SecurityVersion] = params;
            assert.equal(UserID, this.account);
            assert.equal(SecurityVersion, account.SecurityVersion);
            assert.match(VerificationCode, /^[1-9]\d{5}$/);
            assert.match(TempToken, /^[0-9a-f]{64}$/);
            assert.ok(q.includes('DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE)') && q.includes('FailedAttempts'));
            this.state.challenges.push({ VerificationID: this.state.nextID++, UserID, VerificationCode, TempToken,
                SecurityVersion, FailedAttempts: 0, IsVerified: 0, ExpiresAt: this.db.now + 600 });
            return affected(1);
        }
        if (q.startsWith('SELECT VerificationID, UserID, TempToken, SecurityVersion, VerificationCode, FailedAttempts,')) {
            assert.equal(q, 'SELECT VerificationID, UserID, TempToken, SecurityVersion, VerificationCode, FailedAttempts, (ExpiresAt > UTC_TIMESTAMP()) AS IsActive FROM LoginVerificationT WHERE VerificationID = ? AND IsVerified = 0 FOR UPDATE');
            const challenge = this.state.challenges.find(c => c.VerificationID === params[0] && c.IsVerified === 0);
            return rows(challenge ? [{ ...challenge, IsActive: Number(this.db.active(challenge)) }] : []);
        }
        if (q.startsWith('UPDATE LoginVerificationT SET FailedAttempts = FailedAttempts + 1')) {
            const [id, previous, version] = params;
            const c = this.state.challenges.find(c => c.VerificationID === id);
            assert.equal(c.UserID, this.account);
            if (this.db.expireOnWrite) this.db.now = c.ExpiresAt;
            if (!this.db.active(c) || c.FailedAttempts !== previous || c.SecurityVersion !== version) return affected(0);
            c.FailedAttempts++;
            return affected(1);
        }
        if (q.startsWith('UPDATE LoginVerificationT SET IsVerified = 1')) {
            const [id, limit, version] = params;
            const c = this.state.challenges.find(c => c.VerificationID === id);
            assert.equal(c.UserID, this.account);
            if (this.db.expireOnWrite) this.db.now = c.ExpiresAt;
            if (!this.db.active(c) || c.FailedAttempts >= limit || c.SecurityVersion !== version) return affected(0);
            c.IsVerified = 1;
            return affected(1);
        }
        if (q === 'SELECT UserID, UserName FROM UsersT WHERE UserID = ? LIMIT 1' ||
            q === 'SELECT UserID, UserName, Email FROM UsersT WHERE UserID = ? LIMIT 1') {
            assert.equal(params[0], this.account);
            return rows(account ? [account] : []);
        }
        if (q.startsWith('INSERT INTO TNNAUserT ')) {
            assert.equal(params[0], this.account);
            this.state.nativeUsers.push({ userID: params[0], optIn: params[1] });
            return affected(1);
        }
        if (q.startsWith('INSERT INTO TNNADeviceT ')) {
            assert.equal(params[1], this.account);
            this.state.devices.push({ deviceID: params[0], userID: params[1], platform: params[2] });
            return affected(1);
        }
        if (q.startsWith('INSERT INTO TNNARefreshTokenT ')) {
            assert.equal(params[0], this.account);
            assert.match(params[2], /^[0-9a-f]{64}$/);
            this.state.nativeRefresh.push({ userID: params[0], deviceID: params[1], tokenHash: params[2] });
            return affected(1);
        }
        throw new Error(`Unexpected transaction SQL: ${q}`);
    }
}

function loadApplication(db) {
    const handlers = new Map();
    const processDouble = { env: { JWT_SECRET: SYNTHETIC_SECRET }, exit() { throw new Error('Unexpected process.exit'); } };
    const log = { error: (...args) => db.logs.push(args.join(' ')), log: () => {}, warn: () => {} };
    const compile = (source, filename, resolve) => {
        const module = { exports: {} };
        const fn = vm.runInThisContext(`(function(require,module,exports,process,console){\n${source}\n})`, { filename });
        fn(resolve, module, module.exports, processDouble, log);
        return module.exports;
    };
    const fence = compile(fenceSource, fencePath, name => { throw new Error(`Unexpected fence dependency: ${name}`); });
    const common = name => {
        if (name === 'crypto' || name === 'node:crypto') return crypto;
        if (name === './credentialFence' || name === '../services/credentialFence') return fence;
        throw new Error(`Unexpected common dependency: ${name}`);
    };
    const limiter = compile(fs.readFileSync(path.join(root, 'services/loginLimiter.js'), 'utf8'), 'loginLimiter.js', common);
    const verification = compile(fs.readFileSync(path.join(root, 'services/loginVerification.js'), 'utf8'), 'loginVerification.js', common);
    const chain = new Proxy(() => chain, { get: () => chain });
    const sessions = {
        create: async (c, user, keep) => {
            db.inject('sessions.create');
            assert.equal(c.account, user.UserID);
            assert.ok(c.state.challenges.some(ch => ch.UserID === user.UserID && ch.IsVerified === 1));
            c.state.webSessions.push({ userID: user.UserID, keep });
            return { token: 'synthetic-web-access', refresh: keep ? { secret: 'synthetic-cookie', expires: 123 } : null };
        },
        setCookie: res => res.set('Set-Cookie', 'synthetic=1; HttpOnly; SameSite=Lax'),
        clearCookie: res => res.set('Set-Cookie', 'synthetic=; Max-Age=0'),
        securityVersion: async () => 1
    };
    function resolver(prefix, name) {
        switch (name) {
            case 'express': return { Router() {
                const r = {};
                for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
                    r[method] = (route, ...callbacks) => handlers.set(`${method.toUpperCase()} ${prefix}${route}`, callbacks.at(-1));
                }
                return r;
            } };
            case 'express-validator': return { body: chain, validationResult: () => ({ isEmpty: () => true }) };
            case '../dbConnection': return { pool: db.pool };
            case 'bcrypt': return { compare: async (supplied, stored) => {
                db.comparisons++;
                db.inject('bcrypt.compare');
                // Yield to permit concurrent requests to contend for the fence.
                await new Promise(resolve => setImmediate(resolve));
                assert.ok(['fake-hash-a', 'fake-hash-b'].includes(stored));
                return supplied === ACCOUNT_PASSWORD;
            } };
            case 'jsonwebtoken': return { sign: (claims, secret, options) => {
                assert.equal(claims.client, 'tnna');
                assert.equal(secret, SYNTHETIC_SECRET);
                assert.equal(claims.securityVersion, 1);
                assert.equal(options.expiresIn, '8h');
                return 'synthetic-native-access';
            } };
            case '../utils': return { handleDbError: (_error, res, message) => res.status(500).json({ error: message }) };
            case '../send_email': return { sendVerificationCode: async mail => {
                // Ensure challenge and reservation are committed before external effect.
                assert.ok(db.state.challenges.some(c => c.VerificationCode === mail.verificationCode &&
                    db.state.accounts.find(a => a.UserID === c.UserID).Email === mail.email));
                db.emails.push(mail);
                if (db.failMail) throw new Error('SYNTHETIC_PRIVATE_DIAGNOSTIC');
            } };
            case '../services/browserSession': return sessions;
            case '../services/stage6ExpectedClientError': return { isExpectedClientError: () => false };
            case '../services/credentialFence': return fence;
            case '../services/loginLimiter': return limiter;
            case '../services/loginVerification': return verification;
            case '../middleware/auth': return () => {};
            case '../services/subscriptionService': return { getOrCreateDevelopmentTrial: async () => db.entitlement };
            case '../services/notificationService': return {
                getActiveConsentVersion: async () => 1,
                logConsent: async (c, entry) => { db.inject('logConsent'); c.state.consents.push(entry); }
            };
            case '../services/passwordResetLimiter': return {};
            case '../services/passwordResetClientIp': return { clientIpForReset: () => 'unused' };
            case 'dotenv': return { config() {} };
            case 'crypto': return crypto;
            default: throw new Error(`Unexpected route dependency: ${name}`);
        }
    }
    for (const name of ['users', 'tnna']) {
        const filename = path.join(root, 'routes', `${name}.js`);
        compile(fs.readFileSync(filename, 'utf8'), filename, dep => resolver(`/${name}`, dep));
    }
    return handlers;
}

async function start(db = new SimulatedDatabase()) {
    let handlers = loadApplication(db);
    const server = http.createServer(async (req, out) => {
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
            const handler = handlers.get(`${req.method} ${req.url}`);
            if (!handler) throw new Error('Unexpected test route');
            const res = {
                status(code) { out.statusCode = code; return this; },
                set(name, value) { out.setHeader(name, value); return this; },
                json(body) { out.setHeader('Content-Type', 'application/json'); out.end(JSON.stringify(body)); return this; }
            };
            await handler(req, res);
            if (!out.writableEnded) throw new Error('Handler did not respond');
        } catch (error) {
            db.logs.push(`TEST HARNESS ERROR: ${error.message}`);
            if (!out.writableEnded) { out.statusCode = 599; out.end(JSON.stringify({ error: 'Test harness exception' })); }
        }
    });
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    const url = `http://127.0.0.1:${server.address().port}`;
    async function post(endpoint, body, headers = {}) {
        const r = await fetch(url + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
        const result = { status: r.status, body: await r.json(), cookie: r.headers.get('Set-Cookie') };
        assert.notEqual(result.status, 599, db.logs.join('; '));
        assert.ok(!JSON.stringify(result).includes('SYNTHETIC_PRIVATE_DIAGNOSTIC'));
        return result;
    }
    return {
        db, post,
        login: (password = ACCOUNT_PASSWORD, username = 'alpha', headers = {}) => post('/users/login', { username, password }, headers),
        web: (token, code, keep = false) => post('/users/verify-code', { tempToken: token, verificationCode: code, keepMeLoggedIn: keep }),
        native: (token, code, extras = {}) => post('/tnna/verify-code', { tempToken: token, verificationCode: code, ...nativeFields, ...extras }),
        restartModules: () => { handlers = loadApplication(db); },
        close: async () => {
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
            assert.equal(db.openConnections, 0, 'Leaked SQL connection');
            assert.ok(!db.logs.some(l => l.startsWith('TEST HARNESS ERROR')), db.logs.join('; '));
        }
    };
}

function status(response, expected) {
    assert.equal(response.status, expected, JSON.stringify(response.body));
    return response.body;
}

async function issue(h, username = 'alpha') {
    const body = status(await h.login(ACCOUNT_PASSWORD, username), 200);
    const c = h.db.challenge(body.tempToken);
    assert.equal(c.FailedAttempts, 0);
    assert.equal(c.IsVerified, 0);
    assert.equal(c.ExpiresAt, h.db.now + 600);
    assert.equal(body.userId, c.UserID);
    assert.equal(body.message, 'Verification code sent to your email.');
    assert.ok(!Object.hasOwn(body, 'verificationCode') && !Object.hasOwn(body, 'token'));
    return { token: body.tempToken, code: c.VerificationCode };
}

const wrongCode = correct => correct === '111111' ? '222222' : '111111';
const cases = [];
const test = (name, fn) => cases.push([name, fn]);

test('WA login, six-digit challenge, 10-minute database-clock TTL, ordinary web success', async h => {
    const { token, code } = await issue(h);
    assert.equal(h.db.emails.length, 1);
    const r = await h.web(token, code);
    assert.deepEqual(status(r, 200), { message: 'Login successful', token: 'synthetic-web-access', redirectTo: 'home.html', subscription: { active: true } });
    assert.match(r.cookie, /Max-Age=0/);
    assert.deepEqual(h.db.state.webSessions, [{ userID: 1, keep: false }]);
    assert.equal(h.db.challenge(token).IsVerified, 1);
});
test('Keep Me Logged In is passed to unchanged web-session contract', async h => {
    const { token, code } = await issue(h);
    const r = await h.web(token, code, true);
    status(r, 200);
    assert.match(r.cookie, /HttpOnly/);
    assert.equal(h.db.state.webSessions[0].keep, true);
});
test('Subscription redirect and response shape retained', async h => {
    h.db.entitlement = { created: true, status: { active: false } };
    const { token, code } = await issue(h);
    assert.equal(status(await h.web(token, code), 200).redirectTo, 'subscription.html');
});
test('TNNA native success: consent, device, refresh hash and existing response contract', async h => {
    const { token, code } = await issue(h);
    const b = status(await h.native(token, code, { updateEmailOptIn: true }), 200);
    assert.equal(b.message, 'TNNA login successful');
    assert.equal(b.accessToken, 'synthetic-native-access');
    assert.match(b.refreshToken, /^[0-9a-f]{96}$/);
    assert.deepEqual(b.user, { userId: 1, username: 'alpha', email: 'alpha@example.invalid', updateEmailOptIn: true });
    assert.deepEqual(b.currentVersion, { versionCode: 1, versionName: 'test', downloadUrl: 'https://example.invalid/test.apk' });
    assert.equal(h.db.state.nativeRefresh[0].tokenHash, hash(b.refreshToken));
    assert.equal(h.db.state.consents[0].action, 'OPT_IN');
    assert.equal(h.db.state.devices[0].deviceID, nativeFields.deviceId);
    assert.equal(h.db.challenge(token).IsVerified, 1);
});
test('TNNA numeric legacy code accepted; opt-out preserved', async h => {
    const { token, code } = await issue(h);
    const b = status(await h.native(token, Number(code)), 200);
    assert.equal(b.user.updateEmailOptIn, false);
    assert.equal(h.db.state.consents[0].action, 'OPT_OUT');
});
test('Unknown, wrong and blocked usernames use identical generic 401 responses', async h => {
    const unknown = status(await h.login(WRONG_PASSWORD, 'nonexistent'), 401);
    assert.equal(unknown.error, INVALID_LOGIN);
    for (let i = 0; i < 5; i++) assert.deepEqual(status(await h.login(WRONG_PASSWORD), 401), unknown);
    assert.deepEqual(status(await h.login(ACCOUNT_PASSWORD), 401), unknown);
    assert.equal(h.db.comparisons, 5);
});
test('Malformed credential types are rejected before database access', async h => {
    for (const body of [{}, { username: [], password: 'x' }, { username: 'alpha', password: {} }, { username: 'x'.repeat(51), password: 'x' }]) {
        status(await h.post('/users/login', body), 401);
    }
    assert.equal(h.db.poolReads, 0);
    assert.equal(h.db.comparisons, 0);
});
test('Unknown usernames do not allocate persistent rate rows', async h => {
    for (const user of ['unknown1', 'unknown2', 'unknown3']) status(await h.login(WRONG_PASSWORD, user), 401);
    assert.equal(Object.keys(h.db.state.rates).length, 0);
    assert.equal(h.db.emails.length, 0);
});
test('Five failures persist and sixth password check is not performed', async h => {
    for (let i = 0; i < 5; i++) status(await h.login(WRONG_PASSWORD), 401);
    status(await h.login(), 401);
    assert.equal(h.db.rate().failures.length, 5);
    assert.equal(h.db.comparisons, 5);
    assert.equal(h.db.emails.length, 0);
});
test('Four wrong passwords then correct password permitted; failures not reset', async h => {
    for (let i = 0; i < 4; i++) status(await h.login(WRONG_PASSWORD), 401);
    await issue(h);
    assert.equal(h.db.rate().failures.length, 4);
    status(await h.login(WRONG_PASSWORD), 401);
    status(await h.login(), 401);
    assert.equal(h.db.rate().failures.length, 5);
});
test('Rolling password window: blocked at 899 seconds, released at 900', async h => {
    for (let i = 0; i < 5; i++) status(await h.login(WRONG_PASSWORD), 401);
    h.db.now += 899;
    status(await h.login(), 401);
    h.db.now++;
    await issue(h);
    assert.deepEqual(h.db.rate().failures, []);
});
test('Staggered rolling password window releases only the oldest failure', async h => {
    for (let i = 0; i < 5; i++) { status(await h.login(WRONG_PASSWORD), 401); h.db.now += 10; }
    h.db.now = START + 900;
    status(await h.login(WRONG_PASSWORD), 401);
    assert.deepEqual(h.db.rate().failures, [START + 10, START + 20, START + 30, START + 40, START + 900]);
    status(await h.login(), 401);
    assert.equal(h.db.comparisons, 6);
});
test('Database-resolved account identity prevents case/accent/space alias bypass (simulated collation)', async h => {
    for (const name of ['ALPHA', 'Alpha', 'álpha', 'alpha ', 'alpha']) status(await h.login(WRONG_PASSWORD, name), 401);
    status(await h.login(ACCOUNT_PASSWORD, 'ALPHA'), 401);
    assert.equal(Object.keys(h.db.state.rates).length, 1);
    assert.equal(h.db.comparisons, 5);
});
test('Account restriction does not block another account', async h => {
    for (let i = 0; i < 5; i++) status(await h.login(WRONG_PASSWORD), 401);
    const { token } = await issue(h, 'beta');
    assert.equal(h.db.challenge(token).UserID, 2);
    assert.equal(h.db.rate(1).failures.length, 5);
    assert.equal(h.db.rate(2).issuances.length, 1);
});
test('Three email issuances permitted; fourth returns 429 without sending or inserting', async h => {
    for (let i = 0; i < 3; i++) await issue(h);
    status(await h.login(), 429);
    assert.equal(h.db.state.challenges.length, 3);
    assert.equal(h.db.emails.length, 3);
    assert.equal(h.db.rate().issuances.length, 3);
});
test('Email rolling window independent of password failures and expires at 900 seconds', async h => {
    for (let i = 0; i < 3; i++) await issue(h);
    h.db.now += 899;
    status(await h.login(), 429);
    status(await h.login(WRONG_PASSWORD), 401);
    h.db.now++;
    await issue(h);
    assert.equal(h.db.rate().issuances.length, 1);
    assert.equal(h.db.rate().failures.length, 1);
});
test('Failed email delivery reserves quota and does not return a challenge token', async h => {
    h.db.failMail = true;
    for (let i = 0; i < 3; i++) assert.ok(!Object.hasOwn(status(await h.login(), 500), 'tempToken'));
    status(await h.login(), 429);
    assert.equal(h.db.emails.length, 3);
    assert.equal(h.db.rate().issuances.length, 3);
    assert.ok(!h.db.logs.join(' ').includes('SYNTHETIC_PRIVATE_DIAGNOSTIC'));
});
test('Challenge insert failure rolls back email reservation before external send', async h => {
    h.db.fail = 'INSERT INTO LoginVerificationT';
    status(await h.login(), 500);
    assert.equal(h.db.rate(), undefined);
    assert.equal(h.db.emails.length, 0);
    assert.equal(h.db.state.challenges.length, 0);
    await issue(h);
});
test('Unexpected zero affected rows on rate update fails closed', async h => {
    h.db.zero = 'UPDATE LoginRateT';
    status(await h.login(), 500);
    assert.equal(h.db.rate(), undefined);
    assert.equal(h.db.emails.length, 0);
});
test('Commit failure prevents email and rolls back synthetic rate state', async h => {
    h.db.fail = 'commit';
    status(await h.login(), 500);
    assert.equal(h.db.rate(), undefined);
    assert.equal(h.db.emails.length, 0);
    assert.equal(h.db.rollbacks, 1);
});
test('Database lookup and connection acquisition failures return safe 500', async h => {
    h.db.fail = 'SELECT UserID FROM UsersT';
    status(await h.login(), 500);
    h.db.fail = 'getConnection';
    status(await h.login(), 500);
    assert.equal(h.db.emails.length, 0);
});
test('Credential-fence unavailable or bcrypt failure prevents challenge', async h => {
    h.db.state.accounts[0].SecurityVersion = 0;
    status(await h.login(), 500);
    h.db.state.accounts[0].SecurityVersion = 1;
    h.db.fail = 'bcrypt.compare';
    status(await h.login(), 500);
    assert.equal(h.db.state.challenges.length, 0);
    assert.equal(h.db.rate(), undefined);
});
test('Five wrong web codes exhaust challenge; correct code subsequently rejected', async h => {
    const { token, code } = await issue(h);
    for (let i = 0; i < 5; i++) assert.equal(status(await h.web(token, wrongCode(code)), 401).error, i === 4 ? EXHAUSTED_CODE : WRONG_CODE);
    status(await h.web(token, code), 401);
    assert.equal(h.db.challenge(token).FailedAttempts, 5);
    assert.equal(h.db.challenge(token).IsVerified, 0);
    assert.equal(h.db.state.webSessions.length, 0);
});
test('Alternating WA and TNNA endpoints shares the same five-attempt counter', async h => {
    const { token, code } = await issue(h);
    for (let i = 0; i < 5; i++) {
        const submit = i % 2 ? h.native : h.web;
        assert.equal(status(await submit(token, wrongCode(code)), 401).error, i === 4 ? EXHAUSTED_CODE : WRONG_CODE);
        assert.equal(h.db.challenge(token).FailedAttempts, i + 1);
    }
    status(await h.native(token, code), 401);
    status(await h.web(token, code), 401);
    assert.equal(h.db.state.webSessions.length + h.db.state.nativeRefresh.length, 0);
});
test('Four wrong attempts followed by correct TNNA code succeeds', async h => {
    const { token, code } = await issue(h);
    for (let i = 0; i < 4; i++) status(await h.web(token, wrongCode(code)), 401);
    status(await h.native(token, code), 200);
    assert.equal(h.db.challenge(token).FailedAttempts, 4);
    assert.equal(h.db.challenge(token).IsVerified, 1);
});
test('Malformed nonempty code strings count as failed attempts on both endpoints', async h => {
    const { token } = await issue(h);
    status(await h.web(token, 'abc'), 401);
    status(await h.native(token, '1234567'), 401);
    assert.equal(h.db.challenge(token).FailedAttempts, 2);
});
test('Missing or malformed verification request fields cannot create sessions', async h => {
    const { token, code } = await issue(h);
    status(await h.post('/users/verify-code', { tempToken: token, verificationCode: {} }), 400);
    status(await h.post('/tnna/verify-code', { tempToken: token, verificationCode: code }), 400);
    assert.equal(h.db.challenge(token).FailedAttempts, 0);
    assert.equal(h.db.state.webSessions.length + h.db.state.nativeRefresh.length, 0);
});
test('Malformed, uppercase and unrelated token values cannot affect the real challenge', async h => {
    const { token, code } = await issue(h);
    for (const invalid of ['x', 'G'.repeat(64), ` ${token}`, crypto.randomBytes(32).toString('hex')]) status(await h.web(invalid, code), 401);
    assert.equal(h.db.challenge(token).FailedAttempts, 0);
    assert.equal(h.db.challenge(token).IsVerified, 0);
});
test('Expiry boundary at exactly 600 seconds rejects both client endpoints', async h => {
    const { token, code } = await issue(h);
    h.db.now += 600;
    status(await h.web(token, code), 401);
    status(await h.native(token, code), 401);
    assert.equal(h.db.challenge(token).FailedAttempts, 0);
});
test('Challenge remains usable immediately before expiry', async h => {
    const { token, code } = await issue(h);
    h.db.now += 599;
    status(await h.web(token, code), 200);
});
test('Security version change invalidates old code for both endpoints', async h => {
    const { token, code } = await issue(h);
    h.db.state.accounts[0].SecurityVersion++;
    status(await h.native(token, code), 401);
    status(await h.web(token, code), 401);
    assert.equal(h.db.challenge(token).FailedAttempts, 0);
    assert.equal(h.db.challenge(token).IsVerified, 0);
});
test('Consumed challenge cannot be replayed on either endpoint', async h => {
    const { token, code } = await issue(h);
    status(await h.web(token, code), 200);
    status(await h.web(token, code), 401);
    status(await h.native(token, code), 401);
    assert.equal(h.db.state.webSessions.length, 1);
    assert.equal(h.db.state.nativeRefresh.length, 0);
});
test('Twelve simultaneous wrong passwords run only five bcrypt comparisons (simulator)', async h => {
    const replies = await Promise.all(Array.from({ length: 12 }, () => h.login(WRONG_PASSWORD)));
    assert.ok(replies.every(r => r.status === 401));
    assert.equal(h.db.comparisons, 5);
    assert.equal(h.db.rate().failures.length, 5);
});
test('Twelve simultaneous correct passwords reserve exactly three emails (simulator)', async h => {
    const replies = await Promise.all(Array.from({ length: 12 }, () => h.login()));
    assert.equal(replies.filter(r => r.status === 200).length, 3);
    assert.equal(replies.filter(r => r.status === 429).length, 9);
    assert.equal(h.db.emails.length, 3);
    assert.equal(h.db.state.challenges.length, 3);
});
test('Concurrent wrong-code submissions across both endpoints saturate at five (simulator)', async h => {
    const { token, code } = await issue(h);
    const replies = await Promise.all(Array.from({ length: 12 }, (_, i) => (i % 2 ? h.web : h.native)(token, wrongCode(code))));
    assert.ok(replies.every(r => r.status === 401));
    assert.equal(h.db.challenge(token).FailedAttempts, 5);
    assert.equal(h.db.state.webSessions.length + h.db.state.nativeRefresh.length, 0);
});
test('Simultaneous correct web and native verification issues exactly one session (simulator)', async h => {
    const { token, code } = await issue(h);
    const replies = await Promise.all([h.web(token, code), h.native(token, code)]);
    assert.deepEqual(replies.map(r => r.status).sort(), [200, 401]);
    assert.equal(h.db.state.webSessions.length + h.db.state.nativeRefresh.length, 1);
});
test('Verification attempt update database failure rolls back and returns safe error', async h => {
    const { token, code } = await issue(h);
    h.db.fail = 'UPDATE LoginVerificationT SET FailedAttempts';
    status(await h.web(token, wrongCode(code)), 500);
    assert.equal(h.db.challenge(token).FailedAttempts, 0);
    status(await h.web(token, wrongCode(code)), 401);
    assert.equal(h.db.challenge(token).FailedAttempts, 1);
});
test('Web-session creation failure rolls back consumption; retry can succeed', async h => {
    const { token, code } = await issue(h);
    h.db.fail = 'sessions.create';
    status(await h.web(token, code), 500);
    assert.equal(h.db.challenge(token).IsVerified, 0);
    assert.equal(h.db.state.webSessions.length, 0);
    status(await h.web(token, code), 200);
});
test('TNNA device failure rolls back challenge, consent, native user and token writes', async h => {
    const { token, code } = await issue(h);
    h.db.fail = 'INSERT INTO TNNADeviceT';
    status(await h.native(token, code), 500);
    assert.equal(h.db.challenge(token).IsVerified, 0);
    assert.equal(h.db.state.nativeUsers.length + h.db.state.consents.length + h.db.state.nativeRefresh.length, 0);
    status(await h.native(token, code), 200);
});
test('Challenge expiry during locked verification write cannot issue a session', async h => {
    const { token, code } = await issue(h);
    h.db.expireOnWrite = true;
    status(await h.web(token, code), 401);
    assert.equal(h.db.challenge(token).IsVerified, 0);
    assert.equal(h.db.state.webSessions.length, 0);
});
test('Reloading actual modules does not reset persisted mock database counters', async h => {
    const { token, code } = await issue(h);
    for (let i = 0; i < 4; i++) status(await h.web(token, wrongCode(code)), 401);
    for (let i = 0; i < 5; i++) status(await h.login(WRONG_PASSWORD), 401);
    h.restartModules();
    status(await h.login(), 401);
    status(await h.native(token, wrongCode(code)), 401);
    status(await h.web(token, code), 401);
    assert.equal(h.db.rate().failures.length, 5);
    assert.equal(h.db.challenge(token).FailedAttempts, 5);
});
test('Changing forwarded headers does not change account identity or limit', async h => {
    for (let i = 0; i < 5; i++) status(await h.login(WRONG_PASSWORD, 'alpha', { 'X-Forwarded-For': `192.0.2.${i + 1}`, 'CF-Connecting-IP': `198.51.100.${i + 1}` }), 401);
    status(await h.login(ACCOUNT_PASSWORD, 'alpha', { 'True-Client-IP': '203.0.113.22' }), 401);
    assert.equal(h.db.comparisons, 5);
    assert.equal(Object.keys(h.db.state.rates).length, 1);
});
test('Corrupt persisted JSON or invalid future timestamp fails closed', async h => {
    status(await h.login(WRONG_PASSWORD), 401);
    const key = keyFor(1);
    h.db.state.rates[key].PasswordFailures = 'invalid JSON';
    status(await h.login(), 500);
    h.db.state.rates[key].PasswordFailures = JSON.stringify([h.db.now + 1]);
    status(await h.login(), 500);
    assert.equal(h.db.emails.length, 0);
});
test('Counters contain HMAC account keys and timestamps only, no username/password/IP', async h => {
    status(await h.login(WRONG_PASSWORD, 'alpha', { 'X-Forwarded-For': '192.0.2.1' }), 401);
    await issue(h);
    const serialized = JSON.stringify(h.db.state.rates);
    for (const value of ['alpha', ACCOUNT_PASSWORD, WRONG_PASSWORD, 'fake-hash-a', '192.0.2.1']) assert.ok(!serialized.includes(value));
    assert.deepEqual(Object.keys(h.db.state.rates), [keyFor(1)]);
    assert.deepEqual(h.db.rate(), { failures: [START], issuances: [START] });
});
test('Separate issued challenge remains valid; exhaustion is challenge-specific', async h => {
    const first = await issue(h);
    const second = await issue(h);
    for (let i = 0; i < 5; i++) status(await h.web(first.token, wrongCode(first.code)), 401);
    status(await h.web(first.token, first.code), 401);
    status(await h.native(second.token, second.code), 200);
});
test('Password throttling does not revoke existing session or prevent valid issued code', async h => {
    const first = await issue(h);
    status(await h.web(first.token, first.code, true), 200);
    const second = await issue(h);
    for (let i = 0; i < 5; i++) status(await h.login(WRONG_PASSWORD), 401);
    status(await h.login(), 401);
    assert.deepEqual(h.db.state.webSessions, [{ userID: 1, keep: true }]);
    status(await h.native(second.token, second.code), 200);
    assert.equal(h.db.state.webSessions.length, 1);
});

test('Exhausted challenge returns same message for correct and incorrect code on both endpoints', async h => {
    const { token, code } = await issue(h);
    for (let i = 0; i < 5; i++) await h.web(token, wrongCode(code));
    for (const submit of [h.web, h.native]) {
        for (const supplied of [code, wrongCode(code)]) {
            assert.deepEqual(status(await submit(token, supplied), 401), { error: EXHAUSTED_CODE });
        }
    }
    assert.equal(h.db.challenge(token).FailedAttempts, 5);
    assert.equal(h.db.state.webSessions.length + h.db.state.nativeRefresh.length, 0);
});
test('Expired challenge returns expiry message independent of supplied code', async h => {
    const { token, code } = await issue(h);
    h.db.now += 600;
    for (const submit of [h.web, h.native]) {
        for (const supplied of [code, wrongCode(code)]) {
            assert.deepEqual(status(await submit(token, supplied), 401), { error: EXPIRED_CODE });
        }
    }
    assert.equal(h.db.challenge(token).FailedAttempts, 0);
});
test('Unknown and consumed tokens return generic message on both endpoints', async h => {
    const { token, code } = await issue(h);
    status(await h.web(token, code), 200);
    for (const submit of [h.web, h.native]) {
        for (const t of [token, 'f'.repeat(64), 'malformed']) {
            assert.deepEqual(status(await submit(t, code), 401), { error: INVALID_CODE });
        }
    }
});
test('Security version mismatch cannot disclose exhausted or expired state', async h => {
    const { token, code } = await issue(h);
    h.db.challenge(token).FailedAttempts = 5;
    h.db.now += 600;
    h.db.state.accounts[0].SecurityVersion++;
    for (const submit of [h.web, h.native]) {
        assert.deepEqual(status(await submit(token, code), 401), { error: INVALID_CODE });
    }
});
test('Concurrent fifth failures yield exhausted message and saturate counter', async h => {
    const { token, code } = await issue(h);
    for (let i = 0; i < 4; i++) await h.web(token, wrongCode(code));
    const replies = await Promise.all([h.web(token, wrongCode(code)), h.native(token, wrongCode(code))]);
    for (const reply of replies) assert.deepEqual(status(reply, 401), { error: EXHAUSTED_CODE });
    assert.equal(h.db.challenge(token).FailedAttempts, 5);
});

(async () => {
    console.log(`WA authentication abuse controls | Node ${process.version}`);
    console.log('Real delivered route/service/fence code; loopback HTTP, simulated SQL and external dependencies.');
    let passed = 0;
    let failed = 0;
    for (const [name, fn] of cases) {
        let h;
        let error;
        try { h = await start(); await fn(h); } catch (err) { error = err; }
        finally { if (h) { try { await h.close(); } catch (err) { error ||= err; } } }
        if (error) { failed++; console.error(`FAIL ${name}\n${error.stack}`); }
        else { passed++; console.log(`PASS ${name}`); }
    }
    console.log(`RESULT: ${passed} passed, ${failed} failed, ${cases.length} cases.`);
    if (failed) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
