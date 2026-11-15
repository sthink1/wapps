# Wonderful Apps — Comprehensive Standards Compliance Register

**Register version:** 1.1 — functional application scope (proposed replacement)  
**Original baseline:** version 1.0, November 15, 2026; SHA-256 `98802fb680668fc0547aa11445f058aa4274e6a34390e223bffc8877411a6a6f`  
**Revised:** 2026-11-15  
**Proposed installation path:** `docs/WA_Standards_Compliance_Register.md`  
**Authority:** Owner review and installation required; this download does **not** change any authoritative file.  
**Scope:** Files required to build, serve, execute, secure, configure, or deliver functional Wonderful Apps browser/backend/TNNA behavior; **not a completed functional-file audit**. Documentation, historical copies and unrelated administrative files are out of the application-file denominator.

> **Project completion objective:** Examine every *functional* WA file, correct confirmed nonconformances or obtain documented owner-approved exceptions, and verify functionality, compatibility and compliance. Include TNNA under the same approved WA standards with only technically warranted, documented and verified native-specific differences. This register is a work-control instrument; it does not itself certify implementation.

## 1. Status, approved scope and truthfulness rules

### 1.1 Functional-source inclusion rule — owner approved November 15, 2026

**One WA standards framework governs browser apps, shared backend and TNNA.** All twelve approved Core Standards and relevant Detailed Standards apply to every functional file. A native implementation may vary only when a specific Android/Capacitor/device feature warrants it, consistent with D10, and the reason, affected contract, security implications, compensating safeguards and native-specific regression evidence are recorded. Differences do not waive privacy, authorization, data integrity, change control or preservation rules. Apply standards **where relevant**; record N/A with reasons rather than demanding irrelevant browser-only mechanics in native code.

**Include** hand-maintained and generated functional artifacts, in proportion to their role, when they are loaded, imported, mounted, invoked, bundled, built, packaged, configured, referenced as runtime assets, or required for an operational migration. The primary groups are:

| Group | In-scope functional examples | Applicability focus |
|---|---|---|
| A1 Browser UI | `httpdocs/*.html`; nested HTML and browser-facing templates | UI/DOM/CSS/scripts, accessibility, auth/session, privacy, fetch and PWA |
| A2 Browser code | `httpdocs/js/*.js`, nested JS modules, service worker(s) | API contracts, error/refresh/retry, security, caching, shared library use |
| A3 Browser assets | `httpdocs/css/`, manifest, icons, images, fonts and other referenced assets | Functional references, browser compatibility, rendering, integrity, cache; only applicable standards |
| A4 Server entry/utilities | Root `server.js`, `send_email.js`, `dbConnection.js`, `utils.js`, `logger.js`, other imported/invoked root code | Execution, security, API, logging, DB and credentials |
| A5 Routes and middleware | `routes/`, `middleware/` functional sources | Methods/paths, validation, access, errors, side effects |
| A6 Services and supporting modules | `services/` and other imported runtime modules | Auth, sessions, data, API, admin, storage and environment controls |
| A7 Build/runtime configuration | `package.json`, lockfiles, `.node-version`, relevant deployment/env templates, server or asset build configuration | Dependencies, startup, platform drift, configuration; do not collect secret `.env` values |
| A8 SQL needed for operation | SQL schema/migration/seed scripts **only when** operationally required for current functionality, permitted migration or deployment | SQL safety, schema/data compatibility, controlled migration; **database dumps and backups excluded** |
| B TNNA native | Active `TNNA/` app code, Capacitor/Android configuration, assets, manifests, build/packaging files | Same WA standards plus justified native token, offline, lifecycle, permissions and D10 differences |
| T Supporting tests | Active test files **only as dependencies and evidence**, not part of the functional application conformance denominator unless shipped/invoked by an app in operation | Preserve and review when a source correction affects their assertions; no wholesale test-file audit |

**Exclude from the functional-file audit denominator:** `standard/`, `docs/`, `change/`, `skills/`, root `README*`, `INSTALL*`, historical design/review documents, logs, backups, copies and other material not needed for app operation. Such files may still be **read as authority or evidence**, and newly authored tests/change reports must follow their own applicable quality and preservation requirements. Do not discard or delete them. `CLAUDE.md`, `AGENTS.md`, `TechSummary.md`, and AI tool instructions are authority/context, **not operational audit units** unless actually used at runtime/build time. An apparent backup such as `*_COPY*` is excluded only after checking actual references, entrypoints and package/deployment inclusion; naming alone is not proof.

**Inclusion test:** Is this exact file used by execution, API routing, database operation, frontend rendering, native app, build, deployment/runtime configuration or a required operational migration? If yes, include (or link as a functional dependency). If no, exclude with a short reason *only when encountered during functional source discovery*; no inventory of excluded documentation is required. Unknown dependency status is `Needs classification`, not automatically excluded. Avoid treating package dependencies (`node_modules`), generated Android outputs or third-party artifacts as hand-maintained source: record their version/build provenance and relevant operational security, not line-by-line formatting audit.

### 1.2 Status and evidence rules

- **Audit state:** `Not inventoried` → `Inventoried` → `Audited` → `Gap identified` or `Conforming (verified)` / `Approved exception`. A file can have several open findings. Code existence does not equal audit completion.
- **Correction state:** `Not proposed` → `Scoped` → `Approved` → `Prepared for download` → `Owner installed` → `Tested` → `Verified closed`; each is separately evidenced.
- **Finding classification:** `Confirmed source nonconformance`, `Permitted legacy / migration debt`, `Unverified risk`, `Documentation-only reference`, `Candidate exception`, `Approved exception`, `Test/evidence gap`. Direct fetch by itself is not a proven vulnerability.
- **Evidence tiers:** Source/document observation; isolated/offline; local HTTP/browser; hosted staging; native/device; independent review. Preserve bounded scope. A Render `Live` indicator does not demonstrate app acceptance.
- **No automatic edits:** Drive, GitHub and owner's existing local WA files are strictly read-only. Proposal downloads must include complete final files and per-revised-file `.diff`, `.md` verification, SHA-256, dependencies/rollback and required tests. Owner controls installation and all environments.
- **No new policies by implication:** Modernization, browser token architecture, changes to public safeguards, full admin capabilities, native session policy and database changes retain existing approved/explicitly deferred boundaries.
- **Current reference checkpoint:** Owner screenshot shows staging branch `reviseLogIn` at abbreviated commit `2a92b2f` (`wave 0`, Live November 15, 2026, 10:09 AM). Owner reports its contents include the prior Wave 0 `BinForm.html` download and that fresh local files were copied to Drive. This is an owner-reported/screenshot-supported checkpoint, **not** a verified full Git SHA, file equality or browser acceptance; recheck current Drive file IDs/hashes and corresponding GitHub baseline before the next correction.

### 1.3 Verified-denominator completion accounting

Track separately: `functional files inventoried`, `functional files audited`, `conforming verified`, `open gaps`, `legacy debt`, `corrections prepared`, `owner installed`, `verified closed`, `approved exceptions`, `needs classification`, and `native files audited`. The denominator is **verified active functional files**, not all Drive items. Do not publish a completion percentage before recursive functional discovery and dependency reconciliation are complete. Cross-file findings are linked to affected file rows, never multiplied into fake file counts. Source and test evidence are distinct.

## 2. Approved Core Standards — all 12 are in scope

| Core | Governing requirement | Detailed references | Whole-project verification |
|---|---|---|---|
| CS-01 | Preserve functionality and appearance; prove every source difference | WA-PRESERVE-001, WA-CORE-001 | **Pending comprehensive audit** |
| CS-02 | Use authoritative sources and obtain explicit approval | WA-CORE-001, WA-REVIEW-001 | **Pending comprehensive audit** |
| CS-03 | Apply approved authentication and session contracts | WA-AUTH-001, WA-SESSION-001, WA-NATIVE-001 | **Pending comprehensive audit** |
| CS-04 | Enforce authorization, ownership, full verified-admin authority | WA-API-001, WA-PRIV-002, WA-DATA-001 | **Pending comprehensive audit** |
| CS-05 | Safe API contracts and controlled error disclosure | WA-ERROR-001, WA-API-002, WA-LOG-001 | **Pending comprehensive audit** |
| CS-06 | Protect database integrity and external effects | WA-DATA-001, WA-ENV-001 | **Pending comprehensive audit** |
| CS-07 | Pretty-formatted, safe frontend/source code | WA-FORMAT-001, WA-FRONT-001 | **Pending comprehensive audit** |
| CS-08 | Reuse shared components without breaking specialized flows | WA-SHARED-001, WA-SESSION-001 | **Pending comprehensive audit** |
| CS-09 | Protect privacy, credentials and diagnostics | WA-PRIV-001, WA-PRIV-002, WA-LOG-001 | **Pending comprehensive audit** |
| CS-10 | Browser, PWA, native and public API compatibility | WA-CACHE-001, WA-NATIVE-001, WA-API-001 | **Pending comprehensive audit** |
| CS-11 | Risk-based testing and preserved evidence | WA-REVIEW-001, WA-PRESERVE-001 | **Pending comprehensive audit** |
| CS-12 | Standards, traceability and owner-controlled release | WA-CORE-001, WA-REVIEW-001 | **Pending comprehensive audit** |

### Detailed standards applicability catalog

| Detailed ID | Subject | Registry state |
|---|---|---|
| WA-PRESERVE-001 | Preservation | Applies where relevant; file/route-level verification pending |
| WA-FORMAT-001 | Pretty formatting | Applies where relevant; file/route-level verification pending |
| WA-CORE-001 | Authority, scope, isolation | Applies where relevant; file/route-level verification pending |
| WA-API-001 | Endpoint authorization and ownership | Applies where relevant; file/route-level verification pending |
| WA-AUTH-001 | Credential boundaries | Applies where relevant; file/route-level verification pending |
| WA-SESSION-001 | Browser sessions and replay | Applies where relevant; file/route-level verification pending |
| WA-ERROR-001 | Expected-error provenance | Applies where relevant; file/route-level verification pending |
| WA-API-002 | Transitional client error interoperability | Applies where relevant; file/route-level verification pending |
| WA-PRIV-001 | Public capability and CSRF | Applies where relevant; file/route-level verification pending |
| WA-PRIV-002 | Family Tree privacy and administrator access | Applies where relevant; file/route-level verification pending |
| WA-NATIVE-001 | TNNA continuity | Applies where relevant; file/route-level verification pending |
| WA-DATA-001 | Database and side effects | Applies where relevant; file/route-level verification pending |
| WA-FRONT-001 | Frontend behavior/accessibility | Applies where relevant; file/route-level verification pending |
| WA-SHARED-001 | Shared-helper adoption and exceptions | Applies where relevant; file/route-level verification pending |
| WA-LOG-001 | Safe diagnostics | Applies where relevant; file/route-level verification pending |
| WA-CACHE-001 | Sensitive caching and PWA | Applies where relevant; file/route-level verification pending |
| WA-ENV-001 | Environment isolation | Applies where relevant; file/route-level verification pending |
| WA-ABUSE-001 | Rate/challenge protections; D11 deferral | Applies where relevant; file/route-level verification pending |
| WA-REVIEW-001 | Compliance evidence and release | Applies where relevant; file/route-level verification pending |

**Owner decisions:** D01–D14 in `WA_Standards_Decision_Register_v1.0_2026-11-12.md` (verify installed folder) are binding as approved/explicitly deferred. Particularly D01 full centrally verified Family Tree administrator rights, D03 controlled expected-error provenance, D04 gradual error-shape migration, D07 browser support, D08 token-storage objective only (architecture not decided), D10 preserve TNNA behavior, D11 preserve/defer public geocode/contact safeguards, D13 risk-based tests and D14 owner/manual installation. Confirm actual installed paths before using these references as build inputs.

## 3. Existing Stage 6 items — linked without replacing their owning register

The following are **cross-references**, not reissued S6 IDs or an assertion that each S6 item is a proved standards violation. The source register is `docs/Stage6_OpenItems.md` (consolidated 3.3, Nov 9). Statuses below reflect that dated register, **not a live writeback**.

| Source ID | Priority | Focus | Source status (Nov 9) | Standards family |
|---|---|---|---|---|
| S6-001 | High | Home logout listener and restored state | In Progress | CS-03/10 |
| S6-002 | High | Multi-tab refresh/Web Locks race | Verified Closed — bounded | CS-03/10 |
| S6-003 | High | Remembered vs ordinary restart and expiry | In Progress | CS-03/10 |
| S6-004 | High | Logout revocation for expired/offline cases | In Progress | CS-03/09 |
| S6-005 | High | Shared WA.api/WA.session migration across apps | Open | CS-03/08 |
| S6-006 | Critical | Refresh-token replay containment | In Progress | CS-03/09 |
| S6-007 | High | Cross-tab account switching and stale refresh | In Progress | CS-03/10 |
| S6-008 | High | 401/403/retry/unsafe mutation behavior | In Progress | CS-03/05 |
| S6-009 | High | Administrator and entitlement post-refresh checks | In Progress | CS-04 |
| S6-010 | Critical | TNNA existing native/offline compatibility | In Progress | CS-03/10 |
| S6-011 | Critical | Separate hosted staging acceptance | In Progress | CS-02/11 |
| S6-012 | High | Rate limiting and proxy IP provenance | In Progress | CS-09 |
| S6-013 | Critical | Production migration/rollback plan | Open | CS-06/12 |
| S6-014 | Critical | Independent final design/security review | Open | CS-11/12 |
| S6-015 | High | Preserve Login UI and redirect behavior | In Progress | CS-01/03/07 |
| S6-016 | High | Registration/reset/change password and form retention | In Progress | CS-03/07 |
| S6-017 | High | Family Tree privacy header, public tokens/uploads | Open | CS-04/08/09 |
| S6-018 | High | Refresh failures, 401/403/offline/5xx; unsaved forms | In Progress | CS-03/05/08 |
| S6-019 | Critical | Cookie Origin/CSRF/security/caching | In Progress | CS-09/10 |
| S6-020 | High | Cookie-only/expired-JWT logout and revocation proof | In Progress | CS-03/09 |
| S6-021 | High | New verified-login supersession of prior session | Open | CS-03 |
| S6-022 | High | Login-code entropy, scope, limits, throttling | Open | CS-09 |
| S6-023 | High | Password policy decision and error scenarios | Open | CS-03/09 |
| S6-024 | High | Service-worker/client asset version consistency | Open | CS-10 |
| S6-025 | High | Usage tracking token/lifecycle/duplicates | In Progress | CS-08/10 |
| S6-026 | High | Web Locks unsupported-browser policy | Open | CS-03/10 |
| S6-027 | High | Late refresh vs logout/account switch | Pending Test | CS-03/10 |
| S6-028 | Medium | JS-readable token exposure, XSS/CSP | Open | CS-07/09 |
| S6-029 | High | Challenge/reset SecurityVersion and one-time semantics | In Progress | CS-03/09 |
| S6-030 | Medium | Token/error/log exposure review | In Progress | CS-05/09 |
| S6-031 | High | WA_ENV, database identity, staging separation | In Progress | CS-02/06 |
| S6-032 | High | TNNA absolute refresh-token cap policy deferred | Open | CS-03/10 |
| S6-033 | Medium | Shared API conventions, error shape and naming | Open | CS-05/08 |
| S6-034 | High | Source provenance, copies and diff hygiene | In Progress | CS-01/02/12 |
| S6-035 | Critical | Reconcile Stage 6 test and engineering findings | In Progress | CS-11/12 |
| S6-036 | High | Chrome/Edge/Firefox/DuckDuckGo acceptance | Pending Test | CS-10 |
| S6-037 | High | Revoked Home fail-closed / fresh-login regression | Verified Closed — bounded | CS-03/10 |

**Source reconciliation caveat:** The inspected `Stage6_OpenItems.md` contains a formal detailed table through S6-037. Other preserved conversations and documents reference S6-039 (Weights range-delete issue, deferred) and S6-041 (unexpected exception disclosure audit), but **S6-038–S6-041 have not been independently reconciled to authoritative full original rows in this pass**. Do not fabricate their original severity/status/closure. Add those rows only after original issue provenance is retrieved. **S6-002** and **S6-037** stay `Verified Closed` only in their historically bounded scope; do not reopen them without a distinct regression.

## 4. Seeded functional-file and cross-file corrective findings (plus retained documentation reference)

A confirmed *source adoption gap* means approved shared facilities are not universally used; it does not mean an immediate mandatory wholesale rewrite. `Prepared`, `Installed`, `Tested`, `Closed` must be tracked separately. All original WA-CF-001–018 IDs and historical descriptions are retained for traceability. WA-CF-012 is **documentation-only** and excluded from functional-file counts; its history remains a reference. All items below are **open register rows** unless bounded correction evidence is explicitly noted.

| ID | Affected files | Classification | Priority | Related issues | Correction / next gate | Current correction state |
|---|---|---|---|---|---|---|
| WA-CF-001 | `httpdocs/BinForm.html` | Confirmed source adoption gap; legacy permitted | High | S6-005/008/018/033; B2-02; B3-03/08; B4-02 | Inventory all calls; propose compatibility-safe adapter/migration; preserve (be) suffix, unsaved inputs and no replay | Not proposed |
| WA-CF-002 | `httpdocs/etfCompare.html` | Confirmed source adoption gap; legacy permitted | High | S6-005/008/018; B2-02; B3-03; B4-03 | Trace compare consumers; preserve adjusted prices/date anchors, rate limits and chart behavior | Not proposed |
| WA-CF-003 | `httpdocs/js/FTPerson.js` | Confirmed source adoption gap; special safeguards | High | S6-005/017; B2-02/06; B3-03/07 | Inventory routes; retain page-token, relationship permissions and multipart boundaries | Not proposed |
| WA-CF-004 | `httpdocs/js/FTPrivacy.js` | Specialized implementation; exception candidate (NOT approved) | Critical | S6-017; B2-06; B3-06 | Trace interceptor ordering and correct private-person scope; decide documented exception only after review | Not proposed |
| WA-CF-005 | `httpdocs/js/usageTracking.js` | Intentional mixed pattern; exception candidate | High | S6-005/025; B3-10 | Document and test keepalive exception; avoid duplicate time records | Not proposed |
| WA-CF-006 | `httpdocs/js/waPlatform.js` | Corrected in R16-75 T09; closure verification pending | High | S6-033; B2-04; B3-08; R16-75-T09 | Confirm deployed client parses nested, flat and documented codes; app-wide consumers separate | Installed at f794eb7; staged Live user screenshot |
| WA-CF-007 | `server.js` | Corrected in R16-75; bounded verification | Critical | S6-030/041; B4-17; R16-75 T01–T12 | Verify all affected paths/client contracts; preserve logger redaction and no-store | Installed at f794eb7; staged Live user screenshot |
| WA-CF-008 | `httpdocs/home.html` | Confirmed sampled mixed adoption; current full caller audit open | High | S6-005/008/018; B2 | Inventory and reconcile every call; preserve R10 logout/offline UX | Not proposed |
| WA-CF-009 | `routes/weights.js, routes/budget.js, routes/etf.js` | Possible duplication; NOT a proven bypass | Medium | B3-09; S6-005 | Trace whether inner auth is independently needed; remove only after compatibility proof | Not proposed |
| WA-CF-010 | `server.js + routes/geocode` | Documented public exception; risk decision deferred | Medium | D11; B3-11 | Maintain existing public behavior; do not add policy without owner approval | Deferred by D11 |
| WA-CF-011 | `services/administratorAccess.js and Family Tree admin/privacy callers` | Documentation mismatch and implementation coverage to check | Critical | D01; B6-02; B8-09/10 | Inspect all admin recognition callers; verify full authorized FT admin rights and failed-gate denials; reconcile TechSummary | Not proposed |
| WA-CF-012 | `TechSummary.md` (**documentation-only; excluded from functional file denominator**) | Documented documentation nonconformance candidate | High | B6-01/14; B8-10/11/12 | Prepare a separately approved complete documentation replacement after current version review | Not proposed |
| WA-CF-013 | `httpdocs/amortization.html` | Historical reported exposure; current state unverified | High | S6-030 | Audit current code and browser Console; sanitize without breaking calculations | Not proposed |
| WA-CF-014 | `Family Tree public verification/unsubscribe routes` | Audit/test gap, not established defect | High | S6-017/019; B4-12/14; B8-07 | Method-by-method capability token/Origin/log/redaction matrix | Not proposed |
| WA-CF-015 | `HTML pages / service worker / JS assets` | Unverified compatibility risk | High | S6-024; B6-08; B8-13 | Trace script query versions/SW cache lifecycle; verify mixed-version rollback | Not proposed |
| WA-CF-016 | `Routes and frontend API consumers (project-wide)` | Coverage gap — requires comprehensive inventory | Critical | S6-005/035; B4; B8-05/06 | Complete route-to-consumer matrix and negative permission tests | Not proposed |
| WA-CF-017 | `Web, native and staging platform files` | Program-wide acceptance gap | Critical | S6-006/010/011/019/026/031/036 | Reconcile risk-based browser/native/hosted tests; do not change native policy automatically | Not proposed |
| WA-CF-018 | `WA functional-source inventory only` | Audit coverage gap | Critical | S6-034/035; B8-16/17 | Enumerate each active functional source file and dependency; mark applicability and evidence; close proven gaps or approve exceptions | Not proposed |

### 4A. Detailed finding sheets (requirements, evidence and closure)


#### WA-CF-001 — httpdocs/BinForm.html

- **November 15 follow-up (owner-reported):** A separate Wave 0 `BinForm.html` correction package was downloaded and included in staging commit `2a92b2f`. Earlier proposed isolated tests were reported 7/7 bounded PASS; independent verification of the newly copied Drive file, exact installed diff, Git blob and browser/hosted behavior is still required. Nested-error correction is **not** closure of direct-fetch migration or S6-005.
- **Observed finding:** Independent bearer `apiFetch()` despite loading `waPlatform.js`; nested error may stringify as `[object Object]`.
- **Classification / risk:** Confirmed source adoption gap; legacy permitted; priority **High**.
- **Standards:** CS-03, CS-05, CS-08; WA-SESSION-001, WA-API-002, WA-SHARED-001.
- **Existing linkage:** S6-005/008/018/033; B2-02; B3-03/08; B4-02.
- **Required work:** Inventory all calls; propose compatibility-safe adapter/migration; preserve (be) suffix, unsaved inputs and no replay.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** R15 bounded; real T09/T10 for this page still required.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-002 — httpdocs/etfCompare.html

- **Observed finding:** Independent token snapshot and `fetch` for ETF comparisons.
- **Classification / risk:** Confirmed source adoption gap; legacy permitted; priority **High**.
- **Standards:** CS-03/08/10; WA-SESSION-001, WA-SHARED-001.
- **Existing linkage:** S6-005/008/018; B2-02; B3-03; B4-03.
- **Required work:** Trace compare consumers; preserve adjusted prices/date anchors, rate limits and chart behavior.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** ETF R15 bounded acceptance preserved.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-003 — httpdocs/js/FTPerson.js

- **Observed finding:** Independent Bearer helper, fetch and FormData upload paths.
- **Classification / risk:** Confirmed source adoption gap; special safeguards; priority **High**.
- **Standards:** CS-04/08/09; WA-PRIV-002, WA-SHARED-001.
- **Existing linkage:** S6-005/017; B2-02/06; B3-03/07.
- **Required work:** Inventory routes; retain page-token, relationship permissions and multipart boundaries.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** R15 upload case bounded, broader scope open.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-004 — httpdocs/js/FTPrivacy.js

- **Observed finding:** Own privacy token header and `window.fetch` interceptor.
- **Classification / risk:** Specialized implementation; exception candidate (NOT approved); priority **Critical**.
- **Standards:** CS-04/08/09; WA-PRIV-002, WA-SHARED-001.
- **Existing linkage:** S6-017; B2-06; B3-06.
- **Required work:** Trace interceptor ordering and correct private-person scope; decide documented exception only after review.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** Negative privacy token testing outstanding.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-005 — httpdocs/js/usageTracking.js

- **Observed finding:** Shared `WA.api` plus `keepalive` direct fetch at unload.
- **Classification / risk:** Intentional mixed pattern; exception candidate; priority **High**.
- **Standards:** CS-08/10; WA-SHARED-001, WA-SESSION-001.
- **Existing linkage:** S6-005/025; B3-10.
- **Required work:** Document and test keepalive exception; avoid duplicate time records.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** R15 time tracking bounded PASS; expiry uncertain.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-006 — httpdocs/js/waPlatform.js

- **Observed finding:** Legacy nested error envelope parsing previously incompatible.
- **Classification / risk:** Corrected in R16-75 T09; closure verification pending; priority **High**.
- **Standards:** CS-05/08; WA-API-002.
- **Existing linkage:** S6-033; B2-04; B3-08; R16-75-T09.
- **Required work:** Confirm deployed client parses nested, flat and documented codes; app-wide consumers separate.
- **Correction / installation:** Installed at f794eb7; staged Live user screenshot.
- **Evidence / limit:** T09 offline passed; browser pending.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-007 — server.js

- **Observed finding:** Unexpected status-marked 4xx message disclosure in prior central handler; early protected parser failures.
- **Classification / risk:** Corrected in R16-75; bounded verification; priority **Critical**.
- **Standards:** CS-05/09/10; WA-ERROR-001, WA-CACHE-001, WA-LOG-001.
- **Existing linkage:** S6-030/041; B4-17; R16-75 T01–T12.
- **Required work:** Verify all affected paths/client contracts; preserve logger redaction and no-store.
- **Correction / installation:** Installed at f794eb7; staged Live user screenshot.
- **Evidence / limit:** T06 hosted 3/3; T11 selected logs 400/413/500 safe.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-008 — httpdocs/home.html

- **Observed finding:** Mixed shared-session use and direct fetch, in audited snapshot.
- **Classification / risk:** Confirmed sampled mixed adoption; current full caller audit open; priority **High**.
- **Standards:** CS-03/08; WA-SESSION-001, WA-SHARED-001.
- **Existing linkage:** S6-005/008/018; B2.
- **Required work:** Inventory and reconcile every call; preserve R10 logout/offline UX.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** R10 bounded PASS.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-009 — routes/weights.js, routes/budget.js, routes/etf.js

- **Observed finding:** Inner auth middleware appears alongside outer server auth.
- **Classification / risk:** Possible duplication; NOT a proven bypass; priority **Medium**.
- **Standards:** CS-04/08; WA-API-001, WA-SHARED-001.
- **Existing linkage:** B3-09; S6-005.
- **Required work:** Trace whether inner auth is independently needed; remove only after compatibility proof.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** Outer mounts sampled, do not remove on style grounds.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-010 — server.js + routes/geocode

- **Observed finding:** Public geocode bypasses common entitlement gate.
- **Classification / risk:** Documented public exception; risk decision deferred; priority **Medium**.
- **Standards:** CS-04/10; WA-API-001, WA-ABUSE-001.
- **Existing linkage:** D11; B3-11.
- **Required work:** Maintain existing public behavior; do not add policy without owner approval.
- **Correction / installation:** Deferred by D11.
- **Evidence / limit:** No automatic noncompliance finding.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-011 — services/administratorAccess.js and Family Tree admin/privacy callers

- **Observed finding:** Verified-admin rule requires DB IsAdministrator and configured username; legacy descriptions conflict.
- **Classification / risk:** Documentation mismatch and implementation coverage to check; priority **Critical**.
- **Standards:** CS-04; WA-PRIV-002, WA-API-001.
- **Existing linkage:** D01; B6-02; B8-09/10.
- **Required work:** Inspect all admin recognition callers; verify full authorized FT admin rights and failed-gate denials; reconcile TechSummary.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** Negative/positive auth matrix outstanding.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-012 — TechSummary.md

- **Audit scope disposition:** Documentation-only reference; retained for history and for resolving authority conflicts, but **not a functional application file**, not in file-by-file compliance denominator, and not a condition for declaring the functional-source inventory complete. Documentation maintenance remains a separately authorized workstream.
- **Observed finding:** Historic administrator wording/format coverage may conflict with approved standards.
- **Classification / risk:** Documented documentation nonconformance candidate; priority **High**.
- **Standards:** CS-02/07/12; WA-CORE-001, WA-FORMAT-001.
- **Existing linkage:** B6-01/14; B8-10/11/12.
- **Required work:** Prepare a separately approved complete documentation replacement after current version review.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** No source change claimed.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-013 — httpdocs/amortization.html

- **Observed finding:** Historical browser Console reportedly displayed token property.
- **Classification / risk:** Historical reported exposure; current state unverified; priority **High**.
- **Standards:** CS-07/09; WA-LOG-001, WA-FRONT-001.
- **Existing linkage:** S6-030.
- **Required work:** Audit current code and browser Console; sanitize without breaking calculations.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** Do not claim verified ongoing leak.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-014 — Family Tree public verification/unsubscribe routes

- **Observed finding:** Public capability methods, token reuse and URL privacy need per-route contracts.
- **Classification / risk:** Audit/test gap, not established defect; priority **High**.
- **Standards:** CS-04/09; WA-PRIV-001, WA-API-001.
- **Existing linkage:** S6-017/019; B4-12/14; B8-07.
- **Required work:** Method-by-method capability token/Origin/log/redaction matrix.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** Selected R15 privacy results only.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-015 — HTML pages / service worker / JS assets

- **Observed finding:** Potential old HTML/new JS version mixing and cache inconsistency.
- **Classification / risk:** Unverified compatibility risk; priority **High**.
- **Standards:** CS-10; WA-CACHE-001.
- **Existing linkage:** S6-024; B6-08; B8-13.
- **Required work:** Trace script query versions/SW cache lifecycle; verify mixed-version rollback.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** No claim of confirmed failure.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-016 — Routes and frontend API consumers (project-wide)

- **Observed finding:** Method/path/authorization/error/cache/consumer map incomplete.
- **Classification / risk:** Coverage gap — requires comprehensive inventory; priority **Critical**.
- **Standards:** CS-04/05/08/11; WA-API-001/002, WA-REVIEW-001.
- **Existing linkage:** S6-005/035; B4; B8-05/06.
- **Required work:** Complete route-to-consumer matrix and negative permission tests.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** B4 lists 17 representative contracts only.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-017 — Web, native and staging platform files

- **Observed finding:** Browser/TNNA/environment/token races and device paths unverified globally.
- **Classification / risk:** Program-wide acceptance gap; priority **Critical**.
- **Standards:** CS-03/09/10/11; WA-AUTH-001, WA-NATIVE-001, WA-ENV-001.
- **Existing linkage:** S6-006/010/011/019/026/031/036.
- **Required work:** Reconcile risk-based browser/native/hosted tests; do not change native policy automatically.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** Existing bounded R10/R14/R15 results preserved.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


#### WA-CF-018 — WA functional-source inventory

- **Scope revision:** Inventory only actual functional application/build/runtime/native dependencies. Exclude `docs/`, `standard/`, `change/`, `skills/`, README/INSTALL documents and history except as reference. A classification decision must be evidence-based, particularly for copied and generated artifacts.
- **Observed finding:** Whole-project CS-01–CS-12 conformance scan not certified.
- **Classification / risk:** Audit coverage gap; priority **Critical**.
- **Standards:** CS-01–CS-12; all applicable detailed standards.
- **Existing linkage:** S6-034/035; B8-16/17.
- **Required work:** Enumerate every authoritative source file; mark applicability, evidence and gap; close each confirmed issue or approve exception.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** This v1.0 is seeded, NOT exhaustive.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


## 5. Functional-file audit queue — coverage is not certification

The audit proceeds in **two groups under one standards framework**: A (browser/backend/shared files) first, B (TNNA/native files) second. Each actual functional file obtains its own row in the working functional inventory. Existing WA-CF findings are linked, not treated as substitutes for a file audit. Dependencies may be read earlier than their file's scheduled compliance review.

| Priority group | Functional paths and roles | Per-file assessment focus | State |
|---|---|---|---|
| A1 UI | `httpdocs/` active `.html` files | CS-01–12 as applicable; UI, forms, session/error compatibility, HTML formatting | **Pending verified recursive list**; WA-CF-001 first follow-up |
| A2 Browser code | `httpdocs/js/`, embedded code and active service workers | Caller/endpoint matrix, unsafe replay, privacy token, caching, logging | Sampled only |
| A3 Browser styles/assets | Active `httpdocs/css/`, icons/images/manifest and referenced assets | Appearance, link resolution, cache/versioning, browser/native interactions | Not comprehensively audited |
| A4 Root runtime | Active root `.js` and similar executable files | API/SQL/DB/security/service init, logging, error responses | Selected R16 evidence only |
| A5 Server routes/middleware | `routes/`, `middleware/` | Exact method+path, auth, ownership, user input, expected errors | B4 selected snapshot only |
| A6 Services | `services/` and imported modules | Shared session, storage, admin, auth, environment | Sampled only |
| A7 Configuration/dependencies | Active `package.json`, `package-lock.json`, `.node-version`, runtime/build configs | Security, startup, version/drift and operational compatibility | Pending |
| A8 Operational SQL | Only schema/migration scripts necessary for current function or authorized deployment | Data integrity and schema/migration safety | Classify before inclusion |
| B TNNA | Active `TNNA/` source/config/build inputs and native assets | Same CS-01–12 and Detailed standards; documented native-specific variation under D10 | Separate later phase, not excluded |

**Excluded nonfunctional materials** are not individually inventoried or tracked, and there is no documentation-audit wave. Active tests are referenced by the functional source rows they verify, not counted as app files. Do not infer obsolete status from filename alone. If a dependency is uncertain, classify as `Needs classification` until an actual reference/entrypoint/build check resolves it.

### 5A. Functional file row schema (one row per verified active file)

| Field | Required record |
|---|---|
| Relative path, group, role | Exact rooted path, A1–A8 or B; runtime/build/config/asset classification |
| Baseline | Drive ID, modified time/revision, size, SHA-256 where byte access permits; matching current Git branch/blob if inspected |
| Dependency evidence | Import/references, build manifest, route mount, page/script load, PWA cache or native build relationship |
| Standard applicability | CS-01–CS-12 and applicable Detailed IDs; each non-applicable requirement has reason |
| Observed disposition | Not inventoried / Inventoried / Audited / Conforming verified / Gap identified / Approved exception / Needs classification |
| Findings | WA-CF and S6 links; confirmed failure vs permitted legacy vs unresolved risk |
| Correction record | Approved scope, original/final hashes, full diff, separate verification report, formatting-only hunks, rollback |
| Verification | Isolation, syntax, UI/browser, HTTP, hosted, native, integration and independent reviewer as relevant; exact status |
| Installation and closure | Owner installation evidence, deployed commit and test scope, exceptions, final closure owner/date |

### 5B. Wave 0 functional discovery boundary

1. Read the current root `README.md` and installed governing standards as authority; **do not** add them to the functional audit denominator.
2. Enumerate active browser entrypoints, referenced scripts/styles/assets and service-worker caches, then trace actual imports and loads.
3. Enumerate root runtime entrypoints, mounted routes, middleware, services and invoked utilities using current authoritative source; include dynamic route registration.
4. Trace package scripts and relevant runtime/build settings, then classify required operational SQL and assets; exclude secrets, backups and copied history unless an actual dependency proves otherwise.
5. Separately enumerate TNNA source and native build/runtime dependencies and their backend/API consumers; preserve D10 behavior.
6. Reconcile Drive files to current `reviseLogIn` where independently possible, documenting mismatches; owner screenshot `2a92b2f` is a checkpoint, not byte equality proof.
7. Give each functional file a row before claiming the functional inventory complete. Do not infer totals from first 100 folder entries or incomplete pagination. Do not enumerate nonfunctional archives merely to count them.

## 6. Sequenced functional-source review and correction (not blanket change approval)

| Wave | Purpose | Prerequisites | Exit condition |
|---|---|---|---|
| 0 — Functional inventory | Identify all operational browser/backend/native files and dependencies, excluding nonfunctional records | Read-only Drive, current README/standards, relevant Git comparison | Every active functional file counted and classified, no unverified directory coverage |
| 1 — File-by-file browser/backend | For each file, apply relevant CS/Detailed IDs, trace consumers, prepare justified correction and evidence or record verified conformity | Current complete file and contracts; approved scope; current installed baseline | Each reviewed file has explicit disposition and appropriate tests; no premature closure |
| 2 — TNNA file-by-file | Apply same standards with warranted documented native differences and native/browser-backend compatibility | D10 and verified native sources/contracts | Every active TNNA file reviewed; required native tests and exceptions recorded |
| 3 — Cross-file/acceptance close | Reconcile all shared dependencies, S6 evidence and remaining browser/native acceptance, final independent review | Verified per-file evidence, owner installations, exception approvals | No open required functional file or unexplained dependency; separate release authorization still necessary |

Within Wave 1, use the approved risk-based priority and stable per-file order; WA-CF-001 `httpdocs/BinForm.html` is the initial file because a correction was reportedly installed at `2a92b2f` and needs exact-source and browser follow-up. Do not automatically redo previously accepted bounded R10/R14/R15/R16 tests unless the affected code warrants it.

## 7. Standard register row template for additions

```text
Finding ID: WA-CF-NNN
Functional file(s) / group (A1–A8 or B) / source URI / Drive ID / revision / Git blob:
Functional role / inclusion proof / owners / dependent consumers:
Core ID(s) / Detailed ID(s) / Dxx decision(s):
Finding type: Confirmed | Legacy permitted | Risk unverified | Exception candidate | Documentation-only reference
Observed precise code/behavior; confidence and date:
Existing issue IDs / audit IDs:
Security/privacy/data/UX effect and priority:
Proposed corrective behavior; alternatives and explicit deferrals:
Approval scope/date/authority; exception approval owner/review trigger:
Original SHA-256 / final SHA-256; full diff path:
Verification .md path / dependencies / rollback / formatting check:
Test cases: negative + positive; offline / HTTP / browser / hosted / native:
Prepared download URL/artifact ID; installed version and owner confirmation:
Correction status; test status; compliance disposition; closure evidence/date:
```

## 8. Functional-file verification, exceptions and authoritative closure gates

A functional-file finding can be `Verified closed` only when (1) an unambiguous current baseline and approved scope exist; (2) all affected consumers/side effects are reviewed; (3) correction is installed by owner **or** exception approved with explicit justification, compensating control, owner and review trigger; (4) complete `.diff`, verification `.md`, formatting/provenance evidence and SHA manifest are recorded for revised existing files; (5) proportionate tests demonstrate required behavior and absence of regression; (6) outstanding caveats are separately tracked; and (7) authorized reviewer signs off.

A source item that was previously closed within a narrow test remains bounded; a new finding needs a separate ID rather than silently reclassifying historical evidence. No functional file or overall project is deemed compliant merely because tests passed in mocks or because a commit is Live. Documentation-only references (including WA-CF-012) are not counted in this denominator. Full TNNA compliance remains mandatory, while native-specific deviations require documented justification and acceptance.

## 9. R16-75 evidence already available for reconciliation (historical Nov 15 scope)

- Historical source checkpoint: owner-reported commit `f794eb7` on `reviseLogIn`; previously compared GitHub branch identical. **Later owner screenshot** shows staging commit `2a92b2f` Live at 10:09 AM Nov 15, including reported Wave 0 BinForm correction; independently verify full SHA/installed content before new code review.  `server.js` and `httpdocs/js/waPlatform.js` compared with authoritative Drive in prior read-only review.
- T01–T05/T07–T08: bounded offline passes; T09 shared client offline regressions passed; T10 bounded offline tests passed; T12 combined 90/90 offline passed.
- T06 hosted parser probes: 3/3 reported pass (malformed JSON 400, URL-encoded parameter limit 413, incomplete multipart 500), each sanitized nested response and `Cache-Control: no-store`. This is only those three requests.
- T11 hosted logging evidence: provided entries for 400, 413 and 500 use `Request error (HTTP NNN; message omitted)` and no sensitive details; broader logging review remains under S6-030.
- **Still unverified within R16-75:** T09 browser nested error display; T10 actual unsaved-form retention and real browser failed-save/session behavior; project-wide direct-`fetch` consumers including BinForm; full browser/device/route matrix.
- R10/R14/R15 remain previously `PASS (bounded)`; do not promote to whole-project compliance.

## 10. Standards and evidence provenance (reference-only; not in functional audit)

| Short name | Source (authoritative Google Drive folder `My Drive/wonderfulApp`) | Scope of use |
|---|---|---|
| Core | [Drive file](https://drive.google.com/file/d/15OKI6N_SF6b1d9-bmF3JL2qBs7kNsYVB/view) | CS-01–CS-12 |
| Detailed | [Drive file](https://drive.google.com/file/d/118GV8F6C5Wi3D9IvwIMKwX67rQ2qBsEk/view) | Detailed technical standards/annexes |
| Decision | [Drive file](https://drive.google.com/file/d/1MxG5Ubgzi531pwc8Ln1MkfSxoujM8-lJ/view) | D01–D14 |
| Stage 6 Open | [Drive file](https://drive.google.com/file/d/1AexU8UcqVxeidCpfeVoizjGH7rmzFQNF/view) | S6 tracking status and acceptance criteria |
| B2 | [Drive file](https://drive.google.com/file/d/1pxdZpE0qcH7p8C1Vmgb_oIB3kjh3giO9/view) | Session/API audit |
| B3 | [Drive file](https://drive.google.com/file/d/1qxxeUJVpKSOTWrQlA0467Gypc1lVw5-p/view) | Route/frontend traceability |
| B4 | [Drive file](https://drive.google.com/file/d/1GA3Fo3hQkUPJqysdHKNSCzZ0ZrPcRaqo/view) | 17 representative endpoint contracts |
| B6 | [Drive file](https://drive.google.com/file/d/1KU-MABZkvIuxsiO2136Fp_yD_0WGG6Qr/view) | 20 completeness findings |
| B8 | [Drive file](https://drive.google.com/file/d/17ZVAlWmMn7B1_GpgmhyfzE2wUmnG8Kxp/view) | Validation findings |
| README | [Drive file](https://drive.google.com/file/d/1B9k1uTn_NuPvhKkWCs1Xug-EZvHpkb_F/view) | Project entry and precedence |

The listed links are historical version-specific reference pointers; the owner recopied local project files into Drive on November 15, which may change Drive file IDs without changing content. Re-resolve the current file IDs by canonical project path before reliance. The first-stage source observations were extracted from the above docs and compared with the GitHub `sthink1/wapps` `reviseLogIn` branch as specifically noted. Historic audit line numbers refer to their pinned November 11 snapshots, not necessarily the installed files after commit `f794eb7`. No claim is made that the complete Drive tree or all source files were exhaustively listed during preparation of this v1.0.

## 11. Next concrete action and owner-controlled gate

1. **Owner reviews this version 1.1 scope replacement** and, if approved, manually places it at `docs/WA_Standards_Compliance_Register.md`. No automatic modification of Drive or the owner's local files.
2. Begin Wave 0 by enumerating *functional files only*, with authoritative current paths/IDs, inclusion evidence, applicability and pending audit state. Do not count README, standards, docs, change reports, skills or unreferenced backups.
3. Reconcile `httpdocs/BinForm.html` against the owner-installed Wave 0 package, the newly copied Drive baseline and staging commit `2a92b2f`; retain offline tests, then arrange relevant owner-executed browser checks. Do not declare WA-CF-001 or S6-005 closed based on the correction alone.
4. Thereafter assess **one functional file at a time**; record compliant findings or issue separately packaged full-file corrections with original-to-final `.diff`, per-file change verification, SHA-256, and proportionate tests. Keep TNNA as the second-phase group under the same WA standards with documented native-specific differences.

**Compliance status at issue of this draft:** a scope revision to the control document only. No new functional source test has been run for this register revision; no complete functional file denominator verified; no Stage 6 closure or deployment authorization implied.

## 12. Revision history

| Version | Date | Change | Status |
|---|---|---|---|
| 1.0 | 2026-11-15 | Seeded complete-project standards register and 18 findings | Original authoritative Drive baseline for this proposal |
| 1.1 | 2026-11-15 | Owner-approved functional-files-only scope; same standards for TNNA with justified native-specific differences; adjusted denominator, discovery, audit queue and evidence status; historical S6/WA-CF findings retained | **Proposed download for manual owner review/installation** |
