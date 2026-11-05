Wonderful Apps — Stage 6 — Dual-Verification Administrator Management
Candidate package dated November 5, 2026 — TEST/REVIEW ONLY, NOT PRODUCTION READY.

DEFINITIONS
* Normal administrator: authenticated user's CURRENT UsersT.UserName matches the running Render service's ADMIN_USERNAME AND the SAME UsersT row has IsAdministrator=1. No UserID shortcut.
* Transfer: while old administrator is still recognized, fresh password confirmation prepares an expiring, session-bound one-time token. The administrator manually changes the STAGING Render ADMIN_USERNAME to the target. Only after the running service reflects that value may the same initiating web session complete the database transaction. The only privilege during mismatch is to check/complete the previously authorized transfer.
* The effective administrator is only the configured username with flag 1; there may be a short period with no active administrator during an authorized transfer. This is NOT a zero-gap switch. Completion is what restores administrator access.

FILES
server.js                                  Complete revised candidate (mount /admin-management with no-store)
services/administratorAccess.js           New centralized database-backed dual verification
middleware/subscriptionAccess.js         Revised: await administrator check before subscription override
routes/subscriptions.js                  Revised: asynchronous administrator and status checks
routes/track.js                          Revised: no UserID 1 shortcut; shared dual verification
routes/tnna.js                           Revised: shared dual verification; native features preserved
routes/users.js                          Revised: /users/is-admin performs database-backed check
routes/adminManagement.js                New: status, target, prepare, pending, complete endpoints
httpdocs/SubControl.html                 Revised: transfer controls and mismatch-only completion panel
sql/stage6_admin_schema_TEST_ONLY.sql    New test-only schema
sql/stage6_admin_bootstrap_TEST_ONLY.sql Review-first initial designation script
sql/stage6_admin_rollback_TEST_ONLY.sql  Test-only rollback guidance
REVIEW_Stage6_Admin_Dual_Verification.diff  Exact diff of all existing source files
 tests/stage6.admin.dual-verification.offline.test.js  Isolated mock tests, no side effects

SAFETY / DEPLOYMENT ORDER — DO NOT SKIP
1. DO NOT install into production, push main, or change production Render. Keep Google Drive and current WA local project read-only to the assistant; install manually only after review.
2. Verify dedicated Stage 6 test DB by inspecting the STAGING Render DB_NAME (do not print its secret values); confirm connection is the test DB, not production. Back up that test database.
3. Review SQL schema, current UsersT schema and indexes; run schema SQL on test DB only.
4. Confirm exactly one intended current admin account and Render STAGING ADMIN_USERNAME. The bootstrap SQL uses 'sthink' as an EXAMPLE, not as an independently verified environment value. Review SELECT outputs and adjust for the actual staging config before explicitly COMMITting. Never execute bootstrap against production.
5. Review the source diff against LOCAL reviseLogIn HEAD. The files were based on the latest accessible Google Drive references; if the local branch differs, STOP and reconcile to preserve intervening changes. The server.js source reference should particularly be checked.
6. Place all new/revised files into the matching local directories. Run node --check for each revised/new JS file.
7. Run: node --test .\tests\stage6.admin.dual-verification.offline.test.js
8. Run the existing full Stage 6 regression suite (previously 99 tests) and resolve any failures before commit/deploy; the legacy suite has not been run in the user's local environment with these revisions.
9. Review git diff --check, git diff --stat, git status --short; stage only intended code, docs, SQL/test files and commit to reviseLogIn after tests. Exclude *_COPY* backups.
10. Deploy ONLY staging. First verify /users/is-admin for current admin, another user, missing token; inspect GET /admin-management/status. Do not attempt a transfer until ordinary admin checks and subscription overrides pass.
11. Stage a CONTROLLED test transfer with two test accounts. First prepare while original admin active; then manually change STAGING Render ADMIN_USERNAME; verify Render is Live; use same tab/session to finish. Do not touch the production service's environment.
12. Independently review all authorization and transfer code; no production merge or release until review and approval.

NORMAL TRANSFER STEPS
A. Sign in as current administrator on SubControl in staging. Enter the target UserID, verify account, supply CURRENT admin password, press Prepare Transfer.
B. Do not close the tab, clear sessionStorage, log out, or revoke the original web session. The token is kept in tab-scoped sessionStorage; changing/reloading the SAME tab is supported. Prepared transfer expires after two hours.
C. Manually change STAGING Render ADMIN_USERNAME to precisely the selected target's username and wait for the service to be Live. No backend direct Render API access exists.
D. Return to the tab. If the old account is no longer administrator, only the pending-transfer panel remains. Select Check Render Administrator; only when matched may Complete Transfer be clicked.
E. Completion is a single MySQL transaction that clears old flags and assigns target. Then sign out and sign in as target to verify access.
F. If interruption occurs (expired session/token, server deployment, wrong target, deleted account) DO NOT issue ad hoc SQL updates. Restore staging Render ADMIN_USERNAME to old account, recover using documented audited procedure, or have a DBA use controlled test-DB recovery. Never use production for recovery tests.

THREAT MODEL / FOLLOW-UP REVIEW
* Requires a valid web JWT session and Origin check on prepare/complete; preparation re-verifies admin from database and current password. The completion token is random, SHA-256-hashed in DB, bound to initiating UserID and web SessionPublicID, expires in two hours, and is single-use.
* Completion must match Render's configured target username BEFORE updating the UsersT administrator flag; DB updates and audit record are transactional.
* An attacker with the ability to edit Render environment variables and steal a current administrator's session + pending transfer token could still be dangerous; protect Render access and browser session. Avoid browser extensions/XSS and insecure network usage.
* Stage 6 engineer must review authorization consistency, rate limiting, concurrent DB updates, deleted/re-created identities, audit retention, and any existing frontend links to SubControl before production.
* Server 500 errors are deliberately generic. The fixed operational error messages remain unchanged, except for administrator authorization changes.
* This package does not contain a fix for the three previously confirmed Track provider exception notes; track HTTP-error sanitization is a separate R16 item.

ROLLBACK / RELEASE
Prior to production approval, all changes are staging-only. Roll back the staging branch and staging schema together using a prechange test-DB backup; do not attempt to drop new columns/tables while modified application code is running. Document a future production cutover order before independent engineer approval.
