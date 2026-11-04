# Wonderful Apps — Stage 6 Group 5G: disposable-account credential-lifecycle acceptance plan

Date: 2026-11-02
Status: **DESIGN ONLY — NOT AUTHORIZED FOR LIVE EXECUTION**
Branch/checkpoint: `reviseLogIn` / `66c7b31` (last user-confirmed)
Candidate hosted service: `wapps-stage6-test` / HelioHost `wapps_test` only
Source authority: Google Drive `My Drive/wonderfulApp`, including `routes/users.js`, `services/browserSession.js`, `routes/tnna.js`, existing Stage 6 tests and acceptance ledgers.

## Why this focused test is justified
Previous hosted H47–H50 established reset email delivery, link opening, and expired-link rejection. The completed password-reset operation, old/new password behavior, one-time token consumption, and rejection of previously issued Web/TNNA credentials have **not** been demonstrated together using hosted HTTP and an actual database. Offline route and unit tests, along with the disposable H109 MariaDB concurrency run, cover separate aspects but do not replace this end-to-end check.

## Current source contracts (confirmed by inspection)
- `POST /users/forgot-password`: requires allowed Origin; uses the database reset limiter and client-IP resolver; gives a generic response; for an existing account creates a hashed reset token with 30-minute expiry, invalidating previous unused links; email is sent after commit.
- `POST /users/validate-reset-token`: read-only validation; rejects malformed or expired/used/revoked tokens.
- `POST /users/reset-password`: validates token and matching new password, locks account and reset row, updates password hash, marks token used, revokes other links, calls `sessions.revokeAll`, and commits; clears the browser refresh cookie and sends a notice.
- `POST /users/change-password`: authenticated Web JWT and allowed Origin required; verifies current password, updates hash and calls `sessions.revokeAll` transactionally.
- `sessions.revokeAll` targets `WebSessionT`, `TNNARefreshTokenT` and `UserSecurityT` (as established by the existing source/unit tests).

## Preconditions — all mandatory before any live run
1. Independent test identity: new unique email and username, controlled inbox, and password used **only** for this test. Do not use `charter`, `eg`, `sthink`, UserID 62 or another pre-existing account.
2. Test-environment preflight: `WA_ENV=staging`, exact `https://wapps-stage6-test.onrender.com` public origin, known `wapps_test` host/user/TLS, startup identity guard and nonproduction service confirmed. The staging service must not be connected to production databases.
3. Read-only schema/dependency inventory: identify and inspect FK dependencies and application side-effect tables involved in registration, login challenges, web sessions, refresh-token history, password-reset tokens, TNNA verification/consent/device, notification preferences and histories, subscriptions/trial grants, and usage/audit logs. Inspect exact column keys before writing cleanup SQL.
4. Proven cleanup design: enumerate test-owned row identifiers before each action, record created IDs and verify no pre-existing rows belong to the test account; define FK-safe deletion order and readback verification. Do not use broad delete-by-email or `TRUNCATE`. Cleanup must be executable even after partial failure. No claim of guaranteed cleanup until schema and permissions are confirmed.
5. Rate limiting: avoid exhausting the shared per-IP/current-hour bucket and other tenants; use the minimum number of requests. Verify available/reset windows by read-only inspection if needed. Do not bypass production-style rate limiting or alter `WA_TRUST_RENDER_CF_IP` for convenience.
6. Do not print or store in logs/chat any real passwords, login codes, reset URLs/tokens, JWTs, refresh cookies, secret hashes or personal data. Store test-only secrets locally, and redact all evidence.
7. Explicit separate authorization from the user for any account creation, live password reset, TNNA enrollment, data deletion, or test account cleanup.

## Minimum viable live execution sequence (proposed; not commands)
A. Create test-only account through normal staging registration. Capture its *new* UserID and associated row IDs from read-only queries. Perform normal verification and login; establish remembered Web session A and (only if TNNA setup is feasible without new deployment) a TNNA credential on a dedicated test device/fixture. Save pre-reset identifiers and revocation/version readbacks, not secrets.
B. Request a password reset for this disposable account through staging. Confirm generic response, delivery to controlled mailbox, link origin and non-disclosure. Avoid extra requests.
C. Validate token before use; submit one successful reset with a distinct new test password. Record expected success and verify `PasswordResetT.UsedAt`, other outstanding links revoked, `UserSecurityT.SecurityVersion` advanced, Web sessions revoked and TNNA refresh tokens revoked. Check the exact SQL schema/keys before drafting queries.
D. Confirm old password fails and new password succeeds through normal staging login. Retrying the consumed reset token must fail without further credential changes.
E. Verify previously issued access credential rejected via protected endpoint and previous Web refresh cookie denied. If a TNNA credential was established, verify prior TNNA JWT/refresh rejected through real TNNA HTTP endpoints (not only SQL flags). Do not send the credentials to chat.
F. Clean up all test-owned records in dependency order, with bounded statements by recorded test IDs; verify zero remaining rows for that test identity across every impacted table. Log any retained audit records explicitly rather than claiming a full cleanup. Immediately stop and investigate any failure.

## Scope limitation / split decision
A Web password reset with actual Web session revocation is the minimum focused hosted check. **Full TNNA integration is a separate gate** if the full registration/refresh workflow needs a test device, app build, or additional tables. Do not force TNNA enrollment solely for this Web test; record the gap honestly.

## Stop conditions
Abort without mutations if the staging DB identity, schema/dependency inventory, fixture isolation, controlled inbox, access restrictions, available limiter budget or cleanup plan is incomplete. Abort on unexpected HTTP response, SQL error, email routing, or cleanup mismatch. Do not replace the test DB, change `main`, production, or production Render.

## Evidence to retain
Date; exact branch/commit; staging origin and DB identity (without secrets); test-owned synthetic UserID; expected vs actual statuses; anonymized pre/post `SecurityVersion` and revoked/used state; explicit cleanup counts; failures and limitations. Remove test secrets and temporary cookies from the test environment after completion.

## Current recommendation
**Do not run the live test yet.** First perform a read-only complete-schema and foreign-key dependency audit of `wapps_test` or its authoritative fresh test SQL dump and finalize an exact-key cleanup script. The source currently available does not establish the complete account-related FK graph. No additional installation package or PowerShell patcher is required at this stage. Independent design-engineer review remains mandatory before a merge/production decision.
