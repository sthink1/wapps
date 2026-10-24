# Wonderful Apps — Stage 6 Group 0a (TEST ONLY)

This is the complete coordinated *candidate* package for Group 0a. The changes have **not** been run against your live MySQL test server, and the legacy Stage 6A and TNNA integration tests have not been run here. Treat it as a test installation, NOT production-approved software.

## Scope and safety
- Required Git branch: `reviseLogIn` (retain baseline `ae8bd30`, Group 0d `ee100c9`, and housekeeping commit).
- Required DB: `sql5838929` **only**, using existing ignored `.env.test` and Group 0d environment guard.
- No Render changes, no GitHub push, no TNNA client installation, no production SQL.
- Back up the current `sql5838929` database (including existing login/reset records) and project before migration.
- The SQL adds columns in MySQL 5.5 and invalidates *pending* test login verification and password-reset grants. Existing logged-in test users may also need to log in afresh during the test cycle.

## Included files (all needed)
- `routes/users.js` — web login/verification/password-reset transactional security fencing
- `routes/tnna.js` — TNNA login verification and refresh fencing
- `services/browserSession.js` — browser refresh fencing
- `services/credentialFence.js` — shared transactional account security lock
- `sql/Group0a_test_only_schema.sql` — migration for test DB only
- `tests/group0a.credential-fence.test.js` — unit + source contract tests

## Install sequence
1. Keep VS Code source control clean. Preserve `reviseLogIn` and local commits.
2. Stop the WA test server. Back up `sql5838929` and the four current application files. **Do not run the historical `install-stage6a.ps1`**; it would overwrite newer changes.
3. In phpMyAdmin on the **test database connection**, run *only these diagnostics*, to confirm the two columns don't already exist:
   ```sql
   SELECT DATABASE();
   SHOW COLUMNS FROM `LoginVerificationT` LIKE 'SecurityVersion';
   SHOW COLUMNS FROM `PasswordResetT` LIKE 'SecurityVersion';
   ```
   `SELECT DATABASE()` must show `sql5838929`; the two SHOW results must be empty. If not, STOP; don't guess or rerun the migration.
4. Inspect `sql/Group0a_test_only_schema.sql`, confirm the correct server is selected, and execute **only on `sql5838929`**. Confirm `MissingSecurityRows = 0`. If it's not zero, STOP; the SQL does not repair missing rows.
5. Copy the four JavaScript files into their matching WA project paths and the test file into `tests/`. The Group 0d files `server.js`, `dbConnection.js`, and `services/stage6Environment.js` must remain untouched. The schema and this instruction file may be retained under a new test-documentation directory in WA for Git tracking.
6. Run on your Windows machine:
   ```powershell
   node --env-file=.env.test --test tests/group0a.credential-fence.test.js
   node --env-file=.env.test --test tests/group0d.environment.test.js
   node --env-file=.env.test server.js
   ```
   Also run your existing Stage 6A tests **only following their database-safety instructions**. Some tests modify data: do not indiscriminately run all `tests/*.js`.
7. Verify on a disposable test account: login + email code, second login code, change password, rejection of an old code, new password/login, issuance of password-reset email, rejection of an old reset grant after password change, refresh, logout. Separately verify TNNA *test* verify-code and refresh using the test backend. Do not reconfigure installed TNNA phones.
8. Perform a two-connection MySQL concurrency test for password change versus web and TNNA challenge consumption and refresh, and verify no stale credentials are issued. This is a **required release gate not covered by the included unit tests**.
9. Inspect VS Code Changes and commit **only** if all local and database tests pass. Use ordinary **Commit**, not **Sync Changes** or push. If any test fails, preserve diagnostics and do not commit.

## Important implementation boundaries
- Tokens issued before a password change must be rejected by the existing live authorization check.
- Existing grants have `SecurityVersion=0` after migration and deliberately fail; don't backfill their versions.
- A database rollback must not yield an access token/refresh token to the caller.
- Deadlock handling fails closed; automated retry is intentionally not added.
- This package does not implement broader Stage 6B browser login UI, replay-detection refinements, or production deployment controls. A final independent security review still follows the complete Stage 6B implementation and testing.
