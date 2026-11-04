-- Wonderful Apps Stage 6 Group 5G: charter/UserID 62 -- READ ONLY
-- Derived from wappsTtest11226Dump.sql, 2026-11-02.
-- Execute against wapps_test; this script makes NO changes.
-- First query must identify UserID 62 as charter before considering deletion.
SELECT UserID, UserName FROM `wapps_test`.`UsersT`
WHERE UserID = 62 OR UserName = 'charter';

-- Returns only tables with at least one row referencing UserID 62.
-- Covers columns named UserID, ...ByUserID or RecipientUserID in the dump.
SELECT * FROM (
  SELECT 'ActivitiesT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`ActivitiesT` WHERE `UserID` = 62
UNION ALL
  SELECT 'AdminSubscriptionGrantT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`AdminSubscriptionGrantT` WHERE `UserID` = 62 OR `GrantedByUserID` = 62 OR `ModifiedByUserID` = 62 OR `RevokedByUserID` = 62
UNION ALL
  SELECT 'BudgetCardT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetCardT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetDescriptionT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetDescriptionT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetEstimateAllowanceT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetEstimateAllowanceT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetInT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetInT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetLeaseRentT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetLeaseRentT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetLoanT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetLoanT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetMyInvestmentT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetMyInvestmentT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetMyMoneyT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetMyMoneyT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetOutT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetOutT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetRecurrenceT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetRecurrenceT` WHERE `UserID` = 62
UNION ALL
  SELECT 'BudgetSubscriptionT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`BudgetSubscriptionT` WHERE `UserID` = 62
UNION ALL
  SELECT 'etfActivityT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`etfActivityT` WHERE `UserID` = 62
UNION ALL
  SELECT 'etfCategoryT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`etfCategoryT` WHERE `UserID` = 62
UNION ALL
  SELECT 'etfSymbolT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`etfSymbolT` WHERE `UserID` = 62
UNION ALL
  SELECT 'FamilyTreeT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FamilyTreeT` WHERE `CreatedByUserID` = 62 OR `LastActivityByUserID` = 62 OR `MergedByUserID` = 62
UNION ALL
  SELECT 'FTContactEmailVerificationT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTContactEmailVerificationT` WHERE `RequestedByUserID` = 62
UNION ALL
  SELECT 'FTContactT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTContactT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTEventPersonT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTEventPersonT` WHERE `AddedByUserID` = 62
UNION ALL
  SELECT 'FTEventT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTEventT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTFamilyTreeActivityT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTFamilyTreeActivityT` WHERE `UserID` = 62 OR `TargetCreatedByUserID` = 62
UNION ALL
  SELECT 'FTFamilyTreePersonT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTFamilyTreePersonT` WHERE `AddedByUserID` = 62
UNION ALL
  SELECT 'FTFamilyTreeUserT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTFamilyTreeUserT` WHERE `UserID` = 62 OR `AddedByUserID` = 62
UNION ALL
  SELECT 'FTImageT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTImageT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTNetworkT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTNetworkT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTNetworkVerificationT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTNetworkVerificationT` WHERE `RequestedByUserID` = 62
UNION ALL
  SELECT 'FTNotificationT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTNotificationT` WHERE `RecipientUserID` = 62
UNION ALL
  SELECT 'FTParentT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTParentT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTPartnerT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPartnerT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTPersonMergeT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPersonMergeT` WHERE `MergedByUserID` = 62 OR `UndoByUserID` = 62
UNION ALL
  SELECT 'FTPersonPrivacyT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPersonPrivacyT` WHERE `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTPersonT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPersonT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTPetT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPetT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTPrivacyAttemptT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPrivacyAttemptT` WHERE `UserID` = 62
UNION ALL
  SELECT 'FTPrivacyRequestT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPrivacyRequestT` WHERE `RequestedByUserID` = 62
UNION ALL
  SELECT 'FTPrivacyUnlockT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTPrivacyUnlockT` WHERE `UserID` = 62
UNION ALL
  SELECT 'FTRecordArchiveT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTRecordArchiveT` WHERE `OriginalCreatedByUserID` = 62 OR `ChangedByUserID` = 62 OR `RestoredByUserID` = 62
UNION ALL
  SELECT 'FTSiblingT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTSiblingT` WHERE `CreatedByUserID` = 62 OR `UpdatedByUserID` = 62
UNION ALL
  SELECT 'FTTreeMergeT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`FTTreeMergeT` WHERE `MergedByUserID` = 62 OR `UndoneByUserID` = 62
UNION ALL
  SELECT 'InterestEarnedT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`InterestEarnedT` WHERE `UserID` = 62
UNION ALL
  SELECT 'LoginVerificationT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`LoginVerificationT` WHERE `UserID` = 62
UNION ALL
  SELECT 'NotificationConsentHistoryT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`NotificationConsentHistoryT` WHERE `UserID` = 62
UNION ALL
  SELECT 'NotificationHistoryT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`NotificationHistoryT` WHERE `UserID` = 62
UNION ALL
  SELECT 'NotificationPreferencesT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`NotificationPreferencesT` WHERE `UserID` = 62
UNION ALL
  SELECT 'PasswordResetT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`PasswordResetT` WHERE `UserID` = 62
UNION ALL
  SELECT 'PromoRedemptionT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`PromoRedemptionT` WHERE `UserID` = 62
UNION ALL
  SELECT 'TNNADeviceT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`TNNADeviceT` WHERE `UserID` = 62
UNION ALL
  SELECT 'TNNARefreshTokenT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`TNNARefreshTokenT` WHERE `UserID` = 62
UNION ALL
  SELECT 'TNNAUserT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`TNNAUserT` WHERE `UserID` = 62
UNION ALL
  SELECT 'TrackUsageT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`TrackUsageT` WHERE `UserID` = 62
UNION ALL
  SELECT 'UserAgreementHistoryT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`UserAgreementHistoryT` WHERE `UserID` = 62
UNION ALL
  SELECT 'UserSecurityT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`UserSecurityT` WHERE `UserID` = 62
UNION ALL
  SELECT 'UserSequenceT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`UserSequenceT` WHERE `UserID` = 62
UNION ALL
  SELECT 'UserSubscriptionT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`UserSubscriptionT` WHERE `UserID` = 62
UNION ALL
  SELECT 'UserUsageT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`UserUsageT` WHERE `UserID` = 62
UNION ALL
  SELECT 'WebSessionT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`WebSessionT` WHERE `UserID` = 62
UNION ALL
  SELECT 'WeightActivitiesT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`WeightActivitiesT` WHERE `UserID` = 62
UNION ALL
  SELECT 'WeightsT' AS TableName, COUNT(*) AS MatchingRows FROM `wapps_test`.`WeightsT` WHERE `UserID` = 62
) AS Matches WHERE MatchingRows > 0 ORDER BY TableName;
