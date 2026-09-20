const { pool } = require('../dbConnection');

function toDateOnly(value) {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
}

async function getSetting(key, connection = pool) {
    const [rows] = await connection.query(
        'SELECT SettingValue FROM SystemSettingsT WHERE SettingKey = ? LIMIT 1',
        [key]
    );
    return rows.length ? rows[0].SettingValue : null;
}

async function getPlanByName(planName, connection = pool) {
    const [rows] = await connection.query(
        'SELECT PlanID, PlanName, PlanLevel, Active FROM SubscriptionPlanT WHERE PlanName = ? LIMIT 1',
        [planName]
    );
    return rows[0] || null;
}

async function getCurrentSubscription(userId, connection = pool) {
    const [rows] = await connection.query(
        `SELECT us.UserSubscriptionID, us.UserID, us.PlanID, p.PlanName, p.PlanLevel,
                us.AccessType, us.StartDate, us.EndDate, us.Active, us.PromoCodeID,
                us.CreatedDate, us.ModifiedDate
           FROM UserSubscriptionT us
           JOIN SubscriptionPlanT p ON p.PlanID = us.PlanID
          WHERE us.UserID = ?
          LIMIT 1`,
        [userId]
    );
    return rows[0] || null;
}

async function getEffectiveEndDate(subscription, connection = pool) {
    if (!subscription || !subscription.EndDate) return null;

    const normalEnd = toDateOnly(subscription.EndDate);
    if (subscription.AccessType !== 'DEVELOPMENT_TRIAL') return normalEnd;

    const cutoff = await getSetting('DevelopmentEntitlementEndDate', connection);
    if (!cutoff) return normalEnd;

    const cutoffDate = toDateOnly(cutoff);
    return cutoffDate < normalEnd ? cutoffDate : normalEnd;
}

async function buildSubscriptionStatus(subscription, connection = pool) {
    if (!subscription) {
        return {
            exists: false,
            active: false,
            expired: true,
            planName: null,
            planLevel: 0,
            accessType: null,
            startDate: null,
            endDate: null,
            effectiveEndDate: null
        };
    }

    const today = new Date().toISOString().slice(0, 10);
    const effectiveEndDate = await getEffectiveEndDate(subscription, connection);
    const active = Boolean(subscription.Active) && (!effectiveEndDate || effectiveEndDate >= today);

    return {
        exists: true,
        active,
        expired: !active,
        planName: subscription.PlanName,
        planLevel: Number(subscription.PlanLevel),
        accessType: subscription.AccessType,
        startDate: toDateOnly(subscription.StartDate),
        endDate: toDateOnly(subscription.EndDate),
        effectiveEndDate,
        promoCodeId: subscription.PromoCodeID || null
    };
}

async function getOrCreateDevelopmentTrial(userId) {
    const existing = await getCurrentSubscription(userId);
    if (existing) {
        return { created: false, subscription: existing, status: await buildSubscriptionStatus(existing) };
    }

    const allow = await getSetting('AllowNewDevelopmentTrials');
    if (String(allow) !== '1') {
        return { created: false, subscription: null, status: await buildSubscriptionStatus(null) };
    }

    const platinum = await getPlanByName('Platinum');
    if (!platinum || !platinum.Active) {
        throw new Error('Platinum subscription plan is not configured or is inactive.');
    }

    const trialDaysRaw = await getSetting('DevelopmentTrialDays');
    const trialDays = Math.max(1, parseInt(trialDaysRaw || '30', 10) || 30);

    await pool.query(
        `INSERT INTO UserSubscriptionT
            (UserID, PlanID, AccessType, StartDate, EndDate, Active, PromoCodeID, ModifiedDate)
         VALUES (?, ?, 'DEVELOPMENT_TRIAL', CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), 1, NULL, NOW())`,
        [userId, platinum.PlanID, trialDays]
    );

    const subscription = await getCurrentSubscription(userId);
    return { created: true, subscription, status: await buildSubscriptionStatus(subscription) };
}

async function getAppAccess(userId, appKey, adminOverride = false) {
    const [apps] = await pool.query(
        `SELECT a.AppID, a.AppKey, a.AppName, a.CostCategory, a.Active,
                a.DevelopmentAvailable, p.PlanName AS MinimumPlanName,
                p.PlanLevel AS MinimumPlanLevel
           FROM AppT a
           JOIN SubscriptionPlanT p ON p.PlanID = a.MinimumPlanID
          WHERE a.AppKey = ?
          LIMIT 1`,
        [appKey]
    );

    if (!apps.length) {
        return { allowed: false, reason: 'APP_NOT_CONFIGURED', app: null };
    }

    const app = apps[0];
    if (!app.Active) {
        return { allowed: false, reason: 'APP_INACTIVE', app };
    }

    if (adminOverride) {
        return {
            allowed: true,
            reason: 'ADMIN_OVERRIDE',
            app,
            subscription: {
                exists: true,
                active: true,
                expired: false,
                planName: 'Diamond',
                planLevel: 4,
                accessType: 'ADMIN',
                startDate: null,
                endDate: null,
                effectiveEndDate: null
            }
        };
    }

    const developmentMode = String(await getSetting('DevelopmentMode')) === '1';
    if (developmentMode && !app.DevelopmentAvailable) {
        return { allowed: false, reason: 'NOT_AVAILABLE_DURING_DEVELOPMENT', app };
    }

    const subscription = await getCurrentSubscription(userId);
    const status = await buildSubscriptionStatus(subscription);

    if (!status.active) {
        return { allowed: false, reason: 'SUBSCRIPTION_EXPIRED', app, subscription: status };
    }

    if (status.planLevel < Number(app.MinimumPlanLevel)) {
        return { allowed: false, reason: 'PLAN_TOO_LOW', app, subscription: status };
    }

    return { allowed: true, reason: null, app, subscription: status };
}

async function getStatusWithApps(userId, adminOverride = false) {
    const subscription = await getCurrentSubscription(userId);
    const status = adminOverride
        ? {
            exists: true,
            active: true,
            expired: false,
            planName: 'Diamond',
            planLevel: 4,
            accessType: 'ADMIN',
            startDate: null,
            endDate: null,
            effectiveEndDate: null
        }
        : await buildSubscriptionStatus(subscription);
    const developmentMode = String(await getSetting('DevelopmentMode')) === '1';

    const [apps] = await pool.query(
        `SELECT a.AppID, a.AppKey, a.AppName, a.CostCategory, a.Active,
                a.DevelopmentAvailable, p.PlanName AS MinimumPlanName,
                p.PlanLevel AS MinimumPlanLevel
           FROM AppT a
           JOIN SubscriptionPlanT p ON p.PlanID = a.MinimumPlanID
          ORDER BY p.PlanLevel, a.AppName`
    );

    const appAccess = apps.map(app => {
        let allowed = true;
        let reason = null;

        if (!app.Active) {
            allowed = false;
            reason = 'APP_INACTIVE';
        } else if (adminOverride) {
            allowed = true;
            reason = 'ADMIN_OVERRIDE';
        } else if (developmentMode && !app.DevelopmentAvailable) {
            allowed = false;
            reason = 'NOT_AVAILABLE_DURING_DEVELOPMENT';
        } else if (!status.active) {
            allowed = false;
            reason = 'SUBSCRIPTION_EXPIRED';
        } else if (status.planLevel < Number(app.MinimumPlanLevel)) {
            allowed = false;
            reason = 'PLAN_TOO_LOW';
        }

        return {
            appKey: app.AppKey,
            appName: app.AppName,
            costCategory: app.CostCategory,
            minimumPlanName: app.MinimumPlanName,
            minimumPlanLevel: Number(app.MinimumPlanLevel),
            developmentAvailable: Boolean(app.DevelopmentAvailable),
            allowed,
            reason
        };
    });

    return { subscription: status, developmentMode, adminOverride, apps: appAccess };
}

async function redeemPromoCode(userId, rawCode) {
    const code = String(rawCode || '').trim();
    if (!code) throw Object.assign(new Error('Please enter a promotional code.'), { status: 400 });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [promoRows] = await connection.query(
            `SELECT pc.PromoCodeID, pc.Code, pc.PlanID, pc.StartDate, pc.EndDate,
                    pc.Active, pc.MaxUses, pc.Uses, p.PlanName, p.PlanLevel
               FROM PromoCodeT pc
               JOIN SubscriptionPlanT p ON p.PlanID = pc.PlanID
              WHERE pc.Code = ?
              LIMIT 1
              FOR UPDATE`,
            [code]
        );

        if (!promoRows.length) throw Object.assign(new Error('Promotional code was not found.'), { status: 400 });
        const promo = promoRows[0];
        const today = new Date().toISOString().slice(0, 10);
        const startDate = toDateOnly(promo.StartDate);
        const endDate = toDateOnly(promo.EndDate);

        if (!promo.Active) throw Object.assign(new Error('This promotional code is inactive.'), { status: 400 });
        if (today < startDate) throw Object.assign(new Error('This promotional code is not active yet.'), { status: 400 });
        if (today > endDate) throw Object.assign(new Error('This promotional code has expired.'), { status: 400 });
        if (promo.MaxUses !== null && Number(promo.Uses) >= Number(promo.MaxUses)) {
            throw Object.assign(new Error('This promotional code has reached its maximum number of uses.'), { status: 400 });
        }

        const [prior] = await connection.query(
            'SELECT PromoRedemptionID FROM PromoRedemptionT WHERE PromoCodeID = ? AND UserID = ? LIMIT 1',
            [promo.PromoCodeID, userId]
        );
        if (prior.length) throw Object.assign(new Error('You have already used this promotional code.'), { status: 400 });

        let current = await getCurrentSubscription(userId, connection);
        if (!current) {
            await connection.query(
                `INSERT INTO UserSubscriptionT
                    (UserID, PlanID, AccessType, StartDate, EndDate, Active, PromoCodeID, ModifiedDate)
                 VALUES (?, ?, 'PROMO', CURDATE(), ?, 1, ?, NOW())`,
                [userId, promo.PlanID, endDate, promo.PromoCodeID]
            );
        } else {
            const currentEnd = current.EndDate ? toDateOnly(current.EndDate) : null;
            const upgradedPlanId = Number(promo.PlanLevel) > Number(current.PlanLevel) ? promo.PlanID : current.PlanID;
            const laterEnd = !currentEnd || endDate > currentEnd ? endDate : currentEnd;
            const changed = upgradedPlanId !== current.PlanID || laterEnd !== currentEnd || !current.Active;
            if (!changed) {
                throw Object.assign(
                    new Error('Your current access is already equal to or better than this promotional code.'),
                    { status: 400 }
                );
            }

            await connection.query(
                `UPDATE UserSubscriptionT
                    SET PlanID = ?, EndDate = ?, Active = 1,
                        AccessType = CASE WHEN ? THEN 'PROMO' ELSE AccessType END,
                        PromoCodeID = CASE WHEN ? THEN ? ELSE PromoCodeID END,
                        ModifiedDate = NOW()
                  WHERE UserID = ?`,
                [upgradedPlanId, laterEnd, changed ? 1 : 0, changed ? 1 : 0, promo.PromoCodeID, userId]
            );
        }

        await connection.query(
            'INSERT INTO PromoRedemptionT (PromoCodeID, UserID) VALUES (?, ?)',
            [promo.PromoCodeID, userId]
        );
        await connection.query(
            'UPDATE PromoCodeT SET Uses = Uses + 1 WHERE PromoCodeID = ?',
            [promo.PromoCodeID]
        );

        await connection.commit();
        current = await getCurrentSubscription(userId);
        return {
            message: 'Promotional code applied successfully.',
            subscription: await buildSubscriptionStatus(current)
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function recordUsage(userId, appKey, eventType, quantity = 1, detail = null) {
    const permittedEvents = ['APP_OPEN', 'RECORD_CREATE', 'RECORD_UPDATE', 'API_CALL', 'EMAIL_SENT', 'FILE_UPLOAD'];
    if (!permittedEvents.includes(eventType)) {
        throw Object.assign(new Error('Invalid usage event type.'), { status: 400 });
    }

    let appId = null;
    if (appKey) {
        const [apps] = await pool.query('SELECT AppID FROM AppT WHERE AppKey = ? LIMIT 1', [appKey]);
        if (apps.length) appId = apps[0].AppID;
    }

    const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    const safeDetail = detail ? String(detail).slice(0, 255) : null;

    await pool.query(
        'INSERT INTO UserUsageT (UserID, AppID, EventType, Quantity, Detail) VALUES (?, ?, ?, ?, ?)',
        [userId, appId, eventType, safeQuantity, safeDetail]
    );
}


function requirePositiveInteger(value, fieldName) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw Object.assign(new Error(`${fieldName} must be a positive whole number.`), { status: 400 });
    }
    return parsed;
}

function requireDateOnly(value, fieldName) {
    const text = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        throw Object.assign(new Error(`${fieldName} must be a valid date.`), { status: 400 });
    }
    const parsed = new Date(`${text}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
        throw Object.assign(new Error(`${fieldName} must be a valid date.`), { status: 400 });
    }
    return text;
}

function normalizeMaxUses(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw Object.assign(new Error('Max Uses must be blank or a positive whole number.'), { status: 400 });
    }
    return parsed;
}

async function listAdminPromoCodes() {
    const [promos] = await pool.query(
        `SELECT pc.PromoCodeID, pc.Code, pc.PlanID, p.PlanName, p.PlanLevel,
                pc.StartDate, pc.EndDate, pc.Active, pc.MaxUses, pc.Uses, pc.CreatedDate
           FROM PromoCodeT pc
           JOIN SubscriptionPlanT p ON p.PlanID = pc.PlanID
          ORDER BY pc.Code`
    );

    const [plans] = await pool.query(
        `SELECT PlanID, PlanName, PlanLevel
           FROM SubscriptionPlanT
          WHERE Active = 1
          ORDER BY PlanLevel`
    );

    return {
        promos: promos.map(promo => ({
            promoCodeId: promo.PromoCodeID,
            code: promo.Code,
            planId: promo.PlanID,
            planName: promo.PlanName,
            planLevel: Number(promo.PlanLevel),
            startDate: toDateOnly(promo.StartDate),
            endDate: toDateOnly(promo.EndDate),
            active: Boolean(promo.Active),
            maxUses: promo.MaxUses === null ? null : Number(promo.MaxUses),
            uses: Number(promo.Uses),
            createdDate: promo.CreatedDate
        })),
        plans: plans.map(plan => ({
            planId: plan.PlanID,
            planName: plan.PlanName,
            planLevel: Number(plan.PlanLevel)
        }))
    };
}

async function validatePromoInput(input, promoCodeId = null) {
    const code = String(input.code || '').trim();
    if (!code) {
        throw Object.assign(new Error('Promo Code is required.'), { status: 400 });
    }
    if (code.length > 100) {
        throw Object.assign(new Error('Promo Code cannot exceed 100 characters.'), { status: 400 });
    }

    const planId = requirePositiveInteger(input.planId, 'Plan');
    const startDate = requireDateOnly(input.startDate, 'Start Date');
    const endDate = requireDateOnly(input.endDate, 'End Date');
    if (endDate < startDate) {
        throw Object.assign(new Error('End Date cannot be before Start Date.'), { status: 400 });
    }

    const maxUses = normalizeMaxUses(input.maxUses);
    const active = input.active === true || input.active === 1 || input.active === '1';

    const [plans] = await pool.query(
        'SELECT PlanID, PlanName, PlanLevel FROM SubscriptionPlanT WHERE PlanID = ? AND Active = 1 LIMIT 1',
        [planId]
    );
    if (!plans.length) {
        throw Object.assign(new Error('The selected subscription plan is not available.'), { status: 400 });
    }

    const duplicateSql = promoCodeId
        ? 'SELECT PromoCodeID FROM PromoCodeT WHERE Code = ? AND PromoCodeID <> ? LIMIT 1'
        : 'SELECT PromoCodeID FROM PromoCodeT WHERE Code = ? LIMIT 1';
    const duplicateParams = promoCodeId ? [code, promoCodeId] : [code];
    const [duplicates] = await pool.query(duplicateSql, duplicateParams);
    if (duplicates.length) {
        throw Object.assign(new Error('That promotional code already exists.'), { status: 400 });
    }

    return { code, planId, startDate, endDate, active, maxUses };
}

async function createAdminPromoCode(input) {
    const promo = await validatePromoInput(input);
    const [result] = await pool.query(
        `INSERT INTO PromoCodeT
            (Code, PlanID, StartDate, EndDate, Active, MaxUses, Uses)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [promo.code, promo.planId, promo.startDate, promo.endDate, promo.active ? 1 : 0, promo.maxUses]
    );

    return { promoCodeId: result.insertId, message: 'Promotional code created.' };
}

async function updateAdminPromoCode(promoCodeId, input) {
    const id = requirePositiveInteger(promoCodeId, 'Promo Code ID');
    const [existingRows] = await pool.query(
        'SELECT PromoCodeID, Uses FROM PromoCodeT WHERE PromoCodeID = ? LIMIT 1',
        [id]
    );
    if (!existingRows.length) {
        throw Object.assign(new Error('Promotional code was not found.'), { status: 404 });
    }

    const promo = await validatePromoInput(input, id);
    const uses = Number(existingRows[0].Uses);
    if (promo.maxUses !== null && promo.maxUses < uses) {
        throw Object.assign(
            new Error(`Max Uses cannot be less than the current Uses value (${uses}).`),
            { status: 400 }
        );
    }

    await pool.query(
        `UPDATE PromoCodeT
            SET Code = ?, PlanID = ?, StartDate = ?, EndDate = ?, Active = ?, MaxUses = ?
          WHERE PromoCodeID = ?`,
        [promo.code, promo.planId, promo.startDate, promo.endDate, promo.active ? 1 : 0, promo.maxUses, id]
    );

    return { message: 'Promotional code updated.' };
}

async function getAdminUserSubscription(userId) {
    const id = requirePositiveInteger(userId, 'User ID');
    const [users] = await pool.query(
        'SELECT UserID, UserName, Email FROM UsersT WHERE UserID = ? LIMIT 1',
        [id]
    );
    if (!users.length) {
        throw Object.assign(new Error('User ID was not found.'), { status: 404 });
    }

    const subscription = await getCurrentSubscription(id);
    return {
        user: {
            userId: users[0].UserID,
            username: users[0].UserName,
            email: users[0].Email
        },
        subscription: await buildSubscriptionStatus(subscription)
    };
}

async function grantAdminFreeUsage(userId, planId, rawEndDate, grantedByUserId) {
    const targetUserId = requirePositiveInteger(userId, 'User ID');
    const requestedPlanId = requirePositiveInteger(planId, 'Plan');
    const grantedBy = requirePositiveInteger(grantedByUserId, 'Administrator User ID');
    const endDate = requireDateOnly(rawEndDate, 'Access Through');
    const today = new Date().toISOString().slice(0, 10);
    if (endDate < today) {
        throw Object.assign(new Error('Access Through cannot be before today.'), { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [users] = await connection.query(
            'SELECT UserID, UserName, Email FROM UsersT WHERE UserID = ? LIMIT 1 FOR UPDATE',
            [targetUserId]
        );
        if (!users.length) {
            throw Object.assign(new Error('User ID was not found.'), { status: 404 });
        }

        const [plans] = await connection.query(
            `SELECT PlanID, PlanName, PlanLevel
               FROM SubscriptionPlanT
              WHERE PlanID = ? AND Active = 1
              LIMIT 1`,
            [requestedPlanId]
        );
        if (!plans.length) {
            throw Object.assign(new Error('The selected subscription plan is not available.'), { status: 400 });
        }
        const requestedPlan = plans[0];

        let current = await getCurrentSubscription(targetUserId, connection);
        if (!current) {
            await connection.query(
                `INSERT INTO UserSubscriptionT
                    (UserID, PlanID, AccessType, StartDate, EndDate, Active, PromoCodeID, ModifiedDate)
                 VALUES (?, ?, 'ADMIN_GRANT', CURDATE(), ?, 1, NULL, NOW())`,
                [targetUserId, requestedPlanId, endDate]
            );
        } else {
            const currentEnd = current.EndDate ? toDateOnly(current.EndDate) : null;
            const planImproves = Number(requestedPlan.PlanLevel) > Number(current.PlanLevel);
            const dateImproves = currentEnd !== null && endDate > currentEnd;
            const reactivates = !current.Active || (currentEnd !== null && currentEnd < today);

            if (!planImproves && !dateImproves && !reactivates) {
                throw Object.assign(
                    new Error('The user already has equal or better active access.'),
                    { status: 400 }
                );
            }

            const effectivePlanId = planImproves ? requestedPlanId : current.PlanID;
            const effectiveEndDate = currentEnd === null
                ? (current.Active ? null : endDate)
                : (endDate > currentEnd ? endDate : currentEnd);

            await connection.query(
                `UPDATE UserSubscriptionT
                    SET PlanID = ?, EndDate = ?, Active = 1,
                        AccessType = 'ADMIN_GRANT', PromoCodeID = NULL, ModifiedDate = NOW()
                  WHERE UserID = ?`,
                [effectivePlanId, effectiveEndDate, targetUserId]
            );
        }

        await connection.query(
            `INSERT INTO AdminSubscriptionGrantT
                (UserID, PlanID, GrantStartDate, GrantEndDate, GrantedByUserID)
             VALUES (?, ?, CURDATE(), ?, ?)`,
            [targetUserId, requestedPlanId, endDate, grantedBy]
        );

        await connection.commit();
        current = await getCurrentSubscription(targetUserId);

        return {
            message: 'Free subscription access granted.',
            user: {
                userId: users[0].UserID,
                username: users[0].UserName,
                email: users[0].Email
            },
            subscription: await buildSubscriptionStatus(current)
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    getOrCreateDevelopmentTrial,
    getCurrentSubscription,
    buildSubscriptionStatus,
    getAppAccess,
    getStatusWithApps,
    redeemPromoCode,
    recordUsage,
    listAdminPromoCodes,
    createAdminPromoCode,
    updateAdminPromoCode,
    getAdminUserSubscription,
    grantAdminFreeUsage
};
