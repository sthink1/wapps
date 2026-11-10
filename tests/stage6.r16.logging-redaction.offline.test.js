'use strict';
// R16-34 isolated logging-redaction tests. No external services or project changes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = p => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');

test('ETF cache log hides user identifier and category while retaining cacheKey behavior', () => {
  const s = read('routes/etf.js');
  assert.match(s, /const cacheKey = `\$\{userId\}\|\$\{category\}`/);
  assert.match(s, /compareCache\.get\(cacheKey\)/);
  assert.match(s, /compareCache\.set\(cacheKey,/);
  assert.match(s, /logger\.info\('ETF comparison cache hit \(identifiers omitted\)'\)/);
  assert.doesNotMatch(s, /logger\.info\(`Cache hit for \$\{cacheKey\}`\)/);
});

test('Polygon 429 diagnostics omit untrusted symbol/date while response remains unchanged', () => {
  const s = read('routes/etf.js');
  assert.match(s, /logger\.error\('Polygon rate limit \(429; symbol and date omitted\)'\)/);
  assert.match(s, /return res\.status\(429\)\.json\(\{ message: 'Polygon rate limit' \}\)/);
  assert.doesNotMatch(s, /logger\.error\(`Polygon rate limit \(429\) for/);
});

test('Weight DELETE diagnostic omits record ID and keeps authorization and validation', () => {
  const s = read('routes/weights.js');
  assert.match(s, /logger\.info\('Handling DELETE \/weights\/:id \(identifier omitted\)'\)/);
  assert.doesNotMatch(s, /logger\.info\(`Handling DELETE \/weights\/:id with id=/);
  assert.match(s, /\[param\('id'\)\.isInt\(\)/);
  assert.match(s, /const userId = req\.user\.userId/);
  assert.match(s, /DELETE FROM WeightsT WHERE WeightID = \? AND UserID = \?/);
});

test('Usage tracker hides synthetic exception message and never retries rejected POST', async () => {
  const s = read('httpdocs/js/usageTracking.js');
  const warnings = [];
  const requests = [];
  const marker = 'R16_FAKE_TOKEN_DO_NOT_LOG_5980';
  const fakeWindow = {
    location: {pathname:'/home.html'},
    WA: {session: {restore: async () => ({authenticated:true}), getAccessToken: ()=>'synthetic'},
         api: {request: async (p,options) => {requests.push({p,options}); throw new Error(marker);}}},
    __waUsageTrackingInstalled:false,
    addEventListener(){}
  };
  const fakeDocument = {hidden:false,readyState:'complete',addEventListener(){}};
  const ctx={window:fakeWindow, document:fakeDocument, console:{warn:(...args)=>warnings.push(args.join(' '))},
             localStorage:{getItem:()=>null}, performance:{now:()=>0}, setInterval:()=>1};
  vm.runInNewContext(s,ctx,{filename:'usageTracking.js',timeout:1000});
  for(let i=0;i<15;i++) await Promise.resolve();
  assert.equal(requests.length,1,'Single request; no uncertain POST replay');
  assert.equal(requests[0].p,'/track/log/page');
  assert.equal(warnings.length,1);
  assert.match(warnings[0],/Usage tracking request unavailable \(exception details omitted\)/);
  assert.ok(!warnings[0].includes(marker),'Synthetic secret must not appear in logs');
});
