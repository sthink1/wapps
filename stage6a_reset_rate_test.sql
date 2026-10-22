-- Run ONLY while phpMyAdmin has database sql5838929 selected.
-- MySQL 5.5 / InnoDB compatible.
CREATE TABLE IF NOT EXISTS PasswordResetRateT (
 KeyHash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
 WindowStart DATETIME NOT NULL,
 AttemptCount INT UNSIGNED NOT NULL DEFAULT 0,
 PRIMARY KEY (KeyHash),
 KEY idx_WindowStart (WindowStart)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- Maintenance, run periodically (not inside request):
-- DELETE FROM PasswordResetRateT WHERE WindowStart < DATE_SUB(UTC_TIMESTAMP(),INTERVAL 2 DAY);
