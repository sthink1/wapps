// Stage 2C: development-trial entitlement tests. Read-only, isolated Node built-ins only.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'services', 'subscriptionService.js'), 'utf8');
const fixedToday = '2026-11-18';
const DateAtTest = class extends Date {
    constructor(...args) {
        super(...(args.length ? args : [`${fixedToday}T12:00:00Z`]));
    }
    static now() { return Date.parse(`${fixedToday}T12:00:00Z`); }
};

function harness({ mode = '1', base = null, grant = null, app = null } = {}) {
    const queries = [];
    const state = { mode };
    const db = {
        async query(sql, params = []) {
            queries.push({ sql, params });
            if (/^SELECT SettingValue FROM SystemSettingsT/.test(sql)) {
                assert.equal(params[0], 'DevelopmentMode');
                return [[{ SettingValue: state.mode }]];
            }
            if (sql.includes('FROM UserSubscriptionT us')) return [[...(base ? [base] : [])]];
            if (sql.includes('FROM AdminSubscriptionGrantT g')) return [[...(grant ? [grant] : [])]];
            if (sql.includes('FROM AppT a') && sql.includes('WHERE a.AppKey')) return [[...(app ? [app] : [])]];
            if (sql.includes('FROM AppT a') && sql.includes('ORDER BY')) return [[...(app ? [app] : [])]];
            throw new Error(`Unexpected SQL in isolated test: ${sql}`);
        }
    };
    const module = { exports: {} };
    vm.runInNewContext(source, {
        module,
        exports: module.exports,
        require(request) {
            if (request === '../dbConnection') return { pool: db };
            if (request === './stage6ExpectedClientError') return { markExpectedClientError: error => error };
            throw new Error(`Unexpected dependency ${request}`);
        },
        Date: DateAtTest,
        Error,
        Number,
        Boolean,
        String,
        parseInt
    }, { filename: 'services/subscriptionService.js' });
    return { api: module.exports, state, queries };
}

function sub(overrides = {}) {
    return {
        UserSubscriptionID: 1, UserID: 64, PlanID: 3, PlanName: 'Platinum',
        PlanLevel: 3, AccessType: 'DEVELOPMENT_TRIAL', StartDate: '2026-09-01',
        EndDate: '2026-10-01', Active: 1, PromoCodeID: null,
        ...overrides
    };
}
const app = {
    AppID: 1, AppKey: 'weigh_in', AppName: 'Weigh In', CostCategory: 'B',
    Active: 1, DevelopmentAvailable: 1, MinimumPlanName: 'Premium', MinimumPlanLevel: 2
};

test('2C-01: active expired trial remains eligible during development; stored expiration unchanged', async () => {
    const b = sub();
    const h = harness({ mode: '1', base: b, app });
    const status = await h.api.buildSubscriptionStatus(b);
    assert.equal(status.active, true);
    assert.equal(status.expired, false);
    assert.equal(status.endDate, '2026-10-01');
    assert.equal(status.effectiveEndDate, null);
    const access = await h.api.getAppAccess(64, 'weigh_in');
    assert.equal(access.allowed, true);
    assert.equal(access.subscription.active, true);
});

test('2C-02: inactive trial stays denied during development despite unexpired date', async () => {
    const b = sub({ Active: 0, EndDate: '2200-01-01' });
    const h = harness({ mode: '1', base: b, app });
    assert.equal((await h.api.buildSubscriptionStatus(b)).active, false);
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).reason, 'SUBSCRIPTION_EXPIRED');
});

test('2C-03: active future-dated trial is denied after development ends', async () => {
    const b = sub({ EndDate: '2200-01-01' });
    const h = harness({ mode: '0', base: b, app });
    assert.equal((await h.api.buildSubscriptionStatus(b)).active, false);
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).allowed, false);
});

test('2C-04: expired development trial is also denied after production cutover', async () => {
    const b = sub();
    const h = harness({ mode: '0', base: b, app });
    const access = await h.api.getAppAccess(64, 'weigh_in');
    assert.equal(access.reason, 'SUBSCRIPTION_EXPIRED');
});

test('2C-05: switching DevelopmentMode changes result without database mutation', async () => {
    const b = sub();
    const h = harness({ mode: '1', base: b, app });
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).allowed, true);
    h.state.mode = '0';
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).allowed, false);
    h.state.mode = '1';
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).allowed, true);
    assert.ok(h.queries.every(q => /^SELECT /.test(q.sql.trim())));
});

test('2C-06: non-trial subscriptions retain normal expiration behavior', async () => {
    for (const accessType of ['PROMO', 'ADMIN_GRANT', 'PAID']) {
        const before = sub({ AccessType: accessType, EndDate: '2026-10-01' });
        const after = sub({ AccessType: accessType, EndDate: '2200-01-01' });
        const h = harness({ mode: '0' });
        assert.equal((await h.api.buildSubscriptionStatus(before)).active, false, accessType);
        assert.equal((await h.api.buildSubscriptionStatus(after)).active, true, accessType);
        assert.equal((await h.api.buildSubscriptionStatus(after)).effectiveEndDate, '2200-01-01', accessType);
    }
});

test('2C-07: migrated underlying ADMIN_GRANT remains active after cutover', async () => {
    const b = sub({ AccessType: 'ADMIN_GRANT', EndDate: '2200-01-01' });
    const h = harness({ mode: '0', base: b, app });
    const result = await h.api.getAppAccess(64, 'weigh_in');
    assert.equal(result.allowed, true);
    assert.equal(result.subscription.accessType, 'ADMIN_GRANT');
});

test('2C-08: status and app entitlement agree for trial in development and production', async () => {
    const b = sub();
    const h = harness({ mode: '1', base: b, app });
    const development = await h.api.getStatusWithApps(64);
    assert.equal(development.subscription.active, true);
    assert.equal(development.apps[0].allowed, true);
    h.state.mode = '0';
    const production = await h.api.getStatusWithApps(64);
    assert.equal(production.subscription.active, false);
    assert.equal(production.apps[0].allowed, false);
});

test('2C-09: disabled trial remains disabled after production-to-development transition', async () => {
    const b = sub({ Active: 0 });
    const h = harness({ mode: '0', base: b, app });
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).allowed, false);
    h.state.mode = '1';
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).allowed, false);
});

test('2C-10: no subscription still denied without grants', async () => {
    const h = harness({ mode: '1', app });
    assert.equal((await h.api.getAppAccess(64, 'weigh_in')).reason, 'SUBSCRIPTION_EXPIRED');
});
