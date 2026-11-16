# BmonthDetailReport - shared-function compliance review

Authority: explicit November 16 Batch 3 authorization and four refinements (unchanged shared evidence; distinguish page copies/common causes; observed or unresolved timing; Stage 6 and proposed Master Register mapping). Original remaining-58 assignment sections 5-15 governs. Eleven Batch 3 files only, processed sequentially. No completed examination repeated.

Source: httpdocs/BmonthDetailReport.html. SHA-256: c9824f9aecbbfaf66e680a8cfc84b6e3d3b1a30e85f885e9f30c695147836f28. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:40:16.163044-05:00; saved completion observed 2026-11-16T09:40:16.164075-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MD01 | Credential gate / request origin | 387-390;402-425;415-446;603-608 | A | Authenticate detail request | Session/origin contract common | WA.session.restore; WA.api.request | Monthly detail endpoint/local8080 routing | High |
| MD02 | apiFetch / error feedback | 415-446;464-474;577-578 | A | Decode/report failures | Common status/error-envelope contract | WA.api.json / WA.ApiError | Budget message/suffix compatibility | High |
| MD03 | Year/month query validation | 476-493;538-555 | C | Validate route inputs before read | Generic URL/input boundary reusable | URLSearchParams; native Number | Year1900-9999/month1-12 and detail route | High |
| MD04 | Safe detail rendering / display | 448-462;506-536;557-576 | C | Render source activity safely | Context-safe DOM/display common | Native textContent; escapeHtml; Number/Intl | In/Out fields/totals/deficit classes and integer display | High |
| MD05 | Source-page mapping/navigation and keyboard semantics | 282-310;325-353;392-400;495-504;533;582-588 | C | Open source records and menus accessibly | Safe URL and keyboard actions reusable | Native links/location; no shared accessible table helper identified | Seven fixed Budget source destinations, encoded source ID | High |
| MD06 | Async load/outcome state | 538-580;603-609 | C | Load chosen month and handle errors | Request/identity/feedback lifecycle common | WA.api transport; native DOM | Single initial month request and In/Out presentation | High |
| MD07 | Worker registration | 590-601 | A | Register common PWA worker | Shared cache/version boundary | httpdocs/sw.js | Root scope | High |
| MD08 | Platform and usage tracker | 611-612 | A | Track authenticated detail usage | Cross-WA lifecycle tracking | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Detail page path; business adapter independent | High |

B-only exclusions: B-only: In/Out/source labels, detail totals/deficit computation and fixed source destinations. No writes/free text or generic sanitizer requirement. Source form files not reopened as navigation dependencies; financial/layout/formatting audit excluded.

## Candidate assessments

### MD01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 402/416 current token;406/604 presence-only startup gate;387-390 dev cross-port origin.553 local API read distinct from tracker shared usage.

Local responsibility: Monthly detail endpoint/local8080 routing.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account switch/dev origin. Deferred modernization: Staged transport/session/D08 migration.

### MD02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. RC-HTTP-VARIANT:415-446 expanded plain Error algorithm;437 accepts error object,441 String-coerces it, no status/code retained.577-578 show message only. Common cause reused; actual detail GET independently traced.

Local responsibility: Budget message/suffix compatibility.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Nested/flat/status/non-JSON/type contract. Deferred modernization: None.

### MD03 - Conforming — source verified

CS-01/04/08; WA-API-001, WA-SHARED-001. 476-493 rejects noninteger/out-of-range year1900-9999/month1-12 before553 endpoint interpolation. Backend890-902 validates same bounds; no user strings inserted into URL unvalidated.

Local responsibility: Year1900-9999/month1-12 and detail route.

Disposition: RETAIN; TEST FIRST. Stage 6: R14/S6-009; R17. Outstanding verification: Missing/invalid/edge year/month and denied authenticated response. Deferred modernization: None.

### MD04 - Conforming — source verified

CS-07/09/08; WA-FRONT-001, WA-SHARED-001. 454-462 encoder escapes526-529 Date/Source/FromTo/Description;530 numeric amount.557/563-570 title/totals textContent.512 directionLabel only literal In/Out callers560-561. Flags control fixed classes, no unsafe literal content observed.

Local responsibility: In/Out fields/totals/deficit classes and integer display.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Malformed arrays/types and actual accessible display. Deferred modernization: Optional display-only helper reuse preserving detail fields/integer amounts.

### MD05 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. RC-KEYBOARD:533 click-only detail row with no focusable equivalent/key handler.282/325 aria-hidden separate header tables leave body tables without accessible headings.495 uses fixed source map392-400+encoded ID; current producer695-745 emits these routes, so no arbitrary route-origin disclosure demonstrated.

Local responsibility: Seven fixed Budget source destinations, encoded source ID.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Accessibility triage; R17. Outstanding verification: Keyboard/source record navigation, table heading association, unknown SourceRoute/ID. Deferred modernization: None.

### MD06 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 538 clears feedback and validates month;603 one initial GET (no user repeated filter). No response identity guard; loading after account switch may be stale. Do not transplant rapid-filter race from pages with filter controls or failed-save findings to this read-only page.

Local responsibility: Single initial month request and In/Out presentation.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-018; R17. Outstanding verification: Initial failure/recovery and late-account identity response. Deferred modernization: None.

### MD07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. RC-PWA:590-601 unchanged worker registration; shared precache/update concern reused once at component level.

Local responsibility: Root scope.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16/S6-024; R20 rollback relevance. Outstanding verification: Hosted precache/install/update/mixed assets. Deferred modernization: None.

### MD08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 611-612 ordered platform/tracker; shared request/restore in tracker, detail GET local. Hashes unchanged.

Local responsibility: Detail page path; business adapter independent.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-025; R16/R17; prior R15 retained. Outstanding verification: Exact lifecycle/expiry/logout/BFCache/asset compatibility. Deferred modernization: None.

## Evidence reconciliation

After independent inventory/assessment, newly read activity/source-map695-749 and detail890-902 producer subsets corroborate fixed SourceRoute labels, user-scoped queries and query bounds. Financial recurrence/totals not audited. Reused unchanged shared cache and prior S6/T09 evidence; Master schema unavailable locally and mappings proposed only.

## Common causes and proposed Master Register relevance

MD02 semantic variant under HTTP-contract cause; MD05 row/header occurrence RC-KEYBOARD; MD07 shared RC-PWA reference. Query and safe renderer are bounded positive source findings, not copied presumed defects. Proposed Master evidence links local findings to S6/R16/R17 and preserves page integration; no authoritative register IDs/schema assumed.

## Confirmed gaps and owner attention

Two confirmed candidates MD02/MD05. Safe fields/query validation source verified; route-map destinations corroborated by current producer. Complete runtime authorization/identity/worker/browser claims remain unverified, and linked source forms were not re-examined.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch03 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
