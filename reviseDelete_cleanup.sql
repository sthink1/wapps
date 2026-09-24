/*
  reviseDelete_cleanup.sql
  Wonderful Apps - Family Tree development-data repair

  PURPOSE
  -------
  This is NOT a schema migration. The reviseDelete application fix is code-only.

  This optional script repairs the specific September 23, 2026 development-test
  false split identified in the current wappsDump.sql:

      Original Family Tree: FT-PE9YU5VH (FamilyTreeID 2)
      Erroneous split Tree: FT-ZWC5NHC4 (FamilyTreeID 23)
      Person to restore:    PersonID 187

  The permanent FTFamilyTreeActivityT audit rows are intentionally retained.

  IMPORTANT
  ---------
  Run the PRE-FLIGHT SELECTS first. Proceed with the repair transaction only if
  they still describe the expected test data.
*/

/* ========================================================================== */
/* PRE-FLIGHT: SAFE READ-ONLY CHECKS                                           */
/* ========================================================================== */

SELECT FamilyTreeID, FamilyTreeCode, Status, CreatedAt, CreatedByUserID
FROM FamilyTreeT
WHERE FamilyTreeID IN (2, 23)
   OR FamilyTreeCode IN ('FT-PE9YU5VH', 'FT-ZWC5NHC4')
ORDER BY FamilyTreeID;

SELECT FamilyTreePersonID, FamilyTreeID, PersonID, OriginFamilyTreeID,
       AddedByUserID, AddedAt, Notes
FROM FTFamilyTreePersonT
WHERE PersonID = 187
ORDER BY FamilyTreeID, FamilyTreePersonID;

SELECT PersonID, FirstName, MiddleName, LastName, SuffixName,
       BirthDate, BirthPlace, CreatedByUserID, CreatedAt
FROM FTPersonT
WHERE PersonID = 187;

SELECT ActivityID, FamilyTreeID, UserID, ActivityType, EntityType,
       EntityID, AffectedPersonID, ActivityAt, ActivityDescription
FROM FTFamilyTreeActivityT
WHERE FamilyTreeID = 23
   OR ActivityID = 602
ORDER BY ActivityID;

/* The erroneous split Tree should not contain unrelated people. */
SELECT FamilyTreeID, PersonID, OriginFamilyTreeID, AddedAt
FROM FTFamilyTreePersonT
WHERE FamilyTreeID = 23
ORDER BY PersonID;

/* Review any relationships before cleanup. In the known test case these
   should be empty because PersonID 187 was a disconnected standalone Person. */
SELECT 'FTParentT' AS SourceTable, COUNT(*) AS RowCount
FROM FTParentT WHERE FamilyTreeID = 23
UNION ALL
SELECT 'FTPartnerT', COUNT(*) FROM FTPartnerT WHERE FamilyTreeID = 23
UNION ALL
SELECT 'FTSiblingT', COUNT(*) FROM FTSiblingT WHERE FamilyTreeID = 23;

/* ========================================================================== */
/* REPAIR TRANSACTION                                                          */
/* ========================================================================== */

START TRANSACTION;

/* Restore PersonID 187 to the original Family Tree while preserving the
   original AddedByUserID, AddedAt, and Notes values. */
INSERT IGNORE INTO FTFamilyTreePersonT
(
    FamilyTreeID,
    PersonID,
    OriginFamilyTreeID,
    AddedByUserID,
    AddedAt,
    Notes
)
SELECT
    2,
    PersonID,
    2,
    AddedByUserID,
    AddedAt,
    Notes
FROM FTFamilyTreePersonT
WHERE FamilyTreeID = 23
  AND PersonID = 187;

/* Remove the erroneous split membership after the original membership exists. */
DELETE FROM FTFamilyTreePersonT
WHERE FamilyTreeID = 23
  AND PersonID = 187;

/* Defensive cleanup for the erroneous Tree. These are expected to affect
   zero rows in the known test case. */
DELETE FROM FTParentT
WHERE FamilyTreeID = 23;

DELETE FROM FTPartnerT
WHERE FamilyTreeID = 23;

DELETE FROM FTSiblingT
WHERE FamilyTreeID = 23;

DELETE FROM FTRecordArchiveT
WHERE FamilyTreeID = 23;

/* Remove user access rows created solely for the false split. */
DELETE FROM FTFamilyTreeUserT
WHERE FamilyTreeID = 23;

/* Do NOT delete FTFamilyTreeActivityT. It is the permanent audit history. */

/* Remove the erroneous FamilyTreeT row itself. */
DELETE FROM FamilyTreeT
WHERE FamilyTreeID = 23
  AND FamilyTreeCode = 'FT-ZWC5NHC4';

/* ========================================================================== */
/* POST-REPAIR VERIFICATION                                                    */
/* ========================================================================== */

SELECT FamilyTreePersonID, FamilyTreeID, PersonID, OriginFamilyTreeID,
       AddedByUserID, AddedAt
FROM FTFamilyTreePersonT
WHERE PersonID = 187
ORDER BY FamilyTreeID, FamilyTreePersonID;

SELECT FamilyTreeID, FamilyTreeCode, Status
FROM FamilyTreeT
WHERE FamilyTreeID IN (2, 23)
ORDER BY FamilyTreeID;

SELECT COUNT(*) AS ErroneousTreeUserRows
FROM FTFamilyTreeUserT
WHERE FamilyTreeID = 23;

/* Commit only after the verification results are as expected. */
COMMIT;
