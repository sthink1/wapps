# Wonderful Apps — Programming and Security Standardization Specification

**Document ID:** WA-STD-DRAFT-B7  
**Version:** 0.2 — CONSOLIDATED DRAFT FOR ENGINEERING REVIEW  
**Prepared:** November 11, 2026  
**Scope:** Wonderful Apps (WA) Node.js/Express backend, browser/PWA frontend, Family Tree, ETF, Budget, Tracking, authentication and subscription middleware, and interfaces used by TNNA.  
**Authority:** **DRAFT — NOT YET AUTHORITATIVE OR IMPLEMENTED.** **Exception:** WA-SEC-ADMIN-001 is a user-approved *design rule* (November 11, 2026), but the full specification, any deployment, and any documentation replacement are not approved. This document is a separate review artifact. It does not supersede `CLAUDE.md`, `TechSummary.md`, or the Stage 6 registers. No code, project document, repository, database, or deployment has been changed.

## 1. Purpose, baseline, and interpretation

The purpose is to make WA standards **consistent, technically specific, enforceable, and verifiable** without losing application behavior. A consistent rule can have defined exceptions; it does not require all routes to use identical middleware, status codes, or payloads. In particular, Family Tree page-token privacy, public email verification, TNNA credentials, multipart uploads, and tracking have distinct contracts.

**Current authoritative documentation inspected read-only:**

- [CLAUDE.md](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view), updated October 13, 2026: §11 lines 871–890 (backend security), §14 lines 1003–1018 (coding standards), §17 lines 1114–1134 (change procedure).
- [TechSummary.md](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view), updated October 13, 2026: §11 lines 1024–1067, §12 lines 1109–1127 (request chain), §20 lines 1343–1370 (development checklist), §21 lines 1374–1396 (documentation principles).
- [Stage6_OpenItems.md](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view), consolidated revision 3.3, November 9 text and November 10 Drive modification metadata: S6-005 (line 147), S6-008 (150), S6-009 (151), S6-014 (156), S6-017 (159), S6-018 (160), S6-019 (161), S6-030 (172), S6-033 (175), S6-041 (368–376). This document contains historical material and statuses; newest verified evidence must be reconciled separately.
- [Stage6_Render_TestPlan.md](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view), consolidated v2.3 dated November 9, 2026, with preserved bounded R10/R14/R15 acceptance.

**Implementation reference:** GitHub [`sthink1/wapps`, commit `b5e2b06`](https://github.com/sthink1/wapps/tree/b5e2b06), the last handoff-confirmed staging code reference. This audit **does not prove** that Google Drive, an uncommitted local worktree, present branch HEAD, or current Render Live service still exactly match the pinned commit. Any later implementation or remediation requires renewed source/deployment reconciliation.

**Evidence labels:** `DOC` = stated in the authoritative documentation; `SRC` = seen at pinned code commit; `TEST-HIST` = previously recorded Stage 6 test result, not retested here; `PROPOSED` = standard to approve; `UNKNOWN` = requires further evidence. A requirement is not described as a historical programmer obligation unless its existence at that date is proven.

### 1.1 Normative words

After approval, **MUST / MUST NOT** are mandatory, **SHOULD** requires a documented exception when not followed, and **MAY** is optional. Until approval, each `WA-STD-*` item below is a **draft consolidation**, even where it restates an existing documented rule. `WA-SEC-ADMIN-001` is the separately **user-approved design decision**, not a certification of deployment or project-file revision. Existing documented requirements are separately identified in the traceability table.

### 1.2 Standardization success criteria

Approval must ultimately produce (1) a documented contract for each interface, (2) an inventory of endpoint access classes and consumers, (3) source and runtime conformance evidence, (4) a recorded exception decision, (5) preservation of earlier bounded PASS tests and proof for newly affected behaviors, and (6) independent design-engineer review before any `main` or production decision. Passing a single representative route does not certify all routes.

## 2. Standards and acceptance criteria

**Requirement index:** WA-STD-01–14 retain B5 IDs; WA-SEC-ADMIN-001 is the approved administrator rule; WA-STD-15–28 incorporate B6 findings. Sections 3–8 retain previous B5 evidence and sequencing, while §§9–13 provide new disposition, decisions and adoption controls. All proposed standards require explicit approval before being treated as operative policy.


### WA-STD-01 — Change baseline and cross-module impact analysis

**PROPOSED requirement.** Before a change, identify the exact authoritative Drive files, committed SHA and local differences (if made available by the user); record all relevant routes, middleware, services, HTML/JS consumers, database tables, and mobile interfaces. Confirm that the baseline is current. Never silently treat a `_COPY` file as active. Preserve any local uncommitted work. No modification in GitHub, Drive, local user files, Render, or databases is authorized through this audit.

**Acceptance:** Review record includes baseline SHA, source file inventory, impact matrix, environment, backward compatibility and affected regression cases. If versions conflict, mark `BLOCKED — SOURCE RECONCILIATION` rather than generating a supposedly authoritative replacement. **Origin:** CLAUDE §1 and §17; S6-034; Stage 6 handoff.

### WA-STD-02 — Every endpoint receives an explicit access classification

**PROPOSED requirement.** Maintain an endpoint catalog with HTTP verb, path, entry router, auth class, session client scope, subscription AppKey if any, admin requirements, object-ownership check, CSRF/Origin rules, response/error envelope, cache rules and named frontend/native consumers.

Use these **proposed** access classes:

- `PUBLIC_NONCREDENTIAL`: only explicitly listed no-login operations (e.g. published TNNA version metadata), with scoped information disclosure.
- `PUBLIC_BEARER_LINK`: narrow email-link/token verification and unsubscribe workflows; token entropy, expiry, one-time use and leakage checks are route-specific.
- `AUTH_WEB`: valid web access session required.
- `AUTH_APP(appKey)`: valid web session plus entitlement to the named app; ownership separately enforced.
- `AUTH_ADMIN`: valid session plus verified administrator authorization (and separate application scope when applicable).
- `AUTH_NATIVE`: TNNA-bound credentials and device scope; **not interchangeable** with web refresh cookies.

**Acceptance:** Catalog reviewed against all mounts in `server.js` and all route methods. A deliberate exception gets an ID, owner, rationale, expiration/review trigger, and tests. **Origin:** CLAUDE §11/§14; TechSummary §12; S6-009/017/019.

### WA-STD-03 — Authorization is layered, never UI-only

**PROPOSED requirement.** Protected requests MUST be authenticated server-side; subscription-controlled operations MUST pass `requireAppAccess(appKey)` or an approved equivalent, and user-owned resources MUST verify `UserID` or applicable tree membership for the actual requested record. Administrator recognition MUST comply with the separately user-approved **WA-SEC-ADMIN-001** below. Administrative overrides MUST be narrowly authorized and must not grant unreviewed access to unrelated personal data. A protected route's shared middleware does not by itself prove record ownership. Denial MUST fail closed before sensitive data or mutations are exposed.

**Acceptance:** For each route family, test anonymous, wrong client, wrong user, authorized owner, insufficient subscription, expired subscription, and administrator where applicable. Preserve the previously verified bounded R14 results; add only gaps. **Origin:** CLAUDE lines 882–890; TechSummary 1051–1067; R14 and S6-009; user-approved administrator standard dated November 11, 2026.

### WA-STD-04 — Shared browser session and API usage

**PROPOSED requirement.** New or materially revised browser clients SHOULD use the approved `WA.session` / `WA.api` contract. Any direct `fetch` plus manual `localStorage`/Bearer path MUST be inventoried with a migration or explicit compatibility exception. Do not assume loading `waPlatform.js` proves adoption. A direct `fetch` exception may be needed for special upload/privacy behavior, but must still obey token, error, and retry controls.

The existing implementation uses `localStorage.token` as temporary compatibility storage. This draft **does not approve** immediate elimination of that storage or change the token lifecycle. Do not log access tokens. **Acceptance:** For affected pages verify renewal, explicit logout, network failure, 401, 403, 5xx, no stale-account presentation, correct user-scoped header, and no loss of unsaved data. **Origin:** S6-005/008/018/033.

### WA-STD-05 — Request replay and session-state semantics

**PROPOSED requirement.** Do not automatically repeat POST/PUT/PATCH/DELETE or requests with a body after a 401. A read-only GET/HEAD may be retried once after successful approved refresh, only if the caller's account/session is still current. Failed refresh must not cause unsafe replay or silently convert permission 403 into login 401. Without supported cross-tab lock, fail closed in accordance with an explicit browser support policy.

**Acceptance:** Controlled simulations and representative browser tests for expired JWT, valid/invalid refresh, logout during refresh, account switch, absent Web Locks, network interruption, 401 versus 403, and unsaved form state; defer broader claims until completed. **Origin:** observed `waPlatform.js` behavior, S6-008/018/026/027; normative extension proposed.

### WA-STD-06 — Unified intentional-error classification

**PROPOSED requirement.** Only explicitly created and vetted validation/business-rule errors may expose authored user-facing messages. Unexpected exceptions, including those carrying a 400–499 `status`, MUST NOT have their raw `.message`, `.stack`, SQL, URL, or provider data automatically returned. Classification MUST be explicit, not derived solely from `status`, property names, `(be)` suffixes, or arbitrary thrown text. The shared Stage 6 marker is an existing candidate but is **not yet approved** as the final permanent API.

**Acceptance:** Isolated tests for unexpected 400/403/500/503 and approved 400/403/404/409; verify status preservation where required and no unexpected message exposure. Map Budget and ETF custom classifiers to the chosen architecture only after caller compatibility analysis. **Origin:** CLAUDE §14 general consistency; S6-041; source findings below.

### WA-STD-07 — Canonical API error envelope and compatibility

**PROPOSED requirement.** Define one versioned external error contract with a stable machine-readable code, safe display message, HTTP status and optional documented contextual fields. Do **not** assert that a proposed canonical shape is already deployed. An illustrative proposal is:

```json
{
  "error": { "code": "REQUEST_FAILED", "message": "Request failed" }
}
```

This example is **not** permission to alter existing endpoints. Current callers consume `{error: "..."}`, `{message: "..."}`, and `{error:{message:"..."}}`. A migration MUST inventory consumers and may require a dual-compatible parser or versioned rollout; avoid changing 401/403 semantics, special `reason`, `app`, `code`, `valid`, or other fields without explicitly designed compatibility.

**Acceptance:** API-to-frontend contract tests for successful and failed responses, nested/string errors, non-JSON failures, all required status codes and field-specific legacy screens. **Origin:** S6-033; source comparison.

### WA-STD-08 — Response privacy, cache and logging

**PROPOSED requirement.** No secret, token, password, API key, database connection detail, private Person data, reset link, or raw exception internals in logs or public errors. Redact path/query fragments that may carry credentials. Sensitive API success and failure responses SHOULD use `Cache-Control: no-store`, with an explicitly reviewed exception for safe public/static content. Logs should retain bounded event type, route identity without sensitive path values, status, and a safe correlation identifier if designed/approved. Do not log or display actual credential samples in review artifacts.

**Acceptance:** Source and hosted sanitized-log inspection, synthetic exception tests, representative HTTP cache-header checks, DevTools checks; new telemetry must not reveal tokens. **Origin:** CLAUDE 883–884; S6-019/030/041 and Stage 6 R16.

### WA-STD-09 — Public token-based exceptions

**PROPOSED requirement.** Public email verification, unsubscribe, Family Tree contact verification, privacy approval, and TNNA version checks MUST have their exact public methods and routes documented. Do not broaden a public bypass to neighboring paths or methods. Any one-time token workflow must use case-appropriate expiry and anti-replay safeguards. A link opened without login must not expose records beyond its purpose.

**Acceptance:** Anonymous positive/negative, wrong method/path, malformed/expired/consumed token, cross-account effects and leak checks. **Origin:** `server.js` narrow Family Tree bypass and `routes/notifications.js`/`ftPrivacy.js` public routers; detail and coverage require independent tests.

### WA-STD-10 — Family Tree privacy and media compatibility

**PROPOSED requirement.** Maintain Tree membership/record-access checks in addition to subscriptions. Preserve `X-FT-Page-Token` enforcement for private Person pages, fresh-open key behavior, safe response redaction of other private Persons, approved admin exception, and public privacy approval/contact verification. Multipart file uploads must preserve `FormData` boundaries and route-owned Multer processing; shared request wrappers MUST NOT force a JSON Content-Type or erase the page token. Global request interception must be explicitly tested for interactions with token refresh and other interceptors.

**Acceptance:** Missing/invalid/valid page-token tests, Person-open/reopen, wrong Tree, contacts, privacy approval/decline, ancestor/relationship responses, image upload/reload/delete, no unauthorized private content, no accidental automatic replay. **Origin:** CLAUDE Family Tree instructions; TechSummary 1415–1420; S6-017 and previous bounded R15 tests.

### WA-STD-11 — TNNA native authentication boundary

**PROPOSED requirement.** Native device-refresh credentials MUST retain device-bound session handling and never be treated as web cookie credentials. Keep the existing `AUTH_NATIVE` route contract and Android version/signing compatibility. Do not introduce a shared browser helper into TNNA without a separate approved native architecture review. The absolute lifetime question remains open, not implicitly resolved by standardization.

**Acceptance:** Explicit native route catalog, version compatibility tests, replay/revocation and device-scope tests, confirmed non-impact on installed devices. **Origin:** CLAUDE mobile rules, TechSummary principles, S6-010/032.

### WA-STD-12 — Controlled user data and mutation safety

**PROPOSED requirement.** Validate types, ranges, identifiers and ownership before mutations; use parameterized MySQL queries and full transactions for multi-write logical operations. Distinguish an expected duplicate-entry condition from an unforeseen database error without echoing database details. Maintain UTC rules, current schema authority and applicable MySQL compatibility constraints. Do not change data models merely to make error envelopes uniform.

**Acceptance:** Negative validation, cross-owner, duplicate, rollback, failed-update, and partial-failure tests with table/schema reconciliation. **Origin:** CLAUDE §11/14/17; TechSummary §13 and §20.

### WA-STD-13 — Test and evidence gate

**PROPOSED requirement.** Every standard or exception must map to source locations, exact tests, evidence timestamps, commit/ref, and status: `Documented`, `Source Verified`, `Tested Offline`, `Tested Local`, `Tested Hosted`, `Reviewed/Approved`, or `Open`. A test pass is bounded to its assertions and environment. Preserve prior R10/R14/R15/R16 evidence; do not repeat passing tests without an identified regression dependency. No percent-complete estimate substitutes for traceability.

**Acceptance:** Independent review can reproduce the reported evidence and distinguish live testing from synthetic injection and source-only inspection. **Origin:** Stage6_Render_TestPlan and Stage6_OpenItems.

### WA-STD-14 — Documentation authority, change approval, and release

**PROPOSED requirement.** After approval, give each standard an ID and version history; link normative rules from `CLAUDE.md` and summarize architectural consequences in `TechSummary.md`. Record every approved exception. Do not overwrite the user's documents without direct authorization. Require complete downloadable replacement artifacts for any future revisions, installed manually by user. Before merge into `main` or production deployment, finish acceptance reconciliation, rollback readiness and independent design-engineer/security review, then obtain express user approval.

**Acceptance:** Approved standard status, review sign-offs, changelog, conflict resolution, cross-references, source-to-requirement matrix and no unauthorized project writes. **Origin:** user operating constraints and S6-014/035.


### WA-SEC-ADMIN-001 — Administrator recognition [USER-APPROVED DESIGN RULE]

**Approval scope:** The user expressly approved this exact *rule* on November 11, 2026. This approval does **not** attest that every route uses it, authorize edits, or resolve the other draft requirements.

**Required decision procedure (all gates mandatory):**

1. Authenticate the request using the server's validated token/session processing. Do **not** infer administrator status from an ID value, a displayed username, a frontend flag, or a client-supplied/JWT `isAdmin` assertion.
2. Use the centralized server service `services/administratorAccess.js`, including `isVerifiedAdministrator` / `getAdministratorStatus`, instead of separate administrator tests in individual routes.
3. Look up the authenticated user's **current** `UsersT` row by `UserID` using a parameterized database query.
4. Require **`IsAdministrator = 1`** in that current database row.
5. Independently require that the current row's `UserName` matches configured **`ADMIN_USERNAME`**, compared case-insensitively after trimming surrounding whitespace. An absent/empty `ADMIN_USERNAME` does not grant access.
6. Grant administrator privileges **only if both the database designation and configured username match are true** for the same authenticated user. The `UserID` is a *lookup key*, never a privileged hard-coded constant.
7. On absent account, designation revoked, configuration mismatch/absence or database-verification failure, **do not grant** administrator access. Handle service failure without exposing underlying exception details.
8. Apply administrator checks server-side to all administrative endpoints and subscription overrides; these checks do not replace object ownership or purpose-specific authorization.

**Verified source reference:** [`services/administratorAccess.js` L4–39](https://github.com/sthink1/wapps/blob/b5e2b06/services/administratorAccess.js#L4-L39) queries `SELECT UserID, UserName, IsAdministrator FROM UsersT WHERE UserID=? LIMIT 1` and checks `IsAdministrator === 1` **and** normalized current-row username against configured `ADMIN_USERNAME`. [`middleware/subscriptionAccess.js` L4–29](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/subscriptionAccess.js#L4-L29) invokes the centralized verification for subscription override. This is source evidence at **`b5e2b06`**, not certification of every call site or current staging state.

**Explicit prohibited patterns:** `if (userId === 1)`, equivalent hard-coded privileged IDs, username-only approval, checking `IsAdministrator` without also checking configured username, and trusting an unverified administrator claim from a browser or token payload.

**Acceptance tests (ADMIN-T01–T10):** authorized designated administrator; matching username without database flag; database flag without configured match; both absent; wrong user ID; deleted current row; changed current username; revoked `IsAdministrator`; database error; representative subscription override and each administrative route. All negative cases deny privileges; none leaks sensitive data. Test current authenticated identity and database state, not merely UI button visibility. Review requires evidence across `/admin-management`, `/subscriptions/admin/*`, `/track` reporting and TNNA administrative endpoints where applicable.

**Documentation conflict requiring reconciliation:** [`TechSummary.md` §6.7 L504–511](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view) contains the older description `UserID === 1` **or** JWT-username match. That is **not** the approved standard and conflicts with the verified pinned service. Correct it only through a separately authorized documentation-revision procedure; do not assume the old text establishes current administrator privileges.

### WA-STD-15 — Human-readable HTML/CSS/JavaScript source [PRE-EXISTING MANDATORY RULE]

**Provenance:** [`TechSummary.md` §14 L1150–1169](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view) already mandates pretty-formatted, human-readable `.html` source, consistent indentation (prefer two spaces unless the page has another consistent style), readable nested tags/attributes and embedded CSS/JS, and no minified or long single-line page markup. When an HTML file is edited, the entire file must be formatted without changing any ID, `name`, route URL, event binding, selector, payload or behavior.

**Proposed review addition:** If formatting also accompanies a functional change, reviewers SHOULD receive a semantic-change explanation and a whitespace-insensitive/behavior-focused comparison; formatting must never hide security changes. This last review strategy is a **new proposal**, not an existing documented requirement.

**Acceptance (FRONT-SRC-T01–T03):** formatting inspection; unchanged DOM identifiers/routes/event bindings/payloads; functionality and diff verification of any touched page. Preserve HTML light-mode rules in TechSummary §14, subject to separately verifying the remainder of that section.

### WA-STD-16 — Explicit Origin/CSRF and refresh-cookie protection [PROPOSED DETAIL]

**Requirement:** Classify each authenticated cookie-bearing or state-changing endpoint by request credential and trust boundary. Require server-side exact permitted Origin verification for cookie-authorized refresh/logout and other designated sensitive web mutations; missing/untrusted Origins are denied where the documented workflow requires an Origin. Explicitly define CORS origin allowlist and credential semantics; do not infer a trusted request from permissive headers or a browser UI. Require validated Secure/HttpOnly/SameSite attributes as appropriate to the HTTPS deployment and ensure no-store on sensitive success **and** failure responses. Distinguish bearer-only, cookie-authorized, public-link and native credential scopes.

**Status:** Detail is a proposed implementation specification; S6-019 remains in progress. Browser/no-cookie/Origin evidence reported for R08 is *bounded* and does not certify forged authenticated Origin attempts.

**Acceptance (ORIGIN-T01–T08):** allowed Origin and valid cookie; missing Origin; disallowed Origin; forged Origin with valid cookie; preflight/credential policy; HTTPS attributes; denial caching; unexpected exception path. Record response statuses, side effects and protection of cross-site requests.

### WA-STD-17 — Login challenges, reset links and credential transitions [PROPOSED DETAIL]

**Requirement:** Each challenge/reset link must have cryptographically suitable issuance, defined attempt/rate ceilings, expiry, one-time use, client scope and appropriate account security-version binding; user-visible errors must not expose secret tokens or enable account enumeration. Revocation and previous-session supersession behavior must be **explicitly decided** before implementation. No password reuse, whitespace or native/web scope policy may be inferred as approved merely from a current handler.

**Approval boundaries:** S6-021, S6-022, S6-023 and S6-029 remain open/in progress; session supersession, password policy and some concurrency controls are **DECISION REQUIRED**.

**Acceptance (CRED-T01–T10):** valid challenge, wrong code, attempts threshold, expired challenge, cross-client attempt, concurrent changes, one-time reset, revoked security version, rate-limited request and notification failure; preserve previous bounded reset tests without falsely extending their scope.

### WA-STD-18 — Refresh-family replay, multi-tab races and logout certainty [PROPOSED DETAIL]

**Requirement:** Use server-verified refresh rotation and define detection/containment for consumed-token replay; distinguish hostile replay from legitimate concurrent tabs. Ensure a late refresh cannot restore an explicitly logged-out user or overwrite a different user's fresh login. Unsupported Web Locks must be handled safely according to a documented supported-browser policy. Report logout revocation only when the server confirms it; offline/rejected-refresh logout must visibly distinguish local sign-out from server revocation status.

**Open decisions:** precise token-family containment; web cookie-only logout contract; unsupported-browser fallback; any migration affecting installed clients. **Do not silently select** these policies. Do not replay POST/PUT/PATCH/DELETE after uncertain delivery; a GET retry is allowed only under an approved safe contract.

**Acceptance (SESSION-T01–T12):** simultaneous browser tabs, consumed refresh token, account switch with delayed response, explicit logout in flight, valid/expired/absent JWT, valid/rejected refresh cookie, network interruption, unsupported lock, uncertain mutation delivery and preserved unsaved form data.

### WA-STD-19 — Transitional token storage, XSS and CSP [PROPOSED DETAIL]

**Requirement:** Treat `localStorage.token` as a documented legacy compatibility mechanism, not a permanent security guarantee. Refresh cookies with HttpOnly do not prevent JavaScript access to an access JWT held in localStorage. Require output encoding for untrusted data, safe DOM assignment, third-party script inventory, CSP feasibility review and a versioned migration plan before storage changes. Never place credentials in Console output, error text, URLs, test attachments or third-party diagnostics.

**Acceptance (XSS-T01–T06):** DOM injection review, token logging search, script provenance, CSP compatibility analysis, storage behavior under logout/refresh, and account-switch isolation. **S6-028 remains open**; no automatic storage migration is authorized.

### WA-STD-20 — PWA asset and service-worker version compatibility [PROPOSED DETAIL]

**Requirement:** Coordinate `waPlatform.js`, Login, Home, supporting page scripts, service worker and manifest/cache updates as a compatible deployment unit. A stale page must not mix incompatible authentication APIs, resurrect a logged-out identity or retry unsafe writes. Record cache-control policy for sensitive responses separately from static-asset caching.

**Acceptance (CACHE-T01–T07):** fresh install, old HTML/new JS, new HTML/old JS, stale service worker, update/reload, offline recovery and safe rollback to a previously compatible asset set. **S6-024 open**.

### WA-STD-21 — Environment identity, secrets and fail-closed startup [PROPOSED DETAIL]

**Requirement:** Identify development, staging and production explicitly; verify connected database identity and expected UTC/session assumptions before accepting requests; fail startup for mismatched environment/DB/origin/secret configuration; never silently use production credentials during tests. Validate HTTPS cookie settings and preserve test-only guardrails. Log sanitised startup diagnostics without secret content.

**Acceptance (ENV-T01–T08):** expected DB, wrong DB, absent/mismatched origin, absent secret, incorrect environment flag, UTC check, HTTPS cookie configuration and staging-only CI/hosted verification. Preserve previously passed guarded startup tests; **S6-011/031 remain in progress**.

### WA-STD-22 — Trusted client IP, rate limiting and abuse resistance [PROPOSED DETAIL]

**Requirement:** Define the exact proxy trust boundary under Render or other ingress. Rate limit login, verification, password reset and relevant administrative actions with non-leaking errors and fair handling of legitimate clients behind NAT/proxies. Record cleanup workload and denial-of-service tradeoffs. Do not blindly trust spoofable `X-Forwarded-For` strings.

**Acceptance (RATE-T01–T07):** trusted ingress, spoofed header, shared-IP fairness, per-account abuse, threshold reset, limiter cleanup and safe error response. **S6-012 in progress**.

### WA-STD-23 — Native TNNA credential contract and unresolved lifetime cap [EXISTING + OPEN DECISION]

**Existing documented behavior:** [`CLAUDE.md` §10.4 L823–839](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view) records the shared WA identity and native verification, an eight-hour access JWT, 180-day native refresh token **issuance duration**, rotation on each successful native refresh, SHA-256 server-side token hash, encrypted device storage using AndroidKeyStore/AES-GCM, device binding, logout revocation, and a conditional network-offline authenticated mode of up to 30 days; an actual 401 token rejection requires re-login. [`routes/tnna.js` L17–28](https://github.com/sthink1/wapps/blob/b5e2b06/routes/tnna.js#L17-L28) sets 180-day refresh issuance. These are documented and source-observed characteristics, **not** evidence of an absolute 180-day cap.

**Policy remains undecided:** Whether a separate absolute maximum native refresh lifetime should exist (**S6-032**), and how any change would affect installed apps, credential migration and offline continuity. **No new cap is approved.** Web KMLI and native TNNA lifetimes must be documented as separate contracts.

**Acceptance (TNNA-T01–T10):** native verify/refresh rotation, replay 401, device binding, web/native credential scope, logout, installed device persistence, conditional offline mode, native speech/background continuity and version migration on approved test devices. No existing device or native production policy may be changed without separate approval.

### WA-STD-24 — Database, object ownership and transactional integrity [EXISTING + PROPOSED DETAIL]

**Existing:** `CLAUDE.md` §11 requires parameterized SQL, backend validation, user ownership checks and no reliance on frontend validation; §12 and `TechSummary.md` transaction guidance require logically complete transaction boundaries for related operations. **Proposed precision:** define per-endpoint object ownership/Tree membership, expected row-count outcomes, transaction atomicity and rollback, schema compatibility with the current authoritative dump and targeted concurrent mutation tests. A subscription pass or administrator flag alone does not prove record-level authority.

**Acceptance (DATA-T01–T08):** own record, wrong-user record, wrong Tree, non-member privacy, successful transaction, mid-transaction fault rollback, concurrent modification and original-schema compatibility. Do not infer migrations from historical dump names.

### WA-STD-25 — Verification, evidence, exceptions and policy adoption [PROPOSED DETAIL]

**Requirement:** Maintain independent states for **documentation provenance**, **pinned code observation**, **test results**, **conformance decision**, **exception approval**, **independent review**, and **user release authorization**. Each exception must state exact endpoints/files, reason, accountable reviewer, bounded test evidence, risk and review trigger. No PASS label for a sampled test automatically certifies an application, and no specification approval automatically approves a change or deployment.

**Acceptance (GOV-T01–T08):** requirement trace, current version identifiers, safe offline tests, staged/local cases as appropriate, user-approved exception decision, independent engineering disposition, preflight/rollback plan and explicit approval before changes to `main`/production. In this audit, **Google Drive, GitHub and local project files remain read-only**; separate generated downloads do not automatically become authority.

### WA-STD-26 — API response schema and client-compatibility decision [PROPOSED; SCHEMA UNDECIDED]

**Requirement:** Maintain a versioned documented success/error response contract, including error code, human message, HTTP status and cache semantics, with all frontend and TNNA consumers mapped. Currently observed success and failure payloads differ: `{error:string}`, `{message:string}`, `{error:{message:string}}`, provider-specific codes, and specialized privacy errors. The existing shared `WA.api.readError` at [`waPlatform.js` L39–48](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L39-L48) does not normalize the central nested error object at [`server.js` L211–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L211-L215).

**No chosen canonical envelope yet.** Do **not** alter public payload shapes until a compatible transition plan and client tests are approved. Error classification and public message safety are mandatory requirements of any eventual schema; mere HTTP 4xx classification is not a safety proof.

**Acceptance (API-T01–T10):** top-level error, top-level message, nested error object, structured error code, non-JSON error, 204, malformed JSON, expected 4xx, unexpected 4xx/5xx, TNNA/frontend compatibility and no unsafe retry. Resolve R16-75 only after the chosen contract is approved.

### WA-STD-27 — Reviewed technology and access-class exception register [PROPOSED DETAIL]

**Requirement:** Maintain approved access classes per method/path and separately register intentional exceptions: public email contact verification, privacy approval, unsubscribe and network-verification links; native `/tnna` credential scope; Family Tree `X-FT-Page-Token` redaction and uploads; administrator reads/writes; usage tracking lifecycle; legacy direct authenticated fetch; and other explicitly classified non-login endpoints. **Exception** does not mean *bypass all security*: each path has token/ownership/Origin/expiry controls appropriate to its class.

**Acceptance (EXC-T01–T08):** reviewed path/method inventory, allowed/denied credential, token lifecycle, no cross-scope privilege, owner review, risk/expiry marker, frontend/native regression and reapproval after changes.

### WA-STD-28 — Migration, rollback and independent-review gates [EXISTING OPEN GATES + PROPOSED DETAIL]

**Requirement:** Preserve independent design-engineer review as a mandatory gate after implementation/testing and before any merge/production choice (S6-014). Document schema and environment differences, backup/restore evidence, rehearsal of migration and rollback, TNNA installed-client continuity, and actual production deployment authorization as separate decisions. A review of this draft does not satisfy the final Stage 6 independent implementation review.

**Acceptance (RELEASE-T01–T08):** source freeze, reconciled R01–R20 and S6-001–041 matrix, DE6/R finding disposition, reviewed rollback, separate staging validation, independent sign-off, user approval, and verified post-deploy/restore plan. Production remains unchanged.


## 3. Explicit exceptions and compatibility registry — draft

| Exception ID | Scope | Why not uniform | Required invariant | Status |
|---|---|---|---|---|
| EX-FT-01 | Public Family Tree contact-email verification | Recipient may not be signed in | Exact GET/POST token paths only; no adjacent public route | `SRC`, tests incomplete |
| EX-FT-02 | Public Family Tree privacy approval | Link-driven email workflow | Exact public router; approval validation; no disclosure | `SRC`, tests incomplete |
| EX-FT-03 | Private Person API | Requires per-visit page token and redaction | Tree membership, `X-FT-Page-Token`, response privacy | `DOC`+`SRC`, broader S6-017 open |
| EX-FT-04 | Multipart image uploads | `FormData`, route-specific Multer | Authorization and privacy checks, correct multipart boundary | `DOC`+`SRC`, prior bounded tests |
| EX-NT-01 | Notification unsubscribe and network verification | Public bearer-link access | Token limited to intended notification/network action | `SRC`, full negative matrix open |
| EX-TN-01 | TNNA auth, refresh and version | Device credentials unlike browser cookies | Native client/device separation; secure revocation | `DOC`+`SRC`, native acceptance open |
| EX-AD-01 | Admin management | Distinct verified-admin and Origin checks | Authenticated web context and approved admin permissions | `SRC`, negative breadth open |
| EX-TR-01 | Tracking page/time uploads | Telemetry needs session-aware lifecycle | Authenticated writes; no unsafe retry or credential leak | `SRC`, S6-025 incomplete |
| EX-LEG-01 | Direct Bearer `fetch` in existing pages | Transitional compatibility | Explicit migration inventory; preserve unsaved forms | `SRC`, S6-005 open |

**Exception approvals:** None granted by this draft. Registry describes current architectural distinctions; whether any specific nonconformity is formally permitted requires user/design-review decision.

## 4. Evidence-backed implementation traceability matrix

| Requirement / status | Baseline source evidence | What is established | What is NOT established | Priority |
|---|---|---|---|---|
| WA-STD-01 `DOC + SRC` | [CLAUDE §17](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view); pinned SHA | Source/change review required | No guarantee local/Drive/Render equality | High |
| WA-STD-02 `SRC` | [`server.js` L123–189](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L123-L189) | Mount paths and notable public bypasses | Exhaustive endpoint catalogue not completed | High |
| WA-STD-03 `DOC + SRC` | [`subscriptionAccess.js` L8–33](https://github.com/sthink1/wapps/blob/b5e2b06/middleware/subscriptionAccess.js#L8-L33), [`server.js` L163–185](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L163-L185) | Shared auth/entitlement gates for major routes | Every internal object-level ownership path not proven | Critical |
| WA-STD-04 `SRC` | [`waPlatform.js` L110–141](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L110-L141), [`BinForm.html` L480–507](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/BinForm.html#L480-L507) | Shared facade exists; some direct Bearer calls persist | Full frontend adoption and semantics | High |
| WA-STD-05 `SRC` | [`waPlatform.js` L112–132](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L112-L132) | Mutations are not automatically replayed by shared facade | Direct fetch callers and real-world race cases | Critical |
| WA-STD-06 `SRC + TEST-HIST` | [`server.js` L199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215); [`stage6ExpectedClientError.js`](https://github.com/sthink1/wapps/blob/b5e2b06/services/stage6ExpectedClientError.js); [`users.js` L263–270](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263-L270) | Central 4xx fallback returns unmarked `.message`; handoff reports isolated unexpected 400/403 disclosure | Actual live sensitive disclosure not proven; R16-75 paused | Critical |
| WA-STD-06 `SRC` | [`budget.js` L77–92](https://github.com/sthink1/wapps/blob/b5e2b06/routes/budget.js#L77-L92); [`etf.js` L13–24](https://github.com/sthink1/wapps/blob/b5e2b06/routes/etf.js#L13-L24) | Distinct budget flag and ETF WeakSet alongside shared marker | These are not automatically unsafe; migration unapproved | High |
| WA-STD-07 `SRC` | [`waPlatform.js` L39–48](https://github.com/sthink1/wapps/blob/b5e2b06/httpdocs/js/waPlatform.js#L39-L48), [`server.js` L211–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L211-L215) | Nested central error response vs parser expecting string or top-level message | Runtime display for each caller not tested | High |
| WA-STD-08 `DOC + SRC` | [`server.js` L123–156](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L123-L156), [`track.js` L561–591](https://github.com/sthink1/wapps/blob/b5e2b06/routes/track.js#L561-L591) | Selected API mounts set no-store; sampled tracking error logs omit internals | Full log/cache disclosure review not done | High |
| WA-STD-09 `SRC` | [`server.js` L172–183](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L172-L183); [`notifications.js` L58–93](https://github.com/sthink1/wapps/blob/b5e2b06/routes/notifications.js#L58-L93) | Public path/method exceptions exist | Full token lifecycle and adversarial testing not complete | High |
| WA-STD-10 `DOC + SRC` | [`ftPrivacy.js` L102–130](https://github.com/sthink1/wapps/blob/b5e2b06/routes/ftPrivacy.js#L102-L130), [`familyTree.js` L8344–8405](https://github.com/sthink1/wapps/blob/b5e2b06/routes/familyTree.js#L8344-L8405) | Page-token gate/redaction and pet membership checks exist | Entire Family Tree surface not independently certified | Critical |
| WA-STD-11 `DOC + SRC` | [`tnna.js` L115–148](https://github.com/sthink1/wapps/blob/b5e2b06/routes/tnna.js#L115-L148); TechSummary §21 | Native version/verification endpoints separate | Full native replay/device tests pending | High |
| WA-STD-12 `DOC + SRC` | [`weights.js` L10–48](https://github.com/sthink1/wapps/blob/b5e2b06/routes/weights.js#L10-L48); [`utils.js` L30–36](https://github.com/sthink1/wapps/blob/b5e2b06/utils.js#L30-L36) | Parametrized, user-scoped sample; fixed DB error response | Comprehensive mutation/rollback coverage not established | High |
| WA-STD-13 `DOC` | Stage6_Render_TestPlan v2.3; Stage6_OpenItems rev3.3 | Bounded acceptance evidence and outstanding register | No new tests executed in this drafting step | High |
| WA-STD-14 `DOC` | Stage6_OpenItems S6-014/035; user's handoff | Independent review is an explicit release gate | No release approval conferred | Critical |

## 5. Review decisions required before treating this as policy

1. **Adopt authoritative standards model:** Should this be an independent `WA_Programming_Security_Standards.md` with references from `CLAUDE.md` and `TechSummary.md`, or should those documents themselves hold the complete normative wording? Recommendation for consideration: dedicated versioned standards + cross-reference, avoiding contradictory duplicate instructions.
2. **Choose intentional-error representation:** Existing shared WeakSet marker versus a versioned class/factory. Avoid silently assuming that untrusted `error.status` is safe.
3. **Select API error envelope and migration strategy:** Preserve current consumers until inventoried and tested; no blanket payload change.
4. **Implement the approved administrator design decision in documentation review:** WA-SEC-ADMIN-001 is already user-approved as a standard; independently verify current deployment and reconcile older TechSummary §6.7. **Approve endpoint classification and exception register:** Public tokens, Family Tree, TNNA, admin, tracking, and legacy direct fetch must be explicitly documented.
5. **Decide browser support and compatibility policy:** Web Locks fallback, token storage transition, cache/service worker version synchronization.
6. **Set minimum evidence gates:** Source review, safe synthetic failure tests, representative local and hosted checks, UI regressions, negative permission tests, independent design review.

No item above is an authorization to make a code or document change. A separate user decision is required to promote this draft to authoritative standards.

## 6. Implementation sequencing — proposal only

**Phase 0 — Baseline:** Reconcile GitHub pinned `b5e2b06` against authoritative current Drive source, current branch head and actual staging deployment (read-only). Record discrepancy before recommending edits.

**Phase 1 — Contract design:** Approve external error envelope, expected-error classification and access/exception catalog. Identify every consumer of existing error shapes and direct fetch paths. Map existing R16-74B and S6-041 findings; preserve R16-55–73A accepted evidence.

**Phase 2 — Controlled corrections after separate approval:** Design compatibility-safe changes as complete downloadable artifacts, not direct project edits. Central-handler issue R16-75 remains blocked until approved contract and impact review.

**Phase 3 — Verification:** Synthetic unexpected 400/403/500/503, expected validation and status tests, browser UI error parsing and preservation of form state, permissions, page token, multipart, TNNA scope, and no-unsafe-replay regression; targeted hosted staging only with user authorization.

**Phase 4 — Independent review and disposition:** Obtain independent design-engineer/security review after full Stage 6 test reconciliation; record disposition and user approval before `main` or production consideration.

## 7. Stage 6 historical test preservation and limits

Preserve completed bounded R10, R14 and R15 results; R16-55–62 Family Tree/Notifications/Subscriptions targeted sanitization; R16-63–66 privacy correction offline 11/11 plus staged checks; R16-68–70A tracking provider notes offline 6/6 and bounded HTTP checks; R16-71–73A refresh-session offline 11/11 and hosted no-cookie 401 `REFRESH_INVALID`. These are **handoff-reported prior results, not rerun in B7**. R16-74B central-handler synthetic unexpected 400/403 disclosure remains open; no real sensitive-data incident established. Do not add a new completion percentage.

## 8. Draft review checklist

- [ ] Confirm latest authoritative version of each existing `.md` and active implementation source.
- [ ] Validate entire endpoint inventory, not just representative routes.
- [ ] Cross-check required `UserID`, tree-membership, admin and subscription gates against handlers.
- [ ] Identify every frontend API caller and expected HTTP/JSON structure.
- [ ] List all explicit exception paths with owner, rationale and tests.
- [ ] Choose common expected-error classifier and public error contract with compatible rollout.
- [ ] Define safe logging, cache, and diagnostics policies.
- [ ] Check cross-tab session lifecycle, unauthorized mutations and unsaved forms.
- [ ] Review TNNA/mobile and Family Tree special contracts.
- [ ] Link each standard to tests and evidence; preserve bounded PASS records.
- [ ] Complete independent design-engineer/security review before any release decision.
- [ ] Obtain express user approval before adopting this draft or generating code revisions.


## 9. B6 finding disposition and requirements provenance

This table records incorporation into this **draft**, not approval of the proposed controls.

| B6 finding | B7 resolution | Approval / conformance status |
|---|---|---|
| B6-01 HTML formatting omitted | WA-STD-15 explicitly preserves TechSummary §14 | Existing documented rule; full source conformance not reviewed |
| B6-02 stale administrator description | WA-SEC-ADMIN-001, approved exact DB-plus-config standard | **Design approved by user**; TechSummary correction not installed |
| B6-03 TNNA issuance vs absolute cap | WA-STD-23 separates 180-day issuance and open S6-032 cap | Existing behavior documented; cap **undecided** |
| B6-04 unsafe retry/ambiguous delivery | WA-STD-18 plus WA-STD-05 | Proposed; tests incomplete |
| B6-05 Origin/CSRF cookie rules | WA-STD-16 | Proposed detail; S6-019 in progress |
| B6-06 challenge/token family lifecycle | WA-STD-17/18 | Proposed; open decisions retained |
| B6-07 access-token storage/XSS/CSP | WA-STD-19 | Proposed; S6-028 open |
| B6-08 SW/asset versioning | WA-STD-20 | Proposed; S6-024 open |
| B6-09 environment/rollback | WA-STD-21/28 | Proposed; S6-011/013/031 not closed |
| B6-10 proxy/rate limits | WA-STD-22 | Proposed; S6-012 in progress |
| B6-11 envelope not approved | WA-STD-26 explicitly **UNDECIDED** | No migration authorized |
| B6-12 marker trust | WA-STD-06/26 | Proposed; R16-75 paused |
| B6-13 exception sign-off details | WA-STD-25/27 and exception schema below | Proposal only |
| B6-14 shared frontend/source rules | WA-STD-15 + existing WA-STD-01/04 | Partial documented carry-forward; further style review needed |
| B6-15 DB/schema detail | WA-STD-24 | Proposed precision; no migration |
| B6-16+ remaining review issues | WA-STD-17–28 + authority, decisions and matrix | Requires next formal completeness assessment |

### 9.1 Normative provenance categories

- **Approved design:** `WA-SEC-ADMIN-001` only, as expressed in the user's current conversation.
- **Existing written mandatory requirements:** e.g. `CLAUDE.md` §11 ownership/validation/secrets; `TechSummary.md` §14 human-readable HTML/embedded CSS/JS; §17 design change procedure. Incorporation is not a claim that code satisfies them.
- **Observed pinned code:** application-specific middleware, expected-error markers, browser facade, and native token issuance. Observation is not policy adoption.
- **Proposed new specifications:** `WA-STD-01`–`WA-STD-28` insofar as they add precision or new controls; source of each named section identifies any documented predecessor.
- **Unresolved:** public API envelope, final error factory, browser compatibility matrix, replay containment, cookie-only logout, credential supersession, native absolute refresh cap, and release strategy.

## 10. Explicit unresolved design-decision register

| ID | Decision | Current status | Scope boundary |
|---|---|---|---|
| DEC-B7-01 | Dedicated governing standards file and how guides reference it | Open | No auto-overwrite of existing guides |
| DEC-B7-02 | Canonical public API error payload and code fields | Open | Preserve all current consumers until tested |
| DEC-B7-03 | Permanent trusted expected-error factory/class/marker | Open | Status alone never authorizes message disclosure |
| DEC-B7-04 | Administrator verification design | **APPROVED: WA-SEC-ADMIN-001** | DB `IsAdministrator=1` AND configured username match; no hard-coded ID |
| DEC-B7-05 | Web Locks unsupported-browser policy | Open | Fail safe; no false replay lockouts |
| DEC-B7-06 | Native absolute refresh lifetime cap | Open — S6-032 | 180-day issuance unchanged until separate approval |
| DEC-B7-07 | Web refresh family replay and session supersession | Open | Must preserve legitimate tabs and existing sessions |
| DEC-B7-08 | Cookie-only logout and uncertain server revocation | Open | Never claim revocation without confirmation |
| DEC-B7-09 | Supported browser/test matrix | Open | DuckDuckGo native browser, Chrome, Edge, Firefox; TNNA separate |
| DEC-B7-10 | Scope, owners and approval of exceptions | Open | Draft examples do not authorize bypasses |
| DEC-B7-11 | Standards adoption date and documentation installation | Open | User manual installation; Drive/GitHub read-only |
| DEC-B7-12 | Full Stage 6 implementation completion, independent review and release | Open | No merge or production authorization |

## 11. Exception record template (mandatory before approval of an exception)

| Field | Required value |
|---|---|
| Exception ID / version | Stable `WA-EX-*` number and revision |
| Exact scope | Repository path, route method/path or page identifier; identify environment |
| Default standard | Named `WA-STD-*` / `WA-SEC-ADMIN-001` requirement being varied |
| Justification | Functional or security necessity, not simply historical habit |
| Preserved controls | Auth, subscription, ownership, token integrity, Origin, response sanitization, cache, logs |
| Owner / independent reviewer | Named roles; actual identities assigned only by project authority |
| Security/compatibility risk | Specific expected failure modes |
| Test IDs / evidence | Offline, local, staged, native and regression references as applicable |
| Approval state / date | Draft, approved, rejected or expired; explicit sign-off |
| Review trigger | Relevant source/contract change, security finding, or scheduled reconsideration |

## 12. Minimum implementation-review and documentation correction plan (not authorization)

1. **Approve standards text by subsection**, preserving the separately approved administrator rule and explicitly deferring undecided policy choices.
2. **Reconcile authoritative guide conflicts**: first TechSummary §6.7 administrative recognition; then any stale descriptions of new Stage 6 error, session and privacy behavior. Propose *separate downloadable, complete replacement files* if the user authorizes preparation; never edit Drive/GitHub/local project source in place.
3. **Build exhaustive endpoint-to-consumer annex** covering each method, authentication/authorization, record owner, response schema, Origin, cache, native usage and regression evidence; B4 was representative, not exhaustive.
4. **Reconcile code provenance** among authoritative Drive files, user local worktree if made available, pinned `b5e2b06` and current staging before any suggested functional patch.
5. **Only after contract approval** design R16-75 safety correction, with synthetic unexpected 400/403 and successful expected-error/legacy-client regressions. Do not apply it while paused.
6. **Maintain independent final Stage 6 design review, production migration/rollback and explicit user sign-off** as distinct later gates.

## 13. Formal completion record for Step B7

**Deliverable:** complete Version 0.2 **draft** standards document; no edits to current authority, source code, services, staging or production. The administrator rule is approved as a design standard; adoption of the full document and implementation conformance are not certified. Previously completed bounded R10/R14/R15 and R16 accepted results remain unchanged. R16-74B source-level unexpected 4xx disclosure is still open; R16-75 remains paused. No evidence of a live sensitive-data incident is asserted.

---

**Final B7 disposition:** **VERSION 0.2 DRAFT PREPARED FOR TECHNICAL REVIEW, NOT APPROVED AS A WHOLE.** User-approved administrator rule WA-SEC-ADMIN-001 is the only newly adopted substantive design decision. Code implementation has not been certified to conform to these standards. R16-75 remains paused. All inspection was read-only; the only new artifact is this standalone Markdown report outside the user's project repositories and folders.
