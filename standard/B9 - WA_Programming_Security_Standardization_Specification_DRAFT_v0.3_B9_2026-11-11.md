# Wonderful Apps — Programming and Security Standardization Specification

**Document ID:** WA-STD-SPEC-B9  
**Version:** **0.3 — COMPLETE DRAFT FOR USER / ENGINEERING REVIEW**  
**Date:** November 11, 2026  
**Supersedes as a *draft only*:** v0.2 B7; **does not supersede authoritative project documentation**  
**Document type:** Detailed normative proposal and technical annexes; no source or deployment authorization  
**Code reference:** `sthink1/wapps` pinned GitHub `b5e2b06` (historically user-confirmed Live staging baseline, not asserted currently deployed)  
**Authority:** Only **WA-SEC-ADMIN-001** is explicitly user-approved within this new specification. Existing mandatory standards retain their independently established status. Other v0.3 clauses are proposed for review.

> **Critical interpretation:** "MUST" below specifies the behavior proposed for *eventual adoption*. Until the user approves the complete specification or an individual clause, draft MUST statements are **not** independently approved new requirements. Pre-existing mandatory requirements (security, HTML readability, etc.) remain binding on their original authority. No source files were changed or tests executed by writing this document.

## 1. Purpose, governance, and evidentiary boundaries

WA needs one enforceable technical programming/security framework, while retaining its specialized application contracts. Standardization means **common validated security invariants plus documented compatibility-aware exceptions**, not forcibly identical code paths or permission checks.

### 1.1 Independent authority and evidence dimensions

For every clause and test maintain distinct fields: **policy source/status; pinned code observation; Drive/local/hosted source reconciliation; offline test; local test; hosted test; native/browser test; exception status; conformance decision; independent review; user implementation approval; deployment authorization**. "Source-observed" does not mean tested; "bounded PASS" is not global certification; "approved standard" does not authorize code changes.

Policy status values: `EXISTING-DOC`, `APPROVED-DECISION`, `PROPOSED`, `OPEN-DECISION`, `SUPERSEDED-UPON-APPROVAL`. Test status values: `NOT-RUN`, `PASS-BOUNDED`, `FAIL`, `BLOCKED`, `NOT-APPLICABLE` (with justification). Conformance values: `NOT-ASSESSSED`, `PARTIAL`, `CONFIRMED`, `NONCONFORMING`, `WAIVED-APPROVED`. These dimensions must never be conflated.

### 1.2 Proposed precedence after formal adoption

1. Explicit user-approved security and policy decisions, with recorded effective date/version.
2. Approved WA standards and approved, narrowly scoped exception records.
3. Approved endpoint-specific interfaces and security contracts, which must *not weaken* global security invariants without separate explicit user approval.
4. Existing authoritative documentation where non-conflicting; differences are recorded in a drift register for reconciliation.
5. Code, tests, and deployment as factual evidence of behavior—not policy authority by themselves.

Before adoption the original WA `CLAUDE.md`, `TechSummary.md`, and already-approved user decisions retain their existing status. On equal-authority conflict, STOP and request an explicit decision; never infer precedence from file modification time alone. An approval must name **exact document/version, clauses, effective date, reviewer, and approved exceptions**. Version 0.3 is currently **NOT approved** as a whole.

### 1.3 Review and change controls

Authoritative WA Drive `My Drive/wonderfulApp` (folder `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`), GitHub, and user local WA project files are **strictly read-only for ChatGPT**. GitHub may be used only for reference. Any proposed replacement is a **separate downloadable artifact for the user to install manually**. No `main`/production, Render, staging DB, or existing WA file changes authorized. R16-75 remains paused; independent final Stage 6 engineering review before merge/rollout remains mandatory.

### 1.4 Grounded source register

- [CLAUDE.md — authoritative Drive](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view), especially §10.4 L823–839; §11 L871–890; §14 L1003–1018; §17 L1114–1134.
- [TechSummary.md — authoritative Drive](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view), especially §6.7 L504–511 **outdated admin wording**; §12 L1109–1127; §14 L1150–1180; §20 L1343 onward.
- [Stage6_OpenItems.md — Drive](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view), S6-001–041 and S6-041 L368–375. Historical status is not automatically current.
- [Stage6_Render_TestPlan.md — Drive](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view), bounded evidence and future acceptance.
- [Pinned GitHub tree](https://github.com/sthink1/wapps/tree/b5e2b06); source links below pin file/line ranges. **Drive–GitHub–current staging identity comparison not performed by B9**.
- B6 and B8 technical review artifacts (separate, not authoritative); B8 findings B8-01–24 preserved in Annex G.

## 2. Governing technical requirements — one primary clause per topic

Every primary clause is written with: requirement; basis/status; testable verification; applicable exceptions. Annexes refine these clauses and must not contradict them. The 28 older v0.2 identifiers are mapped in Annex F rather than repeated as conflicting rules.

### WA-SEC-ADMIN-001 — Administrator identity verification

**Status: USER-APPROVED design decision.** The privileged-access decision MUST be obtained through `services/administratorAccess.js` using a fresh authoritative lookup of the authenticated user's current row in `UsersT`, selected by that authenticated user's `UserID`; `UsersT.IsAdministrator` MUST equal `1` **AND** the row's `UserName` MUST match configured `ADMIN_USERNAME` (case-insensitive and trimming surrounding whitespace). Both gates are mandatory. An absent config value, missing row, false DB flag, mismatched username or DB query failure MUST NOT grant admin privileges. A hard-coded user ID, username alone, client-side role, JWT-only claim, or subscription plan MUST NOT grant admin access. Other modules MUST use the central verification service; a negative gate returns denial, whereas verification system failure must fail closed and use the separate safe-error contract.

**Pinned source:** [`services/administratorAccess.js` L4–39](https://github.com/sthink1/wapps/blob/b5e2b06/services/administratorAccess.js#L4-L39) and [`middleware/subscriptionAccess.js` L4–31](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/subscriptionAccess.js#L4-L31). **Proposed stale-doc correction** in §6.2; do not install without permission.

**Acceptance:** ADMIN-01–ADMIN-08 in Annex D, using current-DB test fixtures, status service return values, protected endpoint denial, and no privileged DB write. **Code conformance remains unverified globally.**

### WA-CORE-001 — Provenance, exact baseline and change isolation

**Basis:** EXISTING-DOC §§CLAUDE 14/17; PROPOSED detailed gate. Before proposing any implementation, identify the authoritative Drive version, exact GitHub SHA/branch, corresponding local version (user-supplied checksum/diff where necessary), deployed staging SHA if relevant, and schema identity. If versions differ, label each; do not merge unknown changes. Record touched call graph, affected clients, tests, pre/post-change behavior, and separate file-download outputs. **Acceptance:** provenance ledger with verifiable hashes/versions, enumerated differences, file inventory and explicit install decision. Historical `b5e2b06` is evidence only, not a live claim.

### WA-API-001 — Method-level access classification and ownership

**Basis:** EXISTING-DOC security and ownership; PROPOSED inventory precision. Each endpoint method/path MUST be classified as one of public informational, public capability token, bearer authenticated, cookie-authorized, native credential/refresh, subscription protected, administrator protected, or an explicitly documented combination. The register MUST separately state user/Tree/object ownership, record visibility, HTTP method, Origin/CSRF requirement, and data/cache sensitivity. Subscription eligibility MUST NOT substitute for resource ownership; UI visibility MUST NOT be used as authorization. **Acceptance:** all registered endpoints accounted for method-by-method; negative user/tenant/Tree/admin tests and no-write assertions. The partially populated Annex A is **not full inventory certification**.

### WA-AUTH-001 — Centralized authentication and credential boundaries

**Basis:** EXISTING-DOC + PROPOSED contract specificity. Browser, web Bearer, remembered cookie, public-link token and native TNNA credentials MUST be validated in their intended scope; bearer verification must use centralized middleware and current server-side session/security-version rules where implemented. Public capabilities do not become web administrator login; native tokens do not become browser sessions. Any change to a credential format or verification scope requires cross-client compatibility evidence. **Acceptance:** missing/invalid/revoked token denial, cross-client rejection, verified correct session owner; distinct web/native token paths.

### WA-SESSION-001 — Shared web request, restoration and retry semantics

**Basis:** S6-005/008/018 and existing Stage 6 facade; PROPOSED enforceable behavior. New compatible pages SHOULD use `WA.session`/`WA.api` subject to a migration plan; existing direct `fetch` is tracked as legacy, not an automatic regression or bypass. JWT refresh, account switching, cross-tab races, explicit logout and network-unavailable behavior MUST preserve session/account identity. A 403 authorization/subscription denial MUST NOT be silently transformed into a new login or automatic refresh. An unsafe mutation (POST/PUT/PATCH/DELETE) MUST NOT automatically replay after ambiguous delivery or rejected authorization. The browser MUST preserve unsaved form inputs when an operation fails unless the user explicitly abandons them. Valid GET/HEAD-only recovery behavior requires the specific safe transition in Annex C. No unsupported-Web-Locks fallback has been approved: retain existing fail-closed behavior pending S6-026/036 decision. **Acceptance:** SESSION-01–SESSION-09; account switch, lock absent, offline, 401/403/503, no unintended DB writes.

### WA-ERROR-001 — Safe public error disclosure

**Basis:** EXISTING-DOC non-disclosure requirements; S6-041; PROPOSED precise invariant. **An unexpected error's internal `message`, stack, query, URL, token, file path, DB detail or supplier response MUST NOT be exposed to an HTTP caller, even if the error has a 400–499 status.** Only a deliberately created, approved client error with verified provenance may expose a bounded user-facing message; status code alone, string suffix such as `(be)`, or `error.message` alone is insufficient. Preserve intended 401/403/409/423 and provider statuses where established, and use generic messages on unexpected exceptions. No error-schema selection is implied: interim response safety applies to all supported legacy payload shapes. **Acceptance:** ERR-01–ERR-07 synthetic and route tests. **Known unresolved:** pinned [`server.js` L199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215) publishes untrusted unexpected 4xx messages; R16-74B isolated test failed. **R16-75 remains paused.**

### WA-API-002 — API wire contract and client interoperability

**Basis:** S6-033; PROPOSED and **OPEN-DECISION** for canonical JSON shape. Version and document actual success/validation/auth/error response forms, HTTP status, machine code, display message, privacy fields, cache semantics and consumer expectations. Support currently observed `{error:string}`, `{message:string}`, `{error:{message:string}}` and domain-specific fields during migration. A future canonical envelope MUST NOT be installed until user-approved with client-by-client migration and fallback tests. Safe-error disclosure from WA-ERROR-001 is mandatory regardless of envelope. `WA.api` must not stringify an error object as `[object Object]`, and callers must not mistake error payloads for successful responses. Detailed proposed interface is in Annex B, not approved code. **Acceptance:** API-01–API-09. **Decision DEC-02 remains OPEN.**

### WA-PRIV-001 — Public capabilities, token lifecycle and Origin/CSRF

**Basis:** EXISTING-DOC + S6-017/019/029; PROPOSED precision. Every capability-token workflow MUST specify cryptographic randomness, token hashing/storage, expiry, invalidation, replay/reuse semantics, request method, user-visible output, URL/referrer/logging risk, rate limits and whether additional Origin/CSRF validation applies. No universal one-time rule is imposed on workflows that legitimately allow multiple GET views before final POST action. Cookie-authorized browser mutation/refresh/logout MUST enforce the authorized Origin and approved cookie attributes; Bearer-only, native and public-link requests are separately classified. An absent/forged Origin test must use the correct endpoint class rather than indiscriminately rejecting legitimate native clients. **Acceptance:** CAP-01–CAP-07, ORIGIN-01–ORIGIN-06; workflow registry Annex E.

### WA-PRIV-002 — Family Tree membership, privacy and uploads

**Basis:** EXISTING-DOC + S6-017. Require Family Tree membership and relevant Person/Tree authorization on all affected endpoints. Preserve `X-FT-Page-Token` scoped access, privacy response redaction for nested persons, deliberate `423 PRIVATE_LOCKED` behavior, page-specific fetch interception and multipart `FormData` without forced JSON `Content-Type`. Public email confirmation and privacy approval are separately controlled capability routes and MUST NOT be made dependent on browser login inadvertently. **Acceptance:** PRIV-01–PRIV-08, including related-object redaction and image upload/reload/delete.

### WA-NATIVE-001 — TNNA native credential and offline continuity

**Basis:** EXISTING-DOC [`CLAUDE.md` §10.4](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view); S6-010/032. Preserve documented eight-hour access JWT, currently 180-day native refresh-token issuance, rotation, server-side SHA-256 hash, AndroidKeyStore/AES-GCM storage, device binding and logout revocation. Documented conditional offline authenticated mode is up to 30 days when refresh is unavailable due to network/server, not invalid/rejected 401; native 401 requires re-login. **Unapproved:** a *separate absolute lifetime cap*; do not infer it from 180-day issuance. No native installed-device migration without explicit approval. **Acceptance:** TNNA-01–TNNA-06 including actual-device/offline/background continuity after explicit authorization.

### WA-DATA-001 — Input, ownership, transaction and object integrity

**Basis:** EXISTING-DOC CLAUDE §11/12, TechSummary §13; PROPOSED test precision. Validate untrusted input on server; use parameterized SQL; enforce UserID/Tree/Person linkage on reads/writes; choose transaction boundary for complete logical unit; handle concurrent mutation/rollback and object storage cleanup safely. A DB uniqueness violation may be translated into an approved validation error only when the translation does not reveal hidden records. **Acceptance:** DATA-01–DATA-06; no cross-user access, consistent rollback, current schema compatibility, no unsafe retry.

### WA-LOG-001 — Security diagnostics and credential exclusion

**Basis:** EXISTING-DOC never-log-secrets; S6-030; PROPOSED field taxonomy. Never emit credentials, JWTs, refresh/public link tokens, passwords, API/DB secrets, full sensitive URL query strings or private record contents in application logs, browser Console, error payloads or reports. Diagnostic fields may include sanitized event category, HTTP status, route **template** (not raw URL), approved non-secret error code, timestamp and a non-sensitive correlation identifier; log retention/privacy requires a separately approved operational policy. Redact exception messages by default where they may contain secrets; preserve enough status/category to troubleshoot. **Acceptance:** LOG-01–LOG-05 source/running logs and redacted evidence.

### WA-ENV-001 — Environment identity and deployment isolation

**Basis:** S6-011/013/031; PROPOSED precision. Development/staging/production must have explicit environment identifiers, expected database identity, secure cookie/Origin settings, distinct secrets and safe startup refusal on mismatch. No implicit production DB fallback or insecure test override. **Acceptance:** ENV-01–ENV-05 including local/hosted negative configuration tests, rollback rehearsal plan, verifiable DB identity and no production interaction.

### WA-ABUSE-001 — Credential abuse, rate limits and proxy trust

**Basis:** S6-012/022/029; PROPOSED precision. Verification-code entropy, attempt ceilings, issuance/reset throttles, one-time use, client scope, security-version ties, proxy/IP trust, NAT fairness and cleanup must have documented values and negative tests. Unverified X-Forwarded-For input cannot serve as a trusted client identity. **Undecided credential policies** (new login supersession, password reuse/whitespace) require separate user decisions. **Acceptance:** ABUSE-01–ABUSE-06; no unsafe rate-limit information disclosure.

### WA-FRONT-001 — Human-readable HTML/CSS/JS and UI preservation

**Basis: EXISTING mandatory** [`TechSummary.md` §14 L1150 onward](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view). All WA `.html` sources must remain pretty formatted and human-readable: consistent indentation, separate readable nested tags, CSS and JavaScript formatting, no minified/page-long markup, whole-file formatting when edited, without changing IDs, attributes, routes, selectors, events or behavior. Preserve existing light-mode and other applicable frontend requirements; **the full §14 inventory is still pending**, so this clause is not a claim of complete transcription. To distinguish formatting from functionality, compare parsed DOM-relevant structure, IDs/names/script order/routes and run targeted UI regressions; a formatter-only claim must include a readable diff and confirmation of no intended semantic changes. **Acceptance:** FRONT-01–FRONT-04.

### WA-CACHE-001 — Sensitive HTTP caching and PWA version interoperability

**Basis:** Existing Stage 6 `no-store` guards + S6-024; PROPOSED precision. Sensitive account/subscription/user/Family Tree/TNNA endpoints including errors must not be stored by browser/proxy; static asset service-worker caching is an independent policy. Stage frontend and service-worker updates so old/new HTML and JS versions never corrupt session handling or cause mutation replay. **Acceptance:** CACHE-01–CACHE-05 across compatible stale-client mixes.

### WA-REVIEW-001 — Test evidence, exceptions, conformance and release authority

**Basis:** EXISTING Stage 6 independent review gate S6-014, S6-035; PROPOSED precision. Each changed requirement needs repeatable test cases, baseline, fixtures, expected status/body, expected data/session state and evidence record, with scoped results and independently preserved earlier PASS reports. Exceptions must be formally approved and narrowly scoped; optional coverage waiver is not implicit. Before any merge/production decision complete the final S6/DE6/R reconciliation, migration/rollback, independent engineering review and explicit user authorization. **Acceptance:** GOV-01–GOV-05. This draft itself authorizes no write, rollout or existing-source replacement.

## 3. Explicitly unresolved design decisions — no implicit approvals

| ID | Decision required | Current stance | Required evidence before decision |
|---|---|---|---|
| DEC-01 | Which version of this specification is approved and effective; hierarchy for legacy conflicting text | OPEN; v0.3 is draft | User review + effective date and document owner |
| DEC-02 | Permanent canonical API JSON error/success envelope and migration/versioning | OPEN; preserve legacy wire forms and safety invariant | Complete consumer map, API parser tests and TNNA compatibility |
| DEC-03 | Permanent expected-client-error factory/marker/classifier mechanism | OPEN; provenance-based non-disclosure invariant stated | Threat review of forgery/trust boundaries and route tests |
| DEC-04 | Unsupported Web Locks browser behavior, support matrix and recovery UX | OPEN; existing fail-closed observed | Chrome/Edge/Firefox/DuckDuckGo tests and proposed fallback policy |
| DEC-05 | Successful new web login superseding previous remembered session | OPEN under S6-021 | Account-switch and atomic transaction tests |
| DEC-06 | Web refresh-token-family replay invalidation vs legitimate tab races | OPEN under S6-006 | Real concurrent DB/browser race tests |
| DEC-07 | Password reuse and whitespace input behavior | OPEN under S6-023 | User policy choice and regression cases |
| DEC-08 | Absolute lifetime for native TNNA refresh credentials | OPEN under S6-032; no new cap authorized | Device migration, offline and credential compatibility risk assessment |
| DEC-09 | CSP/token-storage migration | OPEN under S6-028; legacy storage temporarily present | Third-party script and XSS review |
| DEC-10 | Exception approvals, owners/expiry, governance adoption and final testing threshold | OPEN | Completed Annex E/F and independent review |
| DEC-11 | Source of truth reconciliation and exact deployed baseline | OPEN for live state | Drive/GitHub/local hash comparison and staging deployment evidence |

An OPEN decision does not mean an existing safeguard may be disabled. It means additional permanent behavior may not be introduced as an approved policy without explicit user action.

## 4. Proposed documentation reconciliation — NOT INSTALLED

### 4.1 Drift item DRIFT-ADMIN-01

**Authoritative document:** `TechSummary.md` §6.7 L504–511. **Problem:** outdated description says `UserID === 1` OR JWT username matching `ADMIN_USERNAME` is sufficient. This conflicts with user-approved WA-SEC-ADMIN-001 and pinned source.

**Proposed replacement text for user review (complete paragraph, not an action):**

> **Administrator recognition.** WA determines administrator privileges through `services/administratorAccess.js`. For the authenticated user's `UserID`, the service queries the current `UsersT` record. Administrator access is granted only when the database row exists, `UsersT.IsAdministrator = 1`, and the database `UserName` matches configured `ADMIN_USERNAME` after case-insensitive comparison and trimming surrounding whitespace. Missing configuration, absent record, disagreement, or failed database verification must not grant administrative privileges. No hard-coded `UserID`, username match alone or JWT role alone is sufficient. All privileged modules must use this centralized service. Any administrator subscription override is downstream of successful verification and does not replace per-record ownership obligations.

**Do not modify `TechSummary.md` automatically.** Approval of the standalone v0.3 draft does not itself grant permission to edit the authoritative Drive file. Other drift items: `waPlatform.js` header saying no WA page loads it at pinned SHA despite pages that include it; error envelope/comment mismatch in `server.js`; legacy direct-fetch compatibility. All require refreshed provenance before correction.

### 4.2 Existing frontend standard coverage

The mandatory human-readable formatting clauses are retained. `TechSummary.md` §14 also begins a light-mode compatibility section (L1171 onward); **a complete line-by-line inventory of the rest of §14 has not been certified in B9**. That gap must be closed before claims that the new specification reproduces all prior frontend requirements.

## Annex A — Endpoint / consumer / access-class inventory (PARTIAL, NOT CERTIFIED)

The entries below were read at pinned `b5e2b06`. `Ownership` means whether the reviewed route explicitly uses a known user/Tree check; `TBD` requires further call-chain inspection. A parent router middleware gate is distinct from an individual-route check. Public routes may rely on token possession rather than browser identity. **Every row is an example; the full registered endpoint inventory has not been completed.**

| Verb + full endpoint | Access class and security chain | Ownership or token scope | Origin/cache | Known consumer | Verification gap |
|---|---|---|---|---|---|
| GET `/weights/` | web Bearer → subscription `weigh_in` → route auth | `req.user.userId` SQL filter | parent `no-store`; Bearer | Weights UI (consumer exact method TBD) | cross-user, invalid params, session error matrix |
| POST `/budget/in` (example dynamic base; verify exact base) | web Bearer → subscription `budget` → route auth | UserID business logic TBD | parent `no-store` | `BinForm.html` direct Bearer fetch | exact route mapping, form preservation, error schema |
| GET `/etf/compare` | web Bearer → subscription `etf_investing` → route auth | per-user data/provider contract TBD | parent `no-store` | `etfCompare.html` direct Bearer fetch | historical price controls, error mapping |
| GET `/familytree/persons/:id` | web Bearer → `family_tree` subscription → privacy protection → route auth | Tree membership, privacy filter | parent `no-store` | `FTPerson.js`, `FTPrivacy.js` | private/related person redaction, page token |
| POST `/familytree/persons/:id/pets` | web Bearer → subscription → privacy → route auth | `requireTree`, `treeHasPerson` | parent `no-store` | Favorite Pets UI TBD | success/rollback, unexpected 400 safety |
| POST `/familytree/persons/:id/pets/:petID/picture` | web Bearer → subscription → privacy → Multer | Tree/person validation and image object scope | parent `no-store` | FT media page TBD | multipart and upload-validation messages |
| GET/POST `/familytree/contact-email-verification/:token` | public token; exact path/method bypass before familyTree router | 64-hex-character capability token + backend validation | parent `no-store` | emailed confirmation link | one-time transition, leakage, expiry |
| GET/POST `/familytree/privacy-verify/:token` | public capability token; publicRouter | hashed token and expiry logic in service | parent `no-store` | approval link | approve/decline replay/CSRF model |
| GET/POST `/notifications/unsubscribe/:token` | public capability link, no Bearer | token validated in notification service | parent `no-store` | `unsubscribe.html` | safe repeated GET, idempotence, referrer |
| GET/POST `/notifications/network-verification/:token` | public token link | token verification and allowed response scope | parent `no-store` | email verification page | expiry, replay and PII output |
| GET `/notifications/preferences` | web Bearer within notification route | `req.user.userId` | parent `no-store` | preferences UI TBD | 401/403/schema coverage |
| POST `/track/log/page` | bearer auth in router, no app subscription on parent | user ID from authenticated token | parent `no-store` | `usageTracking.js`; `WA.api` normal request, native fetch on unload | duplicate/replay and logout tracking |
| GET `/track/app-usage` | bearer + administrator requirement | admin; user scope for report TBD | parent `no-store` | track dashboard | deny non-admin, sanitized errors |
| GET `/subscriptions/status` | `router.use(authenticateToken)` | active authenticated user | parent `no-store` | Home/SubControl | fresh plan after restore |
| POST `/users/refresh-session` | cookie refresh + explicit `requireOrigin`; no Bearer required | remembered session + refresh rotation | parent `no-store` | `WA.session` | rejected cookie vs unexpected 4xx, concurrency |
| POST `/users/logout` | web Bearer auth + Origin | current validated session | parent `no-store` | `WA.session.logout` | expired JWT and cookie-only policy |
| GET `/admin-management/status` | bearer + webOnly + `requireAdministrator` | DB flag AND configured username | parent `no-store` | admin UI TBD | ADMIN-01–08 |
| GET `/tnna/version` | public informational/native update | version metadata | parent `no-store` | installed TNNA app | version/coordinated rollout |
| POST `/tnna/refresh` | native refresh credential | device-scoped refresh logic | parent `no-store` | installed TNNA app | token replay/concurrency and device scope |
| GET `/tnna/admin/users` | native Bearer + administrator | centralized verified admin; native client | parent `no-store` | TNNA admin UI | explicit cross-client admin eligibility policy and negative tests |

**Actual middleware mount reference:** [`server.js` L120–185](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L120-L185). Not every path from the 8,449-line Family Tree router, Budget dynamic route definitions, ETF endpoints, login/account recovery, subscription management and TNNA routes is in this partial table. A **complete** annex must include every HTTP method, exact dynamic path, response variant, consumer and test ID, then be independently checked for 100% registered-router coverage before endpoint compliance can be declared.

## Annex B — Browser API/error compatibility and normative safety boundary

### B.1 Current pinned behaviors (source observations, not universally approved format)

- [`httpdocs/js/waPlatform.js` L39–48](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L39-L48) chooses `data.message || data.error || HTTP status`. An `error` object can be forwarded as a non-string message, creating compatibility ambiguity.
- [`server.js` L199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215) uses `{error:{message:...}}` and exposes raw `err.message` for any reported 4xx regardless of expected-error provenance.
- [`routes/users.js` L263–270](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263-L270) uses `{error:string}` and the shared trusted marker for refresh failures.
- [`routes/ftPrivacy.js` L105–126](https://github.com/sthink1/wapps/blob/b5e2b06/routes/ftPrivacy.js#L105-L126) uses a privacy `423` response containing `code` and `message`.
- [`routes/etf.js`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/etf.js) commonly uses `{message:string}`. [`routes/budget.js`](https://github.com/sthink1/wapps/blob/b5e2b06/routes/budget.js) commonly uses `{error:string}`.
- [`httpdocs/BinForm.html` L480–511](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/BinForm.html#L480-L511) uses direct Bearer fetch and independently interprets error fields; [`etfCompare.html` L227–279](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/etfCompare.html#L227-L279) uses a separate direct request.

### B.2 Proposed transitional parser contract (NOT a code change)

A future reviewed response parser should: inspect status first, clone the `Response` before consuming when both raw/parsed forms are needed, parse JSON once with explicit fallback for non-JSON, accept message strings at `message`, `error` (string), or `error.message` (string) in that order, accept an independently recognized safe code string, never render an object directly as user text, preserve privacy domain codes and existing method status, and avoid reflecting server details from unexpected errors. A consumer that calls `WA.api.request` retains ownership of reading a `Response`; a consumer that calls `WA.api.json` receives parsed JSON or a typed error. A 204 response yields no body; multipart requests must allow the browser to set the boundary rather than forcing JSON `Content-Type`. Header merging must preserve the application-approved `X-FT-Page-Token`, while the platform retains session credential authority.

**Not approved:** actual canonical wire body, response version header, or whether to wrap every success response. Any proposed parser must be compatibility-tested before installation.

### B.3 Minimum body-format compatibility table

| Input HTTP/body | Intended transitional handling | Status |
|---|---|---|
| 400 `{error:"Invalid date"}` | safe string surfaced as validation; no unexpected exception contents | Design/test |
| 400 `{message:"Invalid date"}` | same | Design/test |
| 400 `{error:{message:"Request failed"}}` | extract `error.message`, never `[object Object]` | Design/test |
| 423 `{code:"PRIVATE_LOCKED",message:"..."}` | preserve privacy-specific access outcome; no generic logout | Existing semantics / test |
| 401 session invalid | optional recovery only under approved safe read transition | Existing policy / test |
| 403 subscription denied | do not silently refresh or retry mutation | Proposed norm / test |
| 500 generic | never show raw thrown stack/message | Security invariant |
| 204 no content | return null/appropriate no-content result | Existing `WA.api.json` behavior |
| malformed/non-JSON | typed safe fallback with HTTP status | Proposed / test |

### B.4 Canonical response design selection (OPEN)

Candidates include `{error:{code,message}}`, `{error:string,code?:string}`, or a versioned parallel compatibility shape. **No candidate is currently approved**. Requirement WA-ERROR-001 is independent and should be enforced for *all* current body forms once any implementation is authorized. Prohibit status/body changes to public/native APIs without a fully mapped consumer and rollback strategy.

## Annex C — Session state, request replay and credential-class matrix

### C.1 Browser outcome matrix (contract proposal; not a claim tests have passed)

| Stimulus | Existing/required semantic boundary | Recovery/retry | UI and data invariants | Open issue |
|---|---|---|---|---|
| Valid Bearer GET, 200 | Authenticated data may display | None | User/account bound to current session | S6-005 |
| Expired JWT before safe GET | Attempt controlled remembered refresh if available, not if explicit logout | GET/HEAD only as designed | No cross-account token overwrite | S6-002/007 |
| GET returns 401 | Auth failure; safe refresh path may be considered under existing facade | Existing GET/HEAD one-time recovery subject to lock/session check | No stale user data flash | S6-008/027 |
| POST/PUT/PATCH/DELETE returns 401 | Mutation outcome may be ambiguous | **Never automatically replay** | Unsaved input and data state preserved; no duplicate write | S6-018 |
| 403 subscription/admin denial | Authorization outcome, not ordinary token expiry | No automatic session refresh or mutation replay | Protected data absent, account still recognized where appropriate | S6-008/009 |
| 423 `PRIVATE_LOCKED` | Page-specific Family Tree privacy challenge | Page-token-specific flow only | Do not display unredacted private data | S6-017 |
| 409 validation/conflict | Deliberate business-state conflict if provenance approved | User correction only | No hidden partial transaction | S6-041 |
| 5xx/503 response | Service failure, not proof of revoked login | No mutation replay; safe read retry only per approved policy | Existing session not blindly discarded | S6-018 |
| Network timeout/no response | Delivery outcome unknown | No mutation replay | Retain unsaved form; do not falsely claim server logout | S6-004/020 |
| Explicit browser logout | Mark local logout; attempt validated server revocation | No automatic refresh resurrection | Clear displayed private account state; report uncertain revocation | S6-004/020 |
| Concurrent account switch | New account must not be overwritten by old refresh response | Lock + identity fencing | Old permissions not retained | S6-007/027 |
| Web Locks unavailable | Pinned facade fails closed instead of guessing cross-tab coordination | **Supported-browser UX/fallback OPEN** | Must not create false token replay/logout | S6-026/036 |

### C.2 Credential-specific Origin/CSRF applicability

| Class | Example | Required boundary / known status | Missing decisions |
|---|---|---|---|
| Browser cookie-authorized refresh | POST `/users/refresh-session` | explicit Origin requirement and server-side token rotation; Secure/SameSite deployment checks | Forged Origin with active valid cookie, full cache/error matrix |
| Browser web Bearer mutation | POST `/budget/...` | JWT auth, entitlement and ownership; Origin applicability based on approved model | Per-route CSRF threat test |
| Public capability token | `/notifications/unsubscribe/:token` | expiry, token validation, replay semantics; cannot infer blanket Origin requirement | Per-workflow token matrix |
| Native TNNA refresh | POST `/tnna/refresh` | native device/token binding rather than browser cookie Origin assumption | Separate native threat review |
| Family Tree privacy page token | `X-FT-Page-Token` | person/page token plus authenticated access where required | Interception/header propagation tests |

### C.3 Credential lifecycle policy decisions not yet approved

The 180-day native refresh issuance interval is not an absolute cap. A valid remembered-browser refresh, native offline allowance, web token replay/family invalidation, password-change revocation and new-login supersession are **distinct** policy choices. No migration may equate them without user approval and TNNA device evidence.

## Annex D — Deterministic acceptance-case specifications (INITIAL DESIGN, NOT EXECUTED)

All cases require a controlled offline/test fixture, expected HTTP plus body, session/data-state checks and recorded test evidence. A test without a configured fixture and result remains `NOT-RUN`, not PASS. No production calls, real customer data, actual token values, or credential dumps are required or permitted.

| ID | Requirement | Fixture and stimulus | Expected assertions | Evidence/status |
|---|---|---|---|---|
| ADMIN-01 | ADMIN | DB row `IsAdministrator=1`, username matches configured after trim/case fold; valid web session; call `getAdministratorStatus` | `isAdmin:true`, designated:true; protected admin route allowed subject to remaining policy | Unit/API NOT-RUN |
| ADMIN-02 | ADMIN | DB row same username, flag `0` | `isAdmin:false`, no admin override; representative admin route 403; no privileged data/write | Unit/API NOT-RUN |
| ADMIN-03 | ADMIN | DB flag `1`, different username | `isAdmin:false`, admin route 403, no write | Unit/API NOT-RUN |
| ADMIN-04 | ADMIN | No corresponding DB user row | `isAdmin:false`; deny; no write | Unit/API NOT-RUN |
| ADMIN-05 | ADMIN | `ADMIN_USERNAME` absent/empty; DB flag `1` | `isAdmin:false`; deny; no fallback hardcoded ID | Unit/API NOT-RUN |
| ADMIN-06 | ADMIN | Authenticated user id numerically `1`, DB flag `0` | `isAdmin:false`; prove hardcoded ID does not grant | Unit/API NOT-RUN |
| ADMIN-07 | ADMIN | Inject DB query error into verification | Reject/throw; `requireAdministrator` forwards safe failure, no `next()` granting access; HTTP error is sanitized (final exact wire form pending) | Offline injection NOT-RUN |
| ADMIN-08 | ADMIN | JWT contains speculative admin field but DB disagrees | Access denied; no JWT-only override, no privileged write | API NOT-RUN |
| ERR-01 | ERROR | Unexpected `Error` with `status=400`, message `internal-table-token` | HTTP 400 if status preserved; *response does not contain marker*; generic public message | R16-74B previously **FAIL**; not rerun |
| ERR-02 | ERROR | Unexpected `Error` with `status=403`, secret-like message | HTTP 403 preserved if approved; secret absent | R16-74B previously **FAIL**; not rerun |
| ERR-03 | ERROR | Unexpected status 500/503 with sensitive message | Generic sanitized body, status semantics preserved | Prior R16-74B PASS subset; not rerun |
| ERR-04 | ERROR | Explicitly marked 400 validation error | Approved validation message retained in legacy-compatible body | Offline NOT-RUN for v0.3 |
| ERR-05 | ERROR | Unmarked 400 exception from nested route | Generic safe text; no raw DB/query details | Offline NOT-RUN |
| ERR-06 | ERROR | Upload error and custom 4xx | Only explicitly approved upload-validation message; no file system path | NOT-RUN |
| ERR-07 | ERROR | Logger receives synthetic secret fields | No raw secret/token/URL query or stack in output | NOT-RUN |
| API-01 | API-002 | Synthetic `{error:string}` 400 response | Typed `WAApiError`, human string, code/status available | NOT-RUN |
| API-02 | API-002 | Synthetic `{message:string}` 400 response | Human string; no object coercion | NOT-RUN |
| API-03 | API-002 | Synthetic `{error:{message:string}}` 400 response | Human string, not `[object Object]` | Source gap; NOT-RUN |
| API-04 | API-002 | 423 PRIVATE_LOCKED and page token | Preserve `423`/domain code, do not trigger generic auth logout | NOT-RUN |
| API-05 | API-002 | 204 and malformed/non-JSON response | No invalid JSON parse leak; no-content correct | NOT-RUN |
| API-06 | API-002 | `FormData` image upload | Browser-set multipart boundary and privacy header preserved | NOT-RUN |
| API-07 | API-002 | Client-provided Authorization header attempts override | Platform controls Bearer credential | Source behavior; NOT-RUN |
| API-08 | API-002 | `WA.api.request` raw Response then `.json()` once | No double body consumption | NOT-RUN |
| API-09 | API-002 | Representative TNNA, Budget, ETF, FT legacy clients | Existing supported success and error wire semantics preserved | NOT-RUN |
| SESSION-01 | SESSION | Expired JWT, valid remembered cookie, safe GET | One controlled refresh, correct identity, GET succeeds if authorized | Prior bounded evidence; new case NOT-RUN |
| SESSION-02 | SESSION | Expired JWT, POST receives 401 | No automatic POST replay, no new DB row | NOT-RUN |
| SESSION-03 | SESSION | Valid JWT, subscription 403 | No refresh; no protected display or writes | Prior bounded evidence; new case NOT-RUN |
| SESSION-04 | SESSION | Read network fails/503 | No false logout, safe visible failure | NOT-RUN |
| SESSION-05 | SESSION | Mutation times out after possible server receipt | No automatic replay; unsaved form retained | NOT-RUN |
| SESSION-06 | SESSION | Two tabs refresh concurrently | One valid rotation, no false replay/old account overwrite | Partial historical evidence; new case NOT-RUN |
| SESSION-07 | SESSION | Account switches while refresh pending | Old result not overwrite new JWT; permissions refresh | NOT-RUN |
| SESSION-08 | SESSION | Web Locks unavailable | Fail closed per current facade; browser recovery UX policy flagged OPEN | NOT-RUN |
| SESSION-09 | SESSION | Logout offline | Local state cleared but server revocation reported as unconfirmed | NOT-RUN |
| PRIV-01 | PRIV | Public contact verification GET with valid token | Publicly reachable, no bearer requirement, no unintended account data | NOT-RUN |
| PRIV-02 | PRIV | Private Person read without page token | No private fields or nested leakage | Historical bounded tests; new case NOT-RUN |
| PRIV-03 | PRIV | Valid page token for targeted Person | Authorized data only; unrelated Person data redacted | NOT-RUN |
| PRIV-04 | PRIV | Wrong Tree membership | Denied regardless of subscription | NOT-RUN |
| PRIV-05 | PRIV | File upload using `FormData` | No forced JSON content type; existing image workflows preserved | Historical bounded tests; new case NOT-RUN |
| PRIV-06 | PRIV | Public privacy approval link reused | Behavior consistent with per-workflow approved token rules | NOT-RUN |
| TNNA-01 | NATIVE | Valid native verify-code | Scoped tokens and device binding intact | Historical bounded evidence; new case NOT-RUN |
| TNNA-02 | NATIVE | Consumed native refresh replay | Rejected; no unauthorized token issuance | Historical subset; new case NOT-RUN |
| TNNA-03 | NATIVE | Native refresh network unavailable within offline allowance | Preserve existing conditional offline state, not falsely classify as 401 | Device NOT-RUN |
| TNNA-04 | NATIVE | Server returns native refresh 401 | Offline exception not used; require login | Device NOT-RUN |
| TNNA-05 | NATIVE | Installed app updates from V1.0 to V1.1 | Preserves identity/signing and local credentials | Previously documented test, new case NOT-RUN |
| TNNA-06 | NATIVE | Background/screen-off movement | Existing town announcement behavior preserved | New case NOT-RUN |
| LOG-01 | LOG | Synthetic token/password in exception | No secret in logs, response, Console, attachments | NOT-RUN |
| ENV-01 | ENV | Staging DB identity correct | Guard allows controlled startup | Prior bounded tests; new case NOT-RUN |
| ENV-02 | ENV | Staging config points to unauthorized DB | Startup fails closed; no queries affecting production | NOT-RUN |
| CACHE-01 | CACHE | Sensitive API 200/401/403 | `Cache-Control:no-store` present | Source guard; new case NOT-RUN |
| CACHE-02 | CACHE | Old HTML / new `waPlatform.js` | No identity mixing or duplicate mutation | NOT-RUN |
| GOV-01 | REVIEW | Proposed change + tests | Requirement-to-file-to-test trail; old PASS retained scoped | NOT-RUN |
| GOV-02 | REVIEW | Final production merge requested | Independent design review, migration/rollback and explicit user permission required | NOT-RUN |

**For test families not individually enumerated here**, define named test cases before approval; do not claim that every S6 issue has test coverage from this table. Expected exact machine code/body values for undecided API envelopes are **BLOCKED—DEC-02**, not invented. Baselines, fixture IDs, raw evidence paths, reviewer and timestamps belong in the execution ledger, not in this proposal.

## Annex E — Candidate exceptions and public-capability token register

These are **known architectural access classes and candidate deviations**, **not approved exceptions from any future standard**. Formal deviations require: exception ID, requirement, exact methods/paths, threat model, justification, tested alternative control, allowed client versions, owner, user approval, review/expiry trigger, and regression evidence.

| Candidate | Why it differs | Invariant to retain | Unresolved check |
|---|---|---|---|
| E-01 Contact email verification | Emailed link available before browser login | high-entropy scoped token; expiry; restricted response; bounded GET/POST | one-time write vs repeated read, referrer leakage |
| E-02 Privacy approval link | user-approved privacy decision via email link | hashed/expired capability; no login dependency; correct Person | replay/Origin/decision change |
| E-03 Notification unsubscribe | recipient acts without WA account session | token ownership and minimal recipient disclosure | repeated GET/POST and idempotence |
| E-04 Family Network verification | external recipient approval | token + consent; privacy-safe response | scope, expiry and returned fields |
| E-05 TNNA verify/refresh | native device credential not browser cookie | device scope, rotation, revocation and 401 semantics | absolute cap undecided |
| E-06 Family Tree `X-FT-Page-Token` | private Person page unlock | page-specific token, redaction and browser interceptions | header propagation across fetch variants |
| E-07 Family Tree multipart | browser-supplied multipart boundary | auth, member checks, upload validation | safe Multer errors and object cleanup |
| E-08 Usage unload tracking | termination-time request has different delivery limits | no duplicate mutation/replay and no stale token | `fetch keepalive` lifecycle and backend accounting |
| E-09 Legacy direct Bearer fetch | existing application consumer | equivalent auth/ownership, no unsafe retry | migration path to `WA.api` |
| E-10 Administrator subscription override | privileged centrally verified admin | both DB flag and configured username, audited scope | per-record ownership remains distinct |
| E-11 Public native version lookup | installed app update metadata | non-secret response, safe errors/cache | data scope and release compatibility |

### E.1 Public capability workflow review template

`Workflow | GET allowed repeatedly? | POST consumes? | token storage/hash | expiry | response disclosure | rate limit | Origin applicability | CSRF threat | referrer/URL leakage | status/error codes | test cases | approval`.

No one-time semantics, lifetime, or mandatory Origin policy may be inferred from this table; each needs evidence and (where new) approval.

## Annex F — v0.2 requirement crosswalk and duplicate-resolution map

The B8-04 overlapping families are resolved by **one primary v0.3 clause** and dependent annex details. None of the 28 topics is intentionally abandoned; details remain reviewable with independent status.

| v0.2 identifier | v0.3 governing clause | Note |
|---|---|---|
| WA-STD-01 | WA-CORE-001 | source provenance and isolation |
| WA-STD-02 | WA-API-001 | one endpoint classification rule |
| WA-STD-03 | WA-API-001 + WA-DATA-001 | layered authorization; ownership detail in DATA |
| WA-STD-04 | WA-SESSION-001 + WA-API-002 | session usage vs wire interoperability separated |
| WA-STD-05 | WA-SESSION-001 | unsafe replay and logout behavior |
| WA-STD-06 | WA-ERROR-001 | public error provenance invariant |
| WA-STD-07 | WA-API-002 + WA-ERROR-001 | wire schema undecided; safety invariant independent |
| WA-STD-08 | WA-LOG-001 + WA-CACHE-001 | logging vs cache separated |
| WA-STD-09 | WA-PRIV-001 | public link token security |
| WA-STD-10 | WA-PRIV-002 | Family Tree special contract |
| WA-STD-11 | WA-NATIVE-001 | single native rule |
| WA-STD-12 | WA-DATA-001 | data ownership + transactions |
| WA-STD-13 | WA-REVIEW-001 | test and evidence gate |
| WA-STD-14 | WA-CORE-001 + WA-REVIEW-001 | provenance vs approval authority |
| WA-STD-15 | WA-FRONT-001 | pre-existing mandatory source formatting |
| WA-STD-16 | WA-PRIV-001 | Origin/CSRF credential applicability |
| WA-STD-17 | WA-ABUSE-001 + WA-SESSION-001 | challenge vs session transitions |
| WA-STD-18 | WA-SESSION-001 | single concurrency/replay clause |
| WA-STD-19 | WA-LOG-001 + WA-SESSION-001 | storage/XSS migration open DEC-09 |
| WA-STD-20 | WA-CACHE-001 | PWA cache-version correctness |
| WA-STD-21 | WA-ENV-001 | staging/production guards |
| WA-STD-22 | WA-ABUSE-001 | proxy, limits and abuse |
| WA-STD-23 | WA-NATIVE-001 | native lifetime open DEC-08 |
| WA-STD-24 | WA-DATA-001 | one data/transaction rule |
| WA-STD-25 | WA-REVIEW-001 | one evidence/approval gate |
| WA-STD-26 | WA-API-002 | canonical wire shape still open |
| WA-STD-27 | WA-API-001 + Annex E | classify vs deviate separated |
| WA-STD-28 | WA-REVIEW-001 + WA-ENV-001 | independent engineer/release |
| WA-SEC-ADMIN-001 | WA-SEC-ADMIN-001 | **user-approved, unchanged in substance** |

### F.1 Evidence and certification ledger (initial, incomplete)

| Requirement | Policy provenance | Source evidence | Offline/local/hosted evidence | Conformance decision |
|---|---|---|---|---|
| ADMIN | **Approved user decision** | `administratorAccess.js` pinned matches; `TechSummary` stale | Some Stage 6 admin bounded tests; new negative matrix not executed | NOT CERTIFIED project-wide |
| ERROR | Doc general security; proposed precise standard; S6-041 open | central 4xx gap pinned | R16-74B unexpected400/403 isolated fail, 500/503 pass | OPEN / known source discrepancy |
| SESSION | S6-005/008/018 open | facade exists, direct legacy fetch remains | R10/R14/R15 selected bounded passes | PARTIAL, not full certification |
| API | S6-033 open | three error body shapes; parser mismatch pinned | no complete consumer migration test | OPEN decision |
| PRIV | existing Family Tree privacy docs | privacy middleware and token interception pinned | R15/R16 bounded checks | PARTIAL |
| NATIVE | existing CLAUDE TNNA behavior | token issuance and native router pinned | hosted native API subset, not full device continuity | PARTIAL |
| FRONT | existing mandatory TechSummary formatting | some HTML files include mixed formatting styles | no complete formatting acceptance | OPEN coverage |
| ENV | S6-031 | startup guard pinned | prior local/hosted identity checks | PARTIAL |
| REVIEW | S6-014 open | none sufficient for independent final approval | independent final engineer not done | OPEN |

Any future "conforming" decision requires the *exact file version and test coverage*, not only these rows.

## Annex G — B8 finding disposition (all 24 tracked separately)

`RESOLVED-IN-DRAFT` = wording or structural defect addressed in this proposed document, **not independently reviewed or approved**. `PARTIAL` = important missing work remains. `OPEN-DECISION` = user policy choice needed. `OPEN-VERIFICATION` = tests/inventory or live-source comparison incomplete.

| B8 ID | v0.3 disposition | Evidence in this document / remaining step |
|---|---|---|
| B8-01 | RESOLVED-IN-DRAFT / OPEN-DECISION | WA-ERROR-001 separate from WA-API-002; DEC-02 canonical wire schema pending |
| B8-02 | RESOLVED-IN-DRAFT / OPEN-DECISION | provenance safety invariant and ERR cases; DEC-03 implementation choice, R16-75 paused |
| B8-03 | PARTIAL | Annex D has stimuli/assertions; fixtures, final response schema, real evidence remain |
| B8-04 | RESOLVED-IN-DRAFT | primary clauses + 28-to-new crosswalk Annex F |
| B8-05 | OPEN-VERIFICATION | Annex A explicitly partial; complete router-and-consumer method inventory required |
| B8-06 | PARTIAL | Annex B detailed parser/interface behaviors; consumer validation outstanding |
| B8-07 | PARTIAL | WA-PRIV-001 + Annex E workflows; full token lifetime audit pending |
| B8-08 | PARTIAL | Annex C state table; exact browser recovery/lock policy undecided |
| B8-09 | RESOLVED-IN-DRAFT / OPEN-VERIFICATION | ADMIN-01–08 deterministic cases, not executed |
| B8-10 | RESOLVED-IN-DRAFT / NOT INSTALLED | §4.1 proposed TechSummary text; authoritative file unchanged |
| B8-11 | PARTIAL | WA-FRONT-001; full TechSummary §14 audit pending |
| B8-12 | PARTIAL | diff/DOM acceptance stated; formatter and UI fixture suite not implemented |
| B8-13 | OPEN-DECISION | fail-closed existing behavior recorded; DEC-04 browser/fallback UX |
| B8-14 | PARTIAL | Annex C credential-specific Origin matrix; authenticated forged-origin hosted tests pending |
| B8-15 | OPEN-DECISION | DEC-05/06/07/08 preserve separate lifecycle policies |
| B8-16 | PARTIAL | Annex D case schema and scoped evidence defined; endpoint-class complete threshold still gated by Annex A |
| B8-17 | OPEN-VERIFICATION | B6-16–20 separately retained from B8; full R01–R20/S6/DE6 trace incomplete |
| B8-18 | RESOLVED-IN-DRAFT | §1.1 independent policy/source/test/conformance/approval fields |
| B8-19 | RESOLVED-IN-DRAFT | Annex E explicitly candidate classes, not approved waivers |
| B8-20 | RESOLVED-IN-DRAFT / OPEN-DECISION | §1.2 version/conflict rules; DEC-01 effective date/ownership |
| B8-21 | PARTIAL | Annex B separates status, code, display string and privacy 423; canonical code namespace undecided |
| B8-22 | RESOLVED-IN-DRAFT / OPEN-VERIFICATION | WA-LOG-001 allowed/prohibited taxonomy; runtime sweep S6-030 pending |
| B8-23 | RESOLVED-IN-DRAFT | Annex F ledger independent provenance/source/tests/conformance |
| B8-24 | OPEN-VERIFICATION | WA-CORE-001 source identity gate; no current Drive/local/deployed hash reconciliation |

### G.1 Preserve B6 finding dispositions separately

B6-01 full frontend formatting **partial**; B6-02 admin wording **draft resolved, authoritative drift open**; B6-03 TNNA issuance/cap distinction **resolved in draft**; B6-04 mutation replay **partial**; B6-05 Origin **partial**; B6-06 login/supersession **policy open**; B6-07 XSS/storage **partial**; B6-08 cache **partial**; B6-09 environment/rollback **partial**; B6-10 proxy/rate **partial**; B6-11 envelope **policy open**; B6-12 classifier **policy open**; B6-13 exceptions **partial**; B6-14 source/UI conventions **partial**; B6-15 transactions **partial**; B6-16 test trace **open**; B6-17 provenance partition **draft resolved**; B6-18 browser support **open**; B6-19 public token **partial**; B6-20 version/effective date **draft resolved, approval open**. This register does not close any underlying implementation issue.

## Annex H — Stage 6 historical evidence and review boundary

The following are **previously reported scoped results**, not tests newly run or certified in B9: R10 PASS (bounded), R14 PASS (bounded), R15 PASS (bounded); R16-55–62 previously corrected route error disclosure (32/32 offline and bounded hosted); R16-63–66 privacy correction (11/11 offline plus bounded checks); R16-68–70A tracking sanitization (6/6 offline plus bounded local/hosted); R16-71–73A refresh-session handling (11/11 offline plus local/hosted no-cookie 401). **R16-74B** pinned central handler isolated test shows unexpected400Disclosed=true and unexpected403Disclosed=true (safety requirement FAIL); 500/503 sanitizer and status preservation passed. That source-level isolated result **does not prove a real-user production disclosure**. R16-75 remains **PAUSED**. Historical ~70% Stage 6 estimate is not a formal arithmetic completion value.

Full final evidence must reconcile `R01–R20`, `S6-001–S6-041`, earlier `DE6-01–DE6-14` and `R-01–R-11` findings, then reconcile later R16 evidence. B9 has not independently fetched every historical evidence file; this annex preserves reported outcomes and flags that limitation rather than asserting a new closed status.

## 5. Technical adoption and independent review checklist

- [ ] Review **all** v0.3 primary clauses and Annexes A–H, including the distinction between existing mandatory, approved admin, proposed and open decisions.
- [ ] User explicitly selects accepted standards, rejected clauses and unresolved policy decisions; version/effective date recorded.
- [ ] Complete exact endpoint + frontend + native consumer inventory at verified Drive/current SHA with method-level ownership, Origin, wire contract and test mapping.
- [ ] Finish mandatory existing `TechSummary.md` §14 convention coverage, not just formatting.
- [ ] Complete per-workflow public capability token lifecycle/threat matrix.
- [ ] Obtain policy choices DEC-02–08 before implementation dependent on them; no accidental introduction of a new native absolute cap or browser lock fallback.
- [ ] Approve safe-error public contract and permanent classifier plan; keep R16-75 paused until explicit implementation authorization.
- [ ] Prepare separate **complete** proposed documentation replacements after approval; user manually installs. Do not edit Google Drive/GitHub/local project directly.
- [ ] Execute deterministic offline/local/staging/browser/native tests only when separately authorized; record fixtures, observed statuses/bodies, no-write checks, timestamps, SHA and redacted evidence.
- [ ] Reconcile historical S6/R/DE6 findings and preserve bounded PASS boundaries.
- [ ] Obtain independent design engineer/security review of approved standards and, separately, final completed Stage 6 implementation before merger/production decision.
- [ ] Require explicit user approval for migration, rollback, production environment or `main` modification.

## 6. B9 completion and sign-off

| Dimension | B9 state |
|---|---|
| v0.3 complete *draft document* | **PREPARED** |
| B8 24 findings | **ALL TRACKED** in Annex G; several remain open |
| Administrator rule | **APPROVED USER DESIGN**, faithfully retained |
| Whole specification | **NOT APPROVED** |
| B9 source/code inspection | Based on prior verified authoritative docs and pinned source; **not a complete current SHA audit** |
| Code implementation | **NONE** |
| New automated/hosted/browser/native tests | **NONE** |
| Independent engineer review | **NOT YET PERFORMED** |
| R16-75 | **PAUSED** |
| Drive/GitHub/local WA sources/Render/databases/production | **UNCHANGED** |

**Suggested next step:** ask an independent engineer to review the standards draft and specifically the OPEN-DECISION choices, or conduct a user decision review first for DEC-01–11. No code changes should be authorized merely because the v0.3 draft exists.
