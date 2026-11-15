'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const sourcePath = path.resolve(__dirname, '../server.js');
const helperPath = path.resolve(__dirname, '../services/stage6ExpectedClientError.js');
const source = fs.readFileSync(sourcePath,'utf8');
const helper = require(helperPath);
const marker = 'app.use((err, req, res, next) => {';
const begin = source.indexOf(marker);
const end = source.indexOf('\n});\n\n// Do not listen', begin);
assert.ok(begin >= 0 && end > begin, 'Cannot extract current central handler');
const handlerExpr = source.slice(begin + 'app.use('.length, end + 2).trim();
const logs = [];
const handler = vm.runInNewContext('(' + handlerExpr + ')', {
  logger:{error:m=>logs.push(String(m))},
  isExpectedClientError:helper.isExpectedClientError,
});
function invoke({path:requestPath,error}) {
  const headers={};
  let status=200,body=null,delegated=null;
  const res={headersSent:false,set(name,value){headers[name.toLowerCase()]=value; return this;},status(value){status=value;return this;},json(value){body=value;return this;}};
  handler(error,{path:requestPath},res,e=>{delegated=e;});
  return {status,body,headers,delegated};
}
const SECRET='SYNTHETIC_T06_PARSER_DIAGNOSTICS_DO_NOT_LEAK';
const parserKinds=[
  {name:'malformed JSON', error:Object.assign(new SyntaxError(SECRET+' invalid json'),{status:400,type:'entity.parse.failed'})},
  {name:'malformed URL-encoded body',error:Object.assign(new Error(SECRET+' malformed form'),{status:400,type:'entity.parse.failed'})},
  {name:'multipart parser error with status',error:Object.assign(new Error(SECRET+' malformed multipart'),{status:400,code:'LIMIT_UNEXPECTED_FILE'})},
  {name:'multipart parser error without status',error:Object.assign(new Error(SECRET+' malformed multipart no status'),{code:'LIMIT_UNEXPECTED_FILE'})},
];
test('T06-A: synthetic early parser errors are sanitized and no-store on sensitive API prefixes',()=>{
 for (const p of ['/users/login','/subscriptions/status','/admin-management/transfer','/budget/money','/familytree/persons','/etf/category','/tnna/update-email','/notifications/preferences']){
  for (const k of parserKinds) {
   const out=invoke({path:p,error:k.error});
   assert.equal(out.status,k.error.status||500,p+' '+k.name);
   assert.equal(out.body?.error?.message,k.error.status===400?'Request failed':'Internal Server Error',p+' '+k.name);
   assert.equal(out.headers['cache-control'],'no-store',p+' '+k.name);
   assert.ok(!JSON.stringify(out).includes(SECRET),p+' '+k.name);
   assert.equal(out.delegated,null);
  }
 }
 assert.ok(!logs.join('\n').includes(SECRET));
});
test('T06-B: generic/public paths do not acquire no-store from central handler',()=>{
 for(const p of ['/api/geocode','/send-email','/usersx/login','/','/assets/app.js']) {
  const out=invoke({path:p,error:parserKinds[0].error});
  assert.equal(out.status,400);
  assert.equal(out.body.error.message,'Request failed');
  assert.equal(out.headers['cache-control'],undefined,p);
 }
});
test('T06-C: parser middleware precedes route-scoped no-store; source wiring covered by central fallback',()=>{
 const idx=(s)=>source.indexOf(s);
 const json=idx('app.use(express.json());'), url=idx('app.use(express.urlencoded({ extended: true }));');
 const multipart=idx('const multipartNone = multer().none();');
 const route=idx("app.use('/users', (req, res, next) => {");
 assert.ok(json>=0 && url>json && multipart>url && route>multipart && begin>route);
 assert.match(source,/const requestPath = req && typeof req\.path === 'string' \? req\.path : ''/);
 assert.match(source,/requestPath\.startsWith\(`\$\{prefix\}\/`\)/);
});
