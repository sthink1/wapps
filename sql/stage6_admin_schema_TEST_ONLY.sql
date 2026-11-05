-- STAGE 6 TEST DATABASE ONLY. Do not execute in production.
-- Confirm SELECT DATABASE() is the dedicated test database before running.
SELECT DATABASE() AS REVIEW_DATABASE_BEFORE_PROCEEDING;
-- STOP if the displayed schema is not the dedicated Stage 6 test schema.
ALTER TABLE UsersT ADD COLUMN IsAdministrator TINYINT(1) NOT NULL DEFAULT 0;
CREATE TABLE AdminTransferStateT (
 ControlID TINYINT UNSIGNED NOT NULL PRIMARY KEY,
 InitiatorUserID INT NULL,
 InitiatorUserName VARCHAR(100) NULL,
 InitiatorSessionPublicID CHAR(32) NULL,
 TargetUserID INT NULL,
 TargetUserName VARCHAR(100) NULL,
 TokenHash CHAR(64) NULL,
 CreatedAt DATETIME(6) NULL,
 ExpiresAt DATETIME(6) NULL,
 CompletedAt DATETIME(6) NULL,
 CancelledAt DATETIME(6) NULL
) ENGINE=InnoDB;
INSERT INTO AdminTransferStateT(ControlID) VALUES(1);
CREATE TABLE AdminTransferAuditT (
 AuditID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 EventType VARCHAR(30) NOT NULL,
 InitiatorUserID INT NOT NULL,
 FromUserID INT NULL,
 ToUserID INT NULL,
 FromUsername VARCHAR(100) NULL,
 ToUsername VARCHAR(100) NULL,
 RecordedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 INDEX idx_admin_audit_when(RecordedAt)
) ENGINE=InnoDB;
