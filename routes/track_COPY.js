// File: routes/track.js
const express = require('express');
const router = express.Router();
const { pool } = require('../dbConnection');
const auth = require('../middleware/auth');
const { getStorageStats } = require('../r2Storage');

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


const FREE_TIER_LIMITS = {
    databaseBytes: 5 * 1024 * 1024,
    resendDailyEmails: 100,
    resendMonthlyEmails: 3000,
    renderMonthlyHours: 750,
    r2StorageBytes: 10 * 1024 * 1024 * 1024,
    r2ClassAMonthly: 1000000,
    r2ClassBMonthly: 10000000
};

const PRICING_REVIEWED = '2026-09-19';

const NEXT_PAID_LEVELS = {
    database: {
        level: '100 MB database',
        cost: '$19'
    },
    resend: {
        level: 'Pro — 50,000 emails/month; no daily limit',
        cost: '$20/month'
    },
    render: {
        level: '0.5c-512mb (Starter) — 0.5 CPU, 512 MB RAM',
        cost: '$7/month'
    },
    r2Storage: {
        level: 'Standard usage above free allowance',
        cost: '$0.015/GB-month'
    },
    r2ClassA: {
        level: 'Standard usage above free allowance',
        cost: '$4.50/million operations'
    },
    r2ClassB: {
        level: 'Standard usage above free allowance',
        cost: '$0.36/million operations'
    },
    r2Egress: {
        level: 'No upgrade needed',
        cost: 'Free'
    }
};

function percentageStatus(percentUsed) {
    if (percentUsed === null || percentUsed === undefined || !Number.isFinite(percentUsed)) {
        return 'provider';
    }
    if (percentUsed >= 85) return 'warning';
    if (percentUsed >= 70) return 'caution';
    return 'ok';
}

function buildNumericTierRow({
    id,
    service,
    resource,
    unit,
    currentValue,
    limitValue,
    source,
    note = '',
    nextPaidLevel = '—',
    nextPaidCost = '—'
}) {
    const current = toNumber(currentValue);
    const limit = toNumber(limitValue);
    const percentUsed = limit > 0 ? (current / limit) * 100 : null;
    return {
        id,
        service,
        resource,
        unit,
        currentValue: current,
        limitValue: limit,
        percentUsed,
        remainingValue: limit > 0 ? Math.max(limit - current, 0) : null,
        status: percentageStatus(percentUsed),
        source,
        note,
        nextPaidLevel,
        nextPaidCost
    };
}

function buildProviderTierRow({
    id,
    service,
    resource,
    unit,
    limitValue = null,
    limitLabel = null,
    status = 'provider',
    note = '',
    nextPaidLevel = '—',
    nextPaidCost = '—'
}) {
    return {
        id,
        service,
        resource,
        unit,
        currentValue: null,
        limitValue,
        limitLabel,
        percentUsed: null,
        remainingValue: null,
        status,
        source: 'Provider dashboard',
        note,
        nextPaidLevel,
        nextPaidCost
    };
}

function datePartsInTimeZone(date, timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value])
    );

    return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day)
    };
}

function ymdFromParts(parts) {
    return [
        String(parts.year).padStart(4, '0'),
        String(parts.month).padStart(2, '0'),
        String(parts.day).padStart(2, '0')
    ].join('-');
}

function addCalendarDays(parts, days) {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate()
    };
}

async function loadDatabaseSizeBytes() {
    try {
        const [[row]] = await pool.query(
            `SELECT COALESCE(SUM(DATA_LENGTH + INDEX_LENGTH), 0) AS TotalBytes
               FROM information_schema.TABLES
              WHERE TABLE_SCHEMA = DATABASE()`
        );
        return toNumber(row && row.TotalBytes);
    } catch (error) {
        const [rows] = await pool.query('SHOW TABLE STATUS');
        return rows.reduce((sum, row) => {
            return sum + toNumber(row.Data_length) + toNumber(row.Index_length);
        }, 0);
    }
}

async function loadResendSentCounts() {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured.');
    }

    const timeZone = process.env.APP_TIMEZONE || 'America/New_York';
    const todayParts = datePartsInTimeZone(new Date(), timeZone);
    const today = ymdFromParts(todayParts);
    const tomorrow = ymdFromParts(addCalendarDays(todayParts, 1));
    const monthStart = `${today.slice(0, 7)}-01`;

    async function fetchMetrics(startDate, endDate) {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            timezone: timeZone,
            metrics: 'sent'
        });

        const response = await fetch(`https://api.resend.com/emails/metrics?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                Accept: 'application/json'
            }
        });

        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            const message = data && (data.message || data.error)
                ? (data.message || data.error)
                : `Resend returned HTTP ${response.status}.`;
            throw new Error(message);
        }

        return data;
    }

    const [dailyMetrics, monthlyMetrics] = await Promise.all([
        fetchMetrics(today, tomorrow),
        fetchMetrics(monthStart, tomorrow)
    ]);

    return {
        today: toNumber(dailyMetrics && dailyMetrics.totals && dailyMetrics.totals.sent),
        month: toNumber(monthlyMetrics && monthlyMetrics.totals && monthlyMetrics.totals.sent),
        timeZone
    };
}

async function loadFreeTierUsage() {
    const rows = [];

    try {
        const databaseBytes = await loadDatabaseSizeBytes();
        rows.push(buildNumericTierRow({
            id: 'database-size',
            service: 'FreeSQLdatabase',
            resource: 'Database size',
            unit: 'bytes',
            currentValue: databaseBytes,
            limitValue: FREE_TIER_LIMITS.databaseBytes,
            source: 'Automatic',
            note: 'Current MySQL data plus index size compared with the 5 MB database limit.',
            nextPaidLevel: NEXT_PAID_LEVELS.database.level,
            nextPaidCost: NEXT_PAID_LEVELS.database.cost
        }));
    } catch (error) {
        rows.push({
            ...buildProviderTierRow({
                id: 'database-size',
                service: 'FreeSQLdatabase',
                resource: 'Database size',
                unit: 'bytes',
                limitValue: FREE_TIER_LIMITS.databaseBytes,
                status: 'unavailable',
                note: `Automatic database-size query failed: ${error.message}`,
                nextPaidLevel: NEXT_PAID_LEVELS.database.level,
                nextPaidCost: NEXT_PAID_LEVELS.database.cost
            }),
            source: 'Unavailable'
        });
    }

    try {
        const resendCounts = await loadResendSentCounts();
        rows.push(buildNumericTierRow({
            id: 'resend-today',
            service: 'Resend',
            resource: 'Emails sent today',
            unit: 'emails',
            currentValue: resendCounts.today,
            limitValue: FREE_TIER_LIMITS.resendDailyEmails,
            source: 'Resend API',
            note: `Resend-reported sent volume using ${resendCounts.timeZone}.`,
            nextPaidLevel: NEXT_PAID_LEVELS.resend.level,
            nextPaidCost: NEXT_PAID_LEVELS.resend.cost
        }));
        rows.push(buildNumericTierRow({
            id: 'resend-month',
            service: 'Resend',
            resource: 'Emails sent this month',
            unit: 'emails',
            currentValue: resendCounts.month,
            limitValue: FREE_TIER_LIMITS.resendMonthlyEmails,
            source: 'Resend API',
            note: 'Calendar-month sent volume reported directly by Resend.',
            nextPaidLevel: NEXT_PAID_LEVELS.resend.level,
            nextPaidCost: NEXT_PAID_LEVELS.resend.cost
        }));
    } catch (error) {
        const resendUnavailable = [
            ['resend-today', 'Emails sent today', FREE_TIER_LIMITS.resendDailyEmails],
            ['resend-month', 'Emails sent this month', FREE_TIER_LIMITS.resendMonthlyEmails]
        ];
        resendUnavailable.forEach(([id, resource, limitValue]) => {
            rows.push({
                ...buildProviderTierRow({
                    id,
                    service: 'Resend',
                    resource,
                    unit: 'emails',
                    limitValue,
                    status: 'unavailable',
                    note: `Resend metrics are temporarily unavailable: ${error.message}`,
                    nextPaidLevel: NEXT_PAID_LEVELS.resend.level,
                    nextPaidCost: NEXT_PAID_LEVELS.resend.cost
                }),
                source: 'Unavailable'
            });
        });
    }

    rows.push(buildProviderTierRow({
        id: 'render-hours',
        service: 'Render',
        resource: 'Free instance hours this month',
        unit: 'hours',
        limitValue: FREE_TIER_LIMITS.renderMonthlyHours,
        note: 'Current Render instance-hour usage is not available to WA without Render account/API usage data.',
        nextPaidLevel: NEXT_PAID_LEVELS.render.level,
        nextPaidCost: NEXT_PAID_LEVELS.render.cost
    }));

    try {
        const r2Stats = await getStorageStats();
        rows.push(buildNumericTierRow({
            id: 'r2-storage',
            service: 'Cloudflare R2',
            resource: 'Current stored data',
            unit: 'bytes',
            currentValue: r2Stats.totalBytes,
            limitValue: FREE_TIER_LIMITS.r2StorageBytes,
            source: 'Automatic',
            note: `${r2Stats.objectCount.toLocaleString()} object(s). Current bytes are compared with the 10 GB-month free storage allowance; provider billing uses GB-month.`,
            nextPaidLevel: NEXT_PAID_LEVELS.r2Storage.level,
            nextPaidCost: NEXT_PAID_LEVELS.r2Storage.cost
        }));
    } catch (error) {
        rows.push({
            ...buildProviderTierRow({
                id: 'r2-storage',
                service: 'Cloudflare R2',
                resource: 'Current stored data',
                unit: 'bytes',
                limitValue: FREE_TIER_LIMITS.r2StorageBytes,
                status: 'unavailable',
                note: `R2 storage could not be measured automatically: ${error.message}`,
                nextPaidLevel: NEXT_PAID_LEVELS.r2Storage.level,
                nextPaidCost: NEXT_PAID_LEVELS.r2Storage.cost
            }),
            source: 'Unavailable'
        });
    }

    rows.push(buildProviderTierRow({
        id: 'r2-class-a',
        service: 'Cloudflare R2',
        resource: 'Class A operations this month',
        unit: 'operations',
        limitValue: FREE_TIER_LIMITS.r2ClassAMonthly,
        note: 'Use the Cloudflare R2 dashboard for the provider operation total.',
        nextPaidLevel: NEXT_PAID_LEVELS.r2ClassA.level,
        nextPaidCost: NEXT_PAID_LEVELS.r2ClassA.cost
    }));

    rows.push(buildProviderTierRow({
        id: 'r2-class-b',
        service: 'Cloudflare R2',
        resource: 'Class B operations this month',
        unit: 'operations',
        limitValue: FREE_TIER_LIMITS.r2ClassBMonthly,
        note: 'Use the Cloudflare R2 dashboard for the provider operation total.',
        nextPaidLevel: NEXT_PAID_LEVELS.r2ClassB.level,
        nextPaidCost: NEXT_PAID_LEVELS.r2ClassB.cost
    }));

    rows.push(buildProviderTierRow({
        id: 'r2-egress',
        service: 'Cloudflare R2',
        resource: 'Internet egress',
        unit: 'text',
        limitLabel: 'Free',
        status: 'included',
        note: 'Internet egress is included without a metered free-tier cap.',
        nextPaidLevel: NEXT_PAID_LEVELS.r2Egress.level,
        nextPaidCost: NEXT_PAID_LEVELS.r2Egress.cost
    }));

    return {
        generatedAt: new Date().toISOString(),
        pricingReviewed: PRICING_REVIEWED,
        rows
    };
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
            // APP_OPEN is recorded centrally from home.html for every application.
            // Some legacy application pages do not write TrackUsageT View rows, so use
            // the larger of page views and APP_OPEN events to avoid under-counting Visits.
            visits: Math.max(toNumber(track.Visits), toNumber(usage.Sessions)),
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


// Current free-tier usage for the services that support reliable automatic measurement.
router.get('/free-tier-usage', auth, requireAdmin, async (req, res) => {
    try {
        const data = await loadFreeTierUsage();
        res.json(data);
    } catch (error) {
        console.error('Error in /free-tier-usage:', error.message);
        res.status(500).json({ error: 'Unable to load free-tier usage.' });
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
