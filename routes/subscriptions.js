const express = require('express');
const router = express.Router();
const { isExpectedClientError } = require('../services/stage6ExpectedClientError');
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
    getAdminBaseSubscription,
    updateAdminBaseSubscription,
    listAdminPromoRedemptions,
} = require('../services/subscriptionService');

router.use(authenticateToken);

async function requireAdmin(req, res, next) {
    try {
        if (!(await isAdminUser(req.user))) {
            return res.status(403).json({ error: 'Administrator access is required.' });
        }
        next();
    } catch (error) { next(error); }
}

router.get('/status', async (req, res, next) => {
    try {
        res.json(await getStatusWithApps(req.user.userId, await isAdminUser(req.user)));
    } catch (error) {
        next(error);
    }
});

router.get('/access/:appKey', async (req, res, next) => {
    try {
        const result = await getAppAccess(req.user.userId, req.params.appKey, await isAdminUser(req.user));
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
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            // Central handler preserves 4xx messages; replace an untrusted one first.
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
        next(error);
    }
});

router.post('/usage', async (req, res, next) => {
    try {
        const { appKey, eventType, quantity, detail } = req.body;
        await recordUsage(req.user.userId, appKey, eventType, quantity, detail);
        res.status(201).json({ message: 'Usage recorded.' });
    } catch (error) {
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            // Central handler preserves 4xx messages; replace an untrusted one first.
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
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
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            // Central handler preserves 4xx messages; replace an untrusted one first.
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
        next(error);
    }
});

router.put('/admin/promos/:promoCodeId', requireAdmin, async (req, res, next) => {
    try {
        const result = await updateAdminPromoCode(req.params.promoCodeId, req.body || {});
        res.json(result);
    } catch (error) {
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            // Central handler preserves 4xx messages; replace an untrusted one first.
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
        next(error);
    }
});

router.get('/admin/user/:userId', requireAdmin, async (req, res, next) => {
    try {
        res.json(await getAdminUserSubscription(req.params.userId));
    } catch (error) {
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            // Central handler preserves 4xx messages; replace an untrusted one first.
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
        next(error);
    }
});



// Stage 2D: direct administration of the underlying subscription row.
router.get('/admin/user/:userId/subscription', requireAdmin, async (req, res, next) => {
    try {
        res.json(await getAdminBaseSubscription(req.params.userId));
    } catch (error) {
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
        next(error);
    }
});

router.put('/admin/user/:userId/subscription', requireAdmin, async (req, res, next) => {
    try {
        res.json(await updateAdminBaseSubscription(req.params.userId, req.body));
    } catch (error) {
        if (Number.isInteger(error && error.status) && error.status >= 400 && error.status < 500) {
            if (isExpectedClientError(error)) return res.status(error.status).json({ error: error.message });
            return next(Object.assign(new Error('Request failed'), { status: error.status }));
        }
        next(error);
    }
});

router.get('/admin/promo-redemptions', requireAdmin, async (req, res, next) => {
    try {
        res.json(await listAdminPromoRedemptions());
    } catch (error) {
        next(error);
    }
});

module.exports = router;
