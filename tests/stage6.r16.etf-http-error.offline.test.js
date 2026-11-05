'use strict';
// Offline, dependency-isolated test of the real revised ETF router.
// No app listener, real database, credentials, network, email, or project writes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'routes', 'etf.js'), 'utf8');
const TARGETS = [
  ['post', '/category'], ['put', '/category/:id'], ['delete', '/category/:id'],
  ['post', '/symbol'], ['put', '/symbol/:id'], ['delete', '/symbol/:id'],
  ['post', '/activity/buy'], ['post', '/activity/sell'],
  ['put', '/activity/:id'], ['delete', '/activity/:id']
];
function createHarness(error, axiosGet = async () => { throw Error('axios should not run'); }) {
  const routes = new Map();
  const calls = [];
  const state = {error};
  const router = {};
  for (const method of ['get', 'post', 'put', 'delete']) {
    router[method] = (p, ...handlers) => routes.set(`${method} ${p}`, handlers.at(-1));
  }
  const validationChain = () => new Proxy(function () {}, {
    get: (_target, key) => key === 'then' ? undefined : () => validationChain()
  });
  const actualRequire = name => {
    if (name === 'express') return { Router: () => router };
    if (name === 'axios') return { get: axiosGet };
    if (name === 'express-validator') return {
      body: validationChain, param: validationChain, query: validationChain,
      validationResult: () => ({ isEmpty: () => true })
    };
    if (name === '../logger') return { error: () => {}, info: () => {}, warn: () => {} };
    if (name === '../dbConnection') return { getNextUserSpecificID: async () => 1 };
    if (name === '../utils') return {
      withTransaction: async callback => { if (state.error !== null) throw state.error; return callback({ query: async () => [[]] }); },
      handleDbError: () => { throw Error('handleDbError unexpected') }, holidays: []
    };
    if (name === '../middleware/auth') return (_req,_res,next) => next?.();
    throw Error('Unexpected require: ' + name);
  };
  const context = vm.createContext({
    require: actualRequire, module: { exports: {} }, process: { env: { POLYGON_API_KEY: 'fixture' } },
    console, setTimeout, clearTimeout
  });
  vm.runInContext(source, context, {filename:'routes/etf.js',timeout:2000});
  const req = {
    user: { userId: 5 }, params: { id:'1' }, query: {},
    body: {category:'Gold',symbol:'TEST',etfCategoryID:1,TransactionDate:'2026-11-05',
      Shares:1,PurchaseCost:10,SalePrice:12, isStockSplit:false }
  };
  const res = {
    status(s) { calls.push(['status',s]);this.statusCode=s;return this; },
    json(b) {calls.push(['json',b]);this.body=b;return this;}
  };
  return {routes,req,res,calls,context,state};
}
async function invoke(h,key) {
  const callback=h.routes.get(key);
  assert.equal(typeof callback,'function',`missing ${key}`);
  await callback(h.req,h.res);
  return h.res;
}

test('all ten target handlers retained; routes and method names unchanged', () => {
  const h=createHarness(Error('unused'));
  for(const [m,p] of TARGETS) assert.equal(typeof h.routes.get(`${m} ${p}`),'function');
});

test('all ten handlers preserve explicitly tagged validation message (be) as HTTP 400',async()=>{
  for(const [m,p] of TARGETS){
    const h=createHarness(null);
    h.state.error=vm.runInContext('etfClientError("Expected validation (be)")',h.context);
    await invoke(h,`${m} ${p}`);
    assert.equal(h.res.statusCode,400,`${m} ${p}`);
    assert.equal(h.res.body.message,'Expected validation (be)',`${m} ${p}`);
  }
});

test('all ten handlers sanitize unexpected backend-suffixed exceptions',async()=>{
  for(const [m,p] of TARGETS){
    const h=createHarness(Error('SYNTHETIC_INTERNAL_SECRET (be)'));
    await invoke(h,`${m} ${p}`);
    assert.equal(h.res.statusCode,500,`${m} ${p}`);
    assert.deepEqual(JSON.parse(JSON.stringify(h.res.body)),{message:'Server error (be)'},`${m} ${p}`);
  }
});

test('all ten handlers sanitize exceptions without message',async()=>{
  for(const [m,p] of TARGETS){
    const h=createHarness({code:'SYNTHETIC'});
    await invoke(h,`${m} ${p}`);
    assert.equal(h.res.statusCode,500,`${m} ${p}`);
    assert.equal(h.res.body.message,'Server error (be)');
  }
});

test('all ten error-handling guards use explicit typed classification',()=>{
  assert.equal((source.match(/if \(isEtfClientError\(err\)\) \{/g)||[]).length,10);
  assert.doesNotMatch(source,/err\.message\.endsWith\(["']\(be\)["']\)/);
  assert.equal((source.match(/throw etfClientError\(/g)||[]).length,23);
});

test('existing ETF duplicate-entry contract remains in buy and sell handlers',async()=>{
  for(const path of ['/activity/buy','/activity/sell']){
    const h=createHarness(Object.assign(Error('duplicate db detail'),{code:'ER_DUP_ENTRY'}));
    await invoke(h,`post ${path}`);
    assert.equal(h.res.statusCode,400);
    assert.equal(h.res.body.message,'Duplicate entry (be)');
  }
});

test('Polygon not-found remains a validation error; other upstream failures are not mislabeled',()=>{
  assert.match(source,/isEtfClientError\(err\) \|\| \(err && err\.response && err\.response\.status === 404\)/);
  assert.match(source,/logger\.error\(`Polygon validation error[^\n]+\n\s+throw err;/);
});

test('scope: ETF config and unrelated price/transaction logic unchanged from source comparison',()=>{
  const original=fs.readFileSync(path.join(__dirname,'..','REVIEW_etf.diff'),'utf8');
  assert.doesNotMatch(original,/^[+-][^+-].*(FINNHUB_API_KEY:|POLYGON_API_KEY:|TIINGO_API_KEY:)/m);
  assert.match(source,/router\.get\('\/config', auth/);
});
