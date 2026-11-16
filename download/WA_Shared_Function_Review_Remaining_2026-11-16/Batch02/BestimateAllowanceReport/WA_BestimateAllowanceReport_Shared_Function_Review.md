# BestimateAllowanceReport - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BestimateAllowanceReport.html. SHA-256: ae134905076efcd554a3c342011aacf029d1f9862341438f2cf530940e998af9. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:10:35.107972-05:00; saved completion observed 2026-11-16T09:10:35.108831-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ER01 | Credential gate / request origin | 37-40;45 | A | Authenticate Estimate report read | Session and origin contract common | WA.session.restore; WA.api.request | Estimate endpoint and localhost8080 behavior | High |
| ER02 | apiFetch / error-message catch | 40;45 | A | Decode and communicate request failures | Shared HTTP and error-envelope contract | WA.api.json / WA.ApiError | Budget safe messages/suffix | High |
| ER03 | Safe table rendering / numeric display | 41-42;45 | C | Render Estimate data safely | Safe output and number display reusable | Native DOM/Intl; no equivalent shared table helper identified | Estimate columns, integer amount and flags | High |
| ER04 | Row-to-source navigation and keyboard access | 29;45 | C | Open selected Estimate form | Safe URLs and keyboard operability common | Native links/location; no shared row-navigation helper identified | BestimateAllowanceForm and UserEstimateID mapping | High |
| ER05 | Filter / async loading / feedback state | 29;45 | C | Refresh active-status report | Request ordering and outcome feedback reusable | WA.api transport and native select/status nodes | Active/inactive/all Estimate records | High |
| ER06 | Dormant requestedId helper | 43 | A | Parse positive query ID if called | Generic URL input responsibility | URLSearchParams; no equivalent shared helper identified | Not called on current report | High |
| ER07 | Worker registration | 44 | A | Register common PWA worker | Cross-WA cache/version behavior | httpdocs/sw.js | Root worker integration | High |
| ER08 | Platform and usage-tracking integration | 45-46 | A | Record authenticated report usage | Cross-WA lifecycle tracking | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Estimate report path; separate local business adapter | High |

B-only exclusions: B-only: Estimate direction/FromTo/Description/status-filter semantics and columns. No writes/calculations or reusable free-text input. General CSS/formatting excluded; no generic sanitizer needed for select-only UI.

## Candidate assessments

### ER01 - Approved Migration Pending

CS-03/08/09; WA-SESSION-001, WA-AUTH-001, WA-SHARED-001; D08. 38-40 current stored token read per call;39 gate checks presence only.37 local cross-port routing and45 local GET adapter remain independent of tracker. No restore/logout marker check in gate.

Local responsibility: Estimate endpoint and localhost8080 behavior.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account-switch and localhost origin. Deferred modernization: Staged shared transport/session/D08 migration.

### ER02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 40 creates plain Error after String(data.error||data.message), losing status/code and coercing nested error object.45 shows only e.message;401/403/503/transport categories not differentiated. Successful malformed JSON becomes null.

Local responsibility: Budget safe messages/suffix.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Flat/nested/status/type/non-JSON/204/abort contract. Deferred modernization: None.

### ER03 - Conforming — source verified

CS-07/09/08; WA-FRONT-001, WA-SHARED-001. 42 five-character encoding applied at45 to direction/FromTo/Description and both dates. Amount uses numeric rounding and Active is fixed Yes/No; message uses textContent. No raw dynamic string substitution in inspected cells.

Local responsibility: Estimate columns, integer amount and flags.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Malformed/date display and accessible table reading. Deferred modernization: Optional common Budget display/renderer contract preserving integer amounts.

### ER04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. 45 uses fixed source-form URL and encoded UserEstimateID but attaches only click to tr. No keyboard-focusable link/button/key handler for opening a record;29 expressly instructs row click. Native menu buttons remain available.

Local responsibility: BestimateAllowanceForm and UserEstimateID mapping.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding verification: Keyboard/screen-reader source-form navigation and ID denial behavior. Deferred modernization: None.

### ER05 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 45 encodes status and catches failures as text; empty rows explicit. No request-version/abort guard, successful loads do not clear reportMessage. Concurrent or fail-then-success state behavior unverified; no mutations.

Local responsibility: Active/inactive/all Estimate records.

Disposition: TEST FIRST. Stage 6: S6-018; page correctness. Outstanding verification: Rapid filters, stale error and late identity response. Deferred modernization: None.

### ER06 - Not Applicable

CS-01/08; WA-SHARED-001. 43 parser unused in full report source; navigation at45 encodes producer ID independently. No active query-parser issue counted.

Local responsibility: Not called on current report.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional dormant helper cleanup only with separate scope.

### ER07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 44 registers unchanged sw.js; shared missing-local-bday precache dependency and network-first HTML/auth-module behavior reused. No hosted worker-install failure established.

Local responsibility: Root worker integration.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Hosted asset availability/install/update/mixed versions. Deferred modernization: None.

### ER08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 45-46 order platform/tracker correctly; tracker uses WA.api/restore while report GET remains local. Unchanged helper evidence reused with new-page integration inspected.

Local responsibility: Estimate report path; separate local business adapter.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Exact lifecycle events across restore/expiry/logout/BFCache. Deferred modernization: None.

## Evidence reconciliation

After freezing eight independent candidates and assessing actual report calls, reconciled unchanged Estimate producer/generated routes and common component hashes with S6-008/018/025. No prior page inventory consulted for discovery. Report is read-only and has no recurrence/Description creation flow; those form-specific behaviors were not assumed here. Retain Stage6 bounded passes/open browser gates.

## Confirmed gaps and owner attention

Two confirmed candidates: ER02 error/status/nested-envelope handling and ER04 pointer-only source navigation. Escaped output is source-verified for inspected fields. Async report feedback, identity and worker lifecycle need verification; no source change or runtime test authorized.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
