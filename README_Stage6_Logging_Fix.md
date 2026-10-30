# Wonderful Apps Stage 6 — Local logging security revision

Source: Google Drive `My Drive/wonderfulApp` on branch `reviseLogIn` (retrieved October 30, 2026).

## Files
- `morgan.js`: replaces Morgan's `combined` format with a fixed error-request format that omits the URL (including path/query), referrer and user-agent. Retains IP, date, method, HTTP version, status, response length and timing. Keeps original rotating `logs/access.log` and skip-for-status-below-400 behavior.
- `server.js`: prevents the catch-all 404 logger from recording `req.originalUrl`, and prevents the centralized error logger from recording untrusted `err.message`. Response bodies, routes, CORS, database startup checks and other server behavior are unchanged.
- `logger.js`: unchanged; no replacement required for this narrowly scoped fix.

## Apply to local reviseLogIn working tree only
1. Stop the local Node server with Ctrl+C.
2. Back up the existing `server.js` and `morgan.js` (or use git to inspect/restore).
3. Copy the two complete replacement files into the project root.
4. Verify with `git diff --check`, `git diff -- server.js morgan.js`, `node --check server.js` and `node --check morgan.js`.
5. Start with your previously verified `.env.test` command and confirm Stage 6 startup guard verifies the test database.

## One-step-at-a-time local regression test
1. In a separate terminal, issue an unauthenticated fabricated URL that returns 404: `http://localhost:8080/stage6-log-test?sample=FAKE123`.
2. Check **newly added** lines in `logs/access.log`, `logs/combined.log`, and `logs/error.log`. The new records must not contain `stage6-log-test` or `FAKE123`; old historical records WILL remain in these files.
3. Confirm Morgan writes `[URL_OMITTED]` with status 404 and Winston writes `404 - Not Found (request URL omitted)` in its two error logs.
4. Verify the HTTP response remains 404 with `{"error":"Endpoint not found"}`.
5. Do not perform password-reset/token tests with live secrets. Do not deploy or edit production.

## Review limitations
This fixes the demonstrated URL disclosure paths, not every possible log statement in the rest of the application. Winston callers elsewhere, legacy historical log files, and third-party platform logs require a separate audit. No hosted deployment or production change has been made.
