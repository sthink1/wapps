-- TEST DATABASE ONLY. Separately authorized rollback; see install instructions.
-- Stop every application instance and restore original code before executing.
-- DDL auto-commits. Stop on the first error. Do not blindly re-run.
-- Expire only pending login challenges, not authenticated sessions. This prevents
-- a challenge exhausted under the new code becoming usable under the old code.
UPDATE `wapps_test`.`LoginVerificationT`
    SET `ExpiresAt` = UTC_TIMESTAMP()
    WHERE `IsVerified` = 0 AND `ExpiresAt` > UTC_TIMESTAMP();

ALTER TABLE `wapps_test`.`LoginVerificationT`
    DROP COLUMN `FailedAttempts`;

DROP TABLE `wapps_test`.`LoginRateT`;
