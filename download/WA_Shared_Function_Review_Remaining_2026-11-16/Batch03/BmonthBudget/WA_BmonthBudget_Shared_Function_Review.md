# BmonthBudget - shared-function compliance review

Authority: explicit November 16 Batch 3 authorization and four refinements (unchanged shared evidence; distinguish page copies/common causes; observed or unresolved timing; Stage 6 and proposed Master Register mapping). Original remaining-58 assignment sections 5-15 governs. Eleven Batch 3 files only, processed sequentially. No completed examination repeated.

Source: httpdocs/BmonthBudget.html. SHA-256: 8617407aa687bf17647ef8219e2f4ff8e7e2e2405564eb97f5e8c7bb86d3bc42. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:39:08.928866-05:00; saved completion observed 2026-11-16T09:39:08.929849-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MB01 | Credential gate / request origin | 409-434;541-544 | A | Authenticate summary requests | Cross-WA session/origin responsibility | WA.session.restore; WA.api.request | Monthly summary endpoint/local8080 behavior | High |
| MB02 | apiFetch / error feedback | 427-442;452-460;519-522 | A | Decode/report request failures | Common status/envelope interoperability | WA.api.json / WA.ApiError | Budget messages/suffix | High |
| MB03 | Calendar range / monetary formatting | 462-493;525-539 | C | Validate/format month range and numbers | Date-only/display/input boundaries reusable | Native Date/Intl/Number | Current+11 and12-month range steps; integer totals vs cents current balance | High |
| MB04 | Summary rendering and producer types | 494-518 | C | Render monthly values safely | Context-safe output common | Native textContent and numeric formatters | MonthLabel/year attribute, deficit/shortage classes and Budget columns | High |
| MB05 | Month detail / Budget navigation and keyboard access | 351;392;505-513;525 | C | Open detail report or Budget | Safe URL and accessible navigation common | Native links/location; no shared helper equivalent identified | Encoded year/month query and fixed Budget destination | High |
| MB06 | Async load/feedback lifecycle | 482-523;526-544 | C | Refresh summary for chosen range | Request ordering/state handling common | WA.api transport; native controls/messages | Summary loading/empty/error state and range preservation | High |
| MB07 | Worker registration | 444-450 | A | Register shared PWA worker | Cross-WA cache/version boundary | httpdocs/sw.js | Root worker integration | High |
| MB08 | Platform/tracker integration | 547-548 | A | Record session-aware usage | Cross-WA usage lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | MonthlyBudget path; business adapter independent | High |

B-only exclusions: B-only: budget totals/deficit/shortage and range business presentation. No writes or reusable free-text input; generic sanitizer unnecessary for month controls. Financial calculations and broad CSS/formatting excluded.

## Candidate assessments

### MB01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 414/428 token current per call;418/542 presence-only gate.409-412 localhost routing retained; summary497 uses local adapter, tracker separate.

Local responsibility: Monthly summary endpoint/local8080 behavior.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account switch/dev origin. Deferred modernization: Staged transport/session/D08 migration.

### MB02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. RC-HTTP-VARIANT:427-442 expanded equivalent failure algorithm, not asserted byte-identical canonical block.438-439 String-coerces nested error and throws plain Error without status/code;519-522 show message only. Reuse common-cause analysis, independently traced actual GET497.

Local responsibility: Budget messages/suffix.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Nested/flat/status/non-JSON/type browser contract. Deferred modernization: None.

### MB03 - Conforming — source verified

CS-01/07/08; WA-PRESERVE-001, WA-FRONT-001, WA-SHARED-001. 462-475 local first-of-month arithmetic;486-493 require both months/from<=to;497 encodes values.476 integer display versus479 cents current balance deliberate distinct contracts. Controls have wrapping labels360-365.

Local responsibility: Current+11 and12-month range steps; integer totals vs cents current balance.

Disposition: RETAIN; TEST FIRST. Stage 6: R17 date/locale; deferred standardization. Outstanding verification: Invalid month types/timezone boundaries and backend range cap. Deferred modernization: Optional formatting-only reuse preserving two display precisions.

### MB04 - Partially Conforming

CS-07/09; WA-FRONT-001. 498 textContent/numeric balance;506-508 numeric totals and fixed classes.505 raw MonthLabel/year attributes lack local escaping; current producer budget.js662-670/853-887 builds normalized numeric months/Intl label, supporting bounded safe type pipeline. No demonstrated arbitrary untrusted string path; deployed/schema/producer variation unverified.

Local responsibility: MonthLabel/year attribute, deficit/shortage classes and Budget columns.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Strict month/label producer contract, malformed data and DOM contexts. Deferred modernization: None.

### MB05 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. RC-KEYBOARD:505 month span is click-only509 with no tabindex/role/key handler or native href.512 URL year/month encoded,525 Budget target fixed. Safe URL construction does not provide keyboard-operable month detail opening.

Local responsibility: Encoded year/month query and fixed Budget destination.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Accessibility triage; R17. Outstanding verification: Keyboard/screen-reader month navigation and detail query validation. Deferred modernization: None.

### MB06 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 482 clears feedback before load (unlike simple reports), includes loading/empty/error states and preserves input on error. No request-version/abort guard; range changes can race results. All business requests GET; no mutation replay concern in this workflow.

Local responsibility: Summary loading/empty/error state and range preservation.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-018; R17. Outstanding verification: Rapid range/load failures, stale-account response and displayed range/data consistency. Deferred modernization: None.

### MB07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. RC-PWA:444-450 active unchanged root worker; shared missing-local-bday/update evidence reused.

Local responsibility: Root worker integration.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16/S6-024; R20 rollback relevance. Outstanding verification: Hosted assets/install/update/mixed caches. Deferred modernization: None.

### MB08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 547-548 ordered platform/tracker; actual WA.api/restore is tracker, not local summary GET. Hashes unchanged.

Local responsibility: MonthlyBudget path; business adapter independent.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-025; R16/R17; prior R15 retained. Outstanding verification: Exact lifecycle/expiry/logout/BFCache/asset compatibility. Deferred modernization: None.

## Evidence reconciliation

After independent inventory/assessment, monthRange662-682 source confirmed strict YYYY-MM parsing/order validation and numeric UTC Intl label generation; this extends cached producer evidence without auditing financial activity calculations. Shared hashes unchanged. T09/S6-018/R17 links retained; no browser PASS or deployed producer equality. Proposed Master mappings group semantic HTTP variant and span-keyboard occurrence separately.

## Common causes and proposed Master Register relevance

MB02 semantic adapter variant under common HTTP-contract cause; MB05 new span-navigation occurrence under RC-KEYBOARD (different from tr row pattern). MB07 shared RC-PWA reference. Master proposal links R16/T09, S6-018 and R17 date/navigation evidence; no automatic R18 native or R19 load relevance asserted.

## Confirmed gaps and owner attention

Two confirmed candidates MB02/MB05. Numeric month producer types support raw label/year output but complete DOM/producer contract remains unverified. Page clears feedback on load and contains no mutations; do not copy simple-report stale-message or failed-save finding onto this workflow.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch03 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
