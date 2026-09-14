-- phpMyAdmin SQL Dump
-- version 4.7.1
-- https://www.phpmyadmin.net/
--
-- Host: sql9.freesqldatabase.com
-- Generation Time: Sep 14, 2026 at 02:43 PM
-- Server version: 5.5.62-0ubuntu0.14.04.1
-- PHP Version: 7.0.33-0ubuntu0.16.04.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sql9647764`
--

-- --------------------------------------------------------

--
-- Table structure for table `ActivitiesT`
--

CREATE TABLE `ActivitiesT` (
  `ActivityID` int(11) NOT NULL,
  `Activity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int(11) NOT NULL DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserActivityID` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetCardT`
--

CREATE TABLE `BudgetCardT` (
  `CardID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserCardID` int(11) NOT NULL,
  `AccountName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Last4Digits` char(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `LastStatementDate` date NOT NULL,
  `StatementBalance` decimal(15,2) NOT NULL,
  `PaymentDueDate` date NOT NULL,
  `MinimumPaymentDue` decimal(15,2) NOT NULL,
  `MinimumPaymentDueChecked` tinyint(1) NOT NULL DEFAULT '0',
  `MinimumPaymentAlternativeAmount` decimal(15,2) DEFAULT NULL,
  `CreditLineTotal` decimal(15,2) DEFAULT NULL,
  `CreditLineAvailable` decimal(15,2) DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetDescriptionT`
--

CREATE TABLE `BudgetDescriptionT` (
  `DescriptionID` int(11) NOT NULL,
  `UserID` int(11) DEFAULT NULL,
  `UserDescriptionID` int(11) DEFAULT NULL,
  `InOrOut` enum('In','Out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsSystemDescription` tinyint(1) NOT NULL DEFAULT '0',
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetEstimateAllowanceT`
--

CREATE TABLE `BudgetEstimateAllowanceT` (
  `EstimateID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserEstimateID` int(11) NOT NULL,
  `InOrOut` enum('In','Out') COLLATE utf8mb4_unicode_ci NOT NULL,
  `FromNameOrToName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateBegin` date NOT NULL,
  `DateEnd` date DEFAULT NULL,
  `Amount` decimal(15,2) NOT NULL,
  `RecurrenceID` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetInT`
--

CREATE TABLE `BudgetInT` (
  `InID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserInID` int(11) NOT NULL,
  `FromName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateBegin` date NOT NULL,
  `DateEnd` date DEFAULT NULL,
  `Amount` decimal(15,2) NOT NULL,
  `RecurrenceID` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Estimated` tinyint(1) NOT NULL DEFAULT '0',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetLeaseRentT`
--

CREATE TABLE `BudgetLeaseRentT` (
  `LeaseRentID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserLeaseRentID` int(11) NOT NULL,
  `ToName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `AgreementDate` date NOT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PaymentDateBegin` date NOT NULL,
  `PaymentDateEnd` date DEFAULT NULL,
  `PaymentAmount` decimal(15,2) NOT NULL,
  `PaymentAmountIsEstimated` tinyint(1) NOT NULL DEFAULT '0',
  `RecurrenceID` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetLoanT`
--

CREATE TABLE `BudgetLoanT` (
  `LoanID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserLoanID` int(11) NOT NULL,
  `FromName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateLoan` date NOT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `LoanAmount` decimal(15,2) NOT NULL,
  `LoanAmountIsEstimated` tinyint(1) NOT NULL DEFAULT '0',
  `PaymentDateBegin` date NOT NULL,
  `PaymentDateEnd` date NOT NULL,
  `PaymentAmount` decimal(15,2) NOT NULL,
  `PaymentAmountIsEstimated` tinyint(1) NOT NULL DEFAULT '0',
  `RecurrenceID` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetMyInvestmentT`
--

CREATE TABLE `BudgetMyInvestmentT` (
  `InvestmentID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserInvestmentID` int(11) NOT NULL,
  `Account` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BalanceCurrent` decimal(12,2) NOT NULL DEFAULT '0.00',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetMyMoneyT`
--

CREATE TABLE `BudgetMyMoneyT` (
  `MoneyID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserMoneyID` int(11) NOT NULL,
  `AccountPocket` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `BalanceCurrent` decimal(12,2) NOT NULL DEFAULT '0.00',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetOutT`
--

CREATE TABLE `BudgetOutT` (
  `OutID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserOutID` int(11) NOT NULL,
  `ToName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateBegin` date NOT NULL,
  `DateEnd` date DEFAULT NULL,
  `Amount` decimal(15,2) NOT NULL,
  `RecurrenceID` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Estimated` tinyint(1) NOT NULL DEFAULT '0',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetRecurrenceMonthlyDayT`
--

CREATE TABLE `BudgetRecurrenceMonthlyDayT` (
  `RecurrenceMonthlyDayID` int(11) NOT NULL,
  `RecurrenceID` int(11) NOT NULL,
  `DayOfMonth` tinyint(3) UNSIGNED DEFAULT NULL,
  `IsLastDay` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetRecurrenceT`
--

CREATE TABLE `BudgetRecurrenceT` (
  `RecurrenceID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserRecurrenceID` int(11) NOT NULL,
  `FrequencyType` enum('OneTime','Daily','Weekly','Monthly','Yearly') COLLATE utf8mb4_unicode_ci NOT NULL,
  `IntervalNumber` int(11) NOT NULL DEFAULT '1',
  `DailyPattern` enum('Interval','Weekday','WeekendDay') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MonthlyPattern` enum('NumberedDays','OrdinalWeekday') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OrdinalPosition` enum('First','Second','Third','Fourth','Last') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OrdinalWeekday` enum('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `YearlyPattern` enum('SpecificDate','OrdinalWeekday') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `YearMonth` tinyint(3) UNSIGNED DEFAULT NULL,
  `YearDay` tinyint(3) UNSIGNED DEFAULT NULL,
  `RangeType` enum('NoEnd','EndDate','OccurrenceCount') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OccurrenceCount` int(11) UNSIGNED DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetRecurrenceWeeklyDayT`
--

CREATE TABLE `BudgetRecurrenceWeeklyDayT` (
  `RecurrenceWeeklyDayID` int(11) NOT NULL,
  `RecurrenceID` int(11) NOT NULL,
  `DayOfWeek` enum('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `BudgetSubscriptionT`
--

CREATE TABLE `BudgetSubscriptionT` (
  `SubscriptionID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `UserSubscriptionID` int(11) NOT NULL,
  `ToName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Amount` decimal(15,2) NOT NULL,
  `DateBegin` date NOT NULL,
  `DateEnd` date DEFAULT NULL,
  `PaymentAccount` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `RecurrenceID` int(11) NOT NULL,
  `AutoRenew` tinyint(1) NOT NULL DEFAULT '0',
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  `Estimated` tinyint(1) NOT NULL DEFAULT '0',
  `Note` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `etfActivityT`
--

CREATE TABLE `etfActivityT` (
  `etfActivityID` int(11) NOT NULL,
  `UserEtfActivityID` int(11) NOT NULL DEFAULT '1',
  `UserID` int(11) NOT NULL,
  `etfCategoryID` int(11) NOT NULL,
  `etfSymbolID` int(11) NOT NULL,
  `TransactionType` enum('BUY','SELL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `TransactionDate` date NOT NULL,
  `Shares` decimal(15,6) NOT NULL,
  `PurchaseCost` decimal(15,4) DEFAULT NULL,
  `SalePrice` decimal(15,4) DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `etfCategoryT`
--

CREATE TABLE `etfCategoryT` (
  `etfCategoryID` int(11) NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int(11) NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `etfSymbolT`
--

CREATE TABLE `etfSymbolT` (
  `etfSymbolID` int(11) NOT NULL,
  `symbol` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `etfCategoryID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `listDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `FamilyTreeT`
--

CREATE TABLE `FamilyTreeT` (
  `FamilyTreeID` int(11) NOT NULL,
  `FamilyTreeCode` varchar(20) NOT NULL,
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `LastActivityAt` datetime NOT NULL,
  `LastActivityByUserID` int(11) NOT NULL,
  `Status` varchar(30) NOT NULL,
  `MergedIntoFamilyTreeID` int(11) DEFAULT NULL,
  `MergedAt` datetime DEFAULT NULL,
  `MergedByUserID` int(11) DEFAULT NULL,
  `WarningSentAt` datetime DEFAULT NULL,
  `RetentionExtendedUntil` datetime DEFAULT NULL,
  `PendingDeletionAt` datetime DEFAULT NULL,
  `ScheduledDeletionAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTContactT`
--

CREATE TABLE `FTContactT` (
  `ContactID` int(11) NOT NULL,
  `PersonID` int(11) NOT NULL,
  `ContactType` varchar(50) NOT NULL,
  `ContactValue` varchar(255) NOT NULL,
  `ContactNote` text,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedByUserID` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTEventPersonT`
--

CREATE TABLE `FTEventPersonT` (
  `EventPersonID` int(11) NOT NULL,
  `EventID` int(11) NOT NULL,
  `PersonID` int(11) NOT NULL,
  `PersonRole` varchar(50) DEFAULT NULL,
  `AddedByUserID` int(11) NOT NULL,
  `AddedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTEventT`
--

CREATE TABLE `FTEventT` (
  `EventID` int(11) NOT NULL,
  `EventType` varchar(100) NOT NULL,
  `EventDate` date DEFAULT NULL,
  `EventPlace` varchar(255) DEFAULT NULL,
  `EventDescription` text,
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedByUserID` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTFamilyTreeActivityT`
--

CREATE TABLE `FTFamilyTreeActivityT` (
  `ActivityID` bigint(20) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `ActivityType` varchar(30) NOT NULL,
  `EntityType` varchar(50) DEFAULT NULL,
  `EntityID` int(11) DEFAULT NULL,
  `AffectedPersonID` int(11) DEFAULT NULL,
  `TargetCreatedByUserID` int(11) DEFAULT NULL,
  `ActivityAt` datetime NOT NULL,
  `ActivityDescription` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTFamilyTreePersonT`
--

CREATE TABLE `FTFamilyTreePersonT` (
  `FamilyTreePersonID` int(11) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `PersonID` int(11) NOT NULL,
  `OriginFamilyTreeID` int(11) DEFAULT NULL,
  `AddedByUserID` int(11) NOT NULL,
  `AddedAt` datetime NOT NULL,
  `Notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTFamilyTreeUserT`
--

CREATE TABLE `FTFamilyTreeUserT` (
  `FamilyTreeUserID` int(11) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `JoinedAt` datetime NOT NULL,
  `LastActivityAt` datetime DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `AddedByUserID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTImageT`
--

CREATE TABLE `FTImageT` (
  `ImageID` int(11) NOT NULL,
  `PersonID` int(11) NOT NULL,
  `ImageType` varchar(20) NOT NULL,
  `ApproxAge` int(11) DEFAULT NULL,
  `ImageDate` date DEFAULT NULL,
  `StorageKey` varchar(500) NOT NULL,
  `OriginalFileName` varchar(255) DEFAULT NULL,
  `Caption` varchar(500) DEFAULT NULL,
  `SortOrder` int(11) NOT NULL DEFAULT '0',
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedByUserID` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTNotificationT`
--

CREATE TABLE `FTNotificationT` (
  `NotificationID` bigint(20) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `ActivityID` bigint(20) DEFAULT NULL,
  `RecipientPersonID` int(11) DEFAULT NULL,
  `RecipientUserID` int(11) DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `NotificationType` varchar(50) NOT NULL,
  `DeliveryMethod` varchar(20) NOT NULL,
  `NotificationText` text NOT NULL,
  `Status` varchar(20) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `SentAt` datetime DEFAULT NULL,
  `FailureReason` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTParentT`
--

CREATE TABLE `FTParentT` (
  `ParentRelationshipID` int(11) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `PersonID` int(11) NOT NULL,
  `ParentPersonID` int(11) NOT NULL,
  `ParentType` varchar(30) DEFAULT NULL,
  `AncestrySide` varchar(20) DEFAULT NULL,
  `Notes` text,
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedByUserID` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTPartnerT`
--

CREATE TABLE `FTPartnerT` (
  `PartnerRelationshipID` int(11) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `PersonID` int(11) NOT NULL,
  `PartnerPersonID` int(11) NOT NULL,
  `RelationshipType` varchar(30) DEFAULT NULL,
  `Notes` text,
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedByUserID` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTPersonMergeT`
--

CREATE TABLE `FTPersonMergeT` (
  `PersonMergeID` bigint(20) NOT NULL,
  `SourcePersonID` int(11) NOT NULL,
  `SurvivingPersonID` int(11) NOT NULL,
  `SourceFamilyTreeID` int(11) DEFAULT NULL,
  `SurvivingFamilyTreeID` int(11) DEFAULT NULL,
  `MergedByUserID` int(11) NOT NULL,
  `MergedAt` datetime NOT NULL,
  `MergeReason` varchar(100) NOT NULL DEFAULT 'OneTreeMethod',
  `ConflictResolutionJSON` longtext,
  `SourcePersonSnapshot` longtext NOT NULL,
  `SurvivingPersonSnapshotBefore` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTPersonT`
--

CREATE TABLE `FTPersonT` (
  `PersonID` int(11) NOT NULL,
  `FirstName` varchar(100) DEFAULT NULL,
  `MiddleName` varchar(100) DEFAULT NULL,
  `LastName` varchar(100) DEFAULT NULL,
  `SuffixName` varchar(50) DEFAULT NULL,
  `NickName` varchar(100) DEFAULT NULL,
  `MaidenName` varchar(100) DEFAULT NULL,
  `Gender` varchar(20) DEFAULT NULL,
  `BirthDate` date DEFAULT NULL,
  `BirthPlace` varchar(255) DEFAULT NULL,
  `Died` tinyint(1) NOT NULL DEFAULT '0',
  `DeathDate` date DEFAULT NULL,
  `CreatedByUserID` int(11) NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedByUserID` int(11) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `FTRecordArchiveT`
--

CREATE TABLE `FTRecordArchiveT` (
  `ArchiveID` bigint(20) NOT NULL,
  `FamilyTreeID` int(11) NOT NULL,
  `EntityType` varchar(50) NOT NULL,
  `EntityID` int(11) NOT NULL,
  `AffectedPersonID` int(11) DEFAULT NULL,
  `OriginalCreatedByUserID` int(11) DEFAULT NULL,
  `ChangedByUserID` int(11) NOT NULL,
  `ChangeType` varchar(20) NOT NULL,
  `BeforeData` longtext NOT NULL,
  `AfterData` longtext,
  `ArchivedAt` datetime NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `RestoredAt` datetime DEFAULT NULL,
  `RestoredByUserID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `InterestEarnedT`
--

CREATE TABLE `InterestEarnedT` (
  `IntErndID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `CompanyName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ContractNumber` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateOpened` date NOT NULL,
  `Rate` decimal(5,2) NOT NULL,
  `UserIntErndID` int(11) NOT NULL,
  `Notes` varchar(2000) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `LoginVerificationT`
--

CREATE TABLE `LoginVerificationT` (
  `VerificationID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `VerificationCode` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TempToken` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `IsVerified` tinyint(1) NOT NULL DEFAULT '0',
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TrackUsageT`
--

CREATE TABLE `TrackUsageT` (
  `ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Page` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Action` enum('View','TimeSpent') COLLATE utf8mb4_unicode_ci NOT NULL,
  `Duration` int(11) DEFAULT NULL,
  `Timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UserSequenceT`
--

CREATE TABLE `UserSequenceT` (
  `UserID` int(11) NOT NULL,
  `TableName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NextID` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UsersT`
--

CREATE TABLE `UsersT` (
  `UserID` int(11) NOT NULL,
  `UserName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PasswordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone1` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Phone2` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `WeightActivitiesT`
--

CREATE TABLE `WeightActivitiesT` (
  `WeightActivityID` int(11) NOT NULL,
  `WeightID` int(11) NOT NULL,
  `ActivityID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `WeightsT`
--

CREATE TABLE `WeightsT` (
  `WeightID` int(11) NOT NULL,
  `DateWeight` date NOT NULL,
  `Weight` decimal(4,1) NOT NULL,
  `UserID` int(11) DEFAULT '1',
  `TimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UserWeightID` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ActivitiesT`
--
ALTER TABLE `ActivitiesT`
  ADD PRIMARY KEY (`ActivityID`),
  ADD UNIQUE KEY `unique_activity_per_user` (`Activity`,`UserID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `BudgetCardT`
--
ALTER TABLE `BudgetCardT`
  ADD PRIMARY KEY (`CardID`),
  ADD UNIQUE KEY `uq_card_user_number` (`UserID`,`UserCardID`),
  ADD UNIQUE KEY `uq_card_account` (`UserID`,`AccountName`,`Last4Digits`),
  ADD KEY `idx_card_user_active` (`UserID`,`Active`);

--
-- Indexes for table `BudgetDescriptionT`
--
ALTER TABLE `BudgetDescriptionT`
  ADD PRIMARY KEY (`DescriptionID`),
  ADD UNIQUE KEY `uq_description_user_number` (`UserID`,`UserDescriptionID`),
  ADD UNIQUE KEY `uq_description_user_text` (`UserID`,`InOrOut`,`Description`),
  ADD KEY `idx_description_user_active` (`UserID`,`InOrOut`,`Active`);

--
-- Indexes for table `BudgetEstimateAllowanceT`
--
ALTER TABLE `BudgetEstimateAllowanceT`
  ADD PRIMARY KEY (`EstimateID`),
  ADD UNIQUE KEY `uq_estimate_user_number` (`UserID`,`UserEstimateID`),
  ADD UNIQUE KEY `uq_estimate_recurrence` (`RecurrenceID`),
  ADD KEY `idx_estimate_user_active` (`UserID`,`Active`,`InOrOut`),
  ADD KEY `idx_estimate_dates` (`UserID`,`DateBegin`,`DateEnd`),
  ADD KEY `fk_estimate_recurrence_user` (`RecurrenceID`,`UserID`);

--
-- Indexes for table `BudgetInT`
--
ALTER TABLE `BudgetInT`
  ADD PRIMARY KEY (`InID`),
  ADD UNIQUE KEY `uq_budgetin_user_number` (`UserID`,`UserInID`),
  ADD UNIQUE KEY `uq_budgetin_recurrence` (`RecurrenceID`),
  ADD KEY `idx_budgetin_user_active` (`UserID`,`Active`),
  ADD KEY `idx_budgetin_dates` (`UserID`,`DateBegin`,`DateEnd`),
  ADD KEY `fk_budgetin_recurrence_user` (`RecurrenceID`,`UserID`);

--
-- Indexes for table `BudgetLeaseRentT`
--
ALTER TABLE `BudgetLeaseRentT`
  ADD PRIMARY KEY (`LeaseRentID`),
  ADD UNIQUE KEY `uq_leaserent_user_number` (`UserID`,`UserLeaseRentID`),
  ADD UNIQUE KEY `uq_leaserent_recurrence` (`RecurrenceID`),
  ADD KEY `idx_leaserent_user_active` (`UserID`,`Active`),
  ADD KEY `idx_leaserent_payment_dates` (`UserID`,`PaymentDateBegin`,`PaymentDateEnd`),
  ADD KEY `fk_leaserent_recurrence_user` (`RecurrenceID`,`UserID`);

--
-- Indexes for table `BudgetLoanT`
--
ALTER TABLE `BudgetLoanT`
  ADD PRIMARY KEY (`LoanID`),
  ADD UNIQUE KEY `uq_loan_user_number` (`UserID`,`UserLoanID`),
  ADD UNIQUE KEY `uq_loan_recurrence` (`RecurrenceID`),
  ADD KEY `idx_loan_user_active` (`UserID`,`Active`),
  ADD KEY `idx_loan_payment_dates` (`UserID`,`PaymentDateBegin`,`PaymentDateEnd`),
  ADD KEY `fk_loan_recurrence_user` (`RecurrenceID`,`UserID`);

--
-- Indexes for table `BudgetMyInvestmentT`
--
ALTER TABLE `BudgetMyInvestmentT`
  ADD PRIMARY KEY (`InvestmentID`),
  ADD UNIQUE KEY `UQ_BudgetMyInvestmentT_User_UserInvestmentID` (`UserID`,`UserInvestmentID`),
  ADD KEY `IX_BudgetMyInvestmentT_UserID` (`UserID`);

--
-- Indexes for table `BudgetMyMoneyT`
--
ALTER TABLE `BudgetMyMoneyT`
  ADD PRIMARY KEY (`MoneyID`),
  ADD UNIQUE KEY `UQ_BudgetMyMoneyT_User_UserMoneyID` (`UserID`,`UserMoneyID`),
  ADD KEY `IX_BudgetMyMoneyT_UserID` (`UserID`);

--
-- Indexes for table `BudgetOutT`
--
ALTER TABLE `BudgetOutT`
  ADD PRIMARY KEY (`OutID`),
  ADD UNIQUE KEY `uq_budgetout_user_number` (`UserID`,`UserOutID`),
  ADD UNIQUE KEY `uq_budgetout_recurrence` (`RecurrenceID`),
  ADD KEY `idx_budgetout_user_active` (`UserID`,`Active`),
  ADD KEY `idx_budgetout_dates` (`UserID`,`DateBegin`,`DateEnd`),
  ADD KEY `fk_budgetout_recurrence_user` (`RecurrenceID`,`UserID`);

--
-- Indexes for table `BudgetRecurrenceMonthlyDayT`
--
ALTER TABLE `BudgetRecurrenceMonthlyDayT`
  ADD PRIMARY KEY (`RecurrenceMonthlyDayID`),
  ADD UNIQUE KEY `uq_recurrence_monthday` (`RecurrenceID`,`DayOfMonth`),
  ADD KEY `idx_monthday_recurrence` (`RecurrenceID`);

--
-- Indexes for table `BudgetRecurrenceT`
--
ALTER TABLE `BudgetRecurrenceT`
  ADD PRIMARY KEY (`RecurrenceID`),
  ADD UNIQUE KEY `uq_recurrence_user_number` (`UserID`,`UserRecurrenceID`),
  ADD UNIQUE KEY `uq_recurrence_id_user` (`RecurrenceID`,`UserID`),
  ADD KEY `idx_recurrence_user` (`UserID`);

--
-- Indexes for table `BudgetRecurrenceWeeklyDayT`
--
ALTER TABLE `BudgetRecurrenceWeeklyDayT`
  ADD PRIMARY KEY (`RecurrenceWeeklyDayID`),
  ADD UNIQUE KEY `uq_recurrence_weekday` (`RecurrenceID`,`DayOfWeek`),
  ADD KEY `idx_weekday_recurrence` (`RecurrenceID`);

--
-- Indexes for table `BudgetSubscriptionT`
--
ALTER TABLE `BudgetSubscriptionT`
  ADD PRIMARY KEY (`SubscriptionID`),
  ADD UNIQUE KEY `uq_subscription_user_number` (`UserID`,`UserSubscriptionID`),
  ADD UNIQUE KEY `uq_subscription_recurrence` (`RecurrenceID`),
  ADD KEY `idx_subscription_user_active` (`UserID`,`Active`),
  ADD KEY `idx_subscription_dates` (`UserID`,`DateBegin`,`DateEnd`),
  ADD KEY `fk_subscription_recurrence_user` (`RecurrenceID`,`UserID`);

--
-- Indexes for table `etfActivityT`
--
ALTER TABLE `etfActivityT`
  ADD PRIMARY KEY (`etfActivityID`),
  ADD UNIQUE KEY `unique_etf_transaction` (`UserID`,`etfSymbolID`,`TransactionType`,`TransactionDate`,`Shares`),
  ADD KEY `idx_etfActivity_user` (`UserID`),
  ADD KEY `idx_etfActivity_symbol` (`etfSymbolID`),
  ADD KEY `idx_etfActivity_category` (`etfCategoryID`);

--
-- Indexes for table `etfCategoryT`
--
ALTER TABLE `etfCategoryT`
  ADD PRIMARY KEY (`etfCategoryID`),
  ADD UNIQUE KEY `unique_category_user` (`category`,`UserID`),
  ADD KEY `fk_etfCategory_user` (`UserID`);

--
-- Indexes for table `etfSymbolT`
--
ALTER TABLE `etfSymbolT`
  ADD PRIMARY KEY (`etfSymbolID`),
  ADD UNIQUE KEY `unique_symbol_user` (`symbol`,`UserID`),
  ADD KEY `fk_etfSymbol_category` (`etfCategoryID`),
  ADD KEY `fk_etfSymbol_user` (`UserID`);

--
-- Indexes for table `FamilyTreeT`
--
ALTER TABLE `FamilyTreeT`
  ADD PRIMARY KEY (`FamilyTreeID`),
  ADD UNIQUE KEY `UQ_FamilyTreeT_FamilyTreeCode` (`FamilyTreeCode`),
  ADD KEY `IX_FamilyTreeT_CreatedByUserID` (`CreatedByUserID`),
  ADD KEY `IX_FamilyTreeT_LastActivityAt` (`LastActivityAt`),
  ADD KEY `IX_FamilyTreeT_Status` (`Status`),
  ADD KEY `IX_FamilyTreeT_MergedIntoFamilyTreeID` (`MergedIntoFamilyTreeID`);

--
-- Indexes for table `FTContactT`
--
ALTER TABLE `FTContactT`
  ADD PRIMARY KEY (`ContactID`),
  ADD KEY `IX_FTContactT_PersonID` (`PersonID`),
  ADD KEY `IX_FTContactT_Person_ContactType` (`PersonID`,`ContactType`),
  ADD KEY `IX_FTContactT_CreatedByUserID` (`CreatedByUserID`);

--
-- Indexes for table `FTEventPersonT`
--
ALTER TABLE `FTEventPersonT`
  ADD PRIMARY KEY (`EventPersonID`),
  ADD UNIQUE KEY `UQ_FTEventPersonT_Event_Person` (`EventID`,`PersonID`),
  ADD KEY `IX_FTEventPersonT_PersonID` (`PersonID`),
  ADD KEY `IX_FTEventPersonT_EventID` (`EventID`),
  ADD KEY `IX_FTEventPersonT_AddedByUserID` (`AddedByUserID`);

--
-- Indexes for table `FTEventT`
--
ALTER TABLE `FTEventT`
  ADD PRIMARY KEY (`EventID`),
  ADD KEY `IX_FTEventT_EventDate` (`EventDate`),
  ADD KEY `IX_FTEventT_EventType` (`EventType`),
  ADD KEY `IX_FTEventT_CreatedByUserID` (`CreatedByUserID`);

--
-- Indexes for table `FTFamilyTreeActivityT`
--
ALTER TABLE `FTFamilyTreeActivityT`
  ADD PRIMARY KEY (`ActivityID`),
  ADD KEY `IX_FTFamilyTreeActivityT_Tree_ActivityAt` (`FamilyTreeID`,`ActivityAt`),
  ADD KEY `IX_FTFamilyTreeActivityT_User_ActivityAt` (`UserID`,`ActivityAt`),
  ADD KEY `IX_FTFamilyTreeActivityT_AffectedPersonID` (`AffectedPersonID`),
  ADD KEY `IX_FTFamilyTreeActivityT_Entity` (`EntityType`,`EntityID`);

--
-- Indexes for table `FTFamilyTreePersonT`
--
ALTER TABLE `FTFamilyTreePersonT`
  ADD PRIMARY KEY (`FamilyTreePersonID`),
  ADD UNIQUE KEY `UQ_FTFamilyTreePersonT_Tree_Person` (`FamilyTreeID`,`PersonID`),
  ADD KEY `IX_FTFamilyTreePersonT_PersonID` (`PersonID`),
  ADD KEY `IX_FTFamilyTreePersonT_FamilyTreeID` (`FamilyTreeID`),
  ADD KEY `IX_FTFamilyTreePersonT_AddedByUserID` (`AddedByUserID`),
  ADD KEY `IX_FTFamilyTreePersonT_OriginFamilyTreeID` (`OriginFamilyTreeID`);

--
-- Indexes for table `FTFamilyTreeUserT`
--
ALTER TABLE `FTFamilyTreeUserT`
  ADD PRIMARY KEY (`FamilyTreeUserID`),
  ADD UNIQUE KEY `UQ_FTFamilyTreeUserT_Tree_User` (`FamilyTreeID`,`UserID`),
  ADD KEY `IX_FTFamilyTreeUserT_UserID` (`UserID`),
  ADD KEY `IX_FTFamilyTreeUserT_FamilyTreeID` (`FamilyTreeID`),
  ADD KEY `IX_FTFamilyTreeUserT_IsActive` (`IsActive`);

--
-- Indexes for table `FTImageT`
--
ALTER TABLE `FTImageT`
  ADD PRIMARY KEY (`ImageID`),
  ADD KEY `IX_FTImageT_PersonID` (`PersonID`),
  ADD KEY `IX_FTImageT_Person_ImageType` (`PersonID`,`ImageType`),
  ADD KEY `IX_FTImageT_CreatedByUserID` (`CreatedByUserID`);

--
-- Indexes for table `FTNotificationT`
--
ALTER TABLE `FTNotificationT`
  ADD PRIMARY KEY (`NotificationID`),
  ADD KEY `IX_FTNotificationT_FamilyTreeID` (`FamilyTreeID`),
  ADD KEY `IX_FTNotificationT_ActivityID` (`ActivityID`),
  ADD KEY `IX_FTNotificationT_RecipientPersonID` (`RecipientPersonID`),
  ADD KEY `IX_FTNotificationT_RecipientUserID` (`RecipientUserID`),
  ADD KEY `IX_FTNotificationT_Status` (`Status`),
  ADD KEY `IX_FTNotificationT_CreatedAt` (`CreatedAt`);

--
-- Indexes for table `FTParentT`
--
ALTER TABLE `FTParentT`
  ADD PRIMARY KEY (`ParentRelationshipID`),
  ADD UNIQUE KEY `UQ_FTParentT_Tree_Child_Parent` (`FamilyTreeID`,`PersonID`,`ParentPersonID`),
  ADD UNIQUE KEY `UQ_FTParentT_Tree_Child_AncestrySide` (`FamilyTreeID`,`PersonID`,`AncestrySide`),
  ADD KEY `IX_FTParentT_ParentPersonID` (`ParentPersonID`),
  ADD KEY `IX_FTParentT_PersonID` (`PersonID`),
  ADD KEY `IX_FTParentT_FamilyTreeID` (`FamilyTreeID`),
  ADD KEY `IX_FTParentT_CreatedByUserID` (`CreatedByUserID`);

--
-- Indexes for table `FTPartnerT`
--
ALTER TABLE `FTPartnerT`
  ADD PRIMARY KEY (`PartnerRelationshipID`),
  ADD UNIQUE KEY `UQ_FTPartnerT_Tree_Pair` (`FamilyTreeID`,`PersonID`,`PartnerPersonID`),
  ADD KEY `IX_FTPartnerT_PersonID` (`PersonID`),
  ADD KEY `IX_FTPartnerT_PartnerPersonID` (`PartnerPersonID`),
  ADD KEY `IX_FTPartnerT_FamilyTreeID` (`FamilyTreeID`),
  ADD KEY `IX_FTPartnerT_CreatedByUserID` (`CreatedByUserID`);

--
-- Indexes for table `FTPersonMergeT`
--
ALTER TABLE `FTPersonMergeT`
  ADD PRIMARY KEY (`PersonMergeID`),
  ADD UNIQUE KEY `UQ_FTPersonMergeT_SourcePersonID` (`SourcePersonID`),
  ADD KEY `IX_FTPersonMergeT_SurvivingPersonID` (`SurvivingPersonID`),
  ADD KEY `IX_FTPersonMergeT_SourceFamilyTreeID` (`SourceFamilyTreeID`),
  ADD KEY `IX_FTPersonMergeT_SurvivingFamilyTreeID` (`SurvivingFamilyTreeID`),
  ADD KEY `IX_FTPersonMergeT_MergedAt` (`MergedAt`),
  ADD KEY `IX_FTPersonMergeT_MergedByUserID` (`MergedByUserID`);

--
-- Indexes for table `FTPersonT`
--
ALTER TABLE `FTPersonT`
  ADD PRIMARY KEY (`PersonID`),
  ADD KEY `IX_FTPersonT_Last_First` (`LastName`,`FirstName`),
  ADD KEY `IX_FTPersonT_BirthDate` (`BirthDate`),
  ADD KEY `IX_FTPersonT_Last_First_BirthDate` (`LastName`,`FirstName`,`BirthDate`),
  ADD KEY `IX_FTPersonT_MaidenName` (`MaidenName`),
  ADD KEY `IX_FTPersonT_CreatedByUserID` (`CreatedByUserID`);

--
-- Indexes for table `FTRecordArchiveT`
--
ALTER TABLE `FTRecordArchiveT`
  ADD PRIMARY KEY (`ArchiveID`),
  ADD KEY `IX_FTRecordArchiveT_FamilyTreeID` (`FamilyTreeID`),
  ADD KEY `IX_FTRecordArchiveT_Entity` (`EntityType`,`EntityID`),
  ADD KEY `IX_FTRecordArchiveT_AffectedPersonID` (`AffectedPersonID`),
  ADD KEY `IX_FTRecordArchiveT_ExpiresAt` (`ExpiresAt`);

--
-- Indexes for table `InterestEarnedT`
--
ALTER TABLE `InterestEarnedT`
  ADD PRIMARY KEY (`IntErndID`),
  ADD UNIQUE KEY `UserID` (`UserID`,`CompanyName`,`ContractNumber`);

--
-- Indexes for table `LoginVerificationT`
--
ALTER TABLE `LoginVerificationT`
  ADD PRIMARY KEY (`VerificationID`),
  ADD KEY `fk_login_verification_user` (`UserID`);

--
-- Indexes for table `TrackUsageT`
--
ALTER TABLE `TrackUsageT`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_userid_action` (`UserID`,`Action`),
  ADD KEY `idx_timestamp` (`Timestamp`);

--
-- Indexes for table `UserSequenceT`
--
ALTER TABLE `UserSequenceT`
  ADD PRIMARY KEY (`UserID`,`TableName`);

--
-- Indexes for table `UsersT`
--
ALTER TABLE `UsersT`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `Username` (`UserName`);

--
-- Indexes for table `WeightActivitiesT`
--
ALTER TABLE `WeightActivitiesT`
  ADD PRIMARY KEY (`WeightActivityID`),
  ADD KEY `UserID` (`UserID`),
  ADD KEY `WeightActivitiesT_ibfk_1` (`WeightID`),
  ADD KEY `WeightActivitiesT_ibfk_2` (`ActivityID`),
  ADD KEY `idx_activity_user` (`ActivityID`,`UserID`);

--
-- Indexes for table `WeightsT`
--
ALTER TABLE `WeightsT`
  ADD PRIMARY KEY (`WeightID`),
  ADD UNIQUE KEY `unique_dateweight_per_user` (`DateWeight`,`UserID`),
  ADD KEY `UserID` (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ActivitiesT`
--
ALTER TABLE `ActivitiesT`
  MODIFY `ActivityID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;
--
-- AUTO_INCREMENT for table `BudgetCardT`
--
ALTER TABLE `BudgetCardT`
  MODIFY `CardID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `BudgetDescriptionT`
--
ALTER TABLE `BudgetDescriptionT`
  MODIFY `DescriptionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
--
-- AUTO_INCREMENT for table `BudgetEstimateAllowanceT`
--
ALTER TABLE `BudgetEstimateAllowanceT`
  MODIFY `EstimateID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `BudgetInT`
--
ALTER TABLE `BudgetInT`
  MODIFY `InID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT for table `BudgetLeaseRentT`
--
ALTER TABLE `BudgetLeaseRentT`
  MODIFY `LeaseRentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `BudgetLoanT`
--
ALTER TABLE `BudgetLoanT`
  MODIFY `LoanID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `BudgetMyInvestmentT`
--
ALTER TABLE `BudgetMyInvestmentT`
  MODIFY `InvestmentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `BudgetMyMoneyT`
--
ALTER TABLE `BudgetMyMoneyT`
  MODIFY `MoneyID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `BudgetOutT`
--
ALTER TABLE `BudgetOutT`
  MODIFY `OutID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `BudgetRecurrenceMonthlyDayT`
--
ALTER TABLE `BudgetRecurrenceMonthlyDayT`
  MODIFY `RecurrenceMonthlyDayID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;
--
-- AUTO_INCREMENT for table `BudgetRecurrenceT`
--
ALTER TABLE `BudgetRecurrenceT`
  MODIFY `RecurrenceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;
--
-- AUTO_INCREMENT for table `BudgetRecurrenceWeeklyDayT`
--
ALTER TABLE `BudgetRecurrenceWeeklyDayT`
  MODIFY `RecurrenceWeeklyDayID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
--
-- AUTO_INCREMENT for table `BudgetSubscriptionT`
--
ALTER TABLE `BudgetSubscriptionT`
  MODIFY `SubscriptionID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT for table `etfActivityT`
--
ALTER TABLE `etfActivityT`
  MODIFY `etfActivityID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;
--
-- AUTO_INCREMENT for table `etfCategoryT`
--
ALTER TABLE `etfCategoryT`
  MODIFY `etfCategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT for table `etfSymbolT`
--
ALTER TABLE `etfSymbolT`
  MODIFY `etfSymbolID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=215;
--
-- AUTO_INCREMENT for table `FamilyTreeT`
--
ALTER TABLE `FamilyTreeT`
  MODIFY `FamilyTreeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `FTContactT`
--
ALTER TABLE `FTContactT`
  MODIFY `ContactID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `FTEventPersonT`
--
ALTER TABLE `FTEventPersonT`
  MODIFY `EventPersonID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT for table `FTEventT`
--
ALTER TABLE `FTEventT`
  MODIFY `EventID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT for table `FTFamilyTreeActivityT`
--
ALTER TABLE `FTFamilyTreeActivityT`
  MODIFY `ActivityID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=372;
--
-- AUTO_INCREMENT for table `FTFamilyTreePersonT`
--
ALTER TABLE `FTFamilyTreePersonT`
  MODIFY `FamilyTreePersonID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=158;
--
-- AUTO_INCREMENT for table `FTFamilyTreeUserT`
--
ALTER TABLE `FTFamilyTreeUserT`
  MODIFY `FamilyTreeUserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT for table `FTImageT`
--
ALTER TABLE `FTImageT`
  MODIFY `ImageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;
--
-- AUTO_INCREMENT for table `FTNotificationT`
--
ALTER TABLE `FTNotificationT`
  MODIFY `NotificationID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `FTParentT`
--
ALTER TABLE `FTParentT`
  MODIFY `ParentRelationshipID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;
--
-- AUTO_INCREMENT for table `FTPartnerT`
--
ALTER TABLE `FTPartnerT`
  MODIFY `PartnerRelationshipID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;
--
-- AUTO_INCREMENT for table `FTPersonMergeT`
--
ALTER TABLE `FTPersonMergeT`
  MODIFY `PersonMergeID` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `FTPersonT`
--
ALTER TABLE `FTPersonT`
  MODIFY `PersonID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;
--
-- AUTO_INCREMENT for table `FTRecordArchiveT`
--
ALTER TABLE `FTRecordArchiveT`
  MODIFY `ArchiveID` bigint(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `InterestEarnedT`
--
ALTER TABLE `InterestEarnedT`
  MODIFY `IntErndID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;
--
-- AUTO_INCREMENT for table `LoginVerificationT`
--
ALTER TABLE `LoginVerificationT`
  MODIFY `VerificationID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;
--
-- AUTO_INCREMENT for table `TrackUsageT`
--
ALTER TABLE `TrackUsageT`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12528;
--
-- AUTO_INCREMENT for table `UsersT`
--
ALTER TABLE `UsersT`
  MODIFY `UserID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;
--
-- AUTO_INCREMENT for table `WeightActivitiesT`
--
ALTER TABLE `WeightActivitiesT`
  MODIFY `WeightActivityID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=429;
--
-- AUTO_INCREMENT for table `WeightsT`
--
ALTER TABLE `WeightsT`
  MODIFY `WeightID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=860;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `ActivitiesT`
--
ALTER TABLE `ActivitiesT`
  ADD CONSTRAINT `ActivitiesT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetCardT`
--
ALTER TABLE `BudgetCardT`
  ADD CONSTRAINT `fk_card_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetDescriptionT`
--
ALTER TABLE `BudgetDescriptionT`
  ADD CONSTRAINT `fk_description_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetEstimateAllowanceT`
--
ALTER TABLE `BudgetEstimateAllowanceT`
  ADD CONSTRAINT `fk_estimate_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_estimate_recurrence_user` FOREIGN KEY (`RecurrenceID`,`UserID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`, `UserID`) ON UPDATE CASCADE;

--
-- Constraints for table `BudgetInT`
--
ALTER TABLE `BudgetInT`
  ADD CONSTRAINT `fk_budgetin_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_budgetin_recurrence_user` FOREIGN KEY (`RecurrenceID`,`UserID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`, `UserID`) ON UPDATE CASCADE;

--
-- Constraints for table `BudgetLeaseRentT`
--
ALTER TABLE `BudgetLeaseRentT`
  ADD CONSTRAINT `fk_leaserent_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_leaserent_recurrence_user` FOREIGN KEY (`RecurrenceID`,`UserID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`, `UserID`) ON UPDATE CASCADE;

--
-- Constraints for table `BudgetLoanT`
--
ALTER TABLE `BudgetLoanT`
  ADD CONSTRAINT `fk_loan_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_loan_recurrence_user` FOREIGN KEY (`RecurrenceID`,`UserID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`, `UserID`) ON UPDATE CASCADE;

--
-- Constraints for table `BudgetMyInvestmentT`
--
ALTER TABLE `BudgetMyInvestmentT`
  ADD CONSTRAINT `FK_BudgetMyInvestmentT_UsersT` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetMyMoneyT`
--
ALTER TABLE `BudgetMyMoneyT`
  ADD CONSTRAINT `FK_BudgetMyMoneyT_UsersT` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetOutT`
--
ALTER TABLE `BudgetOutT`
  ADD CONSTRAINT `fk_budgetout_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_budgetout_recurrence_user` FOREIGN KEY (`RecurrenceID`,`UserID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`, `UserID`) ON UPDATE CASCADE;

--
-- Constraints for table `BudgetRecurrenceMonthlyDayT`
--
ALTER TABLE `BudgetRecurrenceMonthlyDayT`
  ADD CONSTRAINT `fk_monthday_recurrence` FOREIGN KEY (`RecurrenceID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetRecurrenceT`
--
ALTER TABLE `BudgetRecurrenceT`
  ADD CONSTRAINT `fk_recurrence_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetRecurrenceWeeklyDayT`
--
ALTER TABLE `BudgetRecurrenceWeeklyDayT`
  ADD CONSTRAINT `fk_weekday_recurrence` FOREIGN KEY (`RecurrenceID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BudgetSubscriptionT`
--
ALTER TABLE `BudgetSubscriptionT`
  ADD CONSTRAINT `fk_subscription_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_subscription_recurrence_user` FOREIGN KEY (`RecurrenceID`,`UserID`) REFERENCES `BudgetRecurrenceT` (`RecurrenceID`, `UserID`) ON UPDATE CASCADE;

--
-- Constraints for table `etfActivityT`
--
ALTER TABLE `etfActivityT`
  ADD CONSTRAINT `fk_etfActivity_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_etfActivity_category` FOREIGN KEY (`etfCategoryID`) REFERENCES `etfCategoryT` (`etfCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_etfActivity_symbol` FOREIGN KEY (`etfSymbolID`) REFERENCES `etfSymbolT` (`etfSymbolID`) ON UPDATE CASCADE;

--
-- Constraints for table `etfCategoryT`
--
ALTER TABLE `etfCategoryT`
  ADD CONSTRAINT `fk_etfCategory_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `etfSymbolT`
--
ALTER TABLE `etfSymbolT`
  ADD CONSTRAINT `fk_etfSymbol_category` FOREIGN KEY (`etfCategoryID`) REFERENCES `etfCategoryT` (`etfCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_etfSymbol_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `InterestEarnedT`
--
ALTER TABLE `InterestEarnedT`
  ADD CONSTRAINT `InterestEarnedT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `LoginVerificationT`
--
ALTER TABLE `LoginVerificationT`
  ADD CONSTRAINT `fk_login_verification_user` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `TrackUsageT`
--
ALTER TABLE `TrackUsageT`
  ADD CONSTRAINT `TrackUsageT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserSequenceT`
--
ALTER TABLE `UserSequenceT`
  ADD CONSTRAINT `UserSequenceT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `WeightActivitiesT`
--
ALTER TABLE `WeightActivitiesT`
  ADD CONSTRAINT `WeightActivitiesT_ibfk_1` FOREIGN KEY (`WeightID`) REFERENCES `WeightsT` (`WeightID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `WeightActivitiesT_ibfk_2` FOREIGN KEY (`ActivityID`) REFERENCES `ActivitiesT` (`ActivityID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `WeightActivitiesT_ibfk_3` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `WeightsT`
--
ALTER TABLE `WeightsT`
  ADD CONSTRAINT `WeightsT_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
