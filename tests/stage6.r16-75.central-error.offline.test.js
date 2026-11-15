// R16-75: isolated central error middleware contract tests.
// Loads the actual source handler without app startup, database or network.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { markExpectedClientError, isExpectedClientError } = require('../services/stage6ExpectedClientError');

const sentinel = 'SYNTHETIC_R16_75_SECRET_MUST_NOT_LEAK';
const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const marker = '// Centralized Error-Handling Middleware';
const start = source.indexOf('app.use((err, req, res, next) => {', source.indexOf(marker));
const end = source.indexOf('\n});', start);
assert.ok(source.includes(marker) && start >= 0 && end > start, 'Central error handler not found');
const handlerSource = source.slice(start + 'app.use('.length, end + '\n}'.length);

function run(error, { requestPath = '/users/refresh-session', headersSent = false } = {}) {
  const logs = [];
  let delegated = null;
  const response = {
    headersSent,
    statusCode: 200,
    headers: {},
    body: null,
    set(k, v) { this.headers[k] = v; return this; },
    status(n) { this.statusCode = n; return this; },
    json(value) { this.body = value; return this; }
  };
  const sandbox = {
    isExpectedClientError,
    logger: { error(value) { logs.push(value); } }
  };
  const handler = vm.runInNewContext(handlerSource, sandbox);
  handler(error, { path: requestPath }, response, e => { delegated = e; });
  return { response, logs, delegated };
}

function error(status, message = sentinel, expected = false) {
  const e = Object.assign(new Error(message), { status });
  return expected ? markExpectedClientError(e) : e;
}

function publicMessage(result) { return result.response.body && result.response.body.error.message; }
function assertNoSentinel(result) {
  assert.equal(JSON.stringify(result.response.body).includes(sentinel), false);
  assert.equal(result.logs.join('\n').includes(sentinel), false);
}

test('T01: marked 400/401/403/404/409 preserve status, safe message and nested shape', () => {
  for (const status of [400, 401, 403, 404, 409]) {
    const result = run(error(status, 'Approved validation message', true));
    assert.equal(result.response.statusCode, status);
    assert.equal(publicMessage(result), 'Approved validation message');
    assert.equal(Object.keys(result.response.body).join(','), 'error');
  }
});

test('T02: unmarked 400/401/403/404/409 never expose exception text', () => {
  for (const status of [400, 401, 403, 404, 409]) {
    const result = run(error(status));
    assert.equal(result.response.statusCode, status);
    assert.equal(publicMessage(result), 'Request failed');
    assertNoSentinel(result);
  }
});

test('T03: marked and unmarked 500/503 always return generic error', () => {
  for (const status of [500, 503]) for (const expected of [false, true]) {
    const result = run(error(status, sentinel, expected));
    assert.equal(result.response.statusCode, status);
    assert.equal(publicMessage(result), 'Internal Server Error');
    assertNoSentinel(result);
  }
});

test('T04: absent/invalid status and missing error receive 500 without disclosure', () => {
  for (const item of [null, undefined, {}, error(399), error(600), error('400'), error(400.5)]) {
    const result = run(item);
    assert.equal(result.response.statusCode, 500);
    assert.equal(publicMessage(result), 'Internal Server Error');
    assertNoSentinel(result);
  }
});

test('T05: headers already sent delegates original exception without second send', () => {
  const e = error(400);
  const result = run(e, { headersSent: true });
  assert.equal(result.delegated, e);
  assert.equal(result.response.body, null);
  assert.equal(Object.keys(result.response.headers).length, 0);
  assertNoSentinel(result);
});

test('T06/T11: early protected prefix errors set no-store; public/static path unchanged', () => {
  for (const requestPath of ['/users', '/users/login', '/subscriptions/access', '/budget/in', '/familytree/privacy', '/tnna/session']) {
    const result = run(error(400), { requestPath });
    assert.equal(result.response.headers['Cache-Control'], 'no-store');
    assertNoSentinel(result);
  }
  for (const requestPath of ['/send-email', '/api/geocode/reverse', '/home.html', '/users-extra']) {
    const result = run(error(400), { requestPath });
    assert.equal(result.response.headers['Cache-Control'], undefined);
  }
});

test('T01 fallback: marked 4xx with empty or nonstring messages gets safe fallback', () => {
  for (const message of ['', null, 123]) {
    const e = markExpectedClientError(Object.assign(new Error(''), {status: 400, message}));
    const result = run(e);
    assert.equal(publicMessage(result), 'Request failed');
  }
});
