'use strict';

// WA M03-H03: synthetic-only HTTP route-boundary harness. Never starts server.js,
// imports the real database/storage/notification adapters, or contacts a remote host.
// With --express it mounts the exact route and middleware modules on local Express.
// Without --express a small native HTTP adapter dispatches the registered routes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const args = process.argv.slice(2);
function option(name, fallback) {
    const i = args.indexOf(name);
    return i === -1 ? fallback : args[i + 1];
}
const project = path.resolve(option('--project', process.cwd()));
const candidate = path.resolve(option('--candidate', path.join(__dirname, '..', 'routes', 'familyTree.js')));
const baseline = option('--baseline', null);
const flat = args.includes('--flat');
const useExpress = args.includes('--express');
const express = useExpress ? createRequire(path.join(project, 'package.json'))('express') : null;
const sourceFiles = {
    admin: 'services/administratorAccess.js',
    expected: 'services/stage6ExpectedClientError.js',
    auth: 'middleware/auth.js',
    subscription: 'middleware/subscriptionAccess.js',
    usage: 'middleware/usageActivity.js',
    privacy: 'routes/ftPrivacy.js'
};

function registeredRouter() {
    const routes = new Map();
    const router = { routes, use() { return router; } };
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
        router[method] = (url, ...handlers) => {
            routes.set(`${method.toUpperCase()} ${url}`, handlers);
            return router;
        };
    }
    return router;
}

function loadSource(filename, dependencies, logErrors, hooks = null) {
    const module = { exports: {} };
    const source = fs.readFileSync(filename, 'utf8');
    // Test-only substitution of the review provider and two destructive downstream helpers.
    const injection = hooks ? `
        buildOneTreeReview = hooks.review;
        createOneTreeMergeRecord = hooks.record;
        mergeTreesOneTree = hooks.merge;
    ` : '';
    const wrapper = vm.runInThisContext(`(function(require,module,exports,process,console,hooks){\n${source}\n${injection}\n})`, { filename });
    wrapper((name) => {
        if (!Object.prototype.hasOwnProperty.call(dependencies, name)) {
            throw new Error(`Unexpected module dependency: ${name}`);
        }
        return dependencies[name];
    }, module, module.exports, { env: { ADMIN_USERNAME: 'synthetic-admin', JWT_SECRET: 'synthetic-not-a-live-secret' } }, {
        ...console,
        error: (...values) => logErrors.push(values.map(String).join(' '))
    }, hooks);
    return module.exports;
}

const tokens = {
    member: { userId: 101, client: 'web' },
    other: { userId: 102, client: 'web' },
    'no-subscription': { userId: 103, client: 'web' },
    native: { userId: 101, client: 'tnna' },
    admin: { userId: 900, client: 'web' },
    'name-only': { userId: 901, client: 'web' },
    'flag-only': { userId: 902, client: 'web' }
};
class AuthenticationError extends Error {
    constructor(status, code) { super(code); this.status = status; this.code = code; }
}

function fixture(options = {}) {
    const trees = [
        { FamilyTreeID: 1, FamilyTreeCode: 'SYN-A', Status: 'Active' },
        { FamilyTreeID: 2, FamilyTreeCode: 'SYN-B', Status: 'Active' },
        { FamilyTreeID: 3, FamilyTreeCode: 'SYN-C', Status: 'Active' },
        { FamilyTreeID: 9, FamilyTreeCode: 'SYN-OLD', Status: 'Merged', MergedIntoFamilyTreeID: 1 }
    ];
    const userMembership = new Set(['1:101', '2:101', '2:102', '1:103']);
    const people = new Map([11, 12, 13, 21, 22, 31, 41].map(PersonID => [PersonID, {
        PersonID, FirstName: 'Synthetic', LastName: PersonID === 13 ? 'Duplicate' : `Person${PersonID}`,
        Gender: 'Male', CreatedByUserID: 101, BirthDate: null, Died: 0
    }]));
    const member = new Set(['1:11', '1:12', '1:13', '2:21', '2:22', '3:31', '1:99']);
    const users = new Map([
        [101, { UserID: 101, UserName: 'ordinary', IsAdministrator: 0 }],
        [102, { UserID: 102, UserName: 'other', IsAdministrator: 0 }],
        [103, { UserID: 103, UserName: 'no-sub', IsAdministrator: 0 }],
        [900, { UserID: 900, UserName: ' Synthetic-Admin ', IsAdministrator: 1 }],
        [901, { UserID: 901, UserName: 'synthetic-admin', IsAdministrator: 0 }],
        [902, { UserID: 902, UserName: 'different-name', IsAdministrator: 1 }]
    ]);
    const state = {
        options, queries: [], writes: [], committed: [], usage: [], emails: [], errors: [], reviewCalls: 0, recordCalls: [], mergeCalls: [],
        unexpected: [], begins: 0, commits: 0, rollbacks: 0, releases: 0,
        duplicateReads: 0, privacyReads: 0, membershipChecks: [], people, member
    };
    let nextID = 100;
    const fail = (message, props = {}) => Object.assign(new Error(message), props);
    const rows = values => [values, []];
    function connection() {
        let pending = null;
        let snapshot = null;
        return {
            async beginTransaction() {
                assert.equal(pending, null);
                state.begins++;
                pending = [];
                snapshot = { people: new Map(people), member: new Set(member) };
            },
            async commit() {
                assert.ok(pending);
                state.commits++;
                state.committed.push(...pending);
                pending = null;
            },
            async rollback() {
                state.rollbacks++;
                if (snapshot && pending !== null) {
                    people.clear(); for (const [id, value] of snapshot.people) people.set(id, value);
                    member.clear(); for (const value of snapshot.member) member.add(value);
                }
                pending = null;
            },
            release() { state.releases++; },
            async query(input, params = []) {
                const sql = input.replace(/\s+/g, ' ').trim();
                const entry = { sql, params: [...params] };
                state.queries.push(entry);
                if (/^(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(sql)) {
                    state.writes.push(entry);
                    if (options.duplicatePartner && /^INSERT INTO FTPartnerT\b/.test(sql)) {
                        throw fail('synthetic duplicate', { code: 'ER_DUP_ENTRY' });
                    }
                    if (options.writeFailure && /^INSERT INTO FTParentT\b/.test(sql)) {
                        throw fail('synthetic sensitive storage detail');
                    }
                    (pending === null ? state.committed : pending).push(entry);
                    let insertId = ++nextID;
                    if (/^INSERT INTO FTPersonT\b/.test(sql)) {
                        insertId = 1000;
                        people.set(insertId, {
                            PersonID: insertId, FirstName: params[0], LastName: params[2],
                            Gender: params[6], BirthDate: params[7], BirthPlace: params[8],
                            Died: params[11], DeathDate: params[12], DeathPlace: params[13],
                            CreatedByUserID: params[14]
                        });
                    }
                    if (/^INSERT (?:IGNORE )?INTO FTFamilyTreePersonT\b/.test(sql)) {
                        member.add(`${params[0]}:${params[1]}`);
                    }
                    return [{ insertId, affectedRows: 1 }, []];
                }
                if (/FROM UsersT WHERE UserID=\? LIMIT 1/.test(sql)) {
                    if (options.adminFailure) throw fail('synthetic sensitive administrator detail');
                    return rows(users.has(params[0]) ? [users.get(params[0])] : []);
                }
                if (/FROM FamilyTreeT WHERE FamilyTreeCode=\? LIMIT 1/.test(sql)) {
                    return rows(trees.filter(t => t.FamilyTreeCode === params[0]));
                }
                if (/FROM FamilyTreeT WHERE FamilyTreeID=\? LIMIT 1/.test(sql)) {
                    return rows(trees.filter(t => t.FamilyTreeID === params[0]));
                }
                if (/SELECT FamilyTreeUserID FROM FTFamilyTreeUserT/.test(sql)) {
                    return rows(userMembership.has(`${params[0]}:${params[1]}`) ? [{ FamilyTreeUserID: 1 }] : []);
                }
                if (/FROM FTFamilyTreePersonT ftp JOIN FamilyTreeT ft ON ft.FamilyTreeID=ftp.FamilyTreeID WHERE ftp.PersonID=\? ORDER BY/.test(sql)) {
                    const matching = trees.filter(tree => member.has(`${tree.FamilyTreeID}:${params[0]}`));
                    return rows(matching.slice(0, 1));
                }
                if (/^SELECT 1 FROM FTFamilyTreePersonT WHERE FamilyTreeID=\? AND PersonID=\? LIMIT 1$/.test(sql)) {
                    return rows(member.has(`${params[0]}:${params[1]}`) ? [{ n: 1 }] : []);
                }
                if (/^SELECT ftp.PersonID FROM FTFamilyTreePersonT ftp JOIN FTPersonT p ON p.PersonID=ftp.PersonID WHERE ftp.FamilyTreeID=\? AND ftp.PersonID=\? LIMIT 1 FOR UPDATE$/.test(sql)) {
                    assert.ok(pending, 'membership check outside transaction');
                    state.membershipChecks.push([...params]);
                    if (options.membershipFailure) {
                        throw fail('synthetic sensitive membership detail', { status: options.membershipFailure });
                    }
                    return rows(member.has(`${params[0]}:${params[1]}`) && people.has(params[1]) ? [{ PersonID: params[1] }] : []);
                }
                if (sql === 'SELECT PersonID FROM FTPersonT WHERE PersonID IN (?,?)') {
                    return rows(params.filter(id => people.has(id)).map(PersonID => ({ PersonID })));
                }
                if (/^SELECT DISTINCT p.PersonID,p.FirstName/.test(sql)) {
                    state.duplicateReads++;
                    if (!options.duplicate) return rows([]);
                    return rows([{ ...people.get(13), FamilyTreeID: 1, FamilyTreeCode: 'SYN-A', ProfileStorageKey: null }]);
                }
                if (/^SELECT DISTINCT p.PersonID FROM FTPersonPrivacyT p JOIN FTFamilyTreePersonT ftp/.test(sql)) {
                    return rows(options.privateLocked ? [{ PersonID: 21 }] : []);
                }
                if (/^SELECT PersonID FROM FTPersonPrivacyT WHERE IsPrivate=1 AND PersonID IN/.test(sql)) {
                    state.privacyReads++;
                    return rows(params.includes(13) ? [{ PersonID: 13 }] : []);
                }
                if (/^SELECT \* FROM FTPersonT WHERE PersonID=\? LIMIT 1$/.test(sql)) {
                    return rows(people.has(params[0]) ? [people.get(params[0])] : []);
                }
                if (/^SELECT Gender FROM FTPersonT WHERE PersonID=\? LIMIT 1$/.test(sql)) {
                    return rows(people.has(params[0]) ? [{ Gender: people.get(params[0]).Gender }] : []);
                }
                if (/^SELECT ParentPersonID FROM FTParentT/.test(sql) ||
                    /^SELECT EventID FROM FTEventT WHERE AutoPersonID/.test(sql) ||
                    /^SELECT e.EventID FROM FTEventPersonT ep JOIN FTEventT e/.test(sql) ||
                    /^SELECT ContactID, ContactValue FROM FTContactT/.test(sql) ||
                    /^SELECT p.PersonID,p.FirstName,p.MiddleName,p.LastName,p.SuffixName/.test(sql) ||
                    /^SELECT e.EventID,e.EventType,e.EventDate/.test(sql) ||
                    /^SELECT ContactID,ContactType,ContactValue,ContactNote,IsPrimary FROM FTContactT/.test(sql) ||
                    /^SELECT ImageID,ImageType,ApproxAge,ImageDate,StorageKey/.test(sql)) {
                    return rows([]);
                }
                state.unexpected.push(sql);
                throw fail('Unexpected synthetic SQL: ' + sql);
            }
        };
    }
    const pool = {
        async getConnection() { return connection(); },
        async query(...queryArgs) { return connection().query(...queryArgs); }
    };
    return { state, pool };
}

function setup(routeFile, options) {
    const { state, pool } = fixture(options);
    const modules = {};
    const dependencies = {
        express: express || { Router: registeredRouter },
        crypto,
        '../dbConnection': { pool },
        jsonwebtoken: {},
        '../services/verifyAccessToken': {
            AuthenticationError,
            async verifyAccessToken(token) {
                if (!tokens[token]) throw new AuthenticationError(401, 'INVALID_SYNTHETIC_TOKEN');
                return { ...tokens[token] };
            }
        },
        '../services/subscriptionService': {
            async getAppAccess(userID, appKey) {
                assert.equal(appKey, 'family_tree');
                return { allowed: userID !== 103, reason: 'SYNTHETIC_ENTITLEMENT' };
            },
            async recordUsage(...values) { state.usage.push(values); }
        },
        '../services/notificationService': {
            async sendNotification(value) { state.emails.push(value); return { status: 'SENT' }; }
        },
        '../r2Storage': new Proxy({}, {
            get: () => async () => { throw new Error('External object operation prohibited in this test'); }
        })
    };
    const multer = () => ({ single: () => (_req, _res, next) => next() });
    multer.memoryStorage = () => ({});
    multer.MulterError = class extends Error {};
    dependencies.multer = multer;
    for (const name of ['expected', 'admin', 'auth', 'subscription', 'usage', 'privacy']) {
        const relative = sourceFiles[name];
        const file = path.join(project, flat ? path.basename(relative) : relative);
        modules[name] = loadSource(file, dependencies, state.errors);
        if (name === 'expected') dependencies['../services/stage6ExpectedClientError'] = modules[name];
        if (name === 'admin') dependencies['../services/administratorAccess'] = modules[name];
        if (name === 'auth') {
            dependencies['../middleware/auth'] = modules[name];
            dependencies['./auth'] = modules[name];
        }
        if (name === 'privacy') dependencies['./ftPrivacy'] = modules[name];
    }
    const hooks = {
        async review(c, source, target) {
            state.reviewCalls++;
            if (options.reviewFailure) throw new Error('synthetic internal review detail');
            const group = (newer, candidates) => ({
                newerPerson: { PersonID: newer },
                candidates: candidates.map(PersonID => ({ PersonID }))
            });
            return {
                olderTree: source, newerTree: target,
                groups: options.emptyReview ? [] : [group(21, [11, 12]), group(22, [12, 13])]
            };
        },
        async record(c, older, newer, user, decisions, bridge) {
            state.recordCalls.push(structuredClone({ decisions, bridge, user }));
            const [r] = await c.query('INSERT INTO FTTreeMergeT (SourceFamilyTreeID) VALUES (?)', [newer.FamilyTreeID]);
            return { TreeMergeID: r.insertId };
        },
        async merge(c, older, newer, decisions, user, bridge, r2Plan, id) {
            state.mergeCalls.push(structuredClone({ decisions, bridge, user }));
            if (options.mergeFailure) throw new Error('synthetic merge internal detail');
            return { FamilyTreeID: older.FamilyTreeID, FamilyTreeCode: older.FamilyTreeCode,
                mergedTreeCode: newer.FamilyTreeCode, mergedPersonCount: 0 };
        }
    };
    const router = loadSource(routeFile, dependencies, state.errors, hooks);
    const middleware = [
        modules.subscription.authenticateToken,
        modules.subscription.requireAppAccess('family_tree'),
        modules.usage('family_tree'),
        modules.privacy.protection
    ];
    let server;
    if (express) {
        const app = express();
        app.use(express.json());
        app.use('/familytree', ...middleware, router);
        app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
            state.errors.push(String(err));
            res.status(500).json({ message: 'Internal Server Error' });
        });
        server = http.createServer(app);
    } else {
        server = http.createServer(async (req, res) => {
            const url = new URL(req.url, 'http://127.0.0.1');
            req.baseUrl = '/familytree';
            req.path = url.pathname.slice(req.baseUrl.length);
            req.query = Object.fromEntries(url.searchParams);
            req.get = name => req.headers[name.toLowerCase()];
            req.body = JSON.parse(await new Promise((resolve, reject) => {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => resolve(body || '{}'));
                req.on('error', reject);
            }));
            res.status = code => { res.statusCode = code; return res; };
            res.json = value => {
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify(value));
                return res;
            };
            res.send = value => { res.end(String(value)); return res; };
            const handlers = router.routes.get(`${req.method} ${req.path}`);
            if (!handlers) return res.status(404).json({ message: 'Route not registered' });
            const chain = [...middleware, ...handlers];
            let i = 0;
            function next(error) {
                if (error) {
                    state.errors.push(String(error));
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                const handler = chain[i++];
                if (handler) Promise.resolve(handler(req, res, next)).catch(next);
            }
            next();
        });
    }
    return { server, state };
}

async function run(routeFile, endpoint, body, token = 'member', options = {}) {
    const { server, state } = setup(routeFile, options);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/familytree/${endpoint}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(body), signal: AbortSignal.timeout(5000)
        });
        const data = await response.json();
        await new Promise(resolve => setImmediate(resolve));
        assert.deepEqual(state.unexpected, [], 'unhandled SQL in mock');
        return { status: response.status, data, state };
    } finally {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
    }
}


const same = { newerPersonID: 21, decision: 'same', olderPersonID: 11,
    resolutions: { FirstName: 'newer', BirthDate: 'older' }, keepImageIDs: [301, 302] };
const different = { newerPersonID: 22, decision: 'different' };
const valid = [same, different];
const body = decisions => ({ sourceFamilyTreeCode: 'SYN-A', targetPersonID: 21, decisions });
let passed = 0;
let failed = 0;
async function check(label, work) {
    try { await work(); passed++; console.log(`PASS ${label}`); }
    catch (error) { failed++; console.error(`FAIL ${label}: ${error.stack || error}`); }
}
function reject(result, status = 409) {
    assert.equal(result.status, status, JSON.stringify(result.data));
    assert.equal(result.state.writes.length, 0, 'SQL write attempted');
    assert.equal(result.state.committed.length, 0);
    assert.equal(result.state.recordCalls.length, 0);
    assert.equal(result.state.mergeCalls.length, 0);
    assert.equal(result.state.commits, 0);
    assert.equal(result.state.usage.length, 0);
    assert.equal(result.state.emails.length, 0);
}
function accept(result, expected) {
    assert.equal(result.status, 200, JSON.stringify(result.data));
    assert.equal(result.state.recordCalls.length, 1);
    assert.equal(result.state.mergeCalls.length, 1);
    assert.deepEqual(result.state.recordCalls[0].decisions, expected);
    assert.deepEqual(result.state.mergeCalls[0], result.state.recordCalls[0]);
    assert.equal(result.state.commits, 1);
    assert.equal(result.state.rollbacks, 0);
    assert.equal(result.state.errors.length, 0);
}
async function main() {
    const endpoint = 'one-tree/merge';
    const bad = [
        ['extra same', [...valid, { newerPersonID: 23, olderPersonID: 13, decision: 'same' }]],
        ['extra different', [...valid, { newerPersonID: 23, decision: 'different' }]],
        ['duplicate identical', [...valid, same]],
        ['duplicate conflicting', [{ newerPersonID: 21, decision: 'different' }, ...valid]],
        ['duplicate numeric string', [...valid, { ...same, newerPersonID: '21' }]],
        ['missing required group', [same]],
        ['empty incomplete', []],
        ['unsupported decision', [{ ...same, decision: 'maybe' }, different]],
        ['null element', [...valid, null]],
        ['array element', [...valid, []]],
        ['scalar element', [...valid, 21]],
        ['missing ID', [{ decision: 'same', olderPersonID: 11 }, different]],
        ['boolean newer ID', [{ ...same, newerPersonID: true }, different]],
        ['fractional newer ID', [{ ...same, newerPersonID: 21.1 }, different]],
        ['negative newer ID', [{ ...same, newerPersonID: -21 }, different]],
        ['unsafe integer', [{ ...same, newerPersonID: Number.MAX_SAFE_INTEGER + 1 }, different]],
        ['coercible array ID', [{ ...same, newerPersonID: [21] }, different]],
        ['exponential string ID', [{ ...same, newerPersonID: '2.1e1' }, different]],
        ['missing older ID', [{ newerPersonID: 21, decision: 'same' }, different]],
        ['coercible older array', [{ ...same, olderPersonID: [11] }, different]],
        ['stale older candidate', [{ ...same, olderPersonID: 13 }, different]],
        ['one older used twice', [{ ...same, olderPersonID: 12 }, { ...different, decision: 'same', olderPersonID: 12 }]],
        ['non-array object', { ...same }],
        ['explicit null', null],
        ['string list', 'invalid'],
        ['missing decisions', undefined]
    ];
    for (const [label, decisions] of bad) {
        await check(`${label} / zero writes`, async () => {
            const r = await run(candidate, endpoint, body(decisions));
            reject(r);
            assert.notEqual(r.data.message, 'Internal Server Error');
            assert.equal(r.state.reviewCalls, 1);
        });
    }
    await check('valid same + different; conflict and picture selections preserved', async () => {
        accept(await run(candidate, endpoint, body(valid)), valid);
    });
    await check('numeric string IDs normalized; request order normalized; unrelated metadata omitted', async () => {
        accept(await run(candidate, endpoint, body([{ ...different, newerPersonID: '22', extra: true },
            { ...same, newerPersonID: '21', olderPersonID: '11', extra: true }])), valid);
    });
    await check('all different preserved', async () => {
        const ds = [{ newerPersonID: 21, decision: 'different' }, different];
        accept(await run(candidate, endpoint, body(ds)), ds);
    });
    await check('all same with distinct candidates', async () => {
        const ds = [same, { newerPersonID: 22, olderPersonID: 12, decision: 'same', resolutions: {}, keepImageIDs: [] }];
        accept(await run(candidate, endpoint, body(ds)), ds);
    });
    await check('empty review accepts empty array', async () => {
        accept(await run(candidate, endpoint, body([]), 'member', { emptyReview: true }), []);
    });
    await check('empty review preserves omitted decisions compatibility', async () => {
        accept(await run(candidate, endpoint, body(undefined), 'member', { emptyReview: true }), []);
    });
    await check('empty review rejects extra decision', async () => {
        reject(await run(candidate, endpoint, body([same]), 'member', { emptyReview: true }));
    });
    await check('empty review rejects malformed list', async () => {
        reject(await run(candidate, endpoint, body(null), 'member', { emptyReview: true }));
    });
    await check('unauthenticated denied', async () => reject(await run(candidate, endpoint, body(valid), null), 401));
    await check('subscription denied', async () => reject(await run(candidate, endpoint, body(valid), 'no-subscription'), 403));
    await check('unauthorized source Tree denied', async () => reject(await run(candidate, endpoint, body(valid), 'other'), 403));
    await check('private Person locked before review', async () => {
        const r = await run(candidate, endpoint, body(valid), 'member', { privateLocked: true });
        reject(r, 423); assert.equal(r.state.reviewCalls, 0); assert.equal(r.data.code, 'PRIVATE_LOCKED');
    });
    await check('verified administrator retains authorized review path', async () => {
        accept(await run(candidate, endpoint, body(valid), 'admin', { privateLocked: true }), valid);
    });
    await check('verified administrator cannot add unreviewed decision', async () => {
        reject(await run(candidate, endpoint, body([...valid, { newerPersonID: 23, decision: 'different' }]), 'admin'));
    });
    await check('same-tree bridge remains unchanged', async () => {
        const r = await run(candidate, endpoint, { ...body([]), targetPersonID: 12,
            bridge: { focalPersonID: 11, relatedPersonID: 12, relationshipKind: 'partner' } });
        assert.equal(r.status, 200, JSON.stringify(r.data));
        assert.equal(r.state.reviewCalls, 0); assert.equal(r.state.recordCalls.length, 0);
        assert.equal(r.state.mergeCalls.length, 0); assert.equal(r.state.commits, 1);
        assert.equal(r.state.writes.filter(w => /^INSERT IGNORE INTO FTPartnerT\b/.test(w.sql)).length, 1);
    });
    await check('same-tree foreign bridge rejected', async () => {
        reject(await run(candidate, endpoint, { ...body([]), targetPersonID: 12,
            bridge: { focalPersonID: 31, relatedPersonID: 12, relationshipKind: 'partner' } }), 403);
    });
    await check('cross-tree third-Tree bridge rejected', async () => {
        reject(await run(candidate, endpoint, { ...body(valid), bridge: {
            focalPersonID: 31, relatedPersonID: 21, relationshipKind: 'partner' } }), 403);
    });
    await check('unexpected review failure: generic error, zero writes', async () => {
        const r = await run(candidate, endpoint, body(valid), 'member', { reviewFailure: true });
        reject(r, 500); assert.equal(r.data.message, 'Internal Server Error');
    });
    await check('downstream failure rolls back mock transaction', async () => {
        const r = await run(candidate, endpoint, body(valid), 'member', { mergeFailure: true });
        assert.equal(r.status, 500); assert.equal(r.data.message, 'Internal Server Error');
        assert.equal(r.state.rollbacks, 1); assert.equal(r.state.committed.length, 0);
        assert.equal(r.state.usage.length, 0);
    });
    if (baseline) {
        await check('original baseline demonstrates additional decision reaching mock merge', async () => {
            const ds = [...valid, { newerPersonID: 23, olderPersonID: 13, decision: 'same' }];
            accept(await run(path.resolve(baseline), endpoint, body(ds)), ds);
        });
        await check('original baseline demonstrates duplicate decision reaching mock merge', async () => {
            const ds = [...valid, same];
            accept(await run(path.resolve(baseline), endpoint, body(ds)), ds);
        });
    }
    console.log(`RESULT: ${passed} passed, ${failed} failed, ${passed + failed} cases.`);
    process.exitCode = failed ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
