'use strict';

// M03-H03: real SQL execution, with an outer transaction that is NEVER committed.
// Only synthetic fixtures in wapps_test are permitted. Only an isolated loopback HTTP listener is started; the WA server is not started.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');

const project = process.cwd();
const expectedHash = '75b705aed2b6958273e03e1e0bdf97be028f96cd2fc8d860b569b1fe7a3c8906';
const baselineCommit = 'fd2e1c308b3f8f4e4ff55c6996a5e00a13af5c10';
const scopeColumns = {
    UsersT: ['UserID', 'users'],
    FamilyTreeT: ['FamilyTreeID', 'trees'],
    FTFamilyTreeUserT: ['FamilyTreeID', 'trees'],
    FTFamilyTreePersonT: ['FamilyTreeID', 'trees'],
    FTPersonT: ['PersonID', 'people'],
    FTParentT: ['FamilyTreeID', 'trees'],
    FTPartnerT: ['FamilyTreeID', 'trees'],
    FTSiblingT: ['FamilyTreeID', 'trees'],
    FTFamilyTreeActivityT: ['FamilyTreeID', 'trees'],
    FTTreeMergeT: ['SourceFamilyTreeID', 'trees'],
    FTPersonMergeT: ['SourcePersonID', 'people'],
    FTPersonPrivacyT: ['PersonID', 'people'],
    FTPrivacyUnlockT: ['PersonID', 'people'],
    FTImageT: ['PersonID', 'people'],
    FTContactT: ['PersonID', 'people'],
    FTEventPersonT: ['PersonID', 'people']
};

function guardEnv(env) {
    assert.equal(env.DB_HOST, 'morty2.heliohost.org', 'Unexpected DB host');
    assert.equal(env.DB_NAME, 'wapps_test', 'Unexpected database');
    assert.equal(env.DB_USER, 'wapps_test', 'Unexpected account');
    assert.equal(env.DB_PORT, '3306', 'Unexpected port');
    assert.ok(env.DB_PASSWORD, 'Missing test password');
}

function normalize(sql) {
    return sql.trim().replace(/\s+/g, ' ');
}

// Only the specific DML shapes needed by these fixtures are allowed. Route
// writes against a real Person, Tree, user, merge ID or external resource fail.
function classify(sql, params, scope) {
    const s = normalize(sql);
    assert.ok(!/[;]|\/\*|--/.test(s), 'Compound or commented SQL blocked');
    if (/^SELECT\b/i.test(s) && !/\b(?:INTO|GET_LOCK|RELEASE_LOCK|SLEEP|BENCHMARK)\b/i.test(s)) {
        return 'read';
    }
    const member = (set, value) => {
        assert.ok(Number.isSafeInteger(Number(value)) && set.has(Number(value)), 'Non-fixture ID blocked');
    };
    const tree = value => member(scope.trees, value);
    const person = value => member(scope.people, value);
    const user = value => member(scope.users, value);
    const merge = value => member(scope.merges, value);
    const last = params[params.length - 1];
    if (/^INSERT INTO FTTreeMergeT \(SourceFamilyTreeID,SurvivingFamilyTreeID,MergedByUserID,MergedAt,Status, BridgeJSON,DecisionsJSON,MergeSnapshot,CreatedR2KeysJSON\) VALUES /i.test(s)) {
        tree(params[0]); tree(params[1]); user(params[2]);
        return 'merge-insert';
    }
    if (/^INSERT INTO FTPersonMergeT \(TreeMergeID,SourcePersonID,SurvivingPersonID,SourceFamilyTreeID,SurvivingFamilyTreeID, MergedByUserID,MergedAt,MergeReason,ConflictResolutionJSON, SourcePersonSnapshot,SurvivingPersonSnapshotBefore,SurvivingPersonSnapshotAfter\) VALUES /i.test(s)) {
        merge(params[0]); person(params[1]); person(params[2]); tree(params[3]); tree(params[4]); user(params[5]);
        return 'write';
    }
    if (/^UPDATE FTPersonT SET FirstName=\?,MiddleName=\?,LastName=\?,SuffixName=\?,NickName=\?,MaidenName=\?, Gender=\?,BirthDate=\?,BirthPlace=\?,CurrentCity=\?,CurrentState=\?,Died=\?,DeathDate=\?,DeathPlace=\?,UpdatedByUserID=\?,UpdatedAt=NOW\(\) WHERE PersonID=\?$/i.test(s)) {
        person(last); user(params[14]);
        return 'write';
    }
    if (/^INSERT INTO FTFamilyTreePersonT \(FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt,Notes\) VALUES /i.test(s)) {
        tree(params[0]); person(params[1]); tree(params[2]); user(params[3]);
        return 'write';
    }
    if (/^INSERT INTO FTFamilyTreeUserT \(FamilyTreeID,UserID,JoinedAt,LastActivityAt,IsActive,AddedByUserID\) VALUES /i.test(s)) {
        tree(params[0]); user(params[1]); user(params[4]);
        return 'write';
    }
    if (/^INSERT IGNORE INTO FTSiblingT \(FamilyTreeID,PersonID,SiblingPersonID,Notes, CreatedByUserID,CreatedAt,UpdatedByUserID,UpdatedAt\) VALUES /i.test(s)) {
        tree(params[0]); person(params[1]); person(params[2]); user(params[4]);
        if (params[6] !== null) user(params[6]);
        return 'write';
    }
    if (/^DELETE FROM (FTParentT|FTPartnerT|FTSiblingT|FTFamilyTreePersonT) WHERE FamilyTreeID=\?$/i.test(s)) {
        tree(params[0]);
        return 'write';
    }
    if (/^UPDATE FTFamilyTreeUserT SET IsActive=0,LastActivityAt=NOW\(\) WHERE FamilyTreeID=\?$/i.test(s)) {
        tree(params[0]);
        return 'write';
    }
    if (/^DELETE FROM FTPersonT WHERE PersonID=\?$/i.test(s)) {
        person(params[0]);
        return 'write';
    }
    if (/^UPDATE FamilyTreeT SET Status='Merged',MergedIntoFamilyTreeID=\?,MergedAt=NOW\(\),MergedByUserID=\?,LastActivityAt=NOW\(\),LastActivityByUserID=\? WHERE FamilyTreeID=\?$/i.test(s)) {
        tree(params[0]); user(params[1]); user(params[2]); tree(last);
        return 'write';
    }
    if (/^INSERT INTO FTFamilyTreeActivityT \( FamilyTreeID, UserID, ActivityType, EntityType, EntityID, AffectedPersonID, TargetCreatedByUserID, ActivityAt, ActivityDescription \) VALUES /i.test(s)) {
        tree(params[0]); user(params[1]); user(params[6]);
        if (params[3] === 'FamilyTreeT') tree(params[4]);
        else if (params[3] === 'FTPersonT') person(params[4]);
        else throw Error('Unexpected activity entity');
        if (params[5] !== null) person(params[5]);
        return 'write';
    }
    if (/^UPDATE FamilyTreeT SET LastActivityAt=NOW\(\), LastActivityByUserID=\?, Status=\? WHERE FamilyTreeID=\?$/i.test(s)) {
        user(params[0]); tree(last);
        return 'write';
    }
    if (/^UPDATE FTFamilyTreeUserT SET LastActivityAt=NOW\(\) WHERE FamilyTreeID=\? AND UserID=\?$/i.test(s)) {
        tree(params[0]); user(params[1]);
        return 'write';
    }
    if (/^UPDATE FTTreeMergeT SET CreatedR2KeysJSON=\? WHERE TreeMergeID=\?$/i.test(s)) {
        assert.deepEqual(JSON.parse(params[0]), [], 'External storage keys not permitted');
        merge(last);
        return 'write';
    }
    throw Error('Unexpected SQL statement blocked');
}

function makeAdapter(connection, scope, state) {
    let active = false;
    let poisoned = false;
    const adapter = {
        async beginTransaction() {
            assert.ok(!state.stopping && !active && !poisoned, 'Invalid route transaction state');
            const [[transaction]] = await connection.query('SELECT @@in_transaction AS active');
            assert.equal(Number(transaction.active), 1, 'Outer transaction missing');
            assert.ok(!state.stopping, 'Test is stopping');
            await connection.query('SAVEPOINT wa_h03_route');
            active = true;
        },
        async commit() {
            assert.ok(!state.stopping && active && !poisoned);
            await connection.query('RELEASE SAVEPOINT wa_h03_route');
            active = false;
        },
        async rollback() {
            if (!active || state.stopping) return;
            try {
                await connection.query('ROLLBACK TO SAVEPOINT wa_h03_route');
                await connection.query('RELEASE SAVEPOINT wa_h03_route');
            } catch (error) {
                poisoned = true;
                throw error;
            } finally {
                active = false;
            }
        },
        release() {},
        async query(sql, params = []) {
            assert.ok(!state.stopping && !poisoned, 'Transaction adapter unavailable');
            let kind;
            try {
                kind = classify(sql, params, scope);
            } catch (error) {
                state.blocked.push(error.message);
                throw error;
            }
            if (kind !== 'read') {
                assert.ok(active, 'Route write outside savepoint');
                state.writes++;
            }
            try {
                const result = await connection.query(sql, params);
                if (kind === 'merge-insert') scope.merges.add(Number(result[0].insertId));
                return result;
            } catch (error) {
                state.sqlErrors.push(error.code || 'SQL_ERROR');
                poisoned = true;
                throw error;
            }
        }
    };
    // Do not dispatch post-commit tasks in a rollback-only test transaction.
    Object.defineProperty(adapter, '_ftAfterCommit', {
        configurable: true,
        get: () => null,
        set: () => {}
    });
    return new Proxy(adapter, {
        deleteProperty(target, key) {
            if (key === '_ftAfterCommit') return true;
            return Reflect.deleteProperty(target, key);
        }
    });
}

function load(file, dependencies, env) {
    const module = { exports: {} };
    const source = fs.readFileSync(path.join(project, file), 'utf8');
    const factory = vm.runInThisContext(`(function(require,module,exports,process){\n${source}\n})`, { filename: file });
    factory(name => {
        assert.ok(Object.hasOwn(dependencies, name), 'Blocked dependency: ' + name);
        return dependencies[name];
    }, module, module.exports, { env });
    return module.exports;
}

async function main() {
    guardEnv(process.env);
    assert.equal(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(), 'reviseLogIn');
    assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), baselineCommit);
    const candidate = path.join(project, 'routes', 'familyTree.js');
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(candidate)).digest('hex'), expectedHash, 'Installed route hash mismatch');
    const rq = createRequire(path.join(project, 'package.json'));
    const mysql = rq('mysql2/promise');
    const express = rq('express');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: 3306,
        ssl: { rejectUnauthorized: true },
        multipleStatements: false,
        connectTimeout: 15000
    });
    const prefix = 'WAH03' + crypto.randomBytes(5).toString('hex').toUpperCase();
    const scope = { users: new Set(), trees: new Set(), people: new Set(), merges: new Set() };
    const state = { writes: 0, blocked: [], sqlErrors: [], externalCalls: 0, stopping: false, current: "preflight/fixtures" };
    let server;
    let began = false;
    let passed = 0;
    const q = (sql, params = []) => connection.query(sql, params);
    const insert = async (sql, params) => Number((await q(sql, params))[0].insertId);
    const rows = async (sql, params) => (await q(sql, params))[0];
    const count = async (sql, params) => Number((await rows(sql, params))[0].n);

    async function snapshot(which = scope) {
        const result = {};
        for (const [table, [column, key]] of Object.entries(scopeColumns)) {
            const ids = [...which[key]];
            if (!ids.length) continue;
            const data = await rows(`SELECT * FROM ${table} WHERE ${column} IN (?)`, [ids]);
            result[table] = data.map(row => JSON.stringify(row)).sort();
        }
        return result;
    }

    try {
        const [identity] = await rows('SELECT DATABASE() AS db, CURRENT_USER() AS account');
        assert.equal(identity.db, 'wapps_test');
        assert.equal(identity.account.split('@')[0], 'wapps_test');
        const [tls] = await rows("SHOW SESSION STATUS LIKE 'Ssl_cipher'");
        assert.ok(tls && tls.Value, 'TLS session not verified');
        const engines = await rows("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE'");
        const engineMap = new Map(engines.map(row => [row.TABLE_NAME, row.ENGINE]));
        for (const table of Object.keys(scopeColumns)) assert.equal(engineMap.get(table), 'InnoDB', 'Missing/nontransactional table: ' + table);
        assert.ok(engines.every(row => row.ENGINE === 'InnoDB'), 'Nontransactional table: stop');
        const triggers = await rows('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE()');
        assert.equal(triggers.length, 0, 'Unexpected trigger: stop');
        console.log('DATABASE IDENTITY, TLS AND TRANSACTION ENGINE: PASS');
        await connection.beginTransaction();
        began = true;
        const [transaction] = await rows('SELECT @@in_transaction AS active');
        assert.equal(Number(transaction.active), 1, 'Outer transaction missing');

        async function user(suffix) {
            const name = prefix + suffix;
            const id = await insert('INSERT INTO UsersT (UserName,PasswordHash,Email,Phone1,IsAdministrator) VALUES (?,?,?,?,0)', [name, 'UNUSABLE_SYNTHETIC_PASSWORD', name + '@example.invalid', '0000000000']);
            scope.users.add(id);
            return id;
        }
        async function tree(suffix, owner, created) {
            const code = prefix + suffix;
            const id = await insert('INSERT INTO FamilyTreeT (FamilyTreeCode,CreatedByUserID,CreatedAt,LastActivityAt,LastActivityByUserID,Status) VALUES (?,?,?,NOW(),?,?)', [code, owner, created, owner, 'Active']);
            scope.trees.add(id);
            await q('INSERT INTO FTFamilyTreeUserT (FamilyTreeID,UserID,JoinedAt,IsActive,AddedByUserID) VALUES (?,?,NOW(),1,?)', [id, owner, owner]);
            return { id, code, owner };
        }
        async function person(t, name, city) {
            const id = await insert('INSERT INTO FTPersonT (FirstName,LastName,Gender,CurrentCity,CreatedByUserID,CreatedAt) VALUES (?,?,?,?,?,NOW())', [name, prefix, 'Male', city, t.owner]);
            scope.people.add(id);
            await q('INSERT INTO FTFamilyTreePersonT (FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt) VALUES (?,?,?,?,NOW())', [t.id, id, t.id, t.owner]);
            return id;
        }
        async function sibling(t, a, b) {
            await q('INSERT INTO FTSiblingT (FamilyTreeID,PersonID,SiblingPersonID,Notes,CreatedByUserID,CreatedAt) VALUES (?,?,?,?,?,NOW())', [t.id, Math.min(a, b), Math.max(a, b), prefix, t.owner]);
        }
        const member = await user('MEMBER');
        const outsider = await user('OUTSIDER');
        const older = await tree('A', member, '2025-01-01 00:00:00');
        const newer = await tree('B', member, '2025-01-02 00:00:00');
        const unrelated = await tree('C', outsider, '2025-01-03 00:00:00');
        const oldSame = await person(older, 'Same', 'OlderCity');
        const oldDifferent = await person(older, 'Different', null);
        const oldUnreviewed = await person(older, 'OlderOnly', null);
        const newSame = await person(newer, 'Same', 'NewerCity');
        const newDifferent = await person(newer, 'Different', null);
        const newUnreviewed = await person(newer, 'NewerOnly', null);
        const otherOne = await person(unrelated, 'SentinelOne', null);
        const otherTwo = await person(unrelated, 'SentinelTwo', null);
        await sibling(newer, newSame, newDifferent);
        await sibling(unrelated, otherOne, otherTwo);
        const sentinel = { users: new Set([outsider]), trees: new Set([unrelated.id]), people: new Set([otherOne, otherTwo]) };
        const untouched = await snapshot(sentinel);
        for (const table of ['FTImageT', 'FTContactT', 'FTEventPersonT', 'FTPersonPrivacyT']) {
            assert.equal(await count(`SELECT COUNT(*) n FROM ${table} WHERE PersonID IN (?)`, [[...scope.people]]), 0, 'Unexpected fixture-linked row');
        }
        const mutationScope = {
            users: new Set([member]),
            trees: new Set([older.id, newer.id]),
            people: new Set([oldSame, oldDifferent, oldUnreviewed, newSame, newDifferent, newUnreviewed]),
            merges: scope.merges
        };
        const adapter = makeAdapter(connection, mutationScope, state);
        const pool = { getConnection: async () => adapter, query: (...args) => adapter.query(...args) };
        class AuthenticationError extends Error {
            constructor() {
                super('INVALID_TEST_TOKEN');
                this.status = 401;
                this.code = 'INVALID_TEST_TOKEN';
            }
        }
        async function blockExternal() {
            state.externalCalls++;
            throw Error('External effect blocked');
        }
        const tokens = { member: { userId: member, client: 'web' }, outsider: { userId: outsider, client: 'web' } };
        const deps = {
            express,
            crypto,
            multer: rq('multer'),
            '../dbConnection': { pool },
            jsonwebtoken: {},
            '../services/verifyAccessToken': {
                AuthenticationError,
                async verifyAccessToken(token) {
                    if (!Object.hasOwn(tokens, token)) throw new AuthenticationError();
                    return { ...tokens[token] };
                }
            },
            '../services/subscriptionService': { async getAppAccess() { return { allowed: true }; }, async recordUsage() {} },
            '../services/notificationService': { sendNotification: blockExternal },
            '../r2Storage': new Proxy({}, { get: () => blockExternal })
        };
        const env = { ADMIN_USERNAME: prefix + 'NOADMIN', JWT_SECRET: 'synthetic-only' };
        deps['../services/stage6ExpectedClientError'] = load('services/stage6ExpectedClientError.js', deps, env);
        deps['../services/administratorAccess'] = load('services/administratorAccess.js', deps, env);
        deps['../middleware/auth'] = deps['./auth'] = load('middleware/auth.js', deps, env);
        const sub = load('middleware/subscriptionAccess.js', deps, env);
        const usage = load('middleware/usageActivity.js', deps, env);
        const privacy = deps['./ftPrivacy'] = load('routes/ftPrivacy.js', deps, env);
        const router = load('routes/familyTree.js', deps, env);
        const app = express();
        app.use(express.json());
        app.use('/familytree', sub.authenticateToken, sub.requireAppAccess('family_tree'), usage('family_tree'), privacy.protection, router);
        app.use((error, req, res, next) => res.status(500).json({ message: 'Test middleware failure' }));
        server = await new Promise((resolve, reject) => {
            const s = app.listen(0, '127.0.0.1', () => resolve(s));
            s.on('error', reject);
        });
        async function request(endpoint, body, token = 'member', method = 'POST') {
            const res = await fetch(`http://127.0.0.1:${server.address().port}/familytree/${endpoint}`, {
                method,
                headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
                ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
                signal: AbortSignal.timeout(60000)
            });
            return { status: res.status, data: await res.json() };
        }
        async function test(label, fn) {
            state.current = label;
            await fn();
            const [transaction] = await rows('SELECT @@in_transaction AS active');
            assert.equal(Number(transaction.active), 1, 'Outer transaction missing');
            assert.deepEqual(state.blocked, [], 'SQL guard was invoked');
            assert.deepEqual(state.sqlErrors, [], 'Unexpected SQL error');
            assert.equal(state.externalCalls, 0, 'External effect attempted');
            passed++;
            console.log('PASS ' + label);
        }
        const base = { sourceFamilyTreeCode: newer.code, targetPersonID: oldSame };
        const same = { newerPersonID: newSame, olderPersonID: oldSame, decision: 'same', resolutions: { CurrentCity: 'newer' }, keepImageIDs: [] };
        const different = { newerPersonID: newDifferent, decision: 'different' };
        const valid = [same, different];
        const baseline = await snapshot();
        await test('fresh server-generated review contains exactly two expected groups', async () => {
            const r = await request(`one-tree/review?sourceFamilyTreeCode=${newer.code}&targetPersonID=${oldSame}`, null, 'member', 'GET');
            assert.equal(r.status, 200);
            assert.equal(Number(r.data.olderTree.FamilyTreeID), older.id);
            assert.equal(Number(r.data.newerTree.FamilyTreeID), newer.id);
            assert.deepEqual(r.data.groups.map(g => Number(g.newerPerson.PersonID)).sort((a, b) => a - b), [newSame, newDifferent].sort((a, b) => a - b));
            const expected = new Map([[newSame, oldSame], [newDifferent, oldDifferent]]);
            for (const group of r.data.groups) {
                assert.deepEqual(group.candidates.map(c => Number(c.PersonID)), [expected.get(Number(group.newerPerson.PersonID))]);
            }
            assert.deepEqual(await snapshot(), baseline);
            assert.equal(state.writes, 0);
        });
        async function deny(label, decisions) {
            await test(label, async () => {
                const before = state.writes;
                const r = await request('one-tree/merge', { ...base, decisions });
                assert.equal(r.status, 409, 'Unexpected rejection status');
                assert.equal(state.writes, before, 'Rejected request attempted a write');
                assert.deepEqual(await snapshot(), baseline, 'Rejected request changed fixture state');
            });
        }
        await deny('unreviewed same decision rejected with zero writes', [...valid, { newerPersonID: newUnreviewed, olderPersonID: oldUnreviewed, decision: 'same' }]);
        await deny('unreviewed different decision rejected with zero writes', [...valid, { newerPersonID: newUnreviewed, decision: 'different' }]);
        await deny('duplicate identical decision rejected with zero writes', [...valid, same]);
        await deny('duplicate conflicting decision rejected with zero writes', [...valid, { newerPersonID: String(newSame), decision: 'different' }]);
        await deny('malformed decisions container rejected with zero writes', { same, different });
        await deny('null decision entry rejected with zero writes', [...valid, null]);
        await deny('malformed Person ID rejected with zero writes', [{ ...same, newerPersonID: true }, different]);
        await deny('unsupported decision type rejected with zero writes', [{ ...same, decision: 'unknown' }, different]);
        await deny('missing review decision rejected with zero writes', [same]);
        await deny('stale/noncandidate older Person rejected with zero writes', [{ ...same, olderPersonID: oldUnreviewed }, different]);
        await deny('third-tree Person decision rejected with zero writes', [...valid, { newerPersonID: otherOne, olderPersonID: oldUnreviewed, decision: 'same' }]);
        let mergeID;
        await test('legitimate Same and Different decisions execute actual SQL merge', async () => {
            const r = await request('one-tree/merge', { ...base, decisions: valid });
            assert.equal(r.status, 200, 'Valid merge failed');
            assert.equal(Number(r.data.FamilyTreeID), older.id);
            assert.equal(Number(r.data.mergedPersonCount), 1);
            mergeID = Number(r.data.TreeMergeID);
            assert.ok(scope.merges.has(mergeID));
            assert.equal(await count('SELECT COUNT(*) n FROM FTPersonT WHERE PersonID=?', [newSame]), 0);
            const [survivor] = await rows('SELECT CurrentCity FROM FTPersonT WHERE PersonID=?', [oldSame]);
            assert.equal(survivor.CurrentCity, 'NewerCity');
            assert.equal(await count('SELECT COUNT(*) n FROM FTPersonT WHERE PersonID IN (?)', [[oldDifferent, newDifferent, oldUnreviewed, newUnreviewed]]), 4);
        });
        await test('merge membership, relationship and history integrity', async () => {
            const [treeRow] = await rows('SELECT Status,MergedIntoFamilyTreeID FROM FamilyTreeT WHERE FamilyTreeID=?', [newer.id]);
            assert.equal(treeRow.Status, 'Merged');
            assert.equal(Number(treeRow.MergedIntoFamilyTreeID), older.id);
            const memberships = await rows('SELECT PersonID FROM FTFamilyTreePersonT WHERE FamilyTreeID=? ORDER BY PersonID', [older.id]);
            assert.deepEqual(memberships.map(row => Number(row.PersonID)), [oldSame, oldDifferent, oldUnreviewed, newDifferent, newUnreviewed].sort((a, b) => a - b));
            assert.equal(await count('SELECT COUNT(*) n FROM FTFamilyTreePersonT WHERE FamilyTreeID=?', [newer.id]), 0);
            assert.equal(await count('SELECT COUNT(*) n FROM FTSiblingT WHERE FamilyTreeID=? AND PersonID=? AND SiblingPersonID=?', [older.id, Math.min(oldSame, newDifferent), Math.max(oldSame, newDifferent)]), 1);
            assert.equal(await count('SELECT COUNT(*) n FROM FTSiblingT WHERE FamilyTreeID=?', [newer.id]), 0);
            const [history] = await rows('SELECT DecisionsJSON,MergeSnapshot,CreatedR2KeysJSON FROM FTTreeMergeT WHERE TreeMergeID=?', [mergeID]);
            const expected = [...valid].sort((a, b) => a.newerPersonID - b.newerPersonID);
            const sortDecisions = list => [...list].sort((a, b) => a.newerPersonID - b.newerPersonID);
            assert.deepEqual(sortDecisions(JSON.parse(history.DecisionsJSON)), expected);
            assert.deepEqual(sortDecisions(JSON.parse(history.MergeSnapshot).decisions), expected);
            assert.deepEqual(JSON.parse(history.CreatedR2KeysJSON), []);
            assert.equal(await count('SELECT COUNT(*) n FROM FTPersonMergeT WHERE TreeMergeID=? AND SourcePersonID=? AND SurvivingPersonID=?', [mergeID, newSame, oldSame]), 1);
            assert.equal(await count('SELECT COUNT(*) n FROM FTPersonMergeT WHERE TreeMergeID=?', [mergeID]), 1);
        });
        await test('unrelated synthetic Tree, Persons, user and relationship unchanged', async () => {
            assert.deepEqual(await snapshot(sentinel), untouched);
        });
        console.log(`DATABASE CASES: ${passed} passed, 0 failed`);
    } catch (error) {
        // SQL guard diagnostics contain statement type only, not values or row contents.
        console.error('Failed stage:', state.current);
        if (state.blocked.length) console.error('SQL guard:', state.blocked.join('; '));
        if (state.sqlErrors.length) console.error('SQL error codes:', state.sqlErrors.join(', '));
        throw error;
    } finally {
        state.stopping = true;
        if (server) {
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
        }
        try {
            if (began) {
                await connection.rollback();
                const remaining = await snapshot();
                for (const [table, records] of Object.entries(remaining)) assert.equal(records.length, 0, 'Synthetic records remain: ' + table);
                if (scope.merges.size) assert.equal(await count('SELECT COUNT(*) n FROM FTTreeMergeT WHERE TreeMergeID IN (?)', [[...scope.merges]]), 0);
                assert.equal(await count('SELECT COUNT(*) n FROM FTPersonT WHERE LastName=?', [prefix]), 0);
                console.log('ROLLBACK AND SYNTHETIC RECORD CLEANUP: PASS');
            }
        } finally {
            await connection.end();
        }
    }
    console.log('REAL DATABASE ACCEPTANCE: PASS');
}

function selfTest() {
    const good = { DB_HOST: 'morty2.heliohost.org', DB_NAME: 'wapps_test', DB_USER: 'wapps_test', DB_PORT: '3306', DB_PASSWORD: 'synthetic' };
    guardEnv(good);
    for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PORT', 'DB_PASSWORD']) {
        assert.throws(() => guardEnv({ ...good, [key]: '' }));
    }
    const scope = { trees: new Set([10, 11]), people: new Set([20, 21]), users: new Set([30]), merges: new Set([40]) };
    assert.equal(classify('SELECT * FROM FTPersonT WHERE PersonID=?', [20], scope), 'read');
    assert.equal(classify('DELETE FROM FTPersonT WHERE PersonID=?', [20], scope), 'write');
    assert.equal(classify('UPDATE FTTreeMergeT SET CreatedR2KeysJSON=? WHERE TreeMergeID=?', ['[]', 40], scope), 'write');
    for (const [sql, params] of [
        ['DELETE FROM FTPersonT WHERE PersonID=?', [99]],
        ['DELETE FROM FTPersonT', []],
        ['DELETE FROM FTPersonT WHERE PersonID=?; COMMIT', [20]],
        ['COMMIT', []],
        ['UPDATE UsersT SET IsAdministrator=1', []],
        ['SELECT 1 INTO OUTFILE \'x\'', []],
        ['UPDATE FTTreeMergeT SET CreatedR2KeysJSON=? WHERE TreeMergeID=?', ['["key"]', 40]],
        ['UPDATE FTTreeMergeT SET CreatedR2KeysJSON=? WHERE TreeMergeID=?', ['[]', 99]],
        ['DELETE FROM FTImageT WHERE ImageID=?', [20]]
    ]) assert.throws(() => classify(sql, params, scope));
    console.log('OFFLINE GUARD SELF-TEST: PASS');
}

if (process.argv.includes('--self-test')) {
    selfTest();
} else {
    main().catch(error => {
        // Assertion messages can embed actual row data; report only safe labels/codes.
        console.error('REAL DATABASE ACCEPTANCE: FAIL', error.code || error.name);
        process.exitCode = 1;
    });
}
