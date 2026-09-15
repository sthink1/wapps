const jwt = require('jsonwebtoken');
const { getAppAccess } = require('../services/subscriptionService');

function authenticateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired login token.' });
    }
}

function requireAppAccess(appKey) {
    return async (req, res, next) => {
        try {
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

module.exports = { authenticateToken, requireAppAccess };
