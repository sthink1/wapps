'use strict';

// Stage 2E: isolated offline source and browser-event regression tests.
// No server, network, database, or project-file mutations.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'httpdocs', 'SubControl.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'Script element should exist');

function harness(responder, confirmResult = true) {
    const elements = new Map();
    const requests = [];
    let confirms = 0;
    const make = id => {
        if (!elements.has(id)) {
            const handlers = {};
            const obj = {
                id, handlers, value: '', checked: false, disabled: false,
                style: {}, children: [], textContent: '',
                addEventListener(name, listener) { handlers[name] = listener; },
                appendChild(child) { this.children.push(child); },
                replaceChildren() { this.children.length = 0; },
                focus() {}, reset() {},
                setAttribute() {}, classList: { add() {}, contains() { return true; } }
            };
            elements.set(id, obj);
        }
        return elements.get(id);
    };
    const document = {
        getElementById: make,
        createElement: () => ({ value: '', textContent: '', selected: false, children: [], appendChild(child) { this.children.push(child); } }),
        addEventListener: (name, callback) => { document[name] = callback; },
        querySelectorAll: () => []
    };
    const context = {
        document,
        window: {
            location: { hostname: 'example.test', origin: 'https://example.test', port: '' },
            confirm() { confirms += 1; return confirmResult; }
        },
        localStorage: { getItem() { return 'test-token'; } },
        sessionStorage: { getItem() { return null; }, removeItem() {}, setItem() {} },
        fetch: async (url, options) => {
            requests.push({ url, options });
            return responder(url, options);
        },
        Date, Number, String, Array, JSON, Promise, Error, encodeURIComponent, console
    };
    vm.runInNewContext(script, context, { filename: 'SubControl.html:inline-script' });
    return { elements, requests, get: make, get confirms() { return confirms; } };
}

const user = { userId: 64, username: 'charter' };
const prior = {
    userSubscriptionId: 14, planId: 3, planName: 'Platinum',
    accessType: 'DEVELOPMENT_TRIAL', startDate: '2026-11-01',
    endDate: '2026-12-02', active: true, promoCodeId: null
};
const lookup = {
    user, base: prior,
    effective: { exists: true, active: true, planName: 'Platinum', accessType: 'DEVELOPMENT_TRIAL', effectiveEndDate: null },
    plans: [{ planId: 1, planName: 'Standard' }, { planId: 3, planName: 'Platinum' }],
    note: 'Active legacy administrator grants may override the underlying subscription until migration.'
};
function json(body, status = 200) {
    return { ok: status < 400, status, json: async () => body };
}
async function find(h) {
    h.get('subscriptionUserId').value = '64';
    await h.get('subscriptionFindBtn').handlers.click();
}
function submitEvent() { return { preventDefault() {} }; }

test('2E-01: page script parses', () => { new vm.Script(script); });
test('2E-02: legacy grant UI and handlers removed', () => {
    for (const marker of ['Grant Free Usage', 'Current Free Access Grants', 'loadGrants()', 'renderGrantTable()', 'grantEditForm']) {
        assert.equal(html.includes(marker), false, marker);
    }
});
test('2E-03: preserved administrator and promo sections', () => {
    for (const marker of ['Administrator Management', 'Promo Codes', 'Current Promo Redemptions', 'adminPrepareBtn', 'loadPromoRedemptions']) {
        assert.ok(html.includes(marker), marker);
    }
});
test('2E-04: direct subscription form has all four requested fields', () => {
    for (const id of ['subscriptionAccessType', 'subscriptionPlan', 'subscriptionEndDate', 'subscriptionActive']) {
        assert.ok(html.includes(`id="${id}"`), id);
    }
});
test('2E-05: new form is hidden until a successful lookup', () => {
    const h = harness(() => json(lookup));
    assert.equal(h.get('subscriptionAdminForm').style.display, undefined);
});
test('2E-06: user lookup fetches direct underlying and effective subscriptions', async () => {
    const h = harness(() => json(lookup));
    await find(h);
    assert.equal(h.requests.length, 1);
    assert.match(h.requests[0].url, /\/subscriptions\/admin\/user\/64\/subscription$/);
    assert.equal(h.get('subscriptionAdminForm').style.display, 'grid');
    assert.ok(h.get('subscriptionUserSummary').children.some(child => child.textContent.includes('Underlying Subscription:')));
    assert.ok(h.get('subscriptionUserSummary').children.some(child => child.textContent.includes('Effective Access:')));
    assert.equal(h.get('subscriptionAccessType').value, 'DEVELOPMENT_TRIAL');
    assert.equal(h.get('subscriptionActive').checked, true);
});
test('2E-07: invalid user ID never sends a request', async () => {
    const h = harness(() => json(lookup));
    h.get('subscriptionUserId').value = '-1';
    await h.get('subscriptionFindBtn').handlers.click();
    assert.equal(h.requests.length, 0);
});
test('2E-08: confirmed mutation uses PUT once with expected original snapshot', async () => {
    const h = harness((url, opts) => opts?.method === 'PUT' ? json({ message: 'Saved.' }) : json(lookup));
    await find(h);
    h.get('subscriptionPlan').value = '1';
    h.get('subscriptionAccessType').value = 'ADMIN_GRANT';
    h.get('subscriptionEndDate').value = '01/01/2200';
    await h.get('subscriptionAdminForm').handlers.submit(submitEvent());
    const writes = h.requests.filter(item => item.options?.method === 'PUT');
    assert.equal(writes.length, 1);
    const body = JSON.parse(writes[0].options.body);
    assert.equal(body.planId, 1);
    assert.equal(body.accessType, 'ADMIN_GRANT');
    assert.equal(body.endDate, '2200-01-01');
    assert.equal(body.active, true);
    assert.deepEqual(JSON.parse(JSON.stringify(body.expected)), prior);
    assert.equal(h.requests.filter(item => item.options?.method !== 'PUT').length, 2, 'one initial lookup and one verification lookup');
    assert.equal(h.confirms, 1);
});
test('2E-09: cancelled confirmation never writes', async () => {
    const h = harness(() => json(lookup), false);
    await find(h);
    h.get('subscriptionEndDate').value = '01/01/2200';
    await h.get('subscriptionAdminForm').handlers.submit(submitEvent());
    assert.equal(h.requests.length, 1);
});
test('2E-10: network failure never replays uncertain PUT', async () => {
    const h = harness((url, opts) => {
        if (opts?.method === 'PUT') throw new TypeError('Network error');
        return json(lookup);
    });
    await find(h);
    h.get('subscriptionEndDate').value = '01/01/2200';
    await h.get('subscriptionAdminForm').handlers.submit(submitEvent());
    assert.equal(h.requests.filter(r => r.options?.method === 'PUT').length, 1);
    assert.match(h.get('subscriptionAdminStatus').textContent, /Verify with Find User/);
    assert.equal(h.get('subscriptionAdminForm').style.display, 'none');
});
test('2E-11: nested errors are readable, not [object Object]', async () => {
    const h = harness(() => json({ error: { message: 'Access denied' } }, 403));
    await find(h);
    assert.equal(h.get('subscriptionAdminStatus').textContent, 'Access denied');
});
test('2E-12: no base subscription is represented without fabricated history', async () => {
    const h = harness(() => json({ ...lookup, base: null }));
    await find(h);
    assert.ok(h.get('subscriptionUserSummary').children.some(child => child.textContent.includes('No underlying subscription')));
    assert.equal(h.get('subscriptionEndDate').value, '');
});
test('2E-13: existing paid/promo type is not silently copied into editable access type', async () => {
    const h = harness(() => json({ ...lookup, base: { ...prior, accessType: 'PROMO' } }));
    await find(h);
    assert.equal(h.get('subscriptionAccessType').value, 'ADMIN_GRANT');
    assert.match(h.get('subscriptionAdminStatus').textContent, /requires review/);
});
test('2E-14: malformed date prevents write', async () => {
    const h = harness(() => json(lookup));
    await find(h);
    h.get('subscriptionEndDate').value = '02/30/2200';
    await h.get('subscriptionAdminForm').handlers.submit(submitEvent());
    assert.equal(h.requests.length, 1);
    assert.match(h.get('subscriptionAdminStatus').textContent, /not a valid calendar date/);
});
test('2E-15: successful response but verification failure does not replay PUT', async () => {
    let reads = 0;
    const h = harness((url, opts) => {
        if (opts?.method === 'PUT') return json({ message: 'Saved.' });
        reads++;
        return reads === 1 ? json(lookup) : json({ error: 'Unavailable' }, 503);
    });
    await find(h);
    h.get('subscriptionEndDate').value = '01/01/2200';
    await h.get('subscriptionAdminForm').handlers.submit(submitEvent());
    assert.equal(h.requests.filter(r => r.options?.method === 'PUT').length, 1);
    assert.match(h.get('subscriptionAdminStatus').textContent, /could not be reloaded/);
});
