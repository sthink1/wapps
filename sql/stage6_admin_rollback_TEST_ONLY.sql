-- REFERENCE ONLY. DO NOT execute blindly.
-- For a failed staging release, restore the PRE-CHANGE TEST DB BACKUP and
-- revert the matching staging code deployment. Never run in production.
-- Read-only inspection:
SELECT DATABASE() AS REVIEW_TEST_DB;
SELECT UserID, UserName, IsAdministrator FROM UsersT ORDER BY UserID;
SELECT * FROM AdminTransferStateT WHERE ControlID=1;
SELECT * FROM AdminTransferAuditT ORDER BY AuditID DESC LIMIT 20;
-- No destructive DDL provided: backing out requires restoring the matching
-- test database snapshot to preserve integrity with the reverted code.
