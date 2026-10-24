'use strict';
// A single row serializes per-account login, reset, refresh and password changes.
async function lock(c, userId) {
  const [rows] = await c.query('SELECT SecurityVersion FROM UserSecurityT WHERE UserID=? FOR UPDATE',[userId]);
  const version = rows.length===1 ? Number(rows[0].SecurityVersion) : 0;
  if (!Number.isSafeInteger(version) || version<1) { const e=Error('ACCOUNT_SECURITY_UNAVAILABLE'); e.status=401; throw e; }
  return version;
}
function matches(grantVersion,current) {return Number.isSafeInteger(Number(grantVersion)) && Number(grantVersion)>0 && Number(grantVersion)===current;}
module.exports={lock,matches};
