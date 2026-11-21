// Focused, offline safety checks for WA M03 relationship bridge guards.
// No database or application server is opened. Assertions execute exact source
// functions extracted from the delivered route in a controlled VM context.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, '../routes/familyTree.js'), 'utf8');
function extract(start, end) {
    const a = source.indexOf(start);
    const b = source.indexOf(end, a + start.length);
    assert(a >= 0 && b > a, `Source function boundary absent: ${start}`);
    return source.slice(a, b);
}
const helper = extract('async function addRelationshipInTree(', '\n\nasync function ensureOriginTreeID(');
const memberHelper = extract('async function treeHasPerson(', '\n\nfunction duplicateScore(');
const env = {
    Set, Math, Number, Error,
    markExpectedClientError: e => e,
    addParentLink: async () => { throw new Error('Unexpected parent write'); },
    addSiblingLink: async () => { throw new Error('Unexpected sibling write'); }
};
vm.runInNewContext(memberHelper + '\n' + helper + '\nthis.check=addRelationshipInTree;', env);
function db(members) {
    const writes = [];
    const c = { async query(sql, params) {
        if (sql.includes('SELECT 1') && sql.includes('FTFamilyTreePersonT')) {
            return [members.has(`${params[0]}:${params[1]}`) ? [{ ok: 1 }] : []];
        }
        writes.push({ sql, params });
        return [[]];
    }};
    return { c, writes };
}
(async () => {
    let count = 0;
    async function deny(desc, args, members, status) {
        const { c, writes } = db(members);
        await assert.rejects(() => env.check(c, 1, 42, ...args), e => e.status === status, desc);
        assert.equal(writes.length, 0, `${desc}: no writes before denial`);
        console.log(`PASS ${++count}: ${desc}`);
    }
    await deny('focal in unrelated Tree', [999, 2, 'partner'], new Set(['1:2']), 403);
    await deny('related in unrelated Tree', [1, 999, 'partner'], new Set(['1:1']), 403);
    await deny('unsupported relationship kind', [1, 2, 'invalid'], new Set(['1:1','1:2']), 400);
    await deny('self-relationship rejected', [1, 1, 'partner'], new Set(['1:1']), 400);
    await deny('non-integer Person ID rejected', [1.2, 2, 'partner'], new Set(['1:2']), 400);
    const {c,writes} = db(new Set(['1:1','1:2']));
    await env.check(c, 1, 42, 1, 2, 'partner');
    assert(writes.some(x => x.sql.includes('FTPartnerT')));
    console.log(`PASS ${++count}: valid same-Tree relationship writes`);
    const routeStart = source.indexOf("router.post('/one-tree/merge'");
    const guard = source.indexOf('Relationship Person is outside the two Family Trees being merged.', routeStart);
    const record = source.indexOf('const mergeRecord = await createOneTreeMergeRecord(', routeStart);
    assert(routeStart >= 0 && guard > routeStart && record > guard);
    console.log(`PASS ${++count}: cross-Tree guard precedes merge-record write`);
    assert(source.includes('treeHasPerson(c, sourceTree.FamilyTreeID, id)') &&
           source.includes('treeHasPerson(c, targetTree.FamilyTreeID, id)'));
    console.log(`PASS ${++count}: cross-Tree guard checks both participating Trees`);
    assert(source.includes('await missingOneTreePrivacy('));
    console.log(`PASS ${++count}: M03 privacy guard retained`);
    console.log(`TOTAL: ${count}/${count} PASS (offline/source-backed only)`);
})().catch(err => { console.error(err); process.exitCode = 1; });
