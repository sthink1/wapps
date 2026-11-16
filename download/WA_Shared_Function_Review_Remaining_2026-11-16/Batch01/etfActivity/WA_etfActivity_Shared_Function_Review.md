# etfActivity ? shared-function review

Authorization: November 16 remaining-HTML assignment, Batch 1 only. Static local review; new report artifacts only. No source changes, application tests/builds, database access or service operations.

Source: httpdocs/etfActivity.html; SHA-256 195552dd1bea02778a0881e620036978adb92145a16709a797b755d5f2263fc7. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. Local source is primary per assignment; authoritative Drive identity/revision and deployed equivalence were not compared.

Governing approval: Core v1.0 and Detailed v0.4.1 approved November 12 per their approval headers/adoption records; historical DRAFT filenames retained. Decision Register v1.0 D01?D14 read with subsequent 3A?3C clarifications. Legacy prepare-only/status statements are historical, reconciled to November 15 evidence, not new authority. README Section 0, AGENTS.md, CLAUDE.md and TechSummary.md explicitly consulted. Tools were invoked to read instructions; no assumption of automatic shell/tool instruction ingestion.

## Frozen independent discovery

Inventory completed and saved: 2026-11-16T08:30:42.421653-05:00. Original count: 9. No post-reconciliation additions. Immutable original inventory is the sibling Frozen_Inventory.json; names, ranges, classifications, rationale and confidence below retain that original.

| ID | Function / block | Lines | Class | Purpose | Shared rationale | Existing implementation | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A01 | Token snapshot and authenticated transport | 386-402;1194-1195 | A | Attach credentials to business requests | Session identity and credential lifetime common across WA | WA.session / WA.api.request in httpdocs/js/waPlatform.js | High |
| A02 | fetchWithAuth response parsing and caller errors | 390-402;528-531;578-581;769-772;905-908;935-938;1067-1069;1162-1165 | A | Decode response/errors and preserve failure meaning | HTTP/transport categories and error compatibility are project-wide | WA.api.json / WA.ApiError | High |
| A03 | fmt / fmtCurrency / fmtShares | 406-426 | C | Format numeric and currency display | Numeric presentation reusable; ETF share precision stays local | No equivalent shared formatter identified | High |
| A04 | escHtml and report / transaction rendering | 639-773;783-909;1003-1058;1170-1177 | C | Render API-backed report fields safely | Safe DOM output is global; report columns/grouping remain ETF | DOM textContent; WASanitize.plainText is input/plain-text helper, not universal context encoder | High |
| A05 | loadCategories / loadSymbolsForCategory / search dropdowns | 441-475;941-965 | C | Populate dependent selectors | Reusable async selector loading and safe labels; ETF endpoints stay local | WA.api for transport; native option.textContent | High |
| A06 | saveBuy / saveSell / saveEdit / deleteTx and form state | 479-591;1061-1070;1116-1166 | C | Validate and submit mutations while handling draft state | No-replay, error handling and preserving unsaved edits common; trade contracts local | WA.api.request compatible only after preserving existing contracts | High |
| A07 | openEditModal / closeEditModal and dialog controls | 333-371;1074-1106 | C | Open, populate and close edit UI | Accessible dialog/focus lifecycle reusable; transaction fields local | No shared dialog implementation identified | High |
| A08 | showSection / goBack / print / initial inventory selection | 252;282;325;430-437;1181-1191 | C | Navigate sections and invoke print | Back navigation and browser print common; ETF sections local | Native location / window.print; no shared navigation helper required | High |
| A09 | Platform and usage-tracking integration | 1194-1195 | A | Shared session-aware usage logging | Project-wide lifecycle recording | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | High |

B-only exclusions / responsibilities remaining local: B-only: stock-split rules, buy/sell arithmetic, inventory cost/value and realized-gain grouping, transaction filters and ETF query contracts remain local. holidays.js imported at 382 but no isHoliday/isMarketClosed call in page; domain calendar data not a WA-wide session/helper adoption claim. Presentation CSS excluded.

## Assessment

### A01 ? Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 386 captures token once; 390-402 attaches it on all business calls. Shared scripts at 1194-1195 do not replace this helper or global fetch. No automatic replay in helper; no claim of observed stale-user access.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018. Outstanding: Expiry/restoration, logout/account switch and late response identity on this page. Deferred modernization: Legacy transport and D08 storage architecture; approved staged migration.

### A02 ? Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 399 requires JSON before inspecting status; 400 throws plain Error(data.message || fallback), losing status/code; catches display err.message. Thus caller cannot reliably distinguish server 401/403/503 categories. Flat/nested error-only bodies degrade to fallback, not proven current producer mismatch.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09/T10; S6-008/018/033. Outstanding: Controlled status/non-JSON/cancellation matrix and preserved unsaved edits; no tests executed. Deferred modernization: None.

### A03 ? Conforming ? source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. 406-426 guard null/undefined/NaN and use explicit locale and precision. Narrow property only; retaining ETF six-decimal shares is required. No approved universal formatting helper identified.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding: None. Deferred modernization: Optional shared numeric-format contract after inventory; no urgent correction.

### A04 ? Partially Conforming

CS-07/09; WA-FRONT-001. Category/symbol/name escaped by escHtml at 678/712-713/837/861-862/1042-1043; options use textContent. Raw date, TransactionType and numeric-ID substitutions remain at 863/1041/1044-1051; schema/producer type and reachability not fully verified. Unused rowData 1030-1039 does not protect actual row handlers. escHtml covers double-quoted/text contexts, not a generic single-quoted/JS encoder.

Disposition: TEST FIRST. Stage 6: Safety review; not proof of R16 failure. Outstanding: Verify all raw fields are strictly typed/allowlisted, DOM context and numeric/enum producer guarantees before claiming unsafe reachability. Deferred modernization: Optional shared context-specific rendering; retain ETF report layouts.

### A05 ? Conforming ? source verified

CS-07/08; WA-FRONT-001, WA-SHARED-001. 447-450/467-470/948-950/960-962 create option nodes and textContent labels. 445/465 use legacy helper. No duplicated shared selector module established.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-005/018. Outstanding: Rapid category changes / out-of-order responses and legacy HTTP failures. Deferred modernization: None.

### A06 ? Partially Conforming

CS-03/06; WA-SESSION-001, WA-DATA-001. POST buy/sell, PUT edit and DELETE are sent once (514/565/1064/1152); buy/sell clear only after helper success; edit closes only on success timeout. Catch paths leave inputs. No explicit ambiguous-delivery UX or double-click guard claimed. Essential numeric/trade validation remains local.

Disposition: RETAIN; TEST FIRST. Stage 6: R16 T10; S6-008/018. Outstanding: Real browser failed-save drafts and uncertain delivery; no automatic reconnect resend; server authorization/integrity not certified. Deferred modernization: None.

### A07 ? Confirmed Nonconformance

CS-07; WA-FRONT-001. 336 declares clickable close span with no tabindex, role or keyboard handler; open/close 1074-1106 only toggle display/populate fields, with no focus lifecycle. Confirmed narrow gap: close affordance itself is not keyboard-operable. Cancel button 369 is separately keyboard reachable; no claim entire dialog is inaccessible.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage; broader standardization after Stage 6. Outstanding: Keyboard/focus/screen-reader severity and approved preservation-compatible scope. Deferred modernization: None.

### A08 ? Conforming ? source verified

CS-01/08; WA-PRESERVE-001, WA-SHARED-001. goBack uses fixed ETF destination, showSection local IDs; window.print used at 252/282/325. Inventory query accepts only exact inventory value. Domain section IDs and print styles remain local.

Disposition: RETAIN. Stage 6: Deferred standardization. Outstanding: None. Deferred modernization: None.

### A09 ? Conforming ? source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 1194 precedes tracker 1195. Unchanged shared hashes reused; tracker calls shared request/restore, business fetch remains independent. Shared tracker no-replay and current-token exit behavior source verified only.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding: Page-specific event counts, expiry/logout/BFCache and stale asset matrix. Deferred modernization: None.

## Reconciliation and owner attention

Frozen nine-candidate inventory saved before consulting compliance register or backend evidence for this file. WA-CF-002 describes a related etfCompare snapshot pattern, not a new inventory checklist. WA-CF-005/006 and R15-49B distinguish tracker integration from business adoption. Current routes/etf.js 625-627 returns HTTP 410 from retired /config; older README_R16_ETF_HTTP_Error key-disclosure warning is historical, not a current exposure claim. server.js 186 mounts authentication and ETF entitlement middleware; selected category/symbol/transaction routes show user-scoped SQL and generic catches. Full endpoint/schema audit excluded.

Owner attention: A02 status-loss error contract requires scoped correction/review; A07 keyboard-close/focus concerns require accessibility disposition. A04 raw typed-field rendering is unverified, not counted as a demonstrated XSS vulnerability. No exploit, service request or database read performed. No repeated defects counted merely for using shared tracker.

## Scope and limitations

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern this read-only report process. CS-03/05/07/08/09/10 apply to session, errors, rendering and integration as identified per candidate. CS-04/06 and WA-API-001/WA-DATA-001 server authorization/data claims remain unverified unless a narrowly inspected producer is explicitly cited. Family Tree/admin-transfer/native/public-capability clauses are not applicable to this ETF page review. Styling and unrelated application calculations excluded. No revised source, .diff, installation or rollback package is applicable. No functionality or appearance change authorized.

All assessments are IMPLEMENTED-UNVERIFIED except explicitly bounded source properties; approved policies are APPROVED-POLICY. Confirmed Nonconformance means a demonstrated static requirement departure, not an executed exploit. Source-verified conforming labels cover only named source properties. D04/D08 migrations are not automatically security defects. No global compliance or release certification.

Preserve R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS. No completed tests repeated. R16-75 T09 shared-client browser display and T10 unsaved-form browser checks remain open per November 15 handoff. Stage 6 R16?R20 and independent review retain priority; deferred modernization does not defer mandatory safety findings.
