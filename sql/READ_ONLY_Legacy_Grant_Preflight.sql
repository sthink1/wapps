-- READ ONLY. Execute only against the isolated wapps_test database.
-- Source of truth for existing entitlement is UserSubscriptionT after migration.
SELECT DATABASE() AS selected_database;
SELECT COUNT(*) AS base_subscriptions FROM UserSubscriptionT;
SELECT AccessType, COUNT(*) AS row_count FROM UserSubscriptionT GROUP BY AccessType ORDER BY AccessType;
SELECT COUNT(*) AS legacy_grant_rows, SUM(Active = 1) AS legacy_active_grants FROM AdminSubscriptionGrantT;
SELECT COUNT(*) AS promo_redemptions FROM PromoRedemptionT;
-- Review incoming foreign keys. This result must be EMPTY before a DROP.
SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME = 'AdminSubscriptionGrantT';
-- Optional: inspect the current DDL, including outbound constraints.
SHOW CREATE TABLE AdminSubscriptionGrantT;
