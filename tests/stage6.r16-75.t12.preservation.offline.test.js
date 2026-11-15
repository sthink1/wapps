'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

// Offline contract guards. These protect selected source contracts; they do not
// re-execute the earlier hosted R10/R14/R15 browser/database acceptance suites.
test('T12-A: server preserves auth and subscription gates on protected app routes', () => {
  const s=read('server.js');
  for(const [route,app] of [['weights','weigh_in'],['activities','weigh_in'],['weightActivities','weigh_in'],['interestEarned','interest_earned'],['budget','budget'],['familytree','family_tree'],['etf','etf_investing']]) {
    assert.ok(s.includes(`requireAppAccess('${app}')`),`missing ${app} access guard`);
    assert.ok(s.includes(`app.use('/${route}'`),`missing /${route} route`);
  }
  assert.match(s,/app\.use\('\/familytree\/privacy', authenticateToken, requireAppAccess\('family_tree'\)/);
});

test('T12-B: user session and subscription cache guards remain before routers', () => {
  const s=read('server.js');
  for(const route of ['users','subscriptions','admin-management']){
    const p=s.indexOf(`app.use('/${route}', (req, res, next) => {`);
    assert.ok(p>=0, `missing ${route} guard`);
    assert.ok(s.slice(p,p+210).includes("res.set('Cache-Control', 'no-store')"));
  }
});

test('T12-C: client retains fail-closed session recovery and one-flight cross-tab locking', () => {
  const s=read('httpdocs/js/waPlatform.js');
  assert.match(s,/const LOCK_NAME = 'wa-web-refresh'/);
  assert.match(s,/navigator\.locks\.request/);
  assert.match(s,/CROSS_TAB_LOCK_UNAVAILABLE/);
  assert.match(s,/SESSION_CHANGED_DURING_REFRESH/);
  assert.match(s,/explicit_logout/);
});

test('T12-D: client retains same-origin credential and unsafe-mutation replay fences', () => {
  const s=read('httpdocs/js/waPlatform.js');
  assert.match(s,/SAME_ORIGIN_PATH_REQUIRED/);
  assert.match(s,/headers\.delete\('Authorization'\)/);
  assert.match(s,/credentials: 'same-origin'/);
  assert.match(s,/method !== 'GET' && method !== 'HEAD'/);
  assert.match(s,/options\.body !== undefined/);
});

test('T12-E: central classifier preserves marked client errors but never unmarked exception text', () => {
  const s=read('server.js');
  assert.match(s,/isExpectedClientError\(err\)/);
  assert.match(s,/statusCode < 500 && isExpectedClientError\(err\)/);
  assert.match(s,/\? 'Internal Server Error'/);
  assert.match(s,/: 'Request failed'\)/);
});

test('T12-F: client handles flat and nested errors without changing session API exports', () => {
  const s=read('httpdocs/js/waPlatform.js');
  assert.match(s,/typeof error\.message === 'string'/);
  assert.match(s,/typeof error === 'string'/);
  assert.match(s,/session: \{ restore, isAuthenticated, logout, setAccessToken, getAccessToken: getToken \}/);
  assert.match(s,/api: \{ request, json \}/);
});
