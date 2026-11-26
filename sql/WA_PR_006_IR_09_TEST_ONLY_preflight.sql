-- Read-only. Verify connection separately before running.
SELECT DATABASE() AS DatabaseName, @@session.time_zone AS SessionTimeZone,
       VERSION() AS ServerVersion;
SELECT TABLE_NAME, ENGINE
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'wapps_test'
  AND TABLE_NAME IN ('LoginRateT', 'LoginVerificationT', 'PasswordResetRateT', 'LoginIpRateT');
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'wapps_test'
  AND TABLE_NAME IN ('LoginRateT', 'LoginVerificationT', 'PasswordResetRateT', 'LoginIpRateT')
ORDER BY TABLE_NAME, ORDINAL_POSITION;
