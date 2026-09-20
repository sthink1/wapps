-- Wonderful Apps
-- 9-20-26 Revisions - Subscription Control
-- Run this migration once before deploying the revised application files.
-- Compatible with the current MySQL 5.5 schema style used by WA.

CREATE TABLE `AdminSubscriptionGrantT` (
  `AdminSubscriptionGrantID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `PlanID` int(11) NOT NULL,
  `GrantStartDate` date NOT NULL,
  `GrantEndDate` date NOT NULL,
  `GrantedByUserID` int(11) NOT NULL,
  `CreatedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AdminSubscriptionGrantID`),
  KEY `idx_admin_grant_user_date` (`UserID`,`CreatedDate`),
  KEY `idx_admin_grant_plan` (`PlanID`),
  KEY `idx_admin_grant_granted_by` (`GrantedByUserID`),
  CONSTRAINT `fk_admin_grant_user`
    FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_admin_grant_plan`
    FOREIGN KEY (`PlanID`) REFERENCES `SubscriptionPlanT` (`PlanID`),
  CONSTRAINT `fk_admin_grant_granted_by`
    FOREIGN KEY (`GrantedByUserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No changes are required to PromoCodeT or UserSubscriptionT.
-- Admin grants use UserSubscriptionT as the active entitlement and set
-- AccessType = 'ADMIN_GRANT' when the grant improves or reactivates access.
-- AdminSubscriptionGrantT preserves the separate grant history.
