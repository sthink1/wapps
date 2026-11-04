Wonderful Apps — Stage 6 R16 Family Tree HTTP error-response hardening
Date: November 4, 2026
Status: CANDIDATE — not installed, committed, synced, or deployed by the assistant

AUTHORITATIVE INPUT
Google Drive My Drive/wonderfulApp/routes/familyTree.js, Drive file ID
1oCW0HrGRiBIuK3F9O9heeNWy98CSfsEX, retrieved read-only on November 4, 2026.
The packaged source is the full file, not a patch fragment.

CONTENTS
routes/familyTree.js — complete revised file (~8,400 lines)
tests/stage6.r16.familytree-http-error.offline.test.js — isolated regression
REVIEW_familyTree.diff — unified diff for source review
README_R16_FamilyTree_HTTP_Error.txt — this file

PURPOSE AND BOUNDARIES
- Replace raw exception-message disclosure from Family Tree error responses with
  a generic 'Internal Server Error' response for unexpected HTTP 500–599 errors.
- Preserve intentional 400–499 error wording and existing HTTP status codes.
- On 5xx, omit extra 'review', 'matches', and 'code' fields derived from exceptions.
- For a handler with explicitly fixed 500 response status, suppress details
  even if a thrown Error object carries a contradictory 4xx status.
- Retain existing routes, auth and privacy middleware, validation, queries,
  database writes, business logic, public verification routes and image handling.
- Does NOT alter routes/ftPrivacy.js, which already suppresses unexpected 500
  errors via its sendError helper. It does NOT alter notification history storage.
- A separate audit item remains for raw error.message stored in FTNotificationT
  FailureReason in the Family Tree file (original area around line 724).
- Existing Multer 400 upload validation text is intentionally unchanged.

VALIDATION BY ASSISTANT
node --check routes/familyTree.js — PASS
node --check tests/stage6.r16.familytree-http-error.offline.test.js — PASS
node --test tests/stage6.r16.familytree-http-error.offline.test.js — 8/8 PASS
The offline tests evaluate isolated helper functions and static source structure.
They DO NOT execute the Express application, connect to MySQL or R2, or verify
hosted behavior. Comprehensive regression/functional acceptance is still required.

INSTALLATION — USER-OPERATED ONLY
1. Extract to a temporary location outside your WA project.
2. Review REVIEW_familyTree.diff carefully, especially error codes in relation,
   search, privacy, public contact-email verification and image handlers.
3. Confirm your local reviseLogIn/routes/familyTree.js has no changes newer than
   the authoritative Drive source; do not overwrite newer modifications.
4. Retain your own local backup, then copy the complete revised file to
   routes/familyTree.js and test to tests/ in your WA project.
5. Run in PowerShell from C:\AppProjectwDB\WonderfulAppsRender:
   node --check .\routes\familyTree.js
   node --test .\tests\stage6.r16.familytree-http-error.offline.test.js
   git diff --check
   git diff -- routes/familyTree.js
6. Run existing R08/R16 regressions before committing. Review git status and
   stage only intended files. Do not sync/deploy until tests and source diff
   are reviewed. Keep production, main, Google Drive, and installed TNNA
   unchanged.

ROLLBACK
Restore your verified original routes/familyTree.js from your local backup
or revert only this change on reviseLogIn after confirming the intended commit.
Do not use an unreviewed rollback command against production or main.
