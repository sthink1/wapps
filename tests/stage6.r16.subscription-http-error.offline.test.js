// Stage 6 R16 — subscriptions exception response policy. Offline, no external I/O.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'routes', 'subscriptions.js'), 'utf8');
const methodToService = [
  ['POST', '/promo', 'redeemPromoCode'],
  ['POST', '/usage', 'recordUsage'],
  ['POST', '/admin/promos', 'createAdminPromoCode'],
  ['PUT', '/admin/promos/:promoCodeId', 'updateAdminPromoCode'],
  ['GET', '/admin/user/:userId', 'getAdminUserSubscription'],
  ['POST', '/admin/grant', 'grantAdminFreeUsage'],
  ['PUT', '/admin/grants/:grantId', 'updateAdminFreeGrant'],
  ['DELETE', '/admin/grants/:grantId', 'revokeAdminFreeGrant']
];

function loadRouter(error) {
  const endpoints = new Map();
  const router = {
    use() {},
    get(path, ...fns) { endpoints.set('GET ' + path, fns[fns.length - 1]); },
    post(path, ...fns) { endpoints.set('POST ' + path, fns[fns.length - 1]); },
    put(path, ...fns) { endpoints.set('PUT ' + path, fns[fns.length - 1]); },
    delete(path, ...fns) { endpoints.set('DELETE ' + path, fns[fns.length - 1]); }
  };
  const services = Object.fromEntries([
    'getStatusWithApps', 'redeemPromoCode', 'getAppAccess', 'recordUsage',
    'listAdminPromoCodes', 'createAdminPromoCode', 'updateAdminPromoCode',
    'getAdminUserSubscription', 'listAdminFreeGrants', 'listAdminPromoRedemptions',
    'grantAdminFreeUsage', 'updateAdminFreeGrant', 'revokeAdminFreeGrant'
  ].map(name => [name, async () => { throw error; }]));
  const context = {
    module: { exports: {} },
    require(name) {
      if (name === 'express') return { Router: () => router };
      if (name === '../middleware/subscriptionAccess') return { authenticateToken() {}, isAdminUser: () => true };
      if (name === '../services/subscriptionService') return services;
      throw new Error('Unexpected import: ' + name);
    },
    Number
  };
  vm.runInNewContext(source, context, { filename: 'routes/subscriptions.js' });
  return endpoints;
}

async function exercise(method, url, error) {
  const endpoints = loadRouter(error);
  const handler = endpoints.get(method + ' ' + url);
  assert.equal(typeof handler, 'function', `Missing ${method} ${url}`);
  const calls = { code: 200, response: null, forwarded: null };
  const res = {
    status(code) { calls.code = code; return this; },
    json(payload) { calls.response = payload; return this; }
  };
  const req = { user: { userId: 9 }, body: { code: 'TEST', appKey: 'x' }, params: { userId: '9', promoCodeId: '1', grantId: '1' } };
  await handler(req, res, errorPassed => { calls.forwarded = errorPassed; });
  return calls;
}

test('all eight target handlers remain present', () => {
  assert.equal(methodToService.length, 8);
  const endpoints = loadRouter(new Error('fixture'));
  for (const [method, url] of methodToService) assert.equal(typeof endpoints.get(method + ' ' + url), 'function');
});

test('intentional HTTP 400 errors keep their original message and shape in every target handler', async () => {
  for (const [method, url] of methodToService) {
    const error = Object.assign(new Error('Approved validation message'), { status: 400 });
    const result = await exercise(method, url, error);
    assert.equal(result.code, 400, url);
    assert.equal(result.response.error, 'Approved validation message', url);
    assert.equal(result.forwarded, null, url);
  }
});

test('intentional HTTP 404 errors keep their original message and shape in every target handler', async () => {
  for (const [method, url] of methodToService) {
    const error = Object.assign(new Error('Approved not-found message'), { status: 404 });
    const result = await exercise(method, url, error);
    assert.equal(result.code, 404, url);
    assert.equal(result.response.error, 'Approved not-found message', url);
    assert.equal(result.forwarded, null, url);
  }
});

test('HTTP 500/502/503 errors are forwarded to central handler, not sent to client', async () => {
  for (const status of [500, 502, 503]) for (const [method, url] of methodToService) {
    const error = Object.assign(new Error('SYNTHETIC_SECRET_DO_NOT_EXPOSE'), { status });
    const result = await exercise(method, url, error);
    assert.equal(result.forwarded, error, `${url} status ${status}`);
    assert.equal(result.response, null, `${url} status ${status}`);
  }
});

test('missing or malformed status is forwarded safely', async () => {
  for (const status of [undefined, null, '500', 399, 600]) for (const [method, url] of methodToService) {
    const error = new Error('SYNTHETIC_SECRET_DO_NOT_EXPOSE');
    if (status !== undefined) error.status = status;
    const result = await exercise(method, url, error);
    assert.equal(result.forwarded, error, `${url} status ${status}`);
    assert.equal(result.response, null, `${url} status ${status}`);
  }
});

test('all eight explicit error-handling guards use bounded client status', () => {
  const matches = source.match(/if \(Number\.isInteger\(error && error\.status\) && error\.status >= 400 && error\.status < 500\)/g) || [];
  assert.equal(matches.length, 8);
  assert.equal((source.match(/if \(error\.status\)/g) || []).length, 0);
});
