-- Wonderful Apps Subscription / Entitlement schema
-- MySQL 5.5 compatible
-- Generated for the development-stage subscription system.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `SubscriptionPlanT` (
  `PlanID` int(11) NOT NULL AUTO_INCREMENT,
  `PlanName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PlanLevel` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`PlanID`),
  UNIQUE KEY `uq_subscription_plan_name` (`PlanName`),
  UNIQUE KEY `uq_subscription_plan_level` (`PlanLevel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AppT` (
  `AppID` int(11) NOT NULL AUTO_INCREMENT,
  `AppKey` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `AppName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MinimumPlanID` int(11) NOT NULL,
  `CostCategory` char(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `DevelopmentAvailable` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`AppID`),
  UNIQUE KEY `uq_app_key` (`AppKey`),
  KEY `idx_app_minimum_plan` (`MinimumPlanID`),
  CONSTRAINT `fk_app_plan` FOREIGN KEY (`MinimumPlanID`) REFERENCES `SubscriptionPlanT` (`PlanID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `SystemSettingsT` (
  `SettingKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SettingValue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`SettingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PromoCodeT` (
  `PromoCodeID` int(11) NOT NULL AUTO_INCREMENT,
  `Code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PlanID` int(11) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `MaxUses` int(11) DEFAULT NULL,
  `Uses` int(11) NOT NULL DEFAULT '0',
  `CreatedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PromoCodeID`),
  UNIQUE KEY `uq_promo_code` (`Code`),
  KEY `idx_promo_plan` (`PlanID`),
  CONSTRAINT `fk_promo_plan` FOREIGN KEY (`PlanID`) REFERENCES `SubscriptionPlanT` (`PlanID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserSubscriptionT` (
  `UserSubscriptionID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `PlanID` int(11) NOT NULL,
  `AccessType` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `PromoCodeID` int(11) DEFAULT NULL,
  `CreatedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ModifiedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`UserSubscriptionID`),
  UNIQUE KEY `uq_user_subscription_user` (`UserID`),
  KEY `idx_user_subscription_plan` (`PlanID`),
  KEY `idx_user_subscription_promo` (`PromoCodeID`),
  CONSTRAINT `fk_user_subscription_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_subscription_plan` FOREIGN KEY (`PlanID`) REFERENCES `SubscriptionPlanT` (`PlanID`),
  CONSTRAINT `fk_user_subscription_promo` FOREIGN KEY (`PromoCodeID`) REFERENCES `PromoCodeT` (`PromoCodeID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PromoRedemptionT` (
  `PromoRedemptionID` int(11) NOT NULL AUTO_INCREMENT,
  `PromoCodeID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `RedeemedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PromoRedemptionID`),
  UNIQUE KEY `uq_promo_user` (`PromoCodeID`,`UserID`),
  KEY `idx_promo_redemption_user` (`UserID`),
  CONSTRAINT `fk_promo_redemption_promo` FOREIGN KEY (`PromoCodeID`) REFERENCES `PromoCodeT` (`PromoCodeID`) ON DELETE CASCADE,
  CONSTRAINT `fk_promo_redemption_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserUsageT` (
  `UsageID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `AppID` int(11) DEFAULT NULL,
  `EventType` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Quantity` int(11) NOT NULL DEFAULT '1',
  `Detail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OccurredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UsageID`),
  KEY `idx_usage_user_date` (`UserID`,`OccurredAt`),
  KEY `idx_usage_app_date` (`AppID`,`OccurredAt`),
  CONSTRAINT `fk_usage_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `fk_usage_app` FOREIGN KEY (`AppID`) REFERENCES `AppT` (`AppID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Plans are hierarchical: a higher PlanLevel includes all lower levels.
INSERT IGNORE INTO `SubscriptionPlanT` (`PlanName`, `PlanLevel`, `Active`) VALUES
('Standard', 1, 1),
('Premium', 2, 1),
('Platinum', 3, 1),
('Diamond', 4, 1);

-- Application catalog and current development classifications.
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'loan_payment', 'Loan Payment', PlanID, 'A', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Standard';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'property_info', 'Property Info', PlanID, 'A', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Standard';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'town_notice', 'Town Notice', PlanID, 'A', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Standard';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'weigh_in', 'Weigh In', PlanID, 'B', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Premium';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'interest_earned', 'Interest Earned', PlanID, 'B', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Premium';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'budget', 'My Money My Budget', PlanID, 'B', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Premium';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'family_tree', 'Family Tree', PlanID, 'C', 1, 1 FROM SubscriptionPlanT WHERE PlanName = 'Platinum';
INSERT IGNORE INTO `AppT` (`AppKey`, `AppName`, `MinimumPlanID`, `CostCategory`, `Active`, `DevelopmentAvailable`)
SELECT 'etf_investing', 'ETF Investing', PlanID, 'D', 1, 0 FROM SubscriptionPlanT WHERE PlanName = 'Diamond';

-- Development controls.  Leave DevelopmentEntitlementEndDate blank until a firm development end date is selected.
INSERT IGNORE INTO `SystemSettingsT` (`SettingKey`, `SettingValue`, `Description`) VALUES
('DevelopmentMode', '1', '1 = Wonderful Apps is in development mode'),
('AllowNewDevelopmentTrials', '1', '1 = first successful login may create a free development trial'),
('DevelopmentTrialDays', '30', 'Number of days granted to a new development trial'),
('DevelopmentEntitlementEndDate', NULL, 'Optional YYYY-MM-DD cutoff for all DEVELOPMENT_TRIAL entitlements');

-- Current promotional code.  Change EndDate in this table whenever you want to extend it.
INSERT IGNORE INTO `PromoCodeT` (`Code`, `PlanID`, `StartDate`, `EndDate`, `Active`, `MaxUses`, `Uses`)
SELECT '22FreeForMe22!', PlanID, CURDATE(), '2026-12-31', 1, NULL, 0
FROM SubscriptionPlanT
WHERE PlanName = 'Platinum';

-- Useful administration examples (do not run unless desired):
-- UPDATE PromoCodeT SET EndDate = '2027-06-30' WHERE Code = '22FreeForMe22!';
-- UPDATE SystemSettingsT SET SettingValue = '2026-12-31' WHERE SettingKey = 'DevelopmentEntitlementEndDate';
-- UPDATE SystemSettingsT SET SettingValue = '0' WHERE SettingKey = 'AllowNewDevelopmentTrials';
