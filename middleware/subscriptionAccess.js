const jwt = require('jsonwebtoken');
const { getAppAccess } = require('../services/subscriptionService');

function isAdminUser(user) {
    if (!user) return false;
    const adminUsername = String(process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const username = String(user.username || '').trim().toLowerCase();
    return Number(user.userId) === 1 || (adminUsername && username === adminUsername);
}

const auth = require('./auth');
function authenticateToken(req,res,next){return auth(req,res,()=>{if(req.user.client!=='web')return res.status(403).json({error:'WEB_SESSION_REQUIRED'});next();});}

function requireAppAccess(appKey) {
    return async (req, res, next) => {
        try {
            if (isAdminUser(req.user)) {
                req.subscriptionAccess = { allowed: true, reason: 'ADMIN_OVERRIDE', adminOverride: true };
                return next();
            }

            const access = await getAppAccess(req.user.userId, appKey);
            if (!access.allowed) {
                return res.status(403).json({
                    error: 'Subscription access denied.',
                    reason: access.reason,
                    app: access.app ? access.app.AppName : appKey
                });
            }
            req.subscriptionAccess = access;
            next();
        } catch (error) {
            next(error);
        }
    };
}

module.exports = { authenticateToken, requireAppAccess, isAdminUser };
