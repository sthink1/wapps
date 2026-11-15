'use strict';

// R16-75-T09: isolated API error-reading compatibility checks.
// No application startup, database, network, or mutation of authoritative files.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'httpdocs', 'js', 'waPlatform.js'), 'utf8');
const token = `h.${Buffer.from(JSON.stringify({ exp: 4102444800 })).toString('base64url')}.sig`;

function startBrowser(reply) {
  const store = new Map([['token', token]]);
  const requests = [];
  const window = {
    location: { origin: 'https://example.test' },
    localStorage: {
      getItem: key => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key)
    },
    navigator: { locks: { request: (_name, _opts, callback) => callback() } },
    atob: str => Buffer.from(str, 'base64').toString('binary'),
    fetch: async (url, opts) => {
      requests.push({ url, opts });
      return reply();
    }
  };
  vm.runInNewContext(source, { window, Headers, URL, Date, Error, TypeError, Promise });
  return { WA: window.WA, requests };
}

async function result({ body, status = 400, contentType = 'application/json', raw = false }) {
  const response = raw
    ? new Response(body, { status, headers: { 'Content-Type': contentType } })
    : Response.json(body, { status });
  const browser = startBrowser(() => response);
  try {
    await browser.WA.api.json('/budget/example');
    return { thrown: false, requests: browser.requests };
  } catch (error) {
    return {
      thrown: true,
      name: error.name,
      status: error.status,
      message: error.message,
      messageType: typeof error.message,
      code: error.code,
      requests: browser.requests
    };
  }
}

function assertShared(r, status = 400) {
  assert.equal(r.thrown, true);
  assert.equal(r.name, 'WAApiError');
  assert.equal(r.status, status);
  assert.equal(r.requests.length, 1);
  assert.equal(r.requests[0].url, '/budget/example');
  assert.equal(r.messageType, 'string');
}

test('T09-A: flat error string and code remain readable', async () => {
  const r = await result({ body: { error: 'Flat validation message', code: 'INVALID_INPUT' } });
  assertShared(r);
  assert.equal(r.message, 'Flat validation message');
  assert.equal(r.code, 'INVALID_INPUT');
});

test('T09-B: legacy message field remains readable', async () => {
  const r = await result({ body: { message: 'Message field text' }, status: 403 });
  assertShared(r, 403);
  assert.equal(r.message, 'Message field text');
});

test('T09-C: nested central-handler error.message remains readable', async () => {
  const r = await result({ body: { error: { message: 'Request failed' } }, status: 400 });
  assertShared(r);
  assert.equal(r.message, 'Request failed');
  assert.equal(r.code, null);
});

test('T09-D: nested central-handler error with code remains a string message', async () => {
  const r = await result({ body: { error: { message: 'Access denied', code: 'ACCESS_DENIED' } }, status: 403 });
  assertShared(r, 403);
  assert.equal(r.message, 'Access denied');
  assert.equal(r.code, 'ACCESS_DENIED');
});

test('T09-E: empty JSON object uses HTTP-status fallback', async () => {
  const r = await result({ body: {}, status: 404 });
  assertShared(r, 404);
  assert.equal(r.message, 'HTTP 404');
});

test('T09-F: JSON null uses HTTP-status fallback', async () => {
  const r = await result({ body: null, status: 500 });
  assertShared(r, 500);
  assert.equal(r.message, 'HTTP 500');
});

test('T09-G: non-JSON text uses HTTP-status fallback', async () => {
  const r = await result({ body: 'Not JSON', contentType: 'text/plain', raw: true, status: 503 });
  assertShared(r, 503);
  assert.equal(r.message, 'HTTP 503');
});

test('T09-H: empty response body uses HTTP-status fallback', async () => {
  const r = await result({ body: '', contentType: 'text/plain', raw: true, status: 400 });
  assertShared(r);
  assert.equal(r.message, 'HTTP 400');
});

test('T09-I: flat error-only code legacy behavior retained', async () => {
  const r = await result({ body: { error: 'FORBIDDEN' }, status: 403 });
  assertShared(r, 403);
  assert.equal(r.message, 'FORBIDDEN');
  assert.equal(r.code, 'FORBIDDEN');
});

test('T09-J: error response read without an additional fetch', async () => {
  const r = await result({ body: { error: 'Bad request' }, status: 400 });
  assertShared(r);
  assert.equal(r.message, 'Bad request');
});
