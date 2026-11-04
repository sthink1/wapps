# Wonderful Apps — Stage 6 Group 5D acceptance record and remaining-test reconciliation
**Date:** 2026-11-01  
**Branch:** `reviseLogIn`  
**Hosted environment:** existing `wapps-stage6-test` Render service and HelioHost `wapps_test` database  
**Reported deployed commit:** `9e443c7` (user's Render dashboard screenshot).  
**Evidence basis:** user-reported Chrome Console and Network screenshots, phpMyAdmin query output, earlier local Node test output, Google Drive source/inventory. No new network or database test performed for this report.

## Group 5D — results verified from supplied evidence

| Test / observation | Result | Qualification |
|---|---|---|
| `waPlatform.unit.test.js` | PASS, 19/19 | Offline mocked browser/database interfaces; not live HTTP |
| Hosted read-only browser preflight | PASS, 7/7 | User screenshot; correct Render origin, browser APIs available |
| Controlled hosted two-tab restoration | PASS for tested run | Console: 2/2 participated, 2/2 authenticated, `restored=1/2` |
| Browser Network request evidence | Consistent with one refresh | Tab 1: one `/users/refresh-session` HTTP 200; Tab 2: none observed, `/users/session-status` HTTP 200. This is a captured-run conclusion, not universal concurrency proof |
| Keep Me Logged In through Chrome restart | PASS, user confirmed | Automatically authenticated |
| Explicit logout + page refresh | PASS, user confirmed | Remained signed out |
| Logout persistence through Chrome restart | PASS, user confirmed | Remained signed out |
| DB row for remembered session | PASS with linkage caveat | `wapps_test.WebSessionT`: WebSessionID 111; UserID 62; IsRemembered 1; CreatedAt 2026-11-01 13:50:33 UTC; RevokedAt 2026-11-01 14:19:42 UTC |
| Refresh history associated with WebSessionID 111 | Consistent with one rotation | Two issued, one consumed. Row linkage inferred from timing and behavior; browser session ID was not independently captured |
| Refresh-token rejection after logout | Not independently probed | Browser stayed signed out; no isolated attempt to replay post-logout refresh cookie |

### Interpretation
The tested two-tab refresh, remembered browser-restart, explicit logout, and persistence scenarios passed. Browser and DB evidence reinforce each other. A database revocation timestamp is recorded, but no separate credential-level rejection probe was run after logout.

## Stage 6 remaining work / distinctions

1. **Group 5C full HTTP integration** — OFFLINE handler tests passed in earlier user-reported runs. They do not validate all real Express middleware, database, and end-to-end HTTP behavior. Real HTTP website and TNNA scenarios remain outstanding unless separately documented as performed. Do not reinstate legacy tests using `charter`/UserID 62 and password mutation without isolated fixture and explicit cleanup.
2. **Proxy/client IP hosted attribution** — OPEN. Earlier source/loopback audit does not establish the actual Render proxy chain or client-IP rate-limiter attribution.
3. **Source patcher `tests/apply-stage6b2-revocation-fix.cjs`** — KEEP BLOCKED. It writes application source; it is not a test.
4. **Unreconciled test inventory** — The Oct 31 inventory enumerated 29 then-present items (16 migrated, 13 pending). The Drive test folder has changed since that audit. Reconcile actual local branch and current test suite before claiming all Stage 6 tests are complete. Do not treat this as an exhaustive inventory of project tests.
5. **Independent design-engineer review** — REQUIRED after all Stage 6 implementation and hosted acceptance work, before merge or production decision.
6. **Production smoke check** — A limited post-deployment sanity check follows a future, separately authorized merge and production deployment; not a substitute for pre-merge testing.

## Operational safeguards
- No merge into `main`, no production deployment or production database operations.
- Keep existing dedicated Render staging service and database; no need to install the unused H109 startup-fix ZIP.
- Avoid posting raw tokens, cookies, headers, passwords, secret strings, or SQL dumps with private records.
- This report does not authorize destructive replays or tests targeting an existing shared account.
- Record separately the disposition of outstanding live HTTP, TNNA, and proxy checks. Do not silently mark them passed based on Group 5D.

## Suggested next acceptance sequence
A. Reconcile the current test suite against the Oct 31 audit and the recent Group 5A–5D evidence, identifying exact remaining cases.
B. Design minimally invasive hosted HTTP tests with dedicated test identity and cleanup, only where coverage cannot be demonstrated from existing results.
C. Perform hosted proxy/client-IP attribution test with nonsecret observable evidence.
D. Complete independent design-engineer review, resolve findings, then make a separate merge/production decision.
