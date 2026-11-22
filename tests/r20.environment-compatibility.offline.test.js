'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../services/stage6Environment.js'), 'utf8');
const common = {
  DB_HOST: 'morty2.heliohost.org', DB_PORT: '3306', DB_USER: 'wapps_test',
  DB_NAME: 'wapps_test', DB_SSL: 'required', DB_CONNECTION_LIMIT: '5',
  NODE_ENV: 'production', WA_ENV: 'staging',
  APP_PUBLIC_ORIGIN: 'https://wapps-stage6-test.onrender.com',
  PUBLIC_BASE_URL: 'https://wapps-stage6-test.onrender.com',
  WA_ALLOWED_ORIGINS: 'https://wapps-stage6-test.onrender.com'
};
const production = {
  ...common, WA_ENV: 'production',
  DB_NAME: 'wapps_future_candidate', DB_USER: 'wapps_future_candidate',
  WA_PRODUCTION_DB_NAME: 'wapps_future_candidate', WA_PRODUCTION_DB_USER: 'wapps_future_candidate',
  APP_PUBLIC_ORIGIN: 'https://future-approved.example.org',
  PUBLIC_BASE_URL: 'https://future-approved.example.org',
  WA_ALLOWED_ORIGINS: 'https://future-approved.example.org',
  WA_PRODUCTION_ORIGIN: 'https://future-approved.example.org',
  WA_PRODUCTION_RELEASE_GATE: 'owner-authorized'
};
let assertions = 0;
function load(env) {
  const module = { exports: {} };
  vm.runInNewContext(source, { process: { env }, module, exports: module.exports, URL, Set, Object, String, Number, Error },
    { filename: 'services/stage6Environment.js', timeout: 3000 });
  return module.exports;
}
function accepted(env, expectedMode, secure) {
  const instance = load(env); assert.equal(instance.current.mode, expectedMode);
  assert.equal(instance.current.secureCookie, secure); assertions++;
  return instance;
}
function denied(env, reason) {
  assert.throws(() => load(env), { message: reason }); assertions++;
}
(async () => {
  accepted(common, 'staging', true);
  const local = {
    ...common, WA_ENV: 'local', NODE_ENV: 'development', DB_HOST: 'legacy-test.invalid',
    DB_NAME: 'sql5838929', DB_USER: 'test_user', DB_SSL: '', DB_CONNECTION_LIMIT: '50',
    APP_PUBLIC_ORIGIN: 'http://localhost:8080', PUBLIC_BASE_URL: 'http://localhost:8080',
    WA_ALLOWED_ORIGINS: 'http://localhost:8080'
  };
  accepted(local, 'local', false);
  const candidate = accepted(production, 'production', true);
  assert.equal(candidate.current.expectedDatabase, 'wapps_future_candidate'); assertions++;
  const invalid = [
    [{...production, WA_ENV: ''}, 'WA_ENV_MODE_NOT_APPROVED'],
    [{...production, WA_PRODUCTION_RELEASE_GATE: ''}, 'WA_PRODUCTION_RELEASE_NOT_AUTHORIZED'],
    [{...production, NODE_ENV: 'development'}, 'WA_PRODUCTION_NODE_ENV_REQUIRED'],
    [{...production, DB_HOST: 'other.invalid'}, 'WA_PRODUCTION_DB_ENDPOINT_MISMATCH'],
    [{...production, DB_PORT: '3307'}, 'WA_PRODUCTION_DB_ENDPOINT_MISMATCH'],
    [{...production, DB_NAME: 'wapps_test'}, 'WA_PRODUCTION_DB_IDENTITY_NOT_APPROVED'],
    [{...production, DB_NAME: 'wapps_production', WA_PRODUCTION_DB_NAME: 'wapps_production'}, 'WA_PRODUCTION_DB_IDENTITY_NOT_APPROVED'],
    [{...production, DB_USER: 'wapps_test'}, 'WA_PRODUCTION_DB_IDENTITY_NOT_APPROVED'],
    [{...production, DB_SSL: ''}, 'WA_PRODUCTION_DB_TLS_REQUIRED'],
    [{...production, DB_CONNECTION_LIMIT: '50'}, 'WA_PRODUCTION_POOL_LIMIT_NOT_APPROVED'],
    [{...production, DB_CONNECTION_LIMIT: '0'}, 'WA_PRODUCTION_POOL_LIMIT_NOT_APPROVED'],
    [{...production, DB_CONNECTION_LIMIT: 'bad'}, 'WA_PRODUCTION_POOL_LIMIT_NOT_APPROVED'],
    [{...production, APP_PUBLIC_ORIGIN: 'https://wapps-stage6-test.onrender.com'}, 'WA_PRODUCTION_ORIGIN_NOT_APPROVED'],
    [{...production, WA_PRODUCTION_ORIGIN: ''}, 'WA_PRODUCTION_ORIGIN_NOT_APPROVED'],
    [{...production, PUBLIC_BASE_URL: 'https://other.invalid'}, 'WA_PRODUCTION_ORIGIN_NOT_APPROVED'],
    [{...production, WA_ALLOWED_ORIGINS: 'https://other.invalid'}, 'GROUP0D_ALLOWED_ORIGINS_MUST_EQUAL_PUBLIC_ORIGIN'],
    [{...common, DB_NAME: 'wapps_future_candidate'}, 'GROUP0D_TEST_DATABASE_ONLY'],
    [{...common, WA_ENV: 'production'}, 'WA_PRODUCTION_RELEASE_NOT_AUTHORIZED'],
    [{...common, DB_SSL: ''}, 'GROUP0D_HELIO_TLS_REQUIRED'],
    [{...common, DB_CONNECTION_LIMIT: '50'}, 'GROUP0D_HELIO_STAGING_POOL_LIMIT_MUST_BE_FIVE']
  ];
  for (const [env, reason] of invalid) denied(env, reason);
  const stubPool = { query: async () => [[{DatabaseName:'wapps_future_candidate', TimeZone:'+00:00'}]] };
  await candidate.verifyDatabaseIdentity(stubPool); assertions++;
  await assert.rejects(candidate.verifyDatabaseIdentity({query:async()=>[[{DatabaseName:'wapps_test',TimeZone:'+00:00'}]]}), /DATABASE_OR_TIMEZONE_MISMATCH/); assertions++;
  await assert.rejects(candidate.verifyDatabaseIdentity({query:async()=>[[{DatabaseName:'wapps_future_candidate',TimeZone:'SYSTEM'}]]}), /DATABASE_OR_TIMEZONE_MISMATCH/); assertions++;
  console.log(`PASS ${assertions} isolated environment assertions; no database, HTTP, filesystem mutation or credential access`);
})().catch(e => { console.error(e); process.exitCode = 1; });
