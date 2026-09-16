const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getPreferences,
    updatePreferences,
    getUnsubscribeInfo,
    unsubscribeByToken
} = require('../services/notificationService');

router.get('/preferences', auth, async (req, res) => {
    try {
        const preferences = await getPreferences(req.user.userId);
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/preferences', auth, async (req, res) => {
    try {
        const allowed = ['marketingEmail', 'marketingSMS', 'familyTreeEmail', 'appNoticeEmail'];
        const updates = {};

        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
                if (typeof req.body[key] !== 'boolean') {
                    return res.status(400).json({ message: `${key} must be true or false.` });
                }
                updates[key] = req.body[key];
            }
        }

        const preferences = await updatePreferences(req.user.userId, updates);
        res.json({ message: 'Notification preferences saved.', preferences });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// Public endpoint used by unsubscribe.html. No login is required.
router.get('/unsubscribe/:token', async (req, res) => {
    try {
        const info = await getUnsubscribeInfo(req.params.token);
        if (!info) {
            return res.status(404).json({ message: 'This unsubscribe link is not valid.' });
        }

        const email = String(info.RecipientEmail || '');
        const at = email.indexOf('@');
        const maskedEmail = at > 0
            ? `${email.slice(0, 1)}***${email.slice(at)}`
            : email;

        res.json({
            category: info.NotificationCategory,
            channel: info.Channel,
            destination: info.Channel === 'EMAIL' ? maskedEmail : 'your phone number'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Public endpoint used by unsubscribe.html. No login is required.
router.post('/unsubscribe/:token', async (req, res) => {
    try {
        const result = await unsubscribeByToken(req.params.token);
        res.json({
            message: 'Notifications have been stopped for this category.',
            ...result
        });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

module.exports = router;
