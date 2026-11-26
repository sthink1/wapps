-- TEST DATABASE ONLY. Separately authorized execution; see install instructions.
-- Verify host, database identity, backup and stopped authentication traffic first.
-- DDL auto-commits. Stop on the first SQL error. Do not blindly re-run.
CREATE TABLE `wapps_test`.`LoginRateT` (
    `AccountKey` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    `PasswordFailures` VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    `EmailIssuances` VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    `UpdatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`AccountKey`),
    KEY `idx_LoginRate_UpdatedAt` (`UpdatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin;

ALTER TABLE `wapps_test`.`LoginVerificationT`
    ADD COLUMN `FailedAttempts` TINYINT UNSIGNED NOT NULL DEFAULT 0;
