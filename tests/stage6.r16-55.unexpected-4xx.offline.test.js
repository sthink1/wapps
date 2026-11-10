'use strict';

// WA Stage 6 R16-55 — source-backed, offline negative tests.
// No app startup, network, real authentication, database access, or source changes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { markExpectedClientError, isExpectedClientError } = require('../services/stage6ExpectedClientError');

const root = path.resolve(__dirname, '..');
const SECRET = 'SYNTHETIC_INTERNAL_DETAILS_R16_55';
function source(file) { return fs.readFileSync(path.join(root, 'routes', file), 'utf8'); }

// Extract only the named top-level helper, rather than loading route dependencies.
function extractFunction(text, name) {
  const start = text.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Function ${name} was not found in current source`);
  const brace = text.indexOf('{', start);
  assert.ok(brace > start, `Function body missing for ${name}`);
  let depth = 0;
  for (let i = brace; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  assert.fail(`Unclosed function ${name}`);
}
function familyTreeMessage(error) {
  const fn = vm.runInNewContext(`(${extractFunction(source('familyTree.js'), 'safeFamilyTreeErrorMessage')})`, {isExpectedClientError});
  return fn(error);
}
function notificationsResponse(error) {
  const fn = vm.runInNewContext(`(${extractFunction(source('notifications.js'), 'sendSafeNotificationError')})`, {isExpectedClientError});
  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  fn(response, error);
  return { status: response.statusCode, body: response.body };
}
async function subscriptionPromoResponse(error) {
  const routes = [];
  const router = {
    use() {},
    get(route, ...handlers) { routes.push({ method:'get',route,handlers }); },
    post(route, ...handlers) { routes.push({ method:'post',route,handlers }); },
    put(route, ...handlers) { routes.push({ method:'put',route,handlers }); },
    delete(route, ...handlers) { routes.push({ method:'delete',route,handlers }); }
  };
  const noop = () => {};
  const mockService = {
    redeemPromoCode: async () => { throw error; }
  };
  const sandbox = {
    module: { exports: {} },
    exports: {},
    require(specifier) {
      if (specifier === 'express') return { Router: () => router };
      if (specifier === '../services/stage6ExpectedClientError') return {isExpectedClientError};
      if (specifier === '../middleware/subscriptionAccess') return { authenticateToken:noop, isAdminUser:noop };
      if (specifier === '../services/subscriptionService') return mockService;
      throw new Error(`R16-55 unexpected import ${specifier}`);
    }
  };
  vm.runInNewContext(source('subscriptions.js'), sandbox, { filename: 'subscriptions.js' });
  const selected = routes.find(r => r.method === 'post' && r.route === '/promo');
  assert.ok(selected, 'Expected /promo handler in source');
  assert.equal(selected.handlers.length, 1, 'Unexpected /promo middleware structure');
  const res = { statusCode:200, body:null, status(code) {this.statusCode=code;return this;},json(body){this.body=body;return this;} };
  let forwarded = null;
  await selected.handlers[0]({ user: { userId: 123 }, body: { code: 'synthetic' } }, res, e => { forwarded = e; });
  if (forwarded) {
    // Unexpected errors should be delegated to the verified central error handler.
    // Expected 4xx may be forwarded with a generic message instead of the original exception.
    assert.ok(forwarded, 'Missing forwarded error');
    return { delegated: true, forwarded, status: null, body: null };
  }
  return { delegated: false, status: res.statusCode, body: res.body };
}
function unexpectedError(status) { return Object.assign(new Error(SECRET), { status }); }

// Explicitly approved client-facing errors must continue working as before.
test('R16-55A Family Tree: expected 400 validation message preserved', () => {
  assert.equal(familyTreeMessage(markExpectedClientError(Object.assign(new Error('Invalid date.'), {status:400}))), 'Invalid date.');
});
test('R16-55B Family Tree: unexpected 500 details hidden', () => {
  assert.equal(familyTreeMessage(unexpectedError(500)), 'Internal Server Error');
});
test('R16-55C Family Tree: unexpected 400 details must be hidden', () => {
  assert.notEqual(familyTreeMessage(unexpectedError(400)), SECRET);
});

test('R16-55D Notifications: expected 400 validation message preserved', () => {
  const r=notificationsResponse(markExpectedClientError(Object.assign(new Error('Invalid preference.'), {status:400})));
  assert.equal(r.status,400);assert.equal(r.body.message,'Invalid preference.');
});
test('R16-55E Notifications: unexpected 500 details hidden', () => {
  const r=notificationsResponse(unexpectedError(500));
  assert.equal(r.status,500);assert.equal(r.body.message,'Internal Server Error');
});
test('R16-55F Notifications: unexpected 400 details must be hidden', () => {
  const r=notificationsResponse(unexpectedError(400));
  assert.notEqual(r.body.message,SECRET);
});

test('R16-55G Subscriptions: expected 400 validation message preserved', async () => {
  const r=await subscriptionPromoResponse(markExpectedClientError(Object.assign(new Error('Invalid promo code.'), {status:400})));
  assert.equal(r.status,400);assert.equal(r.body.error,'Invalid promo code.');
});
test('R16-55H Subscriptions: unexpected 500 delegated to central handler', async () => {
  const r=await subscriptionPromoResponse(unexpectedError(500));
  assert.equal(r.delegated,true);
});
test('R16-55I Subscriptions: unexpected 400 details must be hidden or delegated', async () => {
  const r=await subscriptionPromoResponse(unexpectedError(400));
  assert.ok((r.delegated && r.forwarded.message !== SECRET) || (r.body && r.body.error !== SECRET), 'Unexpected 400 error disclosed internal details');
});
