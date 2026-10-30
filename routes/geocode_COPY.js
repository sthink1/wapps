const express = require('express');
const router = express.Router();

/**
 * Reverse geocoding proxy for Nominatim
 * - Firefox-safe
 * - Rate-limit friendly
 * - Compliant with OSM policy
 */
router.get('/reverse', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'lat and lon are required' });
    }

    try {
        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${lat}&lon=${lon}&format=json`;

        const response = await fetch(url, {
            headers: {
                // REQUIRED by Nominatim policy
                'User-Agent': 'WonderfulApps/1.0 (contact@wonderfulapps.com)',
                'Accept': 'application/json'
            },
            timeout: 8000
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Geocoding service error'
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        console.error('Nominatim proxy error:', err);
        res.status(500).json({ error: 'Reverse geocoding failed' });
    }
});

module.exports = router;
