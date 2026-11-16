# BMoney - shared-function compliance review

Authority: explicit November 16 Batch 3 authorization and four refinements (unchanged shared evidence; distinguish page copies/common causes; observed or unresolved timing; Stage 6 and proposed Master Register mapping). Original remaining-58 assignment sections 5-15 governs. Eleven Batch 3 files only, processed sequentially. No completed examination repeated.

Source: httpdocs/BMoney.html. SHA-256: d57e51fd804316ea7ce495ed97a39471379b48fd0b1b69ff7f7bbb083a631bbe. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:36:41.224434-05:00; saved completion observed 2026-11-16T09:36:41.225260-05:00. Original count 11. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MY01 | token / requireLogin / request origin | 239-267;449-450 | A | Gate and authenticate Money requests | Session/origin responsibilities common | WA.session.restore; WA.api.request | Money/investment endpoints/local8080 compatibility | High |
| MY02 | apiFetch / message/error contract | 256-279;311;344;363;396;432-454 | A | Decode/report HTTP and transport failures | Common status/error compatibility | WA.api.json / WA.ApiError | Money business messages/suffix | High |
| MY03 | Shared text sanitation | 11-12;170;217;332-340;384-392 | C | Clean account names before save | Cross-WA free-text defense | DOMPurify; httpdocs/js/inputSanitizer.js | AccountPocket/Account names, numeric balance validation | High |
| MY04 | Safe data/projection rendering | 295-317;347-369;402-420 | C | Render account/projection data safely | DOM context safety common | Native textContent/value; escapeHtml | Account names, numeric balances and projected month cells | High |
| MY05 | Money/investment CRUD / draft lifecycle | 295-397;415-418 | C | Save/delete/edit and refresh state | No uncertain replay and draft handling common | WA.api.request after compatibility review | Two independent editor IDs, balances, totals and mutation semantics | High |
| MY06 | Account edit keyboard interaction | 176;223;302-304;354-356 | C | Select existing account to edit accessibly | Keyboard record actions common | No shared accessible row helper identified | Non-delete account/balance cells invoke edit | High |
| MY07 | Currency/calendar display helpers | 268-293 | C | Format currency and calendar months | Formatting/date-only behavior reusable | Native Number/Intl/Date; no common equivalent identified | USD two-decimal display/local calendar month contract | High |
| MY08 | Projection range / async refresh pipeline | 398-418;428-444;449-456 | C | Load projected monthly balances | Async state/origin/response integration reusable | /budget/monthly/summary; WA.api for transport only | Current+11/default and12-month extension, shortage flag | High |
| MY09 | Budget navigation | 149;423 | C | Return to Budget page | Generic navigation boundary | Native location | Fixed budget.html destination | High |
| MY10 | Service-worker registration | 446-448 | A | Register shared PWA worker | Shared cache/version lifecycle | httpdocs/sw.js | Root worker scope | High |
| MY11 | Platform / usage tracking | 458-459 | A | Record authenticated page/time usage | Cross-WA lifecycle tracking | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Money page path; business adapter independent | High |

B-only exclusions: B-only: account classifications, totals/projection arithmetic, current+11 range, shortage and investment workflow. Mixed integration/rendering/currency/date boundaries included; no financial recommendation or calculation audit. CSS/formatting excluded.

## Candidate assessments

### MY01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 247-265 current token per call;248/450 presence-only gate.239 development cross-port origin. Caller headers can override Authorization; current callers do not. Shared tracker does not convert Money business requests.

Local responsibility: Money/investment endpoints/local8080 compatibility.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account-switch and origin. Deferred modernization: Staged transport/session/D08 migration.

### MY02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. RC-HTTP-VARIANT:256-267 differs from canonical one-line adapter (no explicit String/suffix strip), but265 passes error object into plain Error, implicitly coercing nested envelope and discarding status/code.271-279/CRUD catches show text only. Same underlying contract failure, separate variant evidence.

Local responsibility: Money business messages/suffix.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018/033. Outstanding verification: Nested/flat/status/non-JSON/204/error categories. Deferred modernization: None.

### MY03 - Conforming — source verified

CS-07/09; WA-FRONT-001. 11-12 dependencies; sanitizer capture click cleans170/217 name inputs before Save332/384. Numeric balances preserved; names trimmed; native inputs have enclosing labels.

Local responsibility: AccountPocket/Account names, numeric balance validation.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Click/Enter/capture/dependency-failure behavior. Deferred modernization: None.

### MY04 - Conforming — source verified

CS-07/09; WA-FRONT-001. 302/354 escape names via419-420; balances numeric-formatted; totals316/368 textContent; monthLabel281-293 normalizes date components before411 HTML. Form fields use value; confirmation strings are text, not HTML. Narrow actual substitutions checked.

Local responsibility: Account names, numeric balances and projected month cells.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Malformed numeric/month types and actual DOM display. Deferred modernization: Optional output/display contract reuse preserving Money schema.

### MY05 - Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. 340/392 mutation once; cancel editors only after success.308/360 delete once after confirmation. Save reset before following reload; if GET fails, catch may show error despite successful committed save and already-cleared editor.309/361 delete resets corresponding editor irrespective of which row was being edited. No automatic replay or demonstrated data-loss incident. Newly inspected budget.js769-850 uses UserID predicates.

Local responsibility: Two independent editor IDs, balances, totals and mutation semantics.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; S6-008/018; R14/S6-009. Outstanding verification: Drafts after failed save vs post-save refresh failure, delete while editing another row, double click/identity. Deferred modernization: None.

### MY06 - Confirmed Nonconformance

CS-07; WA-FRONT-001. RC-KEYBOARD:303/355 edit handlers are click-only td; no focusable edit action or key handler in complete461-line page. Delete buttons304/356 are native; they do not provide keyboard edit selection.

Local responsibility: Non-delete account/balance cells invoke edit.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Accessibility triage; R17 browser coverage. Outstanding verification: Keyboard account/balance editing and focus semantics. Deferred modernization: None.

### MY07 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 268-293 currency uses USD2 decimals; months formed with local calendar components, first-of-month arithmetic. Unlike prior integer/ceil forms, no ceil save conversion here. Preserve Money display/date contract.

Local responsibility: USD two-decimal display/local calendar month contract.

Disposition: RETAIN; TEST FIRST. Stage 6: Deferred standardization; R17 locale/date verification. Outstanding verification: Timezone/month boundary and malformed producer month. Deferred modernization: Optional formatting-only reuse preserving two decimals/local month.

### MY08 - Partially Conforming

CS-01/03/08; WA-PRESERVE-001, WA-SESSION-001, WA-SHARED-001. 398-444 encoded month-range GET;415 sequential money then projection,452 parallel investments. Mutable range can advance before failed request and stale responses unguarded. Backend summary853-887 returns normalized month/numeric projection; arithmetic not audited. No UI bound asserted from source.

Local responsibility: Current+11/default and12-month extension, shortage flag.

Disposition: TEST FIRST. Stage 6: S6-018; R17; R19 resource review only if prioritized. Outstanding verification: Range recovery/stale results/account switch and long-range provider limits without live load. Deferred modernization: None.

### MY09 - Conforming — source verified

CS-01/08; WA-SHARED-001. 423 native button149 assigns fixed budget.html; no untrusted URL.

Local responsibility: Fixed budget.html destination.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: None.

### MY10 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. RC-PWA:446-448 active root registration, unchanged shared worker/no-auth-cache/missing-local-bday evidence reused.

Local responsibility: Root worker scope.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16/S6-024; R20 rollback relevance. Outstanding verification: Hosted assets/install/update/mixed versions. Deferred modernization: None.

### MY11 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 458-459 ordered dependencies; tracker actual WA.api/restore; Money CRUD/projection local adapter. Hashes unchanged.

Local responsibility: Money page path; business adapter independent.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-025; R16/R17; R15 retained. Outstanding verification: Lifecycle/expiry/logout/BFCache and cache versions. Deferred modernization: None.

## Evidence reconciliation

After independent inventory/assessment, limited register reconciliation retained S6-008/018/025 and outstanding browser T09/T10. Newly inspected Money/investment769-850 and summary853-887 producer subsets added to shared evidence cache; other Budget routes not comprehensively audited. Canonical adapter analysis reused conceptually only: this variant is explicitly different. Master mapping proposed, not installed.

## Common causes and proposed Master Register relevance

MY02 is a new implementation variant under the common HTTP error-contract cause (RC-HTTP-VARIANT), not falsely byte-identical canonical code. MY06 is RC-KEYBOARD page occurrence; MY10 references shared RC-PWA. New post-save-refresh/other-row-delete draft scenarios and month-range sequencing map proposed Master evidence to S6-008/018, T10 and R17; resource limits R19 only an unverified review dependency. No existing register changed.

## Confirmed gaps and owner attention

Two confirmed candidate gaps MY02/MY06. Money uses cents/local months, not prior ceiling arithmetic. Refresh/draft/projection/identity concerns unverified. No private financial records or runtime services accessed; server user-scoping source observed, not certified.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch03 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
