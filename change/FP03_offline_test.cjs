'use strict';

// Runs the complete browser source in a VM using synthetic fetch/DOM fixtures.
// No genuine credentials, application server, database or external network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const http = require('node:http');

const filename = process.argv[2] || path.resolve(__dirname, '../httpdocs/js/FTPrivacy.js');
const source = fs.readFileSync(filename, 'utf8');
const TOKEN = 'synthetic-privacy-token';
const NEW_TOKEN = 'synthetic-new-token';
const HEADER = 'X-FT-Page-Token';
let passed = 0;
let failed = 0;

function harness(origin = 'https://wa.example.test', options = {}) {
    const page = new URL('/FTPerson.html', origin);
    const storage = new Map();
    const calls = [];
    const document = { baseURI: page.href };
    const window = { location: page };
    const nativeFetch = async (input, init = {}) => {
        const url = new URL(input instanceof Request ? input.url : String(input), document.baseURI);
        const headers = new Headers(init.headers !== undefined ? init.headers : input instanceof Request ? input.headers : undefined);
        calls.push({ url, input, init, headers });
        if (url.pathname.startsWith('/familytree/privacy/status/')) {
            return { ok: true, json: async () => ({
                IsPrivate: !options.publicPerson,
                IsAdmin: Boolean(options.admin),
                Authorized: [TOKEN, NEW_TOKEN].includes(headers.get(HEADER))
            }) };
        }
        if (options.realFetch) return fetch(input, init);
        return { ok: true, json: async () => ({}) };
    };
    window.fetch = nativeFetch;
    const context = vm.createContext({
        window, document, URL, Request, Headers,
        localStorage: { getItem: () => 'synthetic-bearer' },
        sessionStorage: {
            getItem: key => storage.get(key) || null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: key => storage.delete(key)
        },
        fetch: (...args) => window.fetch(...args)
    });
    vm.runInContext(source, context, { filename });
    return { window, document, calls, storage, nativeFetch };
}

async function install(h, token = TOKEN, person = 1) {
    h.storage.set(`FTPrivacyEntry:${person}`, token);
    assert.equal(await h.window.FTPrivacy.ensurePageAccess(person, 'FT-SYNTHETIC'), true);
    assert.equal(h.storage.has(`FTPrivacyEntry:${person}`), false);
    assert.equal(h.calls.at(-1).headers.get(HEADER), token);
    assert.equal(h.calls.at(-1).init.redirect, 'error');
}

async function test(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`PASS ${name}`);
    } catch (error) {
        failed++;
        console.error(`FAIL ${name}: ${error.message}`);
    }
}

function listen(server) {
    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => resolve(server.address().port));
    });
}

async function main() {
    const h = harness();
    await test('one-time handoff reaches status API and is consumed', () => install(h));
    const allowed = [
        '/familytree/persons/1',
        'familytree/persons/1',
        'https://wa.example.test/familytree/persons/1?mode=view',
        'https://WA.EXAMPLE.TEST:443/familytree/persons/1',
        '//wa.example.test/familytree/persons/1',
        new URL('https://wa.example.test/familytree/persons/1'),
        '/familytree/privacy/status/1',
        '/familytree/persons/1/pictures',
        '/familytree/persons/1/network'
    ];
    for (const url of allowed) {
        await test(`approved ${String(url)}`, async () => {
            await h.window.fetch(url, { headers: { Authorization: 'Bearer synthetic', 'X-Test': 'preserve' } });
            const call = h.calls.at(-1);
            assert.equal(call.headers.get(HEADER), TOKEN);
            assert.equal(call.headers.get('X-Test'), 'preserve');
            assert.equal(call.headers.get('Authorization'), 'Bearer synthetic');
            assert.equal(call.init.redirect, 'error');
        });
    }
    const denied = [
        'https://external.example.test/familytree/persons/1',
        '//external.example.test/familytree/persons/1',
        'http://wa.example.test/familytree/persons/1',
        'https://wa.example.test:444/familytree/persons/1',
        'https://wa.example.test.external.example.test/familytree/persons/1',
        'https://wa.example.test@external.example.test/familytree/persons/1',
        'https://user@wa.example.test/familytree/persons/1',
        '/weights?next=/familytree/persons/1',
        '/weights#/familytree/persons/1',
        '/other/familytree/persons/1',
        '/familytree/../weights',
        '/familytree/%2e%2e/weights',
        '/familytree-other/persons/1',
        '/familytree',
        '/familytree%2fpersons/1',
        'https://[bad/familytree/persons/1',
        'http://localhost:8080/familytree/persons/1',
        'data:text/plain,/familytree/persons/1'
    ];
    for (const url of denied) {
        await test(`denied ${url}`, async () => {
            const before = h.calls.length;
            try { await h.window.fetch(url, { headers: { 'X-Test': 'preserve' }, redirect: 'follow' }); }
            catch (error) {
                // Native URL parsing in the fixture may reject a malformed URL.
                assert.equal(url, 'https://[bad/familytree/persons/1');
                assert.equal(h.calls.length, before);
                return;
            }
            const call = h.calls.at(-1);
            assert.equal(call.headers.has(HEADER), false);
            assert.equal(call.headers.get('X-Test'), 'preserve');
            assert.equal(call.init.redirect, 'follow');
        });
    }
    await test('Request preserves method, body, headers and identity', async () => {
        const request = new Request('https://wa.example.test/familytree/persons/1', {
            method: 'POST', body: 'synthetic-body', headers: { 'Content-Type': 'text/plain', 'X-Test': 'keep' }
        });
        await h.window.fetch(request);
        const call = h.calls.at(-1);
        assert.equal(call.input, request);
        assert.equal(call.input.method, 'POST');
        assert.equal(await call.input.clone().text(), 'synthetic-body');
        assert.equal(call.headers.get('X-Test'), 'keep');
        assert.equal(call.headers.get(HEADER), TOKEN);
        assert.equal(request.headers.has(HEADER), false);
    });
    await test('Request init headers retain Fetch replacement semantics', async () => {
        const request = new Request('https://wa.example.test/familytree/persons/1', { headers: { 'X-Old': 'old' } });
        await h.window.fetch(request, { headers: [['X-New', 'new']], credentials: 'same-origin' });
        const call = h.calls.at(-1);
        assert.equal(call.headers.has('X-Old'), false);
        assert.equal(call.headers.get('X-New'), 'new');
        assert.equal(call.headers.get(HEADER), TOKEN);
        assert.equal(call.init.credentials, 'same-origin');
    });
    await test('foreign Request strips explicitly supplied privacy header', async () => {
        const request = new Request('https://external.example.test/familytree/persons/1', { headers: { [HEADER]: TOKEN, 'X-Test': 'keep' } });
        await h.window.fetch(request);
        assert.equal(h.calls.at(-1).headers.has(HEADER), false);
        assert.equal(h.calls.at(-1).headers.get('X-Test'), 'keep');
        assert.equal(request.headers.get(HEADER), TOKEN);
    });
    await test('foreign init headers strip capability without mutating original', async () => {
        const headers = new Headers({ [HEADER]: TOKEN, 'X-Test': 'keep' });
        await h.window.fetch('https://external.example.test/familytree/persons/1', { headers });
        assert.equal(h.calls.at(-1).headers.has(HEADER), false);
        assert.equal(headers.get(HEADER), TOKEN);
    });
    await test('reinstall uses latest capability and does not stack wrappers', async () => {
        const wrapper = h.window.fetch;
        await install(h, NEW_TOKEN, 2);
        assert.equal(h.window.fetch, wrapper);
        const before = h.calls.length;
        await h.window.fetch('/familytree/persons/2');
        assert.equal(h.calls.length, before + 1);
        assert.equal(h.calls.at(-1).headers.get(HEADER), NEW_TOKEN);
    });
    await test('caller redirect override cannot forward token', async () => {
        await h.window.fetch('/familytree/persons/2', { redirect: 'follow' });
        assert.equal(h.calls.at(-1).init.redirect, 'error');
    });
    await test('base URL on foreign origin does not receive token', async () => {
        h.document.baseURI = 'https://external.example.test/';
        await h.window.fetch('familytree/persons/1');
        assert.equal(h.calls.at(-1).headers.has(HEADER), false);
        h.document.baseURI = h.window.location.href;
    });
    await test('public Person page leaves fetch unchanged', async () => {
        const publicPage = harness(undefined, { publicPerson: true });
        assert.equal(await publicPage.window.FTPrivacy.ensurePageAccess(1, 'FT-SYNTHETIC'), true);
        assert.equal(publicPage.window.fetch, publicPage.nativeFetch);
    });
    await test('verified admin page leaves fetch unchanged', async () => {
        const adminPage = harness(undefined, { admin: true });
        assert.equal(await adminPage.window.FTPrivacy.ensurePageAccess(1, 'FT-SYNTHETIC'), true);
        assert.equal(adminPage.window.fetch, adminPage.nativeFetch);
    });
    await test('localhost split-port API exception only on localhost page', async () => {
        const local = harness('http://localhost:5500');
        await install(local);
        for (const url of ['http://localhost:8080/familytree/persons/1', '/familytree/persons/1']) {
            await local.window.fetch(url);
            assert.equal(local.calls.at(-1).headers.get(HEADER), TOKEN);
        }
        for (const url of ['http://localhost:8081/familytree/persons/1', 'http://127.0.0.1:8080/familytree/persons/1', 'https://external.example.test/familytree/persons/1']) {
            await local.window.fetch(url);
            assert.equal(local.calls.at(-1).headers.has(HEADER), false);
        }
    });
    await test('localhost:8080 normal same-origin operation', async () => {
        const local = harness('http://localhost:8080');
        await install(local);
        await local.window.fetch('/familytree/persons/1');
        assert.equal(local.calls.at(-1).headers.get(HEADER), TOKEN);
    });
    await test('actual Fetch blocks redirect before second loopback server receives request', async () => {
        let downstream = 0;
        let initialToken;
        const target = http.createServer((req, res) => { downstream++; res.end('unexpected'); });
        const targetPort = await listen(target);
        const origin = http.createServer((req, res) => {
            initialToken = req.headers['x-ft-page-token'];
            res.writeHead(302, { Location: `http://127.0.0.1:${targetPort}/familytree/persons/1` });
            res.end();
        });
        try {
            const originPort = await listen(origin);
            const local = harness(`http://127.0.0.1:${originPort}`, { realFetch: true });
            await install(local);
            await assert.rejects(local.window.fetch('/familytree/persons/1', { redirect: 'follow' }));
            assert.equal(initialToken, TOKEN);
            assert.equal(downstream, 0);
        } finally {
            origin.closeAllConnections();
            target.closeAllConnections();
            await Promise.all([new Promise(resolve => origin.close(resolve)), new Promise(resolve => target.close(resolve))]);
        }
    });
    console.log(`RESULT: ${passed} passed, ${failed} failed, ${passed + failed} cases.`);
    if (failed) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
