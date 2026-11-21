/**
 * WA M03 — controlled real-DB Person-scope acceptance, no committed fixture.
 * Runs only against .env.test DB_NAME=wapps_test. The fixture and successful
 * partner write exist solely inside one transaction, ALWAYS rolled back.
 * Does not call the real HTTP merge POST, copy R2 images, or send emails.
 */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.test');
const routePath = path.join(root, 'routes', 'familyTree.js');
const expectedRouteSha = 'f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d';
const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex');

function sourceSlice(source, start, end) {
    const first = source.indexOf(start);
    const last = source.indexOf(end, first + start.length);
    assert.ok(first >= 0 && last > first, `Exact route source section missing: ${start}`);
    return source.slice(first, last);
}

function buildChecks(source) {
    const membership = sourceSlice(source, 'async function treeHasPerson(', '\n\nfunction duplicateScore(');
    const relationship = sourceSlice(source, 'async function addRelationshipInTree(', '\n\nasync function ensureOriginTreeID(');
    const routeStart = source.indexOf("router.post('/one-tree/merge'");
    assert.ok(routeStart >= 0, 'Expected One Tree merge route not found');
    const guardStart = source.indexOf('if (normalizedBridge.focalPersonID && normalizedBridge.relatedPersonID &&', routeStart);
    const writeStart = source.indexOf('const mergeRecord = await createOneTreeMergeRecord(', routeStart);
    assert.ok(guardStart > routeStart && writeStart > guardStart, 'Cross-tree scope guard not before merge write');
    const guardCode = source.slice(guardStart, writeStart);
    assert.match(guardCode, /treeHasPerson\(c, sourceTree\.FamilyTreeID, id\)/);
    assert.match(guardCode, /treeHasPerson\(c, targetTree\.FamilyTreeID, id\)/);
    assert.match(guardCode, /outside the two Family Trees being merged/);
    const context = {
        Set, Number, Math, Error,
        markExpectedClientError: error => error,
        addParentLink: async () => { throw new Error('Unexpected parent write'); },
        addSiblingLink: async () => { throw new Error('Unexpected sibling write'); }
    };
    const assembled = `${membership}\n${relationship}\nasync function checkCrossTreeBridge(c,sourceTree,targetTree,normalizedBridge){\n${guardCode}\n}\nthis.checks={relationship:addRelationshipInTree,cross:checkCrossTreeBridge};`;
    vm.runInNewContext(assembled, context, { timeout: 1000, filename: 'exact-M03-guard-extract.js' });
    return context.checks;
}

async function query(c, sql, params = []) {
    const [rows] = await c.execute(sql, params);
    return rows;
}

async function ensureTestDatabase(c) {
    const [row] = await query(c, 'SELECT DATABASE() AS db');
    assert.equal(row.db, 'wapps_test', 'STOP: connected to a non-test database');
}

async function main() {
    assert.ok(fs.existsSync(envPath), 'STOP: .env.test is absent; do not substitute .env');
    const env = dotenv.parse(fs.readFileSync(envPath));
    assert.equal(env.DB_NAME, 'wapps_test', 'STOP: DB_NAME is not wapps_test');
    assert.ok(env.DB_HOST && env.DB_USER && env.DB_PASSWORD, 'STOP: missing test DB settings');
    assert.ok(!['production', 'prod'].includes(String(env.WA_ENV || '').toLowerCase()), 'STOP: production disallowed');
    const sourceBytes = fs.readFileSync(routePath);
    assert.equal(sha256(sourceBytes), expectedRouteSha, 'STOP: installed familyTree.js differs from tested correction');
    const checks = buildChecks(sourceBytes.toString('utf8'));
    console.log('PASS: Exact corrected familyTree.js SHA-256 verified.');

    const c = await mysql.createConnection({
        host: env.DB_HOST,
        port: Number(env.DB_PORT || 3306),
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        ssl: env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: true },
        multipleStatements: false
    });
    let fixture = null;
    let txOpen = false;
    let primaryFailure = null;
    try {
        await ensureTestDatabase(c);
        const username = process.env.M03_TEST_USER || 'charter';
        const users = await query(c, 'SELECT UserID, IsAdministrator FROM UsersT WHERE UserName=?', [username]);
        assert.equal(users.length, 1, 'Ordinary test user missing');
        assert.equal(Number(users[0].IsAdministrator), 0, 'STOP: user is an administrator');
        const userID = Number(users[0].UserID);
        const nonce = crypto.randomBytes(6).toString('hex').toUpperCase();
        const codes = [`M03SC-A-${nonce}`, `M03SC-B-${nonce}`, `M03SC-C-${nonce}`];
        fixture = { codes, trees: [], persons: [] };

        await c.beginTransaction();
        txOpen = true;
        for (const code of codes) {
            const tree = await query(c,
                "INSERT INTO FamilyTreeT (FamilyTreeCode,CreatedByUserID,CreatedAt,LastActivityAt,LastActivityByUserID,Status) VALUES (?, ?,UTC_TIMESTAMP(),UTC_TIMESTAMP(),?,'Active')",
                [code, userID, userID]);
            fixture.trees.push(Number(tree.insertId));
            await query(c,
                'INSERT INTO FTFamilyTreeUserT (FamilyTreeID,UserID,JoinedAt,IsActive,AddedByUserID) VALUES (?,?,UTC_TIMESTAMP(),0,?)',
                [tree.insertId, userID, userID]);
        }
        // Two Persons in A, one in B, one in unrelated C. All are public.
        const entries = [
            ['Ada', fixture.trees[0]], ['Aaron', fixture.trees[0]],
            ['Beatrice', fixture.trees[1]], ['Carl', fixture.trees[2]]
        ];
        for (const [first, treeID] of entries) {
            const p = await query(c,
                'INSERT INTO FTPersonT (FirstName,LastName,BirthDate,CreatedByUserID,CreatedAt,Died) VALUES (?, ?, ?, ?,UTC_TIMESTAMP(),0)',
                [`Scope${first}${nonce}`, 'Fixture', '2001-01-15', userID]);
            const personID = Number(p.insertId);
            fixture.persons.push(personID);
            await query(c,
                'INSERT INTO FTFamilyTreePersonT (FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt) VALUES (?,?,?,?,UTC_TIMESTAMP())',
                [treeID, personID, treeID, userID]);
        }
        const [a1, a2, b1, outside] = fixture.persons;
        const [treeA, treeB] = fixture.trees;
        const pairCount = async () => {
            const [row] = await query(c,
                'SELECT COUNT(*) AS n FROM FTPartnerT WHERE FamilyTreeID=? AND PersonID=? AND PartnerPersonID=?',
                [treeA, Math.min(a1,a2), Math.max(a1,a2)]);
            return Number(row.n);
        };
        const mergeCount = async () => {
            const [row] = await query(c,
                'SELECT COUNT(*) AS n FROM FTTreeMergeT WHERE SourceFamilyTreeID IN (?,?,?) OR SurvivingFamilyTreeID IN (?,?,?)',
                [...fixture.trees, ...fixture.trees]);
            return Number(row.n);
        };
        assert.equal(await pairCount(), 0);
        assert.equal(await mergeCount(), 0);
        console.log('PASS: Four isolated public Persons and three Trees created inside an uncommitted wapps_test transaction.');

        let n = 0;
        async function expect403(desc, callback) {
            await assert.rejects(callback, error => Number(error.status) === 403, desc);
            assert.equal(await pairCount(), 0, `${desc}: unexpected relationship write`);
            assert.equal(await mergeCount(), 0, `${desc}: unexpected merge write`);
            console.log(`PASS ${++n}: ${desc}; no relationship/merge write`);
        }
        await expect403('same-tree focal from unrelated third Tree',
            () => checks.relationship(c, treeA, userID, outside, a2, 'partner'));
        await expect403('same-tree related Person from unrelated third Tree',
            () => checks.relationship(c, treeA, userID, a1, outside, 'partner'));
        const cross = (focal, related) => checks.cross(c,
            { FamilyTreeID: treeA }, { FamilyTreeID: treeB },
            { focalPersonID: focal, relatedPersonID: related, relationshipKind: 'partner' });
        await expect403('cross-tree focal from unrelated third Tree', () => cross(outside, b1));
        await expect403('cross-tree related Person from unrelated third Tree', () => cross(a1, outside));
        await cross(a1, b1);
        console.log(`PASS ${++n}: legitimate A+B relationship endpoints pass exact cross-tree guard`);
        await cross(b1, a1);
        console.log(`PASS ${++n}: reversed A+B endpoints pass exact cross-tree guard`);
        await checks.relationship(c, treeA, userID, a1, a2, 'partner');
        assert.equal(await pairCount(), 1, 'valid same-tree partner relation was not inserted in transaction');
        console.log(`PASS ${++n}: legitimate same-tree partner relation writes inside rollback-only transaction`);
        assert.equal(await mergeCount(), 0);
        console.log('PASS: No One Tree merge was executed. Every fixture INSERT and valid partner relationship will be rolled back.');
    } catch (error) {
        primaryFailure = error;
    } finally {
        if (txOpen) {
            try {
                await c.rollback();
                console.log('PASS: Test transaction rolled back (no commit performed).');
            } catch (error) {
                primaryFailure ||= error;
                console.error('CRITICAL: Rollback failed; manually inspect wapps_test before further testing.');
            }
        }
        try {
            await ensureTestDatabase(c);
            if (fixture) {
                const [[treeCount]] = await c.query('SELECT COUNT(*) AS n FROM FamilyTreeT WHERE FamilyTreeCode IN (?,?,?)', fixture.codes);
                assert.equal(Number(treeCount.n), 0, 'Synthetic Trees remained after rollback');
                if (fixture.persons.length === 4) {
                    const [[personCount]] = await c.query('SELECT COUNT(*) AS n FROM FTPersonT WHERE PersonID IN (?,?,?,?)', fixture.persons);
                    assert.equal(Number(personCount.n), 0, 'Synthetic Persons remained after rollback');
                }
            }
            console.log('PASS: Post-rollback check found no synthetic Trees or Persons.');
        } catch (error) {
            primaryFailure ||= error;
            console.error('CRITICAL: Post-rollback verification failed; investigate before proceeding.');
        }
        await c.end();
    }
    if (primaryFailure) throw primaryFailure;
    console.log('TOTAL: 7/7 scoped real-DB assertions PASS; fixture rolled back and absent.');
    console.log('LIMIT: Full successful cross-tree merge/undo and HTTP endpoint integration NOT executed by this script.');
}

main().catch(error => {
    console.error('M03 LIVE ACCEPTANCE FAIL:', error.message);
    process.exitCode = 1;
});
