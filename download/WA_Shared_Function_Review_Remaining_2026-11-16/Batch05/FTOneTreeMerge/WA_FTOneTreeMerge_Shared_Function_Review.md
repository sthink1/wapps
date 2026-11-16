# FTOneTreeMerge - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTOneTreeMerge.html. SHA-256: 1d78a09658bbb4a2119e2deae2a3a0c167b9fe4310a617b0f101cdf3b6d4c8b4. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:31:08.147466-05:00; saved completion observed 2026-11-16T10:31:08.148261-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| M01 | Bearer startup and encoded navigation | httpdocs/FTOneTreeMerge.html:6-7;httpdocs/js/FTOneTreeMerge.js:18-20,31,33-34 | C | Guard review and navigate contextual returns | Common auth/navigation/session contract | WA.session related; local guard/direct links | Merge source/target/bridge context | High |
| M02 | Review/merge HTTP error adapter | httpdocs/js/FTOneTreeMerge.js:31,33-34 | C | Read review and submit merge outcome | WA HTTP/status/response categories | WA.api related but not called | Already-same-tree/merge response fields | High |
| M03 | Privacy and authorized review/merge boundaries | httpdocs/js/FTOneTreeMerge.js:19-20,27-33 | C | Read private candidates/conflicts and mutate tree relations | WA privacy/redaction/tree/admin authorization | No FTPrivacy import; server protections related | Merge decisions and source/target access | High |
| M04 | Safe DOM/image/attribute rendering | httpdocs/js/FTOneTreeMerge.js:3-17,22-30 | C | Render server candidate/contacts/conflicts/images safely | WA safe DOM/URL principles | Local escapeHtml/safeImageUrl | Review cards and conflict choices | High |
| M05 | Mutation pending/draft/no replay lifecycle | httpdocs/js/FTOneTreeMerge.js:21,30,32-34 | C | Retain review decisions and report uncertain mutation | WA no replay/unsaved-state handling | Local disable; no shared pending helper | Merge decision object and navigation | High |
| M06 | Account-switch/late-response context | httpdocs/js/FTOneTreeMerge.js:20-21,31,33-34 | C | Keep review and completion aligned with identity | WA session identity fencing | Shared session related; local async callbacks | Source/target tree and current code | High |
| M07 | Dynamic review controls/status accessibility | httpdocs/FTOneTreeMerge.html:6;httpdocs/js/FTOneTreeMerge.js:28-34 | C | Choose matches/conflicts/images and report errors | WA labels/focus/error announcements | Local dynamic controls/status | Merge choices and max-image validation | High |
| M08 | Shared tracking/platform/assets | httpdocs/FTOneTreeMerge.html:6-7 | A | Load shared session usage telemetry | WA common transport/cache lifecycle | waPlatform; usageTracking | Family Tree attribution | High |

B-only exclusions: B-only: oldest-tree authority, duplicate decisions, relationship bridge rules, field conflict resolution and picture-selection limits. No editable free-text field, generic sanitizer not required for select/checkbox values. Backend bounded to direct authorization/privacy/external-effect consequences, not comprehensive merge algorithm audit.

## Candidate assessments

### M01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. JS18-20 current-token reader/query context;34 redirects absent token before shared restore;31/33 encoded or numeric constructed Person links, no bearer URLs.

Local responsibility: Merge source/target/bridge context.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie restore/expiry/query tampering and navigation. Deferred modernization: D08/compatible session adoption.

### M02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. JS31/33 parse JSON and throw plain Error(message),34 shows only e.message; status/code/network/cancel lost, including backend responseCode ONE_TREE_REVIEW_INCOMPLETE.

Local responsibility: Already-same-tree/merge response fields.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 local-adapter only. Outstanding verification: 401/403/409/423/503/nonJSON/network/cancel and domain fields. Deferred modernization: D04 gradual envelope migration.

### M03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-API-001, WA-SEC-ADMIN-001. Material conditional SOURCE disclosure: backend2178-2193 copies newerValue from private newerPerson into conflicts;2246-2249 attaches conflicts to older match. With public older candidate/private newer person and nonempty differing protected fact (e.g. BirthPlace), mounted redactor ftPrivacy107/124-130 removes private newerPerson but public candidate/untagged conflicts survive; JS29 renders newerValue. /one-tree/review is outside /persons path-specific423 gate. No capability/key checked on this derived data path. Review7151 and merge7195 authorize source tree; target7152/7196 is resolved by person without explicit target-tree authorization here. Target merge/mutation policy/privileged coverage remains unverified, not automatically declared a bypass.

Local responsibility: Merge decisions and source/target access.

Disposition: CORRECT private-data provenance/redaction; OWNER DECISION material release risk; TEST FIRST exact synthetic fixtures. Stage 6: R16 S6-017/009; R17; R19 capability/authz. Outstanding verification: Public older/private newer conflicting fact with no unlock must not disclose; private older converse, admin dual gates; target-tree read/mutation policy and full CRUD/ownership/integrity; no live exploit asserted. Deferred modernization: None.

### M04 - Conforming — source verified

CS-07/09; WA-FRONT-001. JS3-17 escaping/protocol allowlist;24-30 escapes text/contacts/events/conflict values/image attributes; raw candidate IDs rely numeric server contract. Safe HTML encoding does not prevent authorized-data privacy defect M03.

Local responsibility: Review cards and conflict choices.

Disposition: RETAIN encoding; TEST FIRST. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Hostile values/URLs/IDs and private placeholders. Deferred modernization: Optional shared output helper.

### M05 - Confirmed Nonconformance

CS-03/06/08; WA-SESSION-001, WA-DATA-001. JS33 disables merge before fetch but re-enables only explicit non-ok JSON. Rejected fetch/JSON parse skips reset;34 merely displays error, leaving action permanently disabled even on definite pre-send failure. Decisions remain in DOM; no automatic replay. Backend98-118 commits then runs queued tasks with caught failures;7290-7295 postcommit cleanup safelyDeleteImage812-820 catches errors, so no supported claim cleanup rejects into ordinary500. Cleanup can fail with success and sanitized log; operational recovery remains unverified.

Local responsibility: Merge decision object and navigation.

Disposition: CORRECT failure/pending/uncertain outcome state without blind retry; TEST FIRST. Stage 6: R16 T10/S6-018; R19 repeated action; R20 external recovery. Outstanding verification: Pre-send/network/nonJSON after possible commit, decisions retained/reconcile rather than replay; cleanup compensation and snapshot media recovery. Deferred modernization: Optional common pending-state helper.

### M06 - Unverified

CS-03/09; WA-SESSION-001. JS21 review cache;31/33 apply response/set session tree/navigate without identity fence or storage listener. Completion may belong to earlier account; no actual incident demonstrated.

Local responsibility: Source/target tree and current code.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async UI. Outstanding verification: Account switch/logout while loading/merging, stale decisions and response navigation. Deferred modernization: None.

### M07 - Confirmed Nonconformance

CS-07; WA-FRONT-001. JS29 conflict select and30 match select have no programmatic label;28 picture checkbox label exists. HTML6 status not live/role; validation/error34 updates text without announcement/focus. No broad HTML formatting audit.

Local responsibility: Merge choices and max-image validation.

Disposition: CORRECT accessible choices/errors; TEST FIRST. Stage 6: R17 accessibility; owner scopes stage acceptance impact. Outstanding verification: Keyboard/select names/validation focus/status announcements. Deferred modernization: Optional common field/status helper.

### M08 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. HTML6 page/platform then7 tracker; telemetry shared WA.api, merge business transport local; component hashes unchanged.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Telemetry lifecycle/exact accounting and old-new assets. Deferred modernization: D08/compatible transport and asset policy.

## Evidence reconciliation

Eight original candidates frozen before selected-page register reconciliation; zero additions. Prior component privacy redactor/admin/platform evidence reused after same hashes; new bounded merge producer/consumer trace revealed derived conflict-data leak. Prior FTPerson and Batch4 conclusions retained within their original scope, not silently changed. No completed tests repeated. No username-only current admin defect alleged.

## Common causes and proposed Master Register relevance

M02 RC-HTTP; M03 B05-DERIVED-PRIVATE-DATA (material new provenance/redaction cause, with unverified target authorization subfinding); M05 B05-PENDING-RESET; M07 RC-ACCESS. M06 RC-IDENTITY unverified. One candidate may retain multiple subfindings; no candidate inflation.

## Confirmed gaps and owner attention

Four confirmed candidates: error categories, conditional private derived-data disclosure, stuck pending merge after thrown transport/parse failure, accessibility. Privacy exposure is source-confirmed conditional flow, not observed hosted incident. External cleanup catches failure, unlike Batch4 Contact mail-after-commit; no ordinary500 consequence invented.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
