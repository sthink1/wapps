'use strict';
// Isolated route tests: no real network, database, email, or production mutations.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sourcePath = path.resolve(__dirname, '../routes/tnna.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const FIXED = 'Email delivery failed (details omitted).';

function loadRoute({ users = [{ Email: 'first@example.test' }], sender, adminName = 'admin', dbError } = {}) {
  const routes = [];
  const state = { sentTo: [], queryCalls: [], errors: [] };
  const router = {};
  for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
    router[method] = (route, ...handlers) => { routes.push({ method, route, handlers }); return router; };
  }
  const pool = {
    query: async (sql, params) => {
      state.queryCalls.push({ sql, params });
      if (/FROM UsersT WHERE UserID = \? LIMIT 1/.test(sql)) return [[{ UserName: adminName }]];
      if (/FROM TNNAUserT t/.test(sql) && /JOIN UsersT u/.test(sql)) return [users];
      if (/FROM TNNAVersionT/.test(sql)) return [[{ VersionCode: 1, VersionName: '1.0', DownloadUrl: 'https://example.test/download' }]];
      throw new Error('Unexpected database query in isolated test');
    }
  };
  const fakeRequire = (id) => {
    if (id === 'express') return { Router: () => router };
    if (id === 'crypto') return require('node:crypto');
    if (id === 'jsonwebtoken') return { sign() {}, verify() {} };
    if (id === '../dbConnection') return { pool };
    if (id === '../services/browserSession') return { securityVersion: () => 1 };
    if (id === '../services/credentialFence') return {};
    if (id === '../middleware/auth') return (_req, _res, next) => next();
    if (id === '../utils') return { handleDbError: dbError || ((err, res) => { state.errors.push(err); res.status(500).json({ error: 'Server error' }); }) };
    if (id === '../send_email') return { sendNotificationEmail: async (payload) => {
      state.sentTo.push(payload.email);
      if (sender) await sender(payload);
    } };
    if (id === '../services/notificationService') return { getActiveConsentVersion() {}, logConsent() {} };
    if (id === 'dotenv') return { config() {} };
    throw new Error(`Unknown mock module ${id}`);
  };
  const sandbox = { require: fakeRequire, module: { exports: {} }, exports: {}, process: { env: { ADMIN_USERNAME: 'admin' } }, console, Buffer, Date, setTimeout, clearTimeout };
  vm.runInNewContext(source, sandbox, { filename: sourcePath });
  const target = routes.find((r) => r.method === 'post' && r.route === '/admin/send-update');
  assert.ok(target, 'admin update endpoint must remain registered');
  return { route: target, state, pool };
}

async function call(options = {}, body = {}) {
  const x = loadRoute(options);
  const req = { user: { userId: 15 }, body };
  const res = { code: 200, body: undefined, status(n) { this.code = n; return this; }, json(value) { this.body = value; return this; } };
  // Route's declared authentication middleware is simulated and the original requireAdmin is executed.
  assert.equal(x.route.handlers.length, 3);
  let index = 0;
  let pending = null;
  async function next() {
    index++;
    pending = Promise.resolve(x.route.handlers[index](req, res, next));
    return pending;
  }
  await Promise.resolve(x.route.handlers[0](req, res, next));
  while (pending) { const current = pending; pending = null; await current; }
  return { res, state: x.state, route: x.route };
}

test('route retains authentication and administrator middleware', () => {
  const { route } = loadRoute();
  assert.equal(route.handlers.length, 3);
  assert.match(source, /router\.post\('\/admin\/send-update', auth, requireAdmin,/);
});
test('no recipients: eligible/sent/failed contract unchanged', async () => {
  const { res, state } = await call({ users: [] });
  assert.equal(res.code, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(res.body)), { eligible: 0, sent: 0, failed: [] });
  assert.equal(state.sentTo.length, 0);
});
test('successful send retains count and no failure entries', async () => {
  const { res, state } = await call({ users: [{ Email: 'a@example.test' }] });
  assert.equal(res.body.eligible, 1);
  assert.equal(res.body.sent, 1);
  assert.equal(res.body.failed.length, 0);
  assert.deepEqual(state.sentTo, ['a@example.test']);
});
test('failed send preserves recipient but masks raw provider details', async () => {
  const secret = 'provider-secret-token-123';
  const { res } = await call({ sender: async () => { throw new Error(`secret=${secret}`); } });
  assert.equal(res.body.eligible, 1);
  assert.equal(res.body.sent, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(res.body.failed)), [{ email: 'first@example.test', error: FIXED }]);
  assert.doesNotMatch(JSON.stringify(res.body), /provider-secret-token-123/);
});
test('mixed send results keep eligible, sent, and failed recipient structure', async () => {
  const users = [{ Email: 'ok1@example.test' }, { Email: 'fail@example.test' }, { Email: 'ok2@example.test' }];
  const { res, state } = await call({ users, sender: async p => { if (p.email === 'fail@example.test') throw Error('private SMTP detail'); } });
  assert.equal(res.body.eligible, 3);
  assert.equal(res.body.sent, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(res.body.failed)), [{ email: 'fail@example.test', error: FIXED }]);
  assert.deepEqual(state.sentTo, users.map(x => x.Email));
});
test('non-Error rejection is handled without exposing raw data', async () => {
  const { res } = await call({ sender: async () => { throw 'raw private provider text'; } });
  assert.equal(res.body.failed[0].error, FIXED);
  assert.doesNotMatch(JSON.stringify(res.body), /raw private provider text/);
});
test('null rejection is handled without crashing update loop', async () => {
  const { res } = await call({ sender: async () => { throw null; } });
  assert.equal(res.body.failed[0].error, FIXED);
});
test('normal notification message and update link remain intact', async () => {
  let payload;
  const { res } = await call({ sender: async p => { payload = p; } });
  assert.equal(res.code, 200);
  assert.equal(payload.category, 'APP_NOTICE');
  assert.equal(payload.subject, 'Town Notification 1.0 update available');
  assert.equal(payload.actionButtons[0].url, 'https://example.test/download');
  assert.match(payload.message, /Town Notification version/);
});
test('custom subject and message remain intact', async () => {
  let payload;
  await call({ sender: async p => { payload = p; } }, { subject: 'Custom update', message: 'Specific text' });
  assert.equal(payload.subject, 'Custom update');
  assert.equal(payload.message, 'Specific text');
});
test('fixed failure response does not include any exception property', () => {
  assert.match(source, /failed\.push\(\{ email: user\.Email, error: 'Email delivery failed \(details omitted\)\.' \}\);/);
  assert.doesNotMatch(source, /failed\.push\(\{ email: user\.Email, error: error\.message \}\)/);
});
