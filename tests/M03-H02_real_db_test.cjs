'use strict';
// Rollback-only M03-H02 acceptance runner. Run from WA root with .env.test.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const project = process.cwd();
const expectedHash = '7930f3165aea158891fbbda2672f9e89fbe4a33e66258f452c09cdaac61aedea';
const tables = ['UsersT','FamilyTreeT','FTFamilyTreeUserT','FTFamilyTreePersonT','FTPersonT','FTParentT','FTPartnerT','FTSiblingT','FTFamilyTreeActivityT','FTPersonPrivacyT','FTEventT','FTEventPersonT'];
const allowedWrites = new Set(tables.slice(1));
function guardEnv(env) {
    assert.equal(env.DB_HOST, 'morty2.heliohost.org');
    assert.equal(env.DB_NAME, 'wapps_test');
    assert.equal(env.DB_USER, 'wapps_test');
    assert.equal(env.DB_PORT, '3306');
    assert.ok(env.DB_PASSWORD, 'Missing test password');
}
function sqlKind(sql) {
    const normalized = sql.trim().replace(/\s+/g, ' ');
    if (/^SELECT\b/i.test(normalized) && !/;|\bINTO\b|\bGET_LOCK\b/i.test(normalized)) return 'read';
    const m = /^(?:INSERT(?: IGNORE)? INTO|UPDATE|DELETE FROM)\s+([A-Za-z0-9_]+)\b/i.exec(normalized);
    if (m && allowedWrites.has(m[1]) && !normalized.includes(';')) return 'write';
    throw new Error('Unexpected SQL blocked');
}
function makeAdapter(c, state) {
    let active = false;
    let poisoned = false;
    const adapter = {
        async beginTransaction() {
            assert.ok(!active && !poisoned);
            await c.query('SAVEPOINT wa_route');
            active = true;
        },
        async commit() {
            assert.ok(active && !poisoned);
            await c.query('RELEASE SAVEPOINT wa_route');
            active = false;
        },
        async rollback() {
            if (!active) return;
            try { await c.query('ROLLBACK TO SAVEPOINT wa_route'); await c.query('RELEASE SAVEPOINT wa_route'); }
            catch (e) { poisoned = true; throw e; }
            finally { active = false; }
        },
        release() {},
        async query(sql, params = []) {
            assert.ok(!poisoned, 'Transaction adapter poisoned');
            const kind = sqlKind(sql);
            if (kind === 'write') { assert.ok(active, 'Write outside route savepoint'); state.writes++; }
            try { return await c.query(sql, params); }
            catch (e) { state.sqlErrors.push(e.code || 'SQL_ERROR'); if (e.code === 'ER_LOCK_DEADLOCK') poisoned = true; throw e; }
        }
    };
    // Notifications are intentionally not dispatched before the outer rollback.
    Object.defineProperty(adapter, '_ftAfterCommit', { configurable: true, get: () => null, set: () => {} });
    // withTx deletes this property in strict mode only if the source is strict; use proxy instead.
    return new Proxy(adapter, { deleteProperty(target, key) { if (key === '_ftAfterCommit') return true; return Reflect.deleteProperty(target,key); } });
}
function load(file, deps, env) {
    const m = {exports:{}};
    const source = fs.readFileSync(path.join(project,file),'utf8');
    vm.runInThisContext(`(function(require,module,exports,process){\n${source}\n})`, {filename:file})(name => {
        assert.ok(Object.hasOwn(deps,name), `Blocked dependency: ${name}`); return deps[name];
    },m,m.exports,{env});
    return m.exports;
}
async function main() {
    guardEnv(process.env);
    const candidate = path.join(project,'routes','familyTree.js');
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(candidate)).digest('hex'),expectedHash);
    const rq = createRequire(path.join(project,'package.json'));
    const mysql = rq('mysql2/promise'), express = rq('express');
    const c = await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,port:3306,ssl:{rejectUnauthorized:true},multipleStatements:false});
    const tag = crypto.randomBytes(6).toString('hex');
    const prefix = `WAH02${tag}`;
    const ids = {users:[],trees:[],people:[]};
    let server, began = false, passed = 0;
    const state={writes:0,sqlErrors:[]};
    const q = (sql,params=[]) => c.query(sql,params);
    const insert = async (sql,params) => (await q(sql,params))[0].insertId;
    try {
        const [[identity]] = await q('SELECT DATABASE() AS db, CURRENT_USER() AS account');
        assert.equal(identity.db,'wapps_test'); assert.equal(identity.account.split('@')[0],'wapps_test');
        const [engines] = await q('SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN (?)',[tables]);
        assert.equal(engines.length,tables.length); assert.ok(engines.every(x=>x.ENGINE==='InnoDB'));
        const [triggers] = await q('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE IN (?)',[tables]);
        assert.equal(triggers.length,0,'Unexpected trigger: stop');
        console.log('DATABASE IDENTITY AND TRANSACTION ENGINE: PASS');
        await c.beginTransaction(); began=true;
        async function user(suffix,admin=0) {
            const name=prefix+suffix;
            const id=await insert('INSERT INTO UsersT (UserName,PasswordHash,Email,Phone1,IsAdministrator) VALUES (?,?,?,?,?)',[name,'UNUSABLE_SYNTHETIC_PASSWORD',name+'@example.invalid','0000000000',admin]);
            ids.users.push(id);return id;
        }
        const member=await user('member'), other=await user('other'), admin=await user('admin',1);
        async function tree(suffix,owner) {
            const code=prefix+suffix;
            const id=await insert('INSERT INTO FamilyTreeT (FamilyTreeCode,CreatedByUserID,CreatedAt,LastActivityAt,LastActivityByUserID,Status) VALUES (?,?,NOW(),NOW(),?,?)',[code,owner,owner,'Active']);ids.trees.push(id);
            await q('INSERT INTO FTFamilyTreeUserT (FamilyTreeID,UserID,JoinedAt,IsActive,AddedByUserID) VALUES (?,?,NOW(),1,?)',[id,owner,owner]); return {id,code};
        }
        const a=await tree('A',member), b=await tree('B',other);
        await q('INSERT INTO FTFamilyTreeUserT (FamilyTreeID,UserID,JoinedAt,IsActive,AddedByUserID) VALUES (?,?,NOW(),0,?)',[b.id,member,member]);
        async function person(t,owner,suffix) {
            const id=await insert('INSERT INTO FTPersonT (FirstName,LastName,Gender,CreatedByUserID,CreatedAt) VALUES (?,?,?,?,NOW())',[prefix+suffix,prefix,'Male',owner]);ids.people.push(id);
            await q('INSERT INTO FTFamilyTreePersonT (FamilyTreeID,PersonID,OriginFamilyTreeID,AddedByUserID,AddedAt) VALUES (?,?,?,?,NOW())',[t.id,id,t.id,owner]);return id;
        }
        const focal=await person(a,member,'Focal'), related=await person(a,member,'Related'), foreign=await person(b,other,'Foreign');
        await q('INSERT INTO FTPersonPrivacyT (PersonID,IsPrivate,KeyCode,UpdatedByUserID) VALUES (?,1,?,?)',[related,'test-only',member]);
        const adapter=makeAdapter(c,state), pool={getConnection:async()=>adapter,query:(...args)=>adapter.query(...args)};
        const tokens={member:{userId:member,client:'web'},other:{userId:other,client:'web'},admin:{userId:admin,client:'web'}};
        class AuthenticationError extends Error { constructor(){super('INVALID_TEST_TOKEN');this.status=401;this.code='INVALID_TEST_TOKEN';} }
        const deps={express,crypto,multer:rq('multer'), '../dbConnection':{pool},jsonwebtoken:{},'../services/verifyAccessToken':{AuthenticationError,async verifyAccessToken(token){if(!Object.hasOwn(tokens,token))throw new AuthenticationError();return {...tokens[token]};}},'../services/subscriptionService':{async getAppAccess(){return {allowed:true};},async recordUsage(){}},'../services/notificationService':{async sendNotification(){throw Error('External notification blocked');}},'../r2Storage':new Proxy({},{get:()=>async()=>{throw Error('External storage blocked');}})};
        const env={ADMIN_USERNAME:prefix+'admin',JWT_SECRET:'synthetic-only'};
        deps['../services/stage6ExpectedClientError']=load('services/stage6ExpectedClientError.js',deps,env);
        deps['../services/administratorAccess']=load('services/administratorAccess.js',deps,env);
        deps['../middleware/auth']=deps['./auth']=load('middleware/auth.js',deps,env);
        const sub=load('middleware/subscriptionAccess.js',deps,env);
        const usage=load('middleware/usageActivity.js',deps,env);
        const privacy=deps['./ftPrivacy']=load('routes/ftPrivacy.js',deps,env);
        const router=load('routes/familyTree.js',deps,env);
        const app=express();app.use(express.json());app.use('/familytree',sub.authenticateToken,sub.requireAppAccess('family_tree'),usage('family_tree'),privacy.protection,router);app.use((err,req,res,next)=>res.status(500).json({message:'Test middleware failure'}));
        server=await new Promise((resolve,reject)=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));s.on('error',reject);});
        async function request(endpoint,body,token='member',method='POST') {
            const res=await fetch(`http://127.0.0.1:${server.address().port}/familytree/${endpoint}`,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
            return {status:res.status,data:await res.json()};
        }
        async function test(label,fn){await fn();passed++;console.log('PASS '+label);}
        const base={familyTreeCode:a.code,focalPersonID:focal,relatedPersonID:related,relationshipKind:'partner'};
        async function deny(endpoint,body,status,token='member'){const before=state.writes;const res=await request(endpoint,body,token);assert.equal(res.status,status,endpoint);assert.equal(state.writes,before,'Denied request attempted a write');}
        const newBody={familyTreeCode:a.code,focalPersonID:focal,relationshipKind:'partner',FirstName:prefix+'New',LastName:prefix};
        await test('invalid existing relationship, zero writes',()=>deny('relationships',{...base,relationshipKind:'aunt'},400));
        await test('invalid new relationship, zero writes',()=>deny('related-person',{...newBody,relationshipKind:'aunt'},400));
        await test('foreign focal, zero writes',()=>deny('relationships',{...base,focalPersonID:foreign},403));
        await test('foreign related, zero writes',()=>deny('relationships',{...base,relatedPersonID:foreign},403));
        await test('foreign focal creating person, zero writes',()=>deny('related-person',{...newBody,focalPersonID:foreign},403));
        await test('unauthorized tree, zero writes',()=>deny('relationships',base,403,'other'));
        await test('verified admin cannot bypass relationship integrity',()=>deny('relationships',{...base,relatedPersonID:foreign},403,'admin'));
        await test('private focal read denied',async()=>{const r=await request(`persons/${related}?familyTreeCode=${a.code}`,null,'member','GET');assert.equal(r.status,423);});
        for(const kind of ['mother','father','child','sibling','partner']){
            await test('existing '+kind,async()=>{const p=await person(a,member,kind);const r=await request('relationships',{...base,relatedPersonID:p,relationshipKind:kind});assert.equal(r.status,201);const table=kind==='partner'?'FTPartnerT':kind==='sibling'?'FTSiblingT':'FTParentT';const col=kind==='partner'?'PartnerPersonID':kind==='sibling'?'SiblingPersonID':'ParentPersonID';const [[row]]=await q(`SELECT COUNT(*) n FROM ${table} WHERE FamilyTreeID=? AND ((PersonID=? AND ${col}=?) OR (PersonID=? AND ${col}=?))`,[a.id,focal,p,p,focal]);assert.equal(Number(row.n),1);});
        }
        await test('new related person and membership',async()=>{const r=await request('related-person',newBody);assert.equal(r.status,201);const id=Number(r.data.PersonID);assert.ok(id>0);ids.people.push(id);const [[row]]=await q('SELECT COUNT(*) n FROM FTFamilyTreePersonT WHERE FamilyTreeID=? AND PersonID=?',[a.id,id]);assert.equal(Number(row.n),1);const [[rel]]=await q('SELECT COUNT(*) n FROM FTPartnerT WHERE FamilyTreeID=? AND PersonID=? AND PartnerPersonID=?',[a.id,Math.min(focal,id),Math.max(focal,id)]);assert.equal(Number(rel.n),1);});
        await test('same-tree existing selection',async()=>{const p=await person(a,member,'Selected');const r=await request('use-existing-person',{familyTreeCode:a.code,focalPersonID:focal,personID:p,relationshipKind:'sibling'});assert.equal(r.status,200);assert.equal(Number(r.data.PersonID),p);});
        await test('verified admin relationship in tree without user membership',async()=>{const r=await request('relationships',base,'admin');assert.equal(r.status,201);});
        await test('foreign membership not created',async()=>{const [[row]]=await q('SELECT COUNT(*) n FROM FTFamilyTreePersonT WHERE FamilyTreeID=? AND PersonID=?',[a.id,foreign]);assert.equal(Number(row.n),0);});
        assert.deepEqual(state.sqlErrors,[]);
        console.log(`DATABASE CASES: ${passed} passed, 0 failed`);
    } finally {
        if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
        try { if(began){await c.rollback();for(const [table,col,list] of [['UsersT','UserID',ids.users],['FamilyTreeT','FamilyTreeID',ids.trees],['FTPersonT','PersonID',ids.people]]){if(list.length){const [[row]]=await q(`SELECT COUNT(*) n FROM ${table} WHERE ${col} IN (?)`,[list]);assert.equal(Number(row.n),0,'Synthetic rows remain');}}const [[row]]=await q('SELECT COUNT(*) n FROM FTPersonT WHERE LastName=?',[prefix]);assert.equal(Number(row.n),0);console.log('ROLLBACK AND SYNTHETIC RECORD CLEANUP: PASS');} } finally {await c.end();}
    }
    console.log('REAL DATABASE ACCEPTANCE: PASS');
}
if(process.argv.includes('--self-test')) {
    assert.throws(()=>guardEnv({DB_HOST:'morty2.heliohost.org',DB_NAME:'wapps_production',DB_USER:'wapps_production',DB_PORT:'3306',DB_PASSWORD:'x'}));
    guardEnv({DB_HOST:'morty2.heliohost.org',DB_NAME:'wapps_test',DB_USER:'wapps_test',DB_PORT:'3306',DB_PASSWORD:'x'});
    assert.equal(sqlKind('SELECT PersonID FROM FTPersonT FOR UPDATE'),'read');assert.equal(sqlKind('INSERT INTO FTParentT VALUES (?)'),'write');
    for(const sql of ['COMMIT','DROP TABLE FTPersonT','UPDATE UsersT SET IsAdministrator=1','SELECT 1; COMMIT','SELECT 1 INTO OUTFILE \'x\''])assert.throws(()=>sqlKind(sql));
    console.log('OFFLINE GUARD SELF-TEST: PASS');
} else main().catch(e=>{console.error('REAL DATABASE ACCEPTANCE: FAIL', e.code||e.name, e.message);process.exitCode=1;});
