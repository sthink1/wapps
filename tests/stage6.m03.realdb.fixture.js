/**
 * Wonderful Apps M03 controlled real-DB synthetic fixture lifecycle.
 * Run ONLY against the isolated wapps_test database using .env.test.
 * No existing Person or Tree is modified. No merge is executed here.
 *
 * node tests/stage6.m03.realdb.fixture.js setup
 * node tests/stage6.m03.realdb.fixture.js verify
 * node tests/stage6.m03.realdb.fixture.js cleanup
 */
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '..');
const envFile = path.join(root, '.env.test');
const manifestPath = path.join(os.tmpdir(), 'WA_M03_Synthetic_Fixture.json');
const action = process.argv[2];
if (!['setup', 'verify', 'cleanup'].includes(action)) {
    console.error('Usage: node tests/stage6.m03.realdb.fixture.js setup|verify|cleanup');
    process.exit(2);
}
if (!fs.existsSync(envFile)) throw new Error('Required .env.test is missing; REFUSING to use .env or production.');
const env = dotenv.parse(fs.readFileSync(envFile));
if (env.DB_NAME !== 'wapps_test') throw new Error('STOP: .env.test DB_NAME must be exactly wapps_test.');
if (!env.DB_HOST || !env.DB_USER || !env.DB_PASSWORD) throw new Error('STOP: test DB connection variables missing.');
if (['production', 'prod'].includes(String(env.WA_ENV || '').toLowerCase())) throw new Error('STOP: production environment disallowed.');

const regularName = process.env.M03_TEST_USER || 'charter';
const adminName = process.env.M03_ADMIN_USER || 'sthink';
const q = async (c, sql, args=[]) => (await c.execute(sql,args))[0];
async function user(c, username) {
    const rows = await q(c, 'SELECT UserID, UserName, IsAdministrator FROM UsersT WHERE UserName=?', [username]);
    assert.equal(rows.length, 1, `Expected exactly one account named ${username}`);
    return rows[0];
}
async function ensureTestDB(c) {
    const [[row]] = await c.query('SELECT DATABASE() AS db');
    assert.equal(row.db, 'wapps_test', 'STOP: wrong live database');
}
function idsIn(m) { return [m.olderPrivate,m.newerPrivate,m.olderPublic,m.newerPublic]; }
async function fixtureStatus(c,m) {
    const ids = idsIn(m);
    const trees = await q(c, 'SELECT FamilyTreeID,FamilyTreeCode FROM FamilyTreeT WHERE FamilyTreeID IN (?,?)', [m.olderTree,m.newerTree]);
    assert.equal(trees.length,2,'Missing fixture Tree; stop rather than guessing');
    assert.deepEqual(new Set(trees.map(x=>x.FamilyTreeCode)),new Set([m.olderCode,m.newerCode]));
    const people = await q(c,'SELECT PersonID FROM FTPersonT WHERE PersonID IN (?,?,?,?)',ids);
    assert.equal(people.length,4,'Missing fixture Person; stop rather than guessing');
    const memberships = await q(c,'SELECT FamilyTreeID,PersonID FROM FTFamilyTreePersonT WHERE FamilyTreeID IN (?,?)',[m.olderTree,m.newerTree]);
    assert.equal(memberships.length,4,'Unexpected Person membership in fixture Trees');
    assert.deepEqual(new Set(memberships.map(x=>x.PersonID)),new Set(ids));
    const otherAccess = await q(c,'SELECT FamilyTreeID,UserID FROM FTFamilyTreeUserT WHERE FamilyTreeID IN (?,?)',[m.olderTree,m.newerTree]);
    assert.equal(otherAccess.length,2,'Unexpected Tree-user membership');
    const merges=await q(c,'SELECT TreeMergeID FROM FTTreeMergeT WHERE SourceFamilyTreeID IN (?,?) OR SurvivingFamilyTreeID IN (?,?)',[m.olderTree,m.newerTree,m.olderTree,m.newerTree]);
    assert.equal(merges.length,0,'Fixture Trees have merge history. STOP: Do not run cleanup; investigate and rollback first.');
    const references=await q(c,'SELECT COUNT(*) AS n FROM FTImageT WHERE PersonID IN (?,?,?,?)',ids);
    assert.equal(Number(references[0].n),0,'Fixture has images; STOP');
    return true;
}
async function main() {
    const c=await mysql.createConnection({
        host: env.DB_HOST,
        port:Number(env.DB_PORT||3306),
        user:env.DB_USER,
        password:env.DB_PASSWORD,
        database:env.DB_NAME,
        ssl: env.DB_SSL === 'false' ? undefined : {rejectUnauthorized:true},
        multipleStatements:false
    });
    try {
        await ensureTestDB(c);
        if (action==='setup') {
            assert.ok(!fs.existsSync(manifestPath),'Previous fixture manifest exists; verify or cleanup before new setup');
            const regular=await user(c,regularName);
            const admin=await user(c,adminName);
            assert.equal(Number(regular.IsAdministrator),0,'Regular test account must not be an administrator');
            assert.equal(Number(admin.IsAdministrator),1,'Administrator test account flag missing');
            assert.equal(regular.UserID===admin.UserID,false);
            const nonce=crypto.randomBytes(4).toString('hex').toUpperCase();
            const olderCode=`M03A-${nonce}`;
            const newerCode=`M03B-${nonce}`;
            const m={version:1,db:'wapps_test',regularUserName:regular.UserName,adminUserName:admin.UserName,regularUserID:regular.UserID,adminUserID:admin.UserID,olderCode,newerCode};
            await c.beginTransaction();
            try {
                const old=await q(c,`INSERT INTO FamilyTreeT (FamilyTreeCode,CreatedByUserID,CreatedAt,LastActivityAt,LastActivityByUserID,Status) VALUES (?, ?,DATE_SUB(UTC_TIMESTAMP(),INTERVAL 8 DAY),UTC_TIMESTAMP(),?,'Active')`,[olderCode,regular.UserID,regular.UserID]);
                m.olderTree=old.insertId;
                const newer=await q(c,`INSERT INTO FamilyTreeT (FamilyTreeCode,CreatedByUserID,CreatedAt,LastActivityAt,LastActivityByUserID,Status) VALUES (?, ?,DATE_SUB(UTC_TIMESTAMP(),INTERVAL 3 DAY),UTC_TIMESTAMP(),?,'Active')`,[newerCode,regular.UserID,regular.UserID]);
                m.newerTree=newer.insertId;
                for(const tree of [m.olderTree,m.newerTree]) await q(c,`INSERT INTO FTFamilyTreeUserT (FamilyTreeID,UserID,JoinedAt,IsActive,AddedByUserID) VALUES (?,?,UTC_TIMESTAMP(),0,?)`,[tree,regular.UserID,regular.UserID]);
                const createPerson=async (first,last,place,tree) => {
                    const inserted=await q(c,`INSERT INTO FTPersonT (FirstName,LastName,BirthDate,BirthPlace,CreatedByUserID,CreatedAt,Died) VALUES (?,?,'1999-01-15',?, ?,UTC_TIMESTAMP(),0)`,[first,last,place,regular.UserID]);
                    const id=inserted.insertId;
                    await q(c,`INSERT INTO FTFamilyTreePersonT (FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt) VALUES (?,?,?,?,UTC_TIMESTAMP())`,[tree,id,tree,regular.UserID]);
                    return id;
                };
                m.olderPrivate=await createPerson(`M03Private${nonce}`,'Fixture','Olderville',m.olderTree);
                m.newerPrivate=await createPerson(`M03Private${nonce}`,'Fixture','Newerville',m.newerTree);
                m.olderPublic=await createPerson(`M03Public${nonce}`,'Fixture','Publicold',m.olderTree);
                m.newerPublic=await createPerson(`M03Public${nonce}`,'Fixture','Publicnew',m.newerTree);
                m.privateKeyOlder=`M03-Test-A-${nonce}`;
                m.privateKeyNewer=`M03-Test-B-${nonce}`;
                for (const [id,key] of [[m.olderPrivate,m.privateKeyOlder],[m.newerPrivate,m.privateKeyNewer]]) {
                    await q(c,`INSERT INTO FTPersonPrivacyT (PersonID,IsPrivate,KeyCode,VerifiedAt,UpdatedByUserID) VALUES (?,1,?,UTC_TIMESTAMP(),?)`,[id,key,regular.UserID]);
                }
                await fixtureStatus(c,m);
                await c.commit();
            } catch (error) { await c.rollback();throw error; }
            try {
                fs.writeFileSync(manifestPath,JSON.stringify(m,null,2),{flag:'wx',mode:0o600});
            } catch(error) {
                console.error('CRITICAL: fixture created but manifest could not be saved. IDs:',JSON.stringify(m));
                throw error;
            }
            console.log('PASS: Created isolated synthetic fixture in wapps_test only.');
            console.log('FIXTURE FILE:',manifestPath);
            console.log('M03_BROWSER_INPUT:',JSON.stringify({olderCode:m.olderCode,newerCode:m.newerCode,olderPrivate:m.olderPrivate,newerPrivate:m.newerPrivate,olderPublic:m.olderPublic,newerPublic:m.newerPublic,privateKeyOlder:m.privateKeyOlder,privateKeyNewer:m.privateKeyNewer}));
        } else {
            if(!fs.existsSync(manifestPath))throw new Error('Fixture manifest missing; no records touched');
            const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
            assert.equal(m.db,'wapps_test');
            await fixtureStatus(c,m);
            if(action==='verify') {
                console.log('PASS: Fixture isolated and unchanged. No merge records or images.');
                console.log('M03_BROWSER_INPUT:',JSON.stringify({olderCode:m.olderCode,newerCode:m.newerCode,olderPrivate:m.olderPrivate,newerPrivate:m.newerPrivate,olderPublic:m.olderPublic,newerPublic:m.newerPublic,privateKeyOlder:m.privateKeyOlder,privateKeyNewer:m.privateKeyNewer}));
            } else {
                await c.beginTransaction();
                try {
                    const ids=idsIn(m);
                    await q(c,'DELETE FROM FTPrivacyAttemptT WHERE PersonID IN (?,?,?,?)',ids);
                    await q(c,'DELETE FROM FTPrivacyUnlockT WHERE PersonID IN (?,?,?,?)',ids);
                    await q(c,'DELETE FROM FTPersonPrivacyT WHERE PersonID IN (?,?,?,?)',ids);
                    await q(c,'DELETE FROM FTFamilyTreePersonT WHERE FamilyTreeID IN (?,?)',[m.olderTree,m.newerTree]);
                    await q(c,'DELETE FROM FTFamilyTreeUserT WHERE FamilyTreeID IN (?,?)',[m.olderTree,m.newerTree]);
                    await q(c,'DELETE FROM FTPersonT WHERE PersonID IN (?,?,?,?)',ids);
                    await q(c,'DELETE FROM FamilyTreeT WHERE FamilyTreeID IN (?,?)',[m.olderTree,m.newerTree]);
                    await c.commit();
                } catch(error) {await c.rollback();throw error;}
                fs.unlinkSync(manifestPath);
                console.log('PASS: Only the four synthetic Persons and two synthetic Trees were cleaned up.');
            }
        }
    } finally { await c.end(); }
}
main().catch(error=>{console.error('M03 FIXTURE FAIL:',error.message);process.exitCode=1;});
