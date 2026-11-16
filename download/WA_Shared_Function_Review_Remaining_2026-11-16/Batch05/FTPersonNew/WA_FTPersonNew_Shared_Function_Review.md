# FTPersonNew - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTPersonNew.html. SHA-256: e73ca8906c5cbd181b6be16a85e064a8272f9494e81f49d8ff2a750e4b2b38e6. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:36:01.686513-05:00; saved completion observed 2026-11-16T10:36:01.687498-05:00. Original count 11. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | Current token/tree startup and navigation | httpdocs/FTPersonNew.html:46-47,119-121;httpdocs/js/FTPersonNew.js:18-24,36,46 | C | Guard creation and derive tree/return context | WA session restoration/current account | WA.session related; sessionStorage code | New person allocation/source tree | High |
| P02 | HTTP/error/domain409 adapters | httpdocs/js/FTPersonNew.js:26-28,31-37,39,45 | C | Submit/read multiple actions preserving duplicate review | WA status/error/response semantics | WA.api related; direct fetch/JSON | DUPLICATE_REVIEW_REQUIRED/ONE_TREE_REVIEW_REQUIRED | High |
| P03 | Privacy/authorization and duplicate handoffs | httpdocs/js/FTPersonNew.js:24-28,33,35,39,46 | C | Access global duplicates and related/private records | WA tree/Person/capability/admin contract | No FTPrivacy import; direct Duplicate/Person navigation | New public person vs selected existing private person | High |
| P04 | Safe DOM/URL/image output | httpdocs/js/FTPersonNew.js:3-17,20,24-28,32,34,39 | C | Render duplicates/contacts/events/images safely | WA output and URL boundary | Local escaping/safeImageUrl/URLSearchParams | Duplicate cards/profile preview | High |
| P05 | Shared text sanitation/normalization | httpdocs/FTPersonNew.html:8-9,53-68,99-116;httpdocs/js/FTPersonNew.js:20-23,29-30,33,45 | C | Sanitize static/modal free text preserving typed fields | WA common input defense | DOMPurify/inputSanitizer; local nv | Person/contact/event field semantics | High |
| P06 | Mutation/draft/pending and partial follow-up outcomes | httpdocs/js/FTPersonNew.js:27,31,33,35-39,45 | C | Save once, preserve unsaved fields and reconcile follow-ups | WA uncertain mutation/no replay/external outcomes | Local saved/disable flags and catches | Part1/Part2 independent actions | High |
| P07 | Contact email commit-then-delivery outcome | httpdocs/FTPersonNew.html:90,109-112;httpdocs/js/FTPersonNew.js:32-33,40-42 | C | Save contact and request verification delivery | WA DB/external action outcome contract | Existing server contact create/verification service | Contact modal and readback | High |
| P08 | Multipart profile upload/media lifecycle | httpdocs/FTPersonNew.html:89;httpdocs/js/FTPersonNew.js:39 | C | Upload multipart and handle explicit replace conflict | WA specialized multipart/side-effect/privacy contract | FormData/raw fetch; object URL preview | Profile field/409 replacement decision | High |
| P09 | Identity/late-response/draft isolation | httpdocs/js/FTPersonNew.js:18-19,25-28,33-39,45-46 | C | Prevent stale account/results mutating current draft | WA session/cross-tab async identity | Shared session related; local saved/cache state | New PersonID/tree/relative choices | High |
| P10 | Labels/dialog/error accessibility | httpdocs/FTPersonNew.html:53-75,99-116;httpdocs/js/FTPersonNew.js:25-29,36-45 | C | Operate forms/modals and announce failures | WA programmatic labels/focus/announcements | Local modal controls/status | Person/relative/contact/event workflows | High |
| P11 | Shared tracking/platform/assets | httpdocs/FTPersonNew.html:8-9,119-121 | A | Use shared session telemetry beside creation code | WA tracking/cache/auth composition | waPlatform; usageTracking; sanitizer | Family Tree attribution | High |

B-only exclusions: B-only: biological relationship rules/partner-parent question, duplicate-scoring decisions, Part1/Part2 business allocation and field content. No full relationship/merge/schema audit; inspect directly used server auth/transaction/external effects only.

## Candidate assessments

### P01 - Partially Conforming

CS-03/08; WA-SESSION-001, WA-AUTH-001. JS18-19 current bearer reader but tree from unscoped sessionStorage;36 guard before restore, no authoritative current-tree refresh.24/46 uses URLSearchParams/encoding to fixed destinations. New-person no-tree creation is legitimate, not an authorization bypass by itself.

Local responsibility: New person allocation/source tree.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/007/008; R17. Outstanding verification: Cookie restore/expiry/stale code/account and new-tree vs existing-tree flow. Deferred modernization: D08/compatible startup/navigation.

### P02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. JS26-35/37/39/45 business fetch direct, JSON and plain message errors; explicit409 duplicate/OneTree branches27/35/37 preserve two codes, but ordinary failure status/category dropped. Some async event handlers37/45 have no catch.

Local responsibility: DUPLICATE_REVIEW_REQUIRED/ONE_TREE_REVIEW_REQUIRED.

Disposition: CORRECT failure categories; preserve domain409; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 page-adapter only. Outstanding verification: 401/403/423/409/503/nonJSON/network/cancel/domain shapes. Deferred modernization: D04 gradual envelope migration.

### P03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-API-001, WA-SEC-ADMIN-001. Actual navigation JS25 opens FTPersonDuplicate with PersonID only; that page JS18 sends no tree context and mounted privacy111/getTree25-43 denies it. New caller uses known defective duplicate-view contract: confirmed incomplete workflow, not bypass. New person is initially public, so absence FTPrivacy alone is not a defect. For selected existing private relatives/useExisting27, global duplicate/private mutation authority and target-tree consent remain unverified; preserve server gates/redaction.

Local responsibility: New public person vs selected existing private person.

Disposition: CORRECT duplicate-view handoff/context contract; TEST FIRST private existing-record boundary. Stage 6: R16 S6-017/009; R17; R19. Outstanding verification: Global duplicates redacted, private existing Person choice/related mutation, admin flag/name/actions/integrity; no full merge audit. Deferred modernization: None.

### P04 - Conforming — source verified

CS-07/09; WA-FRONT-001. JS3-17 escapes text/attributes and allowlists image schemes;25 duplicate cells escaped;28 textContent relatives;32/34 escaped contact/event summaries;39 preview object URL derives selected local File. No raw server error HTML.

Local responsibility: Duplicate cards/profile preview.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-030; R17 DOM. Outstanding verification: Hostile names/IDs/URLs, preview memory lifecycle; duplicate personal-data query logging/referrer scope unverified. Deferred modernization: Optional shared output/URL helper.

### P05 - Partially Conforming

CS-07/08; WA-FRONT-001, WA-SHARED-001. HTML8-9 shared sanitizer before page; static/modals text fields capture-click/submit covered by unchanged module. Typed date/file/checkbox exclusions retained; nv20 and pData21 trim/null normalization after capture. No password/secret-code field.

Local responsibility: Person/contact/event field semantics.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 input/asset matrix. Outstanding verification: Dynamic choice/modal/form submission/IME/CDN failure and exact data semantics. Deferred modernization: Optional common field adapters.

### P06 - Confirmed Nonconformance

CS-03/06/08; WA-SESSION-001, WA-DATA-001. JS37 disables save then awaits fetch/json without catch/finally; rejection leaves disabled and no user-visible error; success saved=true before three follow-up GETs, whose failure is unhandled despite committed Person. JS45 Event save similarly uncaught fetch/parse/follow-up rejection. No auto replay; upload39 explicit409 replace is user-confirmed new operation, not blind transport replay. Relatives27/35 may save then fail secondary association/read; outcome reconciliation unverified.

Local responsibility: Part1/Part2 independent actions.

Disposition: CORRECT pending/error/committed-followup states; retain no replay; TEST FIRST. Stage 6: R16 T10/S6-018; R19 UI sequencing. Outstanding verification: Network/nonJSON before/after commit; preserve main/modal drafts; committed record vs later read/partner-parent failure; repeated actions. Deferred modernization: Optional common pending-state helper.

### P07 - Confirmed Nonconformance

CS-03/06/09; WA-DATA-001, WA-SESSION-001. JS33 posts same contact-create route as prior CT06. Unchanged server5356-5374 commits contact/verification then5372 awaits external email and5374 returns ordinary error on failure; JS33 treats as failed contact save. withTx98-118 queued general notifications catch failures, but explicit verification send is outside that catch. Separate delivery types must not be conflated.

Local responsibility: Contact modal and readback.

Disposition: CORRECT shared committed-vs-email-failure reporting once; TEST FIRST. Stage 6: R16 T10/S6-018/030; R19 recovery. Outstanding verification: Synthetic verification mail failure after commit, no duplicate/replayed save; clear partial success/readback. Deferred modernization: None.

### P08 - Confirmed Nonconformance

CS-03/06/08/09; WA-PRIV-002, WA-DATA-001, WA-SHARED-001. JS39 multipart URL has no familyTreeCode query; code is FormData body only. Server59-65 skips multipart parsing;184 ftPrivacy.protection runs before route upload.single5643-5645. Protection111 needs query/body tree code before parser: blank getTree25-43 fails closed, blocking this normal upload. No privacy bypass. If context fixed, upload body boundary is correct (no JSON Content-Type);5699-5705 explicit replacement;5711 writes object before SQL/commit, so orphan/replace rollback compensation requires separate verification.

Local responsibility: Profile field/409 replacement decision.

Disposition: CORRECT parser/context integration without weakening privacy; TEST FIRST multipart/recovery. Stage 6: R16 S6-017; R17; R19 data/external compensation; R20 recovery. Outstanding verification: Normal public/private upload, valid/invalid token/context, explicit409 replacement, object-store/SQL failure cleanup; do not repeat earlier bounded upload tests without affected-scenario basis. Deferred modernization: Optional scoped multipart adapter.

### P09 - Unverified

CS-03/09; WA-SESSION-001. JS19 cached PersonID/tree/saved/choices; async27/33/35/37/39/45 applies updates after awaits without identity fence/storage logout or draft generation. Actual cross-account event not demonstrated.

Local responsibility: New PersonID/tree/relative choices.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19 async UI. Outstanding verification: Switch/logout/new draft while operation pending, old completion vs current fields/navigation. Deferred modernization: None.

### P10 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML55-65/100-115 visible labels lack for/wrapped association (checkbox labels are wrapped correctly);99/109/114 modals no dialog semantics; JS38/40-44 show/close no focus trap/return/Escape. Statuses71/107/112/116 no live roles. One original candidate retains labels/dialog/focus/error subfindings.

Local responsibility: Person/relative/contact/event workflows.

Disposition: CORRECT accessible fields/dialogs/errors; TEST FIRST. Stage 6: R17; owner scoped acceptance impact. Outstanding verification: Programmatic field names, keyboard modal entry/containment/return, error announcements. Deferred modernization: Optional common form/dialog service.

### P11 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. HTML119 page120 platform121 tracker; actual telemetry shared, all business operations local. Same hashes reused; loading platform does not wrap business fetch with restoration.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Tracking lifecycle/exact counts/old-new assets. Deferred modernization: D08/explicit compatible transport/assets.

## Evidence reconciliation

Eleven independently frozen candidates; zero additions after reconciliation. Earlier Contact commit/email and shared redactor/admin/platform evidence reused only at same hashes; new multipart parser-order trace specific to this integration. Source private-conflict finding M03 separate, not copied to every duplicate page. Earlier R15 upload bounded passes retained; source ordering concern is not a fabricated retest failure or proof of hosted regression. Initial person-create fragment was encountered while tracing Duplicate dependency, then reused rather than reread; current New HTML/JS discovery independently completed before register consultation.

## Common causes and proposed Master Register relevance

P02 RC-HTTP; P03 B05-MISSING-TREE-CONTEXT caller occurrence; P06 B05-PENDING-RESET/committed-followup subfindings; P07 RC-CONTACT-DELIVERY same Batch4 shared producer; P08 B05-MULTIPART-CONTEXT; P10 RC-ACCESS. P09 RC-IDENTITY unverified. No post-reconciliation candidate additions.

## Confirmed gaps and owner attention

Six confirmed candidates. Material owner attention: private authorization boundaries remain unverified; missing context fails closed, multipart normal path blocked, postcommit email error and unhandled mutation completions can mislead or strand users. No automatic mutation replay present; preserve that requirement.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
