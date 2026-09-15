const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/subscriptionAccess');
const {
    getStatusWithApps,
    redeemPromoCode,
    getAppAccess,
    recordUsage
} = require('../services/subscriptionService');

router.use(authenticateToken);

router.get('/status', async (req, res, next) => {
    try {
        res.json(await getStatusWithApps(req.user.userId));
    } catch (error) {
        next(error);
    }
});

router.get('/access/:appKey', async (req, res, next) => {
    try {
        const result = await getAppAccess(req.user.userId, req.params.appKey);
        res.status(result.allowed ? 200 : 403).json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/promo', async (req, res, next) => {
    try {
        const result = await redeemPromoCode(req.user.userId, req.body.code);
        res.json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
});

router.post('/usage', async (req, res, next) => {
    try {
        const { appKey, eventType, quantity, detail } = req.body;
        await recordUsage(req.user.userId, appKey, eventType, quantity, detail);
        res.status(201).json({ message: 'Usage recorded.' });
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
});

module.exports = router;
