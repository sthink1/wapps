# BcardForm - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BcardForm.html. SHA-256: e0fec0c08d8fc05459bf92e7f60f306d8ab79afb5b94db06b6f1c5d8d77e9904. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:05:36.718008-05:00; saved completion observed 2026-11-16T09:05:36.719208-05:00. Original count 10. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CF01 | BASE_URL / getToken / requireLogin | 39-42;48 | A | Gate Credit Card page and authenticate CRUD | Cross-WA credential/session and origin responsibilities | WA.session.restore; WA.api.request | Card endpoints and localhost:8080 hosting contract | High |
| CF02 | apiFetch and caller error handling | 42;48 | A | Decode response failures and display safe text | Common status/error-shape contract | WA.api.json / WA.ApiError | Budget safe business strings and suffix behavior | High |
| CF03 | DOMPurify/shared sanitizer and payload text validation | 2-3;31;48 | C | Clean reusable text and validate typed last-four input | Shared plain-text defense and input validation integration | httpdocs/js/inputSanitizer.js; DOMPurify | AccountName/Note, exactly-four-digit rule and card schema | High |
| CF04 | escapeHtml and card-row rendering | 45;48 | C | Render card information safely | Context-safe output is project-wide | Native DOM/value/text APIs; no shared card-table equivalent | Card columns and date/amount contracts | High |
| CF05 | CRUD / selected record / draft lifecycle | 48 | C | Save/edit/delete with controlled form state | No replay, late responses and draft preservation common | WA.api.request after contract review | Alternative payment checks, payload, record identity and resets | High |
| CF06 | requestedId and navigation | 46;48 | C | Validate linked record ID and navigate | Safe query/nav contract reusable | URLSearchParams; native location | Positive UserCardID and budget.html destination | High |
| CF07 | Existing-card row keyboard interaction | 31;48 | C | Select a card to edit accessibly | Keyboard-accessible action controls common | No shared accessible row-selector identified | Map each card row to editRecord | High |
| CF08 | moneyDisplay / roundUpAmount boundary | 43-44;48 | C | Display numeric values while preserving save rule | Display formatting reusable; save arithmetic domain-specific | Native Intl/Number; no equivalent shared formatter established | Math.ceil saved balances/payment/line amounts and integer display | High |
| CF09 | Service-worker registration | 47 | A | Register shared PWA worker | Cross-WA cache/version boundary | httpdocs/sw.js | Root worker integration | High |
| CF10 | Shared platform and usage tracker | 48-49 | A | Track page/time through shared session | Cross-WA usage lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Card page path; business adapter remains independent | High |

B-only exclusions: B-only: card statement/payment/credit-line business fields, last-four validation, alternative/minimum amount comparison and amount-ceiling save rules remain local. No account data examined. Broad formatting/CSS excluded.

## Candidate assessments

### CF01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 40-42 token read per call, presence gate only;39 routes localhost development origin to8080. All card CRUD uses apiFetch at48, not WA.api. Request caller headers can override auth; current callers supply no override. No restore or logout-marker handling in gate.

Local responsibility: Card endpoints and localhost:8080 hosting contract.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restore/expiry/logout/account switch and local origin compatibility. Deferred modernization: Staged transport/storage migration; preserve card contract.

### CF02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 42 accepts error||message then String-coerces nested objects and throws plain Error without status/code.48 catches display message only; 401/403/503/transport categories not retained. Malformed JSON yields null even on success; Budget card producer returns flat strings but auth/central paths require nested compatibility.

Local responsibility: Budget safe business strings and suffix behavior.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018/033. Outstanding verification: Response-shape/status/type/non-JSON/204/abort matrix and saved draft behavior. Deferred modernization: None.

### CF03 - Conforming — source verified

CS-07/09; WA-FRONT-001. 2-3 imports sanitizer with DOMPurify; capture submit/click/blur/change covers AccountName/Note and text Last4Digits before payload.48 trims then enforces exactly four digits; generic sanitation does not replace validation. No password inputs and no card-number values inspected.

Local responsibility: AccountName/Note, exactly-four-digit rule and card schema.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Capture event ordering, external dependency failure and last-four normal entry. Deferred modernization: None.

### CF04 - Partially Conforming

CS-07/09; WA-FRONT-001. 45 escapes five metacharacters;48 escapes AccountName/Last4Digits, uses numeric conversions/fixed flag strings, assigns form data via value/textContent. LastStatementDate/PaymentDueDate enter table HTML raw. normalizeCard 581-582 validates write dates; current stored schema/serialization remains unverified. No demonstrated injection from date data.

Local responsibility: Card columns and date/amount contracts.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety. Outstanding verification: Current date-only producer/DB type and malformed legacy values; safe table rendering. Deferred modernization: Optional shared display/render contract only after preserving card fields.

### CF05 - Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. 48 resets form only after successful mutation and sends no automatic replay. On mutation failure catches retain draft; editRecord may apply late asynchronous data without version/dirty guard. loadRecords catches internally, allowing final success text to replace refresh error. Double-submit/account-switch effects not executed.

Local responsibility: Alternative payment checks, payload, record identity and resets.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding verification: Real-browser failure retention, concurrent edits/saves, late responses and refresh failure UX. Deferred modernization: None.

### CF06 - Conforming — source verified

CS-01/04/08; WA-API-001, WA-SHARED-001. 46 parses positive integer ID,48 handles invalid ID and uses parsed selector; budget.html fixed navigation. Card GET/PUT/DELETE handlers budget.js600-658 scope UserCardID with UserID. This is source wiring only, not complete server/DB authorization acceptance.

Local responsibility: Positive UserCardID and budget.html destination.

Disposition: RETAIN; TEST FIRST. Stage 6: R14; S6-009. Outstanding verification: Cross-owner/not-found denied result and large ID/schema limits. Deferred modernization: None.

### CF07 - Confirmed Nonconformance

CS-07; WA-FRONT-001. 31 instructs row-click edit;48 only registers click on tr, with no tabindex/key handler or focusable edit action in full page. Native Save/New/Delete buttons do not provide a keyboard means to select another existing record.

Local responsibility: Map each card row to editRecord.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding verification: Keyboard/screen-reader existing-record editing and preservation-compatible scope. Deferred modernization: None.

### CF08 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 43 integer display and44 amount ceiling are separate contracts used in48. Saved balances/minimum/alternative/credit values use roundUpAmount; changing to ordinary currency formatting would change behavior. Business rounding excluded from correctness audit.

Local responsibility: Math.ceil saved balances/payment/line amounts and integer display.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional display-only helper reuse; preserve saved-value arithmetic.

### CF09 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 47 registers same shared worker; unchanged hash reuses no Authorization/API caching and missing local bday precache target evidence. No hosted failure inferred.

Local responsibility: Root worker integration.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Asset availability, install/update and mixed client versions. Deferred modernization: None.

### CF10 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 48-49 correctly order platform/tracker. Actual tracker uses request/restore; card business adapter remains independent. Shared hashes unchanged.

Local responsibility: Card page path; business adapter remains independent.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Per-page lifecycle/expiry/logout/BFCache and assets. Deferred modernization: None.

## Evidence reconciliation

After frozen inventory and source assessment, reconciled S6-008/018/025 and unchanged component hashes. No BcardForm-specific prior candidate checklist consulted. Card routes575-658 inspected for actual flat error strings, date validation and user-key ownership; this new producer subset is distinct from generated Subscription routes. Shared-client T09/T10 remains separate from local adapter evidence; prior Stage6 passes preserved.

## Confirmed gaps and owner attention

Two confirmed candidates: CF02 error category/nested-object contract and CF07 keyboard selection of existing records. Raw date output, late-response/draft behavior and PWA installation remain unverified. Source producer shows UserID scoping and field validation, without a new runtime authorization PASS. No personal financial records or credentials accessed.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
