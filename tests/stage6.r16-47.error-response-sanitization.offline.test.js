'use strict';
// WA Stage 6 R16-47: read-only isolated tests for existing error response handlers.
// Execute in WA project root: node --test tests/stage6.r16-47.error-response-sanitization.offline.test.js
// This file never imports the server, opens a database connection, or sends an HTTP request.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = p => fs.readFileSync(path.join(root, p), 'utf8');

function extractThroughNext(sourceText, start, end, label) {
  const i = sourceText.indexOf(start);
  assert.notEqual(i, -1, `${label}: start marker not found`);
  const j = sourceText.indexOf(end, i + start.length);
  assert.notEqual(j, -1, `${label}: end marker not found`);
  return sourceText.slice(i, j + end.length);
}

function isolatedFunction(file, startMarker, endMarker, functionName) {
  const block = extractThroughNext(source(file), startMarker, endMarker, file);
  const context = vm.createContext({ Number, Error });
  vm.runInContext(`${block}\nthis.selected = ${functionName};`, context, { timeout: 1000 });
  assert.equal(typeof context.selected, 'function');
  return context.selected;
}

function fakeResponse() {
  return {
    statusCode: null,
    body: null,
    status(n) { this.statusCode = n; return this; },
    json(value) { this.body = value; return this; }
  };
}

function error(message, status) {
  const e = new Error(message);
  if (status !== undefined) e.status = status;
  return e;
}

const secret = 'INTERNAL_TEST_SECRET_database_host_token_DoNotExpose';

const familySource = source('routes/familyTree.js');
const notificationSource = source('routes/notifications.js');
const serverSource = source('server.js');

const family = isolatedFunction(
  'routes/familyTree.js',
  'function safeFamilyTreeErrorMessage(',
  '\n}\n',
  'safeFamilyTreeErrorMessage'
);
const notification = isolatedFunction(
  'routes/notifications.js',
  'function sendSafeNotificationError(',
  '\n}\n',
  'sendSafeNotificationError'
);

// Execute only the existing central error-handler registration (not server.js).
const start = '// Centralized Error-Handling Middleware';
const stop = '\n});';
const errorMiddlewareSource = extractThroughNext(serverSource, start, stop, 'server error middleware');
const middlewareState = { handler: null, logs: [] };
const middlewareContext = vm.createContext({
  Number,
  app: { use(fn) { middlewareState.handler = fn; } },
  logger: { error(line) { middlewareState.logs.push(line); } }
});
vm.runInContext(errorMiddlewareSource, middlewareContext, { timeout: 1000 });
assert.equal(typeof middlewareState.handler, 'function', 'Central Express error middleware not registered');

function runCentral(e) {
  const res = fakeResponse();
  middlewareState.logs.length = 0;
  middlewareState.handler(e, {}, res, () => {});
  return { res, logs: [...middlewareState.logs] };
}

test('R16-47-01 Family Tree unexpected 500 does not disclose exception text', () => {
  assert.equal(family(error(secret)), 'Internal Server Error');
  assert.equal(family(error(secret, 500)), 'Internal Server Error');
});

test('R16-47-02 Family Tree explicit 400 remains descriptive; 503 is generic', () => {
  assert.equal(family(error('Enter a valid date.', 400)), 'Enter a valid date.');
  assert.equal(family(error(secret, 503)), 'Internal Server Error');
});

test('R16-47-03 Favorite Pets catch uses the safe Family Tree helper', () => {
  const handler = extractThroughNext(familySource, 'const petHandler = async ', '\n};', 'Favorite Pets handler');
  assert.match(handler, /catch\s*\(e\)\s*\{[\s\S]*?res\.status\(e\.status\s*\|\|\s*500\)\.json\(\{\s*message\s*:\s*safeFamilyTreeErrorMessage\(e\)/);
  assert.doesNotMatch(handler, /json\(\{\s*message\s*:\s*e\.message/);
});

test('R16-47-04 Notifications unexpected 500 and 503 are sanitized', () => {
  for (const status of [undefined, 500, 503]) {
    const res = fakeResponse();
    notification(res, error(secret, status));
    assert.equal(res.statusCode, status ?? 500);
    assert.equal(res.body.message, 'Internal Server Error');
    assert.equal(JSON.stringify(res.body).includes(secret), false);
  }
});

test('R16-47-05 Notifications explicit 400 remains descriptive', () => {
  const res = fakeResponse();
  notification(res, error('marketingEmail must be true or false.', 400));
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'marketingEmail must be true or false.');
});

test('R16-47-06 Notification preference routes call the sanitizing helper', () => {
  for (const method of ['get', 'put']) {
    const routeStart = `router.${method}('/preferences'`;
    const until = method === 'get' ? "router.put('/preferences'" : "// Public endpoint used by unsubscribe.html";
    const i = notificationSource.indexOf(routeStart);
    assert.ok(i >= 0, `missing ${method} notification preferences endpoint`);
    const j = notificationSource.indexOf(until, i + routeStart.length);
    assert.ok(j > i, `missing boundary for ${method} endpoint`);
    assert.match(notificationSource.slice(i, j), /catch\s*\(error\)\s*\{\s*sendSafeNotificationError\(res,\s*error\)/);
  }
});

test('R16-47-07 Central Express middleware shields unexpected 500 and 503', () => {
  for (const status of [undefined, 500, 503]) {
    const { res, logs } = runCentral(error(secret, status));
    assert.equal(res.statusCode, status ?? 500);
    assert.equal(res.body.error.message, 'Internal Server Error');
    assert.equal(JSON.stringify(res.body).includes(secret), false);
    assert.equal(logs.some(s => s.includes(secret)), false);
  }
});

test('R16-47-08 Central Express middleware preserves intended 400, hides unexpected text in logs', () => {
  const { res, logs } = runCentral(error('Validation failed.', 400));
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error.message, 'Validation failed.');
  assert.equal(logs.some(s => s.includes('Validation failed.')), false);
});
