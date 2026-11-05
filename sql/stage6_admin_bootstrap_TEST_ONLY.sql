-- RUN ONLY on the dedicated Stage 6 TEST database after schema migration.
-- Manually verify that Render STAGING ADMIN_USERNAME=sthink and UserName is unique.
SELECT DATABASE() AS VERIFY_DATABASE;
SELECT UserID, UserName, IsAdministrator FROM UsersT WHERE LOWER(UserName)='sthink';
-- STOP unless the output above contains exactly one intended account.
START TRANSACTION;
UPDATE UsersT SET IsAdministrator = CASE WHEN BINARY UserName = 'sthink' THEN 1 ELSE 0 END;
SELECT UserID, UserName, IsAdministrator FROM UsersT WHERE IsAdministrator=1;
-- VERIFY results; COMMIT manually if correct, otherwise ROLLBACK.
-- COMMIT;
-- ROLLBACK;
