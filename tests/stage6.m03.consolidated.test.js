'use strict';

// Consolidated source-backed M03 acceptance: no WA DB/server or external calls.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const projectRoot = path.resolve(__dirname, '..');
const source = filename => fs.readFileSync(path.join(projectRoot, filename), 'utf8');
const PRIV = 202;
const OTHER = 303;
const PUBLIC = 101;
const code = 'SYNTHETIC-ONLY-CODE';
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
const capability = n => String(n).repeat(64);

function fixture(options = {}) {
    const privateIDs = new Set(options.privateIDs ?? [PRIV, OTHER]);
    const memberships = new Map([[PRIV, 20], [OTHER, 10], [PUBLIC, 20], [404, 10]]);
    const unlocked = new Set();
    const attempts = [];
    const deniedWrites = [];
    const routes = new Map();
    const connection = {
        query: (...args) => pool.query(...args),
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release() {}
    };
    const pool = {
        async getConnection() { return connection; },
        async query(sql, args = []) {
            if (sql.includes('SELECT DISTINCT p.PersonID FROM FTPersonPrivacyT p')) {
                return [[...privateIDs].filter(id => args.includes(memberships.get(id))).map(PersonID => ({ PersonID }))];
            }
            if (sql.includes('FROM FTPersonPrivacyT WHERE IsPrivate=1')) {
                return [[...privateIDs].filter(id => args.includes(id)).map(PersonID => ({ PersonID }))];
            }
            if (sql.includes('FROM FTPrivacyUnlockT') && sql.includes('ExpiresAt>NOW()')) {
                return [unlocked.has(`${args[0]}:${args[1]}:${args[2]}`) ? [{ yes: 1 }] : []];
            }
            if (sql.includes('JOIN FTFamilyTreeUserT u')) {
                return [[{ FamilyTreeID: 10, FamilyTreeCode: 'FT-SOURCE' }]];
            }
            if (sql.includes('SELECT ft.FamilyTreeID,ft.MergedIntoFamilyTreeID FROM FTFamilyTreePersonT ftp')) {
                return [[{ FamilyTreeID: 20 }]];
            }
            if (sql.includes('SELECT 1 AS n FROM FTFamilyTreePersonT') && sql.includes('IN (?,?)')) {
                return [args.slice(1).includes(memberships.get(args[0])) ? [{ n: 1 }] : []];
            }
            if (sql.includes('SELECT PersonID,IsPrivate FROM FTPersonPrivacyT')) {
                return [[{ PersonID: args[0], IsPrivate: privateIDs.has(args[0]) ? 1 : 0 }]];
            }
            if (sql.includes('COUNT(*) AS n FROM FTPrivacyAttemptT')) {
                return [[{ n: options.rateLimit ? 5 : attempts.filter(x => x.personId === args[0] && x.userId === args[1] && !x.correct).length }]];
            }
            if (sql.includes('SELECT KeyCode FROM FTPersonPrivacyT')) {
                return [[privateIDs.has(args[0]) ? { KeyCode: code } : null]];
            }
            if (sql.includes('INSERT INTO FTPrivacyAttemptT')) {
                attempts.push({ personId: args[0], userId: args[1], correct: args[2] === 1 });
                return [{ affectedRows: 1 }];
            }
            if (sql.includes('DELETE FROM FTPrivacyUnlockT')) {
                [...unlocked].filter(x => x.startsWith(`${args[0]}:${args[1]}:`)).forEach(x => unlocked.delete(x));
                return [{ affectedRows: 1 }];
            }
            if (sql.includes('INSERT INTO FTPrivacyUnlockT')) {
                unlocked.add(`${args[0]}:${args[1]}:${args[2]}`);
                return [{ affectedRows: 1 }];
            }
            deniedWrites.push(sql);
            throw new Error(`Unmocked DB query: ${sql}`);
        }
    };
    const express = { Router: () => ({
        get(route, cb) { routes.set(`GET ${route}`, cb); },
        post(route, cb) { routes.set(`POST ${route}`, cb); }
    }) };
    const sandbox = {
        module: { exports: {} }, exports: {}, console: { error() {} }, process: { env: {} },
        require(name) {
            switch (name) {
                case 'express': return express;
                case 'crypto': return crypto;
                case '../dbConnection': return { pool };
                case '../services/notificationService': return { sendNotification() {} };
                case '../services/stage6ExpectedClientError': return { markExpectedClientError: e => e, isExpectedClientError: e => Boolean(e && e.status && e.status < 500) };
                case '../services/administratorAccess': return { isVerifiedAdministrator: ({ userId }) => userId === 1 };
                default: throw new Error(`Unexpected require: ${name}`);
            }
        }
    };
    vm.runInNewContext(source('routes/ftPrivacy.js'), sandbox, { filename: 'routes/ftPrivacy.js' });
    function grant(id, user = 7, token = capability(id === PRIV ? 2 : 3)) {
        unlocked.add(`${id}:${user}:${hash(token)}`);
        return token;
    }
    function response() {
        const sent = [];
        const res = {
            statusCode: 200,
            status(value) { this.statusCode = value; return this; },
            json(body) { sent.push({ status: this.statusCode, body: JSON.parse(JSON.stringify(body)) }); return this; },
            send(body) { sent.push({ status: this.statusCode, body }); return this; }
        };
        return { sent, res };
    }
    async function callUnlock(id, entered, user = 7) {
        const { sent, res } = response();
        await routes.get('POST /one-tree/unlock/:personID')({
            params: { personID: String(id) }, user: { userId: user },
            body: { sourceFamilyTreeCode: 'FT-SOURCE', targetPersonID: 88, keyCode: entered }
        }, res);
        assert.equal(sent.length, 1);
        return sent[0];
    }
    async function deliver(review, headers = {}, user = 7, route = '/one-tree/review') {
        const { sent, res } = response();
        const req = { method: 'GET', path: route, user: { userId: user }, headers, query: {} };
        await sandbox.module.exports.protection(req, res, () => res.json(review));
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(sent.length, 1);
        return sent[0];
    }
    return { ...sandbox.module.exports, pool, grant, callUnlock, deliver, attempts, deniedWrites };
}

function review() {
    return {
        olderTree: { FamilyTreeID: 10, FamilyTreeCode: 'FT-OLDER' },
        newerTree: { FamilyTreeID: 20, FamilyTreeCode: 'FT-NEWER' },
        groups: [{
            newerPerson: { PersonID: PRIV, FirstName: 'Newer', BirthPlace: 'PRIVATE_SENTINEL', contacts: [{ ContactValue: 'PRIVATE_SENTINEL' }] },
            candidates: [{
                PersonID: OTHER, FirstName: 'Older', BirthPlace: 'PRIVATE_SENTINEL2',
                conflicts: [{ field: 'BirthPlace', olderValue: 'PRIVATE_SENTINEL2', newerValue: 'PRIVATE_SENTINEL' }]
            }]
        }]
    };
}
const tokenHeaders = obj => ({ 'x-ft-page-token': JSON.stringify(obj) });

test('missing codes: review denies all private values and names the two required IDs only', async () => {
    const f = fixture();
    const result = await f.deliver(review());
    assert.equal(result.status, 423);
    assert.equal(result.body.code, 'PRIVATE_LOCKED');
    assert.deepEqual([...result.body.requiredPrivatePersonIDs].sort((a, b) => a - b), [202, 303]);
    assert.doesNotMatch(JSON.stringify(result.body), /PRIVATE_SENTINEL|conflicts|ContactValue/);
});

test('one valid token is insufficient for two private Persons', async () => {
    const f = fixture();
    const t = f.grant(PRIV);
    const result = await f.deliver(review(), tokenHeaders({ 202: t }));
    assert.equal(result.status, 423);
    assert.deepEqual([...result.body.requiredPrivatePersonIDs], [OTHER]);
});

test('independent verified tokens unlock both private comparison subjects', async () => {
    const f = fixture();
    const result = await f.deliver(review(), tokenHeaders({ 202: f.grant(PRIV), 303: f.grant(OTHER) }));
    assert.equal(result.status, 200);
    assert.match(JSON.stringify(result.body), /PRIVATE_SENTINEL/);
});

test('wrong user cannot reuse two valid privacy capabilities', async () => {
    const f = fixture();
    const result = await f.deliver(review(), tokenHeaders({ 202: f.grant(PRIV, 7), 303: f.grant(OTHER, 7) }), 8);
    assert.equal(result.status, 423);
});

test('invalid capability encoding fails closed without disclosure', async () => {
    const f = fixture();
    const result = await f.deliver(review(), { 'x-ft-page-token': '{not json}' });
    assert.equal(result.status, 423);
});

test('administrator exception includes private review without codes', async () => {
    const f = fixture();
    const result = await f.deliver(review(), {}, 1);
    assert.equal(result.status, 200);
    assert.match(JSON.stringify(result.body), /PRIVATE_SENTINEL/);
});

test('public review preserves candidate/conflict data', async () => {
    const f = fixture({ privateIDs: [] });
    const result = await f.deliver(review());
    assert.equal(result.status, 200);
    assert.match(JSON.stringify(result.body), /PRIVATE_SENTINEL/);
});

test('review with no candidate groups still locks private tree members', async () => {
    const f = fixture();
    const result = await f.deliver({ ...review(), groups: [] });
    assert.equal(result.status, 423);
});

test('legacy ONE_TREE_REVIEW_REQUIRED candidateGroups are protected', async () => {
    const f = fixture();
    const original = review();
    const result = await f.deliver({ ...original, code: 'ONE_TREE_REVIEW_REQUIRED', candidateGroups: original.groups, groups: undefined }, {}, 7, '/persons/exists');
    assert.equal(result.status, 423);
});

test('correct One Tree code produces a page token scoped to user and Person', async () => {
    const f = fixture();
    const result = await f.callUnlock(PRIV, code);
    assert.equal(result.status, 200);
    assert.match(result.body.pageToken, /^[0-9a-f]{64}$/);
    assert.equal((await f.missingOneTreePrivacy(f.pool, 7, tokenHeaders({ 202: result.body.pageToken, 303: f.grant(OTHER) }), [10, 20])).length, 0);
});

test('incorrect code is denied and tracked, with no token issued', async () => {
    const f = fixture();
    const result = await f.callUnlock(PRIV, 'incorrect-code');
    assert.equal(result.status, 403);
    assert.equal(f.attempts.length, 1);
    assert.equal(result.body.pageToken, undefined);
});

test('too many wrong codes are rejected before further guesses', async () => {
    const f = fixture({ rateLimit: true });
    const result = await f.callUnlock(PRIV, code);
    assert.equal(result.status, 429);
});

test('incorrect review-context Person cannot obtain a code token', async () => {
    const f = fixture();
    const result = await f.callUnlock(999, code);
    assert.equal(result.status, 403);
});

test('expired/wrong token is not accepted by server privacy check', async () => {
    const f = fixture();
    const result = await f.deliver(review(), tokenHeaders({ 202: capability(9), 303: capability(8) }));
    assert.equal(result.status, 423);
});

test('same-tree privacy check supports duplicate tree IDs (fail-closed)', async () => {
    const f = fixture();
    const missing = await f.missingOneTreePrivacy(f.pool, 7, {}, [10, 10]);
    assert.deepEqual([...missing], [OTHER]);
});

test('merge-guard error remains a 423 expected error with safe metadata', async () => {
    const f = fixture();
    const e = f.oneTreeLockedError([202, 303]);
    assert.equal(e.status, 423);
    assert.equal(e.responseCode, 'PRIVATE_LOCKED');
    assert.deepEqual([...e.requiredPrivatePersonIDs], [202, 303]);
});

test('familyTree merge route denies cross-tree merge before writes and preserves same-tree branch', async () => {
    const handlers = new Map();
    const attempted = [];
    const router = { get(route, ...fn) { handlers.set(`GET ${route}`, fn.at(-1)); }, post(route, ...fn) { handlers.set(`POST ${route}`, fn.at(-1)); }, put() {}, delete() {}, patch() {}, use() {} };
    const connection = {
        async beginTransaction() {}, async rollback() {}, async commit() {}, release() {},
        async query(sql, args = []) {
            attempted.push(sql);
            if (sql.includes('FROM FamilyTreeT') && sql.includes('WHERE FamilyTreeCode=?')) {
                return [[{ FamilyTreeID: 10, FamilyTreeCode: 'FT-SOURCE', Status: 'Active', MergedIntoFamilyTreeID: null }]];
            }
            if (sql.includes('FROM FTFamilyTreeUserT') && sql.includes('WHERE FamilyTreeID=?')) return [[{ FamilyTreeUserID: 9 }]];
            if (sql.includes('FROM FTFamilyTreePersonT ftp') && sql.includes('WHERE ftp.PersonID=?')) {
                return [[{ FamilyTreeID: targetID, FamilyTreeCode: targetID === 10 ? 'FT-SOURCE' : 'FT-TARGET', Status: 'Active', MergedIntoFamilyTreeID: null }]];
            }
            throw new Error(`Unexpected merge query: ${sql}`);
        }
    };
    let missing = [PRIV];
    let targetID = 20;
    const sandbox = {
        module: { exports: {} }, exports: {}, Buffer, console: { error() {} }, process: { env: {} },
        require(name) {
            if (name === 'express') return { Router: () => router };
            if (name === 'crypto') return crypto;
            if (name === 'multer') return Object.assign(() => ({ single: () => (_req, _res, next) => next() }), { memoryStorage: () => ({}) });
            if (name === '../dbConnection') return { pool: { getConnection: async () => connection, query: (...args) => connection.query(...args) } };
            if (name === '../middleware/auth') return (_req, _res, next) => next();
            if (name === '../services/administratorAccess') return { isVerifiedAdministrator: () => false };
            if (name === '../services/stage6ExpectedClientError') return { markExpectedClientError: e => e, isExpectedClientError: e => Boolean(e?.status && e.status < 500) };
            if (name === '../services/notificationService') return { sendNotification() {} };
            if (name === './ftPrivacy') return {
                missingOneTreePrivacy: async () => missing,
                oneTreeLockedError: ids => Object.assign(new Error('One Tree review requires privacy-code verification.'), { status: 423, responseCode: 'PRIVATE_LOCKED', requiredPrivatePersonIDs: ids })
            };
            if (name === '../r2Storage') return new Proxy({}, { get() { return async () => {}; } });
            throw new Error(`Unexpected dependency: ${name}`);
        }
    };
    vm.runInNewContext(source('routes/familyTree.js'), sandbox, { filename: 'routes/familyTree.js' });
    const handler = handlers.get('POST /one-tree/merge');
    assert.equal(typeof handler, 'function');
    const response = () => {
        const sent = [];
        return {
            sent,
            res: {
                statusCode: 200, status(n) { this.statusCode = n; return this; },
                json(body) { sent.push({ status: this.statusCode, body }); return this; }
            }
        };
    };
    const req = { body: { sourceFamilyTreeCode: 'FT-SOURCE', targetPersonID: 55, decisions: [] }, user: { userId: 7 }, headers: {} };
    let first = response();
    await handler(req, first.res);
    assert.equal(first.sent[0].status, 423);
    assert.equal(first.sent[0].body.code, 'PRIVATE_LOCKED');
    assert.equal(attempted.some(sql => /^(INSERT|UPDATE|DELETE)\b/i.test(sql.trim())), false);
    missing = [];
    targetID = 10;
    let second = response();
    await handler(req, second.res);
    assert.equal(second.sent[0].status, 200);
    assert.equal(second.sent[0].body.mergedPersonCount, 0);
});

test('browser uses page-memory tokens, retries GET only, never stores privacy credentials', async () => {
    const script = source('httpdocs/js/FTOneTreeMerge.js');
    let getCount = 0;
    let postCount = 0;
    let lastHeaders = null;
    const fakeWindow = {
        location: { hostname: 'localhost', port: '8080', origin: 'http://localhost:8080' },
        localStorage: { getItem: () => 'synthetic-session-token' },
        sessionStorage: { setItem() { throw Error('Tokens must not be stored here'); } }
    };
    const sandbox = {
        window: fakeWindow,
        localStorage: fakeWindow.localStorage,
        location: { search: '?sourceFamilyTreeCode=FT-SOURCE&targetPersonID=55' },
        URLSearchParams, URL, Headers, console, alert() {},
        document: { getElementById: () => ({}), addEventListener() {} },
        fetch: async (url, options) => {
            if (url.includes('/one-tree/review')) {
                getCount++;
                lastHeaders = options.headers;
                if (getCount === 1) return { status: 423, ok: false, json: async () => ({ code: 'PRIVATE_LOCKED', requiredPrivatePersonIDs: [PRIV], message: 'Unlock required' }) };
                return { status: 200, ok: true, json: async () => ({ ...review(), groups: [] }) };
            }
            if (url.includes('/privacy/one-tree/unlock/')) {
                postCount++;
                assert.equal(options.method, 'POST');
                const body = JSON.parse(options.body);
                assert.equal(body.keyCode, code);
                return { status: 200, ok: true, json: async () => ({ pageToken: capability(2) }) };
            }
            throw new Error(`Unexpected browser request: ${url}`);
        }
    };
    vm.createContext(sandbox);
    vm.runInContext(script, sandbox, { filename: 'FTOneTreeMerge.js' });
    vm.runInContext(`requestOneTreePrivacyCode = async () => ${JSON.stringify(code)}`, sandbox);
    const result = await vm.runInContext('fetchAuthorizedOneTreeReview()', sandbox);
    assert.equal(result.olderTree.FamilyTreeID, 10);
    assert.equal(getCount, 2);
    assert.equal(postCount, 1);
    assert.equal(JSON.parse(lastHeaders['X-FT-Page-Token'])['202'], capability(2));
    assert.doesNotMatch(JSON.stringify(lastHeaders), /SYNTHETIC-ONLY-CODE/);
    assert.doesNotMatch(script, /sessionStorage\.setItem\([^\n]*oneTreeCapabilities/);
});

test('browser merge privacy rejection does not cause automatic second POST', async () => {
    const script = source('httpdocs/js/FTOneTreeMerge.js');
    let mergePostCount = 0;
    const elements = { mergeBtn: { disabled: false }, status: { textContent: '' } };
    const sandbox = {
        window: { location: { hostname: 'localhost', port: '8080', origin: 'http://localhost:8080' }, localStorage: { getItem: () => 'synthetic' } },
        localStorage: { getItem: () => 'synthetic' },
        location: { search: '?sourceFamilyTreeCode=FT-SOURCE&targetPersonID=55' },
        URLSearchParams, URL, Headers, alert() {}, console,
        document: { getElementById: id => elements[id] || {}, addEventListener() {}, querySelectorAll: () => [] },
        fetch: async (url, options) => {
            if (!url.endsWith('/one-tree/merge')) throw new Error(`Unexpected request ${url}`);
            mergePostCount++;
            assert.equal(options.method, 'POST');
            return { status: 423, ok: false, json: async () => ({ code: 'PRIVATE_LOCKED', requiredPrivatePersonIDs: [PRIV] }) };
        }
    };
    vm.createContext(sandbox);
    vm.runInContext(script, sandbox);
    vm.runInContext('review = { groups: [] }', sandbox);
    await assert.rejects(vm.runInContext('merge()', sandbox), /No automatic merge retry/);
    assert.equal(mergePostCount, 1);
    assert.equal(elements.mergeBtn.disabled, false);
});
