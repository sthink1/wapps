-- Consolidated Database Dump
-- Generated: 2026-03-23
-- Target Database: sql9647764

SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;
SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS;
SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION;
SET NAMES utf8mb4;
SET @OLD_TIME_ZONE=@@TIME_ZONE;
SET TIME_ZONE='+00:00';
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0;

-- ------------------------------------------------------
-- Table structure for table `UsersT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `UsersT`;
CREATE TABLE `UsersT` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `UserName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone1` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone2` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Username` (`UserName`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `LoginVerificationT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `LoginVerificationT`;
CREATE TABLE `LoginVerificationT` (
  `VerificationID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `VerificationCode` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TempToken` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsVerified` tinyint(1) NOT NULL DEFAULT '0',
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`VerificationID`),
  KEY `fk_login_verification_user` (`UserID`),
  CONSTRAINT `fk_login_verification_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `ActivitiesT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `ActivitiesT`;
CREATE TABLE `ActivitiesT` (
  `ActivityID` int(11) NOT NULL AUTO_INCREMENT,
  `Activity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int(11) NOT NULL DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserActivityID` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ActivityID`),
  UNIQUE KEY `unique_activity_per_user` (`Activity`,`UserID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `ActivitiesT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `etfCategoryT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `etfCategoryT`;
CREATE TABLE `etfCategoryT` (
  `etfCategoryID` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int(11) NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`etfCategoryID`),
  UNIQUE KEY `unique_category_user` (`category`,`UserID`),
  KEY `fk_etfCategory_user` (`UserID`),
  CONSTRAINT `fk_etfCategory_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `etfSymbolT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `etfSymbolT`;
CREATE TABLE `etfSymbolT` (
  `etfSymbolID` int(11) NOT NULL AUTO_INCREMENT,
  `symbol` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etfCategoryID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `listDate` date DEFAULT NULL,
  PRIMARY KEY (`etfSymbolID`),
  UNIQUE KEY `unique_symbol_user` (`symbol`,`UserID`),
  KEY `fk_etfSymbol_category` (`etfCategoryID`),
  KEY `fk_etfSymbol_user` (`UserID`),
  CONSTRAINT `fk_etfSymbol_category` FOREIGN KEY (`etfCategoryID`) REFERENCES `etfCategoryT` (`etfCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_etfSymbol_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=177 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `etfActivityT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `etfActivityT`;
CREATE TABLE `etfActivityT` (
  `etfActivityID` int(11) NOT NULL AUTO_INCREMENT,
  `UserEtfActivityID` int(11) NOT NULL DEFAULT '1',
  `UserID` int(11) NOT NULL,
  `etfCategoryID` int(11) NOT NULL,
  `etfSymbolID` int(11) NOT NULL,
  `TransactionType` enum('BUY','SELL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `TransactionDate` date NOT NULL,
  `Shares` decimal(15,6) NOT NULL,
  `PurchaseCost` decimal(15,4) DEFAULT NULL,
  `SalePrice` decimal(15,4) DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`etfActivityID`),
  UNIQUE KEY `unique_etf_transaction` (`UserID`,`etfSymbolID`,`TransactionType`,`TransactionDate`,`Shares`),
  KEY `idx_etfActivity_user` (`UserID`),
  KEY `idx_etfActivity_symbol` (`etfSymbolID`),
  KEY `idx_etfActivity_category` (`etfCategoryID`),
  CONSTRAINT `fk_etfActivity_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_etfActivity_category` FOREIGN KEY (`etfCategoryID`) REFERENCES `etfCategoryT` (`etfCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_etfActivity_symbol` FOREIGN KEY (`etfSymbolID`) REFERENCES `etfSymbolT` (`etfSymbolID`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `InterestEarnedT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `InterestEarnedT`;
CREATE TABLE `InterestEarnedT` (
  `IntErndID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `CompanyName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ContractNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateOpened` date NOT NULL,
  `Rate` decimal(5,2) NOT NULL,
  `UserIntErndID` int(11) NOT NULL,
  `Notes` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`IntErndID`),
  UNIQUE KEY `UserID` (`UserID`,`CompanyName`,`ContractNumber`),
  CONSTRAINT `InterestEarnedT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `TrackUsageT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `TrackUsageT`;
CREATE TABLE `TrackUsageT` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `Page` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Action` enum('View','TimeSpent') COLLATE utf8mb4_unicode_ci NOT NULL,
  `Duration` int(11) DEFAULT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `idx_userid_action` (`UserID`,`Action`),
  KEY `idx_timestamp` (`Timestamp`),
  CONSTRAINT `TrackUsageT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9917 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `UserSequenceT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `UserSequenceT`;
CREATE TABLE `UserSequenceT` (
  `UserID` int(11) NOT NULL,
  `TableName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NextID` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`UserID`,`TableName`),
  CONSTRAINT `UserSequenceT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `WeightsT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `WeightsT`;
CREATE TABLE `WeightsT` (
  `WeightID` int(11) NOT NULL AUTO_INCREMENT,
  `DateWeight` date NOT NULL,
  `Weight` decimal(4,1) NOT NULL,
  `UserID` int(11) DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserWeightID` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`WeightID`),
  UNIQUE KEY `unique_dateweight_per_user` (`DateWeight`,`UserID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `WeightsT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=749 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------
-- Table structure for table `WeightActivitiesT`
-- ------------------------------------------------------
DROP TABLE IF EXISTS `WeightActivitiesT`;
CREATE TABLE `WeightActivitiesT` (
  `WeightActivityID` int(11) NOT NULL AUTO_INCREMENT,
  `WeightID` int(11) NOT NULL,
  `ActivityID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WeightActivityID`),
  KEY `UserID` (`UserID`),
  KEY `WeightActivitiesT_ibfk_1` (`WeightID`),
  KEY `WeightActivitiesT_ibfk_2` (`ActivityID`),
  KEY `idx_activity_user` (`ActivityID`,`UserID`),
  CONSTRAINT `WeightActivitiesT_ibfk_1` FOREIGN KEY (`WeightID`) REFERENCES `WeightsT` (`WeightID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WeightActivitiesT_ibfk_2` FOREIGN KEY (`ActivityID`) REFERENCES `ActivitiesT` (`ActivityID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WeightActivitiesT_ibfk_3` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=392 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET TIME_ZONE=@OLD_TIME_ZONE;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT;
SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS;
SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION;
SET SQL_NOTES=@OLD_SQL_NOTES;