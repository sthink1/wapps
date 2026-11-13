# Wonderful Apps — Independent Design Engineer Review

**Document ID:** WA-DE-STD-2026-11-11  
**Version:** 1.0 — findings and recommendations for owner review  
**Date:** November 11, 2026  
**Principal review target:** B9, Programming and Security Standardization Specification, draft v0.3  
**Disposition:** Retain the architecture; revise before whole-document adoption. Approve bounded requirements separately if desired.  
**Authorization:** Review only, with this report as the sole authorized new project file. No implementation or deployment approval is implied.

## 1. Overview and engineering judgment

Wonderful Apps has a usable shared architecture, existing development instructions, and substantial Stage 6 test evidence. The problem is consistency at the boundaries between these components: a shared component can exist while individual routes or pages continue to use different rules. More documentation alone will not resolve that problem. WA needs concise governing requirements, explicit contracts for shared components, and checks that demonstrate which callers actually comply.

B9 is a substantial improvement over the earlier drafts. It correctly separates unexpected-error disclosure from API payload formatting, preserves Family Tree and TNNA behavior, distinguishes approval from implementation and testing, and consolidates overlapping requirement IDs. Its administrator rule accurately preserves the owner's approved two-gate decision. These are sound design choices.

**I do not recommend approving v0.3 unchanged as the complete governing specification.** Several clauses still delegate important behavior to unfinished inventories or undefined test families. Some detail from v0.2, particularly frontend XSS controls, was weakened during consolidation. There are also confirmed implementation discrepancies that a standards approval must record rather than implicitly certify.

The most consequential additional source finding is in **`routes/ftPrivacy.js:47`**: its local administrator test grants the privacy administrator exception to a database username equal to `sthink`, without consulting `IsAdministrator` or configured `ADMIN_USERNAME`. The approved central service uses both gates, but this privacy path does not use it. This is a confirmed discrepancy against WA-SEC-ADMIN-001, independently verified in local and pinned GitHub source. Actual exploitation, deployed database state, and a production incident are not established.

The previously identified central error-handler issue also remains present: `server.js:207–209` publishes an unexpected exception's message whenever its status is below 500. That is a code defect relative to the proposed safe-error contract, independently observable in source. The earlier R16-74B synthetic failure is historical evidence, not a test rerun by this review. **R16-75 remains paused.**

The recommended direction is incremental: agree on security properties and documentation authority first; approve narrowly scoped remediation packages next; then migrate consumers in controlled groups. A single API envelope, browser fallback, CSP rollout, or native lifetime change should not be bundled into an urgent disclosure correction.

## 2. Scope, provenance, and limits

### 2.1 Verified baseline

| Item | Observation | Meaning |
|---|---|---|
| Local repository | `C:\AppProjectwDB\WonderfulAppsRender`; branch `reviseLogIn` | Direct read access was available. |
| Reviewed HEAD | `a53f7ef24be65529226a8e605b32437915fdf52c` | Matches the commit identified by the owner. |
| Immediate parent | `b5e2b06f3269fc6db070cb938f25170a44a6f98e` | Confirmed by local Git ancestry. |
| Changes between commits | Twelve added Markdown documents: the handoff, B0–B9, and review README; 2,526 inserted lines | **No application-code changes** separate the two commits. B9's older code references remain relevant to this HEAD. |
| Initial tracked working files | `git status --short` empty; `git diff --quiet a53f7ef --` returned 0 | Tracked local source matched HEAD at inspection. This does not establish the identity of ignored files or deployed configuration. |
| GitHub | Connected GitHub commit lookup confirmed the full `a53f7ef` SHA; `routes/ftPrivacy.js` was independently retrieved at that full ref | Remote confirmation supplements local Git evidence; this is not a current Render deployment verification. |

GitHub references: [reviewed commit](https://github.com/sthink1/wapps/commit/a53f7ef24be65529226a8e605b32437915fdf52c), [historical implementation baseline](https://github.com/sthink1/wapps/tree/b5e2b06f3269fc6db070cb938f25170a44a6f98e).

### 2.2 Materials and method

The introduction was read first. B9's requirements and annexes were the principal review target. B0–B4 supplied audit evidence and representative traces; B5/B7 supplied earlier requirements and design evolution; B6/B8 supplied completeness findings and dispositions. These historical documents were consulted as supporting evidence, not treated as separately governing specifications.

Independent source inspection covered the central server pipeline, authentication and subscription middleware, administrator service and transfer router, token verification and browser-session services, Family Tree privacy router/client, representative Budget/ETF consumers and classifiers, TNNA issuance, environment/database setup, package scripts, and selected existing test source. Root `CLAUDE.md` and `TechSummary.md` were reviewed in relevant security, database, frontend, administrator, and change-procedure sections. Stage 6 open-items, test-plan, continuity-ledger, and audit-handoff sections were used to preserve acceptance boundaries.

This is a targeted design review, **not an exhaustive endpoint or source-code audit**. Earlier reports and historical ledgers were consulted selectively; every legacy evidence attachment and every line of every earlier draft was not independently reconciled. No test suite, application server, database query, hosted fault injection, browser workflow, native device test, or dependency vulnerability scan was run. No secrets/configuration values were read for this review. Source observations are not runtime PASS results.

The package identifies Google Drive as the maintained authoritative location. **This review did not independently retrieve current Drive documents or prove Drive/local/deployment byte equality.** References to primary-guide wording below mean the inspected committed/local copies. Current Drive identity and actual Render deployment remain explicit pre-implementation checks. No assertion of current production behavior depends on assumed synchronization.

The owner's current instruction expressly permits placing this report in `standard`; that is the sole exception to the package's read-only operating instructions. No other project-file modification is authorized.

### 2.3 Evidence vocabulary and severity

**Confirmed source** means directly observed at the reviewed baseline. **Reported historical test** means an existing ledger's bounded result, not independently rerun. **Inference** means a consequence suggested by source that still requires behavioral verification. **Proposal** means a recommended requirement or design choice awaiting approval.

Findings distinguish **SPEC** (specification defect), **IMPL** (implementation discrepancy), **DOC** (documentation drift), and **RISK** (unverified operational/security consequence). High severity means a material security or adoption concern; medium means a meaningful completeness or maintainability gap. Severity is not an assertion that an incident occurred. An adoption blocker blocks the affected policy or conformance claim; it need not block adoption of unrelated, fully specified requirements.

## 3. Numbered findings register

### DE-01 — Privacy administrator recognition bypasses the approved service

**Severity:** High. **Type:** IMPL, confirmed source. **Affected:** WA-SEC-ADMIN-001, WA-PRIV-002, WA-API-001.

**Evidence:** [`routes/ftPrivacy.js:47–50`](https://github.com/sthink1/wapps/blob/a53f7ef24be65529226a8e605b32437915fdf52c/routes/ftPrivacy.js#L47-L50) selects only `UserName` and returns true when its lowercase value is `sthink`. The helper is used by `getTree`'s administrator fallback, `hasAccess`, privacy status, and unlock processing. It does not check the current database designation, configured administrator identity, or the approved service. By comparison, [`services/administratorAccess.js:10–29`](https://github.com/sthink1/wapps/blob/a53f7ef24be65529226a8e605b32437915fdf52c/services/administratorAccess.js#L10-L29) implements the required database designation AND normalized configured-username match.

**Implication:** A valid, entitled request recognized as username `sthink` can receive the local privacy administrator treatment even if the approved central service would reject that administrator designation. Outer authentication/subscription gates still apply; this is not an anonymous-login bypass. Conversely, a newly designated administrator with another username may lose intended privacy functionality. Actual account state and hosted effects were not tested.

**Recommendation:** Record a distinct implementation gap now. After owner agreement, prepare a privacy remediation using the central service, including its transaction-connection parameter where appropriate. Independently decide which Tree/privacy privileges a verified administrator is permitted to exercise; central identity recognition does not itself approve every data-access override. Add negative coverage for the former username after designation/configuration changes. Existing bounded R14/R15 passes do not close this path.

### DE-02 — Central error disclosure remains inconsistent with route-level safety

**Severity:** High. **Type:** IMPL, confirmed source; historical test failure reported. **Affected:** WA-ERROR-001, WA-LOG-001, WA-API-002.

**Evidence:** [`server.js:199–215`](https://github.com/sthink1/wapps/blob/a53f7ef24be65529226a8e605b32437915fdf52c/server.js#L199-L215) uses raw `err.message` for any accepted 4xx status. The [shared expected-error marker](https://github.com/sthink1/wapps/blob/a53f7ef24be65529226a8e605b32437915fdf52c/services/stage6ExpectedClientError.js) explicitly says status alone is insufficient. B9 Annex H reports R16-74B synthetic unexpected-400/403 disclosure failures.

**Recommendation:** Retain B9's disclosure invariant. When separately authorized, address the central handler without changing established JSON shapes or status semantics in the same package. Trace parser errors, `next(error)` callers, direct JSON catches, upload handlers, and safe-error replacement paths. Passing a central-handler test will not prove every route safe. Include a response-already-started path and fail-safe logging in the eventual handler contract. R16-75 is still paused by this report.

### DE-03 — Administrator transfer is a separate privileged authorization workflow

**Severity:** High. **Type:** SPEC; confirmed source architecture, approval scope unverified. **Affected:** WA-SEC-ADMIN-001, WA-API-001, WA-REVIEW-001; Annexes A/E.

**Evidence:** [`routes/adminManagement.js:73–151`](https://github.com/sthink1/wapps/blob/a53f7ef24be65529226a8e605b32437915fdf52c/routes/adminManagement.js#L73-L151) has `/pending`, `/cancel`, and `/complete` operations using the authenticated web session, Origin, pending capability, database state, and transaction checks. `/complete` deliberately requires configuration to match the **target** while the actor is the original administrator. It does not apply ordinary `requireAdministrator` at that point. Preparation separately rechecks the designation inside its transaction.

**Implication:** Requiring the old actor to pass the ordinary current-config administrator gate after configuration changes could make completion impossible. Calling this path compliant merely because it imports the central service would also be incorrect. The present design is visible; whether its full contract is owner-approved was not established here.

**Recommendation:** Add exact transfer methods to the access catalog and obtain an explicit workflow decision. Preserve the ordinary two-gate recognition standard. Define transfer completion as a separately bounded capability authorization, with initiator/session binding, target continuity, expiry, replay protection, locking, atomic designation change, audit, cancellation, and recovery. Do not infer a general administrator exception. Centralize reusable recognition logic while allowing required transactional revalidation.

### DE-04 — Both primary guides retain obsolete administrator descriptions

**Severity:** High. **Type:** DOC, confirmed local/committed wording. **Affected:** WA-SEC-ADMIN-001, WA-CORE-001; B9 §4.1.

**Evidence:** `TechSummary.md:504–511` describes `UserID === 1` OR JWT username matching configuration. **`CLAUDE.md:417` also says the override recognizes UserID 1 or configured username.** B9's proposed drift correction identifies only the former. Both conflict with the approved rule.

**Recommendation:** Extend the drift register and proposed correction to both guides, plus any copied onboarding guidance that is actually used. Cross-reference one authoritative administrator contract rather than maintaining independently editable versions. No guide has been changed by this review. Source history at the time of original development is still needed before attributing an historical instruction violation to a programmer.

### DE-05 — Error provenance needs a creator contract, not just a marker check

**Severity:** High. **Type:** SPEC; confirmed classifier diversity. **Affected:** WA-ERROR-001, DEC-03.

**Evidence:** Shared classification uses a WeakSet. `routes/etf.js:15–22` has another WeakSet; `routes/budget.js:81–90` uses a boolean property plus status. B9 states the invariant but leaves the permanent mechanism open. A marker can establish which code approved an error; it cannot establish that an interpolated message contains no private information.

**Recommendation:** Prefer one small approved factory/classification contract, with legacy adapters during migration. Its public fields should be explicit: supported status, stable code where defined, bounded authored text, and tightly defined optional details. Never mark arbitrary caught exceptions, or copy provider/DB messages into a newly marked error. The existing WeakSet can remain a candidate; its availability is not evidence that all producers use it safely. This recommendation does not approve a wire format or claim the Budget property is remotely exploitable.

### DE-06 — Browser error parser has a confirmed representation mismatch

**Severity:** Medium. **Type:** IMPL and SPEC; confirmed source, UI consequence untested. **Affected:** WA-API-002, WA-SESSION-001; Annex B.

**Evidence:** [`httpdocs/js/waPlatform.js:41–48`](https://github.com/sthink1/wapps/blob/a53f7ef24be65529226a8e605b32437915fdf52c/httpdocs/js/waPlatform.js#L41-L48) passes `data.message || data.error` to an Error constructor and uses `data.code || data.error` as its code. The central handler emits an object at `error`. Object coercion can produce `[object Object]`, and the code can itself be an object or display sentence.

**Recommendation:** Complete Annex B's transitional parser contract using string type checks, a fixed fallback, documented code locations, and preservation of domain fields. Do not treat untrusted server text as safe HTML. A parser cannot infer whether a message was approved merely from HTTP status. Preserve successful response shapes, raw `Response` ownership, 204 handling, and separate network/cancellation outcomes. Canonical response-envelope selection can remain deferred while compatibility parsing is specified.

### DE-07 — Consolidation leaves XSS and existing frontend rules insufficiently normative

**Severity:** High. **Type:** SPEC; existing-document traceability gap. **Affected:** WA-FRONT-001, WA-SESSION-001, WA-LOG-001, DEC-09; Annex F.

**Evidence:** B7 WA-STD-19 explicitly covers safe DOM assignment, output encoding, third-party script inventory, and CSP review. B9 Annex F maps it mainly into LOG/SESSION, whose primary clauses do not fully carry those rendering obligations. Root `CLAUDE.md:892–924` and `TechSummary.md:1069–1105` already contain input-sanitization and safe-output requirements. `CLAUDE.md:908` prohibits sanitizing passwords. `TechSummary.md` §14 includes both formatting and the light-mode declarations; §15 includes API/name/appearance preservation.

**Recommendation:** Add a dedicated frontend security clause or an explicit normative reference preserving those requirements. Retain the shared free-text sanitizer/DOMPurify policy where applicable, backend validation, text-safe rendering, constrained URL attributes, and password byte preservation. Keep CSP and token-storage migration as separately approved design choices. HttpOnly refresh cookies do not shield a JavaScript-readable access JWT from XSS. Complete coverage of the existing guides before claiming the consolidation preserves all prior standards.

### DE-08 — Privacy key storage is a missing credential-design decision

**Severity:** High review priority. **Type:** confirmed source characteristic plus RISK; no incident established. **Affected:** WA-PRIV-002, WA-DATA-001, WA-ABUSE-001.

**Evidence:** `routes/ftPrivacy.js:64–70` places the proposed privacy key into `FTPrivacyRequestT.ProposedKeyCode`; lines 83 and 97 compare/store `FTPersonPrivacyT.KeyCode` directly. These paths show application-readable keys, unlike hashed random page tokens. They also contain a minimum-four-character key policy and per-Person/per-user failed-attempt checks. Database contents, storage encryption, and aggregate attack resistance were not inspected.

**Recommendation:** Define whether these keys are reusable authentication secrets and specify protection for both pending and active keys, backups, administrator tools, and logs. Prefer non-recoverable password-style verifiers if recovery is unnecessary, with an approved migration. Rate limiting must consider distributed/multiple-account attempts as well as one account. Do not conflate human-chosen key hashing with SHA-256 hashing of high-entropy random capability tokens. This is a new design review item, not a claim that an already approved hashing standard was violated.

### DE-09 — Method-level endpoint and consumer coverage remains incomplete

**Severity:** High for conformance claims. **Type:** SPEC/evidence gap. **Affected:** WA-API-001, WA-AUTH-001, WA-REVIEW-001; Annex A.

**Evidence:** Annex A explicitly contains examples and unresolved paths/consumers. It omits detailed transfer operations and does not exhaust account recovery, dynamically registered Budget routes, Family Tree routes, or external-service routes. Representative `BinForm.html:493–500` and `etfCompare.html:276–279` use direct fetch despite loading `waPlatform.js`.

**Recommendation:** Use a structured per-method catalog with separate dimensions for credential, client scope, subscription, administrator permission, ownership/membership, privacy, Origin, rate limits, cache, schemas, consumers, and tests. These are not mutually exclusive access classes. Check generated registrations and router order; a regex list alone is insufficient. Require complete catalog coverage for a whole-project conformance claim, while allowing approved core requirements and bounded migrations before that claim is possible.

### DE-10 — Cache guarantees do not yet account for failures before route mounts

**Severity:** High for the stated security contract. **Type:** confirmed ordering plus unverified RISK. **Affected:** WA-CACHE-001, WA-ERROR-001.

**Evidence:** `server.js:58–64` installs JSON, URL-encoded, and general multipart parsing before sensitive-path `no-store` middleware at lines 123 onward. Errors raised before those mounts can reach the final handler without executing the later route headers. That handler does not itself establish `no-store`.

**Recommendation:** Specify that relevant early-parser and error responses receive the sensitive-route cache policy. Test malformed JSON, rejected body size, multipart errors, auth denial, and route exceptions at the actual middleware order. Current source proves the ordering gap; it does not prove a browser/proxy cached sensitive data. CORS header emission likewise must not be mistaken for server-side authorization of a mutation.

### DE-11 — Session adoption needs exact wrapper and identity contracts

**Severity:** High for migration. **Type:** SPEC and RISK; confirmed source interactions. **Affected:** WA-SESSION-001, WA-PRIV-002, WA-CACHE-001; Annexes B/C.

**Evidence:** `waPlatform.js:16` captures a bound fetch function at script initialization. `FTPrivacy.js:7–8` replaces `window.fetch` later when a page token is installed. `FTPerson.html:1371–1374` loads both. The privacy wrapper recognizes a substring rather than a parsed exact origin/path. The privacy `api` function constructs its own headers, so caller-supplied headers require careful tracing. These facts make shared-transport migration dependent on composition/timing, not merely script order.

**Recommendation:** Define an explicit mechanism for injecting the approved current page token into shared requests; restrict credential/header propagation to the intended origin and route. Test initial unlock, navigation handoff, reopen, uploads, and refresh, including requests made through the captured transport. Treat potential cross-origin page-token propagation as unverified until actual call paths are evaluated. Also distinguish pre-send refresh from replay after delivery, account identity from token-string changes, and cancellation from authentication failure. Preserve local sign-out versus confirmed server revocation and the current fail-closed lock behavior pending DEC-04.

### DE-12 — Database and operating constraints were compressed too far

**Severity:** Medium. **Type:** SPEC; existing requirements incompletely restated. **Affected:** WA-DATA-001, WA-ENV-001, WA-NATIVE-001.

**Evidence:** Root `CLAUDE.md:272–286` specifies UTC session/pool behavior and schema provenance; §17 explicitly preserves MySQL 5.5 compatibility. B9 WA-DATA-001 is less precise. Stage 6 S6-040 records a real connection-budget issue. `services/stage6Environment.js` intentionally accepts only local/staging test identities; it is not a production-ready configuration model.

**Recommendation:** Preserve the lowest supported database compatibility target unless expressly changed. Require an identified schema snapshot/migration, UTC instants versus date-only semantics, row-count checks, transaction/locking boundaries, connection release, and compensating cleanup for storage/email effects outside DB atomicity. Add connection/queue/worker budgets, outbound deadlines and response-size limits. Production transition requires a separate reviewed environment/migration/rollback design; do not disable the test guard to satisfy a generic production clause.

### DE-13 — Acceptance annex and enforcement are not yet executable governance

**Severity:** High for whole-specification sign-off. **Type:** SPEC/process gap. **Affected:** WA-REVIEW-001 and all acceptance references.

**Evidence:** B9 cites CAP-01–07, ORIGIN-01–06, DATA-01–06, ABUSE-01–06 and other families without defining every case. PRIV-07/08, LOG-02–05, ENV-03–05, CACHE-03–05 and GOV-03–05 are examples of referenced but unenumerated cases. Annex D acknowledges incompleteness. `package.json:6` has only a failing placeholder test command; no `.github/workflows` directory is present in the reviewed checkout. Existing offline tests do exist, so lack of that entry point does not mean lack of testing.

**Recommendation:** Establish a curated, no-network/no-write offline suite and an explicit separately authorized integration/browser/native suite. Name owners, exact fixtures/assertions, evidence locations, and required checks. Decide whether enforcement runs locally, in CI, or both; none was observed here as a complete mandatory gate. Review source-extraction/VM tests for what they omit: they can validate isolated code but not actual Express ordering, database concurrency, or browser composition. Do not block generic-message safety tests on DEC-02: the present envelope and absence of a synthetic secret are already testable.

### DE-14 — Dependency, build, and static-publication standards are missing

**Severity:** Medium. **Type:** SPEC; selected repository facts confirmed. **Affected:** WA-CORE-001, WA-FRONT-001, WA-ENV-001, WA-REVIEW-001.

**Evidence:** The project has package manifests/lockfile and serves `httpdocs` through static middleware (`server.js:69`). Legacy `_COPY` HTML files exist within that public tree. The Stage 6 test-plan supplement already calls for separately reviewed backup/copy cleanup. B9 does not define a complete dependency/build/publication control.

**Recommendation:** Specify supported runtime/toolchain versions, lockfile-based installation, dependency/license/security review, native signing/version consistency, artifact provenance, and an intentional public-file manifest or reviewed exclusion rule. Backup files in a static directory can remain reachable by guessed URLs unless separately excluded; reachability was not tested. Inventory first and discuss removal separately. Do not delete copies or introduce tools/configuration under this report's authorization.

### DE-15 — Governance needs simpler adoption gates and durable ownership

**Severity:** Medium. **Type:** SPEC/DOC. **Affected:** WA-CORE-001, WA-REVIEW-001, DEC-01/10/11.

**Evidence:** B9 appropriately separates authority and evidence but combines permanent standards with review-session operating restrictions and extensive historical narrative. It has a broken reference from ADMIN to §6.2 instead of §4.1, the status spelling `NOT-ASSESSSED`, and several placeholder acceptance references. The continuity ledger and formal plan have different evidence cutoffs and older deployed SHAs.

**Recommendation:** Publish a concise approved core with versioned technical annexes; preserve B0–B9 as historical rationale. Assign one accountable standards maintainer, owners for shared modules, and a reviewer for each change. Keep an explicit latest-disposition index without deleting historical evidence. Preserve the owner's read-only/manual-install preferences in operating instructions; future authorization remains a separate decision. Consider accessibility, focus/error announcements, destructive-action confirmation, and privacy retention/deletion policies as additional scoped standards work; these were not comprehensively assessed here.

## 4. Recommended architecture and specific proposed wording

All wording below is **proposed for discussion**, not installed amendments or new implementation authorization. The approved administrator identity rule remains unchanged.

### 4.1 Preserve one security contract with domain adapters

Use shared primitives for authentication, administrator recognition, error provenance, session transport, and safe diagnostics. Keep application modules responsible for business validation, record/Tree relationships, privacy, and domain-specific response fields. A shared helper should have a documented caller contract and an adoption inventory. Merely loading or importing it is not conformance.

Choose one policy source per topic. Endpoint records should reference that source, then state domain-specific requirements. A multipart upload or public email link is normally an access variant within the standard; it becomes an exception only if it actually departs from an approved mandatory requirement.

### 4.2 Add administrator scope and transfer wording

> **Administrator recognition and permission scope:** Every ordinary administrator identity decision, including privacy and subscription overrides, MUST use WA-SEC-ADMIN-001 through `services/administratorAccess.js`. A verified identity grants only the permissions explicitly assigned to the operation; it does not inherently waive Tree membership, ownership, or privacy. A transfer/recovery capability is not an ordinary administrator identity decision and MUST have a separately approved, method-specific authorization contract. Transactional privileged mutations MUST revalidate the relevant authority using the transaction connection before committing.

This closes the privacy-recognition omission without mechanically breaking transfer completion. The owner must approve transfer authority and the allowed administrator data scope separately.

### 4.3 Refine WA-ERROR-001

> **Expected-error creation:** Approved code MAY create a public client error only from an enumerated business/validation outcome, using the approved provenance mechanism and bounded public fields. It MUST NOT designate an arbitrary caught exception as expected, or copy internal/provider exception text into public fields. Neither status nor a marker alone establishes that every field is safe. At response boundaries, unexpected failures MUST use fixed safe output in the endpoint's supported wire format. Valid established status semantics are retained unless a separately approved mapping changes them. Errors after response headers have been sent MUST follow a defined no-second-response failure path.

Status selection and text disclosure are distinct. Preserve established 401/403/409/423/provider behavior initially; do not create a global mapping that changes login or privacy flows as a side effect of sanitization. If an unexpected error carries a status that has special client behavior, record that path for review rather than inferring it is an expected business denial.

### 4.4 Refine WA-API-002

> **Transitional client normalization:** Error extraction MUST accept supported string fields only, in the documented order `message`, string `error`, then string `error.message`, with a fixed fallback. Machine codes MUST come from documented code fields or an explicit legacy mapping, never arbitrary object/string coercion. Domain fields needed by consumers MUST remain available. Non-JSON, malformed JSON, no-content, network failure, and caller cancellation MUST have distinct documented outcomes. Server messages MUST be rendered as text or through an approved safe-rendering path. These requirements do not select a canonical server envelope.

`WA.api.request` should retain raw-response ownership; `WA.api.json` should have a precise parsed-result/typed-error contract. A client must not convert a failed business response into success merely because JSON parsing succeeded.

### 4.5 Add WA-FRONT-002 — Safe rendering and credential exposure

> Existing `CLAUDE.md` §11 and `TechSummary.md` §11 sanitization/safe-output requirements remain binding. Untrusted user, database, and supplier values MUST use context-appropriate safe rendering, including URL-attribute validation. Applicable reusable free-text inputs MUST retain the approved shared sanitizer; passwords MUST remain byte-for-byte as entered. Client sanitization MUST NOT replace server validation or authorization. JavaScript-readable access-token storage MUST be recorded as a transitional XSS exposure. Third-party script provenance, CSP compatibility, and any storage migration require a separately approved plan and affected-page tests.

This preserves existing obligations while keeping DEC-09 open. It does not assert that CSP alone eliminates XSS.

### 4.6 Refine WA-PRIV-001 and WA-PRIV-002

> Each capability workflow MUST identify whether possession alone authorizes its action, its permitted methods, entropy, storage, expiry, invalidation, disclosure, and replay rules. GET review behavior and POST state transitions MUST be specified separately, including email-scanner/prefetch effects. Cookie ambient authority, explicit capability authority, and native credentials MUST be assessed independently. CORS is not an authorization control. Privacy page tokens MUST propagate only to the approved origin/routes and retain Person/user scope and expiry. Human-selected privacy keys require an approved storage/verification and aggregate-abuse policy distinct from random-token hashing.

Do not impose browser Origin headers universally on native or emailed-link consumers. A synthetic HTTP client can supply Origin; an Origin check primarily constrains browser cross-site requests and does not replace credential authentication.

### 4.7 Refine WA-DATA-001 and WA-ENV-001

> Changes MUST identify the schema revision and lowest supported database version, preserve required UTC connection/application rules, distinguish date-only fields from instants, and specify affected-row/rollback expectations. Dynamic SQL identifiers MUST come from trusted allowlists; value placeholders do not parameterize identifiers. Logical units involving DB writes and external objects/email MUST define commit order, failure reporting, and compensating recovery. Environment identity MUST be verified before service starts. Aggregate connection, queue, background-worker, and outbound-request budgets MUST be documented and tested for the target environment. Test-only guards MUST remain until a separately approved production transition replaces them.

### 4.8 Refine WA-CACHE-001

> Sensitive-route cache policy MUST apply to successful responses and failures from parsing, authentication, authorization, business handling, and unexpected exceptions, including failures before router entry. Browser HTTP cache, intermediary cache, and service-worker Cache Storage MUST be checked separately. A supported asset-version matrix MUST identify compatible old/new clients and the behavior for unsupported combinations. An asset rollback MUST NOT restore obsolete security-sensitive cached data or invalidate current-session safeguards.

### 4.9 Refine WA-REVIEW-001

> A requirement is adoption-ready when its authority, applicability, required observable behavior, exceptions, owner, and verification procedure are specified. Existing-code conformance is a separate decision requiring source and scoped test evidence. Undefined referenced tests cannot support conformance. New or materially changed interfaces require producer/consumer contract tests; security boundaries require negative and failure-path tests. Prior evidence is inherited only when its exact baseline, assertion, and dependencies remain applicable. Release approval requires reconciliation of all material findings and explicit approval of any residual risk.

Give each test an exact baseline, fixture, stimulus, expected status/body/headers, side effects and prohibited effects, environment, evidence location, result, and reviewer. A fixture can assert secret absence in the current response shape without waiting for a future envelope decision.

### 4.10 Make development checks practical

Proposed minimum completion criteria for a future authorized change:

1. Identify requirement IDs, exact baseline, affected shared modules, endpoint methods, consumers, schema, and compatibility risks.
2. Review a concrete change package; obtain the owner's agreement before any project-file changes under the current operating restrictions.
3. Run approved deterministic offline checks for the changed boundary; run integration/browser/native checks only in their authorized environments.
4. Review the semantic diff and update the approved contract/evidence/drift records with the change package.
5. Preserve earlier bounded results; rerun affected tests when dependencies changed, rather than indiscriminately repeating every PASS.

HTML readability remains mandatory. A whitespace-insensitive diff or DOM comparison alone is not proof of unchanged behavior: whitespace can affect displayed text, inline scripts, template strings, and preformatted content. Inspect those contexts and run the affected UI checks. Whole-file formatting must not obscure a security change.

## 5. Minimum acceptance work to make the recommendations reviewable

These are **future test designs**, not results and not permission to execute. Retain existing IDs and attach them as additional cases or map them explicitly; do not silently renumber historical evidence.

| Boundary | Deterministic fixture / stimulus | Required observations |
|---|---|---|
| Privacy administrator negative | Authenticated entitled user named `sthink`, database flag 0; separately, configuration names another administrator | No administrator fallback, no private focal data without valid page token, no unauthorized state change; central service called. |
| Privacy administrator positive | Flag 1 and normalized configured name match | Only owner-approved privacy permissions granted; unrelated private-person redaction preserved. |
| Administrator transfer | Prepare as current administrator, then configured target changes; complete with original bound session/capability | Exact approved transition succeeds atomically; wrong actor/session/target, expiry and replay deny with no designation write. Rollback/failure paths preserve recoverability. |
| Public error provenance | Inject unmarked 400/401/403/409/500/503 with a synthetic internal marker; compare approved deliberate validation errors | Unexpected marker absent from body/logs; approved safe validation retained; documented statuses, current envelopes and headers preserved. |
| Early middleware failure | Malformed JSON/oversized body/multipart failure on sensitive API path | Safe response and `no-store` despite pre-router failure; no mutation. |
| Client normalization | Legacy string/nested/domain error shapes; 204; malformed/non-JSON; aborted/network request | String display/code types, preserved domain fields, no HTML execution, no double body consumption or false success. |
| Replay/account isolation | Mutation timeout after simulated receipt; expired JWT before send; 401 after send; late refresh during account switch/logout | Pre-send refresh distinguished from replay; no automatic mutation replay or old-account installation; form state retained. |
| Family Tree transport | Unlock after shared transport initialization, then shared/direct JSON and multipart requests | Exact intended page token reaches allowed requests only; unrelated origin/path receives none; focal/related privacy and upload behavior preserved. |
| Environment/data integrity | Wrong identity; pool saturation/failure; injected mid-transaction failure | Fail closed, connections released, no partial DB unit or orphaned external object; sanitized diagnostics and bounded recovery. |
| PWA/browser/native | Approved stale asset combinations and named browser/device scenarios | No session resurrection/identity mix or duplicate writes; native offline versus rejected-401 behavior and installed-update continuity preserved. |

For hosted/browser/device execution, select tests from the completed endpoint/consumer inventory, with explicit approval and fixtures. Pure source extraction cannot establish these integrated properties.

## 6. Owner decisions still required

Approval should identify exact clauses/version, effective date, exceptions, migration scope, and authorized actions. No decision is inferred from silence or from this report.

| Decision | Recommendation for discussion | Relationship to B9 |
|---|---|---|
| Adopt revised core versus whole v0.3 | Adopt clearly specified core clauses separately; require revisions before whole-document approval. Code conformance remains separate. | DEC-01 |
| Administrator data scope | Confirm precisely which privacy/Tree permissions a centrally verified administrator may exercise; close the local username-only recognition gap through a separately agreed package. | Approved ADMIN rule; additional permission decision |
| Administrator transfer | Approve or revise the explicit pending/cancel/complete capability contract; do not broadly waive ordinary administrator verification. | New explicit decision; DEC-10 |
| Error provenance implementation | Prefer the shared provenance mechanism with a bounded creator contract; decide factory and migration ownership. | DEC-03 |
| R16-75 | Agree separately on the concrete central-handler package and acceptance contract before resuming it. Keep payload migration separate. | Existing pause |
| Canonical API envelope | Defer until consumer mapping and transitional parser contract are complete; no need to delay disclosure invariants. | DEC-02 |
| Browser support and missing Web Locks | Retain current fail-closed behavior while defining tested browsers and user recovery; approve any fallback explicitly. | DEC-04 |
| New-login supersession and replay containment | Decide each policy and transaction/concurrency behavior separately; do not equate a legitimate tab race with hostile replay without evidence. | DEC-05/06 |
| Password handling | Preserve existing no-sanitization rule; clarify any future whitespace/reuse policy explicitly before changing it. | DEC-07 |
| Native lifetime cap | Preserve documented 8-hour access, 180-day refresh issuance/rotation and conditional 30-day offline behavior pending a separate cap decision. | DEC-08 |
| CSP and browser-token storage | Agree on threat review and staged compatibility plan, not an immediate global storage rewrite. | DEC-09 |
| Privacy key protection | Decide recovery needs, hashing/migration, pending-key storage, and aggregate attempt controls. | Additional design decision |
| Governance and evidence | Assign owners, review triggers, exception authority, test thresholds and local/CI enforcement. | DEC-10 |
| Source/deployment identity | Confirm current Drive versions, staging SHA, environment/schema identity before implementation proposals are installed. | DEC-11 |
| Operational completeness | Scope dependency/runtime, static publication, retention/deletion, accessibility, resource limits and rollback standards. | Extensions to CORE/DATA/ENV/REVIEW |

The two-gate administrator identity standard itself does **not** need to be voted on again. Its scope and remaining nonconforming callers need explicit treatment.

## 7. Suggested path forward

### Phase 1 — Agree on policy and close drafting gaps

**Owner:** Project owner with IT/standards maintainer. **Outputs for review:** dispositions for DE-01–15, revised core wording, administrator permission/transfer decisions, complete existing-guide crosswalk, named owners, and decision log.

**Exit:** Each clause proposed for adoption is precise and testable, with undecided variants visibly excluded. Adoption can acknowledge current implementation gaps. This phase does not require a project-wide green test ledger and does not authorize implementation by itself.

### Phase 2 — Reconcile sources and prepare focused correction packages

**Owner:** IT/implementation engineer, subject to agreement. Verify current Drive/local/GitHub/staging/schema provenance. Prepare separate concrete packages for (a) privacy administrator recognition and approved scope, (b) central error safety and early-error cache behavior, and (c) transitional parser behavior. Map call sites and expected errors before proposing edits. Keep transfer redesign, API envelope migration, CSP/storage and native policy changes separate.

**Exit:** The owner can review exact file changes, compatibility effects, acceptance cases, rollback approach and remaining risk before agreeing to modification. R16-75 remains paused until its package is specifically authorized.

### Phase 3 — Establish bounded compliance and migrate applications

**Owner:** Implementation engineer and independent reviewer. After separate authorization, run approved offline cases, then targeted integration/browser/native acceptance. Start with one representative ordinary browser page and one Family Tree privacy/upload flow before broader migration. Inventory direct-fetch callers and document justified transport variants such as unload tracking.

**Exit:** Every migrated endpoint/client has allowed/denied/error/replay evidence and a defined compatibility range. No conversion to `WA.api` is accepted merely because the script was loaded. Shared-code changes trigger reassessment of affected earlier evidence.

### Phase 4 — Complete the project conformance and operational record

**Owner:** Standards maintainer plus security/operations reviewer. Complete endpoint-to-consumer mapping, credential lifecycles, error-handler coverage, logs/cache/XSS review, schema/resource/dependency/public-file controls and exception records. Reconcile R01–R20, S6-001–041, DE6-01–14, R-01–11 and later R16 evidence with explicit latest dispositions.

**Exit:** No unexplained endpoint, undefined mandatory acceptance reference, or unowned material gap remains in the claimed scope. Unknown deployment/device behavior remains unknown until verified; no completion percentage substitutes for the record.

### Phase 5 — Separate final Stage 6 engineering and release decision

**Owner:** Independent engineer and project owner. Review completed implementation, acceptance evidence, migration/rollback, production environment design, browser/native continuity, and residual risks.

**Exit:** Independent implementation review plus explicit owner merge/deployment authorization. **This standards report does not satisfy that final gate.**

## 8. Can the specification become authoritative?

**Yes, after revision and explicit adoption.** Its shared architecture and primary requirement structure are suitable. The needed work is focused clarification, preservation of existing obligations, complete applicability/test contracts, and enforceable ownership—not a wholesale application rewrite.

There are two different approval questions:

1. **Is the standard suitable to govern development?** Resolve its internal defects, define required behavior, preserve existing authority and isolate open decisions. Adoption may honestly list legacy nonconformance and staged migration dates.
2. **Does the current project comply, and is it ready to release?** Complete source/consumer coverage, scoped tests, operational checks, exceptions and final independent review. A well-written standard cannot answer this question by itself.

The evidence supports a combination of broad pre-existing instructions, insufficiently precise shared contracts, inconsistent adoption, documentation drift, and incomplete verification. It does not support assigning personal fault without the relevant historical instructions and code chronology. Legitimate application-specific requirements should be documented and tested, while username-only privilege checks and unexpected exception disclosure should be treated as distinct implementation problems.

## 9. Evidence index and preservation statement

Paths and line numbers refer to the reviewed commit/local snapshot. Relative links open the inspected files; use the full pinned SHA above for reproducibility. Historical report links preserve their original status.

| Evidence | Principal locations / use |
|---|---|
| Review request | [README_Design_Engineer_Review.md](README_Design_Engineer_Review.md), purpose, approved administrator rule and deliverables |
| Principal draft | [B9 v0.3](<B9 - WA_Programming_Security_Standardization_Specification_DRAFT_v0.3_B9_2026-11-11.md>), §2, decisions, Annexes A–H |
| Audit rationale | B0 initial assessment; B1 errors; B2 sessions/consumers; B3 traces; B4 representative endpoint inventory, all in this folder |
| Draft evolution | B5 v0.1, B6 completeness findings, B7 v0.2, B8 validation findings; B9 crosswalk/dispositions |
| Existing instructions | [CLAUDE.md](../CLAUDE.md), §§5, 6.6, 10.4, 11–14, 17–18; [TechSummary.md](../TechSummary.md), §§4.9, 6.7, 11–15, 20–21 |
| Central pipeline/errors | [server.js](../server.js), parsing 58–64, static 69 onward, cache/router mounts 120–185, final handler 199–215; [stage6ExpectedClientError.js](../services/stage6ExpectedClientError.js) |
| Authentication/admin | [auth.js](../middleware/auth.js); [subscriptionAccess.js](../middleware/subscriptionAccess.js); [verifyAccessToken.js](../services/verifyAccessToken.js); [administratorAccess.js](../services/administratorAccess.js); [adminManagement.js](../routes/adminManagement.js) |
| Privacy | [ftPrivacy.js](../routes/ftPrivacy.js), 24–50 membership/admin, 61–99 status/key/approval, 104 onward protection; [FTPrivacy.js](../httpdocs/js/FTPrivacy.js), 4–8 headers/interception and 23 onward access; [FTPerson.html](../httpdocs/FTPerson.html), 1371–1374 scripts |
| Shared/legacy clients | [waPlatform.js](../httpdocs/js/waPlatform.js), 16 captured transport, 41–48 parser, 59–156 refresh/request/logout; [BinForm.html](../httpdocs/BinForm.html), 480–511; [etfCompare.html](../httpdocs/etfCompare.html), 227–279 |
| Classifiers/native | [budget.js](../routes/budget.js), 77–92; [etf.js](../routes/etf.js), 15–25; [tnna.js](../routes/tnna.js), 15–35; [browserSession.js](../services/browserSession.js), cookie/Origin/lifetime/rotation |
| Environment/data | [stage6Environment.js](../services/stage6Environment.js); [dbConnection.js](../dbConnection.js), UTC/pool/startup; [package.json](../package.json), test entry point/dependencies |
| Existing tests inspected, not executed | [administrator offline tests](../tests/stage6.admin.dual-verification.offline.test.js); [refresh expected-error offline tests](../tests/stage6.r16-72.refresh-session-expected-errors.offline.test.js) |
| Stage 6 boundaries | [Open items](../docs/Stage6_OpenItems.md); [formal plan](../docs/Stage6_Render_TestPlan.md); [continuity ledger](../docs/Stage6_Current_Testing_Status.md); [audit handoff](../docs/WA_Documentation_Implementation_Audit_Handoff_2026-11-10.md) |

Earlier bounded R10/R14/R15 and R16 correction results remain preserved as reported; none was rerun, expanded, or revoked by this review. New findings identify additional coverage and remediation work. No actual production disclosure, database compromise, or fully conforming deployment is asserted.

**Work performed:** Read-only document/source/Git/GitHub inspection and creation of this report only. No existing file was edited, no test artifact was created, and no commit, push, merge, database operation, service launch or deployment was performed.
