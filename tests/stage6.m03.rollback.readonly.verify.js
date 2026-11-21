/** WA M03 post-rollback read-only verification for 2026-11-20 fixtures. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const root = path.resolve(__dirname, '..');
async function run() {
    const envFile = path.join(root, '.env.test');
    assert.ok(fs.existsSync(envFile), 'STOP: .env.test does not exist');
    const env = dotenv.parse(fs.readFileSync(envFile));
    assert.equal(env.DB_NAME, 'wapps_test', 'STOP: this verifier requires wapps_test');
    assert.ok(env.DB_HOST && env.DB_USER && env.DB_PASSWORD, 'STOP: missing test DB connection settings');
    assert.ok(!['production', 'prod'].includes(String(env.WA_ENV || '').toLowerCase()), 'STOP: production disallowed');
    const c = await mysql.createConnection({
        host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER,
        password: env.DB_PASSWORD, database: env.DB_NAME,
        ssl: env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: true },
        multipleStatements: false
    });
    try {
        const [[db]] = await c.execute('SELECT DATABASE() AS db');
        assert.equal(db.db, 'wapps_test', 'STOP: connected to non-test database');
        // The prior run did not print its random nonce. Check its unique prefix;
        // no deletion or database changes are attempted by this verifier.
        const [trees] = await c.execute(
            "SELECT FamilyTreeID,FamilyTreeCode FROM FamilyTreeT WHERE FamilyTreeCode LIKE 'M03SC-%' ORDER BY FamilyTreeID");
        const [people] = await c.execute(
            "SELECT PersonID,FirstName,LastName FROM FTPersonT WHERE LastName='Fixture' AND (FirstName LIKE 'ScopeAda%' OR FirstName LIKE 'ScopeAaron%' OR FirstName LIKE 'ScopeBeatrice%' OR FirstName LIKE 'ScopeCarl%') ORDER BY PersonID");
        console.log('READ-ONLY CHECK: wapps_test; no INSERT, UPDATE, DELETE or transaction writes.');
        console.log(`Synthetic M03SC Tree rows present: ${trees.length}`);
        console.log(`Synthetic Scope* Fixture Person rows present: ${people.length}`);
        if (trees.length || people.length) {
            console.log('STOP: Potential fixture rows remain. No cleanup was attempted.');
            for (const row of trees) console.log(`TREE: ID=${row.FamilyTreeID}, code=${row.FamilyTreeCode}`);
            for (const row of people) console.log(`PERSON: ID=${row.PersonID}, name=${row.FirstName} ${row.LastName}`);
            process.exitCode = 2;
            return;
        }
        console.log('PASS: No M03SC Trees or matching Scope* Fixture Persons found after rollback.');
        console.log('Result: prior 7/7 source-extracted real-DB checks remain accepted; this verifies absence of named fixture rows, not a committed merge.');
    } finally {
        await c.end();
    }
}
run().catch(err => { console.error('M03 READ-ONLY VERIFY FAIL:', err.message); process.exitCode = 1; });
