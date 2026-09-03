-- ============================================================================
-- FamilyTree OneTreeMethod
-- Adds permanent Person merge history.
-- Run once against the FamilyTree database before installing the revised code.
-- ============================================================================

CREATE TABLE FTPersonMergeT (
    PersonMergeID BIGINT NOT NULL AUTO_INCREMENT,
    SourcePersonID INT NOT NULL,
    SurvivingPersonID INT NOT NULL,
    SourceFamilyTreeID INT DEFAULT NULL,
    SurvivingFamilyTreeID INT DEFAULT NULL,
    MergedByUserID INT NOT NULL,
    MergedAt DATETIME NOT NULL,
    MergeReason VARCHAR(100) NOT NULL DEFAULT 'OneTreeMethod',
    ConflictResolutionJSON LONGTEXT,
    SourcePersonSnapshot LONGTEXT NOT NULL,
    SurvivingPersonSnapshotBefore LONGTEXT NOT NULL,
    PRIMARY KEY (PersonMergeID),
    UNIQUE KEY UQ_FTPersonMergeT_SourcePersonID (SourcePersonID),
    KEY IX_FTPersonMergeT_SurvivingPersonID (SurvivingPersonID),
    KEY IX_FTPersonMergeT_SourceFamilyTreeID (SourceFamilyTreeID),
    KEY IX_FTPersonMergeT_SurvivingFamilyTreeID (SurvivingFamilyTreeID),
    KEY IX_FTPersonMergeT_MergedAt (MergedAt),
    KEY IX_FTPersonMergeT_MergedByUserID (MergedByUserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
