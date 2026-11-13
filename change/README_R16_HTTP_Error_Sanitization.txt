Wonderful Apps Stage 6 R16 — HTTP error-response sanitization
Prepared November 4, 2026

SCOPE
- Complete revised server.js: central Express error handler exposes no raw exception
  text on HTTP 5xx; preserves valid 400–599 HTTP status codes; keeps expected
  4xx message text and the established {error:{message:...}} response shape.
- Complete revised routes/notifications.js: six catch paths send generic
  messages for HTTP 5xx, preserve explicit 4xx status/message and the existing
  {message:...} response shape. Public unsubscribe and network-verification
  routing/authorization rules are unchanged.
- tests/stage6.r16.http-error-sanitization.offline.test.js: eight isolated tests.

IMPORTANT LIMITATIONS
- Changes do not cover all application routers, including Family Tree.
- Explicit 4xx error messages are preserved for compatibility, and should be
  audited separately before claiming complete protection against disclosure.
- These isolated tests mock Express routing and dependencies. They do not
  launch the WA server, connect to the database, send email, or prove hosted
  behavior. Do not deploy to production or merge into main.
- The central Express error handler only sees exceptions passed to next(err).
  Route handlers that independently send responses require their own review.
- The existing server startup log path is outside the scope of this patch.

INSTALLATION (performed manually by project owner)
1. Confirm local Git branch is reviseLogIn. Ensure the source of these files
   matches the current branch and review changes before replacing anything.
2. Back up existing files using your own procedure; do not overwrite newer work.
3. Copy package server.js to WA project root, routes/notifications.js to the
   WA routes folder, and test into tests/.
4. Copy this README into the root if desired.

VALIDATION — execute at WA project root (does not intentionally write project files)
node --check .\server.js
node --check .\routes\notifications.js
node --test .\tests\stage6.r16.http-error-sanitization.offline.test.js
git diff --check
git diff --stat
git status --short

Before committing or syncing, run the existing R08 and R16 regression tests.
Only stage the intended files. Backups and diagnostic artifacts should remain
out of the commit unless explicitly reviewed. Auto Deploy affects staging;
do not sync until ready for hosted verification.

ROLLBACK
Revert just these two source revisions to the prior known-good state
using your existing source-control procedure. Do not reset, merge or touch main
or production. Confirm the expected behavior again with the same tests.
