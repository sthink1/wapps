'use strict';
// Stage 6: current database row AND current Render configuration must match.
const { pool } = require('../dbConnection');
function configuredAdministrator() {
  return String(process.env.ADMIN_USERNAME || '').trim().toLowerCase();
}
function usernameMatches(a, b) {
  return Boolean(a && b) && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}
async function getAdministratorStatus(user, database = pool) {
  const configuredUsername = configuredAdministrator();
  if (!user || !Number.isSafeInteger(Number(user.userId)) || Number(user.userId) < 1) {
    return { isAdmin: false, configuredUsername };
  }
  const [rows] = await database.query(
    'SELECT UserID, UserName, IsAdministrator FROM UsersT WHERE UserID=? LIMIT 1',
    [Number(user.userId)]
  );
  const current = rows[0] || null;
  return {
    isAdmin: Boolean(configuredUsername && current && Number(current.IsAdministrator) === 1 && usernameMatches(current.UserName, configuredUsername)),
    configuredUsername,
    username: current ? current.UserName : null,
    userId: current ? current.UserID : null,
    designated: Boolean(current && Number(current.IsAdministrator) === 1)
  };
}
async function isVerifiedAdministrator(user, database = pool) {
  return (await getAdministratorStatus(user, database)).isAdmin;
}
function webOnly(req, res, next) {
  if (!req.user || req.user.client !== 'web') return res.status(403).json({error:'WEB_SESSION_REQUIRED'});
  next();
}
async function requireAdministrator(req, res, next) {
  try {
    if (!(await isVerifiedAdministrator(req.user))) return res.status(403).json({error:'Administrator access required.'});
    next();
  } catch (_) { next(new Error('Administrator verification unavailable')); }
}
module.exports = { configuredAdministrator, usernameMatches, getAdministratorStatus, isVerifiedAdministrator, requireAdministrator, webOnly };
