# Wonderful Apps — Documentation-to-Implementation Standardization Audit
## Step B4 — Endpoint Access Classes, Producer–Consumer Contracts, and Acceptance Evidence

**Assessment date:** November 11, 2026  
**Status:** Read-only, evidence-based engineering review draft; **not** approved implementation instructions.  
**Priority:** Enforceable project-wide standardization without breaking necessary application-specific behavior.  
**Code baseline:** `sthink1/wapps` at Git commit `b5e2b06` on historical Stage 6 `reviseLogIn`. This is a **pinned source snapshot**, not proof of the present branch HEAD, the authoritative Drive source byte contents, or the currently deployed Render version.  
**Scope:** Selected, explicitly enumerated endpoints, their outer and inner middleware, response shapes, browser producers/consumers and known regression evidence. This is a representative and risk-oriented inventory, **not** certification of every route or SQL branch.

## 1. Sources, authority, evidence vocabulary

Authoritative **maintained documentation**:

1. [`CLAUDE.md`, root of Drive `My Drive/wonderfulApp`](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view), document last updated **October 13, 2026**. §11 requires JWT authentication, user ownership, validation and safe credential handling; §14 requires consistent backend error handling and use of shared utilities; §17 requires review of frontend, backend, schema and regressions before change. **The phrase “Keep error handling consistent with the project” is directional, not a fully specified shared wire contract.**
2. [`TechSummary.md`](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view), last updated **October 13, 2026**. §§11–12 describe `authenticateToken`, `requireAppAccess` where relevant, ownership/validation, data processing, JSON responses and safe output; §20 lists the developer checklist.
3. [`Stage6_OpenItems.md`](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view), consolidated revision 3.3 dated **November 9, 2026** (Drive modification **November 10**): S6-005, S6-008/009/017/018/019/030/033/041 remain applicable requirements. Importantly this edition contains older snapshots and is not automatically the latest R16 results.
4. [`Stage6_Render_TestPlan.md`](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view), consolidated version 2.3 dated **November 9, 2026**; bounded R10/R14/R15 acceptance does not establish blanket API safety.
5. [November 10 Documentation-to-Implementation Audit handoff](https://drive.google.com/file/d/18UCvXFT8UbVm-F-qCK1Rj4KhEE85RRC3/view): preserves later R16-55–74B results, the intentional pause of R16-75, and the last user-confirmed Live staging commit `b5e2b06`. Earlier Drive status documents predate these latter tests and must not overwrite their accepted result ledger.

**Evidence labels:** **S** = directly verified in the pinned source; **D** = documented requirement; **T** = test result preserved from dated handoff, **not independently rerun here**; **I** = inference; **U** = unresolved / requires test or additional source. **Compliant** means evidence satisfies the narrow stated criterion only. An intended security design is not equivalent to a hosted test PASS.

## 2. Project-wide route registration and access-class map

At [`server.js:120–190`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L120-L190), `Cache-Control: no-store` is added to `/users`, `/subscriptions`, `/admin-management` and a group including `/notifications`, `/track`, `/tnna`, `/weights`, `/activities`, `/weightActivities`, `/interestEarned`, `/budget`, `/familytree`, `/etf`; the protected application routes follow. The static asset serving policy is separate. This is a **source verified** response-header arrangement, not exhaustive browser-cache behavior certification.

| Access class | Exact mount or representative endpoint | Server controls observed | Required exception / unresolved property |
|---|---|---|---|
| Web-session protected | `/weights`, `/activities`, `/weightActivities`, `/interestEarned`, `/budget`, `/etf` | Outer `authenticateToken` → `requireAppAccess(appKey)` → usage middleware → router; see `server.js:163–167,185` | Per-user row ownership still must be checked separately; some routers repeat `auth` |
| Family Tree ordinary | `/familytree/persons/:id`, `/familytree/persons/:id/pets` | `authenticateToken` → `family_tree` entitlement → usage → `ftPrivacy.protection` → route-specific guards (`server.js:183`) | Private-person capability, tree membership, collection redaction and uploads are additional controls |
| Family Tree public one-time token | GET/POST `/familytree/contact-email-verification/:token` | Narrow regex/method bypass at `server.js:172–179`, then Family Tree router | Public by design, not a missing login gate; assess token entropy, expiry, consumption, disclosure separately |
| Family Tree public privacy approval | `/familytree/privacy-verify/:token` | Dedicated public router at `server.js:180`; implementation `ftPrivacy.js` | Approval is tied to token and verified contact; do not put behind ordinary login by assumption |
| Family Tree private privacy API | `/familytree/privacy/*` | `authenticateToken` → `family_tree` entitlement → privateRouter (`server.js:181`) | One-visit page token and privacy-specific authorization remain necessary |
| Users: public / credential / cookie | `/users/login`, `/users/verify-code`, `/users/refresh-session`, password recovery | Endpoint-specific identity, verification, token and/or Origin checks (`routes/users.js`) | Must not require an existing JWT for initial login or cookie-based session renewal |
| Users: web JWT | `/users/logout`, `/users/session-status`, `/users/change-password`, `/users/is-admin` | `auth` on routes, web-client guard in applicable operations, Origin on logout/password change | `401` versus `403` and wrong-password semantics must not collapse into one client action |
| Subscriptions | `/subscriptions/*` | Router-wide `authenticateToken`, admin checks on admin operations (`routes/subscriptions.js:21,78–190`) | Access/status API is not identical to administrator mutation API |
| Notifications public-token | `/notifications/unsubscribe/:token`, `/notifications/network-verification/:token` | Public GET/POST endpoints; no generic login requirement (`routes/notifications.js:58–129`) | Public token validity and one-time/response state require dedicated tests |
| Notifications authenticated | `/notifications/preferences` GET/PUT | Route `auth` (`routes/notifications.js:27,36`) | Owner-scoped preference service and malformed body handling should be traced in later deep audit |
| Tracking user writes | POST `/track/log/page`, `/track/log/time-spent` | `auth`; `req.user.userId` is used for inserted `TrackUsageT.UserID` (`routes/track.js:561–594`) | Page/duration validation, lifecycle and duplicate/no-replay remain test topics |
| Tracking admin reports | GET `/track/app-usage`, `/users`, `/user-usage`, `/current-plans`, `/free-tier-usage`, `/stats` | `auth` + `requireAdmin` (`routes/track.js:596–710`) | `/track/users` is **not** `/users`; protect user-data reporting; verify admin decisions and query validation |
| Admin management | `/admin-management/status`, `/target/:userId`, `/prepare`, `/pending`, `/cancel`, `/complete` | `router.use(auth,webOnly)` plus administrator and Origin/pending gates (`routes/adminManagement.js:21–121`) | Do not overstate complete transfer-race protection from this routing sample |
| Native TNNA | `/tnna/version`, `/verify-code`, `/refresh`, `/logout`, `/me`, `/admin/*` | Public version/verification/refresh; JWT on `/me`, administrative authorization on `/admin/*` (`routes/tnna.js:115–458`) | Native refresh/replay and device binding are distinct from browser Secure-cookie policy; do not substitute web-only middleware |
| Geocoding | `/api/geocode` | Direct router mounted at `server.js:189` | Existing documentation defers subscription/cost model; actual route controls require a separate audit |

**Do not infer:** a route lacking `authenticateToken` at the *mount* is necessarily unauthenticated; it may authenticate inside the router. Conversely, an outer authentication gate alone does not prove row-level permission checks.

## 3. Detailed traceability matrix — representative endpoints

Source links use **line anchors at the pinned commit**. Requirement status is narrowly phrased; all rows are read-only observations.

| ID | Endpoint / method | Exact source evidence and policy chain | Client/error contract | Audit disposition | Evidence and next gate |
|---|---|---|---|---|---|
| B4-01 | `GET /weights` | [`server.js:163`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L163), [`weights.js:10–48`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/weights.js#L10-L48): outer web auth+`weigh_in`, inner `auth`, parameterized `WHERE UserID=?` | `400 {error:string}` on validation; result rows on success | **S: compliant sampled auth/ownership pattern**; full route not certified | Preserve R14 bounded access and Weight read regressions; negative cross-user tests for other methods remain |
| B4-02 | Budget `POST /budget/in` and related configured CRUD | [`server.js:167`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L167), [`budget.js:398–491`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/budget.js#L398-L491): outer auth/entitlement plus `auth` inside dynamic CRUD routes | Existing Budget `error` field and `(be)` suffix; [`BinForm.html:481–507`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/BinForm.html#L481-L507) direct Bearer `fetch` and suffix normalization | **S: shared server gate; S: client API adoption gap** | Form state preservation, permitted CRUD, 401/403/network/5xx responses, no duplicate mutation |
| B4-03 | ETF `GET /etf/compare` | [`server.js:185`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L185), [`etf.js:387`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/etf.js#L387): outer ETF entitlement plus inner `auth` | [`etfCompare.html:227–279`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/etfCompare.html#L227-L279) snapshots localStorage token and builds direct fetch | **S: server gate; S: shared session/API migration incomplete** | Must preserve date anchors, quote/price provider behavior, rate-limit response and existing chart UI |
| B4-04 | `POST /users/refresh-session` | [`users.js:263–270`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263-L270) Origin check, refresh rotation, and expected-error classification | `200 {token}`, failure `{error:string}`; `WA.session` uses refresh lock | **S: intentionally cookie-authorized**; R16-72 bounded success preserved | Origin negative cases, missing cookie, synthetic unexpected errors; no arbitrary 401 replay |
| B4-05 | `GET /users/session-status` | [`users.js:273–292`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L273-L292): Bearer `auth`, web-client check, session row scoped by user and public session ID | `200 {authenticated,userId,username,client,keepMeLoggedIn}` or `401 {error}` | **S: identity/session check visible** | Existing bounded R10/R14 results; complete expiration/revocation combinations not reasserted |
| B4-06 | `POST /users/change-password` | [`users.js:295–315`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L295-L315): JWT, web-only, Origin, password validation and transaction logic | Incorrect current password explicitly `401 {error:'Incorrect current password.'}` | **S: distinct business error; do not equate this 401 with expired login** | S6-018 client-state preservation; completed change-password bounded PASS remains preserved |
| B4-07 | `/subscriptions/admin/*` selected POST/PUT/DELETE | [`subscriptions.js:21,78–190`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/subscriptions.js#L21-L190): router auth then `requireAdmin` | Admin-denial `403 {error:string}` | **S: admin gate present**; no exhaustive authorization proof | Preserve R14 admin/Standard tests; verify source routes and negative cases on each operation |
| B4-08 | `POST /track/log/page` and `/log/time-spent` | [`track.js:561–594`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/track.js#L561-L594) authenticated, user from verified req.user | `200 {message:string}`, fixed `500 {error:'Tracking error'}` | **S: user identity sourced from JWT**; payload validation not certified | S6-025 page/time lifecycle, network ambiguity and no duplicate automatic replay; R15 bounded PASS preserved |
| B4-09 | `GET /track/users` and `/user-usage` | [`track.js:608–649`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/track.js#L608-L649): `auth`, `requireAdmin`, selected user ID validation | `400 {error}`, `404 {error}`, success report data | **S: admin-only and input validation visible** | Confirm admin exact identity policy and all report data sensitivity / log handling |
| B4-10 | Family Tree pets `GET /persons/:id/pets` | [`server.js:183`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L183); [`familyTree.js:8340–8355,8376–8384`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L8340-L8384): `petHandler` checks `requireTree` and `treeHasPerson` before action | `404 {message}` for missing membership, `{pets}` success; sanitized error helper | **S: sampled tree membership enforcement**; separate private-person redaction in mount | Negative private page-token and cross-tree access plus accepted R16-55–66 tests |
| B4-11 | Family Tree pets `POST /persons/:id/pets` | [`familyTree.js:8385–8396`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L8385-L8396): membership guard through `petHandler`, transactional insert, maximum-four validation | `201 {message,petID}`; marked `400/409`; unexpected response sanitized | **S: selected expected-error pattern visible** | Preserve PET CRUD, privacy, transaction, owner/user and upload regression checks |
| B4-12 | Family Tree verification GET/POST | [`server.js:172–180`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L172-L180); [`familyTree.js:5263–5296`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L5263-L5296) | Public token URL; status/messages specialized | **S: intentional public exception**; **U: token lifecycle adequacy** | No blanket middleware migration; independently test token expiry/reuse/side effects |
| B4-13 | Private Person data routes | [`server.js:181–183`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L181-L183), [`ftPrivacy.js:100–129`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/ftPrivacy.js#L100-L129): validates tree membership, page capability, redacts related Persons in JSON | `423 {code:'PRIVATE_LOCKED',message}`, privacy-specific payload shapes | **S: specialized privacy middleware; coverage requires tests** | S6-017 token propagation, fresh key, collection redaction and upload integration |
| B4-14 | Public notification unsubscribe GET/POST | [`notifications.js:58–95`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/notifications.js#L58-L95): token-based endpoint without auth | Masked destination on GET, fixed public response on POST | **S: intentional public token route** | Service token validation, repeat use, expiry and no account enumeration pending review |
| B4-15 | `/admin-management/prepare` and `/complete` | [`adminManagement.js:21–48,121`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/adminManagement.js#L21-L121): web JWT, Origin middleware and administrator checks | Fixed `{error}` messages in sample | **S: layered controls visible**; transaction/state machine not exhaustively reviewed | Guarded administrator transfer and canceled/pending race tests require separate matrix |
| B4-16 | TNNA `/refresh` vs web `/refresh-session` | [`tnna.js:244`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/tnna.js#L244); [`users.js:263`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263) | Distinct native device refresh credentials vs web refresh cookie | **S: different protocol**; **U: full token family/replay checks** | Never auto-consolidate two credentials into one web handler; preserve native device regressions |
| B4-17 | Central unexpected exception | [`server.js:199–215`](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215) returns a 4xx `err.message` without shared expected-error check | `{error:{message:string}}` differs from route response shapes | **S: documented R16-74B deviation**, synthetically failed security expectation; **no live sensitive exposure established** | R16-75 paused until standardized policy and all consumers agreed |

**Important limitation:** This matrix is **not** a complete list of the application's ~thousands of statements and many dozens of routes. Dynamic `budget.js` registrations, Family Tree's large router and native workflows require a machine-auditable complete endpoint registry before a project-wide certification is possible. Source evidence above does not substitute for hosted or negative authorization tests.

## 4. API wire-contract classes confirmed in the sample

| Producer class | Observed response pattern | Consumer and compatibility implication | Status |
|---|---|---|---|
| Web users/auth | `401 {error:'SESSION_INVALID'}`, `403 {error:'ORIGIN_NOT_ALLOWED'}`, success `{token}` / session object | `WA.session` refresh/session restore must distinguish absent session and network error | Existing design, route-specific |
| Subscription denial | `403 {error:'Subscription access denied.',reason,app}` | UI must retain reason and app to distinguish entitlement from expired authentication | Source confirmed |
| Budget | `{error:string}` with historical `(be)` suffix on some paths | `BinForm.apiFetch` strips suffix; changing wire contract can break display | Source confirmed |
| ETF | `{message:string}`, provider-specific statuses including 429/502/503 | Chart and market provider UI may depend on message and status | Source confirmed |
| Family Tree | `{message:string}`, some `{code,message}` and 423 privacy lock | Private Person page must retain page-token/popup behavior | Source confirmed |
| Tracking | `{error:string}` failures and `{message:string}` tracking acknowledgements | Client lifecycle and keepalive logic must preserve no-unsafe-replay policy | Source confirmed |
| Central Express | `{error:{message:string}}` | [`waPlatform.js:38–47`](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L38-L47) reads `data.error` directly: object-valued error may reach `ApiError`; actual presentation not tested | **Confirmed shape mismatch; user-visible impact not verified** |

**Design observation:** A uniform *internal* error taxonomy can be introduced conceptually without immediately rewriting legacy **external wire responses**. Backward compatibility and adapter tests must be designed before approving any migration. This is a proposal, not a permission to change code.

## 5. Traceability of documentation and why the current code differs

| Requirement / source | Concrete supported observation | Classification | Cause attribution and confidence |
|---|---|---|---|
| `CLAUDE.md` §11: `UserID` ownership; subscription checks are not ownership checks | Sample `weights.js` scopes SQL to `req.user.userId`; `petHandler` checks tree membership; generic mount grants only app entitlement | **Compliant in sampled paths; others unverified** | High confidence for code snippets; no inference about all modules |
| `TechSummary.md` §12: layered request processing | Main paid web apps have centrally ordered auth/entitlement/usage | **Compliant sampled architectural pattern** | High confidence for middleware mounting |
| `CLAUDE.md` §14: consistent backend error handling | 4xx expected-error handling and wire formats differ across modules; global handler R16-74B lacks marker check | **Confirmed standardization gap, not proven historical violation** | High confidence source difference; current documentation's specificity/chronology insufficient for programmer-fault finding |
| S6-005/S6-033: shared `WA.session`/`WA.api` and error envelope | Direct `fetch` in `BinForm`, ETF and Family Tree; `WA.api` exists and is used elsewhere | **Requirement incomplete** | High confidence sampled adoption; likely incremental migration, but actual cause undocumented |
| S6-017: privacy headers/public links/uploads | Dedicated Family Tree privacy middleware + public token routes and multipart exception | **Necessary specialization, not inconsistency by itself** | High confidence routing; runtime correctness still needs testing |
| S6-008/S6-018: 401/403/network/5xx, no unsafe replay, unsaved form | Shared API limits retry to safe read methods; legacy direct fetch wrappers have separate behavior | **Partial implementation / test coverage** | Code confirmed; full browser scenarios open |
| S6-030/S6-041: sensitive error/log review | Fixed log messages in sampled Tracking routes; central R16-74B retains 4xx disclosure risk | **Mixed; audit incomplete** | Synthetic central failure preserved, no incident claim |
| Stage 6 mandatory independent review | Audit findings remain proposals; no changes or deployments made | **Process compliant to date** | Independent sign-off remains future gate |

### Historical accountability limit

The October 13 architecture guides cannot demonstrate what instructions existed when any older route was originally written. To determine whether a *historical* implementation violated an instruction then in force, retrieve revision/commit dates for the precise clause and route and compare their chronology. **No attribution of developer noncompliance is established by the present evidence.**

## 6. Proposed standardization specification for engineering review (NOT yet approved)

**B4-STD-01 — Machine-reviewable endpoint registry.** Each endpoint shall have a stable ID, method, full mounted path, controller source+line, access class (`PUBLIC_TOKEN`, `PUBLIC_INFO`, `WEB_SESSION`, `NATIVE_SESSION`, `ADMIN`, `SERVICE`), entitlement key or explicit `NONE`, row-ownership rule, Origin/CSRF applicability, privacy capability requirements, rate limit, caching rules, response schema version, frontend consumers, and tests. Mark unknowns `UNVERIFIED`, never `PASS`.

**B4-STD-02 — Authorization depth.** Authentication, entitlement, administrator privileges, resource membership/ownership, and privacy capabilities must be represented as distinct layers. An administrator override to app entitlement does not silently override every row or privacy condition. An endpoint may exempt itself from a layer only with a documented substitute control and reviewed threat model.

**B4-STD-03 — Expected vs unexpected error classification.** Use one reviewed internal taxonomy. Only explicitly declared intentional client errors can surface approved text. Unexpected errors never reveal `err.message`, stacks, tokens, database driver messages or raw URLs merely because an error carries status 400–499. Preserve relevant status semantics. The R16-75 fix remains separately paused until the contract is approved.

**B4-STD-04 — Backward-compatible external contracts.** Define canonical internal `{status,code,publicMessage,details?}` semantics but do not force an unapproved server wire rewrite. Maintain documented adapters/tests for existing `{error:string}`, `{message:string}`, `{code,message}`, `{error:{message}}` and subscription `{reason,app}`. Review browser and TNNA clients independently before changing any field or status.

**B4-STD-05 — Browser request behavior.** For new calls, prefer shared `WA.api` only where it preserves special headers, FormData and URL origin requirements. `401` refresh is conditional; `403` entitlement denial is not a login failure; transient errors must preserve unsaved user data. Do not automatically replay ambiguous POST/PUT/PATCH/DELETE requests. Preserve existing bounded R10/R14/R15 coverage and add compatibility tests for each migrated consumer.

**B4-STD-06 — Public token exceptions.** Every unauthenticated token-based endpoint shall document token issuance, entropy, expiry, single-/multi-use decision, account enumeration limits, origin requirements, logging/caching restrictions and a negative-test matrix. Public email workflows should not be broken by mechanically applying browser-session middleware.

**B4-STD-07 — Native app separation.** Native refresh/device binding must be separately specified and tested; preserving native endpoints is mandatory even if a shared semantic error vocabulary is adopted. No installed TNNA change during this audit.

**B4-STD-08 — Proof requirements.** An endpoint is `Verified` only after source review of all auth/ownership paths **and** approved positive/negative tests with recorded commit, environment, status/payload expectations, and limitations. Tests are classified `unit/isolated`, `local HTTP`, `hosted staging`, or `browser/native` and never conflated. Regression selection is risk-based; previously completed PASS tests are inherited unless the changed contract directly affects them.

## 7. Recommended acceptance matrix before standardized changes

| Access case | Expected design property | Required evidence |
|---|---|---|
| Unauthenticated browser to protected app | `401`; no private data | source + local/hosted negative; preserve original UI behavior |
| Authenticated non-entitled user | `403` preserving app/reason when relevant; no operation | source + representative matrix incl. Standard/expired |
| Authorized user requesting another user's record | deny/not disclose even with subscription | per-route SQL/resource membership review + negative test |
| Non-admin requesting admin report or mutation | deny before data access | verified admin middleware chain and 403 test |
| Public verification token invalid/expired/consumed | fixed safe response, no unintended state change | token lifecycle tests without real production actions |
| Locked Family Tree Person | private data withheld without valid fresh page capability | no-token/bad-token/correct-token GET and mutation tests |
| Multipart upload | auth+entitlement+privacy rules, FormData intact | selected staging upload tests and request header checks |
| Expired JWT, valid remembered browser session | refresh only where supported; safe GET handling | browser test with session lock, no unintended account switch |
| 401 on POST after ambiguous state | no automatic unsafe replay | instrumented isolated client test; preserve form data |
| 403 entitlement error | no silent reauthentication or lost form | application-specific UI test |
| Unexpected status-bearing 400/403 exception | no unexpected internals in body | isolated and integration tests; central R16-74B still open |
| Server/network failure | no internal details, error category retained, no false success | failure injection in isolated tests; hosted tests only with approved safe setup |

## 8. Completed Stage 6 results preserved without retest

- R10: **PASS (bounded)**; shared Home/session offline and simulated 503 behavior, not exhaustive application coverage.
- R14: **PASS (bounded)**; representative entitlement/admin/expiry behavior; does not prove every endpoint's ownership.
- R15: **PASS (bounded)**; representative Budget/ETF/Family Tree functionality, uploads and tracking, not every authentication failure or duplicate/no-replay scenario.
- R16-55–62: Family Tree, Notifications, Subscriptions targeted sanitization; earlier 32/32 offline and representative hosted checks accepted.
- R16-63–66: Family Tree privacy unexpected 400 correction validated offline 11/11 and staged/hosted bounded checks.
- R16-68–70A: Tracking provider notes offline 6/6 and local/hosted normal-path reads passed; hosted actual provider failure **not induced**.
- R16-71–73A: refresh-session unexpected 400 correction 11/11 isolated, no-cookie 401 `REFRESH_INVALID` local/hosted passed at staging `b5e2b06`; no live unexpected-error fault injection.
- R16-74B: central Express handler **isolated unexpected-400/403 disclosure expectation failed**; 500/503 sanitized and status preservation passed. No real live sensitive-data incident established.
- **R16-75: PAUSED**. No implementation artifact or authorized modification in this step.

References for these later tests: [November 10 handoff](https://drive.google.com/file/d/18UCvXFT8UbVm-F-qCK1Rj4KhEE85RRC3/view) and user's supplied handoff file; per-test source records need reconciliation in a later evidence consolidation step.

## 9. Remaining scope and next methodological step

This work package completes **a representative endpoint/contract inventory**, not the **complete endpoint catalogue**. Before claiming WA-wide certification, perform a systematic extraction of every route registration, including generated `budget.js` route definitions, Family Tree subrouters, native routes, middleware aliases and dynamically mounted modules; record complete method/path combinations with ownership predicates and dependent browser callers. Also verify present authoritative Drive source versus pinned GitHub code before any correction is drafted.

**Recommended next phase B5:** produce a comprehensive, reviewable **WA Standardization Specification v0.1 (DRAFT)** with stable requirement IDs, mandatory/conditional applicability, exception registry, wire-contract compatibility rules and exact acceptance-test owners, *then* reconcile it against complete route inventory and seek user/independent engineer design acceptance. Do not rewrite `CLAUDE.md`, `TechSummary.md` or source files until expressly approved. Use Stage 6 open-items tracking rather than assigning PASS to untested areas.

## 10. Non-negotiable safety and release restrictions

Google Drive, local WA project files, GitHub, Render, production/main, and all databases remain unchanged. This report is a downloadable **assistant workspace artifact only**. The independent design-engineer review is mandatory before merge/production decisions. The existing Stage 6 test ledger is not overwritten or recalculated from this sample inventory.
