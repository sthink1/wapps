# etfCategory ? shared-function review

Authorization: November 16 remaining-HTML assignment, Batch 1 only. Static local review; new report artifacts only. No source changes, application tests/builds, database access or service operations.

Source: httpdocs/etfCategory.html; SHA-256 73229745d2410e4ba9d55bd914b621bf9e1a3ab3c30b7b7d83d09731a5987845. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. Local source is primary per assignment; authoritative Drive identity/revision and deployed equivalence were not compared.

Governing approval: Core v1.0 and Detailed v0.4.1 approved November 12 per their approval headers/adoption records; historical DRAFT filenames retained. Decision Register v1.0 D01?D14 read with subsequent 3A?3C clarifications. Legacy prepare-only/status statements are historical, reconciled to November 15 evidence, not new authority. README Section 0, AGENTS.md, CLAUDE.md and TechSummary.md explicitly consulted. Tools were invoked to read instructions; no assumption of automatic shell/tool instruction ingestion.

## Frozen independent discovery

Inventory completed and saved: 2026-11-16T08:34:27.143078-05:00. Original count: 7. No post-reconciliation additions. Immutable original inventory is the sibling Frozen_Inventory.json; names, ranges, classifications, rationale and confidence below retain that original.

| ID | Function / block | Lines | Class | Purpose | Shared rationale | Existing implementation | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C01 | Token snapshot and direct business fetches | 129;168-175;193-195;240-247;268-273;288-289 | A | Attach auth credentials to category operations | Shared session/credential lifecycle | WA.session / WA.api.request | High |
| C02 | Response parsing and user-visible failures | 159-185;191-225;231-258;264-284 | A | Parse responses and classify operation failures | HTTP/network/JSON error semantics common across WA | WA.api.json / WA.ApiError | High |
| C03 | Shared input sanitization and category validation | 10-11;86;159-166;213;231-238 | C | Clean and validate editable free-text category | Free-text sanitizer reusable; category business rules local | DOMPurify; httpdocs/js/inputSanitizer.js | High |
| C04 | escapeHtml and category-row rendering | 122-126;204-224 | C | Render editable API-backed categories safely | Output context safety reusable; category row schema local | Native DOM text/value APIs; WASanitize plainText distinct from output encoding | High |
| C05 | Save/update/delete draft lifecycle | 159-185;231-284 | C | Submit mutations and retain editing state | No uncertain replay and failed-save state handling common | WA.api.request only after preserving category CRUD contract | High |
| C06 | showInput / showList / goBack / clearInput | 135-153 | C | Navigate editor/list and clear explicitly | Navigation/form lifecycle common; category section IDs local | Native location; no shared navigation helper required | High |
| C07 | Platform / usage tracking integration | 288-289 | A | Shared session-aware page/time tracking | Project-wide tracking lifecycle | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | High |

B-only exclusions / responsibilities remaining local: B-only: per-user category CRUD, nonempty category rule, category ID endpoint construction, revise/delete checkbox interaction remain local; broad CSS/format review excluded.

## Assessment

### C01 ? Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 129 captures token once; four business fetches use snapshot. 288-289 only wire shared tracker, do not convert CRUD. No automatic replay in page. No authorization bypass inferred from visible Input/List controls.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018. Outstanding: Expiry, restoration, logout/account-switch; stale/late responses. Deferred modernization: Legacy transport and D08 architecture phased migration.

### C02 ? Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. All four functions await fetch/json with no try/catch. HTTP errors have only response.ok branch and data.message; no 401/403/503/network/abort distinction or controlled non-JSON fallback. Network/parse rejections escape onclick/showList handlers without user-facing failure path. Missing shared API alone is not the finding.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018. Outstanding: Browser HTTP/network/non-JSON/abort matrix with approved safe stimuli. Deferred modernization: None.

### C03 ? Conforming ? source verified

CS-07/09; WA-FRONT-001. 10-11 load DOMPurify/shared sanitizer. Delegated blur/change/keydown and capture button handlers cover matching category free-text inputs, including dynamically inserted text input 213; save/update also trim and reject empty values. No generic sanitizer applied to passwords or numeric controls here.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; R17. Outstanding: External script failure and keyboard/checkbox edit interactions; actual sanitization not browser-tested. Deferred modernization: None.

### C04 ? Partially Conforming

CS-07/09; WA-FRONT-001. 122-126 escape ampersand, angle brackets and both quotes; applied to category value in double-quoted input attribute 213. Numeric IDs interpolate in id/inline JS at 213/216/219 without local validation; backend source selects category IDs, exact current schema/type not verified. No demonstrated injectable category string in this escaped value.

Disposition: RETAIN; TEST FIRST. Stage 6: Safety review; no demonstrated XSS. Outstanding: Strict numeric ID producer contract and editable row accessible names/keyboard behavior. Deferred modernization: Optional shared context-aware renderer; no drop-in plainText replacement.

### C05 ? Confirmed Nonconformance

CS-03; WA-SESSION-001. POST clears only on success (179-181), mutations each send once. However updateCategory unconditionally reloads categories at 257 after both success/error; successful following GET rebuilds tbody 204-224 from persisted values, overwriting rejected unsaved inline edit. This is a source-reachable draft-loss path, not observed runtime data loss. DELETE reload may also discard other row edits.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding: Rejected update followed by successful GET and multiple edited rows; ambiguous delivery must not trigger automatic mutation replay. Deferred modernization: None.

### C06 ? Conforming ? source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 135-153 toggle explicit page sections, fixed etf.html back target, and clear only on explicit call or POST success. Category UI IDs and interactions remain local.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding: None. Deferred modernization: None.

### C07 ? Conforming ? source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 288 platform before 289 tracker; current helper SHA-256 unchanged and reused; tracking invokes shared API while CRUD does not. No repeated shared-root defect added.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding: Exact page/time lifecycle, expiry/logout/account-switch and mixed cached assets. Deferred modernization: None.

## Reconciliation and owner attention

Seven independent candidates frozen before producer/register reconciliation. Category routes/etf.js 91-205 expose legacy message strings, validation and user-scoped parameterized statements; the page message-only reader is compatible with these inspected producers but not certified for central/authorization errors. server.js 186 entitlement/auth mount remains; no DB or route-wide authorization acceptance inferred. Shared modules rehashed unchanged. Register allows measured legacy transport migration, not ignoring draft preservation or failure UX. Prior bounded R10/R14/R15 and later T12 remain preserved.

Owner attention: C02 uncontrolled network/parse rejection and missing failure categories; C05 rejected-update refresh can overwrite drafts. These are mandatory session/form contract corrections needing separately approved scope and browser verification, not optional helper deduplication. Optional rendering reuse is deferred independently.

## Scope and limitations

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern this read-only report process. CS-03/05/07/08/09/10 apply to session, errors, rendering and integration as identified per candidate. CS-04/06 and WA-API-001/WA-DATA-001 server authorization/data claims remain unverified unless a narrowly inspected producer is explicitly cited. Family Tree/admin-transfer/native/public-capability clauses are not applicable to this ETF page review. Styling and unrelated application calculations excluded. No revised source, .diff, installation or rollback package is applicable. No functionality or appearance change authorized.

All assessments are IMPLEMENTED-UNVERIFIED except explicitly bounded source properties; approved policies are APPROVED-POLICY. Confirmed Nonconformance means a demonstrated static requirement departure, not an executed exploit. Source-verified conforming labels cover only named source properties. D04/D08 migrations are not automatically security defects. No global compliance or release certification.

Preserve R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS. No completed tests repeated. R16-75 T09 shared-client browser display and T10 unsaved-form browser checks remain open per November 15 handoff. Stage 6 R16?R20 and independent review retain priority; deferred modernization does not defer mandatory safety findings.
