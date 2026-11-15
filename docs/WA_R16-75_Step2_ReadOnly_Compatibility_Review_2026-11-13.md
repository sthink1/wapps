# Wonderful Apps — R16-75 Step 2: Read-Only Compatibility and Dependency Review

**Date:** November 13, 2026  
**Scope:** Review only; no app execution, project changes, database queries, staging requests, or deployment.  
**Authority:** `My Drive/wonderfulApp`; root `README.md` §0; approved Core Standards v1.0; approved Detailed Standards v0.4.1; D01–D14 Decision Register (particularly D03–D05); November 13 R16 handoff.  
**Baseline caveat:** The reviewed Drive files are authoritative source snapshots, but independent equivalence to the user-reported Render Live commit `73722f1` is not yet verified.

## Decision and current result

**R16-75: OPEN / NOT PASSED.** Previously recorded R16-74B isolated synthetic unexpected HTTP 400/403 cases failed disclosure safety, while 500/503 sanitization passed. No actual private-data leak was established. This step adds **source-review findings and proposed future tests**, not a new acceptance result.

The central error middleware in `server.js` (approximately lines 198–216) determines status by integer `err.status` in 400–599; for 500+ it uses `Internal Server Error`, and for 4xx it returns `err.message` when nonempty without consulting the shared marker. Response JSON is currently nested `{error:{message:...}}`. `services/stage6ExpectedClientError.js` exports `markExpectedClientError` and `isExpectedClientError` using a module-local `WeakSet` that cannot be inferred from HTTP status alone.

## Traceability / observed source

| Source | Reviewed behavior | R16-75 compatibility constraint |
|---|---|---|
| `server.js` | Central handler accepts unmarked 4xx messages; status fallback 500; nested error JSON | Disclose only marked deliberately approved 4xx; retain 4xx/5xx status and nested shape in this narrow fix; fixed generic text otherwise |
| `services/stage6ExpectedClientError.js` | Shared WeakSet classifier | Central error handling should use this module; status alone does not grant safe-message provenance; avoid marking caught arbitrary exceptions |
| `routes/subscriptions.js` | Uses shared classifier for selected own responses, delegates unexpected exceptions via `next(error)` | Preserve `{error:'...'}` on locally handled errors, legitimate expected 4xx text, and delegated central handling |
| `routes/familyTree.js` | Shared marker used on selected constructed 4xx; selected local safe-message helpers and specialized upload validation WeakSet | Preserve selected status/format, authorization/privacy and upload errors; do not presume every throw is marked |
| `routes/ftPrivacy.js` | Shared classification and local `sendError`; route privacy responses have `{message:'...'}` and specific code fields | Preserve privacy contract and separately verify full verified-admin behavior |
| `routes/notifications.js` | Local helper sanitizes unexpected error and supports marked 4xx | Preserve local `{message:'...'}` response |
| `routes/budget.js` | Custom `budgetExpected` flag; local responses commonly `{error:'...'}` with `(be)` conventions | No global reinterpretation or replacement of custom local marker without producer inventory and separate approval |
| `routes/etf.js` | Separate local WeakSet; explicit route response bodies commonly `{message:'...'}` | Preserve route-local client-validation errors and current wire formats |
| `routes/users.js` | Direct flat responses and shared-marker check in refresh-session catch | Preserve existing auth, origin, credential and refresh semantics; do not change 401/403 handling by changing error shape |
| `middleware/auth.js` / `middleware/subscriptionAccess.js` | Direct 401/403 on known denial; forwards unexpected exceptions | Preserve direct safe responses and route ownership/subscription boundaries |
| `httpdocs/js/waPlatform.js` | `readError()` currently accepts `data.message || data.error`; nested error object may become `ApiError.message` or `.code` rather than a string | Not in R16-75 correction; maintain nested response for compatibility, separately track parser mismatch under D04/S6-033 |
| `tests/stage6.r16-55.unexpected-4xx.offline.test.js` and `tests/stage6.r16-56.expected-4xx.offline.test.js` | Existing source-backed route-level tests of classified/unclassified messages | Preserve their historical bounded results; add central-handler-specific tests rather than assuming they cover the central handler |

## Middleware ordering and additional checks

1. `express.json()`, `express.urlencoded()`, and `multer().none()` are installed before static serving and route-prefix `no-store` middleware. Malformed body or multipart parser failures can reach the central error handler without passing the later protected-route cache guards. **Need separate test** of header behavior; source alone does not certify a real response's cache headers.
2. The central handler does not check `res.headersSent`; once output is committed, an error should be delegated according to Express's error-middleware contract, not followed by a second JSON send. **Need test**; no current real-world double-send incident established.
3. The explicit catch-all 404 occurs before the central handler and returns flat `{error:'Endpoint not found'}`; preserve it.
4. `POST /send-email` and geocode are public-route workflows explicitly deferred for additional hardening under D11. Do not expand R16-75 into their unrelated validation or abuse-control redesign.
5. Error status preservation alone is insufficient for public-message safety; an unmarked 400/401/403/404/409 should not return arbitrary `err.message`.
6. The central handler currently logs status with message omitted. Test to ensure no injected sentinel reaches logs, public bodies or secondary errors.

## Proposed isolated test matrix — NOT EXECUTED

| ID | Stimulus | Required observable result |
|---|---|---|
| R16-75-T01 | Deliberately marked approved 400, 401, 403, 404 and 409 | Preserve intended status, bounded safe message and existing nested central JSON shape |
| R16-75-T02 | Unmarked unexpected 400, 401, 403, 404 and 409, each containing a synthetic secret sentinel | Preserve applicable status; fixed generic public message; no sentinel in body or logs |
| R16-75-T03 | Unexpected 500/503, marked or unmarked | Fixed server-error public text; no exception message or stack; preserve status |
| R16-75-T04 | Missing status, noninteger status, out-of-range status, malformed error object | No unsafe content; defined safe fallback status/body; no secondary exception |
| R16-75-T05 | Error after headers/body committed | No second status/JSON send; proper delegation and bounded logging |
| R16-75-T06 | Malformed JSON / urlencoded / multipart body before router, using synthetic requests | Safe body, correct status, no-store where sensitive or protected; no parser diagnostics leaked |
| R16-75-T07 | Existing catch-all 404 and direct auth/subscription 401/403 | Exact existing status/response compatibility; no auth bypass |
| R16-75-T08 | Representative local familyTree, ftPrivacy, notifications, subscriptions, Budget, ETF, users paths | Preserve authorized positive and negative validation messages, domain-specific fields and wire shapes |
| R16-75-T09 | Shared `WA.api` flat `{error:'...'}`, `{message:'...'}`, nested `{error:{message:'...'}}`, empty response, non-JSON and 204 | Identify existing parser mismatch separately; no coercion-to-object text regression claimed as fixed by R16-75 |
| R16-75-T10 | GET auth recovery, 403, 503, POST denied/timeout, logout and unsaved form | Never silently retry unsafe mutation; preserve status/session behavior; no broad browser regression |
| R16-75-T11 | HTTP response caching and logs across main protected route prefixes | `no-store` verified for sensitive outcomes; no secret in status/log body |
| R16-75-T12 | Existing R16-55/56, R10/R14/R15 affected assertions | Preserve prior bounded passes, rerun only source-impacted assertions and document why |

**Execution preflight:** Before running any unit/integration/hosted tests, obtain explicit test authorization, pin exact original Google Drive file IDs/content hashes and destination deployment commit, verify isolated DB identity if a database is involved, identify safe non-real secret sentinels, confirm rollback, and avoid touching `main`/production. Offline isolated tests are preferred before staging tests. These T IDs are proposals, not test PASS claims.

## Narrow preparation package — later separately reviewed

A later proposal may contain a **complete** replacement `server.js` and, **only if justified**, a controlled expected-error creator/helper or isolated offline test files. Follow Core Standards CS-01 through CS-12 and Detailed `WA-ERROR-001`, `WA-API-002`, `WA-CACHE-001`, `WA-REVIEW-001` and relevant requirements. For each **revised** existing file include original and final SHA-256, unified `change/<basename>.diff`, separate `change/<basename>_Change_Verification.md`, complete replacement under the relative root destination, syntax/formatting review, test evidence, dependencies, regression risk and rollback/install instructions. Package paths must explicitly identify destinations such as `wonderfulApp/server.js` and `wonderfulApp/change/server.js.diff`. No installation, deployment or test execution is authorized by this review.

**Single next recommended action:** Prepare a narrowly scoped **R16-75 Step 3 correction proposal** against the freshly pinned authoritative `server.js`, including isolated tests and all mandated comparison/evidence files, for the owner's approval **before** installation/testing.

## Limits

This was a sampled dependency/consumer review, **not** an exhaustive endpoint-by-method registry or complete route-wide tracing of every `next(err)`. It did not reproduce HTTP responses, inspect server logs, verify Render deployment bytes, or establish the staging database identity. All previously recorded R16-74B failures and bounded older passes retain their original scope and baseline.
