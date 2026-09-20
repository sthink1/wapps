const express = require('express');
const router = express.Router();
const { authenticateToken, isAdminUser } = require('../middleware/subscriptionAccess');
const {
    getStatusWithApps,
    redeemPromoCode,
    getAppAccess,
    recordUsage,
    listAdminPromoCodes,
    createAdminPromoCode,
    updateAdminPromoCode,
    getAdminUserSubscription,
    grantAdminFreeUsage
} = require('../services/subscriptionService');

router.use(authenticateToken);

function requireAdmin(req, res, next) {
    if (!isAdminUser(req.user)) {
        return res.status(403).json({ error: 'Administrator access is required.' });
    }
    next();
}

router.get('/status', async (req, res, next) => {
    try {
        res.json(await getStatusWithApps(req.user.userId, isAdminUser(req.user)));
    } catch (error) {
        next(error);
    }
});

router.get('/access/:appKey', async (req, res, next) => {
    try {
        const result = await getAppAccess(req.user.userId, req.params.appKey, isAdminUser(req.user));
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

router.get('/admin/promos', requireAdmin, async (req, res, next) => {
    try {
        res.json(await listAdminPromoCodes());
    } catch (error) {
        next(error);
    }
});

router.post('/admin/promos', requireAdmin, async (req, res, next) => {
    try {
        const result = await createAdminPromoCode(req.body || {});
        res.status(201).json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
});

router.put('/admin/promos/:promoCodeId', requireAdmin, async (req, res, next) => {
    try {
        const result = await updateAdminPromoCode(req.params.promoCodeId, req.body || {});
        res.json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
});

router.get('/admin/user/:userId', requireAdmin, async (req, res, next) => {
    try {
        res.json(await getAdminUserSubscription(req.params.userId));
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
});

router.post('/admin/grant', requireAdmin, async (req, res, next) => {
    try {
        const { userId, planId, endDate } = req.body || {};
        const result = await grantAdminFreeUsage(userId, planId, endDate, req.user.userId);
        res.json(result);
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        next(error);
    }
});

module.exports = router;
