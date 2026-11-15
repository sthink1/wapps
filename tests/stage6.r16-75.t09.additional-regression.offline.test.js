'use strict';

// R16-75-T09: additional error-shape and session-preservation regressions.
// Pure VM-based browser simulation; no server, database, or network required.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'httpdocs', 'js', 'waPlatform.js'), 'utf8');
const token = `h.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.sig`;

function client(fetchReply, initialToken = token) {
  const stored = new Map(initialToken ? [['token', initialToken]] : []);
  const requests = [];
  const window = {
    location: { origin: 'https://example.test' },
    localStorage: {
      getItem: name => stored.get(name) || null,
      setItem: (name, value) => stored.set(name, String(value)),
      removeItem: name => stored.delete(name)
    },
    navigator: {
      locks: { request: (_name, _options, callback) => callback() }
    },
    atob: value => Buffer.from(value, 'base64').toString('binary'),
    fetch: async (url, options) => {
      requests.push({ url, options });
      return fetchReply(url, options);
    }
  };
  vm.runInNewContext(source, { window, Headers, URL, Date, Error, TypeError, Promise });
  return { WA: window.WA, requests, stored };
}

async function failure(body, status = 400) {
  const browser = client(() => Response.json(body, { status }));
  let caught;
  try { await browser.WA.api.json('/example'); } catch (error) { caught = error; }
  assert.ok(caught, 'Expected an API error');
  assert.equal(caught.name, 'WAApiError');
  assert.equal(caught.status, status);
  assert.equal(browser.requests.length, 1);
  return caught;
}

test('T09-K: a nested error lacking a message uses HTTP status, not object coercion', async () => {
  const error = await failure({ error: { detail: 'private' } }, 422);
  assert.equal(error.message, 'HTTP 422');
  assert.equal(error.code, null);
});

test('T09-L: top-level message and code retain precedence over nested metadata', async () => {
  const error = await failure({
    message: 'Existing public message',
    code: 'TOP_LEVEL',
    error: { message: 'Nested alternative', code: 'NESTED' }
  }, 409);
  assert.equal(error.message, 'Existing public message');
  assert.equal(error.code, 'TOP_LEVEL');
});

test('T09-M: nested code without a message is preserved separately from fallback', async () => {
  const error = await failure({ error: { code: 'INVALID_INPUT' } }, 400);
  assert.equal(error.message, 'HTTP 400');
  assert.equal(error.code, 'INVALID_INPUT');
});

test('T09-N: 401 GET may refresh and retry once; nested errors are decoded afterwards', async () => {
  const fresh = `h.${Buffer.from(JSON.stringify({ exp: 4102444801 })).toString('base64url')}.sig`;
  let protectedCalls = 0;
  const browser = client(url => {
    if (url === '/users/refresh-session') return Response.json({ token: fresh });
    protectedCalls += 1;
    return Response.json({ error: { message: 'Session rejected', code: 'SESSION_REJECTED' } }, { status: 401 });
  });
  await assert.rejects(browser.WA.api.json('/secured'), error => {
    assert.equal(error.message, 'Session rejected');
    assert.equal(error.code, 'SESSION_REJECTED');
    assert.equal(error.status, 401);
    return true;
  });
  assert.equal(protectedCalls, 2);
  assert.deepEqual(browser.requests.map(request => request.url), [
    '/secured', '/users/refresh-session', '/secured'
  ]);
  assert.equal(browser.stored.get('token'), fresh);
});

test('T09-O: 401 POST must not be replayed or refresh the session', async () => {
  const browser = client(() => Response.json({ error: { message: 'Authentication required' } }, { status: 401 }));
  await assert.rejects(browser.WA.api.json('/write', { method: 'POST', body: '{}' }), error => {
    assert.equal(error.status, 401);
    assert.equal(error.message, 'Authentication required');
    return true;
  });
  assert.deepEqual(browser.requests.map(request => request.url), ['/write']);
});

test('T09-P: nested 403 must not trigger refresh or replay', async () => {
  const browser = client(() => Response.json({ error: { message: 'Forbidden' } }, { status: 403 }));
  await assert.rejects(browser.WA.api.json('/admin'), error => {
    assert.equal(error.status, 403);
    assert.equal(error.message, 'Forbidden');
    return true;
  });
  assert.deepEqual(browser.requests.map(request => request.url), ['/admin']);
});

test('T09-Q: same-origin restriction remains enforced', async () => {
  const browser = client(() => Response.json({ ok: true }));
  await assert.rejects(browser.WA.api.json('https://elsewhere.test/private'));
  assert.equal(browser.requests.length, 0);
});
