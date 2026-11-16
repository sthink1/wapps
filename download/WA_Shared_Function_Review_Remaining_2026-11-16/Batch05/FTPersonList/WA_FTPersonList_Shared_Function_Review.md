# FTPersonList - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTPersonList.html. SHA-256: 23e52db32f3cf6a6e380db34d1605bf889487a6dfcc5dea1ece8fd5ad9c3fde9. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:34:21.502070-05:00; saved completion observed 2026-11-16T10:34:21.502841-05:00. Original count 9. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L01 | Token startup/current-tree/navigation | httpdocs/FTPersonList.html:179-182,234-237;httpdocs/js/FTPersonList.js:16-22,240-267,291-300 | C | Load current/separated trees and guard navigation | WA restoration/context contract | WA.session related; local guard | Separated vs current tree semantics | High |
| L02 | HTTP/failure adapters | httpdocs/js/FTPersonList.js:93-115,240-254,302-324 | C | Fetch split view and explicit use-tree mutation | WA status/error contract | WA.api related but not business delegate | Split-view and enter-code fields | High |
| L03 | Private redaction/capability handoff | httpdocs/FTPersonList.html:234-235;httpdocs/js/FTPersonList.js:117-123,159-176,219-225 | C | Render private placeholders and open private Person | WA specialized privacy/admin/navigation | FTPrivacy.openPerson actual use | Separated-tree Person navigation | High |
| L04 | Safe DOM/date/attribute output | httpdocs/js/FTPersonList.js:6-14,44-51,125-217,267-288 | C | Encode server tree/person values | WA output safety/date adapter boundary | Local escapeHtml; textContent | Tree rows/date columns | High |
| L05 | Reusable free-text sanitation/filtering | httpdocs/FTPersonList.html:188-190,234-237;httpdocs/js/FTPersonList.js:53-90,308-311 | C | Handle free-text filter safely | Mandatory shared text-input defense | No DOMPurify/inputSanitizer import | Local list matching remains domain-specific | High |
| L06 | Use-tree mutation/pending/context lifecycle | httpdocs/js/FTPersonList.js:93-115,228-237 | C | Change current tree intentionally once per action | WA no replay/uncertain result contract | Direct POST then reload | Use this tree distinct from read-only Person open | High |
| L07 | Account switch/asynchronous state | httpdocs/js/FTPersonList.js:18-22,93-115,240-289,302-324 | C | Keep loaded tree/person/cache aligned with identity | WA late-response/session isolation | Shared session related; local caches | Tree set/filter/current code | High |
| L08 | Filter/control/status and popup accessibility | httpdocs/FTPersonList.html:188-197,230,234;httpdocs/js/FTPersonList.js:117-123,228-237,302-324 | C | Operate filter/actions and announce load/privacy errors | WA labels/focus/error semantics | FTPrivacy popup; local status/filter | List controls/status | High |
| L09 | Shared platform/tracker/asset composition | httpdocs/FTPersonList.html:234-237 | A | Use common telemetry beside privacy helper | WA tracker/cache/scoped fetch integration | FTPrivacy; waPlatform; usageTracking | Family Tree attribution | High |

B-only exclusions: B-only: alphabet matching, family-name sorting/filter terms, original/separated tree presentation. Calendar dates are escaped display values under output candidate; no arithmetic audit. No generic global fetch replacement proposed.

## Candidate assessments

### L01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. JS291-295 guard before restoration;240-267 server current tree updates/removes session code,297-300 safe relative fallback; no bearer URLs. Server3655-3675/3703-3739 user membership filters current/separated trees. Admin-without-membership menu enumeration remains coverage/policy question, no fulladmin denial certification.

Local responsibility: Separated vs current tree semantics.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/009; R17. Outstanding verification: Cookie-only/expired token, separated-tree navigation, fulladmin access requirements. Deferred modernization: D08/compatible startup/navigation.

### L02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. JS108-109/252-253 throws Error(message);233-235/302-324 displays message without status/code/network distinctions. FTPrivacy23 same shared loss.

Local responsibility: Split-view and enter-code fields.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 page-adapter only. Outstanding verification: 401/403/423/503/network/nonJSON/cancel/domain fields. Deferred modernization: D04 envelope migration separate.

### L03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001. JS117-123 actually calls FTPrivacy.openPerson;170 private-key icon and173-175 hides private dates/place. Server split-view response contains PersonID records, mounted nested redactor applies; central admin current flag/name unchanged. Existing same-hash FP04: helper openPerson38 writes handoff, ensurePageAccess30 supplies issued header but api23 overwrites opt.headers, so selected-page private transition has defective shared capability propagation. Prior FTPerson not reexamined. Wrapper install not called by this list, so existing scope defect is dormant here.

Local responsibility: Separated-tree Person navigation.

Disposition: CORRECT shared handoff once; TEST FIRST preserve redaction/readonly navigation. Stage 6: R16 S6-017/009; R17; R19 capability binding. Outstanding verification: Private-to-Person handoff/reload/newkey, expired/wrong-user/tree, admin positive/negative; complete action matrix open. Deferred modernization: None.

### L04 - Conforming — source verified

CS-07/09; WA-FRONT-001. JS6-14 escapes tree/name/IDs/data-code/attributes;173/175 dateUS output escaped (unlike latent unescaped Event fallback);267/286 status textContent. No user filter promoted to HTML.

Local responsibility: Tree rows/date columns.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Hostile names/date strings/IDs/attributes and DOM. Deferred modernization: Optional shared output/date codec.

### L05 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. HTML189 reusable text filter,234-237 no DOMPurify/inputSanitizer; JS308-311 only trim/lowercase then local filtering. Mandatory reusable free-text sanitization absent; safe output separately present, so this is defense-standard departure, not demonstrated XSS.

Local responsibility: Local list matching remains domain-specific.

Disposition: CORRECT within approved input scope; preserve exact filter behavior; TEST FIRST. Stage 6: R17 input/browser; deferred standardization unless owner risk requires earlier. Outstanding verification: Markup-like/nonASCII filtering, typing/IME and sanitizer integration without changing searches. Deferred modernization: Optional shared filter adapter; sanitation correction mandatory.

### L06 - Partially Conforming

CS-03/06/08; WA-SESSION-001, WA-DATA-001. JS93-115 explicit POST only;228-237 then GET reload; no retry or pending guard. Person open117-123 intentionally no enter-code mutation. Existing backend enter-code1800-1855 commits membership transaction, no postcommit external action in inspected path. Failure after POST success/GET failure may be ambiguous UI, not replay.

Local responsibility: Use this tree distinct from read-only Person open.

Disposition: RETAIN no replay; TEST FIRST. Stage 6: R16 T10/S6-018; R19 UI repeated actions. Outstanding verification: Double click, uncertain membership success/reload, preserving filter/choice. Deferred modernization: Optional pending helper.

### L07 - Unverified

CS-03/09; WA-SESSION-001. JS18-22 caches tree/current/filter;112-114 and256-288 apply result without identity/request fence/storage logout listener. Current-token read before send only.

Local responsibility: Tree set/filter/current code.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19. Outstanding verification: Account switch/logout/overlapping refresh/use-tree and BFCache. Deferred modernization: None.

### L08 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML189 filter has placeholder only, no associated label;230 status no live/role. Shared reachable FTPrivacy popup10-22 lacks dialog semantics/trap/return/Escape/error announcements (unchanged prior bounded evidence); input focus alone incomplete. One candidate retains separate local filter/status and shared popup subfindings.

Local responsibility: List controls/status.

Disposition: CORRECT accessible controls/status/shared popup; TEST FIRST. Stage 6: R17 accessibility. Outstanding verification: Label/name, typing focus after rerender, private popup and async errors. Deferred modernization: Optional common field/status/dialog helper.

### L09 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. HTML234 helper235 page236 platform237 tracker; no ensure/install on page. Actual telemetry shared, business fetch local; bound platform fetch/privacy wrapper ordering must be tested if migration.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025/017; R17; R20 S6-024. Outstanding verification: Tracking lifecycle/exact counts/assets; no blind global fetch rewrite. Deferred modernization: D08/explicit compatible transport/assets.

## Evidence reconciliation

Nine independent candidates frozen before selected-page prior/register reconciliation; no additions. Same-hash FTPrivacy properties reused from FTPerson/Batch4 only after actual call discovery. Narrow split-view route confirms per-user membership and no mutation-on-read; privacy filter remains installed. All earlier tests/reports preserved. No full admin coverage, runtime privacy bypass or current username-only helper defect claimed.

## Common causes and proposed Master Register relevance

L02 RC-HTTP; L03 RC-FT-HANDOFF; L05 RC-SAN-MISSING; L08 RC-ACCESS (filter/status/shared popup subfindings). L07 RC-IDENTITY unverified. Same shared defect counted once as a common cause, separately one affected page candidate.

## Confirmed gaps and owner attention

Four confirmed candidates. Correct mandatory sanitizer/accessibility separately from optional helper modernization. Private handoff reuses existing defect; no new active page-token exfiltration claimed.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
