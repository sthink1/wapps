# Wonderful Apps — R16-72 Refresh-Session Error Classification

**Basis:** Current read-only Wonderful Apps Google Drive copies of `routes/users.js` and `services/browserSession.js`, compared to GitHub `reviseLogIn` commit `72351ef` (November 10, 2026). Apply only to `reviseLogIn` with the approved Stage 6 test database.

## Purpose

The R16-71A offline test confirmed that `/users/refresh-session` returned unexpected, unmarked HTTP 4xx exception messages. This correction uses the existing R16-56 `services/stage6ExpectedClientError.js` WeakSet marker, without changing that helper.

- Intentional `ORIGIN_REQUIRED` / `ORIGIN_NOT_ALLOWED` remain HTTP 403.
- Intentional `REFRESH_INVALID` remains HTTP 401, including missing/invalid/revoked tokens.
- Unexpected unmarked errors carrying 400–499 retain the HTTP status but return `AUTH_SERVICE_UNAVAILABLE` instead of an internal message.
- Unexpected 500/503 responses retain their existing safe `AUTH_SERVICE_UNAVAILABLE` behavior.
- **No token lifetime, cookie, transaction, or rotation changes.**

## Files to install

Replace the entire existing `routes/users.js` and `services/browserSession.js` with the respective complete files in this package. Add `tests/stage6.r16-72.refresh-session-expected-errors.offline.test.js`. Do not install the diff files; they are for review. Preserve copies/backups separately if desired. Do not change `main` or production.

## Local verification (before commit)

From `C:\AppProjectwDB\WonderfulAppsRender`:

```powershell
node --check routes/users.js
node --check services/browserSession.js
node --test tests/stage6.r16-72.refresh-session-expected-errors.offline.test.js
git diff --check
git diff --stat
git status --short
```

The regression suite operates entirely offline: no real cookies, tokens, database connections, or HTTP requests. Check the output and share it before moving to the local HTTP tests. Reuse prior R16-50 and R16-53 evidence; do not repeat unrelated acceptance tests.

**Browser use:** No browser for offline tests. For any later local/hosted browser checks, use Chrome Incognito by default. Chrome Normal will be explicitly requested when needed.

**Release:** Local tests, targeted local HTTP verification, reviewed commit, staging-only deployment, and focused hosted verification are separate gates. S6-041 remains open for broader route review and independent engineering signoff.
