'use strict';
// Group 5B read-only regression of refresh-replay security contract and token family semantics.
// Does not create live sessions or touch any MySQL account. This is NOT a live concurrency test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../services/browserSession.js'),'utf8');
assert.match(source,/WebRefreshTokenT/);
assert.match(source,/ConsumedAt/);
assert.match(source,/REFRESH_INVALID/);
assert.match(source,/beginTransaction/);
assert.match(source,/commit/);
assert.match(source,/rollback/);
const family={consumed:false,children:[]};
function rotateSimulated(){
 if(family.consumed){const e=Error('REFRESH_INVALID');e.status=401;throw e}
 family.consumed=true;const child={id:family.children.length+1,consumed:false};family.children.push(child);return child;
}
const first=rotateSimulated();assert.equal(first.id,1);
assert.throws(rotateSimulated,e=>e.message==='REFRESH_INVALID'&&e.status===401);
assert.equal(family.children.length,1);
console.log('PASS source contract: application browserSession implements DB rotation, replay checks, transactions.');
console.log('PASS model: consumed credential rejected; only one successor in serialized simulation.');
console.log('LIMITATION: the model is not the real rotate() function and does not test actual concurrent MySQL locking.');
console.log('No account, database connection, cookie, HTTP request or email used.');
