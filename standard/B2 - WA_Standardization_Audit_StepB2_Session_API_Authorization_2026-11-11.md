# Wonderful Apps — Documentation-to-Implementation Standardization Audit
## Step B2: Browser Session, API, Authentication, Authorization and Frontend-Consumer Contracts

**Assessment date:** November 11, 2026  
**Status:** Read-only technical assessment; no remediation authorized  
**Priority:** Standardization across Wonderful Apps (WA)  
**Decision gate:** R16-75 remains paused  
**Baseline:** Authoritative Google Drive documents; implementation inspected at GitHub `sthink1/wapps`, commit `b5e2b06` (the November 10 staging baseline specified in the audit handoff). GitHub is a committed snapshot, not proof of all newer local/Drive changes or current Render deployment.

## 1. Purpose, scope and evidence definitions

This assessment determines how consistently the existing `WA.session` / `WA.api` browser contract is used across representative applications, how its failures interact with server authentication and subscription authorization, and which backward-compatibility requirements constrain future standardization. It **does not** implement changes, close open Stage 6 items, attest exhaustive application coverage, or allege any real-world security incident.

**Evidence labels:** **D** = exact source-document requirement; **C** = inspected committed source; **G** = inspected current authoritative Drive file; **T** = previously reported bounded test from November 10 handoff (not retested here); **I** = engineering inference; **U** = unverified/unknown. Line references below are 1-based lines in the fetched source text (GitHub line-number anchors). Source revisions and dates must not be conflated.

### Primary authoritative documentation

1. [`CLAUDE.md`](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view) (root `My Drive/wonderfulApp`; document dated October 13, 2026): §11 lines 871–890: backend authentication/ownership/input/security; §14 lines 1003–1018: backend standards, error handling consistency, shared utilities, documentation maintenance; §17 lines 1114–1134: change impact-checking and tests.
2. [`TechSummary.md`](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view) (same root; dated October 13, 2026): §11 lines 1024–1067 typical authentication and authorization; §12 lines 1109–1127 describes request pipeline, logging, validation, special Family Tree multipart handling; §20 lines 1343–1369 development checklist.
3. [`Stage6_OpenItems.md`](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view) (`docs/`, consolidated rev. 3.3 dated November 9): S6-005 lines 147/190 (shared session adoption and per-app tests); S6-008 line 150 and acceptance line 193 (401/403/network/mutation semantics); S6-018 line 160 and acceptance line 203 (failure distinctions and unsaved forms); S6-033 lines 175/218 (shared API names, error envelope, regression checks); S6-017 line 202 (Family Tree privacy header and uploads); S6-041 lines 368–375 (error policy and route inventory). The register contains historical status snapshots, not current deployment proof.
4. [`Stage6_Render_TestPlan.md`](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view), consolidated v2.3 dated November 9, 2026: recorded bounded R10/R14/R15 success and remaining acceptance work. The Nov 10 audit handoff supersedes its older staging-commit snapshot for the present source baseline.

### Evidence boundaries

- GitHub source is **pinned** to `b5e2b06`, because that is the user-confirmed last Live staging commit in the handoff. This analysis does **not** establish that the current branch HEAD or Live service still matches that commit.
- The active Drive `budget.html`, `etfCompare.html`, `FTPerson.html` were independently read and their relevant patterns compared with that same pinned GitHub snapshot. Drive modification dates were Nov 8, Nov 9, and Nov 8 respectively. Additional current Drive script bytes, runtime behaviors, and the complete inventory of WA apps were not independently reconciled.
- All conclusions that depend on app-side control-flow beyond the displayed examples require targeted tests and fuller source examination.

## 2. Current browser platform implementation — verified behavior

### 2.1 Shared facade and token lifetime

[`httpdocs/js/waPlatform.js`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L1-L165) implements `window.WA.session` (`restore`, `isAuthenticated`, `logout`, `setAccessToken`, `getAccessToken`) and `window.WA.api` (`request`, `json`) at lines 157–163. Its `TOKEN_KEY='token'` and `localStorage` access at lines 9 and 22–31 are explicitly described as **temporary compatibility** for existing pages. Hence, presence of direct `localStorage.token` references does not by itself prove a new defect; it does reveal unfinished centralization when a page issues its own protected API request.

`assertPath()` at lines 33–39 requires a leading `/` same-origin path. `raw()` at lines 50–56 replaces any caller-provided `Authorization` with the session token and makes a `same-origin` credentialed request. **Implication (I):** routing existing callers through this facade requires a path/base-origin inventory. Callers using absolute `http://localhost:8080` or external provider URLs are not automatically compatible.

### 2.2 Refresh/restoration and mutation safety

- `restore()` at lines 93–109 checks non-expired tokens with `/users/session-status` and attempts cookie refresh when appropriate; it records distinct reasons including `explicit_logout`, `network`, `server_error`, `login_required`, and `restore_unavailable`.
- `refreshUnderLock()` and `refresh()` at lines 59–91 enforce a `navigator.locks` cross-tab lock or fail closed if it is unavailable; they detect explicit logout/account replacement before installing a rotated token.
- `request()` at lines 111–132 refreshes before requests if needed, but **does not automatically replay non-GET/HEAD operations or requests with a body after a 401**. It permits a bounded GET/HEAD retry after successful refresh.
- `logout()` at lines 139–156 locally prevents continued use of the access token, records `serverRevoked`, and may report an error if server revocation fails. **Do not equate local sign-out with independently verified server-side revocation.**

**Assessment:** These are concrete shared behavioral safeguards (C), aligned in principle with S6-008 and S6-018; they do not establish that every frontend route uses them or that every browser/platform has passed acceptance.

### 2.3 Important error-envelope incompatibility

`waPlatform.js` `readError()` at lines 41–48 extracts `(data.message || data.error)` as an `ApiError` **message**, and `(data.code || data.error)` as an error **code**. However, [`server.js`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L216) uses a nested object: `{error:{message: publicMessage}}`. Other routes return `{error:'...'}` or `{message:'...'}`. A nested `error` object can therefore be passed as a value to `ApiError` in the shared facade instead of a normalized string. **Confirmed source-contract mismatch (C)**; precise user-visible presentation and downstream behavior **require tests (U)**. This is additional evidence for S6-033, separate from the R16-74B unexpected-4xx disclosure.

`readError()` may also treat a textual error message as a machine-readable code when `data.code` is absent. The required standardized representation and compatibility with existing consumers should be specified before changing a response shape.

## 3. Server authorization and response semantics

### 3.1 JWT authentication

[`middleware/auth.js`](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/auth.js#L1-L12) parses `Authorization: Bearer`, rejects missing tokens with **401**, calls shared `verifyAccessToken()`, returns `AuthenticationError`'s status and code, and forwards other errors to `next()`. It preserves `req.user.userId` by design. The endpoint's machine-readable authentication contract currently differs in envelope/detail from the shared `server.js` error handler.

### 3.2 Web-only and subscription access

[`middleware/subscriptionAccess.js`](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/subscriptionAccess.js#L1-L36) exposes `authenticateToken`, `requireAppAccess`, `isAdminUser`:
- `authenticateToken` passes JWT auth, then requires `req.user.client === 'web'`, otherwise sends **403** `WEB_SESSION_REQUIRED` (lines 9–10).
- `requireAppAccess(appKey)` permits a verified administrator override (lines 11–17), else calls `getAppAccess(userId, appKey)`, sending **403** with `error`, `reason`, and `app` on denial (lines 19–29). Unexpected exceptions are forwarded to Express (lines 29–31).

**What the source proves:** a centralized route middleware policy is available. **What it does not prove:** every protected route mounts both auth and appropriate app authorization; that every app checks record ownership; that the current stored user, administrator, subscription, and privacy models have passed exhaustive tests. This distinction is essential to avoid broad security certification based on a few paths.

### 3.3 Error envelope diversity intersects authorization

Representative existing response shapes:

| Source | Example format | Status semantics | Integration consequence |
|---|---|---|---|
| `middleware/auth.js` lines 6–9 | `{error:'...'}` | 401/AuthenticationError | Legacy clients may expect simple string code |
| `middleware/subscriptionAccess.js` lines 21–26 | `{error:'Subscription access denied.',reason:'...',app:'...'}` | 403 | Denial UI may depend on `reason` and `app` |
| `server.js` lines 199–216 | `{error:{message:'...'}}` | exception status or 500 | Shared `readError()` does not normalize nested shape |
| `routes/ftPrivacy.js` lines 12–20 | `{message:'...'}` | e.status or 500 | Family Tree privacy displays `data.message` |
| `routes/users.js` lines 263–270 | `{error:publicError}` | 4xx/5xx | Refresh auth uses string error codes |

**Confirmed (C):** envelope variation. **Not established (U):** that all variation is wrong; some route responses are established public APIs and must be retained or adapted safely.

## 4. Representative frontend consumers and standardization boundaries

### 4.1 Budget — staged integration versus legacy request helpers

- Authoritative Drive [`budget.html`](https://drive.google.com/file/d/1LFKKrIo0dekGyBKb9Xbq7QwjT3Ltl7oj/view) has `localStorage.getItem('token')` at line 533 and loads `js/waPlatform.js` at line 556 (G); it is a landing page and does not prove all Budget form APIs use WA.
- [`httpdocs/BinForm.html`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/BinForm.html#L477-L505) reads legacy `localStorage` token and constructs its own authenticated `fetch`; it also loads the shared script near line 1116. Its `entryForm` and payload processing are nontrivial (form at lines 305–349, payload near 647–664).

**Confirmed (C):** a Budget form uses a separate request path while loading the common script. **Review gate:** preserve field values, unsaved forms, API validation messaging, and no-automatic-mutation-replay when standardizing. Whether its existing helper handles token expiry adequately is **not certified here**.

### 4.2 ETF — direct Bearer request and potential 401 semantics gap

Authoritative Drive [`etfCompare.html`](https://drive.google.com/file/d/14GOFxGPAAApRaQQTx2fBuzWSt42ai8Qq/view) lines 227 and 276–279 reads `localStorage.token`, calls `fetch(url, {headers:{Authorization:Bearer...}})`, and throws `Error('API error: '+res.status)` on non-success (G). It loads `waPlatform.js` at line 766. The pinned GitHub source contains the same relevant patterns.

**Confirmed (G/C):** shared facade is loaded but this request does not use `WA.api`. **Inference (I):** its errors are less specific than the shared facade and refresh behavior may differ. A deterministic invalid/expired-token test, plus permitted/denied subscription tests, would be required to establish actual user-visible impact. API-provider calls and caching must not be swept into a same-origin replacement without checking their endpoints and quotas.

### 4.3 Family Tree — special privacy and upload contracts

- Authoritative Drive [`FTPerson.html`](https://drive.google.com/file/d/1ExZoHfGWXuSQtN2HIkJmR9gjwUP4kn2r/view) includes `FTPrivacy.js` at line 1371 and `waPlatform.js` at line 1374 (G).
- [`httpdocs/js/FTPrivacy.js`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/FTPrivacy.js#L1-L63) reads the token directly, installs `X-FT-Page-Token` for Family Tree `fetch` calls by wrapping `window.fetch`, handles one-time handoff, and expects privacy errors in `data.message` (lines 4–8, 23–38). These are privacy-specific behaviors; the shared platform itself intentionally does not replace `window.fetch` (waPlatform lines 1–5).
- [`httpdocs/js/FTPerson.js`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/FTPerson.js#L19-L30) separately supplies Bearer headers; it also constructs multipart `FormData` upload requests around lines 537–551. The server specifically preserves a Family Tree multipart special case ([`server.js`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L58-L65); `TechSummary.md` lines 1125–1127).

**Confirmed (C/G/D):** Family Tree has intentional privacy-header and upload requirements that a standardized transport must preserve. **Potential integration issue requiring test (I/U):** converting its calls to `WA.api` without ensuring the per-page token survives and without preserving multipart boundaries could break protected Person data or uploads. Do not label the privacy wrapper itself as a security vulnerability absent a direct test.

### 4.4 Shared usage tracking — a partial adoption example

[`httpdocs/js/usageTracking.js`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/usageTracking.js#L1-L126) requires `waPlatform.js`, calls `WA.api.request` for routine tracking (lines 28–32), and uses a direct Bearer `fetch` for page-exit delivery (lines 42–55). The special exit path is not by itself noncompliant; it reflects browser lifecycle constraints. This is a **mixed-mode implementation** that merits its own explicit exception in any future standard, including the existing no-unsafe-replay rule. Preserve prior bounded R15 tracking results.

### 4.5 Home — shared restoration alongside direct requests

[`httpdocs/home.html`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/home.html#L1215-L1245) uses `WA.session.restore()` and `WA.api.json('/users/session-status')`; the same file also contains multiple direct `fetch` and `localStorage` Bearer request paths (e.g., lines 841–853 and 1478–1486). **Confirmed (C):** mixed adoption. **Requires verification:** which direct paths are deliberate, protected, automatically retried, or necessary for existing UI behavior.

## 5. Traceability matrix — focused sample (not full route inventory)

| ID | Documented intent / requirement | Source evidence | Classification | Risk / priority | Confidence | Review-only disposition |
|---|---|---|---|---|---|---|
| B2-01 | Shared browser session interface, S6-005/033 | `waPlatform.js` 157–163 | Implemented shared foundation | Medium | High | Retain as baseline; inventory adoption |
| B2-02 | Consistent authenticated calls, S6-005 | `BinForm.html` 481–500; `etfCompare.html` 227,276–279; `FTPerson.js` 23–27 | Incomplete adoption in sampled callers | High | High | Enumerate all endpoint consumers before migration |
| B2-03 | 401/403/network outcomes, S6-008/018 | `waPlatform.js` 93–132; `auth.js` 6–9 | Shared behavior exists; app-wide parity unverified | High | High/Medium | Trace token expiry, no replay, status differences |
| B2-04 | Response contract, S6-033 | `waPlatform.js` 41–48 vs `server.js` 199–216 | Confirmed shape mismatch | High | High | Define parser/contract, preserve legacy codes |
| B2-05 | Centralized auth and app access | `auth.js` 1–12; `subscriptionAccess.js` 9–31 | Mechanisms implemented; coverage incomplete | High | High/Medium | Build route/middleware ownership inventory |
| B2-06 | Preserve Family Tree privacy, S6-017 | `FTPrivacy.js` 4–8, 23–38; `FTPerson.js` 537–551 | Special integration contract exists | High | High | Explicit acceptance for header, token, upload |
| B2-07 | Prevent duplicate mutation, S6-008/018 | `waPlatform.js` 111–132 | Implemented within shared facade | Critical if altered | High | Never assume other direct callers have same guard |
| B2-08 | Browser portability, S6-026/036 | `waPlatform.js` 82–91 uses Web Locks | Known unsupported-lock policy gate | High | High | Preserve fail-closed design; actual matrix pending |
| B2-09 | Documentation is review authority | `CLAUDE.md` §§14/17, `TechSummary.md` §§11/12/20 | Normative process, incomplete specific API interface | Medium | High | Define versioned technical interface for review |
| B2-10 | Do not break backend responses used by UI | Budget, ETF, Family Tree custom envelope and HTTP statuses | Compatibility-dependent | High | High | Map consumers before recommending normalization |

## 6. Provisional technical standardization contract — **candidate, not approved**

The following are technical questions that a normative, reviewable WA standard must settle **after** complete consumer/route mapping, not code changes:

1. **Request boundary:** Which browser-facing WA calls *must* use `WA.api.request/json`, and which documented exceptions (page-exit tracking, file upload, Family Tree privacy middleware, external APIs) may use direct `fetch`? Determine same-origin path and local-development handling before adopting it universally.
2. **Authentication lifecycle:** Define the current access token, temporary legacy storage, remembered refresh cookie, Web Locks fallback, explicit logout semantics, server-revocation reporting, cross-tab/account-switch protections and prohibited silent retries.
3. **Authorization:** Define precedence and purpose of **401 unauthenticated**, **403 authenticated but denied**, app subscription reason, administrator override, ownership, and privacy page-token denials. The UI must not infer security from disabled buttons.
4. **Error schema:** Specify a canonical, machine-readable `code`, safe public `message`, HTTP `status`, and compatible handling of existing `{error:string}`, `{message:string}`, `{error:{message}}`, `{error,reason,app}`, and `{valid:false}` responses. Preserve existing response data until individual consumers are known.
5. **Unexpected failures:** Explicit expected error marking versus unexpected exceptions; no raw internal messages on unexpected 4xx or 5xx, aligned with prior R16-74B findings and R16-75 pause.
6. **Mutation safety:** Never replay writes automatically after uncertain delivery or a 401; specify how users retain unsaved forms and receive recoverable failure states.
7. **Privacy/upload invariants:** Family Tree `X-FT-Page-Token`, one-time unlock expectations, native `fetch` wrappers, `FormData` and server multipart bypass are first-class compatibility requirements.
8. **Acceptance/test gate:** Require source contract mapping plus isolated error tests, local authenticated/denied workflows, hosted representative cases, network/timeout injection, session expiration/revocation, cross-browser matrix, and explicitly scoped PASS results.

These are **candidate requirements**, not claims that existing October documentation already mandated their exact text.

## 7. Causal assessment — do not confuse dates

**Confirmed:** October 13 architecture documentation contains a broad development standard and describes authentication and server request processing, but its examined sections do not define a single precise browser-to-server error envelope. November Stage 6 requirements explicitly identify incomplete session/error standardization. The November 10 committed implementation combines shared facilities with app-local request/error patterns. Thus, this step supports **both a precision/enforcement documentation gap and an implementation-adoption gap**.

**Inference only:** Some app-local patterns may predate the shared Stage 6 facade or persist to maintain compatibility. Without timestamped code history and developer instructions in effect at the time, there is **no basis to attribute noncompliance to an individual programmer**.

**Not established:** complete current Drive-vs-commit equivalence; current Render HEAD; total number of affected endpoints; production exposure; browser impact of nested error object; actual session-expiry behavior of `BinForm`/ETF; full Family Tree privacy/upload and cross-browser regressions.

## 8. Stage 6 safeguards and next bounded step

**Preserved:** R10, R14, R15 bounded passes; reported R16-55–73A targeted passes; R16-74B isolated handler finding; all other outstanding formal requirements and qualifiers. No accepted tests were rerun here, no statuses were expanded, and R16-75 remains paused. No user-managed Drive/local/GitHub/Render/database files were created, edited, deployed, or deleted.

**Next proposed read-only work package, B3:** Build a route-to-middleware/consumer matrix for selected high-impact endpoints (refresh/session-status, Budget create/update, ETF compare and trade, Family Tree privacy and upload, subscription denial). For each, record exact route mounting, authentication/authorization/ownership conditions, emitted response schemas, frontend parser/refresh behavior, and existing tests. Then produce a **candidate authoritative technical standard** with explicit applicability, exceptions, signatures, response examples, and acceptance gates for user/design-engineer review. Do not change any implementation or normative project documentation pending approval.

---
**Document status:** Draft audit evidence for independent review. Not an installed update to `CLAUDE.md`, `TechSummary.md`, or Stage 6 artifacts.
