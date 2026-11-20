'use strict';
// Stage 2D: isolated transaction / validation / concurrency regression tests.
// Uses only Node built-ins; never starts the server or connects to a database.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'services', 'subscriptionService.js'), 'utf8');
const routeSource = fs.readFileSync(path.join(__dirname, '..', 'routes', 'subscriptions.js'), 'utf8');

function base(overrides = {}) {
    return {
        UserSubscriptionID: 21, UserID: 64, PlanID: 3, PlanName: 'Platinum',
        PlanLevel: 3, AccessType: 'DEVELOPMENT_TRIAL', StartDate: '2026-11-02',
        EndDate: '2026-12-02', Active: 1, PromoCodeID: null, ...overrides
    };
}
function expected(b) {
    if (!b) return null;
    return {
        userSubscriptionId: b.UserSubscriptionID, planId: b.PlanID,
        accessType: b.AccessType, endDate: b.EndDate,
        active: Boolean(b.Active), promoCodeId: b.PromoCodeID
    };
}
function payload(b = base(), overrides = {}) {
    return {
        planId: 1, accessType: 'ADMIN_GRANT', endDate: '2200-01-01',
        active: true, expected: expected(b), ...overrides
    };
}
function harness({ current = base(), userExists = true, planExists = true, writeRows = 1 } = {}) {
    const events = [];
    let committed = false;
    let rolledBack = false;
    const connection = {
        async beginTransaction() { events.push('BEGIN'); },
        async commit() { events.push('COMMIT'); committed = true; },
        async rollback() { events.push('ROLLBACK'); rolledBack = true; },
        release() { events.push('RELEASE'); },
        async query(sql, params) {
            events.push({ sql, params });
            if (sql.includes('FROM UsersT')) return [[...(userExists ? [{ UserID: 64, UserName: 'charter' }] : [])]];
            if (sql.includes('FROM SubscriptionPlanT')) return [[...(planExists ? [{ PlanID: 1, PlanName: 'Standard', PlanLevel: 1 }] : [])]];
            if (sql.includes('FROM UserSubscriptionT us')) return [[...(current ? [current] : [])]];
            if (sql.includes('UPDATE UserSubscriptionT') || sql.includes('INSERT INTO UserSubscriptionT')) {
                return [{ affectedRows: writeRows, insertId: 900 }];
            }
            throw new Error(`Unexpected SQL: ${sql}`);
        }
    };
    const pool = {
        async getConnection() { events.push('CONNECT'); return connection; },
        async query(sql, params) { return connection.query(sql, params); }
    };
    const module = { exports: {} };
    vm.runInNewContext(source, {
        module,
        exports: module.exports,
        require(name) {
            if (name === '../dbConnection') return { pool };
            if (name === './stage6ExpectedClientError') return { markExpectedClientError: err => { err.expected = true; return err; } };
            throw new Error(`Unexpected import: ${name}`);
        },
        Date, Error, Number, Boolean, String, parseInt
    }, { filename: 'services/subscriptionService.js' });
    return { api: module.exports, events, get committed() { return committed; }, get rolledBack() { return rolledBack; } };
}
function writes(h) {
    return h.events.filter(x => x.sql && /(?:UPDATE|INSERT INTO) UserSubscriptionT/.test(x.sql));
}
async function safeReject(h, input, status) {
    await assert.rejects(h.api.updateAdminBaseSubscription(64, input), err => {
        assert.equal(err.status, status);
        assert.equal(err.expected, true);
        return true;
    });
    assert.equal(writes(h).length, 0);
    assert.equal(h.committed, false);
}

test('2D-01: existing trial can be changed to Standard ADMIN_GRANT with one locked update', async () => {
    const b = base();
    const h = harness({ current: b });
    const result = await h.api.updateAdminBaseSubscription(64, payload(b));
    assert.equal(result.userId, 64);
    assert.equal(writes(h).length, 1);
    assert.match(writes(h)[0].sql, /PromoCodeID = NULL/);
    assert.deepEqual(Array.from(writes(h)[0].params), [1, 'ADMIN_GRANT', '2200-01-01', 1, 21, 64]);
    assert.equal(h.committed, true);
    assert.equal(h.rolledBack, false);
    assert.equal(h.events.at(-1), 'RELEASE');
    assert.equal(h.events.filter(x => x.sql && x.sql.includes('FOR UPDATE')).length, 2);
});

test('2D-02: no subscription creates exactly one direct row', async () => {
    const h = harness({ current: null });
    await h.api.updateAdminBaseSubscription(64, payload(null));
    assert.equal(writes(h).length, 1);
    assert.match(writes(h)[0].sql, /INSERT INTO UserSubscriptionT/);
    assert.equal(h.committed, true);
});

test('2D-03: stale snapshot rejected with 409, no write, rollback', async () => {
    const h = harness({ current: base({ PlanID: 2 }) });
    await safeReject(h, payload(base()), 409);
    assert.equal(h.rolledBack, true);
});

test('2D-04: absent user is rejected without changing records', async () => {
    const h = harness({ userExists: false });
    await safeReject(h, payload(), 404);
});

test('2D-05: unavailable plan is rejected', async () => {
    const h = harness({ planExists: false });
    await safeReject(h, payload(), 400);
});

test('2D-06: paid subscriptions require a separate billing workflow', async () => {
    const b = base({ AccessType: 'PAID' });
    const h = harness({ current: b });
    await safeReject(h, payload(b), 409);
});

test('2D-07: PROMO cannot be newly selected or manufactured', async () => {
    const h = harness();
    await safeReject(h, payload(base(), { accessType: 'PROMO' }), 400);
});

test('2D-08: converting existing PROMO to ADMIN_GRANT clears promo pointer but keeps history elsewhere', async () => {
    const b = base({ AccessType: 'PROMO', PromoCodeID: 1 });
    const h = harness({ current: b });
    await h.api.updateAdminBaseSubscription(64, payload(b));
    assert.equal(writes(h).length, 1);
    assert.match(writes(h)[0].sql, /PromoCodeID = NULL/);
    assert.equal(h.committed, true);
});

test('2D-09: explicit Active=false is persisted, not silently coerced true', async () => {
    const h = harness();
    await h.api.updateAdminBaseSubscription(64, payload(base(), { active: false }));
    assert.equal(writes(h)[0].params[3], 0);
});

test('2D-10: malformed active field rejected without connecting', async () => {
    const h = harness();
    await safeReject(h, payload(base(), { active: 'false' }), 400);
    assert.equal(h.events.length, 0);
});

test('2D-11: invalid 2200-style date and unsupported access type rejected', async () => {
    for (const props of [{ endDate: '2200-02-30' }, { accessType: 'STRIPE' }, { endDate: '' }]) {
        const h = harness();
        await safeReject(h, payload(base(), props), 400);
        assert.equal(h.events.length, 0);
    }
});

test('2D-12: omitted expected snapshot rejected before any database use', async () => {
    const h = harness();
    const p = payload();
    delete p.expected;
    await safeReject(h, p, 400);
    assert.equal(h.events.length, 0);
});

test('2D-13: affectedRows anomaly rolls back, releases connection', async () => {
    const h = harness({ writeRows: 0 });
    await assert.rejects(h.api.updateAdminBaseSubscription(64, payload()));
    assert.equal(h.committed, false);
    assert.equal(h.rolledBack, true);
    assert.equal(h.events.at(-1), 'RELEASE');
});

test('2D-14: read-only base snapshot is distinct from effective grant subscription', async () => {
    const h = harness();
    // Test source contracts without exercising getEffectiveSubscription's other query branch.
    assert.match(source, /base: subscription \? subscriptionSnapshot\(subscription\)/);
    assert.match(source, /effective: await buildSubscriptionStatus\(await getEffectiveSubscription\(id\)\)/);
    assert.equal(typeof h.api.getAdminBaseSubscription, 'function');
});

test('2D-15: both routes enforce existing requireAdmin middleware', () => {
    assert.match(routeSource, /router\.get\('\/admin\/user\/:userId\/subscription', requireAdmin/);
    assert.match(routeSource, /router\.put\('\/admin\/user\/:userId\/subscription', requireAdmin/);
    assert.match(routeSource, /if \(isExpectedClientError\(error\)\)/);
});
