# FTNetwork - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTNetwork.html. SHA-256: 0ef50876cb680cafbd9725c1a296c21f8c198a516f68eb2e7140ddf9c4f356ad. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:29:27.725380-05:00; saved completion observed 2026-11-16T10:29:27.726139-05:00. Original count 7. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N01 | Bearer startup and navigation/context | httpdocs/FTNetwork.html:171-175,289-291;httpdocs/js/FTNetwork.js:8-12,36-42,174-215 | C | Restore identity and derive focal/tree context | WA auth/navigation continuity | WA.session loaded; local guard and encoded Person links | Focal networking search person/tree | High |
| N02 | HTTP/read-error adapter | httpdocs/js/FTNetwork.js:76-91,121-134,197-212 | C | Load focal person/search and display failures | Shared status/error contract | WA.api related but business calls direct | Networking messages/results | High |
| N03 | Private focal access and authorization | httpdocs/FTNetwork.html:185-192,289-291;httpdocs/js/FTNetwork.js:10-12,76-102,113-126 | C | Access protected focal/network data | WA privacy/tree/capability/admin boundaries | No FTPrivacy import; server protection related | Biological search starting point | High |
| N04 | Safe DOM/search-result/private-person handoff | httpdocs/js/FTNetwork.js:14-21,93-101,136-171 | C | Render matches safely and open Person | WA output safety and privacy navigation | Local escaping; URLSearchParams; direct Person navigation | Name/match rendering and private result context | High |
| N05 | Account switch/response ordering | httpdocs/js/FTNetwork.js:36-42,76-102,104-171,197-214 | C | Bind delayed responses and cleared results to identity | WA cross-tab/async session isolation | Shared session related; local callbacks | Networking criteria/results | High |
| N06 | Input controls/clear/status accessibility | httpdocs/FTNetwork.html:202-259;httpdocs/js/FTNetwork.js:54-74,104-120,170-171 | C | Read labelled criteria and announce search errors/results | Common UI input/status contract | DOMPurify/inputSanitizer loaded; checkbox only | Networking criteria remain local | High |
| N07 | Shared session/tracker/asset integration | httpdocs/FTNetwork.html:9-10,289-291 | A | Load shared tracking beside legacy business calls | WA telemetry/auth/cache composition | waPlatform; usageTracking; sanitizer | Family Tree attribution | High |

B-only exclusions: B-only: ten complementary networking criteria and biological blood-line semantics. Search is read-only GET; no page mutation/email issuance/upload. Sanitizer loaded but no free-text input exists; do not invent sanitizer gap.

## Candidate assessments

### N01 - Partially Conforming

CS-03/08/10; WA-SESSION-001, WA-AUTH-001. JS175-191 local-token/prerequisite guard precedes any shared restore;36-42 query/session tree; links172-174 and165-166 relative/encoded, no bearer in URL.

Local responsibility: Focal networking search person/tree.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired token and navigation/BFCache. Deferred modernization: D08/compatible session adoption.

### N02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. JS85-90/128-133 throws plain Error(message);198-212 displays only message. Status/code/network/cancel distinctions lost; no retry loop.

Local responsibility: Networking messages/results.

Disposition: CORRECT; TEST FIRST preserving domain fields. Stage 6: R16 S6-008/018/033; T09 page-adapter only. Outstanding verification: 401/403/423/503/network/nonJSON/flat/nested/cancel. Deferred modernization: D04 response migration separate.

### N03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-SEC-ADMIN-001, WA-API-001. JS76-83 bearer-only focal /persons/id; no FTPrivacy/page token import. Server184 mounted protection111-117 denies private focal without capability;208-213 keeps search disabled. Source confirms incomplete authorized-private workflow, not bypass. Search server8201-8225 validates tree/focal membership;8254-8297 restricts biological candidate set, active verified opt-in/email match; shared response redactor applies to returned PersonID records. Admin central flag AND name unchanged.

Local responsibility: Biological search starting point.

Disposition: CORRECT explicit private access flow; retain fail-closed; TEST FIRST. Stage 6: R16 S6-017/009; R17. Outstanding verification: Ordinary private vs admin, wrong-tree/user/token, private result redaction and focal consent boundary; no full bloodline algorithm audit. Deferred modernization: None.

### N04 - Partially Conforming

CS-07/08/09; WA-FRONT-001, WA-PRIV-002. JS14-21 escapes all result text/IDs/matches138-159; Person links165-166 encoded. Server8323-8332 result Name/Matches are removed by privacy redactor for private PersonID, leaving limited record; client expects Name/Matches, ignores IsPrivate and uses generic icon. Private result usability is unverified; no unredacted match disclosure claimed. Direct Person navigation can prompt at destination; no new handoff-consumer defect counted.

Local responsibility: Name/match rendering and private result context.

Disposition: RETAIN escaping; TEST FIRST private-result contract. Stage 6: R16 S6-017/030; R17. Outstanding verification: Private result row/name/key icon/return workflow; hostile strings DOM. Deferred modernization: Optional shared output/navigation helper.

### N05 - Unverified

CS-03/09; WA-SESSION-001. JS93-101/136-171 applies responses without identity/request fence; clear61-74 does not cancel in-flight search. No account event listener; actual stale result disclosure not demonstrated.

Local responsibility: Networking criteria/results.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async UI. Outstanding verification: Logout/account switch/clear or successive searches before response; BFCache. Deferred modernization: None.

### N06 - Confirmed Nonconformance

CS-07; WA-FRONT-001. Checkboxes HTML203-250 labelled; status259 lacks live/role/association; JS108/170/199/212 asynchronous errors/results update text without announcement/focus. No editable text; sanitizer presence not proof of additional need.

Local responsibility: Networking criteria remain local.

Disposition: CORRECT status accessibility; TEST FIRST. Stage 6: R17 accessibility; owner scopes acceptance effect. Outstanding verification: Screen-reader results/errors and keyboard controls. Deferred modernization: Optional shared status helper.

### N07 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. HTML289 page,290 platform,291 tracker. Actual telemetry uses WA.api/current session, business reads do not. Hashes match Batch4 bounded evidence; no full component reread.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Expiry/logout/BFCache/exact accounting/mixed assets. Deferred modernization: D08 and compatible asset/adoption plan.

## Evidence reconciliation

Seven original candidates frozen before selected-page register/prior-finding reconciliation. No additions. Existing shared platform/tracker/sanitizer/protection/admin evidence reused by exact hashes; new networking route checked narrowly. Earlier username-only admin prose is stale; no such current source issue asserted. Completed FTPerson/Batches1-4 and R10/R14/R15/T12/T06/T11 retained, not repeated.

## Common causes and proposed Master Register relevance

N02 RC-HTTP; N03 RC-PRIVATE-DETAIL (new page occurrence, common Batch4 cause); N06 RC-ACCESS-STATUS. N05 RC-IDENTITY unverified; N04 private-result shape mismatch unverified, separate subfinding. Proposed keys only, no official register edits.

## Confirmed gaps and owner attention

Three confirmed candidate occurrences: lost failure categories, missing private focal access path, status announcement. No mutation/external action is performed by this GET-only page; no database-commit ambiguity asserted here.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
