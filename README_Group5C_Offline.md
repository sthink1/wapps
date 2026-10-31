# Wonderful Apps — Group 5C Offline Handler Tests

Only replace the two corresponding files inside `tests/` on `reviseLogIn`.

- `group0a.http-concurrency.local.js`: executes the real `/users/refresh-session` route callback through a VM with a fake `browserSession` service. Tests one success/one 401, replay, Origin handling, and cookie/cache response. **Does NOT test real `browserSession.rotate` or real concurrency.** H109 tested that separately.
- `group0a.tnna-http.local.js`: executes actual `/tnna/verify-code`, `/tnna/refresh`, `/tnna/logout` callbacks with a strict in-memory SQL adapter. Tests device mismatch, replay, rotation, logout and token revocation. **Does NOT test real SQL, concurrent rotation or the HTTP network stack.**

Both files were validated against the Google Drive `routes/users.js` and `routes/tnna.js` copies retrieved October 31, 2026. No files in `routes/`, `services/`, or database configuration are changed.

## Installation

Copy both `.js` files into `C:\AppProjectwDB\WonderfulAppsRender\tests`, replacing only those two legacy scripts. Keep the original versions in Git history; do not execute them.

## Local verification (no .env file or password needed)

```powershell
git branch --show-current
node --check .\tests\group0a.http-concurrency.local.js
node --check .\tests\group0a.tnna-http.local.js
node .\tests\group0a.http-concurrency.local.js
node .\tests\group0a.tnna-http.local.js
git diff --check
git diff --stat
```

Expected: branch `reviseLogIn`, `PASS` lines from both scripts, no errors. These scripts do not accept or need `--run-live`; do not start `server.js` for this work.

## Known limits / next gate

Real end-to-end HTTP tests remain **BLOCKED** until there is a dedicated full-schema disposable database, isolated application test service, test-owned identities/devices, email sink, preflight and teardown verification. Do not point these tests at `wapps_test`, `sql5838929`, production, or the limited H109 fixture. Independent design-engineer review before merging or deploying remains required.
