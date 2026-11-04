# Wonderful Apps — Stage 6 remaining acceptance reconciliation
Date: 2026-11-01
Authority: My Drive/wonderfulApp/tests and user-provided test results
Scope: read-only source inventory; no database, browser, Git, or Render mutation

## Inventory
- October 31 inventory: 29 items, historically 16 migrated / 13 outstanding.
- Current Drive tests folder: 31 items.
- New relative to the prior list: `stage6.h109.disposable-integration.test.js`, `stage6.h109.connection-preflight.test.js`, `Stage6_Test9D_Render_ControlledLock.js` (the old inventory's specific list may differ; exact count above is from fresh listing).
- Do not infer that current Drive reflects the exact latest local Git checkout without a local `git status`/commit check.

## Completed evidence from this conversation
- Group 5A / read-only tests: user reported multiple passing suites.
- Group 5B: dedicated disposable H109 MariaDB actual-session concurrency previously passed, including cleanup. Source `stage6a.live-replay.test.js` now simulated, not a substitute for that separate actual DB test.
- Group 5C: `group0a.http-concurrency.local.js` and `group0a.tnna-http.local.js` were replaced with nonlive route-callback checks; both reported passed.
- Group 5D: 19/19 offline `waPlatform` tests; 7/7 hosted preflight; one observed successful browser refresh across two tabs; both tabs authenticated; remembered session survived Chrome restart; logout persisted through page reload and browser restart.
- Group 5D database corroboration: `wapps_test.WebSessionT` ID 111, UserID 62, remembered=1, creation `2026-11-01 13:50:33` UTC, revocation `2026-11-01 14:19:42` UTC, two issued refresh-token records and one consumed. Browser-to-row linkage inferred from the test timeline.

## Updated disposition for previously flagged files
| Test/tool | Current status | Remaining limitation |
|---|---|---|
| group0a.http-concurrency.local.js | Reworked to offline actual-route callback; reported PASS | Not full Express/real HTTP or live DB |
| group0a.tnna-http.local.js | Reworked offline in-memory SQL; reported PASS | Not live TNNA HTTP/real database |
| group0a.refresh-replay.local.js | Reworked synthetic local HTTP; reported PASS | Not actual WA middleware/database |
| group0a.mysql-concurrency.test.js | Historical unsafe test; H109 separate real DB concurrency run passed | Keep historical script blocked until independently reviewed |
| stage6a.live-replay.test.js | Reworked source/model only; reported PASS | Not actual DB concurrency |
| waPlatform.unit.test.js | PASS 19/19 | Simulation, now supplemented by hosted two-tab test |
| Stage6_Test9D_Render_ControlledLock.js | Hosted diagnostic performed successfully | Captured run, not exhaustive concurrency proof |
| Stage6_Test9D_ControlledLock.js / Console_Arm.js | Legacy localhost diagnostics; do not rerun on hosted site | Replace by hosted diagnostic for Group 5D |
| stage6a.proxy-ip.audit.test.js | Source/loopback audit | Render's actual reverse-proxy hop attribution OPEN |
| apply-stage6b2-revocation-fix.cjs | BLOCKED source mutator | Not a test; do not execute |

## Outstanding acceptance gates
**A. Hosted/client-IP proxy attribution:** confirm staging behavior of `req.ip` versus `X-Forwarded-For` using safe diagnostics without leaking visitors' IPs. Verify the trust-proxy decision and limiter fairness, including spoof prevention. A loopback-only Express test cannot establish Render's actual chain.

**B. Actual HTTP/TNNA integration coverage:** decide which route/middleware/DB scenarios are not already supported by earlier safe integration results, then write targeted, bounded tests with a dedicated identity and cleanup if required. Avoid existing shared users/sessions and password resets.

**C. Remaining test suite audit:** check all test files in local `reviseLogIn` against the current Drive list and match each to a recorded run, including Stage 6A rate-limit/rate-cleanup integration cases. Do not treat the 31-file folder as a complete universe of project tests.

**D. Independent design-engineer review:** mandatory after completion of all Stage 6 implementation and hosted acceptance tests and before `main` merge/deployment.

## Recommended immediate next action
Inspect `server.js`, `middleware`/password reset limiter, and `stage6a.proxy-ip.audit.test.js` to draft a production-representative, staging-only, nonsecret Render proxy attribution diagnostic. It should not mutate user credentials or invoke password reset emails. Design and review the measurement before executing hosted requests.

## No-change record
No source files, services, databases, Git branches or production assets were modified by this reconciliation.
