-- FamilyTree merge/split code-history migration
-- Run this ONCE before installing the revised files.

ALTER TABLE FamilyTreeT
    ADD COLUMN MergedIntoFamilyTreeID INT NULL AFTER Status,
    ADD COLUMN MergedAt DATETIME NULL AFTER MergedIntoFamilyTreeID,
    ADD COLUMN MergedByUserID INT NULL AFTER MergedAt,
    ADD INDEX IX_FamilyTreeT_MergedIntoFamilyTreeID (MergedIntoFamilyTreeID);

ALTER TABLE FTFamilyTreePersonT
    ADD COLUMN OriginFamilyTreeID INT NULL AFTER PersonID,
    ADD INDEX IX_FTFamilyTreePersonT_OriginFamilyTreeID (OriginFamilyTreeID);

-- Existing rows were created before OriginFamilyTreeID existed.
-- Their current Tree is therefore treated as their original Tree.
UPDATE FTFamilyTreePersonT
SET OriginFamilyTreeID=FamilyTreeID
WHERE OriginFamilyTreeID IS NULL;

-- Optional verification:
SELECT
    FamilyTreeID,
    FamilyTreeCode,
    Status,
    MergedIntoFamilyTreeID,
    MergedAt,
    MergedByUserID
FROM FamilyTreeT
ORDER BY FamilyTreeID;

SELECT
    FamilyTreePersonID,
    FamilyTreeID,
    PersonID,
    OriginFamilyTreeID
FROM FTFamilyTreePersonT
ORDER BY FamilyTreePersonID;
