Wonderful Apps — Stage 6 R16 TNNA Update Email HTTP Error Sanitization
Date: 2026-11-05
Target branch: reviseLogIn
Source of truth: Google Drive / My Drive / wonderfulApp / routes / tnna.js
Scope: shared WA backend route ONLY; TNNA native application is unchanged.

CHANGE
At POST /tnna/admin/send-update's per-recipient send failure catch,
replace the raw exception's message with the fixed response:
  Email delivery failed (details omitted).
Recipient email, eligible, sent, and failed response fields remain unchanged.
Authorization (auth and requireAdmin), email dispatch, version lookup,
subscriber selection, and all other routes are unchanged.

PACKAGE CONTENTS
routes/tnna.js — complete revised source; place into local routes/tnna.js
 tests/stage6.r16.tnna-update-email-error.offline.test.js — 10 isolated tests
REVIEW_tnna_update_email.diff — one-line code diff
README_R16_TNNA_Update_Email_Error.txt — this guide

INSTALLATION (USER ACTION ONLY)
1. Confirm current branch is reviseLogIn and review REVIEW_tnna_update_email.diff.
2. Confirm local routes/tnna.js is still identical to Google Drive source
   except for any separately reviewed and intentional changes. Do not
   overwrite newer work if it differs; reconcile changes first.
3. Copy routes/tnna.js and the test file to the corresponding project paths.
4. Run:
   node --check .\routes\tnna.js
   node --test .\tests\stage6.r16.tnna-update-email-error.offline.test.js
   git diff --check
5. Re-run the preexisting 89 R08/R16 offline regression tests.
6. Review git status, git diff, and stage only intended files before commit.
7. Stage deployment testing must NOT send actual TNNA update emails.

SAFETY
No real email, database, Render, or provider calls are made in the isolated tests.
Do NOT call POST /tnna/admin/send-update for a hosted test; it sends real
messages to opted-in recipients. Hosted checks should use safe GET endpoints.
The single-line change does not modify native TNNA KMLI refresh/token design.

ROLLBACK
Restore the prior tracked routes/tnna.js version through your normal
reviewed Git workflow. No SQL migration or environment changes are needed.
