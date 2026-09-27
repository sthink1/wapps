-- Wonderful Apps Family Tree Network - first implementation
-- MySQL 5.5 compatible. Run against the current WA database after backup.

CREATE TABLE IF NOT EXISTS FTNetworkT (
    NetworkID INT NOT NULL AUTO_INCREMENT,
    PersonID INT NOT NULL,
    IncludeInSearch TINYINT(1) NOT NULL DEFAULT 0,
    NetworkNote VARCHAR(1000) NULL,
    PreferredContactType VARCHAR(50) NULL,
    VerificationStatus VARCHAR(20) NOT NULL DEFAULT 'NOT_REQUESTED',
    VerifiedEmail VARCHAR(255) NULL,
    VerificationRequestedAt DATETIME NULL,
    VerifiedAt DATETIME NULL,
    DeclinedAt DATETIME NULL,
    CreatedByUserID INT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedByUserID INT NULL,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (NetworkID),
    UNIQUE KEY UX_FTNetworkT_PersonID (PersonID),
    KEY IX_FTNetworkT_Search (IncludeInSearch, VerificationStatus),
    KEY IX_FTNetworkT_VerifiedEmail (VerifiedEmail)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FTNetworkEducationT (
    NetworkEducationID INT NOT NULL AUTO_INCREMENT,
    PersonID INT NOT NULL,
    School VARCHAR(255) NOT NULL,
    Degree VARCHAR(120) NULL,
    ProgramField VARCHAR(255) NULL,
    Certification VARCHAR(255) NULL,
    GraduationYear SMALLINT NULL,
    City VARCHAR(120) NULL,
    State VARCHAR(120) NULL,
    Country VARCHAR(120) NULL,
    Note VARCHAR(1000) NULL,
    CreatedByUserID INT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedByUserID INT NULL,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (NetworkEducationID),
    KEY IX_FTNetworkEducationT_PersonID (PersonID),
    KEY IX_FTNetworkEducationT_School (School),
    KEY IX_FTNetworkEducationT_Program (ProgramField)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FTNetworkCareerT (
    NetworkCareerID INT NOT NULL AUTO_INCREMENT,
    PersonID INT NOT NULL,
    Profession VARCHAR(180) NULL,
    Industry VARCHAR(180) NULL,
    CompanyOrganization VARCHAR(255) NULL,
    PositionTitle VARCHAR(255) NULL,
    Specialty VARCHAR(255) NULL,
    City VARCHAR(120) NULL,
    State VARCHAR(120) NULL,
    Country VARCHAR(120) NULL,
    StartYear SMALLINT NULL,
    EndYear SMALLINT NULL,
    CurrentPosition TINYINT(1) NOT NULL DEFAULT 0,
    Note VARCHAR(1000) NULL,
    CreatedByUserID INT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedByUserID INT NULL,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (NetworkCareerID),
    KEY IX_FTNetworkCareerT_PersonID (PersonID),
    KEY IX_FTNetworkCareerT_Profession (Profession),
    KEY IX_FTNetworkCareerT_Company (CompanyOrganization),
    KEY IX_FTNetworkCareerT_Position (PositionTitle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FTNetworkItemT (
    NetworkItemID INT NOT NULL AUTO_INCREMENT,
    PersonID INT NOT NULL,
    ItemType VARCHAR(80) NOT NULL,
    Description VARCHAR(255) NOT NULL,
    Detail VARCHAR(1000) NULL,
    CreatedByUserID INT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedByUserID INT NULL,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (NetworkItemID),
    KEY IX_FTNetworkItemT_PersonID (PersonID),
    KEY IX_FTNetworkItemT_Type (ItemType),
    KEY IX_FTNetworkItemT_Description (Description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FTNetworkHelpT (
    NetworkHelpID INT NOT NULL AUTO_INCREMENT,
    PersonID INT NOT NULL,
    HelpType VARCHAR(120) NOT NULL,
    HelpDetail VARCHAR(1000) NULL,
    CreatedByUserID INT NULL,
    CreatedAt DATETIME NOT NULL,
    UpdatedByUserID INT NULL,
    UpdatedAt DATETIME NULL,
    PRIMARY KEY (NetworkHelpID),
    UNIQUE KEY UX_FTNetworkHelpT_Person_Help (PersonID, HelpType),
    KEY IX_FTNetworkHelpT_PersonID (PersonID),
    KEY IX_FTNetworkHelpT_HelpType (HelpType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS FTNetworkVerificationT (
    NetworkVerificationID INT NOT NULL AUTO_INCREMENT,
    PersonID INT NOT NULL,
    FamilyTreeID INT NOT NULL,
    EmailAddress VARCHAR(255) NOT NULL,
    TokenHash CHAR(64) NOT NULL,
    RequestedByUserID INT NULL,
    RequestedAt DATETIME NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    RespondedAt DATETIME NULL,
    Response VARCHAR(20) NULL,
    PRIMARY KEY (NetworkVerificationID),
    UNIQUE KEY UX_FTNetworkVerificationT_TokenHash (TokenHash),
    KEY IX_FTNetworkVerificationT_PersonID (PersonID),
    KEY IX_FTNetworkVerificationT_Tree (FamilyTreeID),
    KEY IX_FTNetworkVerificationT_Email (EmailAddress),
    KEY IX_FTNetworkVerificationT_Pending (PersonID, RespondedAt, ExpiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
