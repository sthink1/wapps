'use strict';

// R16-28 isolated regression test for the real server.js startup handler.
// Uses a VM with inert dependencies; never opens sockets, databases or email.
// Does not read secrets from .env or modify WA project files.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../server.js'), 'utf8');
const marker = 'R16_FAKE_SECRET_7a21_not_real';
const expected = 'Stage 6 startup refused (details omitted)';

async function runScenario(which) {
  const output = [];
  const events = { listened: 0, cleanup: 0, verified: 0, jobsStarted: 0 };
  const noop = () => {};
  const app = {
    use: noop,
    get: noop,
    post: noop,
    listen(_port, callback) {
      events.listened++;
      if (which !== 'success') throw Error('FORBIDDEN_LISTEN');
      callback();
    }
  };
  const express = Object.assign(() => app, {
    json: () => noop,
    urlencoded: () => noop,
    static: () => noop
  });
  const deps = {
    dotenv: { config: noop },
    './services/stage6Environment': {
      current: { mode: 'staging', allowedOrigins: ['https://wapps-stage6-test.onrender.com'] },
      LEGACY_CORS_ORIGINS: [],
      async verifyDatabaseIdentity() {
        events.verified++;
        if (which === 'identity') throw new Error(marker);
      }
    },
    express,
    cors: () => noop,
    path,
    fs: { existsSync: () => true, mkdirSync() { throw Error('FORBIDDEN_MKDIR'); } },
    multer: () => ({ none: () => noop }),
    './send_email': { sendEmail: () => { throw Error('FORBIDDEN_EMAIL'); } },
    './morgan': noop,
    './logger': { info: noop, error: noop },
    './middleware/subscriptionAccess': { authenticateToken: noop, requireAppAccess: () => noop },
    './middleware/usageActivity': () => noop,
    './services/passwordResetRateCleanup': {
      start() { events.jobsStarted++; }
    },
    './dbConnection': {
      pool: {
        end() {
          events.cleanup++;
          return which === 'cleanup' ? Promise.reject(new Error(marker)) : Promise.resolve();
        }
      },
      ready: which === 'connection' || which === 'cleanup'
        ? Promise.reject(new Error(marker))
        : Promise.resolve()
    },
    './routes/ftPrivacy': { publicRouter: noop, privateRouter: noop, protection: noop }
  };
  for (const name of [
    'weights', 'activities', 'weightActivities', 'users', 'track',
    'interestEarned', 'etf', 'budget', 'familyTree', 'subscriptions',
    'notifications', 'tnna', 'adminManagement', 'geocode'
  ]) deps['./routes/' + name] = noop;

  const mockProcess = { env: { PORT: '8080' }, exitCode: undefined };
  const sandbox = {
    __dirname: path.resolve(__dirname, '..'),
    require(name) {
      assert.ok(Object.prototype.hasOwnProperty.call(deps, name), 'Unexpected import: ' + name);
      return deps[name];
    },
    process: mockProcess,
    console: {
      error(...args) { output.push(args.map(String).join(' ')); },
      log(...args) { output.push(args.map(String).join(' ')); }
    },
    module: { exports: {} },
    exports: {}
  };
  vm.runInNewContext(source, sandbox, { filename: 'server.js', timeout: 3000 });
  // Allow native Promise jobs from start().catch() and pool.end().finally() to settle.
  for (let i = 0; i < 4; i++) await new Promise(resolve => setImmediate(resolve));
  return { output, events, exitCode: mockProcess.exitCode };
}

for (const scenario of ['connection', 'identity', 'cleanup']) {
  test(`R16 startup ${scenario}: no sensitive detail; listener blocked; failure exit retained`, async () => {
    const r = await runScenario(scenario);
    assert.deepEqual(r.output, [expected]);
    assert.equal(r.output.join(' ').includes(marker), false);
    assert.equal(r.events.listened, 0);
    assert.equal(r.events.jobsStarted, 0);
    assert.equal(r.events.cleanup, 1);
    assert.equal(r.exitCode, 1);
    assert.equal(r.events.verified, scenario === 'identity' ? 1 : 0);
  });
}

test('R16 successful startup: existing verified startup behavior remains', async () => {
  const r = await runScenario('success');
  assert.equal(r.events.verified, 1);
  assert.equal(r.events.listened, 1);
  assert.equal(r.events.jobsStarted, 1);
  assert.equal(r.events.cleanup, 0);
  assert.equal(r.exitCode, undefined);
  assert.deepEqual(r.output, ['Stage 6 environment: staging; test DB verified']);
});
