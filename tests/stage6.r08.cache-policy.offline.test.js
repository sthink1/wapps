'use strict';
// Stage 6 R08/R16: load actual server.js in a VM with inert substitutes.
// No server, database, HTTP requests, email, or project-file writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../server.js'), 'utf8');

const routes = new Map();
const userRoutes = function isolatedUsersRouter() {};
const fakeApp = {
  use(...args) { if (typeof args[0] === 'string') routes.set(args[0], args.slice(1)); },
  get() {}, post() {},
  listen() { throw new Error('FORBIDDEN: app.listen must never be called'); }
};
const noop = () => {};
const express = Object.assign(() => fakeApp, {
  json: () => noop, urlencoded: () => noop, static: () => noop
});
const db = {
  pool: new Proxy({}, {get() {throw Error('FORBIDDEN: database access');}}),
  // Never resolves; startup remains suspended before DB identity check/listen.
  ready: new Promise(() => {})
};
const files = {dotenv: {config: () => ({})}, './services/stage6Environment': { current: { mode: 'staging', allowedOrigins: ['https://wapps-stage6-test.onrender.com'] }, LEGACY_CORS_ORIGINS: [] },
  express, cors: () => noop, path,
  fs: {existsSync: () => true, mkdirSync() {throw Error('FORBIDDEN: mkdir');}},
  multer: () => ({none: () => noop}),
  './send_email': {sendEmail: () => {throw Error('FORBIDDEN: email');}},
  './morgan': noop,
  './logger': {info: noop, error: noop},
  './dbConnection': db,
  './services/passwordResetRateCleanup': {start() {throw Error('FORBIDDEN: cleanup');}},
  './middleware/subscriptionAccess': {authenticateToken: noop, requireAppAccess: () => noop},
  './middleware/usageActivity': () => noop,
  './routes/users': userRoutes,
  './routes/ftPrivacy': {publicRouter: noop, privateRouter: noop, protection: noop}
};
for (const name of ['weights','activities','weightActivities','track','interestEarned','etf','budget','familyTree','subscriptions','notifications','tnna','geocode','adminManagement']) {
  files['./routes/' + name] = noop;
}
const sandbox = {
  require(name) {assert.ok(Object.hasOwn(files, name), 'Unrecognized dependency: '+name);return files[name];},
  process: {env:{PORT:'8080'}, exitCode:0}, console: {log: noop, error: noop},
  __dirname: path.resolve(__dirname,'..'),
  setTimeout() { throw Error('FORBIDDEN: timer'); },
  module:{exports:{}}, exports:{}
};
vm.runInNewContext(source, sandbox, {filename:'server.js', timeout:3000});

const usersStack = routes.get('/users');
assert.ok(usersStack, '/users router must exist');
assert.equal(usersStack.length, 2, 'expected exactly cache middleware then unchanged /users router');
assert.equal(usersStack[1], userRoutes, 'original /users router must be retained');
assert.equal(typeof usersStack[0], 'function', 'no-store middleware must precede userRoutes');
const cacheMiddleware = usersStack[0];

let passed = 0;
function check(label, status, nextAction) {
  const calls = [], response = {
    statusCode: status,
    set(name,value) {calls.push([name,value]);return this;},
    status(n) {this.statusCode=n;return this;},
    json(body) {this.body=body;return this;}
  };
  let nextCount = 0;
  const request = {method:'GET', originalUrl:'/users/session-status'};
  cacheMiddleware(request,response,() => {
    nextCount++;
    nextAction(response);
  });
  assert.deepEqual(calls, [['Cache-Control','no-store']],label+' must set exactly no-store');
  assert.equal(nextCount,1,label+' must call next once');
  assert.equal(response.statusCode,status,label+' must preserve status');
  passed++;
  console.log('PASS '+label+': Cache-Control no-store, original response status preserved');
}
check('unauthenticated session-status 401',401,r=>r.status(401).json({error:'Access denied'}));
check('refresh wrong Origin 403',403,r=>r.status(403).json({error:'ORIGIN_NOT_ALLOWED'}));
check('refresh allowed Origin/no cookie 401',401,r=>r.status(401).json({error:'REFRESH_INVALID'}));
check('unauthenticated logout 401',401,r=>r.status(401).json({error:'Access denied'}));
check('authenticated session-status 200',200,r=>r.status(200).json({authenticated:true}));
check('successful logout 200',200,r=>r.status(200).json({message:'Logged out'}));
assert.ok(routes.has('/subscriptions'),'non-users route must remain');
assert.ok(routes.has('/weights'),'protected app route must remain');
passed++;
console.log('PASS unrelated route registration preserved; /users router identity preserved');
console.log('PASS '+passed+'/7 offline assertions; no listener, network, database, email, or project writes.');
console.log('LIMITATION: Response outcomes are simulated; this tests actual server.js middleware placement and behavior, not live Express/Render or all APIs.');
