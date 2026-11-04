'use strict';
// Isolated tests: no WA server, real DB, provider, or credentials.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const service = fs.readFileSync(path.join(root, 'services', 'notificationService.js'), 'utf8');
const family = fs.readFileSync(path.join(root, 'routes', 'familyTree.js'), 'utf8');
const FAKE_SECRET = 'R16_SYNTHETIC_SECRET_DO_NOT_USE';

function extract(src, start, end) {
  const i = src.indexOf(start);
  const j = src.indexOf(end, i + start.length);
  assert.ok(i >= 0 && j > i, `Cannot isolate ${start}`);
  return src.slice(i, j);
}

function load(source, fn, start, end, sandbox) {
  const context = vm.createContext(sandbox);
  vm.runInContext(extract(source, start, end) + `\nthis.subject = ${fn};`, context, { timeout: 1000 });
  return context.subject;
}

function serviceFixture(errorOrNull) {
  const updates = [];
  let released = false;
  const c = {
    async query(sql, params) { updates.push({ sql, params }); return []; },
    release() { released = true; }
  };
  const sendNotification = load(service, 'sendNotification', 'async function sendNotification({', 'async function getPreferences(', {
    pool: { async getConnection() { return c; } },
    VALID_CATEGORIES: new Set(['ACCOUNT']),
    VALID_CHANNELS: new Set(['EMAIL']),
    OPTIONAL_CATEGORIES: new Set(),
    async getUserByID() { return null; },
    async getUserByEmail() { return null; },
    normalizeEmail: s => String(s || '').trim().toLowerCase(),
    normalizePhone: s => String(s || ''),
    async insertHistory() { return 42; },
    async sendNotificationEmail() { if (errorOrNull) throw errorOrNull; },
    publicBaseUrl: () => 'https://example.invalid',
    crypto: require('node:crypto')
  });
  return { sendNotification, updates, wasReleased: () => released };
}

function familyFixture(errorOrNull) {
  const updates = [];
  const sendPending = load(family, 'sendPendingFamilyTreeNotifications',
    'async function sendPendingFamilyTreeNotifications(', 'function personSelectSql(', {
      pool: { async query(sql, params) { updates.push({ sql, params }); return []; } },
      async sendNotification() {
        if (errorOrNull) throw errorOrNull;
        return { status: 'SENT' };
      }
    });
  return { sendPending, updates };
}

const pending = [{ NotificationID: 77, recipientUserID: null, email: 'sample@example.invalid',
  notificationType: 'EDIT', subject: 'Test', message: 'Synthetic', relatedRecordID: 1 }];

test('NotificationHistory failed delivery stores fixed reason and rethrows original error', async () => {
  const error = Error(`external service key=${FAKE_SECRET}`);
  const f = serviceFixture(error);
  await assert.rejects(f.sendNotification({ recipientEmail: 'sample@example.invalid',
    category: 'ACCOUNT', channel: 'EMAIL', message: 'Synthetic' }), e => e === error);
  assert.equal(f.updates.length, 1);
  assert.match(f.updates[0].sql, /Status='FAILED', FailureReason=\?/);
  assert.deepEqual(Array.from(f.updates[0].params), ['Notification delivery failed (details omitted).', 42]);
  assert.ok(!JSON.stringify(f.updates).includes(FAKE_SECRET));
  assert.equal(f.wasReleased(), true);
});

test('NotificationHistory success keeps SENT and null reason', async () => {
  const f = serviceFixture(null);
  const result = await f.sendNotification({ recipientEmail: 'sample@example.invalid',
    category: 'ACCOUNT', channel: 'EMAIL', message: 'Synthetic' });
  assert.equal(result.status, 'SENT');
  assert.equal(f.updates.length, 1);
  assert.match(f.updates[0].sql, /Status='SENT'.*FailureReason=NULL/s);
  assert.deepEqual(Array.from(f.updates[0].params), [42]);
  assert.equal(f.wasReleased(), true);
});

test('FTNotification failed delivery stores fixed reason and preserves nonblocking behavior', async () => {
  const f = familyFixture(Error(`provider token=${FAKE_SECRET}`));
  await f.sendPending(pending);
  assert.equal(f.updates.length, 1);
  assert.match(f.updates[0].sql, /Status='Failed', FailureReason=\?/);
  assert.deepEqual(Array.from(f.updates[0].params), ['Family Tree notification delivery failed (details omitted).', 77]);
  assert.ok(!JSON.stringify(f.updates).includes(FAKE_SECRET));
});

test('FTNotification success keeps Sent and clears reason', async () => {
  const f = familyFixture(null);
  await f.sendPending(pending);
  assert.equal(f.updates.length, 1);
  assert.match(f.updates[0].sql, /SentAt=CASE/);
  assert.deepEqual(Array.from(f.updates[0].params), ['Sent', 'Sent', null, 77]);
});

test('FTNotification DB update failure remains nonblocking', async () => {
  const sendPending = load(family, 'sendPendingFamilyTreeNotifications',
    'async function sendPendingFamilyTreeNotifications(', 'function personSelectSql(', {
      pool: { async query() { throw Error(`db token=${FAKE_SECRET}`); } },
      async sendNotification() { throw Error('Delivery failure'); }
    });
  await assert.doesNotReject(sendPending(pending));
});

test('scope: no other FailureReason writes use raw exception descriptions in these two files', () => {
  for (const source of [service, family]) {
    assert.doesNotMatch(source, /String\(error\.message\s*\|\|\s*error\)\.slice\(0,\s*500\)/);
  }
  assert.match(service, /failureReason: 'No email address was available\.'/);
  assert.match(family, /'Recipient stopped Family Tree notifications\.'/);
});
