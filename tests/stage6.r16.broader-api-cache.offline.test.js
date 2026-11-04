'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const section = source.match(/app\.use\((\[[\s\S]*?\]),\s*(\(req,\s*res,\s*next\)\s*=>\s*\{[\s\S]*?\})\);\s*app\.use\('\/notifications'/);

// The matcher is deliberately tied to the immediately following notification router.
// It will fail if the R16 wrapper is removed or radically rearranged.
test('R16 broader API cache middleware exists before routers', () => {
  assert.ok(section, 'R16 central API cache middleware not found');
  assert.ok(source.indexOf(section[0]) < source.indexOf("app.use('/notifications', notificationRoutes)"));
  assert.ok(source.indexOf(section[0]) > source.indexOf("app.use(express.static("));
});

test('R16 route coverage and isolation', () => {
  assert.ok(section, 'R16 central API cache middleware not found');
  const prefixes = vm.runInNewContext(section[1]);
  const required = ['/notifications', '/track', '/tnna', '/weights', '/activities', '/weightActivities', '/interestEarned', '/budget', '/familytree', '/etf'];
  assert.deepEqual(Array.from(prefixes), required);
  for (const excluded of ['/users', '/subscriptions', '/api/geocode', '/', '/send-email']) {
    assert.equal(prefixes.includes(excluded), false, `Unintended prefix: ${excluded}`);
  }
});

test('R16 middleware preserves result and applies no-store', async t => {
  assert.ok(section, 'R16 central API cache middleware not found');
  const middleware = vm.runInNewContext('(' + section[2] + ')');
  for (const status of [200, 401, 403, 500]) {
    await t.test(`HTTP ${status}`, () => {
      const headers = {};
      let nextCount = 0;
      const response = { statusCode: status, set(name, value) { headers[name.toLowerCase()] = value; } };
      middleware({}, response, () => { nextCount += 1; });
      assert.equal(headers['cache-control'], 'no-store');
      assert.equal(response.statusCode, status);
      assert.equal(nextCount, 1);
    });
  }
});
