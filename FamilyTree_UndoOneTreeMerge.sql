-- Wonderful Apps - Family Tree Undo One Tree Merge
-- MySQL 5.5 compatible. Run once before deploying the revised Family Tree files.
-- Back up the database before running this migration.

CREATE TABLE `FTTreeMergeT` (
  `TreeMergeID` bigint(20) NOT NULL AUTO_INCREMENT,
  `SourceFamilyTreeID` int(11) NOT NULL,
  `SurvivingFamilyTreeID` int(11) NOT NULL,
  `MergedByUserID` int(11) NOT NULL,
  `MergedAt` datetime NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `BridgeJSON` longtext,
  `DecisionsJSON` longtext,
  `MergeSnapshot` longtext NOT NULL,
  `CreatedR2KeysJSON` longtext,
  `UndoneByUserID` int(11) DEFAULT NULL,
  `UndoneAt` datetime DEFAULT NULL,
  `UndoNote` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`TreeMergeID`),
  KEY `IX_FTTreeMergeT_SourceTree` (`SourceFamilyTreeID`),
  KEY `IX_FTTreeMergeT_SurvivingTree` (`SurvivingFamilyTreeID`),
  KEY `IX_FTTreeMergeT_Status` (`Status`),
  KEY `IX_FTTreeMergeT_MergedAt` (`MergedAt`),
  KEY `IX_FTTreeMergeT_MergedByUserID` (`MergedByUserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `FTPersonMergeT`
  ADD COLUMN `TreeMergeID` bigint(20) DEFAULT NULL AFTER `PersonMergeID`,
  ADD COLUMN `SurvivingPersonSnapshotAfter` longtext AFTER `SurvivingPersonSnapshotBefore`,
  ADD COLUMN `UndoByUserID` int(11) DEFAULT NULL AFTER `SurvivingPersonSnapshotAfter`,
  ADD COLUMN `UndoAt` datetime DEFAULT NULL AFTER `UndoByUserID`,
  ADD COLUMN `UndoReason` varchar(100) DEFAULT NULL AFTER `UndoAt`;

-- A restored source Person may later be merged again.  Therefore SourcePersonID
-- must be an indexed history field, not permanently unique across all merge events.
ALTER TABLE `FTPersonMergeT`
  DROP INDEX `UQ_FTPersonMergeT_SourcePersonID`,
  ADD KEY `IX_FTPersonMergeT_SourcePersonID` (`SourcePersonID`),
  ADD KEY `IX_FTPersonMergeT_TreeMergeID` (`TreeMergeID`),
  ADD KEY `IX_FTPersonMergeT_UndoAt` (`UndoAt`);
