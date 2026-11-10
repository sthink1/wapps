'use strict';
/*
 * Wonderful Apps Stage 6, R16-49: offline refresh-session error contract.
 * This file reads routes/users.js and evaluates ONLY its refresh-session
 * route declaration in a sandbox with mocked dependencies. No server, DB,
 * network, cookies, or live tokens are used.
 *
 * A failed 5xx safety assertion identifies an issue to investigate; it is
 * not evidence of real-world secret disclosure.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'routes', 'users.js'), 'utf8');

function extractRefreshRoute() {
  const beginning = "router.post('/refresh-session'";
  const start = source.indexOf(beginning);
  assert.ok(start >= 0, 'refresh-session route must exist in routes/users.js');
  // The route at the reviewed 18e759e source ends with a stand-alone `});`.
  const ending = source.indexOf('\n});', start);
  assert.ok(ending > start, 'refresh-session route ending must be located');
  return source.slice(start, ending + '\n});'.length);
}

const routeText = extractRefreshRoute();

async function invokeSyntheticFailure(failure) {
  let handler;
  const router = {
    post(route, fn) {
      assert.equal(route, '/refresh-session');
      handler = fn;
    }
  };
  // Only a synthetic exception is thrown, prior to any database access.
  const sessions = {
    requireOrigin() { throw failure; },
    rotate() { throw new Error('UNEXPECTED_ROTATE_CALL'); },
    cookie() { throw new Error('UNEXPECTED_COOKIE_CALL'); },
    setCookie() { throw new Error('UNEXPECTED_SET_COOKIE_CALL'); }
  };
  vm.runInNewContext(routeText, { router, sessions, pool: {} }, {
    filename: 'routes/users.js (isolated refresh-session declaration)',
    timeout: 1000
  });
  assert.equal(typeof handler, 'function');
  const result = { status: 200, body: undefined, headers: {} };
  const res = {
    status(code) { result.status = code; return this; },
    json(body) { result.body = JSON.parse(JSON.stringify(body)); return this; },
    set(name, val) { result.headers[name] = val; return this; }
  };
  await handler({ get() { return undefined; }, headers: {} }, res);
  return result;
}

function syntheticError(status, message) {
  const err = new Error(message);
  if (status !== undefined) err.status = status;
  return err;
}

test('R16-49A: expected 401 retains REFRESH_INVALID', async () => {
  const r = await invokeSyntheticFailure(syntheticError(401, 'REFRESH_INVALID'));
  assert.equal(r.status, 401);
  assert.deepEqual(r.body, { error: 'REFRESH_INVALID' });
});

test('R16-49B: expected 403 retains ORIGIN_NOT_ALLOWED', async () => {
  const r = await invokeSyntheticFailure(syntheticError(403, 'ORIGIN_NOT_ALLOWED'));
  assert.equal(r.status, 403);
  assert.deepEqual(r.body, { error: 'ORIGIN_NOT_ALLOWED' });
});

test('R16-49C: unclassified exception remains generic 503', async () => {
  const r = await invokeSyntheticFailure(syntheticError(undefined, 'SYNTHETIC_INTERNAL_DETAILS'));
  assert.equal(r.status, 503);
  assert.deepEqual(r.body, { error: 'AUTH_SERVICE_UNAVAILABLE' });
});

test('R16-49D: unexpected status 500 must not return exception details', async () => {
  const r = await invokeSyntheticFailure(syntheticError(500, 'SYNTHETIC_INTERNAL_DETAILS'));
  assert.equal(r.status, 500);
  assert.deepEqual(r.body, { error: 'AUTH_SERVICE_UNAVAILABLE' });
});

test('R16-49E: unexpected status 503 must not return exception details', async () => {
  const r = await invokeSyntheticFailure(syntheticError(503, 'SYNTHETIC_INTERNAL_DETAILS'));
  assert.equal(r.status, 503);
  assert.deepEqual(r.body, { error: 'AUTH_SERVICE_UNAVAILABLE' });
});


test('R16-50F: expected 400 preserves approved validation message', async () => {
  const r = await invokeSyntheticFailure(syntheticError(400, 'VALIDATION_FAILED'));
  assert.equal(r.status, 400);
  assert.deepEqual(r.body, { error: 'VALIDATION_FAILED' });
});

test('R16-50G: unexpected 502 retains status but hides exception details', async () => {
  const r = await invokeSyntheticFailure(syntheticError(502, 'SYNTHETIC_INTERNAL_DETAILS'));
  assert.equal(r.status, 502);
  assert.deepEqual(r.body, { error: 'AUTH_SERVICE_UNAVAILABLE' });
});
