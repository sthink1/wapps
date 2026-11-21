'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const implementation = path.join(__dirname, '..', 'routes', 'ftPrivacy.js');
const source = fs.readFileSync(implementation, 'utf8');
const PRIVATE_ID = 202;
const PUBLIC_ID = 101;
const token = 'a'.repeat(64);

function loadMiddleware({ privateIDs = [PRIVATE_ID], unlockedIDs = [], admin = false } = {}) {
    const privateSet = new Set(privateIDs);
    const unlockedSet = new Set(unlockedIDs);
    const db = {
        async query(sql, params) {
            if (sql.includes('FROM FTPersonPrivacyT WHERE IsPrivate=1')) {
                return [[...privateSet].filter(id => params.includes(id)).map(PersonID => ({ PersonID }))];
            }
            if (sql.includes('FROM FTPrivacyUnlockT')) {
                const valid = unlockedSet.has(params[0]) && params[1] === 7 && params[2] === crypto.createHash('sha256').update(token).digest('hex');
                return [valid ? [{ yes: 1 }] : []];
            }
            throw new Error('Unexpected query in isolated M03 test: ' + sql);
        },
        async getConnection() {
            return { release() {} };
        }
    };
    const context = {
        module: { exports: {} },
        exports: {},
        process: { env: {} },
        console: { error() {} },
        require(name) {
            switch (name) {
                case 'express': return { Router: () => ({ get() {}, post() {} }) };
                case 'crypto': return crypto;
                case '../dbConnection': return { pool: db };
                case '../services/notificationService': return { sendNotification: () => {} };
                case '../services/stage6ExpectedClientError': return { markExpectedClientError: x => x, isExpectedClientError: () => false };
                case '../services/administratorAccess': return { isVerifiedAdministrator: () => admin };
                default: throw new Error('Unexpected require: ' + name);
            }
        }
    };
    vm.runInNewContext(source, context, { filename: implementation });
    return context.module.exports.protection;
}

function review(newerID = PRIVATE_ID, olderID = PUBLIC_ID) {
    return {
        olderTree: { FamilyTreeCode: 'FT-OLDER' },
        newerTree: { FamilyTreeCode: 'FT-NEWER' },
        groups: [{
            newerPerson: { PersonID: newerID, FirstName: 'Synthetic', BirthPlace: 'PRIVATE_NEWER_SENTINEL', contacts: [{ ContactValue: 'private@example.invalid' }] },
            candidates: [{
                PersonID: olderID, FirstName: 'Example', MatchScore: 90,
                MatchReasons: ['same birth place'],
                conflicts: [{ field: 'BirthPlace', olderValue: 'PUBLIC_OLDER_SENTINEL', newerValue: 'PRIVATE_NEWER_SENTINEL' }]
            }]
        }]
    };
}

async function deliver(payload, opts = {}) {
    const middleware = loadMiddleware(opts);
    const sent = [];
    const response = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { sent.push({ status: this.statusCode, body: JSON.parse(JSON.stringify(body)) }); return this; },
        send(body) { sent.push({ status: this.statusCode, body }); return this; }
    };
    const req = {
        user: { userId: 7 }, path: '/one-tree/review', method: 'GET',
        headers: opts.sendToken ? { 'x-ft-page-token': token } : {}, query: {}
    };
    if (opts.path) req.path = opts.path;
    await middleware(req, response, () => { response.json(payload); });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(sent.length, 1, 'exactly one response must be sent');
    return sent[0];
}

test('unauthorized newer private Person: fail closed, no derivative disclosure', async () => {
    const result = await deliver(review());
    assert.equal(result.status, 423);
    assert.equal(result.body.code, 'PRIVATE_LOCKED');
    assert.doesNotMatch(JSON.stringify(result.body), /PRIVATE_NEWER_SENTINEL|private@example\.invalid|conflicts|MatchScore/);
});

test('invalid privacy token does not grant access', async () => {
    const result = await deliver(review(), { sendToken: true });
    assert.equal(result.status, 423);
});

test('valid Person-specific unlock permits authorized review data', async () => {
    const result = await deliver(review(), { sendToken: true, unlockedIDs: [PRIVATE_ID] });
    assert.equal(result.status, 200);
    assert.equal(result.body.groups[0].newerPerson.BirthPlace, 'PRIVATE_NEWER_SENTINEL');
    assert.equal(result.body.groups[0].candidates[0].conflicts[0].newerValue, 'PRIVATE_NEWER_SENTINEL');
});

test('verified administrator remains exempt from privacy code', async () => {
    const result = await deliver(review(), { admin: true });
    assert.equal(result.status, 200);
    assert.equal(result.body.groups[0].candidates[0].conflicts.length, 1);
});

test('public review remains unchanged', async () => {
    const result = await deliver(review(PUBLIC_ID, 303), { privateIDs: [] });
    assert.equal(result.status, 200);
    assert.equal(result.body.groups[0].candidates[0].conflicts.length, 1);
});

test('private candidate with public newer: fail closed', async () => {
    const result = await deliver(review(PUBLIC_ID, PRIVATE_ID));
    assert.equal(result.status, 423);
});

test('two private Persons require authorization for both', async () => {
    const result = await deliver(review(PRIVATE_ID, 303), {
        privateIDs: [PRIVATE_ID, 303], unlockedIDs: [PRIVATE_ID], sendToken: true
    });
    assert.equal(result.status, 423);
});

test('nested 409 review payload: fail closed before sending embedded candidateGroups', async () => {
    const input = { code: 'ONE_TREE_REVIEW_REQUIRED', review: { code: 'ONE_TREE_REVIEW_REQUIRED', candidateGroups: review().groups } };
    const result = await deliver(input);
    assert.equal(result.status, 423);
    assert.ok(!('review' in result.body));
});

test('top-level candidateGroups review: fail closed', async () => {
    const input = { code: 'ONE_TREE_REVIEW_REQUIRED', candidateGroups: review().groups };
    const result = await deliver(input);
    assert.equal(result.status, 423);
});

test('unrelated Person response retains existing privacy redaction', async () => {
    const result = await deliver({ person: { PersonID: PRIVATE_ID, FirstName: 'Visible', BirthPlace: 'PRIVATE_NEWER_SENTINEL' } }, { path: '/other-read' });
    assert.equal(result.status, 200);
    assert.equal(result.body.person.IsPrivate, true);
    assert.equal(result.body.person.BirthPlace, undefined);
});

test('no Person identifiers bypass privacy query and preserve normal response', async () => {
    const result = await deliver({ message: 'Routine response' });
    assert.equal(result.status, 200);
    assert.equal(result.body.message, 'Routine response');
});
