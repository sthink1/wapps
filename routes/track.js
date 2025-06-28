// File: routes/track.js
const express = require('express');
const router = express.Router();
const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');

// Track page view
router.post('/log/page', auth, async (req, res) => {
    const { page } = req.body || {};
    const userId = req.user.userId;
    const sanitizedPage = page || 'unknown';
    try {
        await pool.query(
            'INSERT INTO TrackUsageT SET ?',
            { UserID: userId, Page: sanitizedPage, Action: 'View', Timestamp: new Date() }
        );
        res.status(200).json({ message: 'Page tracked' });
    } catch (error) {
        console.error('Error in /log/page:', error.message);
        res.status(500).json({ error: 'Tracking error' });
    }
});

// Track time spent
router.post('/log/time-spent', auth, async (req, res) => {
    const { page, duration } = req.body || {};
    const userId = req.user.userId;
    const sanitizedPage = page || 'unknown';
    const sanitizedDuration = duration !== undefined ? duration : 0;
    try {
        await pool.query(
            'INSERT INTO TrackUsageT SET ?',
            { UserID: userId, Page: sanitizedPage, Action: 'TimeSpent', Duration: sanitizedDuration, Timestamp: new Date() }
        );
        res.status(200).json({ message: 'Time spent tracked' });
    } catch (error) {
        console.error('Error in /log/time-spent:', error.message);
        res.status(500).json({ error: 'Tracking error' });
    }
});

// Fetch aggregated stats
router.get('/stats', auth, async (req, res) => {
    const queries = [
        'SELECT UserID, COUNT(*) as TotalViews FROM TrackUsageT WHERE Action = "View" GROUP BY UserID',
        // Normalize Page in the query for mostVisited
        `SELECT SUBSTRING_INDEX(Page, '/', -1) as Page, COUNT(*) as ViewCount 
         FROM TrackUsageT 
         WHERE Action = "View" 
         GROUP BY SUBSTRING_INDEX(Page, '/', -1) 
         ORDER BY ViewCount DESC LIMIT 5`,
        'SELECT UserID, AVG(Duration) as AvgTimeSpent FROM TrackUsageT WHERE Action = "TimeSpent" GROUP BY UserID',
        // Normalize Page in the query for totalTimeSpent
        `SELECT SUBSTRING_INDEX(Page, '/', -1) as Page, SUM(Duration) as TotalTimeSpent 
         FROM TrackUsageT 
         WHERE Action = "TimeSpent" 
         GROUP BY SUBSTRING_INDEX(Page, '/', -1) 
         ORDER BY TotalTimeSpent DESC`,
        'SELECT DATE(Timestamp) as Date, COUNT(*) as ActivityCount FROM TrackUsageT GROUP BY DATE(Timestamp)',
        'SELECT UserID, MAX(Timestamp) as LastActive FROM TrackUsageT GROUP BY UserID'
    ];

    try {
        const results = await Promise.all(
            queries.map(async (query) => {
                const [rows] = await pool.query(query);
                return rows;
            })
        );
        let [totalViews, mostVisited, avgTimeSpent, totalTimeSpent, activityOverTime, lastActive] = results;

        // Round avgTimeSpent to 2 decimal places
        avgTimeSpent = avgTimeSpent.map(row => ({
            UserID: row.UserID,
            AvgTimeSpent: row.AvgTimeSpent !== null ? Number(row.AvgTimeSpent).toFixed(2) : '0.00'
        }));

        const responseData = { totalViews, mostVisited, avgTimeSpent, totalTimeSpent, activityOverTime, lastActive };

        res.json(responseData);
    } catch (error) {
        console.error('Error in /stats:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;