-- TNNA v1.1 registration, persistent login, user/device tracking, and update support
-- Designed for the current Wonderful Apps MySQL schema and MySQL 5.5 compatibility.

CREATE TABLE IF NOT EXISTS `TNNAUserT` (
  `TNNAUserID` int(11) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `UpdateEmailOptIn` tinyint(1) NOT NULL DEFAULT '0',
  `FirstRegisteredAt` datetime NOT NULL,
  `LastSeenAt` datetime NOT NULL,
  PRIMARY KEY (`TNNAUserID`),
  UNIQUE KEY `UX_TNNAUserT_UserID` (`UserID`),
  KEY `IX_TNNAUserT_UpdateEmailOptIn` (`UpdateEmailOptIn`),
  CONSTRAINT `FK_TNNAUserT_UsersT`
    FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TNNADeviceT` (
  `DeviceID` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `UserID` int(11) NOT NULL,
  `Platform` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Android',
  `AppVersion` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VersionCode` int(11) DEFAULT NULL,
  `FirstSeenAt` datetime NOT NULL,
  `LastSeenAt` datetime NOT NULL,
  PRIMARY KEY (`DeviceID`),
  KEY `IX_TNNADeviceT_UserID` (`UserID`),
  KEY `IX_TNNADeviceT_VersionCode` (`VersionCode`),
  CONSTRAINT `FK_TNNADeviceT_UsersT`
    FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TNNARefreshTokenT` (
  `RefreshTokenID` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserID` int(11) NOT NULL,
  `DeviceID` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TokenHash` char(64) CHARACTER SET ascii NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `CreatedAt` datetime NOT NULL,
  `LastUsedAt` datetime DEFAULT NULL,
  `RevokedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`RefreshTokenID`),
  UNIQUE KEY `UX_TNNARefreshTokenT_TokenHash` (`TokenHash`),
  KEY `IX_TNNARefreshTokenT_UserID` (`UserID`),
  KEY `IX_TNNARefreshTokenT_DeviceID` (`DeviceID`),
  KEY `IX_TNNARefreshTokenT_ExpiresAt` (`ExpiresAt`),
  CONSTRAINT `FK_TNNARefreshTokenT_UsersT`
    FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_TNNARefreshTokenT_DeviceT`
    FOREIGN KEY (`DeviceID`) REFERENCES `TNNADeviceT` (`DeviceID`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `TNNAVersionT` (
  `TNNAVersionID` int(11) NOT NULL AUTO_INCREMENT,
  `VersionCode` int(11) NOT NULL,
  `VersionName` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MinimumSupportedVersionCode` int(11) NOT NULL DEFAULT '1',
  `DownloadUrl` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ReleaseNotes` text COLLATE utf8mb4_unicode_ci,
  `IsCurrent` tinyint(1) NOT NULL DEFAULT '0',
  `ReleasedAt` datetime NOT NULL,
  PRIMARY KEY (`TNNAVersionID`),
  UNIQUE KEY `UX_TNNAVersionT_VersionCode` (`VersionCode`),
  KEY `IX_TNNAVersionT_IsCurrent` (`IsCurrent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Only one row should be current. This seed makes v1.1 the current release.
UPDATE `TNNAVersionT` SET `IsCurrent` = 0;

INSERT INTO `TNNAVersionT`
  (`VersionCode`, `VersionName`, `MinimumSupportedVersionCode`, `DownloadUrl`, `ReleaseNotes`, `IsCurrent`, `ReleasedAt`)
VALUES
  (2, '1.1', 1, 'https://wonderfulappscompany.com/TownNotice.html',
   'Adds Wonderful Apps registration/login, persistent native login, TNNA user identification, version checking, and update notifications.',
   1, NOW())
ON DUPLICATE KEY UPDATE
  `VersionName` = VALUES(`VersionName`),
  `MinimumSupportedVersionCode` = VALUES(`MinimumSupportedVersionCode`),
  `DownloadUrl` = VALUES(`DownloadUrl`),
  `ReleaseNotes` = VALUES(`ReleaseNotes`),
  `IsCurrent` = 1,
  `ReleasedAt` = VALUES(`ReleasedAt`);

-- Consent text for TNNA update-email preference.
UPDATE `ConsentTextVersionsT`
   SET `IsActive` = 0, `RetiredDate` = CURDATE()
 WHERE `ConsentType` = 'TNNA_UPDATE_EMAIL' AND `IsActive` = 1;

INSERT INTO `ConsentTextVersionsT`
  (`ConsentType`, `VersionNumber`, `ConsentText`, `EffectiveDate`, `RetiredDate`, `IsActive`, `CreatedAt`)
VALUES
  ('TNNA_UPDATE_EMAIL', '2026-10-08',
   'Email me when important Town Notification updates are available.',
   '2026-10-08', NULL, 1, NOW())
ON DUPLICATE KEY UPDATE
  `ConsentText` = VALUES(`ConsentText`),
  `EffectiveDate` = VALUES(`EffectiveDate`),
  `RetiredDate` = NULL,
  `IsActive` = 1;

-- privacy.html is revised for TNNA account/device/version data and local-only
-- location processing, so make that the active Privacy consent version for
-- registrations that occur after this release.
UPDATE `ConsentTextVersionsT`
   SET `IsActive` = 0, `RetiredDate` = CURDATE()
 WHERE `ConsentType` = 'PRIVACY' AND `IsActive` = 1;

INSERT INTO `ConsentTextVersionsT`
  (`ConsentType`, `VersionNumber`, `ConsentText`, `EffectiveDate`, `RetiredDate`, `IsActive`, `CreatedAt`)
VALUES
  ('PRIVACY', '2026-10-08',
   'I have read and agree to the Wonderful Apps Privacy Policy.',
   '2026-10-08', NULL, 1, NOW())
ON DUPLICATE KEY UPDATE
  `ConsentText` = VALUES(`ConsentText`),
  `EffectiveDate` = VALUES(`EffectiveDate`),
  `RetiredDate` = NULL,
  `IsActive` = 1;
