// WA-CF-001 focused offline test. Reads but never writes httpdocs/BinForm.html.
// Run from the WA project root: node .\tests\WA_CF_001_BinForm_Error_Offline.test.cjs
'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const source = fs.readFileSync('httpdocs/BinForm.html','utf8');
const start = source.indexOf('        async function apiFetch(path, options = {}) {');
const end = source.indexOf("        if ('serviceWorker' in navigator)", start);
assert(start >= 0 && end > start, 'apiFetch function location');
const functionText = source.slice(start, end);
const cases = [
  [{error:'Invalid field(be)'}, 'Invalid field'],
  [{error:{message:'Controlled nested message(be)',code:'E_VALIDATION'}}, 'Controlled nested message'],
  [{error:{code:'E_ONLY'}, message:'Fallback message(be)'}, 'Fallback message'],
  [{error:{code:'E_ONLY'}}, 'HTTP error 400'],
  [{message:'Top level message(be)'}, 'Top level message'],
  [null, 'HTTP error 400'],
];
(async () => {
  for (const [body, expected] of cases) {
    const context = {
      getToken: () => 'fixture-token', BASE_URL:'http://local.test',
      fetch: async (url, options) => {
        assert.equal(url, 'http://local.test/budget/in');
        assert.equal(options.headers.Authorization, 'Bearer fixture-token');
        return {ok:false,status:400,json:async()=>body};
      },
    };
    vm.createContext(context);
    vm.runInContext(functionText + '\nthis.apiFetch = apiFetch;',context);
    await assert.rejects(context.apiFetch('/budget/in'), e => e.message === expected);
    console.log('PASS',expected);
  }
  let sends = 0;
  const context = {getToken:()=> 'fixture-token', BASE_URL:'http://local.test', fetch:async (url,options)=>{
    sends++;
    assert.equal(options.method,'POST');
    assert.equal(options.body,'{"Amount":12}');
    return {ok:true,status:200,json:async()=>({message:'Saved(be)'})};
  }};
  vm.createContext(context);
  vm.runInContext(functionText + '\nthis.apiFetch = apiFetch;',context);
  const output=await context.apiFetch('/budget/in',{method:'POST',body:'{"Amount":12}'});
  assert.equal(output.message,'Saved(be)');
  assert.equal(sends,1,'no mutation replay');
  console.log('PASS successful mutation result; sent once');
  console.log('7/7 bounded isolated tests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
