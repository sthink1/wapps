# Wonderful Apps — Independent Design Engineer Reports: Synthesis, Decisions, Testing Impact and Implementation Plan

**Date:** November 12, 2026  
**Status:** Technical synthesis and proposed plan for owner review; no implementation authorized  
**WA authority:** Google Drive `My Drive/wonderfulApp`, `standard` folder. Drive, GitHub and WA local sources remain read-only.  

## Source and evidence scope

Primary reports:

- [Codex, `WA_Independent_Design_Engineer_Review_Codex_2026-11-11.md`](https://drive.google.com/file/d/19ZpXzxFjEOG6Mwx1z6dDa-w_PO5Y81hF/view) — 15 findings, targeted local/GitHub source inspection, no runtime or database testing.
- [Claude, `WA_Design_Engineer_Report_Overview_Suggestions_PathForward_Claude_2026-11-11.md`](https://drive.google.com/file/d/18paZWMeK0Z_pGFZxpManKjj9rMUR_Wwl/view) — present Drive source review of selected files, suggestions and phase plan, no runtime tests.

Supporting: [Stage 6 open items (dated November 9 register)](https://drive.google.com/file/d/1l2DxUZTzwA_3kqR7FfZWVtVDiNDCRQUh/view); [Stage 6 test plan](https://drive.google.com/file/d/1DUyRKaa9vph6oetGgIVe0LC6X55vTJye/view); B0–B9 in Drive. Selected source paths independently read from the GitHub `a53f7ef24be65529226a8e605b32437915fdf52c` revision, including `routes/ftPrivacy.js`, `services/administratorAccess.js`, `server.js` and `routes/geocode.js`. This review did not run tests, change project files, inspect production, or confirm live staging SHA. The November 9 register predates some R16 results; later R16 evidence must be reconciled separately rather than overwritten.

**Evidence categories:** Confirmed source = code observed in a referenced source baseline; report finding = engineer finding not independently replicated here; historical test = previously recorded bounded result; proposed = plan/decision requiring explicit owner approval. Findings are not evidence of exploitation or a production incident.

## 1. Combined summary

**Agreement:** Retain WA architecture and shared components. Do **not** adopt draft v0.3 unchanged. Make security invariants concise and enforceable; write exact producer/consumer and test contracts; keep specialized Family Tree, TNNA and public-token workflows. Separate standards adoption, code conformance, staging acceptance and production authorization. Avoid mass rewrites or combining unrelated changes.

### Shared confirmed implementation findings

1. **Unexpected 4xx disclosure, R16-74B/R16-75 / DE-02:** `server.js` central handler outputs `err.message` for any exception assigned HTTP 4xx; status alone cannot establish safe public provenance. Historical synthetic unexpected-400 and -403 cases failed the disclosure invariant. No actual sensitive disclosure is demonstrated. The central expected-error marker is not used there. Keep R16-75 paused until a narrowly defined owner-approved correction package is ready.
2. **`WA.api` representation mismatch, DE-06:** `waPlatform.js` parses `data.error` as if it were text; central handler returns nested `{error:{message:...}}`. Source mismatch confirmed, user-facing regression not tested. Define backwards-compatible string-only normalization while preserving domain response fields and no-content/network/cancellation semantics.
3. **Privacy administrator bypass of common recognition, DE-01:** `routes/ftPrivacy.js` line 47 has `isAdmin(c,userID)` checking `UsersT.UserName` against literal `sthink` without `IsAdministrator` or `ADMIN_USERNAME`. The approved `services/administratorAccess.js` requires both current DB designation and matching configured username. The privacy helper influences Tree fallback and private-person access. Outer authentication/subscription gates still apply; this is not anonymous access. Actual state/exploitation not checked.
4. **Documentation drift, DE-04:** `TechSummary.md` §6.7 and `CLAUDE.md` around line 417 retain administrator descriptions inconsistent with the approved two-gate rule. The design rule itself is settled; no need to reopen it.
5. **Incomplete shared frontend/API adoption, DE-09/11:** Several pages load `waPlatform.js` but use direct Bearer fetch; Family Tree privacy's wrapper and WA's captured `nativeFetch` require careful transport-order/header-scoping tests. Merely loading shared code is not compliance.

### Codex-specific material issues

- **DE-03:** Admin transfer `/pending`, `/cancel`, `/complete` has an intentionally unusual capability/session/transaction flow; ordinary two-gate identity must not be imposed mechanically during transfer completion. Owner must specify privileged transfer authority and administrator scope for private Tree data.
- **DE-05:** Create safe intentional errors through an approved bounded creator/factory contract; marker presence alone does not guarantee text safety. Preserve legacy adapters during migration; do not mark caught provider/SQL exceptions.
- **DE-07:** v0.3 consolidation omitted or weakened existing safe DOM rendering/input sanitization/password-preservation obligations; restore normative frontend standards without forcing an immediate CSP rollout.
- **DE-08:** Family Tree human-selected privacy keys appear application-readable in pending/current storage; choose verifier/recovery/migration/attempt protections after threat and compatibility review. No incident claimed.
- **DE-10:** `no-store` middleware is mounted after body/multipart parsers; parsing failures may bypass sensitive response caching rules. The ordering gap is confirmed; actual cache exposure untested.
- **DE-12:** Keep DB compatibility, UTC vs date-only, connection/resource budgets, transaction/compensation and explicit test-to-production environment guard rules.
- **DE-13:** Several referenced acceptance test IDs are not executable cases, and no complete mandatory test gate has been established. Existing isolated and hosted test evidence remains valuable but bounded.
- **DE-14:** Define dependency/runtime, lockfile, build/signing and public static-file publication rules; `_COPY` files in `httpdocs` require reviewed inventory before any deletion.
- **DE-15:** Short governing core + technical annexes, owner/maintainer assignments, change approvals, evidence index. Preserve whole-file HTML formatting requirement while keeping formatting and semantic changes reviewable.

### Claude-specific observations and proposals

- **Public `GET /api/geocode/reverse`:** inspected source concatenates unvalidated `lat`/`lon` into Nominatim URL; Node built-in `fetch` does not use the shown `timeout:8000` as a timeout mechanism; no limiter/cache visible in route. Investigate bounds, URL encoding, abort deadline, upstream acceptable-use and cost/rate controls. Fixed host makes direct arbitrary-host SSRF unlikely; don't exaggerate to a proven incident.
- **Public `POST /send-email`:** endpoint in `server.js`; no limiter apparent in the inspected file, but route-wide/global protection not yet established. Provider failure responds 400, a questionable error classification. Investigate abuse controls and original Contact Us response contract before changing.
- **Security headers/CSP:** no header middleware identified in inspected `server.js`; hosting and live response headers were not examined. Access tokens remain JS-readable, so XSS risk warrants explicit staged mitigation; strict CSP compatibility with inline JS is unresolved.
- **Asset cache/version skew:** HTML and JS may update at different times; actual service-worker behavior not reviewed. See Stage 6 S6-024.
- **Operational hygiene:** potential unnecessary imports, Web Locks browser fallback, clock skew, unused comment, CORS PATCH wording, supported DB and runtime versions. These are secondary to security/access gaps and require verification before modification.
- **Usability:** a short, roughly ten-rule daily programming core plus detailed annexes and a generated endpoint/method registry; migrate callers in bounded groups instead of all at once.

## 2. Questions requiring decisions or verification

### A. Owner decisions blocking policy/remediation design

**D1 — Administrator permissions.** Does a verified administrator automatically have permission to view/unlock every private Family Tree Person? Or should they require Tree membership/page-token or a separately approved, auditable support workflow? Identity verification is already approved; *permission scope* is not.

**D2 — Administrator transfer.** Approve or revise a distinct limited transfer completion protocol: initiator/current session, target, pending capability, configuration transition, expiry, replay/rollback and recovery. Do not require the old administrator to pass the post-transfer configured-name test during legitimate completion.

**D3 — Expected-error provenance.** Adopt current shared `WeakSet` classification for intentional client errors, preferably through a bounded factory with fixed/approved status, code/message and no arbitrary caught exception adoption? Confirm ownership and adapter strategy for Budget/ETF.

**D4 — API error envelope.** Initially preserve existing route wire formats, add a tolerant client parser and fix disclosure separately; defer choice of a future global flat versus nested response envelope until consumer inventory is complete? This is recommended to avoid unnecessary regressions. Claude favors flat strings as the eventual default; Codex recommends deferral pending compatibility mapping.

**D5 — R16-75 and privacy correction authorization.** After D1–D4 and narrow change/test/rollback plans, separately approve the privacy admin fix, central error safety (and early-parser cache behavior), and frontend parser change. Decide release sequencing individually; no change is authorized merely by approving this plan.

**D6 — Privacy key policy.** Is key recovery required? May human-selected keys be stored only as non-reversible verifiers? How are pending approvals, active keys, backups, migration, reset and aggregate brute-force controls handled?

**D7 — Browser, web token and CSP.** Supported Chrome/Edge/Firefox/DuckDuckGo versions; behavior when Web Locks are absent; acceptance of transitional `localStorage.token`, phased CSP/report-only and security headers; accessible recovery UX.

**D8 — Native and browser lifecycle.** Maintain current TNNA 8-hour access/180-day refresh and conditional offline behavior; decide absolute cap later. Separately decide web new-login supersession, replay containment and password reuse/whitespace policies without changing them implicitly.

**D9 — Standards authority.** Approve a short governing core plus versioned annexes, one owner/maintainer, rule IDs, exception/decision records, effective dates, evidence responsibilities, and review gates. Approving a standard is not certification of current code or permission to deploy.

### B. Facts to verify before selecting technical changes

**V1.** Current Drive/local/GitHub/staging commit and schema identity; determine whether source findings are still present at the actual candidate code baseline. Codex confirms `a53f7ef` parent `b5e2b06` differed only in documentation, but deployment was not verified.

**V2.** Complete per-method access/consumer inventory, including dynamic Budget routes, Family Tree privacy/admin transfer, `/send-email`, geocode, notifications and TNNA. Identify every `error`, `message`, `error.message` consumer and required business fields.

**V3.** Existing limiter, body-size and Origin protections for public email/geocode and login, across global, host and route layers. Inspect actual live security/cache headers and PWA `sw.js` behavior.

**V4.** Actual production/test DB engine/version and lowest compatibility target; runtime/Express versions; real JWT/refresh expiry parameters and connection limits.

**V5.** Confirm whether `FTPrivacyRequestT.ProposedKeyCode` and `FTPersonPrivacyT.KeyCode` are plaintext/application-readable in live schema; understand encryption-at-rest, access, backups and privacy-key usage before any migration.

**V6.** Identify all test cases behind B9 Annex IDs, original R10/R14/R15 and subsequent R16 records, coverage baseline, current outcome, and test fixtures. Do not mark a report assertion as newly executed testing.

## 3. Implications for prior testing

**General rule:** Do not invalidate an entire bounded PASS because a new review found a different untested path. Do not broaden a bounded PASS into a security certificate either. Record *PASS remains valid in its original scope; new gap OPEN*. R10/R14/R15 and the later R16 targeted passes need evidence/commit matching at review time.

| Previously recorded evidence | Preserve | Reassess or add |
|---|---|---|
| R10 Home/session recovery and offline synthetic paths, bounded PASS | Same fixtures and expected results at the original baseline | Shared parser/session changes require selected 401/403/5xx/network regression; browser and unsaved form coverage still limited |
| R14 administrator/subscription/denials, bounded PASS | Tested administrative status, subscription access and representative protected APIs | NEW: negative privacy case with username `sthink` but `IsAdministrator=0`, mismatched config, another designated administrator; verify private data/Tree scope; admin transfer continuation |
| R15 Family Tree privacy/upload, Budget/ETF, tracking, bounded PASS | Observed tested flows and data side effects | NEW: privacy administrator bypass and token wrapper composition; upload/GET/POST and private focal vs related data after any transport change. No need to rerun all R15 before a relevant code change |
| R16-55–73A targeted Family Tree/Notifications/Subscriptions/Tracking/refresh corrections | Preserve exact passing assertions and bounded local/hosted outcomes | Shared handler/classifier change requires targeted positive/negative validation and status/envelope compatibility; do not undo corrected route-level safety |
| R16-74B central synthetic 400/403 | Preserve observed failed disclosure expectation and 500/503 sanitized observations | Separate R16-75 isolated/integrated tests for 400/401/403/409/500/503, headers-sent, early malformed JSON, no-store, logging, error envelope; NOT yet PASS |
| R08 cookie/origin, Group 0d environment, TNNA native/API samples | Keep original scoped passes | Public endpoints, pre-router parser errors, cross-browser Web Locks, installed TNNA/device remain outside confirmed scope |

**Track impacted Stage 6 items:** S6-041 (API responses), S6-005/008/018/033 (shared request/error contracts), S6-009/017 (admin/privacy), S6-019/024 (Origin/cache), S6-028/030 (XSS/logging), S6-014/035 (review/traceability), S6-010/032 (TNNA) as relevant. Add a separate privacy administrator discrepancy and privacy-key decision to the findings register; do not mislabel them as previously tested R14 cases. Reconcile with later R16 results and newer logs before changing current statuses. No new tests were run for this synthesis.

## 4. Recommended implementation program

**Phase 0 — Decisions and source pinning (no code).** Approve the governing security invariants (two-gate administrator identity already approved; no raw unexpected error text; preserve ownership/privacy, no mutation replay). Settle D1–D5 necessary for narrow fixes, name owner, and pin Drive/local/staging source and test database. Produce updated prioritized finding-to-standard matrix. Exit: explicit decisions, precise candidate commit, separation of spec adoption vs conformance and authorized work.

**Phase 1 — Standards revision and targeted review files (download-only).** Publish proposed v0.4 as a short binding core plus detailed annexes; correct *both* `CLAUDE.md` and `TechSummary.md` administrator wording through separately prepared replacements; preserve existing frontend sanitization, HTML, DB compatibility and native requirements. Include controlled administrator-transfer, privacy-key, capability and early-cache requirements. Include unresolved decision ledger and exception register. Reviewers assess v0.4 before it becomes authority; user installs approved files manually.

**Phase 2 — Baseline inventory and isolated test scaffolding (no production).** Prepare download-only route/method/consumer registry and read-only extraction script; obtain scope approval before installation/execution in an authorized test environment. Build deterministic no-network tests for privacy admin negative and positive, transfer capability, central unmarked errors, early-parser no-store, `WA.api` string/nested parser, public route validation and Family Tree transport. Preserve fixture/status/envelope/headers. Exit: tests can reproduce current defects and protect existing positives.

**Phase 3 — Small security corrections, individually approved.** Recommended priority: (a) privacy `isAdmin` compliance with approved centralized two-gate verification, with scope separately decided; (b) safe unexpected 4xx handling R16-75 and early-error no-store as separately reviewable work; (c) compatible `WA.api` parser. Claude suggests parser first, Codex emphasizes privacy security; exact sequencing can be chosen after consumer/integration dependencies are mapped. Each package contains complete proposed files, semantic diff, bounded offline/hosted test plan, rollback and user approval. Preserve current response schemas until D4 is settled. Never combine envelope redesign with disclosure safety merely for convenience.

**Phase 4 — Public endpoint and platform hardening.** Confirm then address `/send-email` validation/abuse/rate/5xx semantics and `/api/geocode/reverse` coordinate checks, timeouts, caching and provider policies; separately test CSP headers, XSS/rendering, service-worker asset versioning, static `_COPY` exposure and dependency/runtime issues. Implement only after each actual defect and compatibility requirement is verified. Coordinate with current user experience and external provider policy.

**Phase 5 — Incremental shared-platform adoption.** A documented, tested shared `WA.api`/`WA.session` contract and Family Tree page-token integration must precede migration. Begin with one ordinary browser page plus one guarded Family Tree privacy/upload case, then migrate-on-touch in bounded app groups. Protect authenticated mutations against automatic replay, preserve unsaved forms, and keep browser/client ownership transitions safe. Require allowed/denied/error/network test results for each migrated consumer. Preserve direct-fetch variants that have explicitly approved technical reasons (e.g., unload tracking).

**Phase 6 — Stage 6 reconciliation and independent release gate.** Reconcile R01–R20, S6-001–041 and later R16 evidence, admin/privacy findings, DE6/R history, current baseline, and test/run records. Run remaining authorized staging/browser/TNNA/concurrency/failure checks. Complete environment, backup, migration, rollback and postflight plans. Obtain independent engineer review **of the implemented and tested result**, then explicit owner approval before any `main`, production, or installed-device change. Standards approval alone does not discharge S6-014.

### Immediate next artifact / step

A **Decision Register v1** is the lowest-risk next step: list D1–D9 with default proposals, open alternatives, rationale and owner disposition; append a prioritized defects register giving the privacy administrator bypass and central unexpected 4xx disclosure the highest code-correction urgency. Follow with source/consumer pinning. No project file changes until the owner approves one named package.

## Bottom line

Codex and Claude corroborate the core standardization diagnosis. The important newly uncovered issue is the privacy username-only administrator recognition path, which does not follow the owner's approved policy. The central error exposure and client parser mismatch remain. Earlier targeted test passes retain their bounded meaning; new negative cases are necessary. Adopt a concise, enforceable specification and remediate in evidence-based, separately approved increments, with the final Stage 6 independent implementation and rollout gate retained.
