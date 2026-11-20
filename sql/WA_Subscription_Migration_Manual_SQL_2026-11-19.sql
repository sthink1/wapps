-- Wonderful Apps | manual staging migration | 2026-11-19
-- Target: HelioHost test database `wapps_test` ONLY.
-- This is an executable SQL script: running it changes data and COMMIT persists it.
-- Do not use on production. Keep the verified wappsHelioTestDump.sql backup.
-- Source: corrected wa-subscription-one-time-migration.js, aligned with fresh dump.
-- 9 UPDATEs + 2 INSERTs. No other tables written; no schema change.
-- IMPORTANT: The 11 statements use source-state conditions to avoid overwriting
-- unexpected record values. If a guarded statement changes 0 rows unexpectedly,
-- investigate; do not assume the migration completed.

USE `wapps_test`;

-- Review database identity before executing the change batch.
SELECT DATABASE() AS selected_database;

START TRANSACTION;

-- EXISTING user 1 (sthink) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 4,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 1 AND `UserSubscriptionID` = 2
  AND `PlanID` = 3 AND `AccessType` = 'PROMO'
  AND `EndDate` = '2026-12-31' AND `Active` = 1 AND `PromoCodeID` = 1;

-- NEW user 43 (malcolm4) -- insert only if user exists and is still unsubscribed.
INSERT INTO `UserSubscriptionT`
    (`UserID`, `PlanID`, `AccessType`, `StartDate`, `EndDate`, `Active`, `PromoCodeID`, `ModifiedDate`)
SELECT 43, 3, 'ADMIN_GRANT', CURDATE(), '2200-01-01', 1, NULL, NOW()
FROM `UsersT` AS u
WHERE u.`UserID` = 43 AND u.`UserName` = 'malcolm4'
  AND NOT EXISTS (SELECT 1 FROM `UserSubscriptionT` AS s WHERE s.`UserID` = 43);

-- EXISTING user 44 (laurel) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 44 AND `UserSubscriptionID` = 7
  AND `PlanID` = 3 AND `AccessType` = 'ADMIN_GRANT'
  AND `EndDate` = '2030-12-31' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- EXISTING user 49 (cotravel) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 49 AND `UserSubscriptionID` = 8
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-10-21' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- EXISTING user 51 (mmintonec) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 51 AND `UserSubscriptionID` = 9
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-10-22' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- NEW user 52 (janet) -- insert only if user exists and is still unsubscribed.
INSERT INTO `UserSubscriptionT`
    (`UserID`, `PlanID`, `AccessType`, `StartDate`, `EndDate`, `Active`, `PromoCodeID`, `ModifiedDate`)
SELECT 52, 3, 'ADMIN_GRANT', CURDATE(), '2200-01-01', 1, NULL, NOW()
FROM `UsersT` AS u
WHERE u.`UserID` = 52 AND u.`UserName` = 'janet'
  AND NOT EXISTS (SELECT 1 FROM `UserSubscriptionT` AS s WHERE s.`UserID` = 52);

-- EXISTING user 53 (jlm4212) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 53 AND `UserSubscriptionID` = 10
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-10-26' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- EXISTING user 54 (b0ulderagalvin) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 54 AND `UserSubscriptionID` = 11
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-10-29' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- EXISTING user 56 (mpgiii) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 56 AND `UserSubscriptionID` = 13
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-11-01' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- EXISTING user 57 (mgalvinnj) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 57 AND `UserSubscriptionID` = 14
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-11-03' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- EXISTING user 58 (kelsey) -- verify original row and values in WHERE.
UPDATE `UserSubscriptionT`
SET `PlanID` = 3,
    `AccessType` = 'ADMIN_GRANT',
    `EndDate` = '2200-01-01',
    `Active` = 1,
    `PromoCodeID` = NULL,
    `ModifiedDate` = NOW()
WHERE `UserID` = 58 AND `UserSubscriptionID` = 15
  AND `PlanID` = 3 AND `AccessType` = 'DEVELOPMENT_TRIAL'
  AND `EndDate` = '2026-11-09' AND `Active` = 1 AND `PromoCodeID` IS NULL;

-- Final stored-result inspection. Expect 18 total subscription rows,
-- with all planned admin grants present at the new dates.
SELECT u.`UserID`, u.`UserName`, s.`PlanID`, s.`AccessType`,
       s.`EndDate`, s.`Active`, s.`PromoCodeID`
FROM `UsersT` AS u
LEFT JOIN `UserSubscriptionT` AS s ON s.`UserID` = u.`UserID`
WHERE u.`UserID` IN (1,40,42,43,44,45,48,49,51,52,53,54,55,56,57,58,63,64)
ORDER BY u.`UserID`;

SELECT COUNT(*) AS subscription_rows_after FROM `UserSubscriptionT`;

-- COMMIT makes the 11 data changes permanent on successful execution.
COMMIT;
-- All SQL statements are intended to run in ONE phpMyAdmin SQL submission.
-- Do not rerun blindly. Verify results before activating the new service.
