# Wonderful Apps — R16-50 refresh-session HTTP 5xx response sanitization

Date: 2026-11-10. Source: authoritative Google Drive `My Drive/wonderfulApp/routes/users.js`, Git blob SHA `f2cd657095bef99bfb5d08fe610ea43bb5623978`, independently identical to GitHub `sthink1/wapps` commit `18e759e` on `reviseLogIn`.

## Scope

Replace only the `catch` clause of `POST /users/refresh-session` in the complete `routes/users.js`. No other application code, success path, cookie/rotation behavior, or database logic is changed. Preserve valid 400–499 statuses and their messages. Preserve valid 500–599 statuses but replace response details with `AUTH_SERVICE_UNAVAILABLE`. Unexpected errors without a valid HTTP status use 503 and the same generic message.

This fixes the failure shown by R16-49D/E. These tests are synthetic isolated error-handler tests, not live token/DB tests; earlier hosted R08/R10 remain accepted and should not be repeated without a specific reason.

## Installation (user-controlled)

1. Do not change production or `main`. Verify you are in the `reviseLogIn` local WA project and compare `routes/users.js` if the project has changed since commit `18e759e`. Do not overwrite newer work without reconciling.
2. Keep a separate personal backup of your current source outside the staging/commit set if desired. Replace local `routes/users.js` with the complete included `routes/users.js`.
3. Add `tests/stage6.r16-49.refresh-error-response.offline.test.js` if not already installed (this version adds two tests to the previous five).
4. From the project root, run:

```powershell
node --check routes/users.js
node --test tests/stage6.r16-49.refresh-error-response.offline.test.js
git diff --check
git diff -- routes/users.js
```

Expect **7/7 PASS**, no syntax errors, and only the refresh-session handler change in routes/users.js. No server or database needed for these tests.

5. Report output before any commit. Do not deploy to Render until local verification and change review have been completed.

## Evidence and limitations

- Historical R16-49: 3/5 PASS, 2/5 FAIL for synthetic 500/503 message disclosure.
- New R16-50 test suite: old five tests plus explicit 400 preservation and explicit 502 sanitization.
- Real credentials, external APIs, database, email, sessions, and production are never contacted by this test file.
- S6-041 remains open pending larger review and independent engineering sign-off.
