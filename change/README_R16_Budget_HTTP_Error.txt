Wonderful Apps — R16 Budget API error disclosure correction
2026-11-05

READ-ONLY SOURCE: Google Drive My Drive/wonderfulApp routes/budget.js and utils.js.
The assistant has NOT modified either Google Drive or your local project.

FILES
  routes/budget.js: Complete replacement, based on the read-only Drive source.
  tests/stage6.r16.budget-http-error.offline.test.js: Isolated offline tests; mocks Express/database.
  REVIEW_budget.diff: Unified source diff (inspect before installing).

PURPOSE
  The existing (be) suffix distinguishes backend-generated messages, NOT safe client-facing errors.
  Budget previously used that suffix alone to emit HTTP 400 messages for caught errors.
  A server failure whose message ended with (be) could therefore leak unexpected detail.
  Budget now explicitly marks expected client errors via budgetExpectedError(), and checks the
  marker plus HTTP status before returning their messages. Other errors use handleDbError().

BEHAVIOR PRESERVED
  Intentional 400 validations retain original messages and (be) suffix.
  Intentional missing-record 404 responses retain original messages.
  Unexpected exceptions are routed to the existing sanitized database error handler.
  No changes to database schema, auth middleware, subscription checks or budgets' SQL statements.

ADDITIONAL SCOPE
  Recurrence normalization and the preview route previously returned any finalOccurrence()
  exception text. They now return approved validation errors or generic 500 responses.

MANUAL INSTALL ONLY
  1. Confirm working branch: git branch --show-current (reviseLogIn).
  2. Back up your own local routes/budget.js if desired; review REVIEW_budget.diff.
  3. Copy routes/budget.js and the test file from this archive into their local paths.
  4. Run:
       node --check .\routes\budget.js
       node --test .\tests\stage6.r16.budget-http-error.offline.test.js
       git diff --check
  5. Run the previously verified R08/R16 regression suite before committing.
  6. Review 'git status --short' before staging. Do not include any *_COPY.js backup files.

CAUTIONS
  These tests are isolated and do not certify hosted Budget CRUD or database transactions.
  The tested exceptions are synthetic. No staging/production HTTP requests or DB writes made.
  Do not run broad tests indiscriminately: tests/apply-stage6b2-revocation-fix.cjs is a
  source-modifying installer, not a normal test.
  No production or main-branch changes authorized; no TNNA changes.
