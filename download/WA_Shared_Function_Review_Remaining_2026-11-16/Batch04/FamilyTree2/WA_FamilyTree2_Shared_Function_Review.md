# FamilyTree2 - shared-function compliance review

Authority: explicit November 16 Batch 4 authorization and five refinements: unchanged source-verified component reuse; distinct page occurrences/common causes; Family Tree auth, authority, privacy, navigation and account switching; observed or unresolved timing; proposed Master Register and Stage 6 mappings. Original remaining-58 assignment governs. Seven Batch 4 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FamilyTree2.html. SHA-256: 93908b6e21c607f8c6fb933aa64f9fbc13868190ca4edcf4df180d15b5f540d6. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:08:36.637476-05:00; saved completion observed 2026-11-16T10:08:36.638361-05:00. Original count 9. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FM01 | Credentialed startup/current-tree restoration | 241-244 | C | Guard startup and obtain authoritative current tree | WA auth restoration contract | FamilyTreePage.js:18-43,53-56; WA.session loaded | Tree membership and menu readiness | High |
| FM02 | HTTP/error adapters | 242-243 | C | Read/current tree and mutation/search transport | Shared status/error/no replay contract | FamilyTreePage.js:30-38,49-52; WA.api related | Domain messages and tree association | High |
| FM03 | Identity-scoped context and late responses | 129-130;242 | C | Keep sessionStorage/currentCode aligned with current identity | Account-switch isolation and stale response protection | FamilyTreePage.js:20-33,40-55 | Current tree code and search rows | High |
| FM04 | Safe text/HTML and URL encoding | 217-239;242 | C | Render info/status and server search rows | Shared safe DOM/URL rules | FTInstructions; FamilyTreePage.js:3-17,26,44-52 | Person columns and menu labels | High |
| FM05 | Free-text sanitizer integration | 10-11;175-195;242 | C | Sanitize code/search input before handlers | Mandatory reusable text defense | DOMPurify; inputSanitizer; FamilyTreePage.js:46-52 | Family code/query syntax | High |
| FM06 | Modal/field/error accessibility | 170-213;217-239;242 | C | Open code/search/information overlays and announce state | WA dialog focus/input label/error behavior | Local modal handlers FamilyTreePage.js:45-47,51-52 | Modal copy and result table | High |
| FM07 | Association mutation/uncertain-delivery lifecycle | 151-167;180;242 | C | Submit enter/change-tree once per explicit action | No automatic unsafe replay and draft preservation | FamilyTreePage.js:35-38,49,51-52 | Association/confirmation semantics | High |
| FM08 | Navigation/context handoffs | 121-123;141-167;242 | C | Link instructions/home/person list/undo/new person | Shared safe navigation/session context | FamilyTreePage.js:44,48,50 | Family Tree destinations/code | High |
| FM09 | Shared usage/platform/PWA integration | 8-11;241-244 | A | Load shared tracking and versioned dependencies | WA session/telemetry/cache compatibility | waPlatform; usageTracking | Page attribution | High |

B-only exclusions: B-only: biological relationship notice, person-name layout, tree association business rules and search columns. Backend inspection limited to directly used current-tree/enter-code/change-tree/tree-search routes as needed; no destination-page audits.

## Candidate assessments

### FM01 - Partially Conforming

CS-03/08; WA-AUTH-001, WA-SESSION-001. FamilyTreePage18-43 checks current local token before awaits; absent redirects login. Removes old session tree43 and obtains server current-tree30-33. It never calls WA.session before guard; tracker restore is independent. Backend1723-1752 binds current-tree to user/active tree.

Local responsibility: Tree membership and menu readiness.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only restore, expired bearer and actual load ordering. Deferred modernization: D08/compatible shared startup migration.

### FM02 - Confirmed Nonconformance

CS-03/05/08; WA-SESSION-001, WA-API-002. Companion31-38,49-52 parses JSON, throws Error(d.message||fallback) without status/code/cause; catches present e.message. Credential401, permission403 and server/outage categories are not retained. No auto replay. Shared WA.api loaded243 but not used for these calls.

Local responsibility: Domain messages and tree association.

Disposition: CORRECT failure categories; TEST FIRST; preserve domain fields. Stage 6: R16 T09 page-adapter only; T10; S6-008/018/033. Outstanding verification: 401/403/423/409/503/network/nonJSON/cancel matrix; shared T09 requires actual WA.api consumer. Deferred modernization: D04 envelope migration separate.

### FM03 - Partially Conforming

CS-03/09; WA-SESSION-001, WA-PRIV-002. Companion42-43 clears stale tree on startup; per-call ah reads current bearer. But currentCode/sessionStorage/search results updates have no identity fence or storage logout listener. Mixed completion after account switch not executed.

Local responsibility: Current tree code and search rows.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async interleaving. Outstanding verification: Delayed load/enter/search response after account switch; cached UI and membership recomputation. Deferred modernization: None.

### FM04 - Conforming — source verified

CS-04/07/09; WA-FRONT-001, WA-PRIV-002, WA-SEC-ADMIN-001. HTML229-230 textContent; companion52 escapeHtml applied to every result field/data-code, q/code URI-encoded. Backend tree-search3481-3518 does return PersonID records; server184 installs ftPrivacy.protection before routes, which107,121-131 redacts nested private records except approved name/code fields and centrally verified admin. Therefore no source-confirmed private birth-data bypass alleged. Admin service16-21 requires current DB flag AND configured normalized name.

Local responsibility: Person columns and menu labels.

Disposition: RETAIN; TEST FIRST actual redaction/admin authority. Stage 6: R16 S6-009/017/030; R17. Outstanding verification: Synthetic private/public search results and flag0/former-name denials; broader admin CRUD/transfer not certified. Deferred modernization: Optional common escaping helper.

### FM05 - Partially Conforming

CS-07/08; WA-FRONT-001, WA-SHARED-001. HTML10-11 sanitizer before modules; generic capture handlers cover text code/search178,190 and submit clicks. Companion trims code/query. Prior same-hash sanitizer evidence reused; no editable password/privacy key here.

Local responsibility: Family code/query syntax.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 input/asset availability. Outstanding verification: Dynamic search buttons, CDNavailability, field semantics and nonASCII code/query regression. Deferred modernization: Optional shared field adapters.

### FM06 - Confirmed Nonconformance

CS-07; WA-FRONT-001. 175-203 code/search overlays omit dialog semantics, associated input labels, error live announcements. 205 info role exists but 224-237 show/close lacks focus transfer/trap/return; companion45-47 code/search similarly no focus management. Distinct subfindings retained under one candidate.

Local responsibility: Modal copy and result table.

Disposition: CORRECT bounded labels/dialog/focus/errors; TEST FIRST. Stage 6: R17; owner risk disposition before widening Stage6. Outstanding verification: Keyboard, Escape/cancel, focus return and screen reader errors. Deferred modernization: Optional shared dialog service.

### FM07 - Partially Conforming

CS-03/06/08; WA-SESSION-001, WA-DATA-001. Companion35-38,49,51-52 one POST per explicit click, no retry; input clears on opening not catch. No in-flight guard against repeated clicks. Server change-tree1755-1798 transaction deactivates only current user; enter-code1800-1855 adopts tree in transaction. Integrity not fully audited.

Local responsibility: Association/confirmation semantics.

Disposition: RETAIN no replay; TEST FIRST uncertain delivery/repeated click. Stage 6: R16 T10 page-only; R19 UI concurrency distinct from refresh replay. Outstanding verification: Uncertain enter/change completion, draft retention, double action and resulting membership; no DB tests run. Deferred modernization: Optional pending-operation helper.

### FM08 - Conforming — source verified

CS-01/03/08/09; WA-SESSION-001, WA-SHARED-001. Fixed relative links122-123; declared data-page141 and companion44; person-list requires currentCode48; undo50 encodes tree code. No bearer/page capability placed in URLs. Handoff destinations not audited.

Local responsibility: Family Tree destinations/code.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-005/007/017; R17. Outstanding verification: Real remembered session/navigation and stale tree after switch; no FTPerson reexamination. Deferred modernization: Optional navigation helper.

### FM09 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. 241 instructions,242 page script,243 platform,244 tracker; shared telemetry uses WA.api, business calls remain local. Exact unchanged module evidence reused. Manifest8; no new service-worker behavior claimed.

Local responsibility: Page attribution.

Disposition: RETAIN; TEST FIRST lifecycle/version matrix. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Tracking expiry/logout/BFCache/duplication; mixed assets and rollback. Deferred modernization: D08 shared adoption/asset version policy.

## Evidence reconciliation

Nine original candidates frozen before limited register/prior-evidence reconciliation; zero additions. Existing FTPerson component evidence on header scope/handoff does not apply to this menu because it does not import FTPrivacy. Narrow current server inspection confirms privacy response redaction actually mounts before tree-search and central two-gate recognition; older documentation username-only assertion is stale. Admin full CRUD/record transfer remains outside this bounded positive source observation. Prior tests preserved, not rerun.

## Common causes and proposed Master Register relevance

FM02 is a separate page-adapter occurrence of RC-HTTP, same invariant as Budget/FTPerson; no extra candidate per status. FM06 has label/dialog/focus/announcement subfindings under B04-DIALOG. FM03 B04-IDENTITY remains unverified. RC-SAN/RC-TRACK/RC-CACHE bounded reuse. Proposed labels only; existing authoritative issues remain unchanged.

## Confirmed gaps and owner attention

Two confirmed candidates: FM02 lost failure categories and FM06 accessibility. Current source does not justify a private-search-data leak claim because server response redaction is installed; runtime redaction remains unverified.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch04 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
