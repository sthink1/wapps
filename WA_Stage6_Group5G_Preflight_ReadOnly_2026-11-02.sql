-- Wonderful Apps Stage 6 Group 5G -- READ ONLY
-- Run only after selecting the HelioHost wapps_test database in phpMyAdmin.
-- No credentials, passwords, tokens or user data are returned.
SELECT DATABASE() AS DatabaseName, VERSION() AS MariaDBVersion;
SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES
 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN
 ('UsersT','UserSecurityT','LoginVerificationT','WebSessionT','WebRefreshTokenT','PasswordResetT','PasswordResetRateT','NotificationConsentHistoryT','NotificationHistoryT','TNNAUserT','TNNADeviceT','TNNARefreshTokenT','FTSiblingT')
 ORDER BY TABLE_NAME;
SELECT k.TABLE_NAME AS ChildTable, k.COLUMN_NAME AS ChildColumn,
 k.REFERENCED_TABLE_NAME AS ParentTable, k.REFERENCED_COLUMN_NAME AS ParentColumn,
 r.DELETE_RULE AS OnDeleteAction
 FROM information_schema.KEY_COLUMN_USAGE k
 JOIN information_schema.REFERENTIAL_CONSTRAINTS r
 ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA
 AND r.TABLE_NAME=k.TABLE_NAME AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME
 WHERE k.TABLE_SCHEMA=DATABASE() AND k.REFERENCED_TABLE_NAME='UsersT'
 ORDER BY k.TABLE_NAME,k.COLUMN_NAME;
-- Show all columns that may refer to a user without assuming a declared FK.
SELECT c.TABLE_NAME,c.COLUMN_NAME,
 CASE WHEN k.CONSTRAINT_NAME IS NULL THEN 'No direct FK to UsersT' ELSE 'Direct FK to UsersT' END AS DirectUserFK
 FROM information_schema.COLUMNS c
 LEFT JOIN information_schema.KEY_COLUMN_USAGE k
 ON k.TABLE_SCHEMA=c.TABLE_SCHEMA AND k.TABLE_NAME=c.TABLE_NAME
 AND k.COLUMN_NAME=c.COLUMN_NAME AND k.REFERENCED_TABLE_NAME='UsersT'
 WHERE c.TABLE_SCHEMA=DATABASE() AND
 (c.COLUMN_NAME IN ('UserID','CreatedByUserID','UpdatedByUserID'))
 ORDER BY c.TABLE_NAME,c.COLUMN_NAME;
