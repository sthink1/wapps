# etfSymbol ? shared-function review

Authorization: November 16 remaining-HTML assignment, Batch 1 only. Static local review; new report artifacts only. No source changes, application tests/builds, database access or service operations.

Source: httpdocs/etfSymbol.html; SHA-256 b7d8503a913552280b3203bf9a3728ed567215f030d4d8fc2cc588bd7ec66fd5. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. Local source is primary per assignment; authoritative Drive identity/revision and deployed equivalence were not compared.

Governing approval: Core v1.0 and Detailed v0.4.1 approved November 12 per their approval headers/adoption records; historical DRAFT filenames retained. Decision Register v1.0 D01?D14 read with subsequent 3A?3C clarifications. Legacy prepare-only/status statements are historical, reconciled to November 15 evidence, not new authority. README Section 0, AGENTS.md, CLAUDE.md and TechSummary.md explicitly consulted. Tools were invoked to read instructions; no assumption of automatic shell/tool instruction ingestion.

## Frozen independent discovery

Inventory completed and saved: 2026-11-16T08:35:51.437451-05:00. Original count: 8. No post-reconciliation additions. Immutable original inventory is the sibling Frozen_Inventory.json; names, ranges, classifications, rationale and confidence below retain that original.

| ID | Function / block | Lines | Class | Purpose | Shared rationale | Existing implementation | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S01 | Token snapshot and category/symbol fetches | 143;179-181;233-240;265-267;342-349;373-376;395-396 | A | Attach credentials to authenticated reads and writes | Session identity, refresh and current credentials common | WA.session / WA.api.request | High |
| S02 | HTTP/network/JSON failure handling | 177-187;231-255;263-273;333-391 | A | Classify request failures and communicate safely | Cross-WA error semantics and reliable UI completion | WA.api.json / WA.ApiError | High |
| S03 | Shared input sanitation and symbol normalization | 10-11;92;219-227 | C | Sanitize and validate symbol input | Shared free-text defense; uppercase/nonempty symbol rules local | DOMPurify; httpdocs/js/inputSanitizer.js | High |
| S04 | escapeHtml / renderTable / category option output | 136-140;194-212;279-312 | C | Safely render API records and editable selections | Safe output reusable; symbol/category/date schema local | Native option.text / textContent; no universal shared table helper identified | High |
| S05 | Mutation lifecycle and draft selections | 219-255;333-391 | C | Save/reclassify/delete without replay or draft loss | Mutation uncertainty and draft preservation common | WA.api.request compatible after contract review | High |
| S06 | Concurrent category/symbol loading and filter state | 151-162;177-213;263-277;301-310;319-327 | C | Load dependent data before constructing row selectors | Async dependency ordering reusable; ETF category joins local | Promise sequencing/native selectors; no existing shared coordinator identified | High |
| S07 | View/back/clear controls | 151-171 | C | Navigate views and explicitly clear symbol input | Generic navigation/form lifecycle; page IDs local | Native location; no new shared helper required | High |
| S08 | Platform and usage tracking integration | 395-396 | A | Record authenticated page/foreground usage | Cross-WA tracking lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | High |

B-only exclusions / responsibilities remaining local: B-only: symbol sort/filter, per-user symbol/category relationships, provider symbol validation, category reassignment and seven-year/inventory deletion business rules remain local. General CSS/formatting excluded.

## Assessment

### S01 ? Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 143 captures token once; five direct business fetch sites retain it. Shared scripts 395-396 supply tracker only. No automatic retry/replay logic in those business paths.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018. Outstanding: Expiry/restoration/logout/account-switch, stale-response identity. Deferred modernization: Legacy shared transport adoption and D08 storage design.

### S02 ? Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. POST save catches all exceptions with fixed service-unavailable text (252-255), other GET/PUT/DELETE fetch/json operations have no catch/finally. HTTP paths only distinguish response.ok and data.message; 401/403/503 categories not handled distinctly. Network/JSON rejection in delegated async click handler bypasses checkbox reset 360/389.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018. Outstanding: Controlled failure/status/abort/non-JSON matrix and checkbox state; no runtime test performed. Deferred modernization: None.

### S03 ? Conforming ? source verified

CS-07/09; WA-FRONT-001. 10-11 load DOMPurify/shared sanitizer before editing. Delegated input capture events clean symbol text before normal Save; 221 trims/uppercases and 224 rejects empty. Category choices typed select; generic free-text sanitation not required for select values.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding: Script availability and Enter/click sanitation in supported browsers. Deferred modernization: None.

### S04 ? Partially Conforming

CS-07/09; WA-FRONT-001. 136-140 encode all five HTML metacharacters; 292-293 escape symbol/provider name; native option.text used for categories 199/209/305. Raw date substring and IDs appear 290/294-296, requiring strict producer type verification. Category selects 89/105 and dynamic row controls have no explicit labels; accessible naming requires bounded browser assessment.

Disposition: RETAIN; TEST FIRST. Stage 6: Safety/accessibility triage. Outstanding: Date/ID types, malformed provider data and accessible names; no demonstrated XSS. Deferred modernization: Optional shared output-context helper; preserve ETF columns.

### S05 ? Confirmed Nonconformance

CS-03/06; WA-SESSION-001, WA-DATA-001. POST clears only on success, PUT error retains selected category. DELETE error path nevertheless calls loadSymbols at 386; successful following GET rebuilds every row and selected category from server values at 275-310, discarding unsaved reclassification choices. All mutations send once; no automatic replay observed in source.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding: Rejected delete while another row has unsaved category selection; ambiguous delivery and duplicate user clicks. Deferred modernization: None.

### S06 ? Unverified

CS-01/08; WA-SHARED-001, WA-PRESERVE-001. showList fires loadCategories(true) and loadSymbols independently at 160-161, without await. renderTable populates row selects from categories at 302 while loadCategories completion updates only top dropdown/filter. If symbols return first on a fresh categories=[] state, empty row selectors can persist until rerender. Source race condition identified; response ordering/browser manifestation not executed.

Disposition: TEST FIRST. Stage 6: Page correctness; deferred standardization unless release risk confirmed. Outstanding: Controlled reversed response order; category filter/state persistence; preserve ETF selectors. Deferred modernization: Optional async dependency coordinator after bounded test.

### S07 ? Conforming ? source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 151-171 explicitly toggle views, goBack uses fixed etf.html and clearForm clears symbol/message. No generic navigation abstraction required.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding: None. Deferred modernization: None.

### S08 ? Conforming ? source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 395 platform precedes 396 tracker. Exact shared hashes unchanged, evidence reused; actual shared API usage is in tracker, not symbol requests.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding: Exact usage counts across restore/expiry/logout/BFCache and mixed assets. Deferred modernization: None.

## Reconciliation and owner attention

Eight candidates frozen before symbol producer/register review. routes/etf.js 208-381 preserves message-shaped outcomes, user-scoped symbol reads/updates and inventory/recent-sale deletion restrictions. Existing shared module SHA-256 unchanged. No prior new-file report was used as a discovery checklist. Page-local repeated failure patterns are separate call sites, not new shared-module defects. No full DB schema, provider behavior or all middleware acceptance inferred.

Owner attention: S02 failure categorization/unhandled rejection and S05 failed-delete reload losing other draft selections require scoped correction. S06 dependent-loading race needs verification. Additional narrowly observed integration concern: POST symbol (211/254-256) and PUT symbol (291/303-304) validate category ID as integer and scope symbol row to user, but no target-category ownership check is visible in these handlers. Cross-user category association protection through remaining layers/schema is UNVERIFIED (CS-04/06, WA-API-001/WA-DATA-001; R14/S6-009). Seek owner safety disposition/targeted review before release; no unauthorized association demonstrated or attempted. This dependency observation is not an additional independent HTML candidate and is not included in page confirmed-gap counts.

## Scope and limitations

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern this read-only report process. CS-03/05/07/08/09/10 apply to session, errors, rendering and integration as identified per candidate. CS-04/06 and WA-API-001/WA-DATA-001 server authorization/data claims remain unverified unless a narrowly inspected producer is explicitly cited. Family Tree/admin-transfer/native/public-capability clauses are not applicable to this ETF page review. Styling and unrelated application calculations excluded. No revised source, .diff, installation or rollback package is applicable. No functionality or appearance change authorized.

All assessments are IMPLEMENTED-UNVERIFIED except explicitly bounded source properties; approved policies are APPROVED-POLICY. Confirmed Nonconformance means a demonstrated static requirement departure, not an executed exploit. Source-verified conforming labels cover only named source properties. D04/D08 migrations are not automatically security defects. No global compliance or release certification.

Preserve R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS. No completed tests repeated. R16-75 T09 shared-client browser display and T10 unsaved-form browser checks remain open per November 15 handoff. Stage 6 R16?R20 and independent review retain priority; deferred modernization does not defer mandatory safety findings.
