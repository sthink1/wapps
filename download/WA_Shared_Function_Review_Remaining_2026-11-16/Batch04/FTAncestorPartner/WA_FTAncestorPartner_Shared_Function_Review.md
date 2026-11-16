# FTAncestorPartner - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTAncestorPartner.html. SHA-256: 1af1c22dd995bf4dfb8f557044f2a509238332cfee29dc53548ba7d3fc3ac232. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:13:54.457120-05:00; saved completion observed 2026-11-16T10:13:54.457888-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FPB01 | Authenticated relationship startup | 131-133 | C | Require credential before Partner load | Common auth/session restoration | FTAncestorPartner.js:22-31,166-170; WA.session related | Partner view focal context | High |
| FPB02 | Relationships/person request and failure handling | 123;131-132 | C | Perform two dependent GETs and expose errors | WA HTTP/status/failure contract | FTAncestorPartner.js:98-135,177-180; WA.api related | Partner results and person name | High |
| FPB03 | Private focal data and Person transition | 100-101;107;120;131 | C | Access private focal details and related Person page | WA privacy capabilities/redaction/admin boundaries | FTAncestorPartner.js:92-135; no FTPrivacy script | Partner list/context | High |
| FPB04 | Safe row/text/URL output | 107;120;131 | C | Encode rows, assign name, encode context links | Common context-sensitive DOM safety | FTAncestorPartner.js:7-21,92-95,137-163,172-174 | Partner names/gender/age | High |
| FPB05 | Account/context and delayed result lifecycle | 131 | C | Associate query/session context and responses with identity | WA account-switch isolation | FTAncestorPartner.js:25-31,98-164 | Focal Person/tree | High |
| FPB06 | Date-only display conversion | 131 | C | Interpret date fields for presentation | Shared calendar/date contract | FTAncestorPartner.js:57-90 | Partner age/deceased semantics | Medium |
| FPB07 | Person action and asynchronous status accessibility | 113-123;131 | C | Expose row actions and loading errors | WA accessible actions/error announcements | FTAncestorPartner.js:145-151,177-180 | Partner list errors | High |
| FPB08 | Shared telemetry and asset integration | 131-133 | A | Load platform/tracker beside page code | WA session/tracking/PWA dependency contract | waPlatform; usageTracking | Family Tree attribution | High |

B-only exclusions: B-only: partner relationship selection and biological age/deceased semantics. No editable text fields, uploads or local mutation. safeImageUrl is defined but not called.

## Candidate assessments

### FPB01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. Companion23 reads bearer per request;166-170 missing token redirects before shared restore. Query/session tree used28-31; no await WA.session.

Local responsibility: Partner view focal context.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only restoration/expired token/direct access. Deferred modernization: D08/compatible shared startup.

### FPB02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. Companion109-135 parses then throws plain Error(message);179-180 displays message without HTTP status/code/network/cancel distinction. Two dependent GETs, no unsafe retry.

Local responsibility: Partner results and person name.

Disposition: CORRECT category retention; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 page-only adapter. Outstanding verification: 401/403/423/503/nonJSON/network/cancel; preserve staged flat/nested fields. Deferred modernization: D04 envelope migration separate.

### FPB03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001. No FTPrivacy import131-133; companion118-126 always sends bearer-only GET /persons/id after relationships. Server184 protection; ftPrivacy111-117 rejects private focal person without page capability, except ancestor/relationships endpoints. Thus ordinary private focal view cannot complete this load; no unlock/handoff acquisition path exists here. Direct related-person navigation92-95 supplies no capability; destination may prompt independently, which alone is not a bypass/defect. Server membership3993-4015 and4640 remains enforced.

Local responsibility: Partner list/context.

Disposition: CORRECT private focal access flow under owner-approved contract; preserve denial/redaction; TEST FIRST. Stage 6: R16 S6-017/009; R17. Outstanding verification: Ordinary authorized private user vs admin; key entry, wrong/expired/person/user token and reload; no exploit claimed. Deferred modernization: None.

### FPB04 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. Companion137 textContent focal name;153/155 escapes gender/name; data-id/title numeric server contract148-149, Number conversion162.92-95/174 encode navigation. No untrusted image sink: safeImageUrl is unused. Server response filter107-131 redacts nested private persons.

Local responsibility: Partner names/gender/age.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-017/030; R17. Outstanding verification: Hostile strings/nonnumeric IDs/DOM, private rows; no output injection demonstrated. Deferred modernization: Optional common output helper.

### FPB05 - Unverified

CS-03/09; WA-SESSION-001. Companion25-31 query/session context not keyed by user; two awaits98-138 read potentially changing bearer independently and have no identity fence/abort/storage listener. Actual cross-account DOM leak not demonstrated.

Local responsibility: Focal Person/tree.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 delayed requests. Outstanding verification: Switch/logout between the two GETs or before render; BFCache cleanup. Deferred modernization: None.

### FPB06 - Partially Conforming

CS-01/06/08; WA-DATA-001, WA-SHARED-001. Companion60-65 local-midnight construction from date-only slices; age/deceased business rules57-90 excluded. No shared codec mandated just for similarity.

Local responsibility: Partner age/deceased semantics.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 timezone/browser. Outstanding verification: Date-only null/invalid/leap/timezone; no biological arithmetic audit. Deferred modernization: Optional date codec.

### FPB07 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML123 status has no role/live association; companion179-180 writes load/authorization failure asynchronously without focus change or announcement. P controls have text/title and are not claimed nameless. No modal loaded.

Local responsibility: Partner list errors.

Disposition: CORRECT error announcement; TEST FIRST. Stage 6: R17 accessibility; separately scoped owner disposition. Outstanding verification: Screen-reader error announcement and keyboard action context. Deferred modernization: Optional status helper.

### FPB08 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. 131 page,132 platform,133 tracker; telemetry uses shared API/current token, business reads remain local. Bounded unchanged component evidence reused.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Tracking expiry/logout/BFCache/duplicates and mixed assets. Deferred modernization: D08/compatible adoption and versioning.

## Evidence reconciliation

Eight candidates independently discovered from the full Partner HTML and companion and frozen before this reconciliation. A read-only companion diff then established that Child/Partner scripts differ only in four partner-vs-child data/message expressions, at identical line locations. Reuse the verified identical auth/error/privacy/output/date/accessibility mechanics without repeating their analysis. This is source comparison, not an assumption of equal hashes (hashes differ). Backend protection/admin hashes unchanged. No FTPerson examination or completed test repeated; no candidate additions.

## Common causes and proposed Master Register relevance

FPB02 RC-HTTP; FPB03 B04-PRIVATE-DETAIL; FPB07 RC-STATUS. Separate page-level occurrences of the same invariant failures, not three new root causes. FPB05 B04-IDENTITY remains unverified. Proposed review-local keys only.

## Confirmed gaps and owner attention

Three confirmed candidate occurrences: lost failure categories, bearer-only private focal-person detail request without unlock integration, and missing error announcement. Partner-specific actual results binding independently verified; no private-data bypass asserted.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
