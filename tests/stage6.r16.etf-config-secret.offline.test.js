'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const routeSource = fs.readFileSync(path.join(root, 'routes', 'etf.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'httpdocs', 'etfAPItest.html'), 'utf8');

function loadRoutes({ apiKey = 'SYNTHETIC_R16_SECRET', axiosGet = async () => ({ data: { c: 123.45 } }) } = {}) {
  const routes = [];
  const router = {};
  for (const method of ['get', 'post', 'put', 'delete']) {
    router[method] = (url, ...handlers) => { routes.push({ method, url, handlers }); return router; };
  }
  const axiosCalls = [];
  const logs = [];
  const axios = { get: async (...args) => { axiosCalls.push(args); return axiosGet(...args); } };
  const express = () => ({});
  express.Router = () => router;
  const sandbox = {
    require(moduleName) {
      if (moduleName === 'express') return express;
      if (moduleName === 'axios') return axios;
      if (moduleName === 'express-validator') return { body: () => ({ trim() {return this}, notEmpty(){return this}, isInt(){return this}, isFloat(){return this}, isDate(){return this}, optional(){return this}, isBoolean(){return this} }), param: () => ({isInt(){return this}}), query:()=>({}), validationResult:()=>({isEmpty:()=>true}) };
      if (moduleName === '../logger') return { error: (...s) => logs.push(s), warn:()=>{}, info:()=>{} };
      if (moduleName === '../dbConnection') return { getNextUserSpecificID:()=>{}, query:()=>{} };
      if (moduleName === '../utils') return { withTransaction:()=>{}, handleDbError:()=>{}, holidays:[] };
      if (moduleName === '../middleware/auth') return function requireUser(req,res,next) { if(next) next(); };
      throw new Error(`Unexpected dependency ${moduleName}`);
    },
    process: { env: { POLYGON_API_KEY: 'FAKE_POLYGON', FINNHUB_API_KEY: apiKey, TIINGO_API_KEY: 'FAKE_TIINGO' } },
    module: { exports: {} },
    console, Map, Set, WeakSet, Date, Number, String, Math
  };
  vm.runInNewContext(routeSource,sandbox,{ filename:'routes/etf.js', timeout:2000 });
  const pick = (url) => routes.find(x => x.method === 'get' && x.url === url);
  return { routes, pick, axiosCalls, logs };
}
function res() { return {statusCode:200, body:null, status(n){this.statusCode=n;return this;}, json(v){this.body=v;return this;}}; }
async function invoke(item, query={}) { assert.ok(item,'route registered'); const response=res(); await item.handlers.at(-1)({query,user:{userId:99}},response); return response; }

test('retired /config does not return any backend API key', async()=>{
  const rt=loadRoutes(); const r=await invoke(rt.pick('/config'));
  assert.equal(r.statusCode,410);
  assert.equal(JSON.stringify(r.body).includes('SYNTHETIC_R16_SECRET'),false);
  assert.equal(JSON.stringify(r.body).includes('FAKE_POLYGON'),false);
  assert.equal(JSON.stringify(r.body).includes('FAKE_TIINGO'),false);
});
test('retired /config and new /finnhub-quote retain authentication middleware',()=>{
  const rt=loadRoutes(); for(const url of ['/config','/finnhub-quote']) assert.equal(typeof rt.pick(url).handlers[0],'function');
});
test('valid quote is proxied and response contains price only, no credential',async()=>{
  const rt=loadRoutes(); const r=await invoke(rt.pick('/finnhub-quote'),{symbol:'SPY'});
  assert.equal(r.statusCode,200); assert.equal(r.body.price,123.45); assert.equal(r.body.adjPrice,null);
  assert.equal(Object.keys(r.body).sort().join(','),'adjPrice,price');
  assert.equal(rt.axiosCalls.length,1); assert.equal(rt.axiosCalls[0][1].params.symbol,'SPY');
  assert.equal(rt.axiosCalls[0][1].params.token,'SYNTHETIC_R16_SECRET');
  assert.ok(rt.axiosCalls[0][1].timeout>0);
});
test('invalid or missing symbol fails before any outbound provider request',async()=>{
  const rt=loadRoutes();
  for(const q of [{},{symbol:'../../secret'},{symbol:'SPY&token=bad'},{symbol:'x'.repeat(45)},{symbol:['SPY','QQQ']}]) {
    const r=await invoke(rt.pick('/finnhub-quote'),q);assert.equal(r.statusCode,400);assert.equal(r.body.message,'Invalid symbol (be)');
  }
  assert.equal(rt.axiosCalls.length,0);
});
test('missing server key gives safe service unavailable without external call',async()=>{
  const rt=loadRoutes({apiKey:''});const r=await invoke(rt.pick('/finnhub-quote'),{symbol:'SPY'});
  assert.equal(r.statusCode,503);assert.equal(r.body.message,'Quote service unavailable (be)'); assert.equal(rt.axiosCalls.length,0);
});
test('upstream failure does not disclose exception details or credentials',async()=>{
  const rt=loadRoutes({axiosGet:async()=>{throw new Error('SYNTHETIC_R16_SECRET_UPSTREAM');}});
  const r=await invoke(rt.pick('/finnhub-quote'),{symbol:'SPY'});
  assert.equal(r.statusCode,502);assert.equal(r.body.message,'Quote service unavailable (be)');
  assert.equal(JSON.stringify(rt.logs).includes('SYNTHETIC_R16_SECRET_UPSTREAM'),false);
});
test('no valid quote preserves browser Tiingo fallback eligibility',async()=>{
  const rt=loadRoutes({axiosGet:async()=>({data:{c:0}})});
  const r=await invoke(rt.pick('/finnhub-quote'),{symbol:'SPY'});
  assert.equal(r.statusCode,404);assert.equal(r.body.message,'No valid price from Finnhub (be)');
  assert.match(html,/catch \(err\) \{\s*console\.warn\('Finnhub today failed:', err\);\s*\/\/ fall back to Tiingo for today/);
});
test('frontend does not request config endpoint or expose provider key names',()=>{
  assert.doesNotMatch(html,/\/etf\/config|getApiKeys|FINNHUB_API_KEY|POLYGON_API_KEY|TIINGO_API_KEY/);
  assert.doesNotMatch(html,/https:\/\/finnhub\.io/);
});
test('frontend Finnhub uses authenticated backend proxy and retains response contract',()=>{
  assert.match(html,/async function fetchFinnhub\(symbol\)/);
  assert.match(html,/\$\{BASE_URL\}\/etf\/finnhub-quote\?symbol=\$\{encodeURIComponent\(symbol\)\}/);
  assert.match(html,/Authorization': `Bearer \$\{token\}`/);
  assert.match(html,/return \{ price: data\.price, adjPrice: null \}/);
  assert.match(html,/await fetchAllPrices\(sym\.symbol, listDate\)/);
});
test('Tiingo historic proxy and all original ETF routes remain in place',()=>{
  const rt=loadRoutes();const getUrls=rt.routes.map(x=>`${x.method} ${x.url}`);
  for(const url of ['get /tiingo-proxy','get /polygon-proxy','get /compare','get /activity/inventory','get /symbol','post /category']) assert.ok(getUrls.includes(url), url);
  assert.match(html,/\/etf\/tiingo-proxy/);
});
