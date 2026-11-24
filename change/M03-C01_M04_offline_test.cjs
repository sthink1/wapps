'use strict';

// WA M03-C01 / M03-M04: synthetic-only HTTP route-boundary harness. Never starts server.js,
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
const privacy = path.resolve(option('--privacy', path.join(__dirname, '..', 'routes', 'ftPrivacy.js')));
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
    'flag-only': { userId: 902, client: 'web' },
    'new-user': { userId: 104, client: 'web' }
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
    const mergeRow = {
        TreeMergeID: 50, SourceFamilyTreeID: 9, SurvivingFamilyTreeID: 1,
        SourceFamilyTreeCode: 'SYN-OLD', SurvivingFamilyTreeCode: 'SYN-A',
        SourceCreatedByUserID: 101, MergedByUserID: 101, MergedByUserName: 'synthetic',
        MergedAt: '2026-01-01 00:00:00', Status: options.undone ? 'UNDONE' : 'ACTIVE',
        MergeSnapshot: JSON.stringify({ sourceTree: { FamilyTreeID: 9, FamilyTreeCode: 'SYN-OLD', CreatedByUserID: 101 },
            sourceMemberships: [], sourceUsers: [], pairs: [], survivingBaseline: {} }),
        BridgeJSON: '{}', CreatedR2KeysJSON: '[]'
    };
    const state = {
        options, queries: [], writes: [], committed: [], usage: [], emails: [], errors: [], reviewCalls: 0, recordCalls: [], mergeCalls: [],
        unexpected: [], begins: 0, commits: 0, rollbacks: 0, releases: 0,
        duplicateReads: 0, privacyReads: 0, membershipChecks: [], targetReads: [], people, member
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
                    state.targetReads.push(params[0]);
                    if (options.targetMismatch && params[0] === 12) return rows([trees[1]]);
                    const matching = trees.filter(tree => member.has(`${tree.FamilyTreeID}:${params[0]}`));
                    return rows(matching.slice(0, 1));
                }
                if (/^SELECT 1 FROM FTFamilyTreePersonT WHERE FamilyTreeID=\? AND PersonID=\? LIMIT 1$/.test(sql)) {
                    if (options.guardFailure) throw fail('synthetic confidential membership failure');
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
                if (/^SELECT ft\.\* FROM FTFamilyTreeUserT ftu JOIN FamilyTreeT ft/.test(sql)) {
                    return rows(trees.filter(t => t.Status === 'Active' && userMembership.has(`${t.FamilyTreeID}:${params[0]}`)).slice(0, 1));
                }
                if (/^SELECT ft.FamilyTreeID,ft.FamilyTreeCode FROM FamilyTreeT ft JOIN FTFamilyTreeUserT u/.test(sql)) {
                    return rows(trees.filter(t => t.FamilyTreeCode === params[0] && userMembership.has(`${t.FamilyTreeID}:${params[1]}`)));
                }
                if (/^SELECT FamilyTreeID,MergedIntoFamilyTreeID FROM FamilyTreeT WHERE FamilyTreeCode=/.test(sql)) {
                    return rows(trees.filter(t => t.FamilyTreeCode === params[0]));
                }
                if (/^SELECT FamilyTreeID,FamilyTreeCode FROM FamilyTreeT WHERE FamilyTreeCode=/.test(sql)) {
                    return rows(trees.filter(t => t.FamilyTreeCode === params[0]));
                }
                if (/^SELECT 1 AS n FROM FTFamilyTreePersonT WHERE PersonID=/.test(sql)) {
                    return rows(member.has(`${params[1]}:${params[0]}`) ? [{ n: 1 }] : []);
                }
                if (/^SELECT PersonID,IsPrivate FROM FTPersonPrivacyT/.test(sql)) {
                    state.privacyReads++;
                    return rows([{ PersonID: params[0], IsPrivate: options.privatePerson ? 1 : 0 }]);
                }
                if (/^SELECT COUNT\(\*\) AS n FROM FTPrivacyAttemptT/.test(sql)) return rows([{ n: 0 }]);
                if (/^SELECT KeyCode FROM FTPersonPrivacyT/.test(sql)) return rows([{ KeyCode: 'synthetic-key' }]);
                if (/^SELECT 1 AS yes FROM FTPrivacyUnlockT/.test(sql)) return rows([]);
                if (/^SELECT tm\.TreeMergeID, tm\.SourceFamilyTreeID/.test(sql)) return rows([mergeRow]);
                if (/^SELECT tm\.\*, sourceTree\.FamilyTreeCode/.test(sql)) return rows(params[0] === 50 ? [mergeRow] : []);
                if (/^SELECT \* FROM FTTreeMergeT WHERE TreeMergeID=\? FOR UPDATE/.test(sql)) return rows(params[0] === 50 ? [mergeRow] : []);
                if (/^SELECT TreeMergeID,MergedAt FROM FTTreeMergeT/.test(sql)) return rows([]);
                if (/^SELECT \* FROM FamilyTreeT WHERE FamilyTreeID=\? FOR UPDATE/.test(sql)) return rows(trees.filter(t => t.FamilyTreeID === params[0]));
                if (/^SELECT \(SELECT COUNT\(\*\) FROM FTFamilyTreePersonT/.test(sql)) return rows([{ personCount: 0, parentCount: 0, partnerCount: 0, siblingCount: 0 }]);
                if (/^SELECT \* FROM FTPersonMergeT WHERE TreeMergeID=/.test(sql)) return rows([]);
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
        const file = name === 'privacy' ? privacy : path.join(project, flat ? path.basename(relative) : relative);
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
    const privacyMiddleware = middleware.slice(0, 2);
    let server;
    if (express) {
        const app = express();
        app.use(express.json());
        app.use('/familytree/privacy', ...privacyMiddleware, modules.privacy.privateRouter);
        app.use('/familytree', ...middleware, router);
        app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
            state.errors.push(String(err));
            res.status(500).json({ message: 'Internal Server Error' });
        });
        server = http.createServer(app);
    } else {
        server = http.createServer(async (req, res) => {
            const url = new URL(req.url, 'http://127.0.0.1');
            const privacyPath = url.pathname.startsWith('/familytree/privacy/');
            req.baseUrl = privacyPath ? '/familytree/privacy' : '/familytree';
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
            const routes = privacyPath ? modules.privacy.privateRouter.routes : router.routes;
            let handlers;
            for (const [key, routeHandlers] of routes) {
                const [method, route] = key.split(' ');
                if (method !== req.method) continue;
                const expected = route.split('/');
                const actual = req.path.split('/');
                if (expected.length !== actual.length) continue;
                const params = {};
                if (!expected.every((part, i) => {
                    if (part.startsWith(':')) { params[part.slice(1)] = actual[i]; return true; }
                    return part === actual[i];
                })) continue;
                req.params = params;
                handlers = routeHandlers;
                break;
            }
            if (!handlers) return res.status(404).json({ message: 'Route not registered' });
            const chain = [...(privacyPath ? privacyMiddleware : middleware), ...handlers];
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

async function run(endpoint, body, token = 'member', options = {}, method = 'POST') {
    const { server, state } = setup(candidate, options);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/familytree/${endpoint}`, {
            method,
            headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.pageToken ? { 'X-FT-Page-Token': options.pageToken } : {}) },
            ...(method === 'GET' ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(5000)
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

const unavailable = 'Cross-tree One Tree operations are temporarily unavailable.';
const sourceFamilyTreeCode = 'SYN-A';
const bridge = { focalPersonID: 11, relatedPersonID: 12, relationshipKind: 'partner' };
const reviewURL = (id, code = sourceFamilyTreeCode) => `one-tree/review?sourceFamilyTreeCode=${code}&targetPersonID=${id}`;
const merge = (id, extra = {}) => ({ sourceFamilyTreeCode, targetPersonID: id, decisions: [], ...extra });
const use = (id, extra = {}) => ({ personID: id, familyTreeCode: sourceFamilyTreeCode, ...extra });
const unlock = { sourceFamilyTreeCode, targetPersonID: 21, keyCode: 'synthetic-key' };
let passed = 0;
let failed = 0;
async function check(label, work) {
    try {
        await work();
        passed++;
        console.log(`PASS ${label}`);
    } catch (error) {
        failed++;
        console.error(`FAIL ${label}: ${error.stack || error}`);
    }
}
function zeroWrites(r, status) {
    assert.equal(r.status, status, JSON.stringify(r.data));
    assert.equal(r.state.writes.length, 0, 'unexpected SQL write');
    assert.equal(r.state.committed.length, 0);
    assert.equal(r.state.commits, 0);
    assert.equal(r.state.recordCalls.length, 0);
    assert.equal(r.state.mergeCalls.length, 0);
    assert.equal(r.state.reviewCalls, 0);
    assert.equal(r.state.emails.length, 0);
    assert.equal(r.state.usage.length, 0);
}
function suspended(r, noLookup = true, code = true) {
    zeroWrites(r, 403);
    assert.equal(r.data.message, unavailable);
    if (code) assert.equal(r.data.code, 'ONE_TREE_UNAVAILABLE');
    assert.deepEqual(Object.keys(r.data).sort(), code ? ['code', 'message'] : ['message']);
    if (noLookup) assert.equal(r.state.targetReads.length, 0, 'unexpected global target lookup');
    assert.equal(r.state.privacyReads, 0, 'unexpected privacy data read');
    assert.ok(!r.state.queries.some(q => /SELECT DISTINCT p.PersonID FROM FTPersonPrivacyT/.test(q.sql)));
    assert.equal(r.state.errors.length, 0);
}
function preserved(r, writes = false) {
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.state.reviewCalls, 0);
    assert.equal(r.state.recordCalls.length, 0);
    assert.equal(r.state.mergeCalls.length, 0);
    assert.equal(r.state.errors.length, 0);
    assert.equal(r.state.emails.length, 0);
    assert.equal(r.state.writes.length > 0, writes);
    if (writes) assert.equal(r.state.commits, 1);
}
async function main() {
    for (const [label, token, id] of [
        ['member of both Trees', 'member', 21],
        ['unrelated Tree', 'member', 31],
        ['unknown Person', 'member', 999],
        ['verified administrator', 'admin', 21]
    ]) {
        await check(`review denied: ${label}`, async () => suspended(await run(reviewURL(id), null, token, {}, 'GET')));
        await check(`merge denied: ${label}`, async () => suspended(await run('one-tree/merge', merge(id), token)));
        await check(`existing-Person selection denied: ${label}`, async () => suspended(await run('use-existing-person', use(id), token)));
    }
    await check('review denies even when target has source membership but resolves elsewhere', async () => {
        suspended(await run(reviewURL(12), null, 'member', { targetMismatch: true }, 'GET'), false);
    });
    await check('merge denies inconsistent resolved target', async () => suspended(await run('one-tree/merge', merge(12), 'member', { targetMismatch: true }), false));
    await check('existing selection denies inconsistent resolved target', async () => suspended(await run('use-existing-person', use(12), 'member', { targetMismatch: true }), false));
    await check('merge valid-looking decisions and page capability do not bypass suspension', async () => {
        suspended(await run('one-tree/merge', merge(21, { decisions: [{ newerPersonID: 21, olderPersonID: 11, decision: 'same' }], bridge }), 'member', { pageToken: JSON.stringify({ 21: 'a'.repeat(64) }), privateLocked: true }));
    });
    await check('implicit review denied with default source', async () => suspended(await run('use-existing-person', { personID: 21 })));
    await check('implicit review denied with focal source', async () => {
        const r = await run('use-existing-person', { personID: 21, focalPersonID: 11, relationshipKind: 'partner' });
        suspended(r, false);
        assert.deepEqual(r.state.targetReads, [11]);
    });
    for (const [label, token] of [['ordinary user', 'member'], ['administrator', 'admin'], ['other user', 'other']]) {
        await check(`specialized unlock denied: ${label}`, async () => {
            const r = await run('privacy/one-tree/unlock/21', unlock, token);
            suspended(r, true, false);
            assert.equal(r.state.begins, 0);
        });
    }
    await check('specialized unlock denies malformed or same-Tree requests without privacy reads', async () => {
        suspended(await run('privacy/one-tree/unlock/11', { targetPersonID: 11 }), true, false);
    });
    for (const [label, token, status] of [['no token', null, 401], ['no subscription', 'no-subscription', 403], ['native token', 'native', 403], ['unauthorized source', 'other', 403], ['name-only admin', 'name-only', 403], ['flag-only admin', 'flag-only', 403]]) {
        await check(`merge access boundary: ${label}`, async () => zeroWrites(await run('one-tree/merge', merge(21), token), status));
    }
    await check('unauthenticated specialized unlock rejected', async () => zeroWrites(await run('privacy/one-tree/unlock/21', unlock, null), 401));
    await check('unauthenticated review rejected', async () => zeroWrites(await run(reviewURL(21), null, null, {}, 'GET'), 401));
    await check('membership lookup failure closed and internal detail hidden', async () => {
        const r = await run('one-tree/merge', merge(21), 'member', { guardFailure: true });
        zeroWrites(r, 500);
        assert.equal(r.data.message, 'Internal Server Error');
    });
    await check('same-Tree review and legacy Tree alias preserved', async () => {
        const r = await run(reviewURL(12, 'SYN-OLD'), null, 'member', {}, 'GET');
        preserved(r);
        assert.equal(r.data.alreadySameTree, true);
        assert.equal(r.data.FamilyTreeCode, 'SYN-A');
        assert.deepEqual(r.data.candidateGroups, []);
    });
    await check('same-Tree review preserved for verified administrator', async () => {
        const r = await run(reviewURL(12), null, 'admin', {}, 'GET');
        preserved(r); assert.equal(r.data.alreadySameTree, true);
    });
    await check('same-Tree merge with no bridge returns zero merged Persons', async () => {
        const r = await run('one-tree/merge', merge(12));
        preserved(r); assert.equal(r.data.mergedPersonCount, 0);
    });
    for (const [label, token] of [['member', 'member'], ['administrator', 'admin']]) {
        await check(`same-Tree partner bridge preserved: ${label}`, async () => {
            const r = await run('one-tree/merge', merge(12, { bridge }), token);
            preserved(r, true);
            assert.ok(r.state.writes.some(x => x.sql.startsWith('INSERT IGNORE INTO FTPartnerT')));
            assert.ok(r.state.writes.every(x => /^INSERT IGNORE INTO (FTFamilyTreePersonT|FTPartnerT) /.test(x.sql)));
        });
    }
    await check('same-Tree bridge still rejects unrelated focal Person (H02 regression)', async () => {
        zeroWrites(await run('one-tree/merge', merge(12, { bridge: { ...bridge, focalPersonID: 31 } })), 403);
    });
    await check('same-Tree bridge still rejects unrelated related Person (H02 regression)', async () => {
        zeroWrites(await run('one-tree/merge', merge(12, { bridge: { ...bridge, relatedPersonID: 31 } })), 403);
    });
    await check('same-Tree existing Person selection preserved', async () => {
        const r = await run('use-existing-person', use(12, { focalPersonID: 11, relationshipKind: 'partner' }));
        preserved(r, true); assert.equal(r.data.PersonID, 12);
    });
    await check('existing first-Tree enrollment remains unchanged (separate policy risk)', async () => {
        const r = await run('use-existing-person', { personID: 21 }, 'new-user');
        preserved(r, true); assert.equal(r.data.FamilyTreeID, 2);
        assert.ok(r.state.writes.some(x => x.sql.startsWith('INSERT INTO FTFamilyTreeUserT')));
    });
    await check('ordinary privacy unlock: public Person remains public', async () => {
        const r = await run('privacy/unlock/12', { familyTreeCode: 'SYN-A', keyCode: 'synthetic-key' });
        preserved(r); assert.equal(r.data.message, 'Person is public.');
    });
    await check('ordinary privacy unlock: correct key produces page capability', async () => {
        const r = await run('privacy/unlock/12', { familyTreeCode: 'SYN-A', keyCode: 'synthetic-key' }, 'member', { privatePerson: true });
        preserved(r, true); assert.match(r.data.pageToken, /^[0-9a-f]{64}$/);
        const hashed = crypto.createHash('sha256').update(r.data.pageToken).digest('hex');
        assert.ok(r.state.writes.some(x => x.sql.startsWith('INSERT INTO FTPrivacyUnlockT') && x.params.includes(hashed)));
    });
    await check('ordinary privacy unlock: incorrect key remains denied', async () => {
        const r = await run('privacy/unlock/12', { familyTreeCode: 'SYN-A', keyCode: 'wrong-key' }, 'member', { privatePerson: true });
        assert.equal(r.status, 403); assert.equal(r.data.message, 'Incorrect key code.');
        assert.equal(r.state.writes.length, 1);
        assert.ok(r.state.writes[0].sql.startsWith('INSERT INTO FTPrivacyAttemptT'));
    });
    await check('ordinary privacy unlock: verified administrator retains access', async () => {
        const r = await run('privacy/unlock/12', { familyTreeCode: 'SYN-A' }, 'admin', { privatePerson: true });
        preserved(r); assert.equal(r.data.message, 'Administrator access authorized.');
    });
    await check('ordinary privacy unlock: unrelated Person denied', async () => {
        zeroWrites(await run('privacy/unlock/21', { familyTreeCode: 'SYN-A', keyCode: 'synthetic-key' }, 'member', { privatePerson: true }), 404);
    });
    await check('authorized undo options preserved', async () => {
        const r = await run('one-tree/undo-options?familyTreeCode=SYN-A', null, 'member', {}, 'GET');
        preserved(r); assert.equal(r.data.merges[0].TreeMergeID, 50);
    });
    await check('authorized undo review preserved', async () => {
        const r = await run('one-tree/undo-review/50', null, 'member', {}, 'GET');
        preserved(r); assert.equal(r.data.TreeMergeID, 50);
    });
    await check('unauthorized undo review remains denied', async () => zeroWrites(await run('one-tree/undo-review/50', null, 'other', {}, 'GET'), 403));
    await check('unauthorized undo execution remains denied by actual helper', async () => zeroWrites(await run('one-tree/undo', { treeMergeID: 50 }, 'other'), 403));
    for (const token of ['member', 'admin']) {
        await check(`authorized undo executes actual helper against synthetic snapshot: ${token}`, async () => {
            const r = await run('one-tree/undo', { treeMergeID: 50 }, token);
            preserved(r, true); assert.equal(r.data.FamilyTreeCode, 'SYN-OLD');
            assert.ok(r.state.writes.some(x => x.sql.startsWith("UPDATE FTTreeMergeT SET Status='UNDONE'")));
        });
    }
    await check('already undone merge remains denied', async () => zeroWrites(await run('one-tree/undo', { treeMergeID: 50 }, 'member', { undone: true }), 409));
    console.log(`RESULT: ${passed} passed, ${failed} failed, ${passed + failed} cases.`);
    process.exitCode = failed ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
