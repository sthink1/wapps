# Wonderful Apps — Detailed Technical Programming and Security Standards

**Document:** `WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md`  
**Version:** 0.4.1 — **CONSOLIDATED STEP 3A/3B/3C REVIEW DRAFT; NOT ADOPTED AS A WHOLE**  
**Prepared:** November 12, 2026  
**Step:** Phase 1, Step 3 — detailed standardization before generation of Step 2 Core Standards  
**Development basis:** Step 3 v0.4, B9 draft v0.3, both independent design-engineer reports, owner-approved D01–D14 Decision Register v1.0, and the **subsequent explicit owner approvals of Step 3A, revised Step 3B, and Step 3C** (November 12, 2026).  
**Authority:** D01–D14 and approved 3A/3B/3C clarifications are owner decisions. **This consolidated document as a whole is submitted for separate owner approval**; it is not an installed governing replacement, code-conformance certificate, or permission to implement.  
**Operating restriction:** No changes to authoritative Google Drive, GitHub, local WA files, servers, databases, staging, or production. Proposed replacements must be delivered separately for owner review and manual installation.

## 1. Purpose, use and approval boundaries

This detailed document is the **technical reference** supporting a future short `WA_Core_Programming_Standards` document. The Core document will identify approximately 12 daily invariants and refer to the stable requirement IDs in this specification. **Step 2 must not be generated, installed, or treated as approved yet.** There is no independent permission to modify source simply because an approved policy is reflected here.

### 1.1 Distinguish four statuses

- **Approved policy:** Explicitly agreed by the owner (D01–D14) or established existing project rules. This is a design mandate, **not** implementation certification.
- **Draft specification:** Detailed instructions in this document awaiting owner review, including proposed test and migration mechanics.
- **Implementation observation:** A particular file/commit contains code with stated behavior; a source observation is not an executed test.
- **Verification:** A particular test was executed against a pinned code and environment, with defined assertions and outcomes. Bounded passes do not confer project-wide compliance.

Record each material finding as `APPROVED-POLICY`, `EXISTING-DOC`, `PROPOSED-DETAIL`, `DEFERRED`, `IMPLEMENTED-UNVERIFIED`, `TEST-PASS-BOUNDED`, `TEST-FAIL`, or `OPEN-TECHNICAL-DESIGN` as applicable. Do not merge these dimensions into a single “complete” label.

### 1.2 Precedence and source authority

For approved future development: (1) explicit current owner decisions; (2) approved standards and approved exceptions; (3) approved application/endpoint contracts consistent with global safety requirements; (4) pre-existing `CLAUDE.md`/`TechSummary.md` requirements that do not conflict; (5) observed code and tests as evidence of implementation, not as substitutes for policy. If two approved sources conflict, **stop the affected work** and seek an explicit resolution. Do not use modification timestamp alone as a policy precedence rule.

Google Drive `My Drive/wonderfulApp` is the authoritative WA project source. GitHub may be inspected **read-only**. Local WA project files are **read-only** to ChatGPT and engineers. Exact source baseline, paths, branch/commit, file hashes where accessible, schema identity, and applicable staging deployment are prerequisites for proposing source changes. The pinned historical GitHub `b5e2b06` and the engineer's later inspected `a53f7ef` are evidence baselines, not claims of present deployment.

### 1.3 Daily discovery and instruction routing — proposed detail

**Approved 3C-05 discovery requirement:** A proposed root `README.md` must prominently direct every human/AI developer to the approved Core Standards, this detailed specification, the decision register, `CLAUDE.md`, and `TechSummary.md` **before** starting work. The README is a proposed **separate deliverable**, not automatically installed or automatically read by every tool. Compatible AI instruction mechanisms should point to the same canonical sources. Merely placing a README in a folder **does not guarantee** automatic ingestion by an IDE or coding assistant; explicit task kickoff acknowledgement, review evidence and test gates are required. Do not create a competing copy of the detailed rules in multiple instruction files. Confirm the project's existing root README and AI-instruction files before proposing replacement; do not overwrite or truncate unrelated content.

### 1.4 Approval records

Each standards approval must identify exact version, section/ID, effective date, owner authorization, known exceptions, and required future engineering work. Each code change must separately identify approved scope, current-source provenance, affected consumers, test plan, final diff and rollback. Final Stage 6 independent implementation review is **separate** from this standards review and remains mandatory before merge/release.

## 2. Numbered governing technical requirements

**Use of MUST:** Within this **draft**, MUST expresses the proposed normative text for review. It does not turn an unapproved proposed detail into existing authority. Source-backed obligations and owner-approved decisions are marked explicitly.

### WA-PRESERVE-001 — Preserve existing functionality, behavior and appearance

**Basis:** Owner-approved Step 3A primary preservation and comparison requirements, including the two approved clarifications. Detailed language consolidated here for full-document review. **Scope:** All changes to existing WA source, documentation affecting execution, assets, styles, schemas, or shared components.

1. The implementer **MUST change only the behavior and appearance expressly approved by the owner**, including necessary supporting changes separately identified and approved. An apparently superior redesign is not authorization.
2. Preserve all other features, calculations, input/output interfaces, layouts, fonts, colors, spacing, navigation, controls, accessibility behavior, responsive layouts, browser/native flows, error behavior, authentication, and database operations.
3. Identify plausible effects on shared services, dependent pages, routes, consumers, caches, build artifacts and external interfaces. Preserve application-specific rules, particularly Family Tree privacy and TNNA.
4. For **every revised existing file**, establish the exact authoritative original before editing. Compare the **complete final delivered file** against that original, not merely an interim draft. Every textual difference—addition, deletion, rewrite and moved block—must be reviewed; classify each as approved functional change, approved support, or formatting-only. Unexplained/unapproved changes block delivery.
5. Provide a per-file machine-readable unified `.diff` or demonstrably equivalent complete comparison and a concise `.md` change-verification summary, **including one-line fixes**. The report names baseline paths/hashes where available, final artifact identifier, approved change IDs, differences, impact and tests. **The exact final delivered file MUST be identified by a SHA-256 hash, recorded in its verification summary and checked after final packaging.** The final artifact must be byte-for-byte the file compared in the report.
6. If authoritative source changes during preparation, **stop and rebase/reconcile**; never install a proposal based on an obsolete file in a way that loses intervening work.
7. Formatting-only edits must be separated visibly from behavioral edits. Do not reformat unrelated code while fixing a small issue merely to improve style. **Existing `TechSummary.md` §14 requires whole-file HTML formatting when an HTML file is edited.** Follow that requirement where applicable, while keeping formatting-only differences individually identifiable and separately reviewed and approved when outside the substantive change scope. Preserve whitespace-sensitive content, script behavior, IDs, and visible appearance. Never use formatter output to obscure functional changes.
8. Textual diff is **not proof of unchanged runtime behavior or UI**. Select functional, visual, API and regression checks proportionate to the change. Record any changes that cannot be verified; never claim equivalence based solely on appearance of the diff.

**Acceptance:** Complete original/final comparison for each changed file; every substantive hunk traceable to authorization; formatting hunks accounted for; current baseline reconciled; targeted before/after behavioral evidence; no unapproved changes. Deliverable includes proposed full revised file, `.diff` and verification summary. These deliverables are required by approved Step 3A; the consolidated wording remains subject to the full-document adoption gate.

### WA-FORMAT-001 — Pretty formatting of all new and revised source

**Basis:** Existing mandatory full readable HTML standard (`TechSummary.md` §14), plus owner-approved Step 3A extension to all **new** source files and reconciliation of whole-file HTML formatting with authorized-diff review.

1. All **new** hand-maintained source files (HTML, CSS, JS, SQL, JSON, PowerShell, shell, Java, Markdown and other applicable formats) **MUST be consistently indented, human-readable and sensibly organized**; follow project language conventions and syntactically valid structures.
2. New authored source must not be delivered minified, compressed into one long line or obfuscated. Generated/minified distribution artifacts are distinct from authoritative hand-maintained source and require a documented exception/build provenance.
3. Preserve readable nested HTML tags, embedded JS/CSS, attributes, identifiers, script order, form names and IDs, selectors, URLs, events, and light-mode requirements. The existing HTML readability requirement is not weakened.
4. Revised files must remain readable; avoid discretionary unrelated reformatting and separately account for **every** formatting-only difference under WA-PRESERVE-001. **For existing HTML, preserve the already-mandatory whole-file formatting rule** while obtaining separate review and approval of out-of-scope formatting differences. Applying a formatter does not authorize semantic changes.
5. Perform parse/syntax validation and examine whitespace-sensitive regions (visible text, `<pre>` content, scripts/template strings, inline styles, and DOM sequencing) where relevant.

**Acceptance:** New source readable and syntax-valid; revised file diff separately identifies formatting; approved behavior/appearance unchanged except as explicitly authorized.

### WA-SEC-ADMIN-001 — Verified administrator recognition and permission scope

**Basis:** Approved administrator identity policy and **D01**, with separate **D02** transfer decision.

For an ordinary administrator identity decision, use `services/administratorAccess.js` to query the authenticated user's current `UsersT` row by their authenticated `UserID`. Authorization requires **both** (a) `IsAdministrator = 1` and (b) current database `UserName` matching `ADMIN_USERNAME` after case-insensitive/trimmed comparison. Missing configuration, missing row, denied designation, mismatch or verification failure must not grant privilege. Hard-coded IDs, a username alone, a JWT claim alone, a plan, or a UI control are not administrator recognition. Use the current authoritative DB connection/transaction where privileged mutations require in-transaction revalidation.

**D01 + revised Step 3B-01 approved scope:** A centrally verified WA administrator has **full Family Tree administrative privileges**, including viewing private/restricted information and **creating, modifying, deleting, transferring ownership of records, and managing privacy settings/codes** without ordinary-user privacy-code or ownership barriers. This is an explicit owner-approved administrative authority, **not merely read-only access**. All affected endpoints must implement the two-gate recognition rule. Administrative operations **still MUST satisfy input validity, referential integrity, required relationship rules, atomic transactions/locking, external-object cleanup, consistent auditing, and safe error handling**. Do not treat full Family Tree privileges as blanket authorization for unrelated systems, account credential changes, or bypass of essential data-integrity controls. Record precise action/method coverage in Annex A; approval of the policy does not certify all current routes or authorize new interfaces automatically.

**Known source discrepancy:** `routes/ftPrivacy.js` in the engineer-inspected baseline contains a username-only `sthink` check, contrary to this rule. Record as **nonconforming source**, not a demonstrated exploit. Prepare a separate scoped correction when authorized; positive/negative tests must prove D01 full private-data viewing for a verified admin while rejecting an unverified same-username account.

**D02 transfer exception:** Current pending/cancel/complete administrator transfer workflow is preserved pending targeted review. Transfer completion can occur when configured username already points to the successor; it may need a **separate explicitly authorized, transaction-validated transfer capability** rather than ordinary current-admin identity recognition for the initiating account. Define initiator and target binding, state continuity, Origin/cookie scope, expiry, replay, cancellation, atomic state changes and recovery. Do not treat transfer completion as a general admin bypass.

**Acceptance:** Matrix testing no row, flag 0, wrong configured name, DB failure, valid both-gate identity; **positive verified-admin create/read/update/delete/privacy-management/record-ownership-transfer tests**; negative former-username and non-admin cross-user/Tree cases; relationship/transaction/audit and rollback assertions; transfer-workflow capability authorization and replay/expiry/wrong-actor denial with no unauthorized DB write.

### WA-CORE-001 — Provenance, scope, source isolation and review gates

**Basis:** Existing `CLAUDE.md` change-control procedure, D13/D14 and WA-PRESERVE-001.

Before authoring changes, list task authorization, current source provenance, exact original files, dependencies, route/method consumers, migration/rollback, privacy or schema effects, user-visible intended changes, and compatible browsers/TNNA. Treat Drive as authoritative. When current Drive/local/GitHub/staging differ, document each and seek resolution; never assume SHA equality from historical reports. Read access is permitted; project mutation is not. Produce separate downloadable proposal files. No automatic repository/production/staging edits. Review complete diffs and test results before owner installation approval.

**Acceptance:** Change-review packet with source baseline, impact map, per-file diff/summary and approval record. The fact that a document is a draft or a code file already implements something is not an authorization to change it.

### WA-API-001 — Endpoint classification, authorization and ownership

**Basis:** Pre-existing ownership/auth requirements; D01/D02; both independent reports.

Every HTTP **method plus path** must have an explicit multi-dimensional contract: public or credentialed mode; credential kind (web bearer, cookie refresh, public link capability, native); authorized client scope; app subscription if applicable; administrator permission; user/Tree/Person ownership or membership; privacy and domain checks; request/response shape; Origin/CSRF; rate limits; cache sensitivity; and actual known consumers. These dimensions are **not mutually exclusive categories**. Fail closed on absent or invalid credentials. Subscription entitlement or hidden UI controls do not replace record ownership checks. A centrally verified administrator receives **D01 and revised 3B-01 full Family Tree CRUD, privacy-management and record-ownership-transfer authority**, subject to operation-specific integrity/transaction safeguards; no such grant automatically applies to unrelated WA applications.

The registry must include mounted routers, dynamically generated Budget routes, recovery/reset and public capability paths, `/send-email`, `/api/geocode/reverse`, Family Tree routes/uploads, administrator transfer and TNNA endpoints. A read-only generated router inventory may assist, but routing order, runtime configuration and consumer call paths require verification. An illustrative list is not full certification.

**Acceptance:** Every in-scope endpoint/method inventoried, negative access and cross-user/cross-tree tests, no unauthorized writes, consumer mapping, owners and evidence. During incremental adoption, mark unassessed methods `UNVERIFIED` rather than silently claiming project-wide conformance.

### WA-AUTH-001 — Authentication and credential boundaries

**Basis:** Existing code/guide requirements; D08/D09/D10.

Use approved authentication middleware and server-side session/security-version controls; preserve separation among browser bearer tokens, HttpOnly browser refresh cookies, public capability tokens, and TNNA device credentials. Never grant web administrator status from native/public-link credentials. Password verification, registration, login-code verification, logout and recovery changes require explicit frontend/backend compatibility cases. A credential validated for one client scope must not be accepted as an unrelated credential class.

**D08 target direction (approved, mechanism unresolved):** Eliminate unnecessary **persistent JavaScript-readable access-token storage**, including legacy `localStorage` where practical. Evaluate memory-held short-lived access tokens with HttpOnly refresh cookies versus other architectures. Select a final design **only after** resolving navigation, browser-restoration, cross-tab, offline, csrf, PWA, all-app usage tracking, Family Tree and D07 support; retain existing behavior until approved migration. Do not treat the candidate as the already approved implementation.

**Acceptance:** Scope-mismatch denials, revoked/expired credential handling, no accidental session resurrection or token leakage, and explicit migration regression tests before claiming D08 compliance.

### WA-SESSION-001 — Browser session state, replay, logout and retry

**Basis:** D07/D08/D09 and Stage 6 outstanding S6-002/006/007/008/018/020/021/027.

Use shared `WA.session` / `WA.api` for compatible new work, and migrate legacy pages in measured groups; retaining a legacy direct `fetch` call is a tracked migration item, not automatically a vulnerability. Explicitly map what changes if a page loads the library versus actually calls it. Separate token restoration **before send** from retry **after transmission**. **Never automatically replay a POST/PUT/PATCH/DELETE mutation** after ambiguous delivery. Distinguish 401 credential failure, 403 authorization/subscription denial, network outage, 5xx/503 and cancellation. Preserve unsaved user input and relevant business error fields.

**D09 approved behavior:** Multiple independent device sessions; refresh-token rotation; rejection of consumed credentials; confirmed replay containment to affected session/family without unnecessary unrelated-device revocation; safe coordination across same-browser tabs; verified new login supersedes earlier remembered browser session only after success; failed login leaves prior valid session intact; no late refresh restoring a logged-out/previous account. Precisely define replay/race thresholds and session transaction model **before implementation**. Failed/offline server revocation must not be reported as confirmed. No browser path may bypass the fail-closed Web Locks requirement without separate approval.

**D07 official scope:** Current Chrome, Edge, Firefox, DuckDuckGo for Windows; Safari on macOS/iPhone/iPad; Chrome on Android. Account for Apple cookie/privacy behavior, Home Screen PWA, browser restart and unsupported Locks. These are **supported-target requirements** rather than already completed acceptance test results.

**Acceptance:** GET/HEAD guarded reauthorization, mutation no-replay, 401/403/503, forced revocation, cross-tab race, different-account response, remembered/unremembered browser restart, offline/logout uncertainty, lock absence and named-browser matrix.

### WA-ERROR-001 — Controlled expected-error creation; safe unexpected errors

**Basis:** D03, D05; historical R16-74B failure; Codex DE-02/05 and Claude F1.

The central classification mechanism must use the approved shared `WeakSet` in `services/stage6ExpectedClientError.js` with a **controlled creator/factory** for deliberately expected client errors. Approved public error fields must originate in enumerated validation or business outcomes, be bounded/known safe, and not copy arbitrary caught exceptions. A marker is provenance, **not a sanitizer**. An HTTP status of 400–499, a `status` property, or an arbitrary `error.message` is never sufficient proof that a message is safe. Unexpected exceptions must receive a fixed generic public message regardless of attached 4xx/5xx status, without leaking paths, SQL, credentials, stacks, provider messages, tokens or private records.

Preserve documented response status semantics and compatible legacy JSON *for the narrow R16-75 package*; do not bundle a wholesale move to flat API errors. Define already-sent response handling (`res.headersSent`), safe diagnostics and parser/pre-route error coverage. Route-specific direct-response catches and upload exceptions must be inventoried; central-handler correction does not close them automatically.

**D05:** Only the **preparation** of narrowly scoped R16-75 complete-file proposals/tests/rollback has been approved. R16-75 has **not been installed, rerun or certified** by these policy decisions.

**Acceptance:** Synthetic unmarked errors at 400/401/403/409/500/503 must hide a unique internal marker in body; deliberate approved validation errors remain meaningful; status/body compatibility preserved as separately specified; no duplicate response after headers; pre-router failures safe; non-central catch audit tracked.

### WA-API-002 — Flat future errors and transitional client interoperability

**Basis:** D04; engineer findings on `WA.api` nested parsing.

**Approved future format:** New/migrated JSON error responses should use `{ "error": "Safe public text", "code": "OPTIONAL_STABLE_CODE" }` subject to existing consumer compatibility and owner-approved exceptions. `error` is a string; `code` is an optional string. D04 approves gradual migration, **not a breaking change to every legacy endpoint**. Preserve existing application-specific fields where required (e.g. domain validation reason or subscription metadata).

A shared client parser must accept supported legacy `message` string, `error` string, nested `error.message` string and documented code fields **with explicit type checks**, no arbitrary object coercion and a deterministic safe fallback. Preserve raw-`Response` ownership, 204/no-content behavior, non-JSON/malformed JSON cases, cancellation versus network failure, and no success classification of non-2xx business errors. Treat server-originated display strings as untrusted text, not HTML. Inventory consumers depending on nested `error.message` **before** changing any producer. Never change success shapes as a side effect of the error migration.

**Known source observation:** `httpdocs/js/waPlatform.js` at reviewed baseline may convert nested error objects to `[object Object]`. No claim of tested user-visible effects from source observation alone.

**Acceptance:** Cross-product parser matrix for all known error shapes, no object-string coercion, optional `code`, application field preservation, invalid JSON and 204, GET/retry/unsafe mutation behavior; per-route consumer regression before migrating that route.

### WA-PRIV-001 — Public capability tokens, cookies, CSRF and origin

**Basis:** Existing privacy/access rules, Stage 6 S6-017/019/029, Codex review.

For every public bearer link (email verification, privacy approval, notification verification/unsubscribe, reset, etc.), define purpose, allowed GET preview/POST mutation, entropy, token-hash storage for sufficiently random capabilities where required, expiry, one-time/reuse behavior, referer/referrer/log exposure, token audience and rate-limit policy. Avoid generic “all tokens one-time” rules that would break deliberate repeated GET page views. Do not mistake a browser `Origin` header or CORS response for identity authentication. Classify cookie-authorized state mutations separately; protect their Origin/CSRF and `HttpOnly`/`Secure`/`SameSite` attributes. Avoid accidentally forcing browser-only header requirements on native or public-link consumers. Distinguish error-response caching and public-token URL leakage.

**Acceptance:** Unauthenticated access allowed only for explicitly listed capability methods; forged/wrong/expired/replayed token denial; browser cross-origin cookie attacks rejected; link GET doesn't unexpectedly perform mutations; existing public-email workflows preserved.

### WA-PRIV-002 — Family Tree privacy, private-data administration and uploads

**Basis:** D01/D06, existing Family Tree behavior and S6-017.

Preserve Tree/Person membership, row-level ownership, nested private-person redaction, deliberate 423 `PRIVATE_LOCKED` states, `X-FT-Page-Token` scope, public email verification, privacy approval and `multipart/form-data` upload handling. Do not indiscriminately replace `window.fetch` interception; `waPlatform.js` can capture a bound fetch before the privacy wrapper is installed. Define an explicit approved page-token injection rule and restrict token forwarding to the intended same origin and route. Test actual call composition, navigation, reopening, reload and image lifecycle.

**D01 / approved 3B-01:** A valid centrally verified administrator has **full Family Tree privileges**: read private records, create/update/delete records, manage privacy settings/codes and transfer Family Tree record ownership without ordinary-user privacy-key or ownership restrictions. Every route performing these actions must rely on the centralized two-gate administrator recognition service; no username-only local fallback. Preserve domain validation, relationship integrity, locking/transactions, audit logging and external cleanup; the approval does not certify current implementation coverage.

**D06 owner-approved usability policy:** Human-memorable Family Tree privacy codes may be **four characters** and must remain easily set and recoverable. No mandatory code hashing/encryption; do **not** force a code change if forgotten. A recovery procedure may deliver the existing code **only to the registered verified email** after appropriate request-authority verification. Preserve all existing codes when changing code. Document expressly that application-readable four-character secrets present a residual database-disclosure and online-guessing risk. Use reasonable attempt controls, audit and code-exposure hygiene; do not promise that these controls eliminate the accepted risk. **Do not apply this human-selected-code policy to high-entropy email/page capability tokens.**

**Acceptance:** Verified-admin positive read/create/update/delete/record-ownership-transfer/privacy-code and setting cases, each with data-integrity and audit assertions; negative former-name/flag-0 cases; non-admin private-person redaction and cross-Tree denial; valid page-token unlock and expiry; authorized registered-email existing-code recovery; guessing/attempt protections; multipart upload/reload/delete with unchanged intended behavior. No runtime PASS is claimed here.

### WA-NATIVE-001 — TNNA native session continuity

**Basis:** Existing `CLAUDE.md` TNNA design; D10.

Preserve TNNA's documented 8-hour access JWT, 180-day renewable/rotated refresh credential issuance, server-side hashed refresh-token state, device identification, Android Keystore-backed AES-GCM storage, server revocation/secure logout and conditional offline mode up to 30 days after successful online authentication when network/server refresh is unavailable (not when the server returns 401). **D10 expressly declines a new absolute lifetime cap at this time**. D08's browser storage redesign is not authorization to alter native credential storage or installed-device behavior.

**Acceptance:** Web/native scope isolation, code verification, rotation and consumed-token denial, device continuity/restart, offline allowance versus rejected 401, server logout/password-change effects, updated APK continuity where separately authorized. Existing device acceptance status is not inferred from server HTTP tests.

### WA-DATA-001 — Database correctness, compatibility and external effects

**Basis:** Existing guides and Codex DE-12.

Apply validated inputs, parameterized SQL values, trusted allowlisted dynamic SQL identifiers, user/Tree/Person authorization on every data path, affected-row checks, explicit transactions for complete logical work, concurrency/lock-order and rollback controls. Preserve documented lowest supported MySQL compatibility until explicitly revised; use current schema snapshot and migration plan, not guesses about provider version. Preserve UTC connection/session semantics and distinguish calendar dates from instants. Connection pooling, query limits, cleanup capacity and external-service deadlines must respect documented hosting budgets. DB transactions cannot atomically roll back email or object-store effects; specify commit order, failed external action reporting and compensating cleanup. Do not expose hidden-record existence through error-message translation.

**Acceptance:** Real test-schema positive/negative mutations, exact row counts, rollback/concurrency and no cross-user leakage; separate migration and environment approval before production.

### WA-FRONT-001 — Frontend preservation, safe rendering and accessibility

**Basis:** Existing `CLAUDE.md` §§11/14 and `TechSummary.md` §§11/14/15; WA-PRESERVE-001, WA-FORMAT-001, Codex DE-07.

Keep existing mandatory shared sanitizer behavior for reusable free-text inputs and context-appropriate safe rendering of untrusted user/database/provider content; escaping/sanitization in the browser does **not** replace backend authorization, validation and SQL safety. Preserve passwords byte-for-byte; do not apply generic free-text sanitization to password inputs. Validate URL attributes and do not inject untrusted server messages as executable HTML. Preserve currently required light-mode behavior, field IDs, selectors, events, keyboard navigation, focus and error announcements where applicable. Third-party script provenance, CSP compatibility and the D08 token-storage exposure are separate planned improvements. Formatting requirements are governed by WA-FORMAT-001; no unilateral redesign under “cleanup.”

**Acceptance:** Source/static rendering checks and applicable browser DOM, visual, keyboard/focus, input and regression cases on affected pages.

### WA-SHARED-001 — Shared helpers, adoption, and domain-specific exceptions

**Basis:** D12/D13, B9 and both independent reviews.

Prefer approved common auth, error, admin and session components rather than copy/paste implementations; specify contracts for callers, return/error semantics, consumer ownership and rollout. Shared transport migration must not bypass Family Tree token headers, native client separation, usage tracking, unload/beacon requirements or multipart boundaries. A script being loaded/imported does **not** prove it is actually used. Permit legitimate domain-specific adapters with stated contract and tests; flag true departures from mandatory safety invariants as exceptions requiring owner approval.

**Acceptance:** Inventory both producers and consumers, targeted representative path before mass migration, no regression in authorization or compatibility, and explicit status for remaining legacy paths.

### WA-LOG-001 — Secret-free diagnostics, browser console and error surfaces

**Basis:** Existing explicit do-not-log-secrets rules and Stage 6 S6-030.

Do not log or return passwords, JWT/access/refresh tokens, public link tokens, API/DB secrets, private codes or records, raw sensitive URLs/query strings, raw error messages known to contain sensitive data or provider details. Prefer sanitized event class, status, route **template**, nonsecret correlation ID and timestamp. Test application logs, browser console, delivery diagnostics and test artifacts; redact before sharing. Define retention and personal-data deletion under a separate approved operational rule; don't claim such policy approved merely because it is mentioned here.

**Acceptance:** Source and scoped runtime scan, synthetic secret marker absent in client output/log evidence; sufficient non-sensitive diagnostic breadcrumbs remain.

### WA-CACHE-001 — Sensitive response caching and PWA asset consistency

**Basis:** Stage 6 cache guards, S6-024, Codex DE-10 and Claude F5.

Set appropriate no-store behavior for authenticated/private/sensitive routes and **failure paths including errors before route mounts** (e.g. malformed JSON and parser size failures). Test actual middleware ordering and intermediary/browser cache responses; service-worker Cache Storage is a separate boundary. Version dependent HTML, JS and `sw.js` as a tested deployment unit or use a compatible equivalent policy. Stale clients must not revive invalid credentials or replay mutations. Document approved old/new asset compatibility and rollback. Changes to static-file cache policy must preserve intended offline/PWA behavior.

**Acceptance:** Positive and error response headers, pre-mount failure, stale-client permutations, service-worker update/rollback and privacy no-cache checks.

### WA-ENV-001 — Environment identity, build, dependencies and publication

**Basis:** Existing Stage 6 environment safeguards, Codex DE-12/14 and Claude F8.

Document supported Node/npm/Express/Capacitor/Java/Gradle/database runtime targets from **verified current files**, lockfile installation practices, dependency/vulnerability/license review, build artifact and native signing provenance. Environment startup must verify explicitly expected DB/schema identity, UTC settings, allowed Origins/cookie profile and secret separation. A test-only guard is not an approved production deployment configuration. Review publicly served `httpdocs` for backup `*_COPY` and other artifacts; inventory and separately authorize any exclusion/removal, without claiming reachability unless actually tested. Establish connection, queue, outbound-request and response-size budgets. Never use staging or production for experimentation without separate permission.

**Acceptance:** Source/version manifests, startup negative tests, static-publication inventory, package/build consistency and documented environment-bound rollback; no unapproved production contact.

### WA-ABUSE-001 — Credential and service abuse protections; explicit D11 deferral

**Basis:** Existing login/reset security requirements and Stage 6 S6-012/022/029; D11.

For credential and privileged flows, define login-code entropy, attempts, resend/reset rate limiting, password-change validation, web/TNNA challenge scope, proxy client-IP trust and race-safe cleanup as applicable. **D11 expressly preserves current behavior** of public `/api/geocode/reverse` and `/send-email`, and **defers** additional geocode/email input validation, caching, rate-limiting and timeout hardening. Engineers' concerns remain tracked as findings, not verified resolved or silently approved implementation work. This deferral does not authorize removal of existing controls or making a public endpoint an unrestricted security exception. If newly discovered risks materially change the decision, seek owner review.

**Acceptance:** Credential flow tests under separately authorized environments; public-service hardening status explicitly `DEFERRED-D11` until revisited.

### WA-REVIEW-001 — Compliance evidence, exceptions and release decisions

**Basis:** D12–D14 and pre-existing Stage 6 independent review requirement.

For **every** proposed code change: document applicable Core/detailed IDs, exact file baseline, approved scope, affected modules and consumers, ownership/data risks, expected visual/behavioral changes, complete final `.diff` and per-file change-verification summary, test evidence, rollback and approval status. Use curated offline no-network/no-project-write checks where possible; run local/integration/browser/native/hosted cases only with separate environment authorization. A named test ID is not “passed” without fixture, stimulus, expected/actual, code/environment identity and result. Security boundary changes need explicit negative/failure-path tests. Preserve historical R10/R14/R15 and targeted R16 results as bounded evidence; do not automatically close broader S6 items. Any previously passing test impacted by changed shared code must be reassessed and rerun as justified.

Exceptions must identify rule, affected route/file, reason, compensating controls, owner, expiry/review trigger and approval. Deferred controls and accepted residual risks must not be represented as implemented. Approval to prepare a package is **not** approval to install it; standards approval is **not** project conformance certification; final Stage 6 implementation approval requires its own independent engineering review and owner sign-off.

## 3. Policy decision reconciliation — D01–D14

The companion authoritative **owner-approved decision record** is `WA_Standards_Decision_Register_v1.0_2026-11-12.md`. The following table is an implementation mapping, not a new vote.

| Decision | Owner-approved direction | Detailed standards | Remaining engineering work |
|---|---|---|---|
| D01 + 3B-01 | Full verified-administrator Family Tree privileges: view, create, modify, delete, transfer record ownership, manage privacy | ADMIN, PRIV-002, API-001, DATA-001 | Replace username-only privacy recognition and audit all privileged routes; test transactions and integrity without ordinary-user access barriers |
| D02 | Preserve administrator transfer workflow, security review | ADMIN, API-001 | Bound transfer capability/transaction and recovery |
| D03 | Shared WeakSet expected-error provenance, controlled creator | ERROR-001 | Creator contract, caller inventory and tests |
| D04 | Flat future JSON error, gradual migration and compatibility | API-002 | Consumer inventory and transitional parser testing |
| D05 | Prepare narrow R16-75 package only | ERROR-001, REVIEW-001 | Separate deliverable and explicit implementation approval |
| D06 | Short recoverable privacy codes, no required encryption or forced reset | PRIV-002, LOG-001 | Registered-email recovery/guessing safeguards and residual-risk record |
| D07 | Windows Chrome/Edge/Firefox/DuckDuckGo, Apple Safari, Android Chrome; fail closed | SESSION-001 | Browser/device matrix, including PWA and Web Locks unavailable |
| D08 | Remove unnecessary persistent JS-readable token storage as long-term goal | AUTH-001, SESSION-001, FRONT-001 | Choose final architecture after compatibility design |
| D09 | Multi-device, rotation, replay containment, safe tabs, same-browser supersession | SESSION-001 | Precise race/token-family rules and concurrency cases |
| D10 | Preserve TNNA native lifetime and offline policy; no new cap | NATIVE-001 | Device regression for shared server changes |
| D11 | Preserve public geocode/mail behavior, defer safeguards | ABUSE-001 | Keep findings open; no hardening without new approval |
| D12 | 10–12 short Core rules plus detailed annexes | CORE-001, REVIEW-001 | Generate Step 2 **after** Step 3 wording is reviewed |
| D13 | Compliance review and risk-based testing for every change | PRESERVE-001, REVIEW-001 | Adopt and operationalize checks/evidence |
| D14 | Drive authoritative, read-only reviewer access, manual owner installation | CORE-001, REVIEW-001 | Versioned approvals and task kickoff |

**Subsequent owner requests for Step 2 review:** (i) preservation of behavior/appearance as **primary** Core CS-01; (ii) mandatory full original-versus-final revised file comparison; (iii) pretty formatting for **new** source. These are expressly incorporated above as proposed detailed clauses for final standards approval and are not omitted simply because the older D01–D14 register predates them.

## 4. Draft technical annexes — detailed review reference

### Annex A — Endpoint and frontend consumer registry schema (approved 3C-02 requirement)

The **current registry is incomplete**. **Every new or revised endpoint MUST have a reviewed registry row before delivery.** A whole-project compliance claim requires a complete method-level inventory; do not infer completeness from representative examples. The per-method row template must include:

`Method | Registered path/pattern | Router registration/order | Client scope | Credential kind | Browser cookie/Origin/CSRF applicability | Subscription key | Administrator permission | Resource owner/Tree/Person authorization | Privacy/capability scope | Rate limit | Request shape | Success shape | Error shapes | Cache policy | Known consumers | Relevant tests | Current baseline | Exception/deferred status | Reviewer`.

For every row, identify request/response formats and expected validation/errors, owner/Tree/admin checks, consumers, fixture/test IDs, actual cache and Origin behavior, and any approved deferred status. **D11 leaves the two public endpoints operationally unchanged; inventorying them does not approve hardening.** Explicitly inventory `/send-email`, `/api/geocode/reverse`, login/verification/reset/refresh/logout, `/tnna/*`, `/familytree/*`, `/ftPrivacy/*` as actually mounted, notifications public capability flows, admin transfer `/pending` `/cancel` `/complete`, Budget generated routes, ETF, tracking and media uploads. Do not assume a route is public or protected solely from a path prefix. Programmatic inventory plus source inspection and browser/network corroboration should be used for complete claims.

### Annex B — Transitional API error matrix

| Server outcome | Client contract during migration | Safety requirement |
|---|---|---|
| `{ "error": "Validation failed" }` | Parse string display text | Must have approved origin if user-visible |
| `{ "message": "Validation failed" }` | Parse legacy string text | Preserve domain fields and status |
| `{ "error": { "message": "Request failed" } }` | Parse nested string only; do not stringify object | Unexpected text generic |
| `{ "error": "Request failed", "code": "REQUEST_FAILED" }` | Preferred **future** flat form | `code` stable, optional string |
| Non-JSON/error HTML | Controlled generic failure, no HTML execution | Preserve status and diagnostics safely |
| 204/no body | Respect no-content contract | Do not manufacture success body |
| Network error or cancellation | Distinguish as transport vs abort | Never auto-replay mutation |

Parser selection order is a **proposed detailed compatibility contract**: valid string `message`, valid string `error`, valid string nested `error.message`, then a fixed fallback, with stable code fields selected only from documented string locations. Confirm app-specific priorities before implementation.

### Annex C — Browser / session test matrix

| Situation | Required property |
|---|---|
| Valid GET with expired access token before send | Controlled single refresh and retry if safe and authorized |
| POST delivered but response lost | Do not automatically replay mutation |
| 401 from a protected endpoint | Restore only when genuine eligible session recovery is possible |
| 403 subscription/privacy denial | Never silently refresh or grant higher privilege |
| Browser offline / 503 | No false logout/revocation claim; preserve input |
| Two tabs attempt rotation | Avoid false reuse/replay classification |
| Old refresh response arrives after logout/account switch | Do not reinstate old account |
| Successful same-browser new login | Supersede prior remembered browser session |
| Failed verification | Do not revoke legitimate prior session |
| Token confirmed stolen/replayed | Revoke affected family without unrelated device collateral |
| Web Locks unavailable | Fail closed, clear recovery guidance; no unsafe fallback |
| Safari/Apple PWA and Android Chrome | Verify cookies, restart, session and logout with named devices |
| TNNA offline versus rejected 401 | Preserve documented distinct native outcome |

### Annex D — Mandatory change verification packet

**For every revised source file, including a one-line correction,** supply:

1. File path and approved task ID; exact authoritative original Drive file identity and revision/date, plus original checksum **where a byte-identical baseline is available**. If bytes cannot be obtained, do not claim byte identity; document the limitation and request a verifiable baseline before approval.
2. Complete proposed revised file as a separate download, with **its actual SHA-256 hash recorded and independently rechecked after the final edit and packaging**. Do not report a placeholder hash as verification.
3. Machine-readable unified `.diff` covering the complete original and final files, including additions/deletions/rewrites; explain moves or formatting that make a textual diff ambiguous. Compare the **exact final artifact**, not an intermediate candidate.
4. A **separate** `.md` comparison/verification summary mapping each substantive hunk to the approved task/scope, and separately accounting for every formatting hunk, including **whole-file HTML formatting changes**. Unsupported differences require new approval or must be removed.
5. Affected direct and indirect caller/route/DB/UI list; whether expected behavior/appearance changed and where approved.
6. Checks performed, test environment and exact code version, expected/actual results, negative/security cases where applicable.
7. Risks, untested scenarios, rollback/manual-install instructions and latest-source revalidation gate.
8. Owner approval reference; no installation before approval. **Immediately before manual installation**, compare the still-authoritative original with the recorded baseline and reconcile intervening changes before using the proposed replacement.

**For each new file**, supply properly pretty-formatted complete source, purpose, dependency and security review, syntax test and planned integration point. A diff against a nonexistent original is not required; its introduction into the project must be listed and approved. A new file can still affect runtime behavior if installed/imported.

**Sample verification record (not an executed result):**

```text
Change ID: WA-EXAMPLE-001
File: routes/ftPrivacy.js
Authoritative baseline: [Drive ID / revision / hash — to be filled from actual current file]
Proposed final SHA-256 checksum: [actual hash independently verified after final packaging]
Approved effect: replace username-only administrator recognition using central service
Other changed behavior/appearance: none authorized
Diff hunks: [hunk 1 -> approved effect; hunk 2 -> approved support; each hunk accounted for]
Formatting-only differences: [none or full list]
Negative tests: [exact fixture and outcomes; NOT RUN until executed]
Final installation: NOT AUTHORIZED
```

### Annex E — Priority security validation scenarios (approved 3C-03)

The following cases are **designed acceptance criteria, not test outcomes**. Maintain existing R/Stage 6 IDs and cross-reference these instead of renumbering historical records. **Every executable test record MUST capture:** requirement and case ID; exact code/file/DB and environment baseline; fixture and prerequisite accounts; precise stimulus; expected HTTP status, safe response body and security/cache headers; expected database/session state and prohibited effects; actual observations; PASS/FAIL/BLOCKED/NOT-RUN; evidence location; date/reviewer. A test case name without execution evidence is never a PASS.

- **ADM-NEG-01:** Authenticated entitled historical username, `IsAdministrator=0`, or mismatch against current `ADMIN_USERNAME`: no administrative privacy bypass, no cross-owner CRUD, and no unauthorized transfer or mutation. Ordinary independently authorized user actions must continue to work.
- **ADM-POS-01:** Current row flag 1 AND matching configured username: full Family Tree private viewing and authorized create/modify/delete/privacy management/record ownership transfer permitted; all integrity, audit and transaction invariants apply.
- **ADM-XFER-01:** Prepared valid transfer with configured successor and original bound actor: specified completion; stale/expired/wrong-session and replay are denied transactionally.
- **ERR-NEG-01:** Unmarked 400/401/403/409/500/503 carrying a unique synthetic secret: no secret in body; statuses and approved wire form observed.
- **ERR-POS-01:** Factory-created expected validation error: approved public text/code preserved without private fields.
- **ERR-EARLY-01:** Parser failures before routes mounted: safe body and appropriate no-store policy; no DB write.
- **API-COMPAT-01:** `WA.api` legacy flat/nested/domain parser; no `[object Object]`, wrong success or mutation replay.
- **FT-TOKEN-01:** Page token forwarding restricted to intended route/origin; initial privacy wrapper and transport capture tested with multipart and navigation.
- **FT-RECOVERY-01:** User-recognized registered-email privacy-code retrieval delivers original code only to authorized recipient; negative impersonation and attempt-limit tests.
- **SESSION-RACE-01:** Two-tab rotation, successful same-browser new login, failed verification, delayed responses, distinct device unaffected.
- **BROWSER-01:** Supported matrix includes macOS/iOS/iPadOS Safari, Android Chrome, and named Windows browsers; web PWA/storage and absent-Web-Locks failure behavior.
- **TNNA-01:** Current native refresh/offline/401 outcomes survive relevant server changes.
- **PRESERVE-01:** Every revised file, including one-line fixes, has exact final-original diff, original provenance, final SHA-256 checksum verified after packaging, and authorized-hunk map; formatting-only hunks separately approved, with representative UI and behavior regression evidence.
- **FORMAT-01:** New source consistently pretty formatted across relevant file types; revised HTML satisfies established whole-file formatting rule with separately reviewed changes, syntax and whitespace-sensitive behavior verified; generated/minified exceptions documented.

### Annex E.1 — Minimum formal test record (blank template, NOT RUN)

| Field | Required entry |
|---|---|
| Requirement / test ID | Stable identifier and linked standards / D decision |
| Scope and authorization | Exact approved scenario and authorized test environment |
| Baseline | Source file hashes/commit, expected DB schema/identity and client/device |
| Preconditions | Named test accounts/roles, synthetic fixtures, no production credentials |
| Stimulus | Exact route/method/input or browser action and ordering/concurrency |
| Expected result | Status, safe body/code, headers, UI, DB/session/audit and time behavior |
| Prohibited outcome | No private leak, unauthorized data write, token reuse or unintended UI change |
| Actual observations | Captured relevant output, sanitized |
| Outcome | `NOT-RUN`, `PASS-BOUNDED`, `FAIL`, `BLOCKED`, with reason |
| Evidence / reviewer | Timestamp, artifact references and reviewer |
| Regression link | Prior Stage 6 test(s) affected and reason for rerun/not rerun |

**Execution boundary:** These are drafting instructions only. No tests, database transactions, browser automation or network staging calls are authorized by creation or approval of this specification.

### Annex F — Engineers' findings disposition and deferrals

**Codex DE-01–DE-15:**

| Finding | v0.4 response | Work status |
|---|---|---|
| DE-01 privacy admin bypass | ADMIN, PRIV-002, ADM-NEG/POS cases | Known source inconsistency; correction uninstalled |
| DE-02 central unexpected 4xx disclosure | ERROR-001; ERR-NEG | Historical synthetic failure; R16-75 paused |
| DE-03 transfer exception | ADMIN and ADM-XFER | D02 approved direction, details unverified |
| DE-04 two guides stale | Annex G drift plan | No file updated |
| DE-05 safe error creator contract | ERROR-001 | D03 approved direction; creator implementation pending |
| DE-06 browser parser representation mismatch | API-002, Annex B | Source-observed; client behavior not newly tested |
| DE-07 XSS/front-end rules omitted | FRONT-001 and FORMAT | Included for review; CSP architecture pending D08 |
| DE-08 privacy-code key storage | PRIV-002 | D06 owner chose recoverability/no mandatory encryption; risk explicit |
| DE-09 endpoint registry incomplete | API-001, Annex A | Registry still incomplete |
| DE-10 errors before no-store mount | CACHE-001, ERR-EARLY | Coverage pending |
| DE-11 transport/page token composition | PRIV-002, SHARED | Integration untested in this draft |
| DE-12 database/resource constraints | DATA-001, ENV-001 | Verification pending |
| DE-13 undefined test references | Annexes D/E describe essential cases | Execution/complete catalog pending |
| DE-14 dependency and public build artifacts | ENV-001 | Inventory/removal separately approved |
| DE-15 simplified governance and ownership | §§1, REVIEW, future Core | Step 2 not yet authored |

**Claude additional findings:** Public geocode and Contact Us protection are recorded **DEFERRED-D11**, not silently fixed; broader security headers/CSP depend on staged design and approvals; script/PWA cache skew is covered in CACHE-001; readable daily Core and generated endpoint inventory are proposed governance mechanisms; platform versions and actual hosting headers require fresh inspection. Small hygiene suggestions are **not** an automatic license to alter source code.

### Annex G — Known documentation drift; proposed reconciliation only (approved 3C-05)

1. **`TechSummary.md` §6.7:** Older `UserID === 1` OR username configuration wording conflicts with the approved two-gate central administrator standard. Proposed replacement should state verified current `UsersT.IsAdministrator=1` AND configured `ADMIN_USERNAME`, using `services/administratorAccess.js`.
2. **`CLAUDE.md` administrator description (reported near original §6 / line 417):** Codex also identified an obsolete UserID/username override description. Confirm exact current Drive paragraph, then prepare a separate proposed correction; do not assume changing TechSummary alone closes drift.
3. **`waPlatform.js` header:** Reported stale description of script loading/adoption; confirm current usage before proposing comment-only correction.
4. **`README.md` and AI entry files:** Check existing root documents and instruction-file conventions before proposing modifications. Any revised existing file must satisfy WA-PRESERVE-001 with full diff; instructions must point to the canonical standards and must not silently modify behavior or existing project guidance.
5. **Source/commit drift:** B9's pinned GitHub snapshot, Codex local checked HEAD, current Drive revisions, staging SHA and actual Render deployment have not been proven identical by this report. Record exact current authority before preparing implementation changes.

All items above are **documentation-change proposals**, not permission to edit the authoritative originals. Each future standards document MUST show exact version, approval status, effective date (only once approved), authorized exceptions and approving owner. Where equally authoritative sources conflict, pause the affected change and obtain explicit resolution. Drafts and historic reports may explain evolution but do not override approved rules.

### Annex H — Preservation of prior Stage 6 evidence

Preserve all bounded R10, R14, R15 passes and earlier focused R16 passes. Preserve R16-74B synthetic disclosure failure; R16-75 remains paused pending separate owner approval of an actual correction. The larger S6 open-items register and existing testing plan remain controlling historical evidence; some snapshots have old status cutoffs. A new standards policy does not retroactively void a test nor close a linked broad acceptance requirement. When D08/D09 or shared error/session code changes are eventually installed, identify **exactly** which prior assertions require rerun and why. No tests were executed while writing v0.4.

## 5. Consolidated Step 3 review disposition and Step 2 dependency gate

**Step 3A, Step 3B (with revised 3B-01), and Step 3C were explicitly approved as review dispositions by the owner.** The consolidated v0.4.1 text below is presented to confirm consistent incorporation; **the entire document is not yet adopted**. The review covered:

1. **WA-PRESERVE-001:** Require full final-file diff and separate verification summary **for every revised source file**, including one-line changes; decide any exceptions (currently none proposed).
2. **WA-FORMAT-001:** Readable new files in all languages; reconcile existing mandatory whole-HTML formatting with limited-scope diff protection.
3. **D01/ADMIN (updated by owner 3B-01):** Full verified-administrator Family Tree viewing, creating, modifying, deleting, privacy management and record-ownership transfers; preserve all integrity/audit obligations and D02 *administrator account-transfer* workflow as a distinct flow.
4. **D06:** Owner consciously accepts recoverable plaintext-capable four-character privacy codes; only registered-email recovery with authority verification; no forced reset or encryption requirement.
5. **D08:** Modernization direction is approved, but the precise token-storage replacement remains open and must not be described as already implemented.
6. **D11:** Defer public geocoding and Contact Us hardening without deleting findings or making unsupported security assurances.
7. **Discovery:** Decide how root `README.md` and tool-specific instructions reference the eventual Core and this detailed spec. No README is guaranteed to be automatically read by every tool.
8. **Annex test readiness:** This is a structured initial acceptance catalog, **not** an exhaustive executable test suite or proof of project conformance.

**Step 2 is explicitly ON HOLD under the latest owner instruction until this consolidated Step 3 draft is reviewed and separately accepted.** Step 2 should define 12 short Core rules, beginning with CS-01 preservation of functionality/appearance and full changed-file comparisons. It must cite actual detailed requirement IDs in this v0.4.1 document and D01–D14, not nonexistent annexes. A separate root README/AI-entry proposal must be built from actual current originals and diffed under WA-PRESERVE-001.

## 6. Source references and version history

Primary Drive sources inspected for this revision:

- [B9 v0.3 detailed specification](https://drive.google.com/file/d/1LF-kbiMJb9pOBmf5xdmtdSlz3kyqWLf6/view)
- [D01–D14 Decision Register v1.0](https://drive.google.com/file/d/1Q6HA4jxmZr54cDfaMSdvaf5cJcqWc_Ud/view)
- [Codex independent review](https://drive.google.com/file/d/19ZpXzxFjEOG6Mwx1z6dDa-w_PO5Y81hF/view)
- [Claude design-engineer review](https://drive.google.com/file/d/18paZWMeK0Z_pGFZxpManKjj9rMUR_Wwl/view)
- [Authoritative `CLAUDE.md` snapshot referenced by B9](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view)
- [Authoritative `TechSummary.md` snapshot referenced by B9](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view)
- [Stage 6 open-items register](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view)
- [Stage 6 Render test plan](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view)

- **0.3 / B9 — November 11:** Earlier review draft; 17 primary clauses and initial annexes; multiple owner decisions still open at the time.
- **0.4 / Step 3 — November 12:** Initial detailed revision using D01–D14, preservation/diff/formatting requests, both independent reviews and initial annexes. Draft.
- **0.4.1 / consolidated Step 3 — November 12:** Incorporates explicitly approved 3A source comparison/SHA-256/HTML formatting rules; **revised 3B-01 full Family Tree administrator privileges** and 3B-02–04; **3C-01–05** annex, testing, discovery and governance clarifications. **Still a full-document DRAFT; no WA project-file changes and no tests executed.**

**Requested owner disposition:** Review this consolidated v0.4.1 draft for accuracy and any remaining corrections. Approve the exact detailed standard/version in a separate explicit action if satisfactory. **Do not begin Step 2 until the owner specifically authorizes it.** Neither document approval nor policy approval authorizes WA project installation, staging changes or production release.
