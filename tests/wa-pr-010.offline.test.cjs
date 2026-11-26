'use strict';

// Execute the exact installed server and worker source with isolated in-memory
// substitutes. No network, database, server listener, email, or project writes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'httpdocs', 'sw.js'), 'utf8');
const origin = 'https://wapps-stage6-test.onrender.com';
const cacheName = 'wonderful-apps-cache-v12';
const noop = () => {};
const forbidden = () => { throw new Error('Forbidden external action'); };

function serverHarness(mode = 'staging', publicOrigin = origin) {
  const uses = [];
  const gets = new Map();
  let staticOptions;
  const app = {
    use(...args) { uses.push(args); },
    get(route, handler) { gets.set(route, handler); },
    post: noop,
    listen: forbidden,
  };
  const express = Object.assign(() => app, {
    json: () => noop,
    urlencoded: () => noop,
    static: (_, options) => { staticOptions = options; return noop; },
  });
  const dependencies = {
    dotenv: { config: noop },
    './services/stage6Environment': {
      current: { mode, publicOrigin, allowedOrigins: [publicOrigin] },
      LEGACY_CORS_ORIGINS: [],
      verifyDatabaseIdentity: forbidden,
    },
    express,
    cors: () => noop,
    path,
    fs: { existsSync: () => true, mkdirSync: forbidden },
    multer: () => ({ none: () => noop }),
    './send_email': { sendEmail: forbidden },
    './morgan': noop,
    './logger': { info: noop, error: noop },
    './dbConnection': { ready: new Promise(() => {}), pool: {} },
    './services/passwordResetRateCleanup': { start: forbidden },
    './services/stage6ExpectedClientError': { isExpectedClientError: () => false },
    './middleware/subscriptionAccess': { authenticateToken: noop, requireAppAccess: () => noop },
    './middleware/usageActivity': () => noop,
    './routes/ftPrivacy': { publicRouter: noop, privateRouter: noop, protection: noop },
  };
  vm.runInNewContext(serverSource, {
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name.startsWith('./routes/')) return noop;
      throw new Error(`Unexpected dependency ${name}`);
    },
    __dirname: root,
    process: { env: {} },
    console: { log: noop, error: noop },
    URL,
  }, { filename: 'server.js', timeout: 3000 });
  return { uses, gets, staticOptions };
}

function response() {
  return {
    headers: {}, statusCode: 200,
    set(name, value) { this.headers[name.toLowerCase()] = value; return this; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
    sendFile(value) { this.file = value; },
  };
}

function securityHeaders(mode, publicOrigin, host) {
  const { uses } = serverHarness(mode, publicOrigin);
  const res = response();
  let next = 0;
  uses[0][0]({ get: name => name === 'Host' ? host : 'https' }, res, () => next++);
  assert.equal(next, 1);
  return res.headers;
}

for (const asset of ['home.html', 'login.html', 'js/waPlatform.js', 'js/example.mjs', 'style.css', 'manifest.json', 'sw.js']) {
  test(`HTTP revalidation: ${asset}`, () => {
    const res = response();
    serverHarness().staticOptions.setHeaders(res, path.join(root, 'httpdocs', asset));
    assert.equal(res.headers['cache-control'], 'no-cache');
    if (asset === 'manifest.json') assert.equal(res.headers['content-type'], 'application/manifest+json');
    if (asset === 'sw.js') assert.equal(res.headers['content-type'], 'application/javascript');
  });
}

test('Ordinary images retain one-day static cache default', () => {
  const { staticOptions } = serverHarness();
  const res = response();
  staticOptions.setHeaders(res, '/fake/httpdocs/icons/example.png');
  assert.equal(staticOptions.maxAge, '1d');
  assert.equal(res.headers['cache-control'], undefined);
});

test('Root fallback explicitly revalidates HTML', () => {
  const res = response();
  serverHarness().gets.get('/')({}, res);
  assert.equal(res.headers['cache-control'], 'no-cache');
  assert.equal(res.file, path.join(root, 'httpdocs', 'home.html'));
});

test('Security headers before all existing middleware, canonical HTTPS HSTS', () => {
  const headers = securityHeaders('staging', origin, new URL(origin).host);
  assert.deepEqual(headers, {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'SAMEORIGIN',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'strict-transport-security': 'max-age=31536000',
  });
});

test('HSTS only approved hosted canonical origin, not local or alternate Host', () => {
  assert.equal(securityHeaders('local', 'http://localhost:8080', 'localhost:8080')['strict-transport-security'], undefined);
  assert.equal(securityHeaders('staging', origin, 'other.example')['strict-transport-security'], undefined);
  assert.equal(securityHeaders('production', 'https://example.invalid', 'example.invalid')['strict-transport-security'], 'max-age=31536000');
  assert.equal(securityHeaders('staging', 'http://example.invalid', 'example.invalid')['strict-transport-security'], undefined);
});

test('All existing protected prefix cache guards remain before routers', () => {
  const { uses } = serverHarness();
  const expected = ['/users', '/subscriptions', '/admin-management', '/notifications', '/track', '/tnna', '/weights', '/activities', '/weightActivities', '/interestEarned', '/budget', '/familytree', '/etf'];
  for (const prefix of expected) {
    const entry = uses.find(args => args[0] === prefix || (Array.isArray(args[0]) && args[0].includes(prefix)));
    assert.ok(entry, prefix);
    const res = response();
    let next = 0;
    entry[1]({}, res, () => next++);
    assert.equal(res.headers['cache-control'], 'no-store', prefix);
    assert.equal(next, 1, prefix);
  }
});

test('Early parser errors retain no-store and generic error text', () => {
  const { uses } = serverHarness();
  const handler = uses.find(args => args.length === 1 && args[0].length === 4)[0];
  for (const prefix of ['/users', '/tnna', '/familytree', '/etf', '/admin-management']) {
    const res = response();
    handler(Object.assign(new Error('synthetic secret'), { status: 400 }), { path: prefix + '/test' }, res, forbidden);
    assert.equal(res.headers['cache-control'], 'no-store');
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error.message, 'Request failed');
  }
});

function workerHarness() {
  const handlers = new Map();
  const stores = new Map();
  const fetches = [];
  const deletes = [];
  const state = { offline: false, status: 200, installFail: false, putFail: false, skipped: 0, claimed: 0, precache: [] };
  const makeResponse = (body, status = 200) => ({ body, status, ok: status >= 200 && status < 300, clone() { return makeResponse(body, status); } });
  const getStore = name => {
    if (!stores.has(name)) stores.set(name, new Map());
    return stores.get(name);
  };
  const caches = {
    async open(name) {
      const entries = getStore(name);
      return {
        async addAll(requests) {
          state.precache = Array.from(requests);
          if (state.installFail) throw new Error('synthetic missing resource');
          for (const request of requests) entries.set(new URL(request.url).pathname, makeResponse('precache'));
        },
        async match(key) { return entries.get(key); },
        async put(key, value) {
          if (state.putFail) throw new Error('synthetic quota failure');
          entries.set(key, value);
        },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { deletes.push(name); return stores.delete(name); },
    match: forbidden, // Cross-generation reads must not occur.
  };
  class FakeRequest {
    constructor(url, options = {}) { this.url = new URL(url, origin).href; Object.assign(this, options); }
  }
  vm.runInNewContext(workerSource, {
    URL, Request: FakeRequest, Response: { error: () => makeResponse('network-error', 0) }, caches,
    fetch: async (request, options) => {
      fetches.push({ request, options });
      if (state.offline) throw new Error('synthetic offline');
      return makeResponse('current-network', state.status);
    },
    self: {
      location: { origin },
      addEventListener(name, handler) { handlers.set(name, handler); },
      skipWaiting() { state.skipped++; },
      clients: { claim() { state.claimed++; } },
    },
  }, { filename: 'sw.js', timeout: 3000 });
  const lifecycle = name => {
    let promise;
    handlers.get(name)({ waitUntil(value) { promise = value; } });
    assert.ok(promise);
    return promise;
  };
  const dispatch = (url, { method = 'GET', auth = false, mode = 'cors' } = {}) => {
    let result;
    handlers.get('fetch')({ request: {
      url: new URL(url, origin).href, method, mode,
      headers: { has: name => auth && name === 'Authorization' },
    }, respondWith(value) { result = value; } });
    return result;
  };
  const seed = (name, key, body) => getStore(name).set(key, makeResponse(body));
  return { state, stores, fetches, deletes, lifecycle, dispatch, seed };
}

const expectedPrecache = [ '/', '/index.html', '/home.html', '/login.html', '/register.html', '/Activities.html', '/Weights.html', '/InterestEarned.html', '/TownNotice.html', '/ContactUs.html', '/amortization.html', '/propertyInfo.html', '/track.html', '/etf.html', '/etfActivity.html', '/etfCategory.html', '/etfCompare.html', '/etfSymbol.html', '/budget.html', '/BmonthBudget.html', '/BmonthDetailReport.html', '/BinForm.html', '/BoutForm.html', '/BsubscriptionForm.html', '/BloanForm.html', '/BleaseRentForm.html', '/BestimateAllowanceForm.html', '/BcardForm.html', '/Breports.html', '/BinReport.html', '/BoutReport.html', '/BsubscriptionReport.html', '/BloanReport.html', '/BleaseRentReport.html', '/BcardReport.html', '/BestimateAllowanceReport.html', '/manifest.json', '/js/waPlatform.js', '/favicon.ico', '/icons/android-chrome-192x192.png', '/icons/android-chrome-512x512.png' ];

test('Install reloads all exact 41 precache paths before skipWaiting', async () => {
  const w = workerHarness();
  await w.lifecycle('install');
  assert.deepEqual(w.state.precache.map(r => new URL(r.url).pathname), expectedPrecache);
  assert.ok(w.state.precache.every(r => r.cache === 'reload'));
  assert.equal(w.stores.get(cacheName).size, 41);
  assert.equal(w.state.skipped, 1);
});

test('Install failure prevents skipWaiting and preserves older cache', async () => {
  const w = workerHarness();
  w.seed('wonderful-apps-cache-v11', '/home.html', 'old');
  w.state.installFail = true;
  await assert.rejects(w.lifecycle('install'));
  assert.equal(w.state.skipped, 0);
  assert.ok(w.stores.has('wonderful-apps-cache-v11'));
});

test('Activation removes only numeric obsolete WA generations, then claims', async () => {
  const w = workerHarness();
  for (const name of ['wonderful-apps-cache-v9', 'wonderful-apps-cache-v11', cacheName, 'unrelated', 'wonderful-apps-cache-vcustom']) w.seed(name, '/home.html', name);
  await w.lifecycle('activate');
  assert.deepEqual(w.deletes.sort(), ['wonderful-apps-cache-v11', 'wonderful-apps-cache-v9']);
  assert.ok(w.stores.has(cacheName));
  assert.ok(w.stores.has('unrelated'));
  assert.ok(w.stores.has('wonderful-apps-cache-vcustom'));
  assert.equal(w.state.claimed, 1);
});

for (const asset of ['/home.html', '/login.html', '/js/waPlatform.js', '/manifest.json', '/']) {
  test(`Network-first revalidation and offline fallback: ${asset}`, async () => {
    const w = workerHarness();
    w.seed(cacheName, asset, 'old-cache');
    w.seed('unrelated', asset, 'unrelated');
    assert.equal((await w.dispatch(asset, { mode: 'navigate' })).body, 'current-network');
    assert.equal(w.fetches[0].options.cache, 'no-cache');
    assert.equal(w.stores.get(cacheName).get(asset).body, 'current-network');
    w.state.offline = true;
    assert.equal((await w.dispatch(asset, { mode: 'navigate' })).body, 'current-network');
  });
}

test('Offline HTML fallback is active WA home only', async () => {
  const w = workerHarness();
  w.seed(cacheName, '/home.html', 'current-home');
  w.seed('unrelated', '/login.html', 'unrelated-login');
  w.state.offline = true;
  assert.equal((await w.dispatch('/login.html')).body, 'current-home');
  assert.equal((await w.dispatch('/manifest.json')).status, 0);
});

test('HTTP failures are not hidden by cached success or cached as new', async () => {
  const w = workerHarness();
  w.seed(cacheName, '/home.html', 'old');
  w.state.status = 503;
  assert.equal((await w.dispatch('/home.html')).status, 503);
  assert.equal(w.stores.get(cacheName).get('/home.html').body, 'old');
});

test('Cache write failure does not hide network response', async () => {
  const w = workerHarness();
  w.state.putFail = true;
  assert.equal((await w.dispatch('/home.html')).body, 'current-network');
});

test('Icons cache-first in active WA cache, never unrelated cache', async () => {
  const w = workerHarness();
  w.seed(cacheName, '/favicon.ico', 'active-icon');
  w.seed('unrelated', '/icons/android-chrome-192x192.png', 'unrelated-icon');
  assert.equal((await w.dispatch('/favicon.ico')).body, 'active-icon');
  assert.equal(w.fetches.length, 0);
  assert.equal((await w.dispatch('/icons/android-chrome-192x192.png')).body, 'current-network');
  assert.equal(w.fetches.length, 1);
});

test('API, non-GET, authorized and cross-origin requests bypass worker entirely', () => {
  const w = workerHarness();
  for (const url of ['/users/session-status', '/weights', '/familytree/persons', '/tnna/refresh', '/api/geocode/reverse', '/unknown.js', '/']) assert.equal(w.dispatch(url), undefined, url);
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']) assert.equal(w.dispatch('/home.html', { method }), undefined, method);
  assert.equal(w.dispatch('/home.html', { auth: true }), undefined);
  assert.equal(w.dispatch('https://foreign.example/home.html'), undefined);
  assert.equal(w.fetches.length, 0);
  assert.equal(w.stores.size, 0);
});

test('Failed icon network request is not automatically retried', async () => {
  const w = workerHarness();
  w.state.offline = true;
  await assert.rejects(w.dispatch('/favicon.ico'));
  assert.equal(w.fetches.length, 1);
});
