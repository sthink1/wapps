# Stage 6 H67 - Logout Origin guard (staging candidate)

Source: Google Drive wonderfulApp/routes/users.js, retrieved 2026-10-31.

## Verified finding
- POST /users/logout uses middleware/auth.js to require a Bearer token (not ambient cookie authentication).
- server.js CORS only enables credentialed browser requests from the configured origin; CORS alone is not a complete authorization policy.
- Unlike refresh-session and change-password, logout did not explicitly call sessions.requireOrigin(req). This is a defense-in-depth consistency gap. It is NOT a demonstrated exploitable CSRF vulnerability.

## Minimal change
Add one Origin check after successful authentication/web-client check, before any revocation. For absent/incorrect Origin it returns HTTP 403 {"error":"ORIGIN_NOT_ALLOWED"}. A valid staging Origin keeps previous logout behavior unchanged. The current change-password route already uses this same response envelope. No SQL, session/cookie behavior, or production files otherwise changed.

## Installation / verification (reviseLogIn only)
1. Confirm `git branch --show-current` is `reviseLogIn` and `git status --short` is understood. Stop if local users.js differs from the authoritative source used here; reconcile rather than blindly overwrite.
2. Back up routes/users.js. Review H67_logout_origin.patch. Copy routes/users.js from this package into the corresponding project location only if changes are reconciled.
3. Run `node --check routes/users.js` and `git diff --check`, examine the actual diff.
4. Test locally against the guarded test DB first: normal KMLI login -> logout -> reload remains signed out. Test missing/invalid Origin for an authenticated request with a disposable test token using a local automated harness; do not paste or log bearer tokens. Expect 403 with no revocation; then normal valid-Origin logout succeeds and session is revoked. A nonauthenticated curl test alone proves only authentication, not Origin validation.
5. If tests pass, commit/push reviseLogIn, manually deploy ONLY wapps-stage6-test, confirm WA_ENV=staging and test DB verified in Render; repeat normal logout and safe negative-Origin tests. Never touch main or production.
6. Track S6-019 as open until broader CSRF and endpoint review is complete; preserve other findings S6-039, S6-041.

## Important limits
Source is the retrieved Google Drive copy; before installation confirm your local reviseLogIn source is the same, since Drive sync may lag. This package is a candidate, NOT deployed or verified on staging.
