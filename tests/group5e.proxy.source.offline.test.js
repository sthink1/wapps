'use strict';
// Read-only audit of existing source. No HTTP listener, database, or external calls.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const server=read('server.js');
const users=read('routes/users.js');
const limiter=read('services/passwordResetLimiter.js');
test('password-reset endpoint uses req.ip (source audit)',()=>assert.match(users,/resetLimiter\.allow\s*\(\s*c\s*,\s*email\s*,\s*req\.ip/));
test('rate limiter has separate IP/email/global buckets',()=>{
  for(const scope of ['global','email','ip']) assert.match(limiter,new RegExp("type:'"+scope+"'"));
});
test('limits are 5 email, 20 IP and 100 global',()=>{
  assert.match(limiter,/EMAIL_LIMIT\s*=\s*5\s*;/);
  assert.match(limiter,/IP_LIMIT\s*=\s*20\s*;/);
  assert.match(limiter,/GLOBAL_LIMIT\s*=\s*100\s*;/);
});
test('source contains no explicit trust proxy override',()=>{
  // A result here describes reviewed source, not Render's true forwarding topology.
  assert.doesNotMatch(server,/(?:app|server)\.set\s*\(\s*['"`]trust proxy['"`]/);
});
test('source does not expose a diagnostic IP endpoint',()=>{
  assert.doesNotMatch(server,/app\.(?:get|post)\s*\(\s*['"`]\/_stage6_proxy_probe/);
});
