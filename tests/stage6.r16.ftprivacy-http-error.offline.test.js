'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const sourcePath = path.resolve(__dirname, '..', 'routes', 'ftPrivacy.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const start = source.indexOf('function sendError(');
const end = source.indexOf('\nfunction canonicalCode(', start);
assert.ok(start >= 0 && end > start);
const logs = [];
const sendError = vm.runInNewContext(`${source.slice(start, end)}; sendError`, {
  console: {error: (...args) => logs.push(args.join(' '))}
});
function result(error) {
  logs.length = 0;
  const response = {statusCode: null, payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }};
  sendError(response, error);
  return {response, log: logs.join(' ')};
}
function err(status, message = 'SYNTHETIC_SECRET_NOT_FOR_OUTPUT') {
  const e = new Error(message);
  if (status !== undefined) e.status = status;
  return e;
}
test('HTTP 500 suppresses synthetic secret and retains status', () => {
  const {response, log} = result(err(500));
  assert.equal(response.statusCode, 500);
  assert.deepEqual(JSON.stringify(response.payload), JSON.stringify({message:'Privacy request failed.'}));
  assert.ok(!JSON.stringify(response.payload).includes('SYNTHETIC_SECRET'));
  assert.ok(!log.includes('SYNTHETIC_SECRET'));
  assert.match(log,/details omitted/);
});
test('HTTP 502 and 503 preserve status and suppress exception details', () => {
  for (const status of [502,503]) {
    const {response,log} = result(err(status));
    assert.equal(response.statusCode,status);
    assert.equal(response.payload.message,'Privacy request failed.');
    assert.ok(!log.includes('SYNTHETIC_SECRET'));
  }
});
test('intentional 400, 403, 404, 409 and 429 preserve messages', () => {
  for (const status of [400,403,404,409,429]) {
    const {response, log} = result(err(status,'Intentional user-facing message'));
    assert.equal(response.statusCode,status);
    assert.equal(response.payload.message,'Intentional user-facing message');
    assert.equal(log,'');
  }
});
test('missing, malformed and out-of-range error status produce sanitized 500', () => {
  for (const status of [undefined, null, '500', 200, 399, 600, 0, -1, 500.5]) {
    const {response,log} = result(err(status));
    assert.equal(response.statusCode,500);
    assert.equal(response.payload.message,'Privacy request failed.');
    assert.ok(!log.includes('SYNTHETIC_SECRET'));
  }
});
test('null, empty and nonstring client error messages use generic fallback', () => {
  for (const m of [null,'',0]) {
    const e = {status:400,message:m};
    assert.equal(result(e).response.payload.message,'Privacy request failed.');
  }
});
test('undefined and null error objects yield sanitized 500', () => {
  for (const e of [undefined, null]) {
    const {response} = result(e);
    assert.equal(response.statusCode,500);
    assert.equal(response.payload.message,'Privacy request failed.');
  }
});
test('public approval GET/POST and private privacy routes remain present', () => {
  for (const s of ["publicRouter.get('/:token'", "publicRouter.post('/:token'", "privateRouter.get('/status/:personID'", "privateRouter.post('/request/:personID'", "privateRouter.post('/unlock/:personID'", "module.exports={publicRouter,privateRouter,protection}"]) {
    assert.ok(source.includes(s),s);
  }
});
test('privacy filtering, safe failure and exact source-change scope retained', () => {
  assert.ok(source.includes("code:'PRIVATE_LOCKED'"));
  assert.ok(source.includes('function redactPerson('));
  assert.ok(source.includes("Unable to safely return Family Tree data."));
  const baseline = '0b33b28f6aee34c0a718ede5afc2dba56a59a42b40b4a3e651f9711424d37534';
  const outsideHandler = source.replace(source.slice(start,end),'FUNCTION_REPLACED').replace(/\r\n/g,'\n');
  assert.equal(crypto.createHash('sha256').update(outsideHandler).digest('hex'),baseline);
});
