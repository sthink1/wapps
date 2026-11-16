# FTUndoOneTreeMerge - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTUndoOneTreeMerge.html. SHA-256: 87da01982de94c5698584c2d0055b6fedfb46d6ef6f560658a1d002fed47d533. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:37:56.941414-05:00; saved completion observed 2026-11-16T10:37:56.942345-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U01 | Credentialed current-tree/query navigation | httpdocs/FTUndoOneTreeMerge.html:33,50-52;httpdocs/js/FTUndoOneTreeMerge.js:6-10,24-39,138-146 | C | Guard page and obtain current tree | WA restoration/context/navigation | WA.session related; current-tree GET fallback | Undo-selected tree | High |
| U02 | GET/review/undo HTTP and error handling | httpdocs/js/FTUndoOneTreeMerge.js:24-47,67-78,105,118-145 | C | Load history/review and submit undo outcome | WA error/status/category contract | WA.api related, raw fetch | Merge history/undo fields | High |
| U03 | Undo authorization/admin/privacy boundaries | httpdocs/js/FTUndoOneTreeMerge.js:42-47,72-106,118-128 | C | Read and reverse permitted merge snapshots | WA tree/owner/admin/action-capability contract | Server central admin and tree guards related | MergeID/dependency/creator permissions | High |
| U04 | Safe DOM and timestamp rendering | httpdocs/js/FTUndoOneTreeMerge.js:12-22,54-65,80-103 | C | Escape merge names/codes/pair summaries/time | WA safe output/date presentation | Local escapeHtml/formatDate | Undo timeline and names | High |
| U05 | Mutation pending/uncertainty/external follow-up | httpdocs/js/FTUndoOneTreeMerge.js:108-135 | C | Confirm undo, disable controls and report outcome | WA no replay/draft/external action safety | Local try/catch; no retry | Undo transaction and object cleanup | High |
| U06 | Account switch/delayed navigation state | httpdocs/js/FTUndoOneTreeMerge.js:24-47,72-106,118-131 | C | Bind delayed undo/history responses to current user | WA session identity fencing | Shared session related; local callbacks | Tree history/context and timed redirect | High |
| U07 | Dynamic action/status accessibility | httpdocs/FTUndoOneTreeMerge.html:44-45;httpdocs/js/FTUndoOneTreeMerge.js:54-68,89-105,115-145 | C | Expose review/undo actions and announce outcomes | WA focus/error/status behavior | Local inserted controls/status | Undo confirmation and status | High |
| U08 | Shared tracking/platform/assets | httpdocs/FTUndoOneTreeMerge.html:50-52 | A | Load shared telemetry beside undo client | WA common tracker/cache/session contract | waPlatform; usageTracking | Family Tree attribution | High |

B-only exclusions: B-only: snapshot restore algorithms, merge dependency graph and biological rollback transformations. No free-text field/upload or email issuance. Server review bounded to auth, private response scope and commit/external-action consequences.

## Candidate assessments

### U01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. JS138-142 local-token guard before shared restore.24-32 uses query code or authoritative current-tree GET, not unscoped stored code; fixed menu/encoded GET.

Local responsibility: Undo-selected tree.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only/expired token/query code/account navigation. Deferred modernization: D08/compatible session adoption.

### U02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. JS31/47/78/125 plain Error(message);143/132 catches text only, discards status/code/category. Review click68 calls async reviewMerge without catch;105 undo has internal catch, review does not. Known failure can become unhandled rejection with no user message.

Local responsibility: Merge history/undo fields.

Disposition: CORRECT category/catch contract; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 page-adapter only. Outstanding verification: 401/403/409/503/nonJSON/network/cancel; review failure display. Deferred modernization: D04 gradual envelope migration.

### U03 - Conforming — source verified

CS-04/06/09; WA-API-001, WA-SEC-ADMIN-001, WA-PRIV-002. Backend undo-options7323/7345-7350 uses tree access and current central admin or source creator/merger; review7392-7397 creator/merger/admin gate; summary7402-7418 contains IDs/names/counts, not full snapshot/private contact/event facts. Mutation7433-7447 locks record and calls helper2799-2806 creator/merger/central admin plus dependency/state guards2809-2833. Central dual gate same source. This establishes named static gates only, not full admin/data restoration acceptance.

Local responsibility: MergeID/dependency/creator permissions.

Disposition: RETAIN gates/integrity; TEST FIRST. Stage 6: R16 S6-009/017; R19 transaction authorization. Outstanding verification: Former-name/flag0/other-user denial, valid admin/creator/merger, dependency403/409, private-summary policy and full restore integrity. Deferred modernization: None.

### U04 - Conforming — source verified

CS-07/09; WA-FRONT-001. JS12-22 timestamp parse/fallback then escaped58;54-65/80-103 all server codes/IDs/names/counts escaped, no raw HTML errors. Fixed confirmations text.

Local responsibility: Undo timeline and names.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-030; R17 DOM/timezone. Outstanding verification: Hostile values, locale/invalid instant display and DOM. Deferred modernization: Optional common output/instant formatter.

### U05 - Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. JS108-135 explicit confirmation, all buttons disabled then catch restores; no automatic retry; success timed menu return. Backend7432-7448 commits once;7450-7462 postcommit object-reference check/deletion caught, safelyDelete812-820 catches too. Cleanup cannot ordinarily turn committed undo into500 on inspected chain; residual cleanup recovery unverified.

Local responsibility: Undo transaction and object cleanup.

Disposition: RETAIN no replay/commit outcome; TEST FIRST uncertainty/recovery. Stage 6: R16 T10/S6-018; R19 controlled concurrency; R20 recovery. Outstanding verification: Lost response after commit, repeated explicit confirmation, cleanup backlog/object consistency and reversal integrity. Deferred modernization: Optional pending/outcome helper.

### U06 - Unverified

CS-03/09; WA-SESSION-001. History/review and127-131 session-code/timed navigation lacks identity fence/storage logout listener. Token current at send does not fence old completion.

Local responsibility: Tree history/context and timed redirect.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async UI. Outstanding verification: Switch/logout during GET/undo or before900ms redirect; BFCache. Deferred modernization: None.

### U07 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML45 status no live/role; JS115/128/133/145 changes text without announcement. Inserted review89-103 not focused/announced; explicit window.confirm native but does not fix asynchronous status. Buttons have visible text.

Local responsibility: Undo confirmation and status.

Disposition: CORRECT accessible status/review focus; TEST FIRST. Stage 6: R17 accessibility. Outstanding verification: Screen-reader review/status/uncaught-review path and keyboard focus after rerender. Deferred modernization: Optional common status/focus helper.

### U08 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. HTML50 page51 platform52 tracker; actual shared telemetry but business operations direct; unchanged bounded module evidence reused.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Lifecycle exact counts/logout/expiry/BFCache/mixed assets. Deferred modernization: D08/compatible transport/assets.

## Evidence reconciliation

Eight original candidates frozen before register reconciliation; zero additions. Current helper/route authorization and postcommit cleanup fragments examined only as needed; not comprehensive snapshot algorithm audit. Existing platform/admin/protection hashes reused; full FTPerson, Batch1-4 and completed Stage6 evidence preserved. Current central admin passes bounded source dual gate; broader privileges/integrity tests remain open.

## Common causes and proposed Master Register relevance

U02 RC-HTTP with uncaught review rejection subfinding; U07 RC-ACCESS-STATUS. U05 commit/cleanup is bounded positive distinction from Contact mail ordinary failure, no invented defect count. U06 RC-IDENTITY unverified.

## Confirmed gaps and owner attention

Two confirmed candidate occurrences: failure/error handling and accessibility. Undo creator/merger/admin source checks present. No automatic replay or source-confirmed private-data bypass asserted.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
