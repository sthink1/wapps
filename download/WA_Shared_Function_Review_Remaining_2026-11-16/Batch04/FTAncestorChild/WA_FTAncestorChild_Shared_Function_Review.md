# FTAncestorChild - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTAncestorChild.html. SHA-256: fafdf643f5f2eeee9ccebf83f4e8d94d80095567290460d49556630be5d679aa. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:12:33.903771-05:00; saved completion observed 2026-11-16T10:12:33.904715-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FC01 | Current bearer startup | 131-133 | C | Guard authenticated relationship view | Shared restoration/current token | FTAncestorChild.js:22-31,166-170; WA.session related | Focal relationship context | High |
| FC02 | Two-read HTTP/error adapter | 123;131-132 | C | Load relationships then person and report failures | Shared status/error contract | FTAncestorChild.js:98-135,177-180; WA.api related | Children/person response fields | High |
| FC03 | Private-person access and navigation | 100-101;107;120;131 | C | Display protected focal/related data and open Person | FT privacy/page-token/handoff contract | FTAncestorChild.js:92-135; no FTPrivacy import | Children list and focal name | High |
| FC04 | Safe output and encoded navigation | 107;120;131 | C | Render relationship rows and person name | WA safe DOM/URL handling | FTAncestorChild.js:7-21,92-95,137-163,172-174 | Name/age/gender columns | High |
| FC05 | Identity-bound query/context and response lifecycle | 131 | C | Keep focal tree/person and responses tied to account | Cross-app account-switch protection | FTAncestorChild.js:25-31,98-164 | Family tree context | High |
| FC06 | Date-only presentation adapter | 131 | C | Convert date-only values to age display | Calendar primitives may be shared | FTAncestorChild.js:57-90 | Biological/deceased age rules | Medium |
| FC07 | Dynamic action/status accessibility | 113-123;131 | C | Expose person actions and load errors | WA keyboard/control/error semantics | FTAncestorChild.js:145-151,177-180 | P action and children errors | High |
| FC08 | Shared platform/tracker integration | 131-133 | A | Use shared visit/time tracking | WA-wide session and telemetry | waPlatform; usageTracking | Family Tree attribution | High |

B-only exclusions: B-only: biological children selection, age/deceased business semantics and table layout. No editable text controls or multipart upload. Uncalled safeImageUrl helper is not an active image path.

## Candidate assessments

### FC01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. Companion23 reads bearer per request;166-170 missing token redirects before shared restore. Query/session tree used28-31; no await WA.session.

Local responsibility: Focal relationship context.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only restoration/expired token/direct access. Deferred modernization: D08/compatible shared startup.

### FC02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. Companion109-135 parses then throws plain Error(message);179-180 displays message without HTTP status/code/network/cancel distinction. Two dependent GETs, no unsafe retry.

Local responsibility: Children/person response fields.

Disposition: CORRECT category retention; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 page-only adapter. Outstanding verification: 401/403/423/503/nonJSON/network/cancel; preserve staged flat/nested fields. Deferred modernization: D04 envelope migration separate.

### FC03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001. No FTPrivacy import131-133; companion118-126 always sends bearer-only GET /persons/id after relationships. Server184 protection; ftPrivacy111-117 rejects private focal person without page capability, except ancestor/relationships endpoints. Thus ordinary private focal view cannot complete this load; no unlock/handoff acquisition path exists here. Direct related-person navigation92-95 supplies no capability; destination may prompt independently, which alone is not a bypass/defect. Server membership3993-4015 and4640 remains enforced.

Local responsibility: Children list and focal name.

Disposition: CORRECT private focal access flow under owner-approved contract; preserve denial/redaction; TEST FIRST. Stage 6: R16 S6-017/009; R17. Outstanding verification: Ordinary authorized private user vs admin; key entry, wrong/expired/person/user token and reload; no exploit claimed. Deferred modernization: None.

### FC04 - Conforming — source verified

CS-07/09; WA-FRONT-001, WA-LOG-001. Companion137 textContent focal name;153/155 escapes gender/name; data-id/title numeric server contract148-149, Number conversion162.92-95/174 encode navigation. No untrusted image sink: safeImageUrl is unused. Server response filter107-131 redacts nested private persons.

Local responsibility: Name/age/gender columns.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-017/030; R17. Outstanding verification: Hostile strings/nonnumeric IDs/DOM, private rows; no output injection demonstrated. Deferred modernization: Optional common output helper.

### FC05 - Unverified

CS-03/09; WA-SESSION-001. Companion25-31 query/session context not keyed by user; two awaits98-138 read potentially changing bearer independently and have no identity fence/abort/storage listener. Actual cross-account DOM leak not demonstrated.

Local responsibility: Family tree context.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 delayed requests. Outstanding verification: Switch/logout between the two GETs or before render; BFCache cleanup. Deferred modernization: None.

### FC06 - Partially Conforming

CS-01/06/08; WA-DATA-001, WA-SHARED-001. Companion60-65 local-midnight construction from date-only slices; age/deceased business rules57-90 excluded. No shared codec mandated just for similarity.

Local responsibility: Biological/deceased age rules.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 timezone/browser. Outstanding verification: Date-only null/invalid/leap/timezone; no biological arithmetic audit. Deferred modernization: Optional date codec.

### FC07 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML123 status has no role/live association; companion179-180 writes load/authorization failure asynchronously without focus change or announcement. P controls have text/title and are not claimed nameless. No modal loaded.

Local responsibility: P action and children errors.

Disposition: CORRECT error announcement; TEST FIRST. Stage 6: R17 accessibility; separately scoped owner disposition. Outstanding verification: Screen-reader error announcement and keyboard action context. Deferred modernization: Optional status helper.

### FC08 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. 131 page,132 platform,133 tracker; telemetry uses shared API/current token, business reads remain local. Bounded unchanged component evidence reused.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Tracking expiry/logout/BFCache/duplicates and mixed assets. Deferred modernization: D08/compatible adoption and versioning.

## Evidence reconciliation

Eight original candidates frozen before register reconciliation. No new candidate additions. Prior unchanged platform/tracker/server-admin/protection properties reused; this page does not import FTPrivacy, so no new shared wrapper or handoff-consumer occurrence counted. Narrow exact person/relationships routes plus known mounted protection establish missing private-focal integration, not unauthorized disclosure. Full FTPerson examination and accepted tests preserved.

## Common causes and proposed Master Register relevance

FC02 RC-HTTP distinct adapter occurrence; FC03 B04-PRIVATE-DETAIL common bare private-person detail request pattern; FC07 RC-STATUS separate local announcement occurrence. FC05 B04-IDENTITY unverified. Counts are candidate occurrences, not additional common causes for every HTTP/status/subfinding.

## Confirmed gaps and owner attention

Three confirmed candidates: HTTP category loss, missing private focal-person capability flow, and asynchronous error announcement. No current admin-policy mismatch or private-data bypass demonstrated.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
