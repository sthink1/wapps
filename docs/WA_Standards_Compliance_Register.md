# Wonderful Apps — Comprehensive Standards Compliance Register

**Register version:** 1.0 (initial seeded baseline)  
**Prepared:** 2026-11-15  
**Proposed installation path:** `docs/WA_Standards_Compliance_Register.md`  
**Authority:** Owner review and installation required; this download does **not** change any authoritative file.  
**Scope:** Entire WA project; first pass seeded from identified documents; **not a completed whole-project audit**.

> **Project completion objective:** Examine every applicable WA file, correct all confirmed nonconformances or obtain owner-approved, documented exceptions, and verify functionality, compatibility, and compliance. The register is a work-control instrument, not the deliverable that completes standardization.

## 1. Status and truthfulness rules

- **Audit state:** `Not inventoried` → `Inventoried` → `Audited` → `Gap identified` or `Conforming (verified)` / `Approved exception`. Code being present does not equal audited.
- **Correction state:** `Not proposed` → `Scoped` → `Approved` → `Prepared for download` → `Owner installed` → `Tested` → `Verified closed`. Installation and testing are separate.
- **Finding classification:** `Confirmed source nonconformance`, `Permitted legacy / migration debt`, `Unverified risk`, `Documentation conflict`, `Candidate exception`, `Approved exception`, `Test/evidence gap`. *Legacy code is not automatically a vulnerability.*
- **Evidence tiers:** Document/source observation; isolated/offline; local HTTP/browser; hosted staging; device/native; independent reviewer. Never promote a bounded result to universal certification.
- **No automatic edits:** Drive, GitHub, and existing local WA files are read-only for the assistant. All replacements are separate full downloadables, with original-to-final `.diff`, verification `.md`, checksum manifest in `change/`, rollback and tests. Owner installs and controls rollout.
- **No silent scope widening:** Code modernization, security tightening, server contracts, database changes, UI changes and production deployment must follow the approved scope/exception decisions.

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

## 4. Seeded file-by-file and cross-file corrective findings

A confirmed *source adoption gap* means approved shared facilities are not universally used; it does not mean an immediate mandatory wholesale rewrite. `Prepared`, `Installed`, `Tested`, `Closed` must be tracked separately. All items below are **open register rows** unless explicit bounded correction noted.

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
| WA-CF-012 | `TechSummary.md` | Documented documentation nonconformance candidate | High | B6-01/14; B8-10/11/12 | Prepare a separately approved complete documentation replacement after current version review | Not proposed |
| WA-CF-013 | `httpdocs/amortization.html` | Historical reported exposure; current state unverified | High | S6-030 | Audit current code and browser Console; sanitize without breaking calculations | Not proposed |
| WA-CF-014 | `Family Tree public verification/unsubscribe routes` | Audit/test gap, not established defect | High | S6-017/019; B4-12/14; B8-07 | Method-by-method capability token/Origin/log/redaction matrix | Not proposed |
| WA-CF-015 | `HTML pages / service worker / JS assets` | Unverified compatibility risk | High | S6-024; B6-08; B8-13 | Trace script query versions/SW cache lifecycle; verify mixed-version rollback | Not proposed |
| WA-CF-016 | `Routes and frontend API consumers (project-wide)` | Coverage gap — requires comprehensive inventory | Critical | S6-005/035; B4; B8-05/06 | Complete route-to-consumer matrix and negative permission tests | Not proposed |
| WA-CF-017 | `Web, native and staging platform files` | Program-wide acceptance gap | Critical | S6-006/010/011/019/026/031/036 | Reconcile risk-based browser/native/hosted tests; do not change native policy automatically | Not proposed |
| WA-CF-018 | `WA project source inventory` | Audit coverage gap | Critical | S6-034/035; B8-16/17 | Enumerate every authoritative source file; mark applicability, evidence and gap; close each confirmed issue or approve exception | Not proposed |

### 4A. Detailed finding sheets (requirements, evidence and closure)


#### WA-CF-001 — httpdocs/BinForm.html

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


#### WA-CF-018 — WA project source inventory

- **Observed finding:** Whole-project CS-01–CS-12 conformance scan not certified.
- **Classification / risk:** Audit coverage gap; priority **Critical**.
- **Standards:** CS-01–CS-12; all applicable detailed standards.
- **Existing linkage:** S6-034/035; B8-16/17.
- **Required work:** Enumerate every authoritative source file; mark applicability, evidence and gap; close each confirmed issue or approve exception.
- **Correction / installation:** Not proposed.
- **Evidence / limit:** This v1.0 is seeded, NOT exhaustive.
- **Closure condition:** Current authoritative file baseline verified; caller/contract inventory finished; necessary correction or owner-approved exception recorded; complete source difference reviewed; relevant risk-based regressions and applicable browser/HTTP/hosted checks accepted; user confirms installation; independent review gate retained for release.


## 5. Audit coverage queue — no implied file certification

| Audit group | Starting file families / examples | Next verification action | Coverage state |
|---|---|---|---|
| App frontend | `httpdocs/*.html`, shared JS, CSS, service worker, manifest | Enumerate all paths, helper use, UI/HTML formatting, error shapes, PWA caching | **Not exhaustively inventoried** |
| Browser auth and API | `httpdocs/js/waPlatform.js`, `auth.js`, independent `apiFetch`/Bearer clients | Per-page call list, auth/retry/unsafe mutations, form retention | Sampled; migration open |
| Server route registration | `server.js`, `routes/*.js`, `middleware/*.js` | Full method+path/Origin/cookie/token/entitlement/owner/cache/error ledger | B4 representative 17 entries only |
| Domain privacy | Family Tree, public links, image uploads | Row-ownership, private redaction, capability flow, multipart | Selected tests only |
| Database | `dbConnection.js`, schemas, migrations, SQL dumps, query services | Authoritative schema, UTC, transactions, rollback, effect boundaries | Not exhaustively audited here |
| Security/operations | Session services, logger/Morgan, environment guards, rate controls | Credential scopes, sensitive logs, replay, proxy trust | Selected Stage 6 evidence only |
| Mobile/native | TNNA, Capacitor/Android integration | Existing token/device/offline behavior, no unapproved lifetime change | In Progress; device matrix open |
| Documentation/test assets | `README.md`, `CLAUDE.md`, `TechSummary.md`, `tests/`, `docs/`, `change/` | Rule precedence, formatting, references, source provenance and test evidence | Partial |
| Delivery/build assets | `package.json`, lockfiles, dependency scripts, deployment settings | Env drift, dependency security, test-start safeguards, rollback | Not exhaustively audited here |

## 6. Standardization corrective work packages (sequencing, not authorization to change)

| Wave | Purpose | Prerequisites | Exit criterion |
|---|---|---|---|
| 0 — Inventory | Enumerate complete Drive source tree, classify code/test/generated/backup and linked endpoints | Read-only authoritative Drive + GitHub checkpoint | Every applicable file has a row or explicit excluded rationale |
| 1 — Safety contracts | R16-75 verification, shared error/provenance, cache/log checks | Existing T01–T12 evidence, hosted T06/T11 evidence | Reconcile remaining browser tests and every affected error consumer |
| 2 — Shared browser APIs | Migrate small compatible page groups, beginning with ordinary Budget/ETF case | Per-page endpoint/response/UX matrix and owner scope approval | Corrected files + no duplicate writes + form/401/403/5xx tests |
| 3 — Privacy and admin | FT privacy, page capabilities, admin recognition and ownership | Full verified-admin D01 requirements, token/upload matrices | Positive/negative privacy and owner tests; no loss of admin authority |
| 4 — Service + native | Session/race, logging, rate limits, environment, native compatibility | Credential design decisions and tested staging identity | Risk-appropriate browser, database and device evidence |
| 5 — Whole-project close | File audits, exceptions, documentation and verified release | All prior waves verified; S6 issue linkage reconciled | Every file disposition recorded, exceptions approved, independent engineer review completed |

**Priorities are proposed work-order guidance, not approval for production or database operations.** Avoid repeating R10/R14/R15 bounded tests unless code changes affect their assertions.

## 7. Standard register row template for additions

```text
Finding ID: WA-CF-NNN
File(s) / source URI / Drive ID / revision / Git blob:
File role / owners / dependent consumers:
Core ID(s) / Detailed ID(s) / Dxx decision(s):
Finding type: Confirmed | Legacy permitted | Risk unverified | Exception candidate | Document conflict
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

## 8. Verification, exceptions and authoritative closure gates

A row can be `Verified closed` only when (1) an unambiguous current baseline and approved scope exist; (2) all affected consumers/side effects are reviewed; (3) correction is installed by owner **or** exception approved with explicit justification, compensating control, owner and review trigger; (4) complete `.diff`, verification `.md`, formatting/provenance evidence and SHA manifest are recorded for revised existing files; (5) proportionate tests demonstrate required behavior and absence of regression; (6) outstanding caveats are separately tracked; and (7) authorized reviewer signs off.

A source item that was previously closed within a narrow test remains bounded; a new finding needs a separate ID rather than silently reclassifying historical evidence. No row or overall project is deemed complete merely because tests passed in mocks or because a commit is Live.

## 9. R16-75 evidence already available for reconciliation (as of Nov 15)

- Source checkpoint: owner-reported commit `f794eb7` on `reviseLogIn`; verified GitHub branch identical. `server.js` and `httpdocs/js/waPlatform.js` compared with authoritative Drive in prior read-only review.
- T01–T05/T07–T08: bounded offline passes; T09 shared client offline regressions passed; T10 bounded offline tests passed; T12 combined 90/90 offline passed.
- T06 hosted parser probes: 3/3 reported pass (malformed JSON 400, URL-encoded parameter limit 413, incomplete multipart 500), each sanitized nested response and `Cache-Control: no-store`. This is only those three requests.
- T11 hosted logging evidence: provided entries for 400, 413 and 500 use `Request error (HTTP NNN; message omitted)` and no sensitive details; broader logging review remains under S6-030.
- **Still unverified within R16-75:** T09 browser nested error display; T10 actual unsaved-form retention and real browser failed-save/session behavior; project-wide direct-`fetch` consumers including BinForm; full browser/device/route matrix.
- R10/R14/R15 remain previously `PASS (bounded)`; do not promote to whole-project compliance.

## 10. Source register and provenance

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

The first-stage source observations were extracted from the above docs and compared with the GitHub `sthink1/wapps` `reviseLogIn` branch as specifically noted. Historic audit line numbers refer to their pinned November 11 snapshots, not necessarily the installed files after commit `f794eb7`. No claim is made that the complete Drive tree or all source files were exhaustively listed during preparation of this v1.0.

## 11. Next concrete action

**Start Wave 0:** Read-only enumerate the authoritative WA file tree and make a complete per-file audit inventory (path, role, current SHA/revision, applicable CS/detailed rules, audited yes/no), then reconcile each existing finding and record unreviewed files. Carry forward remaining R16-75 browser testing in parallel. **No source revisions in this register itself.**

