'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const Module=require('node:module');
const originalLoad=Module._load;
Module._load=function(id,parent,isMain){if(id==='./stage6Environment' && parent?.filename.endsWith('passwordResetClientIp.js'))return {current:{mode:'staging',publicOrigin:'https://wapps-stage6-test.onrender.com'}};return originalLoad.apply(this,arguments)};
let functions;try{functions=require('../services/passwordResetClientIp')}finally{Module._load=originalLoad}
const {singleIP,trustedCfEnabled,clientIpForReset}=functions;
const flags={WA_TRUST_RENDER_CF_IP:'1'};
const req=(cf,peer='10.20.30.40')=>({socket:{remoteAddress:peer},get:k=>k==='CF-Connecting-IP'?cf:null,headers:{'x-forwarded-for':'198.51.100.77'}});
test('only proper unadorned IP literals pass',()=>{
 for(const val of ['192.0.2.4','2001:db8::1','::ffff:192.0.2.4'])assert(singleIP(val));
 for(const val of ['',' 192.0.2.4','192.0.2.4, 1.2.3.4','[2001:db8::1]','not-an-ip','192.0.2.4:8080'])assert.equal(singleIP(val),null);
});
test('disabled by default, never uses forwarded info',()=>{
 assert.equal(trustedCfEnabled({}),false);
 assert.equal(clientIpForReset(req('203.0.113.5'),{}),'10.20.30.40');
});
test('explicit staging opt-in can select a well formed CF address',()=>{
 assert.equal(trustedCfEnabled(flags),true);
 assert.equal(clientIpForReset(req('203.0.113.5'),flags),'203.0.113.5');
});
test('malformed or missing CF header falls back to peer',()=>{
 for(const h of [undefined,'garbage','203.0.113.5, 198.51.100.77',' 203.0.113.5'])
   assert.equal(clientIpForReset(req(h),flags),'10.20.30.40');
});
test('spoofed XFF is ignored by resolver',()=>{
 assert.equal(clientIpForReset(req('203.0.113.5'),flags),'203.0.113.5');
});
test('peer is used if CF header invalid, never arbitrary XFF',()=>{
 assert.equal(clientIpForReset(req('bad','::ffff:10.0.0.7'),flags),'::ffff:10.0.0.7');
});
