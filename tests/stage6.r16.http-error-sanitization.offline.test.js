'use strict';
// Isolated source-level regression tests. No server, actual database or network.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const notificationSource = fs.readFileSync(path.join(root, 'routes', 'notifications.js'), 'utf8');
const SECRET = 'SYNTHETIC_R16_DO_NOT_STORE_849103';

function response() {
  return {
    statusCode: 200, body: undefined,
    status(n) { this.statusCode = n; return this; },
    json(data) { this.body = data; return this; }
  };
}

function loadCentralHandler() {
  const start = serverSource.indexOf('app.use((err, req, res, next) => {');
  const end = serverSource.indexOf('\n});', start);
  assert.ok(start >= 0 && end > start, 'central Express error handler found');
  const segment = serverSource.slice(start, end + 4);
  let handler;
  const logged = [];
  vm.runInNewContext(segment, {
    app: { use(fn) { handler = fn; } },
    logger: { error(s) { logged.push(String(s)); } }
  });
  assert.equal(typeof handler, 'function');
  return { handler, logged };
}

function loadNotificationRouter(service) {
  const endpoints = new Map();
  const router = {
    get(path, ...handlers) { endpoints.set('GET ' + path, handlers); },
    put(path, ...handlers) { endpoints.set('PUT ' + path, handlers); },
    post(path, ...handlers) { endpoints.set('POST ' + path, handlers); }
  };
  const defaults = {
    getPreferences: async () => ({}),
    updatePreferences: async () => ({}),
    getUnsubscribeInfo: async () => null,
    unsubscribeByToken: async () => ({}),
  };
  const crypto = require('node:crypto');
  const fakeRequire = name => {
    if (name === 'express') return { Router: () => router };
    if (name === 'crypto') return crypto;
    if (name === '../dbConnection') return { pool: { query: async () => [[]] } };
    if (name === '../middleware/auth') return (_req, _res, next) => next();
    if (name === '../services/notificationService') return { ...defaults, ...service };
    throw Error('Unexpected dependency: ' + name);
  };
  vm.runInNewContext(notificationSource, { require: fakeRequire, module: { exports: {} } });
  async function call(method, url, request = {}) {
    const chain = endpoints.get(method + ' ' + url);
    assert.ok(chain, 'expected registered route: ' + method + ' ' + url);
    const res = response();
    const req = { user: { userId: 42 }, body: {}, params: { token: 'sample' }, ...request };
    // Every covered handler ends with the async route handler; mocked auth is not executed.
    await chain[chain.length - 1](req, res);
    return res;
  }
  return { call, endpoints };
}

test('R16 central handler suppresses unexpected HTTP 500 details and logs', () => {
  const { handler, logged } = loadCentralHandler();
  const r = response();
  handler(new Error('database failed: ' + SECRET), {}, r, () => {});
  assert.equal(r.statusCode, 500);
  assert.equal(r.body.error.message, 'Internal Server Error');
  assert.ok(!JSON.stringify(r.body).includes(SECRET));
  assert.ok(!logged.join(' ').includes(SECRET));
});

test('R16 central handler preserves expected HTTP 400/403 and 503 statuses', () => {
  const { handler } = loadCentralHandler();
  for (const status of [400, 403]) {
    const r = response();
    const e = new Error('Expected validation or access message'); e.status = status;
    handler(e, {}, r, () => {});
    assert.equal(r.statusCode, status);
    assert.equal(r.body.error.message, 'Expected validation or access message');
  }
  const r = response(); const e = new Error(SECRET); e.status = 503;
  handler(e, {}, r, () => {});
  assert.equal(r.statusCode, 503);
  assert.equal(r.body.error.message, 'Internal Server Error');
});

test('R16 notifications private preferences GET never exposes unexpected exceptions', async () => {
  const r = loadNotificationRouter({ getPreferences: async () => { throw Error(SECRET); } });
  const out = await r.call('GET', '/preferences');
  assert.equal(out.statusCode, 500);
  assert.equal(out.body.message, 'Internal Server Error');
});

test('R16 notifications public unsubscribe GET never exposes unexpected exceptions', async () => {
  const r = loadNotificationRouter({ getUnsubscribeInfo: async () => { throw Error(SECRET); } });
  const out = await r.call('GET', '/unsubscribe/:token');
  assert.equal(out.statusCode, 500);
  assert.equal(out.body.message, 'Internal Server Error');
});

test('R16 notifications preserves intentional validation message and status', async () => {
  const r = loadNotificationRouter({});
  const out = await r.call('PUT', '/preferences', {body: {marketingEmail: 'not-a-boolean'}});
  assert.equal(out.statusCode, 400);
  assert.equal(out.body.message, 'marketingEmail must be true or false.');
});

test('R16 notifications preserves expected 404 and 410', async () => {
  const r = loadNotificationRouter({getUnsubscribeInfo: async () => null});
  const out = await r.call('GET', '/unsubscribe/:token');
  assert.equal(out.statusCode, 404);
  assert.equal(out.body.message, 'This unsubscribe link is not valid.');
  const r2 = loadNotificationRouter({unsubscribeByToken: async () => {const e = new Error('This unsubscribe link has expired.'); e.status = 410; throw e;}});
  const expired = await r2.call('POST', '/unsubscribe/:token');
  assert.equal(expired.statusCode, 410);
  assert.equal(expired.body.message, 'This unsubscribe link has expired.');
});

test('R16 notifications preserves upstream 502 status but suppresses unexpected detail', async () => {
  const r = loadNotificationRouter({ updatePreferences: async () => {const e = new Error(SECRET); e.status = 502; throw e;} });
  const out = await r.call('PUT', '/preferences', {body: {}});
  assert.equal(out.statusCode, 502);
  assert.equal(out.body.message, 'Internal Server Error');
});

test('R16 only the intended error-handling call sites were changed', () => {
  assert.equal((notificationSource.match(/sendSafeNotificationError\(res, error\);/g)||[]).length, 6);
  assert.equal((notificationSource.match(/json\(\{ message: error\.message \}\)/g)||[]).length, 0);
  assert.ok(serverSource.includes("'/familytree/privacy-verify'"));
  assert.ok(serverSource.includes("'/subscriptions'"));
  assert.ok(serverSource.includes('app.use(morganMiddleware)'));
});
