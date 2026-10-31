'use strict';
// Read-only source-contract checks + isolated in-memory revokeAll unit test.
// No DB pool is opened, no HTTP requests/emails are made, no password is changed.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const root=path.resolve(__dirname,'..');
const users=fs.readFileSync(path.join(root,'routes','users.js'),'utf8');
const servicePath=path.join(root,'services','browserSession.js');
const sessions=fs.readFileSync(servicePath,'utf8');
let passed=0;
function check(label,fn){fn();console.log(`PASS ${String(++passed).padStart(2,'0')} ${label}`)}
function route(name,next){let s=users.indexOf(`router.post('/${name}'`);assert(s>=0,`Missing ${name}`);let e=next?users.indexOf(`router.post('/${next}'`,s+1):users.indexOf('module.exports = router;',s);assert(e>s);return users.slice(s,e)}
const change=route('change-password','forgot-password');
const forgot=route('forgot-password','reset-password');
const reset=route('reset-password');
check('Change Password requires authenticated website JWT and same-origin request',()=>{assert.match(change,/router\.post\('\/change-password',auth/);assert.match(change,/client\s*!==\s*'web'/);assert.match(change,/sessions\.requireOrigin\(req\)/)});
check('Change Password requires matching >=8 character new password',()=>{assert.match(change,/newPassword\.length<8/);assert.match(change,/newPassword!==confirmPassword/)});
check('Change Password checks current password and prevents reusing it',()=>{assert.match(change,/bcrypt\.compare\(currentPassword/);assert.match(change,/bcrypt\.compare\(newPassword/)});
check('Change Password updates password and invokes account-wide revocation before transaction commit',()=>{const a=change.indexOf('UPDATE UsersT SET PasswordHash'),b=change.indexOf('sessions.revokeAll(c,req.user.userId)'),c=change.indexOf('await c.commit()');assert(a>=0&&b>a&&c>b)});
check('Change Password has a rollback path and confirmation email',()=>{assert.match(change,/await c\.rollback\(\)/);assert.match(change,/sendPasswordChangedNotice/)});
check('Forgot Password requires origin and generic reply',()=>{assert.match(forgot,/sessions\.requireOrigin\(req\)/);assert.match(forgot,/GENERIC_RESET_MESSAGE/);assert.match(users,/If an account matches, password reset instructions will be sent/)});
check('Forgot Password generates unpredictable secret and stores only its hash',()=>{assert.match(forgot,/randomBytes\(48\)/);assert.match(forgot,/resetHash\(secret\)/);assert.doesNotMatch(forgot,/TokenHash[^\n]*mail\.secret/)});
check('Forgot Password revokes previous unconsumed links and sets 30-minute expiry',()=>{assert.match(forgot,/UPDATE PasswordResetT SET RevokedAt/);assert.match(forgot,/INTERVAL 30 MINUTE/)});
check('Reset Password enforces token shape, new password length, and confirmation',()=>{assert.match(reset,/\[0-9a-f\]\{96\}/);assert.match(reset,/newPassword\.length<8/);assert.match(reset,/newPassword!==confirmPassword/)});
check('Reset Password requires unused, unrevoked, unexpired token under row lock',()=>{assert.match(reset,/p\.UsedAt IS NULL/);assert.match(reset,/p\.RevokedAt IS NULL/);assert.match(reset,/p\.ExpiresAt>UTC_TIMESTAMP\(\)/);assert.match(reset,/FOR UPDATE/)});
check('Reset Password consumes link, revokes remaining links, and revokes credentials before commit',()=>{const a=reset.indexOf('SET UsedAt=UTC_TIMESTAMP()'),b=reset.indexOf('SET RevokedAt=UTC_TIMESTAMP()'),c=reset.indexOf('sessions.revokeAll(c,row.UserID)'),d=reset.indexOf('await c.commit()');assert(a>=0&&b>a&&c>b&&d>c)});
check('Password reset uses transactional rollback and sends change confirmation',()=>{assert.match(reset,/await c\.rollback\(\)/);assert.match(reset,/sendPasswordChangedNotice/)});
check('Account-wide revocation targets web sessions, TNNA refresh tokens, and SecurityVersion',()=>{assert.match(sessions,/UPDATE WebSessionT SET RevokedAt/);assert.match(sessions,/UPDATE TNNARefreshTokenT SET RevokedAt/);assert.match(sessions,/SecurityVersion=SecurityVersion\+1/)});
check('Forgot Password uses database-backed shared limiter and credential-version fence',()=>{assert.match(users,/passwordResetLimiter/);assert.match(forgot,/resetLimiter\.allow\(c,email/);assert.match(forgot,/fence\.lock\(c,candidate\[0\]\.UserID\)/);assert.match(forgot,/INSERT INTO PasswordResetT[^\n]*SecurityVersion/)});
(async()=>{
  // Dynamically exercise just revokeAll with an in-memory, SQL-recording adapter.
  // Replace JWT module only during module loading. No real database dependency.
  const prior=Module._load;
  Module._load=function(request,parent,isMain){if(request==='jsonwebtoken')return {sign(){throw Error('No signing in isolated test')}};return prior.apply(this,arguments)};
  let lib;try{lib=require(servicePath)}finally{Module._load=prior}
  const observed=[];
  const fake={async query(sql,args){observed.push({sql,args});return [{affectedRows:1}]}};
  await lib.revokeAll(fake,62);
  check('Isolated revokeAll executes exactly three account-scoped SQL commands',()=>{assert.equal(observed.length,3);assert(observed.every(x=>x.args.length===1&&x.args[0]===62));assert.match(observed[0].sql,/WebSessionT/);assert.match(observed[1].sql,/TNNARefreshTokenT/);assert.match(observed[2].sql,/UserSecurityT/)});
  console.log(`Stage 6A password-security source/unit checks passed (${passed} groups; NO database writes, NO email, NO password change).`);
  console.log('NOT validated: live HTTP/password transactions, database rollback, actual email delivery, reset-link lifecycle, real TNNA JWT invalidation.');
})().catch(e=>{console.error('FAILED isolated revocation unit test:',e);process.exitCode=1});
