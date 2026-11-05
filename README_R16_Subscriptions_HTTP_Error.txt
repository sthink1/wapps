Wonderful Apps — Stage 6 R16 Subscription HTTP Error Sanitization
Candidate package: 2026-11-05

SOURCE
Google Drive: My Drive/wonderfulApp/routes/subscriptions.js (read-only reference).
No changes were made to Drive or the user's local project.

SCOPE
Eight catch blocks previously returned raw error.message for ANY truthy error.status,
including 500/502/503. Each guard now returns intentional integer HTTP 400–499
error responses unchanged and delegates all other errors via next(error) to the
existing central sanitized Express error handler in server.js.
No route ordering, request processing, success response or subscription service
logic changed. No SQL changes.

PACKAGE CONTENTS
routes/subscriptions.js — complete candidate replacement
REVIEW_subscriptions.diff — source comparison
 tests/stage6.r16.subscription-http-error.offline.test.js — 6 offline tests

INSTALLATION (BY USER ONLY)
1. Work on reviseLogIn and compare current local subscriptions.js to this candidate.
2. Review REVIEW_subscriptions.diff before overwriting; resolve newer local edits.
3. Back up current file outside Git-tracked source as appropriate.
4. Install routes/subscriptions.js and the regression test manually.
5. Run:
   node --check .\routes\subscriptions.js
   node --test .\tests\stage6.r16.subscription-http-error.offline.test.js
   git diff --check
6. Run previous R08/R16 regressions before a selectively staged commit.
7. Do not deploy or merge to production until Stage 6 acceptance and independent engineering review.

TEST LIMITATIONS
The offline tests execute the actual route functions with fake Express and
service objects. They verify the forwarding boundary, not live database,
authentication, hosted network behavior, or the central handler in this test.
They do not intentionally cause a hosted HTTP 500.
