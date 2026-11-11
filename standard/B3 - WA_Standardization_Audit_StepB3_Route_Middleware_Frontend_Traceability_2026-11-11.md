# Wonderful Apps — Documentation-to-Implementation Standardization Audit
## Step B3: Route → Middleware → Frontend Traceability

**Assessment date:** November 11, 2026  
**Status:** READ-ONLY EVIDENCE REPORT; **not** an approved implementation specification or authorization to change files.  
**User priority:** Standardization, with technically detailed rules suitable for engineering review and eventual authority.  
**Source baseline:** GitHub `sthink1/wapps`, commit `b5e2b06` on `reviseLogIn` (historical staging reference from the November 10 handoff). **The current branch HEAD, latest user-managed Google Drive code synchronization, and presently deployed Render version have not been established by this B3 inspection.** Findings about source code refer to the pinned commit, not an assertion about current deployment.

## 1. Scope and evidentiary method

This work package follows the B1 and B2 assessments and examines concrete request paths through `server.js`, route-level middleware, supporting authorization, and selected browser callers. Source lines are referenced using links to the **pinned commit**. The user-designated Google Drive `My Drive/wonderfulApp` is the authoritative maintained project-file location. Its `CLAUDE.md` (October 13) and `TechSummary.md` (October 13) were consulted in preceding audit steps; Stage 6 test plan/open-items editions (November 9, Drive modified November 10) also supplied requirements. **Read-only code inspection is not proof of runtime behavior or exhaustive endpoint security.**

No project code, Drive, GitHub, Render deployment, database, local user project files, or test state has been changed. This standalone report is produced for manual review only. Previously completed bounded Stage 6 PASS results remain intact; **R16-75 remains paused**.

### Requirement authority hierarchy considered

1. `CLAUDE.md`, §11: JWT authentication, protected authorization, server-side ownership, parameterized SQL, careful handling of sensitive material. §14: consistent error handling, shared utilities, route standards. §17: review current frontend and backend, authorization and regressions before modification. [Drive document](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view).
2. `TechSummary.md`, §11–12: typical authenticated flow includes `authenticateToken`, `requireAppAccess` when applicable, route-specific authorization/validation, database work, JSON response, safe rendering and logging/error handling. [Drive document](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view).
3. `Stage6_OpenItems.md`: S6-005 shared session/API use, S6-008 and S6-018 error behavior, S6-017 Family Tree privacy, S6-019 origin/CSRF, S6-030 error/log disclosure, S6-033 naming/envelope/usage conventions, S6-041 exception disclosure. These include **open** requirements, not evidence of completed standardization. [Drive document](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view).
4. [Stage6_Render_TestPlan.md](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view): bounded testing and hosted evidence must not be overextended to untested routes, conditions or current deployments.

## 2. Verified middleware routing map

**From [`server.js`, lines 120–190](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L120-L190):**

| Mounted path | Outer middleware or routing | Authorization interpretation | Confirmed exceptions / qualification |
|---|---|---|---|
| `/users` | `Cache-Control: no-store` then `userRoutes` | Per-endpoint policies in user router; some login/refresh operations cannot require existing access JWT | Do not invent a blanket authentication requirement |
| `/subscriptions` | `no-store` then `subscriptionRoutes` | `router.use(authenticateToken)` inside router; administrator methods additionally use `requireAdmin` | Subscription status/access operations and admin operations have different access semantics |
| `/admin-management` | `no-store` then admin router | Router owns signed session/origin decisions | Must trace inside router before certifying complete authorization |
| `/notifications` | `no-store` then notifications router | Auth is per route; public one-time unsubscribe/verification endpoints may exist | No blanket `authenticateToken` mount |
| `/track` | `no-store` then tracking router | Route-specific requirements | No blanket `authenticateToken` mount; endpoint-by-endpoint review required |
| `/tnna` | `no-store` then native router | Separate native client/session policies | Do not impose web-only middleware on native routes |
| `/weights`, `/activities`, `/weightActivities` | `authenticateToken` → `requireAppAccess('weigh_in')` → `usageActivity('weigh_in')` → router | Shared browser auth + app entitlement gate before route | `weights.js` also calls `auth` on individual routes; duplication is a maintainability issue to classify, **not proof of bypass** |
| `/interestEarned` | `authenticateToken` → `requireAppAccess('interest_earned')` → usage | Common server-side gate | Route-specific user ownership still requires verification |
| `/budget` | `authenticateToken` → `requireAppAccess('budget')` → usage | Common server-side gate | `routes/budget.js` also uses `auth` for numerous routes; frontend calls are not uniformly shared |
| `/familytree/privacy-verify` | Public token router before ordinary Family Tree gates | Designed public email approval workflow | Preserve validated token-only flow; test it independently |
| `/familytree` email verification | Exactly GET/POST matching `/contact-email-verification/[64 hex]` routed before common gate | Public email ownership confirmation by narrow path/method allowlist | Review token lifecycle separately; this is **intentional**, not assumed missing auth |
| `/familytree/privacy` | browser auth → `family_tree` entitlement → private router | Shared gate plus privacy-specific logic | Page-token rules are a separate data access control |
| `/familytree` ordinary | browser auth → `family_tree` entitlement → usage → `ftPrivacy.protection` → `familyTreeRoutes` | Common authentication and entitlement plus privacy protection | Multipart and header handling must be preserved |
| `/etf` | browser auth → `etf_investing` entitlement → usage → ETF router | Common server gate | ETF client still has independent Bearer requests |
| `/api/geocode` | Direct geocode router | No shared subscription gate in this mounting section | Documented intentional cost-model deferral; separate policy decision required |

**Important order:** `server.js` puts broad `no-store` response headers before the listed routers, then shared gates before the relevant data routers. The global 404 handler and centralized error handler follow the router mounts, at [`server.js`, lines 192–216](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L192-L216).

### Core middleware reviewed

- [`middleware/auth.js`, lines 1–12](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/auth.js#L1-L12) validates an Authorization Bearer header and uses `verifyAccessToken`, preserving the `req.user.userId` contract. Missing/known invalid token outcomes return 401; unexpected verification exceptions call `next(e)`.
- [`middleware/subscriptionAccess.js`, lines 1–36](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/subscriptionAccess.js#L1-L36) wraps browser-only authentication, checks verified admin override, and calls `getAppAccess` to determine per-app entitlement; denied results return 403.
- This establishes central **entry gates**, but does not establish every route's row-level ownership protection or exemption correctness. Those require endpoint-specific audits and tests.

## 3. Frontend caller traces

| Representative caller | What source demonstrates | Standardization status | Specific preservation requirement |
|---|---|---|---|
| [`httpdocs/js/waPlatform.js`, lines 21–56 and 109–142](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js) | `WA.session`/`WA.api` shared facade, same-origin path validation, active-token injection, one refresh attempt for eligible GET/HEAD after 401, no automatic mutation replay | **Shared contract exists** | Preserve refresh locks, account switches, explicit logout, retry safety, app-specific error semantics |
| [`httpdocs/BinForm.html`, lines 475–510](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/BinForm.html#L475-L510) | `getToken()` reads `localStorage`; `apiFetch()` creates Bearer header and calls `fetch` independently | **Not standardized on `WA.api`** | Preserve unsaved forms, mutation no-retry, Budget `(be)` display normalization, existing success/error UI |
| [`httpdocs/etfCompare.html`, lines 220–280](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/etfCompare.html#L220-L280) | Captures token from `localStorage`, builds independent Authorization header, calls `fetch` | **Not standardized on `WA.api`** | ETF market-data requests, chart results, provider failure behavior and rate limits must not change unintentionally |
| [`httpdocs/js/FTPerson.js`, lines 21–34 and representative requests](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/FTPerson.js#L21-L34) | Own Bearer helper; direct `fetch` for Family Tree records, mutation and image uploads | **Not standardized on `WA.api`** | Include page-token authorization, uploads/FormData content type, relationship and privacy functionality |
| [`httpdocs/js/FTPrivacy.js`, lines 1–35](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/FTPrivacy.js#L1-L35) | Own Bearer helper and `X-FT-Page-Token`; installs a wrapper around `window.fetch` after unlocking | **Specialized security integration** | Any shared request migration must retain page-token propagation for relevant requests; inspect wrapper composition and header behavior before changing it |
| [`httpdocs/js/usageTracking.js`, lines 20–60, 85–95](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/usageTracking.js) | Uses `WA.api.request` for ordinary tracking and `WA.session.restore`; a separate unload/keepalive `fetch` sends current token | **Intentional mixed pattern; needs policy documentation** | Lifecycle delivery, `keepalive`, no automatic replay/duplicate accounting, logout behavior |

**Loading the library is not the same as adopting its API.** The pinned `BinForm.html`, `etfCompare.html`, and `FTPerson.html` reference `waPlatform.js` near the bottom of the page, yet their application-specific operations above use separate `fetch` paths. This is a confirmed source-level **adoption gap**, not proof of compromised authorization.

### `WA.api` response compatibility issue (carried from B2)

[`waPlatform.js`, around lines 38–47](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L38-L47) reads `data.message || data.error` directly. [`server.js`, lines 199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215) may return `{ error: { message: ... } }`; this could yield an object rather than the intended human-readable message. The exact error presentation requires a targeted test. Standardization must include a supported response-shape inventory and consumer-compatibility plan, not a blanket change of server response structure.

## 4. Traceability and decisions matrix

**Legend:** C = verified source evidence at `b5e2b06`; D = current documented requirement; I = inference; U = unverified. Status is **compliance with standardization**, not a claim of vulnerability. Confidence refers to existence of the described source pattern, not universal route coverage.

| ID | Documented basis | Code trace | Assessment | Risk if made inconsistent | Confidence / next evidence |
|---|---|---|---|---|---|
| B3-01 | TechSummary §12 layered request flow | `server.js:163–185`, `subscriptionAccess.js:8–32` | **Compliant for sampled mounts** | Entitlement bypass if new route bypasses shared middleware | C high; map remaining mounts |
| B3-02 | CLAUDE §11 ownership checks | Route-specific reads/writes not exhaustively traced | **Requires test** | Cross-user data exposure | U; examine SQL predicates/ownership helpers per endpoint |
| B3-03 | S6-005 shared request/session standard | `BinForm.html:481–505`; `etfCompare.html:227–279`; `FTPerson.js:23–34` | **Deviation in API adoption** | Divergent refresh, logout, 401 and network handling | C high; behavior test necessary |
| B3-04 | S6-008, S6-018 distinguish 401/403/network/5xx | `waPlatform.js:95–143`; direct `fetch` consumers | **Incomplete system-wide implementation** | Incorrect recovery, stale UI or lost form state | C high for sampled design; test full flows |
| B3-05 | S6-019 session/Origin/CSRF protection | `server.js:47–56`, `users.js` refresh Origin, backend auth | **Partially implemented; coverage unverified** | Unsafe cookie-backed mutations | C medium; trace all cookie-capable endpoints and Origin policy |
| B3-06 | S6-017 privacy | `server.js:169–183`; `ftPrivacy.js:100–129` | **Documented intentional exception** | Lock bypass or over-redaction | C high for arrangement; negative tests pending |
| B3-07 | S6-017 upload integrity | `server.js:60–64`; `FTPerson.js` FormData uploads | **Special handling established** | Broken image uploads or missing privacy header | C high; multipart integration test needed |
| B3-08 | S6-033 common error envelope | `waPlatform.js:38–47`; `server.js:199–215`; `BinForm.html:502–507` | **Confirmed contract mismatch** | Object displayed as message or error misclassification | C high; targeted error parsing test |
| B3-09 | CLAUDE §14 shared utilities | `weights.js`, `budget.js`, `etf.js` each reuse route `auth` after outer middleware | **Possible unnecessary duplication** | Future drift; not a current bypass finding | C high for duplication; removal impact must be evaluated |
| B3-10 | S6-005/S6-025 tracking and lifecycle | `usageTracking.js:20–60` has shared API plus keepalive fallback | **Candidate for documented exception** | Duplicate or missing time accounting | C high for pattern; preserve R15 evidence and test lifecycle |
| B3-11 | TechSummary §12, CLAUDE §11 server authorization | `/api/geocode` excludes common entitlement mount | **Documented intentional exception / policy unresolved** | API cost controls may differ | C high for mount; commercial model remains undecided |
| B3-12 | Stage 6 release gates and independent review | Current audit is read-only; no code changes | **Process compliant** | Premature remediation could regress tested functionality | C high; approval needed before edits |

## 5. Standardization priorities — technical architecture requirements for review

These are **proposed acceptance-ready standards**, not existing approved specifications. Their precise wire formats and approved exceptions require design-owner sign-off.

### STA-01: Route registration and gate ordering

For each API endpoint, maintain an auditable registry of HTTP method, external path, router, public/authenticated/native session classification, authorization and ownership checks, entitlement app key, rate limit/CSRF/Origin policy, logging/cache policy, response contract, and negative tests. At normal browser protected routes, apply authentication before entitlement checks, then route-level ownership before data operations. Public email-token flows, native APIs and geocoding must have documented explicit exceptions and substitute controls.

**Gate:** Every registered endpoint has a documented access model and automated denied/allowed test; missing mapping blocks standardization sign-off. Do not conflate absence of an outer middleware with absence of authorization inside a router.

### STA-02: Shared browser API migration without unsafe replay

Default new authenticated browser calls to a single shared `WA.api`/`WA.session` contract, but **do not** change the existing callers before inventorying their custom behavior. The shared client must differentiate 401 reauthentication eligibility, 403 authorization/entitlement refusal, offline/network issues, 5xx/503 transient server failure, and canceled requests. Mutations must never be automatically replayed after ambiguous failure. Explicitly document permitted GET/HEAD retry and exceptions.

**Gate:** For each migrated page, test active JWT, expired JWT with remembered session, absent refresh cookie, explicit logout, denied entitlement, network failure, server error and unsaved form preservation. Preserve any previously passed application and Stage 6 checks.

### STA-03: Uniform HTTP error contract with compatibility

Specify a canonical error envelope (string code, safe public message, optional validated details) with clear `400/401/403/404/409/423/429/5xx` semantics and a source-verified mapping from legacy `{error:string}`, `{message:string}`, nested `{error:{message}}`, subscription `{reason,app}`, and privacy `{code,message}`. Errors expected by design may expose allowlisted public messages; unexpected exceptions may not expose internal details simply because they carry a 4xx status. This is an **interface design decision still needing approval**, not permission to alter existing wire responses now.

**Gate:** Producer and consumer contract tests; no unapproved response-shape break on Budget, ETF, Family Tree, users, subscriptions and native consumers. R16-75 stays paused until policy and compatibility are approved.

### STA-04: Family Tree privacy and upload exception contract

Preserve explicit `X-FT-Page-Token` capability semantics, one-time public verification links, private-person authorization, collection redaction, profile/image uploads and normal request content-type handling. Document whether token is attached by a shared interceptor, request-specific headers, or a typed helper; avoid undocumented overlap between `window.fetch` interception and `WA.api` internal native fetch capture.

**Gate:** Verify key accepted/rejected, new page requiring fresh key, private data GET and denied writes, collection redaction, public verification, multipart upload, and duplicate/error cases. Do not claim those pass based solely on source-level inspection.

### STA-05: Middleware duplication and cross-module authority

Document whether inner route authentication is retained intentionally as a defense-in-depth requirement or considered redundant after a tested outer mount. Never remove guards based solely on repeated `auth` calls: those routers may be reused independently, may rely on precise error shape, and may contain public exceptions. Shared helpers should own common policies; application routes should own validated business invariants.

**Gate:** For any proposed deduplication, prove equivalence across mounted and direct router tests, auth failure behavior, authorization and logging. No changes while the audit is in the evidence phase.

### STA-06: Documentation and review gates

All mandatory rules should have a unique stable identifier, owner, exact applicability, normative language (`MUST`/`MUST NOT`), documented exceptions, code entry points, acceptance tests, evidence references and implementation version. `CLAUDE.md` should point developers to these normative standards; `TechSummary.md` should accurately describe the deployed architecture without silently redefining security policy. Stage 6 documentation records incomplete work and historical testing separately from approved design decisions.

**Gate:** Design engineer reviews the registry and interface contracts, verifies documentation chronology before attributing noncompliance to earlier authors, and signs off before any merge/production decision.

## 6. Cause classification — current limits

- **Confirmed:** Shared authentication and subscription gates exist for major applications, alongside direct-authenticated frontend implementations. Thus a broad statement that WA has *no* central security architecture would be wrong.
- **Confirmed:** An explicit project-wide session/API integration requirement exists in S6-005 and S6-033, and the sampled current frontends have not universally adopted the shared facade.
- **Confirmed:** Public email verification, Family Tree privacy and mobile-native flows require different handling; treating these differences as automatic violations would be wrong.
- **Inference:** Mixed legacy app-specific clients and newer shared implementations likely reflect incremental migration and backward compatibility constraints, rather than a single uniform policy applied at one time. Historical revision evidence has **not** established causation.
- **Unknown:** Whether every currently active Drive source file matches GitHub `b5e2b06`; whether every sampled behavior is current in staging; whether historical coding instructions required this architecture when specific modules were written; whether all row ownership and privacy boundaries pass negative tests.

## 7. Preserved prior results and release boundary

Do not rerun previously accepted bounded Stage 6 R10/R14/R15, R16-55–73A, or earlier hosted regressions without a regression-driven reason. The November 10 handoff records R16-74B's **isolated** 4xx central-handler error-disclosure finding and no established live sensitive disclosure. R16-75 is paused. Existing browser matrix, TNNA/native acceptance, concurrency, rollback and independent design-engineer review remain subject to the formal register. **No new PASS, FAIL, completion percentage or security certification is asserted by Step B3.**

## 8. Next evidence step — B4 (recommended)

Conduct a **read-only endpoint contract inventory** by application class, not a premature mass refactor:

1. Complete `server.js` route registry with each router's public/private methods and middleware.
2. Trace row ownership and entitlement checks across representative GET/POST/PUT/DELETE operations, including administrator paths.
3. Compare backend status/error shapes to actual frontend parser behavior; inventory exceptions such as privacy, uploads, tracking keepalive, native sessions, and geocoding.
4. Inventory existing test files to identify actual automated enforcement, missing negative tests and stale documentation.
5. Present a reviewed standardization contract and compatibility matrix **before** proposing any code or documentation changes.

**Decision requested later (not now):** whether to approve a separate normative `WA_Programming_and_Security_Standards.md` as the single contract, with cross-references from the existing documents. No file changes or document rewriting have been authorized by this audit.
