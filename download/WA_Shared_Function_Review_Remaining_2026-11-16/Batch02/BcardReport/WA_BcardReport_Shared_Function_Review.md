# BcardReport - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BcardReport.html. SHA-256: 0df8ad4c1fd76bea1e289c67df3343ad915afab1245423aa8e4b87281ea7f634. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:07:29.830510-05:00; saved completion observed 2026-11-16T09:07:29.831463-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CR01 | Credential gate and BASE_URL transport | 37-40;45 | A | Authenticate card report reads | Shared session and request-origin contract | WA.session.restore; WA.api.request | Card list endpoint and development port8080 routing | High |
| CR02 | apiFetch error parsing / report failure feedback | 40;45 | A | Decode failures and report errors | Common status and safe error-envelope interoperability | WA.api.json / WA.ApiError | Budget error/message compatibility and suffix | High |
| CR03 | Card report rendering / formatters | 41-42;45 | C | Render card fields safely | DOM context safety and number display reusable | Native DOM/Intl; no shared card renderer identified | Card columns, nullable amounts, dates and flags | High |
| CR04 | Row-to-card navigation / keyboard operation | 29;45 | C | Open source card form from report | Safe URL and accessible navigation responsibilities common | Native links/location; no shared row helper identified | BcardForm and UserCardID mapping | High |
| CR05 | Status-filter request and error-state lifecycle | 29;45 | C | Load selected report status and show outcomes | Async ordering and feedback state reusable | WA.api transport; native select and status node | Active/inactive/all card filter | High |
| CR06 | Unused requestedId helper | 43 | A | Validate positive query ID if called | Generic query parameter validation | URLSearchParams; no existing shared ID helper identified | No current report caller | High |
| CR07 | Service-worker registration | 44 | A | Register common PWA worker | Shared cache/version integration | httpdocs/sw.js | Root-scope worker | High |
| CR08 | Platform and usage tracking | 45-46 | A | Track session-aware report usage | Cross-WA page/time lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Card report path; independent GET adapter | High |

B-only exclusions: B-only: card report fields/status filter and integer amount presentation. No financial calculation audit or writes; no reusable user text inputs, so generic input sanitizer not required. Broad CSS/formatting excluded.

## Candidate assessments

### CR01 - Approved Migration Pending

CS-03/08/09; WA-SESSION-001, WA-AUTH-001, WA-SHARED-001; D08. 38 reads current stored token;39 gate checks presence only, no restore/logout marker.37 localhost hosting may use cross-port API.45 GET cards uses local adapter; tracker shared API does not replace it.

Local responsibility: Card list endpoint and development port8080 routing.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Expired/missing-restorable token, logout/account switch and development-origin compatibility. Deferred modernization: Staged transport/session/D08 modernization.

### CR02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 40 coerces data.error||data.message using String, dropping status/code in plain Error. Nested error objects yield [object Object];45 catch displays only message.401/403/503/transport distinctions absent; malformed successful JSON yields null. No secret disclosure established.

Local responsibility: Budget error/message compatibility and suffix.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Flat/nested/status/type/non-JSON/204/abort handling. Deferred modernization: None.

### CR03 - Conforming — source verified

CS-07/09/08; WA-FRONT-001, WA-SHARED-001. 42 encodes five HTML metacharacters;45 escapes AccountName/Last4Digits and both dates. Monetary fields use Number/Math.round, nullable values explicit; booleans yield literal Yes/No. Error text uses textContent. Current backend GET592-597 scopes list to UserID; this does not certify all DB/privacy behavior.

Local responsibility: Card columns, nullable amounts, dates and flags.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R14 source wiring only. Outstanding verification: Malformed values, actual date display and accessible reading. Deferred modernization: Optional display-only common renderer/formatter; preserve integer/null conventions.

### CR04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. 45 URL uses fixed BcardForm.html plus encoded UserCardID, but record opening is click-only tr handler. No keyboard-focusable row action or key handler exists in page.29 row-click instruction and native navigation buttons do not supply keyboard source-record opening.

Local responsibility: BcardForm and UserCardID mapping.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding verification: Keyboard/screen-reader card source navigation; record-not-found/denial. Deferred modernization: None.

### CR05 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 45 encodes status, renders empty state, catches errors as text. No request-version guard/cancellation; successful load does not clear existing reportMessage. Out-of-order filter results or stale error possible, not executed. All business calls are GET.

Local responsibility: Active/inactive/all card filter.

Disposition: TEST FIRST. Stage 6: S6-018; page correctness. Outstanding verification: Rapid filter requests and fail-then-success/late-account response. Deferred modernization: None.

### CR06 - Not Applicable

CS-01/08; WA-SHARED-001. 43 positive-ID parser is unused in complete47-line source; encoded UserCardID navigation at45 does not call it. No active helper defect inferred.

Local responsibility: No current report caller.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional dormant-code cleanup, separately authorized.

### CR07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 44 registers unchanged sw.js; missing local /bday.html remains in worker precache. Reuse existing bounded worker evidence, not separate module defect count.

Local responsibility: Root-scope worker.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Hosted assets/worker install/update/mixed versions. Deferred modernization: None.

### CR08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 45-46 platform/tracker ordered. Tracker actual request/restore use; business GET is independent adapter. Unchanged hashes permit bounded component evidence reuse.

Local responsibility: Card report path; independent GET adapter.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Exact page/time lifecycle, expiry/logout/BFCache and cached assets. Deferred modernization: None.

## Evidence reconciliation

After frozen independent discovery and source assessment, checked unchanged Card producer/shared hashes and register S6-008/018/025. Actual report rendering escaped both dates, unlike form; page-specific integration was inspected rather than assuming shared-template equivalence. No BcardReport-specific prior finding inventory consulted; bounded Stage6 evidence and open browser acceptance retained.

## Confirmed gaps and owner attention

Two confirmed candidates: CR02 error/status/nested-object contract; CR04 mouse-only source-form navigation. Output strings/dates are escaped. Async filter/message state, account identity and shared precache installation require verification; no financial records, secrets or hosted services accessed.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
