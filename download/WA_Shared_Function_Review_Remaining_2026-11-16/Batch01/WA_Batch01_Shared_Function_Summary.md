# Batch 01 ? ETF shared-function review

Authorized scope: November 16 assignment Batch 1 only, five exact local primary HTML files, sequential examination. No later batch source reviewed. No WA application behavior/appearance/source changed. Only new report/ZIP artifacts under the authorized download staging location. No installation, tests, builds, database/service operations, Git changes or deployment.

Branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. All five files available. Local files were primary per explicit assignment; authoritative Drive and deployed equivalence not compared. No material local/Drive discrepancy can be claimed from this review.

## Outcomes

| File | Original candidates | Confirmed gaps | Needing verification | Deferred modernization | Measured review interval | Significant finding |
| --- | --- | --- | --- | --- | --- | --- |
| etf.html | 3 | 0 | 2 | 1 | 141.096 s | No page-local confirmed gap; tracker integration only. |
| etfActivity.html | 9 | 2 | 7 | 3 | 108.498 s | HTTP category loss; mouse-only close control; draft/runtime safety verification. |
| etfAPItest.html | 10 | 3 | 10 | 4 | 115.070 s | HTTP category loss; unassociated visible Symbol label; mouse-only close control; diagnostics review. |
| etfCategory.html | 7 | 2 | 6 | 2 | 105.460 s | Uncontrolled request failures; rejected update refresh can overwrite draft. |
| etfSymbol.html | 8 | 2 | 7 | 3 | 111.289 s | Uncontrolled request failures; rejected delete refresh can overwrite selections; async race / ownership verification. |

Total sequential measured per-file intervals: **581.414 s**. These run from each per-file anchor through report-generation completion, before batch packaging. Complete batch interval and each file anchor-to-ZIP interval, including waiting for later files, are in WA_Batch01_Final_Verification.md. Those per-file ZIP intervals overlap and must not be summed. Unmeasured initial instruction/source reading is excluded.

Totals: **37 original candidates; 9 confirmed candidate-level source gaps; 32 candidates needing verification; 13 deferred-modernization references**. Counts overlap: confirmed gaps also need verification of consequences/correction, and conforming source properties retain runtime limitations. Deferred references consist of five staged auth/storage integration references and eight optional reuse/coordination opportunities, not thirteen independent defects. No post-reconciliation candidate additions.

## Mandatory owner disposition

- Four page-local error paths (A02, T02, C02, S02) fail the WA-SESSION-001 distinction between credentials, permission denial and server/network failure. Category and symbol paths additionally have uncaught network/JSON rejections. Scope separate correction with preserved ETF response/business behavior; link R16 T09/T10, S6-008/018/033.
- Two draft-replacement paths (C05, S05) reload editable rows after rejected update/delete. Source supports possible loss of unsaved fields/selections when the following GET succeeds. Verify R16 T10 with safe fixtures before implementation; no live data-loss incident demonstrated.
- Accessibility: two mouse-only modal close spans (A07/T07) and an unassociated visible Symbol label (T03). Separate native Cancel/Close buttons still exist. Obtain bounded keyboard/screen-reader severity and owner correction scope; do not infer full-page inaccessibility.
- S06 async dependency ordering can render selectors before categories arrive; no runtime reproduction. S05 dependency review cannot establish target-category ownership protection for symbol POST/PUT from the inspected handlers; owner safety disposition/targeted authorization review remains required (CS-04/06, WA-API-001/WA-DATA-001, R14/S6-009). No unauthorized association was attempted.
- T09 caught-error diagnostics and T08 popup-blocked handling need bounded verification. No API key/token/private-record leakage demonstrated. Current /etf/config returns 410 (routes/etf.js 625-627); historical disclosure warning is superseded for inspected local source, without deployed/Drive equivalence claim.

The nine candidate-level observations group into **four repeated patterns**: failure semantics (four copies), draft replacement (two copies), mouse-only modal close (two copies), visible label association (one). These are separate page-local implementations. No nine-defect claim about shared modules is made. Shared transport/storage migration and tracker lifecycle verification are recurring shared-root work, counted as references rather than distinct module defects.

## Shared-component evidence cache

Hashes rechecked before reuse. A shared script being present is distinguished from actual use in every page report. Cache evidence below is bounded static observation, not universal component certification.

### httpdocs/js/waPlatform.js

SHA-256: 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d

Functions: readError 41-55; raw 57-62; refresh 71-98; restore 100-116; request 119-143. Standards: CS-03/05/08/09; WA-AUTH-001, WA-SESSION-001, WA-API-002, WA-SHARED-001.

Same-origin credential ownership; Web Locks fail closed; no retry of sent mutations; nested/flat message type selection. Legacy token storage is D08 migration pending. Error code fields are not explicitly string-type checked (51-54); json error-code contract needs separate shared-component review; not exercised by tracker raw Response calls.

Source only. No universal certification; T09/T10 browser, cross-tab/account-switch and R17 remain bounded/open.

### httpdocs/js/usageTracking.js

SHA-256: 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138

Functions: sendNormal 27-43; sendExit 47-64; checkpoint 74-89; start 91-108; lifecycle 110-137. Standards: CS-03/08/09/10; WA-SESSION-001, WA-SHARED-001, WA-LOG-001.

Normal POST uses WA.api.request; exit uses keepalive with current token; no replay; sanitized diagnostic text; restore before initial page view.

Exact duplicate/lost-delivery accounting, expiry/logout/account switch and BFCache require S6-025 verification.

### httpdocs/js/inputSanitizer.js

SHA-256: eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0

Functions: plainText 25-35; sanitizeElement 37-46; capture event handlers 59-98. Standards: CS-07/09; WA-FRONT-001.

Shared DOMPurify plain-text adapter, excludes passwords/non-text; captures clicks before handlers.

DOMPurify absence returns original string after fixed diagnostic; loading alone never proves safe output rendering.

### httpdocs/js/holidays.js

SHA-256: 88a61357b421f11ad9d66707a99f9389475b71a5efb4bdc9acc2610d4ad25d23

Functions: HOLIDAY_SET, isHoliday, isWeekend, isMarketClosed. CS-01/08 and WA-SHARED-001 apply to preserving dependencies. ETF API test calls isMarketClosed; Activity only imports the script. Market-calendar content/accuracy is domain-specific and was not audited or externally verified. No recommendation to generalize financial calendars project-wide.

## Evidence, standards and boundaries

Explicitly read README starting Section 0 and AGENTS.md with read tools; no automatic tool instruction-loading behavior assumed. Governing Core v1.0 and Detailed v0.4.1 approval headers/adoption records confirm November 12 approval despite historical DRAFT names. Decision Register D01?D14 read with approved later 3A?3C clarifications. Consulted CLAUDE/TechSummary current architecture/frontend clauses and relevant Stage 6 documents. All source identities/hashes and applicable standards are per-file. No wholesale formatting, style, financial-calculation, schema or unrelated-route audit.

R10/R14/R15 bounded acceptance and November 15 R16-75 T12 90/90 bounded offline PASS preserved. Current local waPlatform.js hash matches cited T12 identity. November 15 handoff/register take precedence over earlier dated paused/T06/T11 status snapshots for later bounded evidence. Shared-client browser T09 and actual unsaved-form T10 remain open. R16?R20 and independent implementation review retain priority. Application tests/builds NOT RUN by express prohibition; only packaging/source-hash checks performed. No automatic issue/register closure.

All 797 pre-existing files in captured baseline unchanged in bounded verification, excluding .git, node_modules, .aws, .codex, .agents, .gradle and build trees. Existing bday/logo deletions and untracked docs/download status preserved. Baseline captured after instruction/initial etf reading, before first write. No source replacements or .diff applicable.

Timing limitations: first etf source reading and initial instructions were before reliable per-file anchor. For first three reports, intermediate tool-read timestamps were labelled assessment/reconciliation completion too precisely; the final verification ledger explicitly qualifies these as evidence anchors and records unresolved phase boundaries. Exact inventory/report-generation/ZIP anchors and total wall-clock intervals are observed. No invented phase timing or CPU estimate. Category/Symbol use shared assessment/reconciliation completion anchor, so their separate phase duration is unresolved.

Package: sibling WA_Batch01_Shared_Function_Review.zip; includes this summary, five complete three-report packages, five immutable inventory evidence records, and final timing/verification supplement only. No application source, credentials, private data, source replacements or scripts. SHA-256 manifest/member verification and sealing-tail limitations appear in final verification and tool ledger.

**Batch 1 completed. All reports and ZIP verified. Existing WA project files preserved. STOPPED ? awaiting explicit owner authorization before beginning Batch 2.**
