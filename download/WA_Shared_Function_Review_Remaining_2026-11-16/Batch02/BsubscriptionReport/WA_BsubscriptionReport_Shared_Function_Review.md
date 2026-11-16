# BsubscriptionReport - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BsubscriptionReport.html. SHA-256: aa8d4e5695fb3dbf1d0492d4e5d2b7697e42c58560ddfb1adf5309e392770002. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:04:40.353280-05:00; saved completion observed 2026-11-16T09:04:40.354248-05:00. Original count 8. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR01 | BASE_URL / getToken / requireLogin | 37-40;45 | A | Gate report and send authenticated reads | Cross-WA session/credential and origin contract | WA.session.restore; WA.api.request | Budget subscription endpoint and localhost port-8080 behavior | High |
| SR02 | apiFetch error decoding and msg catch | 40;45 | A | Translate HTTP/transport failures into report feedback | Common status/error-shape compatibility | WA.api.json / WA.ApiError | Budget message/error suffix compatibility | High |
| SR03 | escapeHtml / moneyDisplay / report output | 41-42;45 | C | Render subscription data as safe table cells | Safe output and numeric display common | Native DOM/Intl; no equivalent shared table renderer established | Subscription columns, integer amounts and flags | High |
| SR04 | Report-row navigation and keyboard operation | 29;45 | C | Open selected source form and navigate menus | Safe URL construction and keyboard access reusable | Native links/location; no shared row-navigation helper identified | BsubscriptionForm destination and UserSubscriptionID | High |
| SR05 | Status filter / async load / message state | 29;45 | C | Refresh report with selected active status | Request ordering and feedback state common | WA.api transport; native select/status nodes | Budget active/inactive/all filter semantics | High |
| SR06 | requestedId definition (unused) | 43 | A | Parse positive query record ID | Generic URL validation responsibility | URLSearchParams; no shared ID helper identified | No query-ID consumer exists on this report | High |
| SR07 | Service-worker registration | 44 | A | Register PWA worker | Cross-WA cache/version handling | httpdocs/sw.js | Root-scope worker integration | High |
| SR08 | Platform and tracker integration | 45-46 | A | Track authenticated page/time events | Cross-WA usage lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Report path tracked; local business adapter remains independent | High |

B-only exclusions: B-only: Subscription columns and status filtering semantics; no business writes or reusable text input. DOMPurify/shared input sanitizer not required for select-only report. Broad layout/formatting excluded.

## Candidate assessments

### SR01 - Approved Migration Pending

CS-03/08/09; WA-SESSION-001, WA-AUTH-001, WA-SHARED-001; D08. 38 reads current token per call;39 requires presence only. 37 localhost non-8080 origin points at 8080, so shared same-origin transport requires compatibility review.45 business GET invokes local apiFetch; platform is used indirectly by tracker.

Local responsibility: Budget subscription endpoint and localhost port-8080 behavior.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/stale-token/logout/account-switch and local dev origin. Deferred modernization: Staged shared session/transport and D08 architecture.

### SR02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 40 coerces data.error || data.message with String and throws plain Error, dropping status/code; nested objects become [object Object].45 catch displays only e.message. No differentiated 401/403/503/transport states; parse failure becomes null even on success. Actual local Budget GET returns array; full central/auth error compatibility unverified.

Local responsibility: Budget message/error suffix compatibility.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding verification: Controlled HTTP/error-shape/non-JSON/type matrix; no application tests run. Deferred modernization: None.

### SR03 - Conforming — source verified

CS-07/09/08; WA-FRONT-001, WA-SHARED-001. 42 five-character HTML escape is applied at45 to ToName, Description, PaymentAccount and both date fields. Amount flows through Number/Math.round; flags produce fixed Yes/No. Errors use textContent. Narrow safe output claim for inspected substitutions; no unescaped domain string found here.

Local responsibility: Subscription columns, integer amounts and flags.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Actual malformed type/date display and accessible table reading. Deferred modernization: Optional display-only Budget renderer/formatter reuse preserving columns and rounding.

### SR04 - Confirmed Nonconformance

CS-07/08; WA-FRONT-001, WA-SHARED-001. 45 constructs fixed form URL plus encodeURIComponent(UserSubscriptionID), but only binds click on tr. Full source provides no keyboard-focusable link/button or key handler to open a record.29 instructs row click. Native Budget/Reports buttons remain keyboard-operable.

Local responsibility: BsubscriptionForm destination and UserSubscriptionID.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding verification: Keyboard/screen-reader source-form navigation and URL/record-denial behavior. Deferred modernization: None.

### SR05 - Partially Conforming

CS-03/07; WA-SESSION-001, WA-FRONT-001. 45 encodes filter value, handles empty rows and uses textContent for failures. Concurrent filter GETs have no request-version/cancellation guard; msg class/text is not cleared on successful load. Old error or out-of-order results may remain; manifestation not executed. No unsafe mutation exists.

Local responsibility: Budget active/inactive/all filter semantics.

Disposition: TEST FIRST. Stage 6: S6-018; page correctness. Outstanding verification: Rapid filter changes, fail-then-success feedback and stale-account response. Deferred modernization: None.

### SR06 - Not Applicable

CS-01/08; WA-SHARED-001. 43 requestedId is defined but not invoked anywhere in current report. Row navigation uses encoded producer ID at45, not this helper. No active ID-parser defect counted.

Local responsibility: No query-ID consumer exists on this report.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional dormant helper cleanup only if separately approved.

### SR07 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 44 registers unchanged shared worker. Its addAll target /bday.html remains absent locally; private Authorization/API requests bypass worker. One shared dependency risk referenced, not new root defect per page.

Local responsibility: Root-scope worker integration.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Hosted precache availability/update/rollback and mixed client assets. Deferred modernization: None.

### SR08 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 45 then46 order platform/tracker correctly; actual shared API use is tracker request/restore, local report uses apiFetch. Reuse unchanged helper source properties.

Local responsibility: Report path tracked; local business adapter remains independent.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Exact report lifecycle across restore/expiry/logout/BFCache. Deferred modernization: None.

## Evidence reconciliation

Frozen eight candidates before selected-page reconciliation. Current generated Subscription GET evidence reused from budget.js after unchanged hash, with actual report call and returned-array use inspected. Batch 1 common components reused by exact hashes; no prior page candidate list used. Later November15 handoff preserves T12 and open T09/T10; report-local adapter checks cannot close shared-client acceptance.

## Confirmed gaps and owner attention

Two confirmed candidate-level gaps: SR02 failure/status/nested-message contract; SR04 pointer-only source-form navigation. Safe escaped output differs from form raw date cells and is source-verified for inspected fields. Async filter/feedback and shared worker remain unverified; no disclosure or server-authorization failure demonstrated.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
