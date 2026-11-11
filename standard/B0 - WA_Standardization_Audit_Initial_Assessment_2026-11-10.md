# Wonderful Apps — Documentation-to-Implementation Standardization Audit

**Assessment date:** November 10, 2026  
**Status:** Initial, evidence-bounded assessment; **not** an approved architecture revision, final certification, or authorization to change code  
**Priority:** Cross-module standardization  
**Access:** Read-only Google Drive and GitHub. No project, repository, database, deployment, or production changes.

## 1. Executive assessment

The current October 13 development documents expressly call for consistent error handling, shared utilities, review of current source and related routes, and updated architecture documentation. However, they do not provide a fully defined **backend exception-to-public-response contract** establishing when a 4xx exception's `message` is approved for public display. The Stage 6 issue register adds explicit standardization objectives (S6-005, S6-008, S6-018, S6-033), and S6-041 explicitly calls for an agreed error-response policy and route inventory. Thus the documentation framework anticipates standardization but lacks a sufficiently prescriptive, enforceable rule for this particular boundary in the older primary guides.

At GitHub `sthink1/wapps`, commit `b5e2b06`, the shared `services/stage6ExpectedClientError.js` marks intentional client errors with a WeakSet, and `routes/users.js` applies the classification in `/refresh-session`. In contrast, `server.js`'s central error handler returns any nonempty `err.message` when the HTTP status is 400–499, without checking the shared marker. This is a **confirmed implementation inconsistency** in the inspected snapshot. The handoff reports isolated synthetic R16-74B tests that disclosed unexpected 400/403 messages, while unexpected 500/503 responses were sanitized. This is evidence of a vulnerability class, **not proof of real hosted or production sensitive-data disclosure**.

**Causation remains unproven.** The current documents were updated October 13; the relevant shared marker and route corrections arose during subsequent Stage 6 work. A claim that an original programmer violated an applicable requirement at the time of authorship would require historical versions, relevant source introduction dates, and adoption evidence.

## 2. Authority and version inventory

| Source | Located version / location | Authority and caveat |
|---|---|---|
| [CLAUDE.md](https://drive.google.com/file/d/13pKcBtg-NQ5coGcC-wZHzVVQih5qMFXC/view) | Root `My Drive/wonderfulApp`; document says updated 2026-10-13; Drive modified 2026-10-13 | Current primary development guide; another older Sept copy exists elsewhere. |
| [TechSummary.md](https://drive.google.com/file/d/1cpX9wRKFFFpldaWfaeWq6Wnoqs8mVE5-/view) | Same authoritative root; document says updated 2026-10-13; Drive modified 2026-10-13 | Current high-level architecture; another older Sept copy exists elsewhere. |
| [Stage6_Render_TestPlan.md](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view) | `docs/`; consolidated v2.3, internally dated 2026-11-09; Drive metadata modified 2026-11-10 UTC | Maintains formal test/evidence ledger; historical snapshots embedded. |
| [Stage6_OpenItems.md](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view) | `docs/`; internal revision 3.3 dated 2026-11-09; Drive metadata modified 2026-11-10 UTC | Open issues, normative criteria and historical addenda; do not treat superseded snapshots as current facts. |
| [Stage6_Current_Testing_Status.md](https://drive.google.com/file/d/1jKtvqVGGA2nhPASsJmJZJlP11ZNFS3BB/view) | `docs/`; prepared 2026-11-10 | Operational continuity snapshot with earlier evidence cutoff; later November 10 R16-74B handoff adds new evidence. |
| GitHub source | [`b5e2b06`](https://github.com/sthink1/wapps/tree/b5e2b06), branch `reviseLogIn` snapshot | Pin to last user-confirmed hosted Live staging commit, **not** proof that branch HEAD or Drive working copies are identical now. |

**Authority rule:** Google Drive root documentation is the maintained review baseline. Actual source controls observed behavior; documentation cannot override executable code. Historical authoring-time obligations remain unknown until version history is examined.

## 3. Evidence-based requirements traceability matrix

**Status vocabulary:** `Documented / implemented` means a sampled source implementation is consistent; `Deviation` means inspected code conflicts with an explicit applicable contract or with a cross-module pattern; `Documentation gap` means the written rule is not operationally precise enough; `Open / requires test` means coverage cannot yet be certified. These labels do not imply entire-project certification.

| ID | Documented requirement and location | Actual source / observation | Initial assessment | Risk / confidence |
|---|---|---|---|---|
| STD-01 | CLAUDE §14, lines 1005–1012: follow existing route/module style, suitable HTTP status codes, **consistent error handling**, avoid duplicating shared utilities. | `server.js` lines 199–215 uses status and unmarked `err.message` for 4xx; `routes/users.js` lines 263–270 requires expected-error marker. | **Cross-module inconsistency confirmed**; CLAUDE guidance is broad rather than a precise exception contract. | High / high for inspected code; medium for requirement interpretation. |
| STD-02 | Stage6_OpenItems S6-041, lines 368–375: approve response policy, inventory public/authenticated APIs, distinguish approved validation from unexpected exceptions, test both. | Central handler has the R16-74B unexpected 400/403 synthetic disclosure; no exhaustive current route inventory examined in this assessment. | **Open finding**, acceptance not met. | High / high for localized finding. |
| STD-03 | Stage6_OpenItems S6-033 line 175: consistent `WA.session`/`WA.api` naming, HTTP error envelope, origin config, usage/navigation conventions; line 218 requires integration and regression checks. | `server.js` central handler produces `{error:{message:...}}`; `routes/users.js` refresh produces `{error:'...'}`; `utils.js` uses `{error:'...'}`. | **Response shape inconsistency observed**; no approved endpoint-by-endpoint compatibility contract yet established. | Medium / high for observed shapes; user-visible breakage not tested. |
| STD-04 | Stage6_OpenItems S6-008 and S6-018, lines 150, 160, 193, 203: distinguish 401, 403, network failure and 5xx, preserve unsafe requests and form state. | `routes/users.js` has specific statuses; no full frontend/API-path verification performed in this phase. | **Open / requires cross-module tests**. | High / medium. |
| STD-05 | CLAUDE §11, lines 882–890: no secret logging; enforce ownership; validate inputs; parameterized SQL; server-side security. | `utils.js` lines 30–35 logs generic DB failure and sends fixed duplicate/default messages in the sampled helper. | **Sample consistent**, not full module certification. | High importance / high for sampled helper. |
| STD-06 | TechSummary §12, lines 1109–1127: shared processing path through CORS, authentication, subscription, route authorization, DB, JSON, safe output, logging/error handling. | Existence of central Express handler and marker is confirmed; entire middleware ordering, routes and propagation graph not yet audited. | **Architecture descriptive, error semantics underspecified**; coverage open. | High / medium. |
| STD-07 | CLAUDE §17 lines 1114–1134: pre-change frontend/backend/schema/ownership/validation review, appropriate tests, update both docs for architectural changes. TechSummary §20 lines 1343–1369 parallels checklist. | Recent Stage 6 has bounded isolated and hosted tests, but repository-wide enforcement and historic document consultation cannot be inferred. | **Process documented; enforcement not verified.** | Medium / high documentary fact, unknown compliance. |
| STD-08 | Stage6_OpenItems S6-005, lines 147 and 190: shared authenticated request/session handling with per-app regressions, no unrelated UI changes. | Earlier R15 representative app coverage accepted; entire system inventory remains open in register. | **Open**; do not convert bounded PASS into global certification. | High / high documentary fact. |
| STD-09 | CLAUDE §14 line 1018 and TechSummary §21 item 21 line 1396: update both docs for architectural changes. | Primary guides dated Oct 13, while Stage 6 central expected-error-marker pattern is later; whether docs were intentionally left pending Stage 6 completion is unknown. | **Possible documentation synchronization gap**, not yet a historical violation finding. | Medium / medium. |
| STD-10 | Stage6_OpenItems S6-014 line 156 and test plan release gates: independent design engineer must review before production or main. | No final approval represented in handoff. | **Open mandatory gate**. | Critical / high. |

### Exact inspected implementation points

1. [`server.js` lines 199–215](https://github.com/sthink1/wapps/blob/b5e2b06/server.js#L199-L215): `statusCode` preserves any supplied 400–599 status; messages for statuses under 500 are exposed if nonempty, regardless of intentional/error classification. Handler comment claims unexpected exceptions should not be exposed, making the discrepancy **within the file itself**.
2. [`services/stage6ExpectedClientError.js` lines 1–19](https://github.com/sthink1/wapps/blob/b5e2b06/services/stage6ExpectedClientError.js#L1-L19): explicitly states that unexpected exceptions' numeric statuses alone are insufficient and implements `markExpectedClientError` / `isExpectedClientError` with a WeakSet.
3. [`routes/users.js` lines 263–270](https://github.com/sthink1/wapps/blob/b5e2b06/routes/users.js#L263-L270): `/refresh-session` exposes `e.message` only when status <500 **and** `isExpectedClientError(e)`; otherwise the fixed string `AUTH_SERVICE_UNAVAILABLE`.
4. [`utils.js` lines 30–35](https://github.com/sthink1/wapps/blob/b5e2b06/utils.js#L30-L35): sends generic errors rather than raw exception messages; the duplicate-entry branch exposes a fixed string.
5. Source risk recorded by November 10 handoff: R16-74B synthetic `unexpected400Disclosed=true`, `unexpected403Disclosed=true`; 500/503 sanitized; statuses preserved. This **isolated test** was not re-run during this documentation audit.

## 4. Standardization assessment priorities

### 4.1 Error handling — highest immediate priority

**Documented:** consistency expected in CLAUDE; S6-041 demands an agreed policy. **Implemented in sample:** a shared intentional-error marker exists, but is not consistently applied to the central handler. **Assessment:** direct inconsistency and normative-document gap. **Decision required later:** define an explicit approved/public exception contract across middleware and route responses, retaining intentionally exposed validation codes and expected HTTP status semantics. Do **not** change implementation as part of this assessment.

**Proposed acceptance questions (not yet approved standards):**
- Which component may designate a client error as intentional? Is a non-forgeable marker required?
- Which public fields and status values can be emitted for expected versus unexpected errors?
- How will system-wide errors, app-specific validation and client-facing localization coexist?
- Does the response use `{error:string}`, `{error:{message:string}}`, or a documented compatibility scheme for already-deployed consumers?
- How will every route and middleware error path be checked with both approved-validation and synthesized-unexpected failure cases?

### 4.2 Authentication and session

**Documented:** S6-005 and S6-008/018 request common session/request behavior across Budget, ETF, Family Tree, Tracking and other apps. **Current boundary:** earlier bounded Stage 6 tests are preserved; no full route/page inventory completed in this assessment. A standard must distinguish access-token expiry, refreshable state, terminal revocation, Origin rejection, subscription denial and network availability without automatic unsafe mutation replay.

### 4.3 Authorization

**Documented:** CLAUDE §11 requires server-side ownership checks in user-owned routes, separate from subscription rights. TechSummary's request path places `authenticateToken`, `requireAppAccess`, and route authorization at separate layers. **Assessment:** requirements reasonably clear conceptually; implementation coverage and privilege path matrix remain open. Do not substitute frontend disabled controls for backend authorization.

### 4.4 API response contract

**Observed:** central handler's nested `error.message` and refresh/DB helpers' string `error` shapes differ. **Assessment:** S6-033 already documents this as open standardization work. Before mandating a single wire format, enumerate real consumers and legacy compatibility; avoid breaking successful existing UI paths. Formalize response status, stable machine-readable code, optional approved user-facing text, correlation ID policy, and cache headers only after tracing dependencies.

### 4.5 Logging and sensitive-data protection

**Documented:** CLAUDE §11 explicitly forbids sensitive credential/token logging; S6-030 requires reviewing logging, error payloads, URLs and diagnostics. **Inspected:** central handler logs generic status; sampled DB helper logs generic failure. **Gap:** standard needs an approved structured metadata allowlist and checkable tests across all logging surfaces; no whole-project scan or runtime evidence in this phase.

### 4.6 Shared utilities

**Documented:** CLAUDE §14 prohibits unnecessary utility duplication; Stage 6 shared client-error marker exists. **Observed:** separate response handling paths do not share identical safety decisions. **Assessment:** shared abstractions must have declared ownership, API, call-site adoption inventory and unit tests; existence alone is not standardization.

### 4.7 Testing and review gates

**Documented:** CLAUDE §17 provides pre-change impact review; Stage 6 S6-041 requires route inventory, policy, targeted tests, independent review; S6-014 requires final independent review. **Assessment:** strong procedure intent, but the primary guides do not yet prescribe an automatic, repository-wide error contract regression gate. This is a **proposed enhancement**, not an approved new obligation.

### 4.8 Documentation authority

**Documented:** primary guides say read current source and update both guides when architecture changes; TechSummary explicitly recognizes executable code as behavioral authority. **Needed:** distinguish mandatory (`MUST`) standards from descriptions of current behavior, proposals, historical tests and temporary Stage 6 transition rules. Date, status, owner and applicability should be recorded for any new contract; version history is needed before attribution.

## 5. Why did the weakness recur? Evidence classification

**Confirmed from current documentation:** broad consistency and review expectations existed by October 13; a precise public-exception message contract was not found in the inspected main-guide sections; later Stage 6 explicitly called for an agreed policy.  
**Confirmed from source at `b5e2b06`:** user-refresh handler checks the shared marker while central handler does not; their public error JSON envelopes also differ.  
**Confirmed by prior isolated test, as reported in handoff:** unexpected 400/403 exception strings reach the central handler's public response in synthetic cases.  
**Reasonable inference:** architectural consistency depends partly on localized developer choices in the absence of a fully specified, machine-testable contract.  
**Not established:** what exact documentation existed when each original route was written; whether authors consulted it; all live deployment behavior; whether real secret data leaked; whether every active module shares the problem; whether primary documentation is presently out of sync due to intentional pending Stage 6 completion.

## 6. Proposed standards governance model — for review, not adoption

A future approved WA specification could assign versioned normative contracts to: (1) server error classification and public envelope, (2) authenticated API/session behavior, (3) authorization/ownership and subscription boundaries, (4) cache/CSRF/Origin behavior, (5) structured logging/redaction, (6) shared-module ownership, (7) regression tests and release gates. Each standard should record rationale, required and permitted behavior, prohibited behavior, precise exceptions, source owner(s), verification tests, migration/compatibility plan, and approval history. Primary guides should link to the normative contract rather than maintaining contradictory copies.

**No source or documentation revisions are authorized by this proposal.** R16-75 remains paused. Design and code remediation should follow the user-approved documented policy and independent review process.

## 7. Test evidence preserved, without retesting

- R16-55–62 Family Tree / Notifications / Subscriptions: earlier 32/32 targeted checks and representative local/hosted acceptance reported PASS.
- R16-63–66 Family Tree privacy: 11/11 isolated checks; staged and hosted intentional cases PASS.
- R16-68–70A Tracking provider notes: 6/6 offline and representative local/hosted response acceptance PASS; actual hosted provider failure not induced.
- R16-71–73A refresh-session: 11/11 isolated checks and bounded local/hosted no-cookie 401 `REFRESH_INVALID` PASS; actual unexpected hosted failure not induced.
- Earlier R10/R14/R15 bounded PASS remains unaffected. No global Stage 6 percentage recalculated.
- R16-74B central handler: isolated unexpected 400/403 disclosure confirmed; no live sensitive-data disclosure established. R16-75 not started.

The specific evidence and limitations above are carried from the user-provided November 10 audit handoff and earlier current Stage 6 documents, not independently re-executed in this assessment.

## 8. Next controlled audit step

Before proposing implementation changes, expand the source-level route inventory and trace the error path for `server.js`, `routes/users.js`, `services/browserSession.js`, `services/stage6ExpectedClientError.js`, `routes/familyTree.js`, `routes/ftPrivacy.js`, `routes/notifications.js`, `routes/subscriptions.js`, and Tracking/ETF/Budget modules. For every concrete throw/`next(error)`/catch response, record original status, whether the error is intentional, public payload, logging output, client consumers, and regression evidence. Review historical doc revisions only if a cause/attribution conclusion depends on timing. Then present the draft common contract for explicit user approval; do not install it or begin R16-75 without that decision.

## 9. Limitations of this initial assessment

The authoritative documents were searched and selected relevant sections examined; **not every line of the large Stage 6 documents was individually reconciled**. GitHub inspection was deliberately limited to five files at the pinned commit, and sampled source excerpts; the route inventory and module-level control-flow proof are incomplete. Current Drive and local working-file equality, current branch HEAD, and actual current Render runtime beyond the handoff's user confirmation were not independently reverified. This report is an initial, traceable standards assessment, not an exhaustive file-by-file certification.
