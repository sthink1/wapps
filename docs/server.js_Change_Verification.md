# R16-75 Step 3 — `server.js` change verification

**Prepared:** 2026-11-14  
**Disposition:** PROPOSAL ONLY — not installed; no acceptance tests executed.  
**Authoritative original:** Google Drive `My Drive/wonderfulApp/server.js`, file ID `1K6yf51Q1Ak6nxnqiiFaC1_PxXwCcWlq9`, last-observed modification `2026-11-10T03:33:26Z`.  
**Original SHA-256:** `b6c6ec291ffc7674590cccb83d627c0dc9dac0431129ba017b991c7e8156f1e1`  
**Proposed SHA-256:** `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`  
**Mandatory comparison:** `change/server.js.diff` compares full exact original source to delivered final source; no wholesale format change.  
**Authorization:** Owner authorized Step 3 *preparation* on November 14, not installation or test execution.

## Every source difference and rationale

| Difference | Reason | Authority | Impact / limitation |
|---|---|---|---|
| Add one `require` for `isExpectedClientError` | Reuse existing shared WeakSet provenance without modifying module | CS-05, CS-08, D03, WA-ERROR-001 | Depends on same shared module instance as marking call sites |
| Preserve existing HTTP status validation, move status-only log before `headersSent` check | Avoid raw exception diagnostics while recording status in both delegated and normal errors | CS-09, D03 | Existing static redacted log retained |
| Add `res.headersSent` delegation | Prevent second response when headers already committed | WA-ERROR-001 | Delegates to Express default error handling; must verify under integration |
| Add protected-path prefix `no-store` in central error handler | Covers early JSON/urlencoded/multipart parser failures before routers install guards | CS-09, WA-CACHE-001 | Prefix-bound only; public/static routes unchanged; malformed requests need integration tests |
| Require shared expected-error mark before returning 4xx `err.message` | Fix synthetic unexpected 400/403 disclosure while preserving approved expected 4xx messages and statuses | CS-05, D03, D05 | Producer completeness and factory governance remain separate follow-up work |
| Preserve nested `{error: {message}}` response and fixed 5xx fallback | Avoid broad format migration; uphold D04 staged compatibility | CS-01, D04, WA-API-002 | `WA.api` nested error parsing is still independently open |

**Formatting-only differences:** None beyond indentation/spacing introduced inside the added/revised handler. No unrelated source formatting changes. Every original-to-final difference appears in the attached unified `.diff`.

## Dependencies and regression risks

- No route files, shared classification module, browser files, database code or schema files changed.
- Direct route-owned 401/403/validation bodies, Family Tree, privacy, Budget, ETF, Notifications and subscriptions retain their own response paths.
- Some older central error producers may rely on unmarked 4xx messages. They will now receive generic `Request failed` until explicitly inventoried and approved; do **not** mark arbitrary caught exceptions to restore text.
- Parser no-store behavior is proposed only for identified protected route prefixes; verify exact browser/proxy caching and malformed-body cases.
- Header-sent delegation must be integration-tested, including logs and socket termination; source-level simulation is insufficient.
- No change to CSP, TNNA lifetimes, `/send-email`, geocoding validation, user access, ownership, DB or session behavior is proposed.
- Existing `WA.api` nested response-format mismatch remains open as separately scoped work.

## Verification and acceptance gates

1. Verify Drive source has not changed since pinned hash; reconcile if it has.
2. Inspect `change/server.js.diff` line-by-line and approve **every** added/modified line.
3. Read full proposed `server.js` and `tests/stage6.r16-75.central-error.offline.test.js`.
4. Separately authorize offline execution. Run proposed isolated T01–T05/T11 checks, then real parser and route integration checks; T06/T07/T08/T09/T10/T12 remain required and are **not** proven by the isolated test.
5. Verify actual staging source commit and isolated database identity before any hosted test.
6. Record test output, status, response shapes, headers, logs, exact commit and date; maintain prior bounded historical results.
7. Owner approves installation and release separately. Do not alter main/production without new explicit authorization.

## Rollback

Owner reinstalls the **verified original** `server.js` from the pinned Drive source (hash `b6c6ec291ffc7674590cccb83d627c0dc9dac0431129ba017b991c7e8156f1e1`) after reviewing any intervening changes. Restore only after authorization; retain logs and test evidence. New isolated test can be excluded from runtime release because it is under `tests/`.
