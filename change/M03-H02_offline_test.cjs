'use strict';

// WA M03-H02: synthetic-only HTTP regression harness. Never starts server.js,
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

function loadSource(filename, dependencies, logErrors) {
    const module = { exports: {} };
    const source = fs.readFileSync(filename, 'utf8');
    const wrapper = vm.runInThisContext(`(function(require,module,exports,process,console){\n${source}\n})`, { filename });
    wrapper((name) => {
        if (!Object.prototype.hasOwnProperty.call(dependencies, name)) {
            throw new Error(`Unexpected module dependency: ${name}`);
        }
        return dependencies[name];
    }, module, module.exports, { env: { ADMIN_USERNAME: 'synthetic-admin', JWT_SECRET: 'synthetic-not-a-live-secret' } }, {
        ...console,
        error: (...values) => logErrors.push(values.map(String).join(' '))
    });
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
        options, queries: [], writes: [], committed: [], usage: [], emails: [], errors: [],
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
    const router = loadSource(routeFile, dependencies, state.errors);
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

const existingBody = { familyTreeCode: 'SYN-A', focalPersonID: 11, relatedPersonID: 12, relationshipKind: 'partner' };
const newBody = { familyTreeCode: 'SYN-A', focalPersonID: 11, relationshipKind: 'partner', FirstName: 'New', LastName: 'Synthetic' };
const kinds = ['mother', 'father', 'child', 'sibling', 'partner'];
const endpoints = ['relationships', 'related-person'];
function base(endpoint) { return endpoint === 'relationships' ? existingBody : newBody; }
let passed = 0;
let failed = 0;
async function check(label, work) {
    try { await work(); passed++; console.log(`PASS ${label}`); }
    catch (error) { failed++; console.error(`FAIL ${label}: ${error.stack || error}`); }
}
function noWrites(result, status) {
    assert.equal(result.status, status, JSON.stringify(result.data));
    assert.equal(result.state.writes.length, 0, 'SQL mutation was attempted');
    assert.equal(result.state.committed.length, 0);
    assert.equal(result.state.usage.length, 0);
    assert.equal(result.state.emails.length, 0);
    assert.equal(result.state.duplicateReads, 0);
    assert.equal(result.state.commits, 0);
}
function success(result, endpoint, kind, expectedTree = 1) {
    assert.equal(result.status, 201, JSON.stringify(result.data));
    assert.equal(result.state.commits, 1);
    assert.equal(result.state.rollbacks, 0);
    assert.equal(result.state.errors.length, 0);
    assert.equal(result.state.usage.length, 2);
    assert.equal(result.state.emails.length, 0); // no actual email fixtures
    const relationTable = ['mother', 'father', 'child'].includes(kind) ? 'FTParentT' : kind === 'sibling' ? 'FTSiblingT' : 'FTPartnerT';
    const relation = result.state.writes.filter(w => new RegExp(`^INSERT INTO ${relationTable}\\b`).test(w.sql));
    assert.equal(relation.length, 1);
    assert.equal(relation[0].params[0], expectedTree);
    const membershipWrites = result.state.writes.filter(w => /^INSERT (?:IGNORE )?INTO FTFamilyTreePersonT\b/.test(w.sql));
    assert.equal(membershipWrites.length, endpoint === 'related-person' ? 1 : 0);
    if (endpoint === 'related-person') {
        assert.equal(result.data.PersonID, 1000);
        assert.equal(result.data.FamilyTreeCode, expectedTree === 1 ? 'SYN-A' : 'SYN-B');
        assert.equal(result.state.writes.filter(w => /^INSERT INTO FTPersonT\b/.test(w.sql)).length, 1);
        assert.deepEqual(membershipWrites[0].params.slice(0, 2), [expectedTree, 1000]);
        assert.ok(result.state.member.has(`${expectedTree}:1000`));
    } else {
        assert.equal(result.data.message, 'Relationship saved.');
        assert.equal(result.state.writes.filter(w => /^INSERT INTO FTPersonT\b/.test(w.sql)).length, 0);
    }
    const firstWrite = result.state.queries.findIndex(q => /^(INSERT|UPDATE|DELETE|REPLACE)\b/.test(q.sql));
    const membershipReadIndexes = result.state.queries.flatMap((q, i) => q.sql.includes('FOR UPDATE') ? [i] : []);
    assert.equal(membershipReadIndexes.length, endpoint === 'relationships' ? 2 : 1);
    assert.ok(membershipReadIndexes.every(i => i < firstWrite));
}

async function main() {
    console.log(`Mode: ${useExpress ? 'actual Express router + middleware' : 'native loopback HTTP adapter + registered handlers'}; ${process.version}`);
    console.log('Synthetic fixtures only; all DB, token verification, entitlement, email, storage and usage sinks isolated.');
    for (const endpoint of endpoints) {
        for (const kind of kinds) {
            await check(`${endpoint}: ${kind} positive`, async () => {
                const body = { ...base(endpoint), relationshipKind: kind };
                const result = await run(candidate, endpoint, body);
                success(result, endpoint, kind);
                if (baseline) {
                    const original = await run(path.resolve(baseline), endpoint, body);
                    assert.equal(original.status, 201);
                    assert.deepEqual(result.data, original.data);
                    // Existing-person redundant membership INSERT is the only approved SQL removal.
                    const substantive = original.state.writes.filter(w => !(endpoint === 'relationships' && /^INSERT IGNORE INTO FTFamilyTreePersonT\b/.test(w.sql)));
                    assert.deepEqual(result.state.writes.map(w => w.sql), substantive.map(w => w.sql));
                    // First relationship write parameters must retain the original semantics.
                    const relation = w => /^INSERT INTO (FTParentT|FTSiblingT|FTPartnerT)\b/.test(w.sql);
                    assert.deepEqual(result.state.writes.find(relation).params, substantive.find(relation).params);
                }
            });
        }
        for (const [name, value] of [['unsupported', 'aunt'], ['empty', ''], ['missing', undefined], ['non-string', ['mother']]]) {
            await check(`${endpoint}: ${name} kind / zero writes`, async () => {
                const result = await run(candidate, endpoint, { ...base(endpoint), relationshipKind: value });
                noWrites(result, 400);
            });
        }
        for (const [name, value] of [['foreign', 31], ['other accessible Tree', 21], ['not associated', 41], ['nonexistent', 999], ['dangling membership', 99]]) {
            await check(`${endpoint}: ${name} focal / zero writes`, async () => {
                const result = await run(candidate, endpoint, { ...base(endpoint), focalPersonID: value });
                noWrites(result, 403);
                assert.equal(result.data.message, 'Person does not belong to this Family Tree.');
            });
        }
        for (const value of [0, -1, 11.5, true, [11], '11e0', {}, undefined]) {
            await check(`${endpoint}: malformed focal ${JSON.stringify(value)} / zero writes`, async () => {
                noWrites(await run(candidate, endpoint, { ...base(endpoint), focalPersonID: value }), 400);
            });
        }
        for (const [name, token, status] of [['missing auth', null, 401], ['invalid auth', 'invalid', 401], ['native token', 'native', 403], ['no entitlement', 'no-subscription', 403], ['other Tree user', 'other', 403], ['admin name only', 'name-only', 403], ['admin flag only', 'flag-only', 403]]) {
            await check(`${endpoint}: ${name} / zero writes`, async () => noWrites(await run(candidate, endpoint, base(endpoint), token), status));
        }
        await check(`${endpoint}: alias + uppercase kind + decimal ID strings`, async () => {
            const body = { ...base(endpoint), familyTreeCode: 'SYN-OLD', focalPersonID: '11', relationshipKind: 'PARTNER' };
            if (endpoint === 'relationships') body.relatedPersonID = '12';
            success(await run(candidate, endpoint, body), endpoint, 'partner');
        });
        await check(`${endpoint}: legitimate second authorized Tree`, async () => {
            const body = { ...base(endpoint), familyTreeCode: 'SYN-B', focalPersonID: 21 };
            if (endpoint === 'relationships') body.relatedPersonID = 22;
            success(await run(candidate, endpoint, body), endpoint, 'partner', 2);
        });
        await check(`${endpoint}: verified admin without user-Tree membership`, async () => {
            success(await run(candidate, endpoint, base(endpoint), 'admin'), endpoint, 'partner');
        });
        await check(`${endpoint}: admin cannot violate selected-Tree integrity`, async () => {
            noWrites(await run(candidate, endpoint, { ...base(endpoint), focalPersonID: 21 }, 'admin'), 403);
        });
        await check(`${endpoint}: private same-Tree focal; no new key requirement`, async () => {
            success(await run(candidate, endpoint, { ...base(endpoint), focalPersonID: 13 }), endpoint, 'partner');
        });
        await check(`${endpoint}: verified admin lookup failure`, async () => {
            const result = await run(candidate, endpoint, base(endpoint), 'admin', { adminFailure: true });
            noWrites(result, 500);
            assert.equal(result.data.message, 'Internal Server Error');
        });
        for (const status of [403, 500]) {
            await check(`${endpoint}: unexpected membership DB error ${status}; generic / zero writes`, async () => {
                const result = await run(candidate, endpoint, base(endpoint), 'member', { membershipFailure: status });
                noWrites(result, status);
                assert.equal(result.data.message, 'Internal Server Error');
            });
        }
        await check(`${endpoint}: downstream write failure; rollback and no usage/commit`, async () => {
            const result = await run(candidate, endpoint, { ...base(endpoint), relationshipKind: 'mother' }, 'member', { writeFailure: true });
            assert.equal(result.status, 500);
            assert.equal(result.data.message, 'Internal Server Error');
            assert.ok(result.state.writes.length > 0);
            assert.equal(result.state.committed.length, 0);
            assert.equal(result.state.rollbacks, 1);
            assert.equal(result.state.usage.length, 0);
            assert.equal(result.state.member.has('1:1000'), false);
            assert.equal(result.state.people.has(1000), false);
        });
    }
    for (const [name, value] of [['foreign', 31], ['other accessible Tree', 21], ['not associated', 41], ['nonexistent', 999], ['dangling membership', 99]]) {
        await check(`relationships: ${name} related / zero writes`, async () => {
            const result = await run(candidate, 'relationships', { ...existingBody, relatedPersonID: value });
            noWrites(result, 403);
            assert.equal(result.data.message, 'Person does not belong to this Family Tree.');
        });
    }
    for (const value of [0, -1, 12.5, true, [12], {}, undefined]) {
        await check(`relationships: malformed related ${JSON.stringify(value)} / zero writes`, async () => {
            noWrites(await run(candidate, 'relationships', { ...existingBody, relatedPersonID: value }), 400);
        });
    }
    await check('relationships: identical focal/related / zero writes', async () => noWrites(await run(candidate, 'relationships', { ...existingBody, relatedPersonID: 11 }), 400));
    await check('relationships: deterministic membership lock ordering', async () => {
        const result = await run(candidate, 'relationships', { ...existingBody, focalPersonID: 12, relatedPersonID: 11 });
        success(result, 'relationships', 'partner');
        assert.deepEqual(result.state.membershipChecks, [[1, 11], [1, 12]]);
    });
    await check('relationships: duplicate partner retains 409 and rollback', async () => {
        const result = await run(candidate, 'relationships', existingBody, 'member', { duplicatePartner: true });
        assert.equal(result.status, 409);
        assert.equal(result.data.message, 'That relationship already exists.');
        assert.equal(result.state.writes.length, 1);
        assert.equal(result.state.committed.length, 0);
        assert.equal(result.state.rollbacks, 1);
        assert.equal(result.state.usage.length, 0);
    });
    await check('related-person: duplicate review after membership; redacts private candidate', async () => {
        const result = await run(candidate, 'related-person', { ...newBody, FirstName: 'Synthetic', LastName: 'Duplicate' }, 'member', { duplicate: true });
        assert.equal(result.status, 409);
        assert.equal(result.data.code, 'DUPLICATE_REVIEW_REQUIRED');
        assert.equal(result.data.matches[0].PersonID, 13);
        assert.equal(result.data.matches[0].IsPrivate, true);
        assert.equal('Gender' in result.data.matches[0], false);
        assert.equal(result.state.writes.length, 0);
        assert.equal(result.state.duplicateReads, 1);
        assert.equal(result.state.usage.length, 0);
        assert.ok(result.state.queries.findIndex(q => q.sql.includes('FOR UPDATE')) < result.state.queries.findIndex(q => q.sql.startsWith('SELECT DISTINCT p.PersonID')));
    });
    await check('related-person: unauthorized focal prevents duplicate review and response details', async () => {
        const result = await run(candidate, 'related-person', { ...newBody, focalPersonID: 31, FirstName: 'Synthetic', LastName: 'Duplicate' }, 'member', { duplicate: true });
        noWrites(result, 403);
        assert.equal('matches' in result.data, false);
    });
    await check('related-person: verified admin retains private duplicate visibility', async () => {
        const result = await run(candidate, 'related-person', { ...newBody, FirstName: 'Synthetic', LastName: 'Duplicate' }, 'admin', { duplicate: true });
        assert.equal(result.status, 409);
        assert.equal(result.data.matches[0].Gender, 'Male');
        assert.equal(result.state.writes.length, 0);
        assert.equal(result.state.usage.length, 0);
    });
    await check('related-person: confirmed different candidate preserves creation workflow', async () => {
        const result = await run(candidate, 'related-person', { ...newBody, FirstName: 'Synthetic', LastName: 'Duplicate', confirmedDifferentPersonIDs: [13] }, 'member', { duplicate: true });
        success(result, 'related-person', 'partner');
        assert.equal(result.state.duplicateReads, 1);
    });
    await check('related-person: birth milestone event and person association retained', async () => {
        const result = await run(candidate, 'related-person', { ...newBody, BirthDate: '2000-01-01' });
        success(result, 'related-person', 'partner');
        assert.ok(result.state.writes.some(w => /^INSERT INTO FTEventT\b/.test(w.sql)));
        assert.ok(result.state.writes.some(w => /^INSERT INTO FTEventPersonT\b/.test(w.sql)));
    });
    await check('related-person: missing name / zero writes', async () => noWrites(await run(candidate, 'related-person', { ...newBody, FirstName: '', LastName: '' }), 400));
    await check('use-existing-person: existing same-Tree selection remains unchanged', async () => {
        const body = { familyTreeCode: 'SYN-A', focalPersonID: 11, personID: 12, relationshipKind: 'partner' };
        const result = await run(candidate, 'use-existing-person', body);
        assert.equal(result.status, 200, JSON.stringify(result.data));
        assert.deepEqual(result.data, { PersonID: 12, FamilyTreeID: 1, FamilyTreeCode: 'SYN-A' });
        assert.equal(result.state.commits, 1);
        assert.equal(result.state.rollbacks, 0);
        assert.equal(result.state.errors.length, 0);
        assert.equal(result.state.writes.filter(w => /^INSERT IGNORE INTO FTPartnerT\b/.test(w.sql)).length, 1);
        if (baseline) {
            const original = await run(path.resolve(baseline), 'use-existing-person', body);
            assert.equal(original.status, result.status);
            assert.deepEqual(original.data, result.data);
            assert.deepEqual(original.state.writes, result.state.writes);
        }
    });
    if (baseline) {
        for (const endpoint of endpoints) {
            await check(`original baseline ${endpoint}: unsupported kind attempts writes then rolls back`, async () => {
                const result = await run(path.resolve(baseline), endpoint, { ...base(endpoint), relationshipKind: 'aunt' });
                assert.equal(result.status, 400);
                assert.ok(result.state.writes.length > 0);
                assert.equal(result.state.committed.length, 0);
                assert.equal(result.state.rollbacks, 1);
            });
        }
    }
    console.log(`RESULT: ${passed} passed, ${failed} failed, ${passed + failed} cases.`);
    process.exitCode = failed ? 1 : 0;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
