# BloanReport - shared-function compliance review

Authority: explicit November 16 Batch 3 authorization and four refinements (unchanged shared evidence; distinguish page copies/common causes; observed or unresolved timing; Stage 6 and proposed Master Register mapping). Original remaining-58 assignment sections 5-15 governs. Eleven Batch 3 files only, processed sequentially. No completed examination repeated.

Source: httpdocs/BloanReport.html. SHA-256: 5432bc0527231b16069ce49c549452aafb66ea78708948c7a35b91b1cd961124. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:35:27.305857-05:00; saved completion observed 2026-11-16T09:35:27.306803-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NR01 | Credential gate / request origin | 37-40;45 | A | Authenticate Loan report read | Session/origin responsibility common | WA.session.restore; WA.api.request | Loan endpoint/local8080 behavior | High |
| NR02 | apiFetch and message catch | 40;45 | A | Decode/report failures | Common status/envelope contract | WA.api.json / WA.ApiError | Budget messages/suffix | High |
| NR03 | Safe cells / numeric formatting | 41-42;45 | C | Render Loan fields safely | Output/display formatting reusable | Native DOM/Intl; no shared report renderer equivalent identified | Loan dates/amounts/flags/columns | High |
| NR04 | Row navigation / keyboard access | 29;45 | C | Open Loan source form | Safe URLs and keyboard actions common | Native link/location; no shared row helper identified | BloanForm/UserLoanID | High |
| NR05 | Filter / async feedback | 29;45 | C | Refresh selected status | Async ordering/outcome lifecycle common | WA.api transport/native select | Loan active-status/empty semantics | High |
| NR06 | Unused requestedId | 43 | A | Parse query ID if called | Generic query validation responsibility | URLSearchParams; no shared equivalent identified | No caller on report | High |
| NR07 | Worker registration | 44 | A | Register common PWA worker | Shared asset/version boundary | httpdocs/sw.js | Root scope | High |
| NR08 | Platform and tracker integration | 45-46 | A | Record report usage | Cross-WA lifecycle tracking | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Loan report path/local GET adapter | High |

B-only exclusions: B-only: Loan report schema/status semantics, integer amount display. No writes/free text; generic input sanitizer not needed. Financial arithmetic/layout/formatting audit excluded.

## Candidate assessments

### NR01 - Approved Migration Pending

CS-03/08/09; WA-SESSION-001, WA-AUTH-001, WA-SHARED-001; D08. 38-40 current token per call,39 presence-only gate;37 localhost cross-port compatibility remains.45 actual Loan GET uses local adapter; tracker independent.

Local responsibility: Loan endpoint/local8080 behavior.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account-switch/dev origin. Deferred modernization: Staged session/transport/D08 migration.

### NR02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. RC-HTTP-BUDGET:40 block hash equals cached9b4e0bd3... algorithm; active45 GET catch displays message only. Reuse loss of status/code and nested object coercion evidence; one page occurrence, not a new shared-module defect.

Local responsibility: Budget messages/suffix.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Browser nested/flat/status/non-JSON/type contract. Deferred modernization: None.

### NR03 - Conforming — source verified

CS-07/09/08; WA-FRONT-001, WA-SHARED-001. 42 five-character escaping applied45 to FromName/DateLoan/Description/PaymentDateBegin/End; LoanAmount/PaymentAmount numeric and flags fixed strings. Error textContent. All actual Loan cells independently checked; reuse common escaping algorithm, not assumed layout.

Local responsibility: Loan dates/amounts/flags/columns.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Malformed values/date display and table reading. Deferred modernization: Optional display-only reuse preserving Loan columns/amounts.

### NR04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. RC-KEYBOARD:45 fixed BloanForm URL plus encoded UserLoanID, but only tr click handler; no focusable link/key equivalent in full source. Independent page occurrence under common pattern.

Local responsibility: BloanForm/UserLoanID.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Accessibility triage; R17 browser coverage. Outstanding verification: Keyboard/screen-reader source navigation and route denial. Deferred modernization: None.

### NR05 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 45 encodes filter and catches errors; no request-version guard or successful-load message clearing. Racing status requests/stale error need verification; all requests GET.

Local responsibility: Loan active-status/empty semantics.

Disposition: TEST FIRST. Stage 6: S6-018; correctness. Outstanding verification: Rapid filter/fail-then-success/account-switch late response. Deferred modernization: None.

### NR06 - Not Applicable

CS-01/08; WA-SHARED-001. 43 helper unused in complete47-line source.45 uses encoded API ID independently. Dormant utilities not active defects.

Local responsibility: No caller on report.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional dormant helper cleanup only if authorized.

### NR07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. RC-PWA:44 registers unchanged worker; missing-local-bday precache concern reused once at common-root level. No hosted install result.

Local responsibility: Root scope.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16/S6-024; R20 rollback relevance. Outstanding verification: Hosted assets/update/mixed versions. Deferred modernization: None.

### NR08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 45-46 ordered platform/tracker; actual shared APIs in tracker, local report GET independent. Exact helper hashes unchanged.

Local responsibility: Loan report path/local GET adapter.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-025; R16/R17; R15 evidence retained. Outstanding verification: Exact lifecycle across restore/expiry/logout/BFCache. Deferred modernization: None.

## Evidence reconciliation

Independent eight-candidate inventory frozen before cached common-cause assessment reuse. Exact adapter block/hash and unchanged shared/Loan producer hashes corroborate reuse. Current source Loan cell fields/source link independently verified; S6/R16 browser gates remain unchanged. Proposed Master mapping has separate occurrence and common cause, no new authoritative ID.

## Common causes and proposed Master Register relevance

NR02/NR04 occurrences map to RC-HTTP-BUDGET/RC-KEYBOARD; NR07 references one RC-PWA shared dependency. Matching adapter/common-control evidence reused after independent inventory and actual field/link inspection. Proposed Master Register labels only; no authoritative IDs/register edits.

## Confirmed gaps and owner attention

Two confirmed candidates NR02/NR04. Dates/text escaped, numeric values normalized. Loan report has no recurrence writes; form-specific Loan flags not assumed applicable here. Async filter/identity/PWA remains unverified.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch03 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
