# FTAncestor - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTAncestor.html. SHA-256: 7440d4e23446d9ee37ad8535b356b6898280d2b11389839f9231f6dc0ed28439. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:10:27.829596-05:00; saved completion observed 2026-11-16T10:10:27.830568-05:00. Original count 9. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FA01 | Bearer startup and prerequisites | 153-156 | C | Guard person/tree display startup | Shared session restoration | FTAncestor.js:21-32,254-263; WA.session related | Focal person/tree/cousin generation | High |
| FA02 | Ancestor GET/status/error adapter | 149;154-155 | C | Load graph and present failures | WA typed HTTP/error categories | FTAncestor.js:226-252,272-289; WA.api related | Ancestor data and cousin generation | High |
| FA03 | Privacy page-token wrapper integration | 153-155 | C | Provide scoped per-visit capabilities | Shared specialized transport must constrain credentials | FTPrivacy.js; FTAncestor.js:95-97 | Private-person open action | High |
| FA04 | Private redaction and person/tree navigation | 82-83;91-145;153-154 | C | Render privacy-key entries and navigate person/focus | Reusable privacy/handoff/admin contract | FTAncestor.js:95-158,267-269; FTPrivacy.openPerson | Redacted ancestor/relative cards | High |
| FA05 | DOM text/attribute/image safety | 91-145;154 | C | Encode server cards/rows and validate image protocols | Shared context-sensitive output hygiene | FTAncestor.js:5-19,103-149,219-243 | Ancestor labels/layout/images | High |
| FA06 | Identity-scoped context and asynchronous result ordering | 135-149;154 | C | Persist tree/generation and prevent stale results | Account-switch and delayed-response safety | FTAncestor.js:25-32,226-289 | Cousin-generation choice and family tree code | High |
| FA07 | Calendar-date presentation primitives | 154 | C | Handle date-only strings for years/age | Reusable calendar date consistency | FTAncestor.js:43-89; no shared date codec | Age/deceased biological semantics | Medium |
| FA08 | Dynamic control/status and scroll accessibility | 86-88;135-149;154 | C | Operate relative controls and synchronized scrolling | WA keyboard/name/error announcements | FTAncestor.js:103-195,271-289 | Tree scroll and relative buttons | High |
| FA09 | Shared tracking/platform/assets | 153-156 | A | Use shared session telemetry alongside FT wrapper | WA session/tracker/cache composition | waPlatform; usageTracking; FTPrivacy | Family Tree attribution | High |

B-only exclusions: B-only: ancestor generation placement, biological relationship traversal and cousin ordering/age rules; no changes to graph/layout. No editable free-text form on static page; any FTPrivacy prompt is assessed as a shared dynamic integration.

## Candidate assessments

### FA01 - Partially Conforming

CS-03/08; WA-AUTH-001, WA-SESSION-001. Companion22-28 reads current bearer per request but254-263 redirects absent token before shared restoration and requires person/tree. No WA.session await in business startup.

Local responsibility: Focal person/tree/cousin generation.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired token and restored startup. Deferred modernization: D08/compatible shared session adoption.

### FA02 - Confirmed Nonconformance

CS-03/05/08; WA-SESSION-001, WA-API-002. Companion226-232 throws Error(data.message||fallback) and279-288 displays only message, losing HTTP status/code and cancellation/network distinctions. FTPrivacy23 same unchanged category-loss cause. Ancestor endpoint may intentionally return redacted200 rather than423.

Local responsibility: Ancestor data and cousin generation.

Disposition: CORRECT status/error contract; TEST FIRST. Stage 6: R16 T09 page-only adapter, S6-008/018/033. Outstanding verification: 401/403/423/503/network/nonJSON and privacy domain behavior; no shared-client browser PASS inferred. Deferred modernization: D04 envelope migration separate.

### FA03 - Partially Conforming

CS-08/09; WA-PRIV-002, WA-SHARED-001. 153 imports unchanged FTPrivacy. Companion only calls openPerson95-97, never ensurePageAccess/install; ancestor GET has bearer only, intentionally may be redacted. Known FTPrivacy8 originless substring forwarding is dormant here unless another call installs a token; do not count a new active token leak. waPlatform bound fetch remains separate.

Local responsibility: Private-person open action.

Disposition: RETAIN redacted ancestor contract; TEST FIRST before transport migration; shared wrapper CORRECT under existing evidence. Stage 6: R16 S6-017; R17; R20 asset composition. Outstanding verification: Actual requests before/after navigation and conditional wrapper scope; no exfiltration observed. Deferred modernization: Explicit scoped-header adapter design.

### FA04 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001; D01/D06. Companion105-108,126-129 omits private photos/date/home;96 delegates FTPrivacy.openPerson, which36-39 writes one-use handoff. Same-hash prior FP04 establishes consumer ensurePageAccess30 passes header but api23 overwrites it. This selected-page handoff therefore uses the known defective component contract; FTPerson examination not repeated. Server privacy49-52,107-131 central admin/redaction and ancestor4268-4312 tree membership present.

Local responsibility: Redacted ancestor/relative cards.

Disposition: CORRECT shared handoff once; TEST FIRST complete navigation; preserve private redaction. Stage 6: R16 S6-017/009; R17; R19 capability binding. Outstanding verification: Private unlock then Person navigation, reopen/reload/new-key rule, expiry/wrong-person/user, admin negative cases and full action coverage. Deferred modernization: None.

### FA05 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. Companion5-19 escapes text/attributes and allowlists image protocols;103-149 cards/rows escape name/photo/meta. PersonID interpolated raw into data-id relies on numeric server contract; parsed Number before action153-156. No source-confirmed XSS from current numeric route contract; future malformed upstream requires tests. No private data logged here.

Local responsibility: Ancestor labels/layout/images.

Disposition: RETAIN; TEST FIRST output boundary. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Synthetic unusual text/image protocols/IDs; browser DOM/URL resolution and privacy placeholders. Deferred modernization: Optional common escape/URL helper.

### FA06 - Unverified

CS-03/09; WA-SESSION-001, WA-PRIV-002. Companion27 reads query or unscoped session tree;234-235 updates tree and renders without identity/request generation guard. Concurrent cousin changes272-281 can complete out of order. Server authorization protects requests but does not fence already-returned DOM. No actual cross-account exposure demonstrated.

Local responsibility: Cousin-generation choice and family tree code.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async UI race, not refresh replay. Outstanding verification: Delayed previous-user/previous-generation response, storage logout, BFCache and old private display cleanup. Deferred modernization: None.

### FA07 - Partially Conforming

CS-01/06/08; WA-DATA-001, WA-SHARED-001. Companion55-58 explicitly constructs local midnight from date-only slices;68-87 slices calendar year. Business age/deceased rules excluded; no shared codec required solely for duplication.

Local responsibility: Age/deceased biological semantics.

Disposition: RETAIN; TEST FIRST if reused. Stage 6: R17 timezone/browser. Outstanding verification: Invalid/null/leap date and timezone edges; relationship algorithms excluded. Deferred modernization: Optional date-only helper.

### FA08 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001. Static cousin select135 is labelled and controls use names/title. But actually reachable FTPrivacy popup10-22 has no role/aria-modal, no focus trap/return or Escape, and error16/20 lacks announcement. input.focus21 alone is incomplete. One shared-popup occurrence, distinct from local overlay implementations. Scroll sync167-195 is guarded, runtime keyboard behavior untested.

Local responsibility: Tree scroll and relative buttons.

Disposition: CORRECT shared popup accessibility once; TEST FIRST scroll/control keyboard. Stage 6: R17; owner standardization/acceptance risk disposition. Outstanding verification: Privacy-key modal focus/cancel/errors, relative controls and horizontal scrolling. Deferred modernization: Optional shared dialog service.

### FA09 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. 153-156 order FTPrivacy/page/platform/tracker; wrapper installation asynchronous/conditional, WA.api captured fetch may bypass it. Tracker uses shared WA.api but ancestor requests direct. Hash-based bounded evidence reused.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST; no blind fetch replacement. Stage 6: R16 S6-025/017; R17; R20 S6-024. Outstanding verification: Tracking lifecycle, late identity and mixed FT/privacy/platform assets. Deferred modernization: D08 and compatible explicit token transport.

## Evidence reconciliation

Nine candidates independently frozen before prior report/register reconciliation. FTPrivacy, privacy route and central admin hashes exactly match prior FTPerson manifest; only source segments needed to resolve this new ancestor integration were inspected. Full prior FTPerson review preserved and not repeated. Existing FP03 scope defect is conditional/dormant on ancestor; FP04 handoff defect affects actual openPerson navigation. Server protection redacts ancestor JSON; no privacy bypass asserted. Older username-only documentation remains drift, not current policy or implementation finding.

## Common causes and proposed Master Register relevance

FA02 RC-HTTP separate adapter occurrence. FA04 RC-FT-HANDOFF common existing FP04 root. FA08 RC-FT-POPUP shared accessibility root. FA03 RC-FT-SCOPE known component issue but inactive wrapper on this page; zero new active forwarding occurrence. FA06 B04-IDENTITY unverified. Root/subfinding mapping proposed only; not official IDs.

## Confirmed gaps and owner attention

Three confirmed candidate occurrences: lost HTTP categories; known shared private-person handoff failure; reachable shared privacy popup accessibility. No demonstrated exploit, current username-only admin bug, or active ancestor token forwarding claimed.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
