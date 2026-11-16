# etfCompare — independent shared-function review

## Frozen Phase A inventory

Source: httpdocs/etfCompare.html;769 lines;28,177 bytes.
SHA-256: 091276709EF6E13761A7668A9DC2E3D49483AD758A00CA2596FCBEBD7D29977B.
Local branch reviseLogIn; Git HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c.

Independent candidate count: **10**.
A=project-wide; B=application-specific; C=mixed. This inventory was saved before compliance assessment and before reading prior ETF examination/testing reports. The shared-delegation column here is discovery-stage observation from the target's call sites/references, not module conformance certification.

### ETF-S01 — Page-level token snapshot and business-request credential lifecycle

- Lines: 227;275-280;307-324
- Classification: A; confidence: High
- Purpose: Captures the localStorage bearer once for business requests and initializes page activity.
- Sharing rationale: Common authentication/current-identity and session-restoration responsibility across protected apps.
- Application-specific responsibilities: Category population and trading-date startup must remain ETF-specific.
- Existing shared delegation observed: WA facade is loaded at766; inline business calls do not reference its session API.

### ETF-S02 — fetchWithAuth and request-failure reporting

- Lines: 275-280;232-245;285-303;406-424
- Classification: C; confidence: High
- Purpose: Performs authenticated GETs, rejects non-success responses, parses JSON and reports failures.
- Sharing rationale: WA-wide HTTP/error classification, compatibility and safe diagnostics.
- Application-specific responsibilities: ETF endpoints, inventory fallback, category/data alerts.
- Existing shared delegation observed: Local direct fetch; shared WA.api script loaded but not called by this adapter.

### ETF-S03 — Calendar-date conversion and trading-day adapter

- Lines: 251-271;307-320;492-500;216
- Classification: C; confidence: Medium
- Purpose: Formats/parses calendar dates, adjusts to market-open day and displays listing dates.
- Sharing rationale: Calendar-date semantics and presentation may be shared; market calendar is already a related reusable dependency.
- Application-specific responsibilities: Trading closures, current/one-year reference dates and LISTED presentation.
- Existing shared delegation observed: Trading-day helpers imported from js/holidays.js; local date conversion and listing formatter.

### ETF-S04 — formatNumber

- Lines: 328-334;562-569
- Classification: C; confidence: Medium
- Purpose: Formats numeric allocation values to two en-US fractional digits with N/A fallback.
- Sharing rationale: Consistent numeric presentation can be parameterized across apps.
- Application-specific responsibilities: Two-decimal/N/A investment display policy; no allocation logic should move.
- Existing shared delegation observed: Local function; no shared numeric helper referenced.

### ETF-S05 — Per-category memory cache and page-leave cleanup

- Lines: 337-365;373-410;696-705;728-762
- Classification: C; confidence: High
- Purpose: Caches current/past results for60min and maintains render snapshots; clears primary cache on page exit.
- Sharing rationale: Reusable TTL, invalidation and sensitive identity/lifecycle boundaries.
- Application-specific responsibilities: ETF category/date/sort/row-result keys and current/past data shape.
- Existing shared delegation observed: Local categoryCache/lastFull arrays; no shared cache component referenced.

### ETF-S06 — Safe text rendering and HTML encoding

- Lines: 219-223;289-298;429-505;559-569;660-686
- Classification: C; confidence: High
- Purpose: Uses textContent for response data and escapes summary before HTML print output.
- Sharing rationale: Common context-sensitive output safety and text-cell creation.
- Application-specific responsibilities: ETF table columns, datasets, highlights and summary contents.
- Existing shared delegation observed: Local escapeHtml/addCell; DOM APIs directly; no shared renderer referenced.

### ETF-S07 — Investment and summary dialog lifecycle

- Lines: 509-534;660-668
- Classification: C; confidence: Medium
- Purpose: Opens/closes overlays and populates dialog contents.
- Sharing rationale: Shared dialog visibility/focus/lifecycle service is plausible across interactive apps.
- Application-specific responsibilities: ETF selection prerequisites, selectedInvest preparation and summary generation.
- Existing shared delegation observed: Local display assignments; no shared modal component referenced.

### ETF-S08 — Print-window document construction

- Lines: 572-594;679-691
- Classification: C; confidence: High
- Purpose: Opens a new window, constructs printable HTML, closes document, focuses and invokes print.
- Sharing rationale: Common safe popup/document/print lifecycle and branding.
- Application-specific responsibilities: Investment allocation and ETF comparison report contents, titles and styling.
- Existing shared delegation observed: Local implementations; escapeHtml used for summary; no shared print component referenced.

### ETF-S09 — copySummaryToClipboard

- Lines: 670-677
- Classification: C; confidence: High
- Purpose: Copies summary text with asynchronous success/failure alerts.
- Sharing rationale: Common plain-text clipboard operation and user feedback.
- Application-specific responsibilities: ETF summary source element and wording.
- Existing shared delegation observed: Browser navigator.clipboard directly; no WA clipboard service referenced.

### ETF-S10 — Shared usage-tracking integration

- Lines: 766-767
- Classification: A; confidence: High
- Purpose: Loads platform facade before shared usage tracker.
- Sharing rationale: Common page-view, time-spent and browser lifecycle service.
- Application-specific responsibilities: Current page identity only; business comparison requests are separate.
- Existing shared delegation observed: js/usageTracking.js plus js/waPlatform.js are explicitly loaded.

Principal exclusions: ETF equal allocation/share-floor/remainder calculation; category/inventory business rules; current/past comparison schema; return-period metrics; symbol ranking/movement and sorting; number-of-rows presentation; ETF-specific table/summary layouts and query construction. These remain application-specific. The imported trading calendar remains an investment-domain service, not a mandate to use NYSE closure rules throughout WA. Reusable safety/lifecycle responsibilities inside those workflows are inventoried without proposing a wholesale extraction.

# Compliance assessment

## Scope, method and authority

Experiment2 targets local httpdocs/etfCompare.html only. Entire inline JavaScript and all three referenced local scripts were read; HTML controls were examined only where relevant to a discovered service. Source identity:769 lines,28,177 bytes, SHA-256091276709EF6E13761A7668A9DC2E3D49483AD758A00CA2596FCBEBD7D29977B; reviseLogIn; local HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c. Git identifies the local checkout, not a remote deployment. No source discrepancy for the target was discovered.

The local README was read first, beginning with Section0. Local Core v1.0 and Detailed v0.4.1 headers explicitly record owner approval November12,2026 despite retained DRAFT filenames. D01-D14 v1.0, later3A-3C clarifications, AGENTS.md and relevant CLAUDE.md/TechSummary.md sections were reviewed. Approved policy, source observations and actual test evidence remain separate. Shell tools do not establish automatic instruction loading; these reads were explicit.

All examination sources for this experiment were local workspace files, apart from the user-supplied assignment attachment. No connector, Google Drive skill, network request, GitHub/Drive comparison, website, Render or database access occurred. Prior external-source activity in the separate BinForm task was not used as ETF candidate evidence or repeated. The user's current assignment authorizes only this new three-report package and ZIP under download; it does not authorize code, register, test or service changes.

Phase A was frozen before compliance assessment and before reading the local compliance register/test records. Candidate membership comes from this target's own source; the earlier BinForm inventory was not opened, copied or used as a checklist. This shared conversation contains earlier task history, so absence of all prior WA knowledge is not claimed. No expected candidate count or timing comparison was used.

## Result counts and interpretation

- Independent discovery: **10** candidates; classifications2A and8C; no B-only application functions included.
- **2** confirmed nonconformance candidates: ETF-S02 failure contract and ETF-S03 listing date-only conversion. Counts are functional areas, not standards citation counts.
- **8** candidates need targeted further operational verification: ETF-S01,S02,S03,S05,S07,S08,S09,S10. This includes source-confirmed and partly conforming areas and is separate from primary disposition.
- **6** optional deferred modernization candidates: ETF-S04-S09. Their optional extraction status never waives an applicable safety defect. ETF-S03's focused correctness correction is separately deferred for owner scope/priority; it is not counted as an optional module migration.
- Primary dispositions:2 Confirmed Nonconformance;1 Approved Migration Pending;4 Partially Conforming;3 Conforming — source verified. Source-verified means only the particular stated contract, not complete runtime certification.
- Post-reconciliation additions0; original count/classifications unchanged.

All unqualified line references below are to httpdocs/etfCompare.html; module references include full local paths. Recommended browser/HTTP cases are **NOT RUN**. No application test, build, pricing request or print/clipboard action was executed.

## ETF-S01 — Page-level token snapshot and business-request credential lifecycle

**Location and classification:** lines227;275-280;307-324;A;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-03/08/09; WA-AUTH-001, WA-SESSION-001, WA-SHARED-001; D07-D09.

**Existing shared implementation and actual adoption:** httpdocs/js/waPlatform.js:26-39,100-117,119-143,168-169 exposes current-token/session and transport APIs. usageTracking.js:84-98 actually restores its own tracking session.

**Current source evidence:** etfCompare.html:227 snapshots localStorage once; fetchWithAuth:277 always reuses that constant. onload:307-324 populates categories without awaiting session restoration. The loaded facade at766 does not patch fetch (waPlatform.js:17,57-62). A tracker refresh/token replacement cannot update this page's constant. Missing/expired/revoked/account-switch effects are not browser-tested.

**Disposition: Approved Migration Pending.** Shared business-session adoption is incomplete under the approved measured-group transition. Persistent token storage is D08 design debt, not proof of an exploit or authorization to choose memory storage. Snapshot identity mismatch is a concrete source limitation requiring targeted acceptance, not a demonstrated cross-account leak.

**Action: TEST FIRST; MIGRATE LATER; OWNER DECISION.** Define a narrowly approved current-identity/session/GET recovery integration while preserving ETF startup and selections. Never silently replace storage or globally intercept fetch. Failed restoration must not invent a successful login or erase useful state.

**Stage6 linkage:** R16 T09/T10 representative-page/session work; R17 browser matrix; R19 delayed-response/tab identity edge cases. S6-005/008/018/033.

**Outstanding verification:** Missing token with remembered cookie; token refresh after page open; revocation/logout/account switch and delayed GET. A business GET using this helper is not a WA.api acceptance case.

**Modernization status:** Required phased session migration remains outstanding; no optional whole-page rewrite.

## ETF-S02 — fetchWithAuth and request-failure reporting

**Location and classification:** lines275-280;232-245;285-303;406-424;C;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-03/05/08; WA-SESSION-001, WA-API-002, WA-SHARED-001; D04.

**Existing shared implementation and actual adoption:** waPlatform.js:20-24,41-55,119-143 provides typed status/code, string/nested-message compatibility and controlled request behavior; js/usageTracking.js:25-38 is an existing real consumer.

**Current source evidence:** fetchWithAuth at275-280 checks res.ok then throws only Error('API error: '+res.status), without reading supported error body/message/code fields; it parses JSON only for success. Category failure at299-302 always gives the same login-or-server alert regardless of 401/403/network/server/cancellation. Data failure421-424 reports err.message; inventory catch241-244 logs and substitutes empty highlighting. No intentional credential/permission/server/network/cancellation handling exists.

**Disposition: Confirmed Nonconformance.** The applicable failure-contract distinction is not implemented end-to-end; category UI collapses credential denial, permission denial and outage. HTTP status remains in the thrown string and logs, so it is NOT claimed to be erased everywhere. Supported public error shapes/business fields are also discarded. A generic HTTP message is safe from server-body disclosure, but that alone does not satisfy the required failure/consumer contract. Legacy direct fetch by itself is not the confirmed violation.

**Action: CORRECT; TEST FIRST; OWNER DECISION.** Seek scoped approval for reliable failure distinctions and safe supported-body handling or a compatible shared adapter. Preserve ETF response shapes and intentional inventory fallback. Do not migrate all producers or introduce mutation retries. Browser JSON/empty-body behavior needs a contract before changing it.

**Stage6 linkage:** Direct R16 client-error/retained-state relevance; S6-008/018/033; R17 handling across supported browsers. Page business reads do not prove shared-client T09.

**Outstanding verification:** 401/403/503 with meaningful safe string/nested/legacy messages; network versus abort; malformed/non-JSON failures; 204 success; actual UI retained state. All NOT RUN.

**Modernization status:** Required safety-contract review/correction is distinct from later shared-transport adoption.

## ETF-S03 — Calendar-date conversion and trading-day adapter

**Location and classification:** lines251-271;307-320;492-500;216;C;confidenceMedium. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-01/06/08/10; WA-DATA-001, WA-PRESERVE-001, WA-SHARED-001.

**Existing shared implementation and actual adoption:** httpdocs/js/holidays.js:25-39 is already called for market closures. No general WA calendar-date formatter is exposed by the inspected shared modules.

**Current source evidence:** toDateStr/parseDate at251-261 use local calendar components; getMostRecentOpenDay265-271 calls imported isMarketClosed. In contrast formatListedDate492-500 does new Date(dateStr) and local getMonth/getDate/getFullYear. routes/etf.js:425,489,513-515 passes listDate through to compare output; dbConnection.js:38-39 selects UTC connection semantics and DATE strings.

**Disposition: Confirmed Nonconformance.** For a supported ISO date-only input such as '2026-11-15', ECMAScript date-only parsing yields UTC midnight. A browser west of UTC reads November14 through local getters. This is a source-level calendar-date-versus-instant mismatch against WA-DATA-001, not an executed browser result or a claim about live schema. No financial/trading-calendar correctness audit was conducted.

**Action: CORRECT; TEST FIRST; OWNER DECISION.** Approve a date-only preservation contract for listing display and a focused correction after review; retain existing visible MM/DD/YYYY style and trading-day rules. Do not apply market closures to all WA apps or rewrite allocation/reference-date calculations.

**Stage6 linkage:** Listing display is deferred scoped correctness work rather than a demonstrated R16-R20 blocker; relevant R17 timezone/browser regression when corrected. Owner risk disposition required before claiming conformance.

**Outstanding verification:** Date-only string in negative/positive/zero UTC offsets, leap day and invalid/missing values; inspect exact current listDate type under later authorization. Holiday table accuracy/out-of-range dates are unverified, not certified.

**Modernization status:** Shared holiday dependency retained; optional generic date-module migration is not proposed automatically.

## ETF-S04 — formatNumber

**Location and classification:** lines328-334;562-569;C;confidenceMedium. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-01/08; WA-PRESERVE-001, WA-SHARED-001; WA-DATA-001 for preserving numeric meaning.

**Existing shared implementation and actual adoption:** No dedicated shared numeric presentation API in inspected js directory inventory or waPlatform/holidays/tracker modules.

**Current source evidence:** etfCompare.html:328-334 returns N/A for sentinel/null/NaN and uses Number(...).toLocaleString en-US with exactly two fractional digits. Allocation callers562-569 use it after ETF-specific share/cost computation.

**Disposition: Conforming — source verified.** Source establishes a presentation-only two-decimal contract, separate from investment calculation. Approved standards do not require every numeric utility to become shared. This is not certification for Infinity, coercion, rounding boundaries or all locales.

**Action: RETAIN; MIGRATE LATER.** Keep allocation, share-floor, amount/default and remainder semantics local. Defer an optional parameterized numeric formatter only if other WA callers require the same explicit sentinel/locale/precision contract.

**Stage6 linkage:** No direct outstanding R16-R20 assertion; deferred standardization.

**Outstanding verification:** Future helper changes need numeric sentinel/zero/fractional/nonfinite/coercion/locale preservation checks; no current runtime PASS claimed.

**Modernization status:** Optional numeric-presentation helper; no migration required merely because another app could reuse it.

## ETF-S05 — Per-category memory cache and page-leave cleanup

**Location and classification:** lines337-365;373-410;696-705;728-762;C;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-03/08/09/10; WA-SESSION-001, WA-CACHE-001, WA-SHARED-001.

**Existing shared implementation and actual adoption:** No shared application-memory TTL cache in inspected modules. Shared HTTP no-store/worker rules are separate boundaries; WA.session has explicit-logout/account-change checks.

**Current source evidence:** getCachedData342-354 expires entries older than60min; setCachedData356-361 keys by category only. clearCache363-365 clears categoryCache, and pagehide/beforeunload761-762 call it. lastFullCurrent/lastFullPast696-705 and selectedInvest523 remain separate state; clearCache does not clear them or respond to token/logout/storage changes. loadTables375-410 reuses current/past snapshots. Server compareCache uses userId|category (routes/etf.js:388-403), not the same client cache.

**Disposition: Partially Conforming.** TTL/page-exit primary-cache clearing is source-established. Complete sensitive account-lifecycle invalidation, BFCache behavior and request-parameter completeness are unverified. A private in-memory performance cache is not automatically forbidden by HTTP no-store. No actual cross-user exposure is established.

**Action: RETAIN; TEST FIRST; OWNER DECISION; MIGRATE LATER.** Before any cache extraction define result identity/date/row/sort inputs, account scope and clearing of all derived snapshots. Preserve ETF instant sorting, TTL and intended user workflow; do not silently change keys or caching policy during review.

**Stage6 linkage:** R16 cache/old-client lifecycle; R17 BFCache/restart behavior; S6-024 and D09 account-state verification. Generic TTL extraction is deferred.

**Outstanding verification:** Category cache hit/expiry; pagehide/BFCache restoration; account switch/logout; derived arrays and inventory state; stale response/date/query permutations. None executed.

**Modernization status:** Optional generic TTL/lifecycle engine; ETF key and result adapters remain local.

## ETF-S06 — Safe text rendering and HTML encoding

**Location and classification:** lines219-223;289-298;429-505;559-569;660-686;C;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-07/08/09; WA-FRONT-001, WA-SHARED-001.

**Existing shared implementation and actual adoption:** Local escapeHtml219-223 and addCell502-505; browser textContent used. No shared text-cell/HTML encoder API in the three imported modules. inputSanitizer is not imported and is a different input boundary.

**Current source evidence:** Category option labels289-298, symbol/name/listed-date/movement438-450,463,477 and values addCell504 use textContent. Allocation rows560-565 do likewise. Summary662 is textContent; printing686 escapes summary. Dataset assignments457-459 store text/values rather than HTML. innerHTML=''431,512,551 clears containers; it does not insert external HTML.

**Disposition: Conforming — source verified.** These data-to-text and summary-output-encoding requirements are specifically source verified. No raw provider/user text is inserted as executable HTML on these paths. No reusable free-text input is present in the examined controls; the investment amount is numeric, so absent DOMPurify/inputSanitizer is not automatically a violation. Print serialization is separately scoped in S08.

**Action: RETAIN; MIGRATE LATER.** Preserve safe text setters and encoder semantics. Optional common rendering primitives may be considered later, with ETF column/schema/highlighting/summary layout retained locally. Do not create a generic renderer solely because names look reusable.

**Stage6 linkage:** Supports R16 safe display, but source safety does not close shared parser T09 or whole-project XSS assurance. No new application test is claimed.

**Outstanding verification:** Future rendering changes need literal markup/quotes/ampersands and print-copy preservation. Existing source conclusion is bounded; DOM and provider trust boundaries are not certified globally.

**Modernization status:** Optional text-cell/encoder consolidation; no compulsory module migration.

## ETF-S07 — Investment and summary dialog lifecycle

**Location and classification:** lines509-534;660-668;C;confidenceMedium. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-01/07/08; WA-FRONT-001, WA-PRESERVE-001, WA-SHARED-001.

**Existing shared implementation and actual adoption:** No common dialog controller in inspected js modules/inventory. Current page uses local overlay markup and inline click handlers.

**Current source evidence:** Investment modal182-202 and summary205-214 use close spans and buttons. openInvestModal509-530 validates selection then shows flex; close532-534 hides it. Summary660-668 sets safe text then toggles display. No explicit focus capture/restore, Escape handling, dialog role or modal focus-boundary implementation is present in these service paths.

**Disposition: Partially Conforming.** Visibility/content prerequisites and text safety are source verified. Keyboard/focus/assistive behavior requires scoped browser verification; absence of a modal library or optional semantic enhancements alone is not proof of a new mandatory defect. This is not a general accessibility audit.

**Action: RETAIN; TEST FIRST; MIGRATE LATER; OWNER DECISION.** Defer optional common open/close/focus service; keep ETF selection, amount and summary generation local. Owner should assess any material keyboard barrier before release; no UI redesign is authorized.

**Stage6 linkage:** No direct R16 error-handler requirement established. Relevant R17 browser/keyboard checks if this page is selected; otherwise deferred standardization.

**Outstanding verification:** Keyboard-only open/close, Escape policy, focus return and background navigation; unchanged visible geometry and ETF state after a later scoped change.

**Modernization status:** Optional dialog lifecycle controller, with accessibility scope decided independently.

## ETF-S08 — Print-window document construction

**Location and classification:** lines572-594;679-691;C;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-01/07/08/09/10; WA-FRONT-001, WA-SHARED-001, WA-PRESERVE-001.

**Existing shared implementation and actual adoption:** No general print-window component in inspected imports/js inventory. Existing local two print paths share window/document lifecycle.

**Current source evidence:** printModal572-594 clones .modal-content and removes buttons/.close;581 writes serialized DOM populated via safe text paths559-565. printSummary679-691 encodes text through escapeHtml686. Both call window.open, document.write/close, focus and print; neither checks a null blocked popup before dereferencing.

**Disposition: Partially Conforming.** Summary encoding and allocation text-origin serialization are source verified; document.write presence alone is not a demonstrated injection. Popup blocking, print readiness, browser layout and lifecycle cleanup are unverified. Missing popup guard is a robustness concern, not an independently demonstrated leak or a mandatory new universal helper requirement.

**Action: RETAIN; TEST FIRST; MIGRATE LATER; OWNER DECISION.** Retain titles/styles/footer and report contents. Defer optional print lifecycle helper; if a blocked-popup or readiness failure is confirmed, prepare only an owner-approved scoped remedy. Avoid exporting credentials or hidden private UI in later clone changes.

**Stage6 linkage:** Mostly deferred standardization; R17 named-browser/popup/print compatibility if selected. No Stage6 parser/transport PASS follows from successful printing.

**Outstanding verification:** Allowed/blocked popups, both printable reports, long/special-character text, focus, pagination and no hidden credentials; NOT RUN.

**Modernization status:** Optional safe print-window service, retaining ETF report-specific body/styles.

## ETF-S09 — copySummaryToClipboard

**Location and classification:** lines670-677;C;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-01/07/08/10; WA-FRONT-001, WA-SHARED-001, WA-PRESERVE-001.

**Existing shared implementation and actual adoption:** Browser navigator.clipboard.writeText directly; no WA clipboard wrapper identified in inspected modules.

**Current source evidence:** copySummaryToClipboard670-677 reads summaryContent.textContent and writes plain text. Promise fulfillment and rejection issue distinct alerts. navigator.clipboard/writeText availability is not checked; lack of the API can throw synchronously before the promise catch.

**Disposition: Partially Conforming.** Plain-text copy and asynchronous failure feedback are source verified. Secure-context/permission/browser availability and synchronous-failure behavior remain unverified. A wrapper is optional; do not label the direct browser API itself nonconforming.

**Action: RETAIN; TEST FIRST; MIGRATE LATER; OWNER DECISION.** Defer optional reusable clipboard/feedback helper. Verify actual supported contexts before authorizing a guard or alternate copy mechanism; retain existing summary text and success/failure wording.

**Stage6 linkage:** R17 browser permissions/secure-context behavior if selected; otherwise deferred usability standardization.

**Outstanding verification:** Clipboard permitted, denied and unavailable; no unintended HTML copy; exact newline/plain-text preservation. No browser or clipboard access performed.

**Modernization status:** Optional plain-text clipboard helper; no new clipboard permission or browser action taken.

## ETF-S10 — Shared usage-tracking integration

**Location and classification:** lines766-767;A;confidenceHigh. The initial purpose, rationale, local-specific responsibility and delegation remain exactly as frozen above.

**Applicable approved requirements:** CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001, WA-CACHE-001.

**Existing shared implementation and actual adoption:** httpdocs/js/usageTracking.js:1-125, specifically25-38,43-58,68-81,84-124; waPlatform.js:100-143.

**Current source evidence:** etfCompare.html766-767 loads facade then tracker. Tracker8-9 prevents duplicate installation;84-98 restores session and starts page/time tracking. Normal POSTs28-32 actually call WA.api.request; exit43-58 uses current-token keepalive fetch once, explicit-logout gate and no retries; visibility/pagehide/pageshow112-124 manage foreground lifecycle. Raw exception details are omitted at37.

**Disposition: Conforming — source verified.** Shared tracker adoption, load order and no automatic retry for these tracking POSTs are source verified. Exit direct fetch is a justified lifecycle adapter and cannot be blindly replaced with sendBeacon requiring unavailable bearer headers. Page business GETs still bypass WA.api. Delivery accuracy/BFCache/account-state/browser acceptance remains bounded/unverified.

**Action: RETAIN; TEST FIRST.** Preserve existing shared tracker and its exit transport exception. Reuse accepted tracking evidence; test only genuinely outstanding lifecycle/identity or affected-cache assertions under later authorization.

**Stage6 linkage:** R15 historical tracking acceptance preserved; R16 diagnostic/cache and R17 lifecycle. R19 session race scope if relevant; no R18 native modification.

**Outstanding verification:** Current-token restoration, background/foreground/BFCache, logout/account-switch durations and no duplicate mutation under unresolved acceptance only; no existing tests rerun.

**Modernization status:** No optional tracker rewrite proposed; retain shared implementation.

## Confirmed gaps versus migration work

ETF-S02 is an applicable source-contract gap, not a claim that direct fetch or a string error class is inherently forbidden. HTTP status is present in the local adapter's error text; nevertheless the category failure path collapses the cases and supported public-body details are never examined. The standards call for distinguishing 401,403,transport,server and cancellation outcomes and preserving relevant business error fields. A scoped correction may use a suitable adapter or reviewed shared facade integration; neither implementation is authorized here.

ETF-S03 demonstrates the date-only mismatch for a valid ISO date-only string under negative UTC offset. This conclusion follows the source's UTC-parse/local-getter combination and local producer DATE-string contract; no browser fixture was executed and no live schema was inspected. Preserve calendar meaning and MM/DD/YYYY presentation; no market-calendar redesign is proposed. Even a small correction requires a complete owner-reviewed source package.

ETF-S01 required staged authentication adoption remains incomplete. D08 approves a modernization goal but selects no replacement storage architecture. ETF-S04-S09 optional helper extraction remains deferred; using native DOM/date/print/clipboard primitives is not itself nonconforming. Retain the already shared trading calendar and tracking where appropriate. No recommendation imposes exchange closures or a two-decimal investment policy on unrelated WA apps.

## Phase C reconciliation, after inventory preservation

Local evidence was consulted only after the18:26:06.0036283-05:00 frozen-inventory milestone.

1. **Existing ETF register:** docs/WA_Standards_Compliance_Register.md:181-190, WA-CF-002, corroborates the independently discovered token snapshot/direct-fetch adoption gap. It labels legacy adoption permitted and does not excuse unrelated mandatory failure distinctions or certify runtime session behavior. No new candidate was imported.
2. **Existing tracking package:** change/README_R15-49B_ETF_Tracking.txt records a six-page ordered facade/tracker script correction. docs/Stage6_Render_TestPlan.md:60-62 records bounded local six-page and hosted representative ETF tracking observations. This corroborates ETF-S10 actual script usage; it does not convert business fetchWithAuth into WA.api.
3. **Acceptance boundaries:** TestPlan:37-80 and OpenItems:30-34/147-160 preserve R15 bounded results while S6-005/008/018/025 remain open. Ordinary ETF views/comparison success does not establish expired/current-token, outage, account-switch or full cache lifecycle acceptance. No tests were repeated.
4. **ETF error-producer evidence:** change/README_R16_ETF_HTTP_Error.txt describes an earlier bounded server-side expected/unexpected classification package and its test limitations. It is not proof of current client error handling or authorization to rerun tests. Its historical separate config-risk section is not imported as a newly discovered page candidate; this page does not call /etf/config, and no secret endpoint was contacted.
5. **T12 preservation:** docs/WA_R16-75_T12_Offline_Results_2026-11-15.md and existing TAP footer document **90/90 bounded offline PASS,0fail,November15,2026**. Current local server.js/waPlatform.js hashes match the cited T12 identities. The existing TAP was read, not executed. This does not test this page's independent business adapter, listing dates, dialogs, printing or clipboard.
6. **Later R16 evidence:** local Compliance Register:466-472 records three bounded hosted parser probes and selected T11 log observations; these are historical local-document claims, not new external verification. Older T12 pending text predates those observations. Actual T09 shared-client browser error display and T10 real unsaved-form behavior remain open.
7. **No prior standalone ETF independent examination package was found by the targeted filename search** in docs/change/tests/download; this is a bounded search, not a claim no other narrative exists. No BinForm report was opened for this ETF task. Supplemental evidence adds no candidates and changes no frozen A/C classifications.

## Stage6 priorities and deferred work

Prioritize ETF-S01/S02 session/failure-contract evidence, ETF-S05 cache/identity lifecycle and ETF-S10 outstanding tracking edges when directly relevant to R16/R17. Real shared-client T09 needs a consumer actually calling WA.api; these business GETs alone do not establish it. The tracker is a genuine shared-client consumer but does not exercise ETF business parsing or editable form state. No business mutations are performed by fetchWithAuth; tracking POSTs have a distinct one-send contract.

R17 supported browser/device/permission/lifecycle behavior remains unverified here. R18 TNNA is outside this page; preserve native separation. R19 race/delayed-response/identity checks apply only where shared auth or this cache integration is later changed, not as a load-test mandate. R20 independent review, owner release/rollback controls remain open and no production readiness is claimed.

ETF-S03's listing-date correction needs separate owner scope/risk disposition, without enlarging R16-75 into a financial/calendar rewrite. Optional numeric/cache/render/dialog/print/clipboard modules belong to deferred standardization after Stage6 and independent engineering review. Preserve ETF share rounding, allocations, ranking, adjusted-price/date anchors, table layouts, summaries and APIs.

## Review controls, nonapplicability and limitations

CS-01/02/11/12 and WA-PRESERVE-001/WA-CORE-001/WA-REVIEW-001 govern this report's provenance, read-only boundary and evidence. Candidate-specific standards are listed individually; unrelated administrator/FamilyTree/native/public email/geocode clauses are not imposed on these functions. No full WA-SEC-ADMIN-001,WA-PRIV-002,WA-NATIVE-001,WA-ABUSE-001 audit is claimed. Server authorization cannot be established by client visibility; server.js:186 shows the mounted ETF authentication/entitlement boundary, but full endpoint/schema/ownership review is out of scope.

Only necessary portions of server.js,routes/etf.js and dbConnection.js were traced to establish mounted protection, date result provenance and cache identity. No comprehensive ETF route/data/finance audit, holiday-table accuracy verification, external market-data check, HTML/CSS formatting audit or general accessibility audit was performed. This is engineering source review, not investment guidance.

No confirmed secret leak, unauthorized access, cross-account exposure, automatic mutation replay, live data error or popup/clipboard failure was demonstrated. Raw Console error objects are a diagnostics verification boundary, not evidence of a token disclosure. Approved policies and local historical tests do not certify all candidate runtime conditions. Remote/local identity and deployed revision were not checked and are not required for this experiment.

All source/standards/register/prior-report files remain unchanged. No replacement application source was authored, so revised-source full replacements/unified .diff artifacts do not apply to this exactly-three-report assignment. Any later correction needs an exact current source baseline, explicit owner scope, complete replacement, unified comparison, standalone verification, exact SHA-256, risk-based authorized tests and manual installation approval.

Task/authorization: supplied Experiment2 read-only shared-function review.
Core/Detailed standards checked: candidate maps plus process controls above; unrelated requirements N/A.
Source identity: local hash/HEAD above; no remote comparison.
Intended behavior/appearance changes: NONE.
Source formatting changes: NONE.
Application tests/builds: NOT RUN.
Previous Stage6 assertions: preserved bounded R10/R14/R15/T12; no closure or rerun.
Deliverables: this report, candidate CSV and timing/verification report, packaged as ZIP.
Correction/installation status: NOT AUTHORIZED.

