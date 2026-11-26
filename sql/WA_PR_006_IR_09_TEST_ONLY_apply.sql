-- WA-PR-006 / IR-09. TEST DATABASE ONLY; do not execute without separate approval.
-- DDL auto-commits. Verify identity, backup and absence of table before execution.
CREATE TABLE `wapps_test`.`LoginIpRateT` (
    `IpKey` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    `RequestEvents` VARCHAR(512) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    `UpdatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`IpKey`),
    KEY `idx_LoginIpRate_UpdatedAt` (`UpdatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin;
