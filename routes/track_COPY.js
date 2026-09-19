// File: routes/track.js
const express = require('express');
const router = express.Router();
const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');

function isAdminUser(user) {
    if (!user) return false;
    const adminUsername = String(process.env.ADMIN_USERNAME || '').trim().toLowerCase();
    const username = String(user.username || '').trim().toLowerCase();
    return Number(user.userId) === 1 || (adminUsername && username === adminUsername);
}

function requireAdmin(req, res, next) {
    if (!isAdminUser(req.user)) {
        return res.status(403).json({ error: 'Administrator access required.' });
    }
    next();
}

function normalizePeriod(value) {
    return ['today', '7', '30', 'all'].includes(String(value)) ? String(value) : '30';
}

function dateClause(period, columnName) {
    switch (normalizePeriod(period)) {
        case 'today':
            return `${columnName} >= CURDATE()`;
        case '7':
            return `${columnName} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        case '30':
            return `${columnName} >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
        default:
            return '1=1';
    }
}

function pageToAppKeySql(pageExpression) {
    return `CASE
        WHEN ${pageExpression} = 'FamilyTree.html' OR ${pageExpression} LIKE 'FT%.html' THEN 'family_tree'
        WHEN ${pageExpression} IN ('weighIn.html', 'Weights.html', 'Activities.html') THEN 'weigh_in'
        WHEN ${pageExpression} = 'amortization.html' THEN 'loan_payment'
        WHEN ${pageExpression} = 'propertyInfo.html' THEN 'property_info'
        WHEN ${pageExpression} = 'InterestEarned.html' THEN 'interest_earned'
        WHEN ${pageExpression} = 'TownNotice.html' THEN 'town_notice'
        WHEN ${pageExpression} LIKE 'etf%.html' THEN 'etf_investing'
        WHEN ${pageExpression} = 'budget.html' OR ${pageExpression} LIKE 'B%.html' THEN 'budget'
        ELSE NULL
    END`;
}

function toNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function laterDate(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a) >= new Date(b) ? a : b;
}

async function loadAppUsage(period, userId = null) {
    const normalizedPeriod = normalizePeriod(period);
    const usageWhere = dateClause(normalizedPeriod, 'uu.OccurredAt');
    const trackWhere = dateClause(normalizedPeriod, 'tu.Timestamp');
    const userUsageFilter = userId ? ' AND uu.UserID = ?' : '';
    const trackUserFilter = userId ? ' AND tu.UserID = ?' : '';
    const usageParams = userId ? [userId] : [];
    const trackParams = userId ? [userId] : [];

    const [apps] = await pool.query(
        `SELECT AppID, AppKey, AppName
           FROM AppT
          WHERE Active = 1
          ORDER BY AppID`
    );

    const [usageRows] = await pool.query(
        `SELECT a.AppID,
                a.AppKey,
                a.AppName,
                SUM(CASE WHEN uu.EventType = 'APP_OPEN' THEN uu.Quantity ELSE 0 END) AS Sessions,
                COUNT(DISTINCT CASE WHEN uu.EventType = 'APP_OPEN' THEN uu.UserID ELSE NULL END) AS ActiveUsers,
                SUM(CASE WHEN uu.EventType = 'API_CALL' THEN uu.Quantity ELSE 0 END) AS RequestsActions,
                SUM(CASE WHEN uu.EventType IN ('RECORD_CREATE', 'RECORD_UPDATE', 'RECORD_DELETE') THEN uu.Quantity ELSE 0 END) AS DataActivity,
                SUM(CASE WHEN uu.EventType = 'EMAIL_SENT' THEN uu.Quantity ELSE 0 END) AS EmailActivity,
                SUM(CASE WHEN uu.EventType = 'FILE_UPLOAD' THEN uu.Quantity ELSE 0 END) AS StorageActivity,
                MAX(uu.OccurredAt) AS LastUsage
           FROM AppT a
           LEFT JOIN UserUsageT uu
             ON uu.AppID = a.AppID
            AND ${usageWhere}${userUsageFilter}
          WHERE a.Active = 1
          GROUP BY a.AppID, a.AppKey, a.AppName
          ORDER BY a.AppID`,
        usageParams
    );

    const normalizedPage = `SUBSTRING_INDEX(tu.Page, '/', -1)`;
    const appKeyCase = pageToAppKeySql(normalizedPage);
    const [trackRows] = await pool.query(
        `SELECT ${appKeyCase} AS AppKey,
                SUM(CASE WHEN tu.Action = 'View' THEN 1 ELSE 0 END) AS Visits,
                SUM(CASE WHEN tu.Action = 'TimeSpent' THEN COALESCE(tu.Duration, 0) ELSE 0 END) AS TotalSeconds,
                AVG(CASE WHEN tu.Action = 'TimeSpent' THEN tu.Duration ELSE NULL END) AS AvgSeconds,
                MAX(tu.Timestamp) AS LastTrack
           FROM TrackUsageT tu
          WHERE ${trackWhere}${trackUserFilter}
          GROUP BY ${appKeyCase}
         HAVING AppKey IS NOT NULL`,
        trackParams
    );

    const usageMap = new Map(usageRows.map(row => [row.AppKey, row]));
    const trackMap = new Map(trackRows.map(row => [row.AppKey, row]));

    return apps.map(app => {
        const usage = usageMap.get(app.AppKey) || {};
        const track = trackMap.get(app.AppKey) || {};
        return {
            appId: app.AppID,
            appKey: app.AppKey,
            appName: app.AppName,
            visits: toNumber(track.Visits),
            activeUsers: toNumber(usage.ActiveUsers),
            sessions: toNumber(usage.Sessions),
            totalSeconds: toNumber(track.TotalSeconds),
            averageSessionSeconds: toNumber(usage.Sessions) > 0
                ? toNumber(track.TotalSeconds) / toNumber(usage.Sessions)
                : 0,
            requestsActions: toNumber(usage.RequestsActions),
            dataActivity: toNumber(usage.DataActivity),
            emailActivity: toNumber(usage.EmailActivity),
            storageActivity: toNumber(usage.StorageActivity),
            lastUsed: laterDate(usage.LastUsage, track.LastTrack)
        };
    });
}

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

// App-centered usage matrix for the administrator dashboard.
router.get('/app-usage', auth, requireAdmin, async (req, res) => {
    try {
        const period = normalizePeriod(req.query.period);
        const apps = await loadAppUsage(period);
        res.json({ period, apps });
    } catch (error) {
        console.error('Error in /app-usage:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Users available for the User Usage drill-down.
router.get('/users', auth, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT u.UserID, u.UserName
               FROM UsersT u
               JOIN (
                    SELECT UserID FROM UserUsageT
                    UNION
                    SELECT UserID FROM TrackUsageT
               ) x ON x.UserID = u.UserID
              ORDER BY u.UserName, u.UserID`
        );
        res.json({ users: rows });
    } catch (error) {
        console.error('Error in /users:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Same usage categories, filtered to one selected user.
router.get('/user-usage', auth, requireAdmin, async (req, res) => {
    const userId = Number(req.query.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'A valid userId is required.' });
    }

    try {
        const period = normalizePeriod(req.query.period);
        const apps = await loadAppUsage(period, userId);
        const [[user]] = await pool.query(
            'SELECT UserID, UserName FROM UsersT WHERE UserID = ? LIMIT 1',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ period, user, apps });
    } catch (error) {
        console.error('Error in /user-usage:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Preserve the existing endpoint for compatibility with any older callers.
router.get('/stats', auth, requireAdmin, async (req, res) => {
    const queries = [
        'SELECT UserID, COUNT(*) as TotalViews FROM TrackUsageT WHERE Action = "View" GROUP BY UserID',
        `SELECT SUBSTRING_INDEX(Page, '/', -1) as Page, COUNT(*) as ViewCount
           FROM TrackUsageT
          WHERE Action = "View"
          GROUP BY SUBSTRING_INDEX(Page, '/', -1)
          ORDER BY ViewCount DESC LIMIT 5`,
        'SELECT UserID, AVG(Duration) as AvgTimeSpent FROM TrackUsageT WHERE Action = "TimeSpent" GROUP BY UserID',
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
            queries.map(async query => {
                const [rows] = await pool.query(query);
                return rows;
            })
        );
        let [totalViews, mostVisited, avgTimeSpent, totalTimeSpent, activityOverTime, lastActive] = results;
        avgTimeSpent = avgTimeSpent.map(row => ({
            UserID: row.UserID,
            AvgTimeSpent: row.AvgTimeSpent !== null ? Number(row.AvgTimeSpent).toFixed(2) : '0.00'
        }));
        res.json({ totalViews, mostVisited, avgTimeSpent, totalTimeSpent, activityOverTime, lastActive });
    } catch (error) {
        console.error('Error in /stats:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
