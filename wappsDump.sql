-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: sql9.freesqldatabase.com    Database: sql9647764
-- ------------------------------------------------------
-- Server version	5.5.62-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ActivitiesT`
--

DROP TABLE IF EXISTS `ActivitiesT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InterestEarnedT`
--

DROP TABLE IF EXISTS `InterestEarnedT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TrackUsageT`
--

DROP TABLE IF EXISTS `TrackUsageT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8668 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UserSequenceT`
--

DROP TABLE IF EXISTS `UserSequenceT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserSequenceT` (
  `UserID` int(11) NOT NULL,
  `TableName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NextID` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`UserID`,`TableName`),
  CONSTRAINT `UserSequenceT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `UsersT`
--

DROP TABLE IF EXISTS `UsersT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WeightActivitiesT`
--

DROP TABLE IF EXISTS `WeightActivitiesT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=381 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WeightsT`
--

DROP TABLE IF EXISTS `WeightsT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=696 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-31 14:34:28
