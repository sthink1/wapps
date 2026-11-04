'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const serverPath = path.join(__dirname, '..', 'server.js');
const source = fs.readFileSync(serverPath, 'utf8');

const pattern =
  /app\.use\('\/subscriptions',\s*(\(req,\s*res,\s*next\)\s*=>\s*\{[\s\S]*?\}),\s*subscriptionRoutes\);/;

test('R16 subscription cache policy', async (t) => {
  const match = source.match(pattern);
  assert.ok(match, 'Subscription middleware not found');

  const middleware = vm.runInNewContext(`(${match[1]})`);

  for (const status of [200, 401, 403]) {
    await t.test(`HTTP ${status}: no-store`, () => {
      const headers = {};
      let nextCalled = false;
      const res = {
        statusCode: status,
        set(name, value) {
          headers[name.toLowerCase()] = value;
        }
      };

      middleware({}, res, () => { nextCalled = true; });
      assert.equal(headers['cache-control'], 'no-store');
      assert.equal(res.statusCode, status);
      assert.equal(nextCalled, true);
    });
  }
});
