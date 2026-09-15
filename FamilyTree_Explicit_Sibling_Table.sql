-- Wonderful Apps FamilyTree
-- Explicit Biological Sibling Relationships
-- 2026-09-15
--
-- Run this SQL before installing the revised FamilyTree files.
-- PersonID and SiblingPersonID are stored in ascending numeric order by the API.

CREATE TABLE FTSiblingT (
    SiblingRelationshipID INT NOT NULL AUTO_INCREMENT,
    FamilyTreeID INT NOT NULL,
    PersonID INT NOT NULL,
    SiblingPersonID INT NOT NULL,
    Notes VARCHAR(500) NULL,
    CreatedByUserID INT NOT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedByUserID INT NULL,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (SiblingRelationshipID),
    UNIQUE KEY UQ_FTSiblingT_Tree_Person_Sibling
        (FamilyTreeID, PersonID, SiblingPersonID),
    KEY IX_FTSiblingT_Tree_Person
        (FamilyTreeID, PersonID),
    KEY IX_FTSiblingT_Tree_Sibling
        (FamilyTreeID, SiblingPersonID),
    CONSTRAINT FK_FTSiblingT_FamilyTree
        FOREIGN KEY (FamilyTreeID)
        REFERENCES FamilyTreeT(FamilyTreeID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_FTSiblingT_Person
        FOREIGN KEY (PersonID)
        REFERENCES FTPersonT(PersonID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_FTSiblingT_SiblingPerson
        FOREIGN KEY (SiblingPersonID)
        REFERENCES FTPersonT(PersonID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT FK_FTSiblingT_CreatedBy
        FOREIGN KEY (CreatedByUserID)
        REFERENCES UsersT(UserID)
        ON UPDATE CASCADE,
    CONSTRAINT FK_FTSiblingT_UpdatedBy
        FOREIGN KEY (UpdatedByUserID)
        REFERENCES UsersT(UserID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;
