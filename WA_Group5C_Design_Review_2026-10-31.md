# Wonderful Apps — Stage 6 Group 5C: HTTP/TNNA test redesign review
Date: 2026-10-31
Status: SOURCE REVIEW / DESIGN ONLY — no live tests authorized.

## Source reviewed
Authoritative Drive copies of `routes/users.js`, `routes/tnna.js`, `tests/group0a.http-concurrency.local.js`, `tests/group0a.tnna-http.local.js`, and the previously revised Group 5B tests. Previous H109 results and seven passing regression commands are recorded in the conversation.

## Observed route contracts
- `users.js`: POST `/login` performs user lookup and sends verification email; POST `/verify-code` consumes a login challenge and creates a website session, optionally setting a refresh cookie. POST `/refresh-session` checks request Origin, rotates a DB refresh token, sets cookie, and returns an access token. POST `/change-password` uses authenticated web JWT and a DB transaction. POST `/logout` revokes a session. 
- `tnna.js`: POST `/verify-code` issues a TNNA refresh credential and performs database work. POST `/refresh` checks token/device and rotates a TNNA refresh credential in a transaction. POST `/logout` revokes a refresh token. GET `/me` is authenticated.
- Both routes import the shared `dbConnection` pool. Merely pointing an HTTP client at a local WA server does **not** prove which database that server uses.
- Existing legacy `group0a.http-concurrency.local.js` hardcodes account `charter`, UserID 62 and `sql5838929`, changes password, and may not restore it after failure.
- Existing legacy `group0a.tnna-http.local.js` hardcodes `charter`, UserID 62 and `sql5838929`; creates TNNA enrollment/consent/device/token records and expressly leaves audit/registration rows in the DB.

## Decision: leave both legacy scripts BLOCKED
Do not run or merely replace `sql5838929` with `wapps_h109_test`. The dedicated H109 database only has four minimal disposable tables for the browser-session concurrency test; the real HTTP login and TNNA flows require additional application tables, middleware, consent and email dependencies, and a server configured to use that database.

## Group 5C implementation plan
### 5C-1 — Offline actual-handler tests (next safe implementation)
- Load the real `users.js`/`tnna.js` route callbacks using dependency injection or an isolated module/VM harness, with a fake DB pool and controlled email service; do not start `server.js`.
- Generate synthetic user IDs, challenge tokens, device IDs and JWTs; never use existing account passwords, clipboard cookies or a real browser session.
- Test website refresh: valid Origin, missing/cross-site Origin, cookie replacement, replay rejection, two concurrent rotations and `REFRESH_INVALID` 401 behavior, and no unintended session mutation on failure.
- Test TNNA: verify-code and refresh/logout with synthetic records; replay rejection; device mismatch; expired/revoked tokens; account credential version; confirm all writes are fake-adapter operations.
- Preserve exact handler behavior by comparing harness SQL expectations to current source; reject unexpected SQL in mocks rather than silently succeeding.

### 5C-2 — True HTTP integration, only after separate authorization
- Provision a *separate disposable complete-schema fixture database* or an isolated application test service that is definitively wired to a dedicated database. The H109 minimal-schema fixture is insufficient.
- Preflight must verify exact host, database, user, TLS, grants, current server target DB, and that fixtures belong exclusively to this test.
- Disable real email or use a test mail sink; generate unique test identity. No existing user accounts, shared limiter counters or TNNA devices.
- Track every test-created row and delete by verified test-owned IDs, in foreign-key order. Stop and investigate on any failed cleanup. A rollback alone cannot undo emailed codes or completed HTTP commits.
- Use strict expected HTTP status codes, concurrency bounds, timeouts, and fail-closed gates. Never interpret a 500 or DB error as an expected 401.

### 5C-3 — Acceptance and release gates
- Distinguish simulated callback tests from actual HTTP and DB tests in reports.
- Retest H109 after any modification to `browserSession.rotate()`.
- Preserve `reviseLogIn` exclusively; no production, `main`, Render deployment, or shared `wapps_test`/`sql5838929` mutation.
- Independent design-engineer review remains mandatory before merge/production decision.

## Current conclusions
The previous H109 real MySQL test and seven regression files passed, but they do not constitute a real `/users` or `/tnna` HTTP integration test. Group 5C remains open. No production or staging side effects occurred during this document-only review.
