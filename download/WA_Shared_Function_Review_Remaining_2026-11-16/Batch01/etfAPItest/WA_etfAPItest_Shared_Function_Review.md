# etfAPItest ? shared-function review

Authorization: November 16 remaining-HTML assignment, Batch 1 only. Static local review; new report artifacts only. No source changes, application tests/builds, database access or service operations.

Source: httpdocs/etfAPItest.html; SHA-256 8340263ca47717d7f147cbd60a7eadac79ce6e65fec9690e1e25666563ae0964. Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. Local source is primary per assignment; authoritative Drive identity/revision and deployed equivalence were not compared.

Governing approval: Core v1.0 and Detailed v0.4.1 approved November 12 per their approval headers/adoption records; historical DRAFT filenames retained. Decision Register v1.0 D01?D14 read with subsequent 3A?3C clarifications. Legacy prepare-only/status statements are historical, reconciled to November 15 evidence, not new authority. README Section 0, AGENTS.md, CLAUDE.md and TechSummary.md explicitly consulted. Tools were invoked to read instructions; no assumption of automatic shell/tool instruction ingestion.

## Frozen independent discovery

Inventory completed and saved: 2026-11-16T08:32:26.872039-05:00. Original count: 10. No post-reconciliation additions. Immutable original inventory is the sibling Frozen_Inventory.json; names, ranges, classifications, rationale and confidence below retain that original.

| ID | Function / block | Lines | Class | Purpose | Shared rationale | Existing implementation | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T01 | lookupSymbol / fetchTiingoRange / fetchFinnhub credentials | 601-650;1004-1005 | A | Send authenticated same-origin reads | Credential restoration/current identity common across WA | WA.session; WA.api.request | High |
| T02 | HTTP response/error decoding | 606-609;623-628;646-648;777-780;899-901 | A | Translate transport and HTTP failures | Status categories and bounded error decoding are common | WA.api.json / WA.ApiError | High |
| T03 | Symbol input normalization/sanitization | 429-431;869-871;921;540;1004-1005 | C | Normalize entered symbol and protect free-text boundary | Mandatory shared plain-text input handling; symbol validation remains local | httpdocs/js/inputSanitizer.js with DOMPurify | High |
| T04 | today / toDateStr / parseDate / fmtDisplay and calendar integration | 552-595 | C | Represent dates without UTC conversion and use market calendar | Date-only contracts reusable; trading anchors/list-date logic local | httpdocs/js/holidays.js actual isMarketClosed calls 573/578 | High |
| T05 | setCell / HTML formatters and metadata rendering | 687-717;734-752;824-825;883-895;972 | C | Render data/results and status metadata | Safe output context reusable; numeric financial display local | Native textContent; no universal shared HTML formatter identified | High |
| T06 | showStatus / progress helpers and calculate busy state | 658-685;869-905 | C | Communicate progress and operation failure | Busy/error lifecycle reusable; provider count and labels local | No shared status component identified | High |
| T07 | Prompt modal open/close controls | 528-538;970-978 | C | Present generated summary in dialog | Dialog keyboard/focus lifecycle project-wide | No shared dialog implementation identified | High |
| T08 | Summary export / clipboard / print | 913-968;980-1001 | C | Extract plain text and export it | Clipboard/print failure handling reusable; ETF summary schema local | Browser clipboard/window APIs; no equivalent shared exporter identified | High |
| T09 | Console diagnostics | 789;899-901 | A | Record provider/calculation failures | Secret-free diagnostics policy common across WA | usageTracking fixed diagnostic pattern (related, not drop-in logger) | High |
| T10 | Platform and usage-tracking integration | 1004-1005 | A | Track page and foreground duration | Shared usage lifecycle across WA | httpdocs/js/waPlatform.js; httpdocs/js/usageTracking.js | High |

B-only exclusions / responsibilities remaining local: B-only: return/annualization arithmetic, list-date and market-open decisions, price source precedence, six-year range, table/summary schema remain ETF-specific. Presentation choices and broad CSS review excluded. Fixed Back anchor etf.html is simple navigation, recorded as no abstraction requirement.

## Assessment

### T01 ? Approved Migration Pending

CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D08. 602/618/641 read token per business request rather than one page snapshot; fetch remains independent of WA.api. Requests are same-origin through BASE_URL and encoded query values, all GET. No browser provider secret is requested; current lookup/Finnhub/Tiingo use local backend.

Disposition: MIGRATE LATER; TEST FIRST. Stage 6: S6-005/008/018. Outstanding: Missing/expired token, restore, logout/account switch and staged browser asset identity. Deferred modernization: Measured WA.api adoption and D08 architecture remain pending.

### T02 ? Confirmed Nonconformance

CS-03/05; WA-SESSION-001, WA-API-002. 606 and 646 collapse every non-ok response into a plain fixed Error with no status/code; 623-625 embeds raw response text and status in string, not structured categories. 777-780 shows Tiingo error; Finnhub failures 788-791 trigger price fallback without distinct auth/permission/unavailable handling. Current Finnhub producer can return 400/404/503/502 (routes/etf.js 631-652). This establishes category loss, not secret disclosure.

Disposition: CORRECT; TEST FIRST. Stage 6: R16 T09; S6-008/018/033. Outstanding: 401/403/503, non-JSON, nested/flat compatibility and domain fallback preservation. Deferred modernization: None.

### T03 ? Confirmed Nonconformance

CS-07/09; WA-FRONT-001. 9-10 load DOMPurify and shared sanitizer; capture keydown/click/blur/change handlers actually sanitize matching symbol input before calculate. trim/uppercase alone is not sanitizer. Separate observed accessibility gap: label 429 lacks for, input 430 has no aria-label/aria-labelledby and is not nested by label. Placeholder does not programmatically associate the visible Symbol label.

Disposition: CORRECT; TEST FIRST. Stage 6: Mandatory accessibility triage; sanitizer is source-integrated. Outstanding: Verify accessible name/keyboard flow; external DOMPurify loading/failure and Enter/click behavior. Deferred modernization: None.

### T04 ? Conforming ? source verified

CS-01/06/08; WA-PRESERVE-001, WA-DATA-001, WA-SHARED-001. 554-560 format/parse local calendar components; isMarketClosed imported at 540 is actually called 573/578. Exact domain trading/date results are excluded; no assumption current holiday table is externally validated.

Disposition: RETAIN; TEST FIRST. Stage 6: Deferred standardization. Outstanding: Timezone/date-only boundary and calendar dependency; market-calendar accuracy excluded. Deferred modernization: Optional generic date formatter reuse; preserve market anchors.

### T05 ? Conforming ? source verified

CS-07/09; WA-FRONT-001. setCell innerHTML 689 receives fixed snippets, Number/parseFloat-derived formatters, numeric date component strings and literal Finnhub/Tiingo tags at inspected call sites; symbol/name/status/summary use textContent at 678/883-884/972. apiTag is not a generic safe arbitrary-string renderer, but current callers use fixed names.

Disposition: RETAIN; TEST FIRST. Stage 6: Frontend safety; no demonstrated XSS. Outstanding: Malformed provider types, non-finite values and actual DOM integration; new apiTag callers must remain bounded. Deferred modernization: None.

### T06 ? Partially Conforming

CS-01/07/08; WA-FRONT-001, WA-SHARED-001. showStatus/progress use textContent and explicit type classes; calculate disables button then re-enables in finally. Input Enter still directly calls calculate 431; no complete in-flight guard or live-region semantics claimed. TOTAL_CALLS=2 is domain-specific even when one call is skipped.

Disposition: RETAIN; TEST FIRST. Stage 6: S6-018; R17. Outstanding: Rapid Enter/reentrancy, progress on failures and accessible status announcement. Deferred modernization: Optional shared status/busy helper; preserve provider semantics.

### T07 ? Confirmed Nonconformance

CS-07; WA-FRONT-001. 531 mouse-only close span lacks keyboard handler/tabindex; modal open/close 970-978 only toggles display, no focus lifecycle. Separate native Close button at 536 remains keyboard-operable; narrow confirmed gap is the X affordance. No broad claim all summary interaction is inaccessible.

Disposition: CORRECT; TEST FIRST; OWNER DECISION. Stage 6: Mandatory accessibility triage. Outstanding: Keyboard/focus/screen-reader severity and approved scope. Deferred modernization: None.

### T08 ? Partially Conforming

CS-01/07/08; WA-FRONT-001, WA-SHARED-001. extractCellValue uses textContent; clipboard writes text with failure alert; printPrompt escapes literal angle brackets before document.write. window.open null result not checked before dereferencing printWindow. ETF headings/schema stay local. No clipboard/print action executed.

Disposition: TEST FIRST. Stage 6: Deferred standardization / browser R17. Outstanding: Popup blocked/closed, clipboard denied/unavailable, entity/text fidelity and printing; do not claim actual failure reproduced. Deferred modernization: Optional shared export lifecycle after domain contract preservation.

### T09 ? Partially Conforming

CS-09; WA-LOG-001. 789 logs caught Finnhub Error and 901 logs full caught Error; 625 includes full Tiingo error response text that may reach catch 901 through other failure paths. Inspected server proxy catch emits fixed generic text 673 and Finnhub helper throws fixed text. No token/API key/secret observed in page source logging arguments. This is a diagnostic-surface review requirement, not demonstrated credential leakage.

Disposition: TEST FIRST; OWNER DECISION. Stage 6: R16; S6-030/041. Outstanding: Synthetic sanitized-error/body diagnostic check in separately authorized environment; bound messages and log retention. Deferred modernization: None.

### T10 ? Conforming ? source verified

CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001. 1004-1005 ordered scripts; unchanged shared hashes reused. Actual WA.api/restore consumption belongs to tracker, not the three business fetch helpers.

Disposition: RETAIN; TEST FIRST. Stage 6: R15; S6-025; R16/R17. Outstanding: Exact lifecycle/account-switch/expiry tracking and mixed assets. Deferred modernization: None.

## Reconciliation and owner attention

Original ten candidates frozen before register reconciliation. Existing helper evidence reused after exact SHA-256 checks for platform, tracker, sanitizer and calendar. Current routes/etf.js 625-627 retires /config; 630-654 makes Finnhub server-side with finite positive price checks, fixed public failure messages and no keys returned. Historical config-disclosure warning is superseded for this local code path, without asserting deployed/Drive equivalence. Backend proxy safety/deadline/schema breadth remains outside scope. Register and November 15 handoff retain open shared-browser T09/T10 while preserving T12 90/90.

Three candidate-level confirmed source gaps: T02 lost HTTP category, T03 unassociated Symbol label, T07 mouse-only close affordance. T09 broad caught-error diagnostics and T08 blocked-popup handling need scoped verification/owner triage; no actual secret disclosure or exploit established. Source sanitizer is present and actually connected through capture events, so no missing-sanitizer finding is made. No provider/network calls performed.

## Scope and limitations

CS-01/02/11/12 and WA-PRESERVE-001/WA-REVIEW-001 govern this read-only report process. CS-03/05/07/08/09/10 apply to session, errors, rendering and integration as identified per candidate. CS-04/06 and WA-API-001/WA-DATA-001 server authorization/data claims remain unverified unless a narrowly inspected producer is explicitly cited. Family Tree/admin-transfer/native/public-capability clauses are not applicable to this ETF page review. Styling and unrelated application calculations excluded. No revised source, .diff, installation or rollback package is applicable. No functionality or appearance change authorized.

All assessments are IMPLEMENTED-UNVERIFIED except explicitly bounded source properties; approved policies are APPROVED-POLICY. Confirmed Nonconformance means a demonstrated static requirement departure, not an executed exploit. Source-verified conforming labels cover only named source properties. D04/D08 migrations are not automatically security defects. No global compliance or release certification.

Preserve R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS. No completed tests repeated. R16-75 T09 shared-client browser display and T10 unsaved-form browser checks remain open per November 15 handoff. Stage 6 R16?R20 and independent review retain priority; deferred modernization does not defer mandatory safety findings.
