# BinReport - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BinReport.html. SHA-256: 095a7e4a7a657218e1c465cc43c3379aa403365146728465cca2fe95ba18e0e4. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:11:42.054811-05:00; saved completion observed 2026-11-16T09:11:42.055654-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IR01 | getToken / requireLogin / request-origin setup | 37-40;55-56 | A | Authenticate report reads and gate startup | Common session credential/origin boundary | WA.session.restore; WA.api.request | Budget In endpoint and localhost8080 routing | High |
| IR02 | apiFetch error decoding / msg | 40;46;53 | A | Translate request failures to report feedback | Shared status/error-envelope interoperability | WA.api.json / WA.ApiError | Budget legacy error/message and suffix behavior | High |
| IR03 | escapeHtml / moneyDisplay and report table | 41-42;50-52 | C | Render API rows safely | Context-safe output and display formatting reusable | Native DOM/Intl; no equivalent shared report renderer identified | In report From/Description/dates/amount/flags | High |
| IR04 | Source-form and menu navigation / keyboard access | 29;52;57-58 | C | Open a source In record and Budget/Reports pages | Safe URLs and keyboard operation common | Native links/location; no shared row-navigation helper identified | BinForm and UserInID; no BinForm re-examination | High |
| IR05 | Status filtering / asynchronous load state | 29;46-60 | C | Load active/inactive/all rows and show outcomes | Async result ordering and error-state lifecycle reusable | WA.api transport; native select and message element | Budget In status semantics and empty result | High |
| IR06 | Unused requestedId parser | 43 | A | Validate query record ID if used | Generic URL validation responsibility | URLSearchParams; no shared equivalent identified | No consumer on current report | High |
| IR07 | Service-worker registration | 44 | A | Register shared PWA worker | Cross-WA asset/cache lifecycle | httpdocs/sw.js | Root worker integration | High |
| IR08 | Platform and usage-tracking integration | 62-63 | A | Record session-aware report usage | Cross-WA page/time lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | In report path; business apiFetch is independent | High |

B-only exclusions: B-only: In report schema/status selection and source record mapping; no calculations/writes. No reusable free-text input and no sanitizer requirement for select-only report. BinForm examination already completed, not repeated. Broad CSS/formatting excluded.

## Candidate assessments

### IR01 - Approved Migration Pending

CS-03/08/09; WA-SESSION-001, WA-AUTH-001, WA-SHARED-001; D08. 38-40 reads token per request;39/56 gate only token presence.37 localhost origin may use port8080.49 invokes local GET adapter; neither restore nor explicit logout marker checked by local gate. Tracker actual shared API usage is separate.

Local responsibility: Budget In endpoint and localhost8080 routing.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account-switch and dev origin. Deferred modernization: Staged shared session/transport/D08 migration.

### IR02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 40 String-coerces error||message and creates Error without status/code; nested error becomes [object Object].53 catch sends e.message to46 textContent, losing401/403/503/transport distinctions. Malformed JSON succeeds as null before caller type error.

Local responsibility: Budget legacy error/message and suffix behavior.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Nested/flat/status/non-JSON/type/204/abort cases. Deferred modernization: None.

### IR03 - Conforming — source verified

CS-07/09/08; WA-FRONT-001, WA-SHARED-001. 42 five-character escape applied52 to FromName/Description and DateBegin/DateEnd. Amount passes numeric rounding; flags render literal Yes/No.46 uses textContent for error. Dynamic URL ID is encoded separately. Narrow source safe-output claim; no runtime conformance certificate.

Local responsibility: In report From/Description/dates/amount/flags.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Malformed values/date display and accessible reading. Deferred modernization: Optional display-only Budget report renderer preserving schema/rounding.

### IR04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. 52 uses fixed BinForm destination with encoded UserInID, but record opening only click on tr. Full page has no focusable record link/button/key handler.57-58 Budget/Reports buttons remain keyboard-operable. BinForm source not opened or re-examined.

Local responsibility: BinForm and UserInID; no BinForm re-examination.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding verification: Keyboard/screen-reader source navigation and invalid/denied record destination. Deferred modernization: None.

### IR05 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 49 encodes status,51 empty state explicit,53 handles failure as text. No request-version/cancellation control; success50-52 does not clear reportMessage46. Out-of-order filter or stale error display requires controlled verification. Business operations all GET.

Local responsibility: Budget In status semantics and empty result.

Disposition: TEST FIRST. Stage 6: S6-018; page correctness. Outstanding verification: Rapid filter changes/fail-then-success and stale-account result. Deferred modernization: None.

### IR06 - Not Applicable

CS-01/08; WA-SHARED-001. 43 defines positive-ID parser, but complete64-line page never calls it.52 navigation uses encoded API ID instead. Dormant code not counted as active defect.

Local responsibility: No consumer on current report.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional dormant-code cleanup only if separately authorized.

### IR07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 44 registers unchanged root worker. Missing local bday precache target and allowlisted-only caching evidence reused; no new module defect count or observed install failure.

Local responsibility: Root worker integration.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Hosted assets/worker install/update/mixed caches. Deferred modernization: None.

### IR08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 62-63 order platform/tracker correctly. Shared tracker request/restore paths used; business read49 remains local adapter. Helper hashes unchanged.

Local responsibility: In report path; business apiFetch is independent.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Exact lifecycle across restore/expiry/logout/BFCache and asset versions. Deferred modernization: None.

## Evidence reconciliation

After inventory freeze and independent assessment, checked unchanged generated Budget In config22-29/registerSource395-495 and actual49 request/array shape; source UserID predicates support bounded ownership wiring only. S6-008/018/025 and shared hashes reconciled; no BinForm source or previous candidate report reopened. Prior accepted tests and Batch1 unchanged; real-browser T09/T10 gates remain open.

## Confirmed gaps and owner attention

Two confirmed candidates: IR02 request error/status/nested-object contract and IR04 mouse-only source-form navigation. Escaped text/date outputs source-verified. Filter/error state, identity and worker behavior remain unverified; BinForm prior results untouched and not re-examined.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
