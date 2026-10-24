-- WONDERFUL APPS STAGE 6 GROUP 0a: TEST DATABASE ONLY
-- DO NOT RUN UNTIL THE ASSOCIATED GROUP 0a APPLICATION CHANGES ARE INSTALLED.
-- Target MySQL 5.5 / test database sql5838929 ONLY.
-- The explicit USE prevents applying the ALTERs to an accidentally selected
-- production database; users must still verify they are connected to the test host.
USE `sql5838929`;
SELECT DATABASE() AS MustBe_sql5838929;

-- Default 0 makes all previously issued, unversioned challenges invalid.
-- Application consumption MUST reject zero and require a match to the
-- currently locked UserSecurityT.SecurityVersion.
ALTER TABLE `LoginVerificationT`
  ADD COLUMN `SecurityVersion` BIGINT NOT NULL DEFAULT 0;
ALTER TABLE `PasswordResetT`
  ADD COLUMN `SecurityVersion` BIGINT NOT NULL DEFAULT 0;

-- Diagnostic only: all user accounts must have an authoritative version row.
SELECT COUNT(*) AS MissingSecurityRows
FROM UsersT u LEFT JOIN UserSecurityT s ON s.UserID=u.UserID
WHERE s.UserID IS NULL;

-- Diagnostic only: pre-migration records remain version 0 and MUST be rejected.
SELECT COUNT(*) AS LegacyLoginChallenges FROM LoginVerificationT WHERE SecurityVersion=0;
SELECT COUNT(*) AS LegacyResetGrants FROM PasswordResetT WHERE SecurityVersion=0;

-- Run these on a *separate* query before migration to ensure neither column exists:
-- SHOW COLUMNS FROM LoginVerificationT LIKE 'SecurityVersion';
-- SHOW COLUMNS FROM PasswordResetT LIKE 'SecurityVersion';
-- Note: MySQL 5.5 ALTER ADD COLUMN does not support IF NOT EXISTS.
