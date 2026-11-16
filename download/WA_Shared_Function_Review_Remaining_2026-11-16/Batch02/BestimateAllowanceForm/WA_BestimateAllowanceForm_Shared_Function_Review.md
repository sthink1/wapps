# BestimateAllowanceForm - shared-function compliance review

Authority: explicit November 16 Batch 2 authorization with two refinements (reuse unchanged component evidence; observed phase timing or unresolved). Original remaining-58 assignment sections 5-15 governs. Eight Batch 2 files only, processed sequentially. No Batch 1 examination repeated.

Source: httpdocs/BestimateAllowanceForm.html. SHA-256: 8617cd43002d81d7d220935d80a3b39376c0a1a690c1cf3da1c067cbf22d2eef. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. This identifies local examined bytes, not a proven Drive revision or live deployment. Local source primary by assignment; no unnecessary remote comparisons performed.

Governing Core v1.0 and Detailed v0.4.1 approved November 12 per current approval headers/adoption record despite retained DRAFT filenames; Decision Register v1.0 D01-D14 plus subsequent approved 3A-3C clarifications. README Section 0 and AGENTS explicitly read; tool reads do not rely on automatic shell/IDE instruction loading. CLAUDE/TechSummary and relevant Stage 6 records consulted; unchanged prior evidence reused only for named bounded properties.

## Frozen independent discovery

Original inventory completed 2026-11-16T09:08:37.588770-05:00; saved completion observed 2026-11-16T09:08:37.589577-05:00. Original count 12. Post-reconciliation additions: 0. The sibling immutable JSON preserves original inventory before selected-page prior findings/register reconciliation.

| ID | Function/block | Source lines | A/B/C | Purpose | WA-wide rationale | Existing shared implementation | Responsibilities remaining local | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EF01 | BASE_URL / getToken / requireLogin | 44-47;78 | A | Gate page and send credentialed requests | Cross-WA session and origin contract | WA.session.restore; WA.api.request | Estimate endpoints and development port8080 behavior | High |
| EF02 | apiFetch and caller error feedback | 47;55-58;61-63;75 | A | Decode errors and communicate outcomes | Shared HTTP/status/envelope interoperability | WA.api.json / WA.ApiError | Budget business errors and suffix contract | High |
| EF03 | Shared sanitation and text payload | 2-3;31;36;60-63 | C | Sanitize reusable free text before submission | Project-wide input defense | DOMPurify; httpdocs/js/inputSanitizer.js | FromTo/Note/newDescription fields and Estimate schema | High |
| EF04 | escapeHtml / row and preview rendering | 50;56-57;68;75 | C | Render API-backed labels, records and preview safely | Context-aware output safety common | Native option.textContent/value and textContent; no shared renderer equivalent established | Estimate columns, dates, occurrence output and constant recurrence markup | High |
| EF05 | CRUD / payload / reset / draft state | 55;57-62 | C | Submit controlled mutations and manage drafts | No replay and asynchronous editing state common | WA.api.request after preserving contracts | Estimate direction/amount/recurrence schema and selectedId | High |
| EF06 | requestedId / startup / navigation | 51;63;78 | C | Validate linked record and navigate | Safe URL parameters and navigation reusable | URLSearchParams; native location | UserEstimateID and budget.html destination | High |
| EF07 | Description dropdown / Add Description integration | 31;36;56;58-59;63;78 | C | Load shared/user description data and add a choice | Reusable async dropdown/modal boundary; data-driven list contract | /budget/descriptions; shared sanitizer; no generic shared dropdown UI identified | In/Out filtering, custom choice creation and retained legacy description | High |
| EF08 | Frequency controls / preview integration | 54;64-76 | C | Edit recurrence and request preview | Generic modal/transport/state boundary reusable | No equivalent WA-wide recurrence UI established | All recurrence rules/flags/date expansion stay Budget-local | High |
| EF09 | Record and dialog keyboard/focus semantics | 31-36;57;63;73;76 | C | Select existing records and operate dialogs accessibly | Cross-WA keyboard/focus/accessibility contract | No shared accessible dialog/row helper identified | Estimate source rows, Description and Frequency dialogs | High |
| EF10 | Amount display / rounding boundary | 48-49;57;60 | C | Display amount while preserving save semantics | Display formatting reusable | Native Number/Intl; no shared formatter equivalent established | Integer display and Math.ceil saved amount business rule | High |
| EF11 | Service-worker registration | 52 | A | Register common PWA worker | Cross-WA cache/version behavior | httpdocs/sw.js | Root worker integration | High |
| EF12 | Shared platform and usage tracker | 79-80 | A | Record authenticated usage lifecycle | Cross-WA page/time tracking | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | Estimate page path; business adapter remains independent | High |

B-only exclusions: B-only: Estimate direction/amount and optional FromTo, recurrence arithmetic and all frequency business rules remain local. Description list semantics stay data-driven; no global list change requested. Broad HTML/CSS/formatting excluded.

## Candidate assessments

### EF01 - Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 45-47 read current localStorage token but gate only checks presence;44 localhost cross-port behavior remains distinct from same-origin WA.api.78 startup gate precedes loads; all Estimate/description/preview calls use local adapter.

Local responsibility: Estimate endpoints and development port8080 behavior.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018; R17. Outstanding verification: Restoration/expired credential/logout/account-switch and origin compatibility. Deferred modernization: Staged shared transport/session/D08 architecture.

### EF02 - Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 47 String-coerces data.error||data.message and throws plain Error without status/code; nested envelope yields [object Object], callers show message only. No reliable401/403/503/transport categories. JSON parse failures become null on success as well.

Local responsibility: Budget business errors and suffix contract.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018/033. Outstanding verification: Error-envelope/status/type/non-JSON/204/abort matrix and domain message preservation. Deferred modernization: None.

### EF03 - Conforming — source verified

CS-07/09; WA-FRONT-001. 2-3 DOMPurify/shared sanitizer load; delegated capture submit/click/blur/change sanitizes FromTo/Note/newDescription before60/61/63 read them. Description select values originate from API/native option nodes; numeric/date controls excluded from generic sanitation.

Local responsibility: FromTo/Note/newDescription fields and Estimate schema.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding verification: Normal/Enter/modal Save event ordering and dependency failure. Deferred modernization: None.

### EF04 - Partially Conforming

CS-07/09; WA-FRONT-001. 50 five-character encoder used on InOrOut/FromTo/Description in57;56 option labels use textContent. Record DateBegin/DateEnd and Occurrences preview at75 are raw HTML substitutions. Budget source validation344-379 and preview905-922 support date-only outputs; current stored/serialized data and full generator result types remain unverified. Constant recurrence markup68 uses fixed arrays/numbers.

Local responsibility: Estimate columns, dates, occurrence output and constant recurrence markup.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; no demonstrated XSS. Outstanding verification: DB date-only serialization and occurrence type/output context, malformed legacy values. Deferred modernization: Optional common Budget output contract; preserve report/schema semantics.

### EF05 - Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. 61/62 reset only after mutation success; no automatic replay.58 editRecord awaits descriptions midway before filling remaining fields without response-version guard.59 reset triggers unawaited loadDescriptions; later completion can change current dropdown. Failed mutation catch retains entered values, but concurrent/stale response effects not tested.

Local responsibility: Estimate direction/amount/recurrence schema and selectedId.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding verification: Unsaved-form failure, late edit/dropdown requests, double-submit/account switch and refresh errors. Deferred modernization: None.

### EF06 - Conforming — source verified

CS-01/04/08; WA-API-001, WA-SHARED-001. 51 parses positive integer query ID;78 handles invalid ID and uses numeric selector.63 navigation fixed budget.html. Generated Estimate config67-73/registerSource scopes record operations by UserID. Runtime cross-owner acceptance not claimed.

Local responsibility: UserEstimateID and budget.html destination.

Disposition: RETAIN; TEST FIRST. Stage 6: R14; S6-009. Outstanding verification: Invalid/not-found/other-user ID and numeric/schema range. Deferred modernization: None.

### EF07 - Partially Conforming

CS-01/06/07/08; WA-FRONT-001, WA-SHARED-001, WA-DATA-001. 56 loads descriptions by encoded InOrOut and uses native option text; retains selected legacy value without hardcoding global list.63 adds text via one POST then reloads choices. Budget routes498-529 read globals plus current-user choices and insert with current UserID/IsSystemDescription=0. loadDescriptions catches internally, so add flow can close modal after a failed reload. No request-version protection on direction changes.

Local responsibility: In/Out filtering, custom choice creation and retained legacy description.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; application data correctness. Outstanding verification: Direction race, add-success/reload-failure and retained selection; no global list changes authorized. Deferred modernization: None.

### EF08 - Partially Conforming

CS-01/03/08; WA-PRESERVE-001, WA-SESSION-001, WA-SHARED-001. 64-76 preserve Budget recurrence rules locally.75 preview POST sent once, errors rendered as text; returned effective date can change form before Use Frequency by existing code. No verified WA-wide recurrence replacement; transport safety remains EF02.

Local responsibility: All recurrence rules/flags/date expansion stay Budget-local.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10 integration; arithmetic excluded. Outstanding verification: Concurrent preview/cancel and date/draft state; preserve existing flags and rule choices. Deferred modernization: None.

### EF09 - Confirmed Nonconformance

CS-07; WA-FRONT-001. 57 record rows are click-only with no keyboard alternative;32/36 close spans only click handlers63/76, no tabindex/key action.73/56/63 modal visibility lacks focus lifecycle;31 hides header table from accessibility tree while body table is separate. Native modal Cancel buttons remain keyboard reachable.

Local responsibility: Estimate source rows, Description and Frequency dialogs.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding verification: Existing-record keyboard edit, both dialogs, headings and screen-reader severity. Deferred modernization: None.

### EF10 - Conforming — source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 48 integer display is distinct from49/60 amount-ceiling save behavior. Keep financial/domain arithmetic local; no generic currency substitution justified.

Local responsibility: Integer display and Math.ceil saved amount business rule.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding verification: None. Deferred modernization: Optional display-only formatter reuse preserving saved amount ceiling.

### EF11 - Unverified

CS-09/10; WA-CACHE-001, WA-ENV-001. 52 registers unchanged root worker. Reuse bounded worker analysis: private APIs/auth headers bypass worker; missing local bday precache target may affect install if host also fails it.

Local responsibility: Root worker integration.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-024. Outstanding verification: Hosted precache/install/update/mixed-version behavior. Deferred modernization: None.

### EF12 - Conforming — source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 79-80 platform/tracker correctly ordered; business CRUD/description/preview remain local apiFetch, tracker actually uses shared request/restore. Exact shared hashes unchanged.

Local responsibility: Estimate page path; business adapter remains independent.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding verification: Page/time events across restore/expiry/logout/BFCache and asset versions. Deferred modernization: None.

## Evidence reconciliation

After frozen inventory/assessment, reconciled CLAUDE19/TechSummary global Description instruction (no list change proposed), S6-008/018 and unchanged helper hashes. Current descriptions producer498-529 examined narrowly in addition to reused generated Estimate CRUD67-73/395-495 and preview905-922 evidence. This page uses API-backed choices and user-specific inserts; no global values inferred or hard-coded. Shared browser T09/T10 and bounded past evidence remain distinct.

## Confirmed gaps and owner attention

Two confirmed candidate-level gaps: EF02 error/status/nested-object contract; EF09 keyboard/dialog/table-heading accessibility. Additional Description dropdown and recurrence/record races require bounded draft/data-state verification. API-backed global/current-user list and user-specific new-choice insertion are source-supported; no global-list change, database operation or unauthorized data access performed.

## Boundaries and evidence status

Conforming - source verified covers only explicitly named static properties, not complete runtime/application compliance. Confirmed Nonconformance identifies a demonstrated source departure from the cited approved requirement, not an executed exploit. Other implementation observations remain IMPLEMENTED-UNVERIFIED; governing obligations are APPROVED-POLICY. D04 error-shape and D08 storage/shared-transport modernization are staged migrations, not automatic vulnerability findings. Merely finding an equivalent helper is not a nonconformance.

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern preservation, authority and evidence. CS-03/05/07/08/09/10 apply as mapped per candidate. CS-04/06 server authorization/data invariants remain unverified beyond explicitly cited dependency observations. Family Tree/privacy/admin-transfer/TNNA/public-capability details are not applicable to these Budget page contracts. Full styling/formatting, financial calculations, schemas, unrelated backend routes and other pages are outside this functional review.

Existing R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS preserved and not repeated. November 15 handoff/register records later bounded T06/T11 results; earlier paused/pending snapshots remain historical. Actual shared-client T09 browser display and T10 unsaved-form browser evidence remain outstanding. Broader Stage 6 R16-R20 and independent implementation review retain priority.

Application tests/builds/probes: NOT RUN (prohibited). No network/service/database/deployment operations. Only new report/ZIP artifacts written in authorized Batch02 staging. No existing source/report/standards/register modified. No source replacement, .diff, installation or rollback package applies because no source is revised. Correction recommendations require separate owner authorization.
