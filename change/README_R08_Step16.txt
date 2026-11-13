Wonderful Apps Stage 6 - R08/R16 cache policy correction
Prepared: November 4, 2026
Branch intended: reviseLogIn

CONTENTS
  server.js                               Complete proposed replacement
  tests/stage6.r08.cache-policy.offline.test.js   Isolated regression test

CHANGE
  server.js: replace the single `app.use('/users', userRoutes);`
  statement with a cache-control middleware and the unchanged userRoutes.
  Header: Cache-Control: no-store. No other application logic changed.

READ BEFORE INSTALLING
  * This package does not modify Google Drive, your local files, Git,
    Render, databases, or production by itself.
  * Only install on the local reviseLogIn branch after verifying local
    server.js has not changed since the Google Drive snapshot.
  * Preserve a user-managed backup or use your existing Git recovery
    workflow before overwriting server.js.
  * Do not run a local WA server just to test this middleware.

LOCAL COMMANDS (run from your project root AFTER manually extracting)
  git branch --show-current
  git status --short
  node --check .\server.js
  node --check .\tests\stage6.r08.cache-policy.offline.test.js
  node .\tests\stage6.r08.cache-policy.offline.test.js
  git diff --check
  git diff -- server.js

EXPECTED OFFLINE TEST
  PASS 7/7 offline assertions

DO NOT DEPLOY YET
  Offline test does not establish actual hosted response headers.
  After local verification, separately review and approve deployment
  to the isolated Stage 6 Render test service only. Production/main
  changes remain prohibited without independent final review/approval.
