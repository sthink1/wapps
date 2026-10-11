-- MySQL 5.5-compatible. Run ONCE after taking a fresh database dump.
-- Does not alter existing Person, Event or image tables.
CREATE TABLE IF NOT EXISTS FTPetT (
  PetID INT NOT NULL AUTO_INCREMENT,
  PersonID INT NOT NULL,
  PetName VARCHAR(100) NOT NULL,
  BirthDate DATE DEFAULT NULL,
  Died TINYINT(1) NOT NULL DEFAULT 0,
  DeathDate DATE DEFAULT NULL,
  Comment VARCHAR(500) DEFAULT NULL,
  PictureStorageKey VARCHAR(255) DEFAULT NULL,
  CreatedByUserID INT NOT NULL,
  CreatedAt DATETIME NOT NULL,
  UpdatedByUserID INT DEFAULT NULL,
  UpdatedAt DATETIME DEFAULT NULL,
  PRIMARY KEY (PetID),
  KEY IX_FTPetT_PersonID (PersonID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
