# Stage 6 Group 5B — safety-first partial redesign

All three legacy files require revisions, so only three changed files are included.

## IMPORTANT: Coverage tradeoffs
1. `group0a.mysql-concurrency.test.js` now refuses to lock shared UserSecurityT. With `--run-live`, it only tests Helio identity/TLS and reports SAFE HOLD. **Cross-connection row-lock serialization is NOT verified.** It requires an isolated disposable database with its own security fixtures. The original shared-charter test is not approved.
2. `stage6a.live-replay.test.js` performs a read-only contract check on actual browserSession.js source plus a state-machine simulation. **It does NOT invoke real rotate()**. Existing Group 5A simulations and the original Group 3/4 live tests remain separate evidence.
3. `group0a.refresh-replay.local.js` uses a synthetic loopback HTTP handler to model replay and Origin rejection. **It does NOT exercise the actual WA HTTP route**. No clipboard access and no browser cookie is touched.

These are *safety replacements*, not full substitutes for original live integration coverage. The remaining gaps must be tracked for independent review and eventually closed using a disposable isolated database/account and a local WA service bound to it.

## Install
Copy three files under tests/ into C:\AppProjectwDB\WonderfulAppsRender\tests on branch reviseLogIn.

## First verification (no MySQL)
```powershell
git branch --show-current
git diff --check
git diff -- tests/group0a.mysql-concurrency.test.js tests/stage6a.live-replay.test.js tests/group0a.refresh-replay.local.js
node --check .\tests\group0a.mysql-concurrency.test.js
node --check .\tests\stage6a.live-replay.test.js
node --check .\tests\group0a.refresh-replay.local.js
node --env-file=.env.test .\tests\group0a.mysql-concurrency.test.js
node --env-file=.env.test .\tests\stage6a.live-replay.test.js
node --env-file=.env.test .\tests\group0a.refresh-replay.local.js
```
Do NOT invoke `--run-live` on the concurrency test yet: it is merely a staging connectivity check and does not validate the intended concurrency property.
