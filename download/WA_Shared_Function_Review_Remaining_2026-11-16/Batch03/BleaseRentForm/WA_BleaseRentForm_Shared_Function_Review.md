# BleaseRentForm - shared-function compliance review

Authority: explicit November 16 Batch 3 authorization and four refinements (unchanged shared evidence; distinguish page copies/common causes; observed or unresolved timing; Stage 6 and proposed Master Register mapping). Original remaining-58 assignment sections 5-15 governs. Eleven Batch 3 files only, processed sequentially. No completed examination repeated.

Source: httpdocs/BleaseRentForm.html. SHA-256: eb030306ea855c83fbcc36f67d499f7ddba5d7d77494864e50d978b5c85a64ff. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:30:38.272727-05:00; saved completion observed 2026-11-16T09:30:38.273723-05:00. Original count 11. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LF01 | BASE_URL / getToken / requireLogin | 44-47;78 | A | Gate page and authenticate requests | Session and origin responsibilities common across WA | WA.session.restore; WA.api.request | Lease/Rent endpoints and localhost port8080 compatibility | High |
| LF02 | apiFetch / error feedback | 47;55;57-58;61-62;75 | A | Decode failures and report outcomes | Common HTTP and nested/flat error contract | WA.api.json / WA.ApiError | Budget messages and suffix handling | High |
| LF03 | Shared sanitizer / text payload | 2-3;31;60-61 | C | Clean reusable free text before save | Shared defense-in-depth input behavior | DOMPurify; httpdocs/js/inputSanitizer.js | To/Description/Note validation and schema | High |
| LF04 | escapeHtml / record and preview output | 50;57;68;75 | C | Render data and generated controls safely | Context-safe DOM rendering common | Native value/textContent; no shared output encoder equivalent identified | Agreement/payment dates, lease columns, recurrence output | High |
| LF05 | CRUD / selectedId / draft state | 55;57-63 | C | Edit/save/delete with controlled form state | No-replay and asynchronous draft handling common | WA.api.request after compatibility review | Lease payload, selected record and reset semantics | High |
| LF06 | requestedId / startup / navigation | 51;63;78 | C | Open linked record with validated ID | Query validation and safe navigation reusable | URLSearchParams; native location | UserLeaseRentID and fixed budget.html destination | High |
| LF07 | Recurrence UI / preview boundary | 54;64-76 | C | Edit frequency and request preview | Transport/modal/state boundary reusable | No WA-wide recurrence UI equivalent identified | PaymentStart/End, DISALLOW_NO_END=false, ONE_TIME_KEEP_END=false and all recurrence rules | High |
| LF08 | Record/dialog keyboard and focus | 31-35;57;73;76 | C | Select rows and operate dialog accessibly | Keyboard/focus semantics common | No shared accessible row/modal helper identified | Lease record selection and Frequency dialog | High |
| LF09 | moneyDisplay / roundUpAmount boundary | 48-49;57;60 | C | Format payment while preserving save arithmetic | Display formatting reusable | Native Number/Intl; no shared formatter equivalent established | Integer display and saved Math.ceil amount | High |
| LF10 | Service-worker registration | 52 | A | Register shared PWA worker | Cross-WA cache/version integration | httpdocs/sw.js | Root worker scope | High |
| LF11 | Platform and tracking integration | 79-80 | A | Record session-aware page/time usage | Shared usage lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Lease page path; business apiFetch remains independent | High |

B-only exclusions: B-only: lease agreement/payment fields, recurrence expansion, estimated flag and amount ceiling. Generic integration/rendering/accessibility boundaries reviewed; no financial-calculation, layout or formatting audit.

## Candidate assessments

### LF01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 45-47 read current token per call;46 only presence-gates startup78.44 localhost cross-port routing requires compatibility design before WA.api adoption. Actual business/preview calls use local adapter; shared tracker is separate.

Local responsibility: Lease/Rent endpoints and localhost port8080 compatibility.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account-switch and localhost origin contract. Deferred modernization: Staged session/transport/storage modernization.

### LF02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. RC-HTTP-BUDGET:47 adapter block SHA-256 9b4e0bd3e4a2780177bbc19c82757fbb43083286a6c303727314be8f513cde95 equals Batch2 reviewed implementation. Reuse status/code loss and nested-object String coercion analysis. Active CRUD/preview catches55/57/58/61/62/75 show message only; unlike dormant menu this is reachable integration.

Local responsibility: Budget messages and suffix handling.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018/033. Outstanding verification: Actual status/non-JSON/nested browser matrix and business-message preservation. Deferred modernization: None.

### LF03 - Conforming — source verified

CS-07/09; WA-FRONT-001. 2-3 load DOMPurify/shared sanitizer; delegated capture events sanitize To/Description/Note at31 before payload60/submit61. Dates/numbers unchanged. Unchanged helper evidence reused.

Local responsibility: To/Description/Note validation and schema.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Normal/Enter submission and external sanitizer load/failure. Deferred modernization: None.

### LF04 - Partially Conforming

CS-07/09; WA-FRONT-001. 50 encodes five HTML metacharacters;57 escapes To/Description but AgreementDate/PaymentDateBegin/End remain raw HTML substitutions.75 joins API Occurrences into preview HTML. Constant recurrence control markup68 is bounded. Date/preview producer contracts supported by unchanged Budget normalization/preview but DB serialization not certified.

Local responsibility: Agreement/payment dates, lease columns, recurrence output.

Disposition: RETAIN; TEST FIRST. Stage 6: Safety verification; no demonstrated XSS. Outstanding verification: Date-only/occurrence types, malformed legacy values and DOM output contexts. Deferred modernization: Optional Budget display/render contract reuse.

### LF05 - Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. 61/62 send each mutation once and reset only after helper success; failure catch preserves fields.58 asynchronous edit lacks dirty/response-version guard;57 swallows reload failure into message, which success61 can replace. No actual draft loss/concurrency failure executed.

Local responsibility: Lease payload, selected record and reset semantics.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding verification: Failed-save drafts, late edit/account switch, double submit and reload feedback. Deferred modernization: None.

### LF06 - Conforming — source verified

CS-01/04/08; WA-API-001, WA-SHARED-001. 51 validates positive integer query ID;78 rejects invalid and uses parsed numeric selector;63 fixed budget.html. Unchanged generated LeaseRent config58-65/CRUD395-495 user-scoping evidence reused only for these calls.

Local responsibility: UserLeaseRentID and fixed budget.html destination.

Disposition: RETAIN; TEST FIRST. Stage 6: R14; S6-009. Outstanding verification: Denied/not-found/large ID and actual route ownership. Deferred modernization: None.

### LF07 - Partially Conforming

CS-01/03/08; WA-PRESERVE-001, WA-SESSION-001, WA-SHARED-001. 54 and64-76 retain payment-date-specific recurrence flags and business rules.75 preview POST sent once, errors via textContent, response can alter form end date before Use. No WA-wide recurrence UI replacement justified.

Local responsibility: PaymentStart/End, DISALLOW_NO_END=false, ONE_TIME_KEEP_END=false and all recurrence rules.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10 integration; recurrence arithmetic excluded. Outstanding verification: Preview/cancel/concurrent result and unsaved date state. Deferred modernization: None.

### LF08 - Confirmed Nonconformance

CS-07; WA-FRONT-001. RC-KEYBOARD:57 edit is click-only tr;32 close span click76 lacks tabindex/key operation;73 toggles dialog class without focus lifecycle.31 aria-hidden separate header table removes headings from separate body table. Same common pattern as Batch2, independently confirmed at these locations; native Cancel remains.

Local responsibility: Lease record selection and Frequency dialog.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage; R17 targeted browser verification. Outstanding verification: Keyboard row edit, dialog/focus and accessible header severity. Deferred modernization: None.

### LF09 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 48 integer display differs from49/60 saved amount ceiling. Keep saved-value arithmetic local; no change authorized.

Local responsibility: Integer display and saved Math.ceil amount.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional display-only formatting reuse preserving payment amount ceiling.

### LF10 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. RC-PWA:52 registers unchanged sw.js. Reuse Batch2 evidence: local deleted bday remains precached; hosted availability/update behavior not checked. Shared dependency, not another page-local worker defect.

Local responsibility: Root worker scope.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16/S6-024; R20 rollback relevance. Outstanding verification: Hosted precache availability/install/update/mixed assets. Deferred modernization: None.

### LF11 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 79-80 platform before tracker. Actual shared request/restore usage is tracker; all Lease CRUD/preview remains apiFetch. Exact unchanged helper hashes reuse bounded no-replay/tracking evidence.

Local responsibility: Lease page path; business apiFetch remains independent.

Disposition: RETAIN; TEST FIRST. Stage 6: R15 evidence preserved; S6-025; R16/R17. Outstanding verification: Exact lifecycle/expiry/logout/BFCache/asset versions. Deferred modernization: None.

## Evidence reconciliation

After freeze/assessment, reconciled S6-008/018/024 and unchanged component/producer identities. Local Master Register filename search and docs/standard content search found no usable authoritative register/schema (only an OpenItems mention); proposed mappings will not claim existing IDs. Identical adapter hash comparison is bounded evidence reuse, not a repeated Subscription examination. No source/register/test status changed.

## Common causes and proposed Master Register relevance

Review-local RC-HTTP-BUDGET groups identical copied adapters, not a shared-module defect; LF02 is this page occurrence. RC-KEYBOARD groups independently checked row/modal/header patterns; LF08 is one candidate with related observations. RC-PWA is one actual shared-worker dependency referenced by LF10. Proposed Master Register mapping will link these occurrences and unresolved session/draft/rendering/tracking checks to existing S6 IDs; keys are proposed evidence labels only, not allocated authoritative register IDs. Local Master Register filename/schema not located; no register changed.

## Confirmed gaps and owner attention

Two confirmed candidate-level nonconformances (LF02/LF08). Raw date/preview output, draft/late response state and PWA deployment remain unverified. No new executed application tests, exploit, secret leak or server authorization failure. Mandatory failure/accessibility corrections require separate owner scope; optional rendering/formatting remains deferred.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch03 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
