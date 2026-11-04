Wonderful Apps — Stage 6 R16: Stored Notification Failure Reason Sanitization
November 4, 2026 — REVIEW CANDIDATE; NOT INSTALLED OR DEPLOYED

AUTHORITATIVE SOURCE: Google Drive My Drive/wonderfulApp, read-only snapshot fetched
for services/notificationService.js and routes/familyTree.js on Nov 4, 2026.

PROBLEM
NotificationHistoryT.FailureReason and FTNotificationT.FailureReason can be
populated from raw error.message, potentially persisting private provider/error data.
This is a source-code risk, not proof of actual disclosure.

EXACT CHANGES
1. services/notificationService.js: replace the raw email-delivery error text
   bound to NotificationHistoryT.FailureReason with
   'Notification delivery failed (details omitted).'
2. routes/familyTree.js: replace the raw exception text bound to
   FTNotificationT.FailureReason with
   'Family Tree notification delivery failed (details omitted).'
No SQL schema changes. Successful deliveries retain their previous statuses and
FailureReason behavior. Legitimate existing NO_ADDRESS/SUPPRESSED/NOT_CONFIGURED
reasons remain unchanged. The notification service still rethrows provider errors
for callers; Family Tree after-commit notification failures remain nonblocking.

INSTALLATION BY USER ONLY
- Do not extract directly onto the project. Examine REVIEW_*.diff and compare
  each complete source file with the current local reviseLogIn branch. If there
  are newer local changes, reconcile them first rather than overwriting them.
- Make your own backups if desired. Place complete service and route files in
  their matching folders and place the test under tests/.
- Run, from C:\AppProjectwDB\WonderfulAppsRender:
    node --check .\services\notificationService.js
    node --check .\routes\familyTree.js
    node --test .\tests\stage6.r16.stored-failure-reasons.offline.test.js
    git diff --check
- Run existing R08/R16 regression tests, then review git status/diff before a
  controlled commit to reviseLogIn. Never merge into main/production during Stage 6.

ISOLATED TEST SCOPE
Six node:test cases execute extracted real implementation functions under
mocked dependencies with fabricated secrets. No network listener, real database,
mail provider, or real credentials. Tests validate failure/success update params,
status, rethrow/nonblocking behavior, and intended text patterns. They do not
prove real database integration, all logging surfaces, or hosted functionality.

IMPORTANT REMAINING R16 SCOPE
- Existing rows containing raw failure reasons are NOT altered by this package.
  Review historical records separately with a privacy-safe, read-only audit;
  do not run blanket database updates without a reviewed migration plan.
- The original error object still propagates from the notification service,
  preserving behavior but requiring separate audit of other consumers.
- Confirm installed files align with the Drive-derived candidate before tests.
- The installed TNNA, production service, Git main and Google Drive are out of scope.
