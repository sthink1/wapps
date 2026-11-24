'use strict';

// M03-C01/M04: test-only loopback HTTP harness. No WA server startup.
// Real installed route modules, real SQL reads, injected authenticated identity.
// All route transaction methods are logical only; the outer DB transaction
// is READ ONLY and is always rolled back. No notification/storage calls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { execFileSync } = require('node:child_process');

const project = process.cwd();
const baseline = '8db2689f06a6ca79c6466793e2f3dab6a22eff76';
const hashes = {
    'routes/familyTree.js': 'c833499893f49ca11dea9ac8f3c09dc626fd55077e3f83d1052970a0527931f1',
    'routes/ftPrivacy.js': '6e1bedf5b011dac4af7fe8ffc6524632d276b65411fb7456eacc4f307cba3d55'
};
const unavailable = 'Cross-tree One Tree operations are temporarily unavailable.';

function guardEnvironment(env) {
    assert.equal(env.DB_HOST, 'morty2.heliohost.org');
    assert.equal(env.DB_NAME, 'wapps_test');
    assert.equal(env.DB_USER, 'wapps_test');
    assert.equal(env.DB_PORT, '3306');
    assert.ok(env.DB_PASSWORD);
}

function readOnlySQL(sql) {
    assert.equal(typeof sql, 'string');
    assert.match(sql.trim(), /^SELECT\s/i);
    assert.doesNotMatch(sql, /;|\/\*|--|#|@|\b(?:INTO|FOR\s+UPDATE|LOCK\s+IN\s+SHARE\s+MODE|GET_LOCK|RELEASE_LOCK|SLEEP|BENCHMARK|LOAD_FILE)\b/i);
}

function verifyDenied(result, privacy = false) {
    assert.equal(result.status, 403);
    assert.deepEqual(result.body, privacy ? { message: unavailable } : {
        code: 'ONE_TREE_UNAVAILABLE', message: unavailable
    });
}

function adapter(connection, state) {
    return {
        async getConnection() {
            let logicalTransaction = false;
            return {
                async query(sql, params = []) { return query(sql, params); },
                async beginTransaction() {
                    assert.ok(!logicalTransaction && !state.stopping);
                    logicalTransaction = true;
                },
                async commit() {
                    assert.ok(logicalTransaction && !state.stopping);
                    logicalTransaction = false;
                },
                async rollback() { logicalTransaction = false; },
                release() { assert.ok(!logicalTransaction); }
            };
        },
        query
    };
    async function query(sql, params = []) {
        assert.ok(!state.stopping);
        try { readOnlySQL(sql); } catch (error) {
            state.blocked++;
            throw error;
        }
        state.reads++;
        try { return await connection.query(sql, params); } catch (error) {
            state.sqlErrors++;
            throw error;
        }
    }
}

function load(relative, dependencies, state) {
    const source = fs.readFileSync(path.join(project, relative), 'utf8');
    const mod = { exports: {} };
    const factory = vm.runInThisContext(
        `(function(require,module,exports,process,console){\n${source}\n})`,
        { filename: relative }
    );
    factory(name => {
        if (!Object.hasOwn(dependencies, name)) {
            state.unexpected++;
            throw new Error('Unexpected module dependency');
        }
        return dependencies[name];
    }, mod, mod.exports, { env: { ADMIN_USERNAME: process.env.ADMIN_USERNAME || '' } }, {
        log() {}, warn() {}, error() { state.internalErrors++; }
    });
    return mod.exports;
}

// Only IDs and the authorized source code are selected. No names, privacy keys,
// contact information or target Tree code are selected or printed.
const fixtureSQL = `SELECT u.UserID AS userID, s.FamilyTreeID AS treeID,
    s.FamilyTreeCode AS treeCode, sp.PersonID AS sameID, tp.PersonID AS otherID
 FROM FTFamilyTreeUserT u
 JOIN UsersT usr ON usr.UserID=u.UserID
 JOIN FamilyTreeT s ON s.FamilyTreeID=u.FamilyTreeID
 JOIN FTFamilyTreePersonT sp ON sp.FamilyTreeID=s.FamilyTreeID
 JOIN FamilyTreeT t ON t.FamilyTreeID<>s.FamilyTreeID
 JOIN FTFamilyTreePersonT tp ON tp.FamilyTreeID=t.FamilyTreeID
 WHERE u.IsActive=1 AND COALESCE(usr.IsAdministrator,0)=0
   AND s.Status='Active' AND s.MergedIntoFamilyTreeID IS NULL
   AND t.Status='Active' AND t.MergedIntoFamilyTreeID IS NULL
   AND NOT EXISTS (SELECT 1 FROM FTFamilyTreePersonT x
       WHERE x.PersonID=sp.PersonID AND x.FamilyTreeID<>s.FamilyTreeID)
   AND NOT EXISTS (SELECT 1 FROM FTFamilyTreePersonT x
       WHERE x.PersonID=tp.PersonID AND x.FamilyTreeID<>t.FamilyTreeID)
   AND NOT EXISTS (SELECT 1 FROM FTFamilyTreeUserT x
       WHERE x.UserID=u.UserID AND x.FamilyTreeID=t.FamilyTreeID)
 ORDER BY u.UserID,s.FamilyTreeID,sp.PersonID,t.FamilyTreeID,tp.PersonID LIMIT 1`;

async function selfTest() {
    guardEnvironment({ DB_HOST: 'morty2.heliohost.org', DB_NAME: 'wapps_test', DB_USER: 'wapps_test', DB_PORT: '3306', DB_PASSWORD: 'not-real' });
    assert.throws(() => guardEnvironment({ DB_NAME: 'wapps_production' }));
    readOnlySQL(fixtureSQL);
    for (const sql of ['INSERT INTO x VALUES (1)', 'UPDATE x SET a=1', 'DELETE FROM x', 'SELECT 1; DELETE FROM x', 'SELECT 1 FOR UPDATE', 'SELECT 1 INTO OUTFILE \'x\'', 'SELECT GET_LOCK(\'x\',1)', 'SELECT @x:=1', 'COMMIT']) {
        assert.throws(() => readOnlySQL(sql));
    }
    verifyDenied({ status: 403, body: { code: 'ONE_TREE_UNAVAILABLE', message: unavailable } });
    verifyDenied({ status: 403, body: { message: unavailable } }, true);
    assert.throws(() => verifyDenied({ status: 403, body: { code: 'ONE_TREE_UNAVAILABLE', message: unavailable, targetTree: {} } }));
    const state = { reads: 0, blocked: 0, sqlErrors: 0, stopping: false };
    let actualCalls = 0;
    const pool = adapter({ async query() { actualCalls++; return [[], []]; } }, state);
    const c = await pool.getConnection();
    await c.beginTransaction();
    await c.query('SELECT 1');
    await assert.rejects(c.query('DELETE FROM x'));
    await c.rollback();
    c.release();
    assert.equal(actualCalls, 1);
    assert.equal(state.blocked, 1);
    console.log('SAFETY SELF-TEST: PASS (no database connection)');
}

async function main() {
    if (process.argv.includes('--self-test')) return selfTest();
    guardEnvironment(process.env);
    assert.equal(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(), 'reviseLogIn');
    assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), baseline);
    for (const [file, hash] of Object.entries(hashes)) {
        assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(project, file))).digest('hex'), hash, 'Installed route hash mismatch');
    }
    const rq = createRequire(path.join(project, 'package.json'));
    const mysql = rq('mysql2/promise');
    const express = rq('express');
    const state = { reads: 0, blocked: 0, sqlErrors: 0, external: 0, unexpected: 0, internalErrors: 0, stopping: false };
    let connection, server, began = false, passed = 0, stage = 'database identity';
    const results = [];
    try {
        connection = await mysql.createConnection({
            host: 'morty2.heliohost.org', port: 3306, user: 'wapps_test',
            password: process.env.DB_PASSWORD, database: 'wapps_test',
            ssl: { rejectUnauthorized: true }, multipleStatements: false, connectTimeout: 15000
        });
        const [[identity]] = await connection.query('SELECT DATABASE() AS db, CURRENT_USER() AS account');
        assert.equal(identity.db, 'wapps_test');
        assert.equal(String(identity.account).split('@')[0], 'wapps_test');
        const [[tls]] = await connection.query("SHOW SESSION STATUS LIKE 'Ssl_cipher'");
        assert.ok(tls && tls.Value);
        await connection.query('START TRANSACTION READ ONLY');
        began = true;
        const [[transaction]] = await connection.query('SELECT @@in_transaction AS active');
        assert.equal(Number(transaction.active), 1);
        console.log('TEST DATABASE AND TLS: PASS');
        stage = 'fixture availability';
        const pool = adapter(connection, state);
        const [fixtures] = await pool.query(fixtureSQL);
        if (!fixtures.length) throw new Error('No suitable existing source/target fixture; do not create records');
        const f = fixtures[0];
        const user = { userId: Number(f.userID), client: 'web' };
        assert.ok(Number.isSafeInteger(user.userId) && user.userId > 0);
        const secret = crypto.randomBytes(32).toString('hex');
        const authenticate = (req, res, next) => {
            if (req.headers['x-wa-test-key'] !== secret) return res.status(401).json({ message: 'Test authentication required' });
            req.user = { ...user };
            next();
        };
        const external = async () => { state.external++; throw new Error('External action prohibited'); };
        const multer = () => ({ single: () => (_req, _res, next) => next() });
        multer.memoryStorage = () => ({});
        multer.MulterError = class extends Error {};
        const deps = {
            express, crypto, multer, '../dbConnection': { pool }, '../middleware/auth': authenticate,
            '../services/notificationService': { sendNotification: external },
            '../r2Storage': new Proxy({}, { get: () => external })
        };
        stage = 'load installed routes';
        deps['../services/stage6ExpectedClientError'] = load('services/stage6ExpectedClientError.js', deps, state);
        deps['../services/administratorAccess'] = load('services/administratorAccess.js', deps, state);
        const privacy = load('routes/ftPrivacy.js', deps, state);
        deps['./ftPrivacy'] = privacy;
        const family = load('routes/familyTree.js', deps, state);
        const app = express();
        app.use(express.json({ limit: '16kb' }));
        app.use('/familytree/privacy', authenticate, privacy.privateRouter);
        app.use('/familytree', authenticate, privacy.protection, family);
        app.use((_err, _req, res, _next) => { state.internalErrors++; res.status(500).json({ message: 'Test handler failed' }); });
        server = await new Promise((resolve, reject) => {
            const s = app.listen(0, '127.0.0.1', () => resolve(s));
            s.on('error', reject);
        });
        const base = `http://127.0.0.1:${server.address().port}/familytree`;
        const get = (route, params) => request(route + '?' + new URLSearchParams(params));
        const post = (route, body) => request(route, body);
        async function request(route, body) {
            const response = await fetch(base + route, {
                method: body === undefined ? 'GET' : 'POST',
                headers: { 'x-wa-test-key': secret, 'content-type': 'application/json' },
                body: body === undefined ? undefined : JSON.stringify(body),
                redirect: 'error', signal: AbortSignal.timeout(15000)
            });
            return { status: response.status, body: await response.json() };
        }
        async function check(label, fn) {
            stage = label;
            await fn();
            assert.equal(state.blocked + state.sqlErrors + state.external + state.unexpected + state.internalErrors, 0);
            passed++;
            results.push(label);
            console.log(`PASS: ${label}`);
        }
        const source = { sourceFamilyTreeCode: f.treeCode, targetPersonID: f.otherID };
        await check('Cross-tree review denied; exact non-disclosing response', async () => verifyDenied(await get('/one-tree/review', source)));
        await check('Cross-tree merge denied', async () => verifyDenied(await post('/one-tree/merge', { ...source, decisions: [] })));
        await check('Existing-Person selection cannot initiate cross-tree review', async () => verifyDenied(await post('/use-existing-person', { familyTreeCode: f.treeCode, personID: f.otherID })));
        await check('One Tree privacy unlock denied without checking a real key', async () => verifyDenied(await post(`/privacy/one-tree/unlock/${f.otherID}`, { ...source, keyCode: 'not-a-real-privacy-code' }), true));
        await check('Same-tree review preserved', async () => {
            const r = await get('/one-tree/review', { ...source, targetPersonID: f.sameID });
            assert.equal(r.status, 200);
            assert.equal(r.body.alreadySameTree, true);
            assert.equal(Number(r.body.FamilyTreeID), Number(f.treeID));
            assert.deepEqual(r.body.candidateGroups, []);
        });
        await check('Ordinary current-tree access preserved', async () => {
            const r = await get('/current-tree', {});
            assert.equal(r.status, 200);
            assert.ok(r.body.tree && Number(r.body.activeCount) >= 1);
        });
        await check('Authorized undo options endpoint preserved', async () => {
            const r = await get('/one-tree/undo-options', { familyTreeCode: f.treeCode });
            assert.equal(r.status, 200);
            assert.equal(Number(r.body.FamilyTreeID), Number(f.treeID));
            assert.ok(Array.isArray(r.body.merges));
            // Empty results are permitted; no actual undo or merge is attempted.
        });
        await check('Zero write or external attempts; outer transaction active', async () => {
            const [[active]] = await connection.query('SELECT @@in_transaction AS active');
            assert.equal(Number(active.active), 1);
            assert.ok(state.reads > 0);
            assert.equal(state.blocked, 0);
            assert.equal(state.external, 0);
        });
    } catch (_) {
        // Never print SQL, request/response content, credentials or real IDs.
        console.error(`FAILED OR BLOCKED: ${stage}`);
        process.exitCode = 1;
    } finally {
        state.stopping = true;
        if (server) {
            server.closeAllConnections();
            await new Promise(resolve => server.close(resolve));
        }
        if (connection) {
            try {
                if (began) {
                    await connection.rollback();
                    console.log('READ-ONLY TRANSACTION ROLLBACK: PASS');
                }
                await connection.end();
            } catch (_) {
                console.error('DATABASE CLOSE OR ROLLBACK: FAILED');
                connection.destroy();
                process.exitCode = 1;
            }
        }
    }
    console.log(`DATABASE CASES: ${passed} passed, ${8 - passed} failed or not run`);
    if (passed === 8 && !process.exitCode) console.log('READ-ONLY DATABASE ACCEPTANCE: PASS');
    else process.exitCode = 1;
}

main().catch(() => {
    console.error('PRECHECK OR SAFETY SELF-TEST FAILED; no details printed');
    process.exitCode = 1;
});
