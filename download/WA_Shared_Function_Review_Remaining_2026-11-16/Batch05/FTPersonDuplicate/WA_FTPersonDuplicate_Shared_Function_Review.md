# FTPersonDuplicate - shared-function compliance review

Authority: explicit November 16 Batch 5 authorization and five refinements: independent discovery and unchanged evidence reuse; privacy/navigation/auth/account/admin/email workflows; distinguish denied private access from bypass; commit-then-external outcome/no replay; consolidated causes, observed timing and proposed Master Register/R16-R20 mappings. Original remaining-58 assignment governs. Eight Batch 5 files only, processed sequentially. FTPerson and earlier examinations preserved, not repeated.

Source: httpdocs/FTPersonDuplicate.html. SHA-256: 0496dea16d2b1423f300083d84a86ad607afff6d0dce9df43833434e9b7132ec. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T10:32:58.552746-05:00; saved completion observed 2026-11-16T10:32:58.553602-05:00. Original count 7. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D01 | Credentialed startup/context/navigation | httpdocs/FTPersonDuplicate.html:6-7;httpdocs/js/FTPersonDuplicate.js:17-19 | C | Guard duplicate view and derive request context | WA session/context/navigation contract | Local token guard; WA.session loaded later | Duplicate PersonID and close-window action | High |
| D02 | Duplicate-view HTTP/errors | httpdocs/js/FTPersonDuplicate.js:18-19 | C | Load review and present failure | Shared status/error contract | WA.api related, direct fetch | Duplicate view response | High |
| D03 | Privacy/tree/Person access integration | httpdocs/js/FTPersonDuplicate.js:17-19 | C | Authorize protected duplicate-view request | WA tree/privacy/capability/admin boundaries | No FTPrivacy or familyTreeCode supplied | Global duplicate view semantics | High |
| D04 | Safe person/relationships/images output | httpdocs/js/FTPersonDuplicate.js:2-18 | C | Render person facts and standalone image list | WA safe DOM plus nested private redaction | Local escapeHtml/safeImageUrl | Profile/pictures/relationship summaries | High |
| D05 | Account switch/late response lifecycle | httpdocs/js/FTPersonDuplicate.js:17-19 | A | Prevent stale account response display | WA session identity fencing | Shared session related; local async load | Duplicate review display | High |
| D06 | Status/actions accessibility | httpdocs/FTPersonDuplicate.html:6;httpdocs/js/FTPersonDuplicate.js:18-19 | C | Announce protected-load failures and operate close | WA accessible status/keyboard controls | Local status text; browser window.close | Duplicate review status/images | High |
| D07 | Shared tracking/assets | httpdocs/FTPersonDuplicate.html:6-7 | A | Use session telemetry alongside view fetch | WA shared tracking/cache contract | waPlatform; usageTracking | Family Tree attribution | High |

B-only exclusions: B-only: duplicate-person facts and relationship presentation; no form/mutation/upload or external email action. Image exposure assessed only in directly used view path, not full object-store audit.

## Candidate assessments

### D01 - Partially Conforming

CS-03/08; WA-AUTH-001, WA-SESSION-001. JS17/19 local-token guard before restore; only PersonID parsed; static menu/close HTML6 contains no bearer. window.close depends on opened-window context, browser behavior unverified.

Local responsibility: Duplicate PersonID and close-window action.

Disposition: TEST FIRST; MIGRATE LATER. Stage 6: R16 S6-005/008; R17. Outstanding verification: Cookie-only restoration, expiry/direct opening and Close fallback. Deferred modernization: D08/compatible startup/navigation.

### D02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. JS18 throws plain Error(d.message||fallback);19 writes message. HTTP status/code/network/nonJSON/cancel lost; no replay/mutation.

Local responsibility: Duplicate view response.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 S6-008/018/033; T09 page-only adapter. Outstanding verification: 401/403/423/503/nonJSON/network/cancel/flat/nested. Deferred modernization: D04 gradual envelope migration.

### D03 - Confirmed Nonconformance

CS-04/08/09; WA-PRIV-002, WA-API-001, WA-SEC-ADMIN-001. JS18 duplicate-view URL supplies no familyTreeCode. Server184 protection matches /persons/id,111 calls getTree before route;25-43 resolves supplied code/user and throws403 on blank/unresolvable code (including admin fallback needing code). Thus normal page request cannot reach otherwise public-person view on a normal nonblank tree. No FTPrivacy/key path either. Backend7095-7131 itself globally resolves person; outer gate is crucial. Preserve denial, define intended global duplicate authority rather than bypass gate.

Local responsibility: Global duplicate view semantics.

Disposition: CORRECT explicit context/access contract; OWNER DECISION global duplicate policy; TEST FIRST. Stage 6: R16 S6-017/009; R17. Outstanding verification: Valid tree/context, private authorized/wrong-user/token, cross-tree duplicate policy, admin positive/negative gates. Deferred modernization: None.

### D04 - Partially Conforming

CS-07/09; WA-FRONT-001, WA-PRIV-002. JS2-16 escapes and protocol-checks;18 escapes facts/captions/URLs and uses textContent for relationships. Backend7122-7130 puts images beside person, so generic person-node redaction alone would not redact sibling media if gate relaxed. Current page is blocked by missing-code gate; no active image leak asserted. Treat media authorization as required test before context correction.

Local responsibility: Profile/pictures/relationship summaries.

Disposition: RETAIN encoding; TEST FIRST full private media contract. Stage 6: R16 S6-017/030; R17. Outstanding verification: Private focal/relative images and signed URL lifetime, hostile DOM values; no object-store probe. Deferred modernization: Optional shared escaping/URL helper.

### D05 - Unverified

CS-03/09; WA-SESSION-001. JS18 applies response without identity fence/storage listener/cancellation; current-token before send does not protect after switch. Runtime exposure not demonstrated.

Local responsibility: Duplicate review display.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16 S6-007/027; R19. Outstanding verification: Switch/logout while pending, window opener identity/BFCache cleanup. Deferred modernization: None.

### D06 - Confirmed Nonconformance

CS-07; WA-FRONT-001. HTML6 status no live/role; JS19 failure writes text without announcement/focus. Buttons have visible names; image description/Close behavior require browser review, not extra defect counts.

Local responsibility: Duplicate review status/images.

Disposition: CORRECT status accessibility; TEST FIRST. Stage 6: R17 accessibility. Outstanding verification: Screen-reader protected-load errors, keyboard/Close, image context. Deferred modernization: Optional common status helper.

### D07 - Partially Conforming

CS-03/08/10; WA-SHARED-001, WA-CACHE-001. HTML6 page/platform then7 tracker; shared telemetry used, business GET direct; module hashes match prior bounded evidence.

Local responsibility: Family Tree attribution.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 S6-025; R17; R20 S6-024. Outstanding verification: Expiry/logout/BFCache/exact tracking and asset versions. Deferred modernization: D08/compatible adoption/assets.

## Evidence reconciliation

Seven independent candidates frozen before register reconciliation; no additions. Unchanged shared properties reused; direct backend duplicate-view context and mounted protection traced narrowly. Fail-closed blank-tree denial is demonstrated from source; actual bypass not asserted. Prior FTPerson/Batch4 and Stage6 evidence preserved. An initial dependency read landed on unrelated person-create lines3845-3974 before locating7095; no conclusions from that accidental extra fragment required here, no changes/tests.

## Common causes and proposed Master Register relevance

D02 RC-HTTP; D03 B05-MISSING-TREE-CONTEXT with private-access subfinding; D06 RC-ACCESS-STATUS. D04 sibling-media risk unverified under current outer gate, separate from M03 derived-data exposure. D05 RC-IDENTITY unverified. Proposed only.

## Confirmed gaps and owner attention

Three confirmed candidate occurrences: failure categories, omitted required tree context causing fail-closed duplicate-view denial, and error announcement. No mutation/external action on page; do not claim commit outcome issue.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree privacy, page capabilities and full centrally verified administrator authority apply where mapped; no blanket exemption. Administrator account transfer and TNNA are outside these page contracts. Full styling/formatting, relationship algorithms, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch05 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
