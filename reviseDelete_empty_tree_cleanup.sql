/*
  reviseDelete_empty_tree_cleanup.sql
  Wonderful Apps - Family Tree empty-tree/orphan-membership repair

  PURPOSE
  -------
  One-time repair for the September 24, 2026 reviseDelete regression case:

      FamilyTreeCode:       FT-3YPS3ELD
      FamilyTreeID:         25
      Orphan membership:    FamilyTreePersonID 347
      Missing PersonID:     196

  The current dump shows that FTFamilyTreePersonT row 347 still points to
  PersonID 196 even though FTPersonT no longer contains PersonID 196. That
  orphan membership prevents the application from recognizing Tree 25 as
  empty.

  This script removes the orphan membership and removes Tree 25 only if no
  valid or residual memberships remain afterward. Permanent activity history
  and notification history are intentionally retained.

  IMPORTANT
  ---------
  1. Run the PRE-FLIGHT SELECTS first.
  2. Confirm they still describe the expected development-test data.
  3. Run the transaction.
  4. Review the POST-REPAIR SELECTS before COMMIT. Replace COMMIT with ROLLBACK
     if the verification results are not as expected.
*/

/* ========================================================================== */
/* PRE-FLIGHT: READ-ONLY CHECKS                                                */
/* ========================================================================== */

SELECT FamilyTreeID, FamilyTreeCode, Status, CreatedAt, CreatedByUserID,
       LastActivityAt, LastActivityByUserID
FROM FamilyTreeT
WHERE FamilyTreeID = 25
   OR FamilyTreeCode = 'FT-3YPS3ELD';

SELECT ftp.FamilyTreePersonID,
       ftp.FamilyTreeID,
       ftp.PersonID,
       ftp.OriginFamilyTreeID,
       ftp.AddedByUserID,
       ftp.AddedAt,
       CASE WHEN p.PersonID IS NULL THEN 'ORPHAN' ELSE 'VALID' END AS MembershipStatus
FROM FTFamilyTreePersonT ftp
LEFT JOIN FTPersonT p
  ON p.PersonID = ftp.PersonID
WHERE ftp.FamilyTreeID = 25
ORDER BY ftp.FamilyTreePersonID;

SELECT PersonID, FirstName, MiddleName, LastName, CreatedByUserID, CreatedAt
FROM FTPersonT
WHERE PersonID = 196;

SELECT FamilyTreeUserID, FamilyTreeID, UserID, JoinedAt, LastActivityAt,
       IsActive, AddedByUserID
FROM FTFamilyTreeUserT
WHERE FamilyTreeID = 25
ORDER BY FamilyTreeUserID;

/* Review all orphan Family Tree memberships currently present in the DB. */
SELECT ftp.FamilyTreePersonID,
       ftp.FamilyTreeID,
       ft.FamilyTreeCode,
       ftp.PersonID,
       ftp.OriginFamilyTreeID,
       ftp.AddedByUserID,
       ftp.AddedAt
FROM FTFamilyTreePersonT ftp
LEFT JOIN FTPersonT p
  ON p.PersonID = ftp.PersonID
LEFT JOIN FamilyTreeT ft
  ON ft.FamilyTreeID = ftp.FamilyTreeID
WHERE p.PersonID IS NULL
ORDER BY ftp.FamilyTreeID, ftp.FamilyTreePersonID;

/* These operational relationship tables should already be empty for Tree 25. */
SELECT 'FTParentT' AS SourceTable, COUNT(*) AS RowCount
FROM FTParentT WHERE FamilyTreeID = 25
UNION ALL
SELECT 'FTPartnerT', COUNT(*) FROM FTPartnerT WHERE FamilyTreeID = 25
UNION ALL
SELECT 'FTSiblingT', COUNT(*) FROM FTSiblingT WHERE FamilyTreeID = 25
UNION ALL
SELECT 'FTRecordArchiveT', COUNT(*) FROM FTRecordArchiveT WHERE FamilyTreeID = 25;

/* Permanent history retained by design. */
SELECT COUNT(*) AS ActivityHistoryRows
FROM FTFamilyTreeActivityT
WHERE FamilyTreeID = 25;

SELECT COUNT(*) AS NotificationHistoryRows
FROM FTNotificationT
WHERE FamilyTreeID = 25;

/* ========================================================================== */
/* REPAIR TRANSACTION                                                         */
/* ========================================================================== */

START TRANSACTION;

/* Remove orphan memberships for this Tree only. In the current dump this
   removes FamilyTreePersonID 347 / PersonID 196. */
DELETE ftp
FROM FTFamilyTreePersonT ftp
LEFT JOIN FTPersonT p
  ON p.PersonID = ftp.PersonID
WHERE ftp.FamilyTreeID = 25
  AND p.PersonID IS NULL;

/* Defensive cleanup of operational relationship/archive rows is allowed only
   when no membership remains in Tree 25. */
DELETE FROM FTParentT
WHERE FamilyTreeID = 25
  AND NOT EXISTS (
      SELECT 1
      FROM FTFamilyTreePersonT ftp
      WHERE ftp.FamilyTreeID = 25
      LIMIT 1
  );

DELETE FROM FTPartnerT
WHERE FamilyTreeID = 25
  AND NOT EXISTS (
      SELECT 1
      FROM FTFamilyTreePersonT ftp
      WHERE ftp.FamilyTreeID = 25
      LIMIT 1
  );

DELETE FROM FTSiblingT
WHERE FamilyTreeID = 25
  AND NOT EXISTS (
      SELECT 1
      FROM FTFamilyTreePersonT ftp
      WHERE ftp.FamilyTreeID = 25
      LIMIT 1
  );

DELETE FROM FTRecordArchiveT
WHERE FamilyTreeID = 25
  AND NOT EXISTS (
      SELECT 1
      FROM FTFamilyTreePersonT ftp
      WHERE ftp.FamilyTreeID = 25
      LIMIT 1
  );

/* Remove user associations only if Tree 25 is truly empty. */
DELETE FROM FTFamilyTreeUserT
WHERE FamilyTreeID = 25
  AND NOT EXISTS (
      SELECT 1
      FROM FTFamilyTreePersonT ftp
      WHERE ftp.FamilyTreeID = 25
      LIMIT 1
  );

/* Keep FTFamilyTreeActivityT and FTNotificationT as permanent history. */

/* Finally remove the known empty development-test Tree. The code check makes
   this intentionally specific to the regression case. */
DELETE FROM FamilyTreeT
WHERE FamilyTreeID = 25
  AND FamilyTreeCode = 'FT-3YPS3ELD'
  AND NOT EXISTS (
      SELECT 1
      FROM FTFamilyTreePersonT ftp
      WHERE ftp.FamilyTreeID = 25
      LIMIT 1
  );

/* ========================================================================== */
/* POST-REPAIR VERIFICATION                                                   */
/* ========================================================================== */

SELECT COUNT(*) AS RemainingMembershipRows
FROM FTFamilyTreePersonT
WHERE FamilyTreeID = 25;

SELECT COUNT(*) AS RemainingTreeRows
FROM FamilyTreeT
WHERE FamilyTreeID = 25
   OR FamilyTreeCode = 'FT-3YPS3ELD';

SELECT COUNT(*) AS RemainingTreeUserRows
FROM FTFamilyTreeUserT
WHERE FamilyTreeID = 25;

/* These should remain greater than or equal to their pre-flight counts. */
SELECT COUNT(*) AS RetainedActivityHistoryRows
FROM FTFamilyTreeActivityT
WHERE FamilyTreeID = 25;

SELECT COUNT(*) AS RetainedNotificationHistoryRows
FROM FTNotificationT
WHERE FamilyTreeID = 25;

/* Re-check the whole database for orphan Family Tree memberships. */
SELECT ftp.FamilyTreePersonID,
       ftp.FamilyTreeID,
       ft.FamilyTreeCode,
       ftp.PersonID
FROM FTFamilyTreePersonT ftp
LEFT JOIN FTPersonT p
  ON p.PersonID = ftp.PersonID
LEFT JOIN FamilyTreeT ft
  ON ft.FamilyTreeID = ftp.FamilyTreeID
WHERE p.PersonID IS NULL
ORDER BY ftp.FamilyTreeID, ftp.FamilyTreePersonID;

COMMIT;
