'use strict';
// Isolated source-policy regression. No app import, HTTP listener, database,
// credentials, filesystem writes, email or storage calls.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'routes', 'familyTree.js'), 'utf8');
function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `${name} exists`);
  const opening = source.indexOf('{', start);
  let depth = 0;
  for (let pos = opening; pos < source.length; pos++) {
    if (source[pos] === '{') depth++;
    if (source[pos] === '}') {
      depth--;
      if (depth === 0) return source.slice(start, pos + 1);
    }
  }
  throw Error(`Unterminated ${name}`);
}
const context = vm.createContext({});
vm.runInContext(extractFunction('safeFamilyTreeErrorMessage') + '\n' + extractFunction('safeFamilyTreeErrorDetail'), context);
const message = context.safeFamilyTreeErrorMessage;
const detail = context.safeFamilyTreeErrorDetail;
const secret = 'R16_FAKE_PRIVATE_TOKEN_DO_NOT_LOG';

test('unexpected exception has fixed generic message', () => {
  assert.equal(message(new Error(secret)), 'Internal Server Error');
  assert.equal(message({ status: 500, message: secret }), 'Internal Server Error');
});
test('unexpected upstream HTTP 502/503 messages are suppressed', () => {
  for (const status of [502, 503, 599]) {
    assert.equal(message({ status, message: secret }), 'Internal Server Error');
  }
});
test('intentional 400/401/403/404/409/410/423 messages stay intact', () => {
  for (const status of [400, 401, 403, 404, 409, 410, 423]) {
    assert.equal(message({ status, message: 'Expected domain response' }), 'Expected domain response');
  }
});
test('explicit HTTP 500 response ignores a contradictory exception status', () => {
  assert.equal(message({ status: 400, message: secret }, 500), 'Internal Server Error');
});
test('invalid or absent error status is never treated as intentional client error', () => {
  for (const status of [undefined, '400', 200, 600, NaN]) {
    assert.equal(message({ status, message: secret }), 'Internal Server Error');
  }
});
test('response code, matches, and review details are withheld on unexpected 5xx', () => {
  for (const field of ['responseCode', 'matches', 'review']) {
    assert.equal(detail({ status: 500, [field]: secret }, field), undefined);
    assert.equal(detail({ status: 400, [field]: 'expected' }, field), 'expected');
  }
});
test('all Family Tree error-response message expressions use sanitizer', () => {
  assert.doesNotMatch(source, /\bmessage\s*:\s*(?:e|error)\.message/);
  assert.doesNotMatch(source, /FamilyTree database connection failed:\s*['"`]\s*\+\s*e\.message/);
  assert.match(source, /message:\s*safeFamilyTreeErrorMessage\(e, 500\)/);
  assert.match(source, /message:\s*safeFamilyTreeErrorMessage\(error\)/);
});
test('Family Tree authorization and public token routes remain present', () => {
  assert.match(source, /router\.get\('\/contact-email-verification\/:token'/);
  assert.match(source, /router\.post\('\/contact-email-verification\/:token'/);
  assert.match(source, /router\.get\('\/health'/);
  assert.match(source, /router\.use\(\(err, req, res, next\) =>/);
});
