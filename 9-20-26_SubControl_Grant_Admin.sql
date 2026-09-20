-- Wonderful Apps
-- 9-20-26 Revisions - SubControl grant administration
-- Run once against the database that already contains AdminSubscriptionGrantT.
-- Current WA database style: MySQL 5.5 compatible.

ALTER TABLE `AdminSubscriptionGrantT`
  ADD COLUMN `Active` tinyint(1) NOT NULL DEFAULT '1' AFTER `GrantEndDate`,
  ADD COLUMN `ModifiedDate` datetime DEFAULT NULL AFTER `CreatedDate`,
  ADD COLUMN `ModifiedByUserID` int(11) DEFAULT NULL AFTER `ModifiedDate`,
  ADD COLUMN `RevokedDate` datetime DEFAULT NULL AFTER `ModifiedByUserID`,
  ADD COLUMN `RevokedByUserID` int(11) DEFAULT NULL AFTER `RevokedDate`,
  ADD KEY `idx_admin_grant_user_active_end` (`UserID`,`Active`,`GrantEndDate`),
  ADD KEY `idx_admin_grant_modified_by` (`ModifiedByUserID`),
  ADD KEY `idx_admin_grant_revoked_by` (`RevokedByUserID`),
  ADD CONSTRAINT `fk_admin_grant_modified_by`
    FOREIGN KEY (`ModifiedByUserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_admin_grant_revoked_by`
    FOREIGN KEY (`RevokedByUserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Important design change:
-- AdminSubscriptionGrantT is now an independent entitlement overlay.
-- New administrator grants are no longer written into UserSubscriptionT.
-- UserSubscriptionT remains the underlying DEVELOPMENT_TRIAL / PROMO / future PAID entitlement.
-- When an admin grant expires or is revoked, WA automatically falls back to any valid
-- underlying UserSubscriptionT entitlement.
