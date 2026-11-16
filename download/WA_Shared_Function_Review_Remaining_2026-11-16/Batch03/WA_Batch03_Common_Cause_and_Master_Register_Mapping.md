# Batch 03 - common causes and proposed Master Register mapping

This is new review evidence and a proposed crosswalk, not a replacement or authoritative Master Register. Stage6_OpenItems.md139 contains the existing Stage6 master issue table; its S6 IDs are cross-referenced read-only. No separate broader proposed WA Master Register filename/schema/ID ledger was located by local filename search and docs/standard content search. New B03-/RC- keys are review-local labels only, not allocated authoritative IDs. Owner must reconcile schema, duplicates and approval before manual import. No authoritative testing/compliance/master register changed.

## Counting and reuse

100 frozen independent candidates,19 confirmed candidate-level nonconformances:10 HTTP-contract integration occurrences (nine page-local adapters and one actual dependency component) plus nine keyboard/table/dialog candidates. Two broad recurring requirement families do not imply only two defects or19 shared-module defects. Bout Description visibility has a distinct subfinding within OF09. Common PWA concern remains unverified and is one shared root referenced11 times.

CSV rows: 99. Positive source properties with outstanding verification/optional work are included. One extra OF09-ARIA subfinding row is not a new candidate or separate independent defect count. Original inventories/counts unchanged; zero post-reconciliation additions.

## HTTP-CONTRACT common cause

CS-03/05/08, WA-SESSION-001/WA-API-002/WA-SHARED-001 require reliable401/403/503/transport distinction and supported typed flat/nested error decoding. Affected adapters throw plain Error without status/code and coerce nested objects. Mandatory contract correction is separate from optional WA.api adoption and D04/D08 phased architecture. No browser failure newly executed.

Canonical apiFetch SHA-256, exact UTF-8 function line without line terminator: **9b4e0bd3e4a2780177bbc19c82757fbb43083286a6c303727314be8f513cde95**. Five current copies match exact bytes and the earlier Batch2 reviewed block: BleaseRentForm47, BleaseRentReport40, BloanForm47, BloanReport40, BoutReport40. Only a comparison of the prior block was performed, not re-examination of its page. Actual new callers and integrations independently checked.

| Page/candidate | Implementation ownership | Distinct call evidence |
| --- | --- | --- |
| BleaseRentForm/LF02 | canonical inline | Canonical block; active current-page read/CRUD/preview caller, exact lines in matrix |
| BleaseRentReport/LR02 | canonical inline | Canonical block; active current-page read/CRUD/preview caller, exact lines in matrix |
| BloanForm/LN02 | canonical inline | Canonical block; active current-page read/CRUD/preview caller, exact lines in matrix |
| BloanReport/NR02 | canonical inline | Canonical block; active current-page read/CRUD/preview caller, exact lines in matrix |
| BMoney/MY02 | page-local semantic variant | 256-267 implicit Error coercion; Money/investment CRUD and projection |
| BmonthBudget/MB02 | page-local semantic variant | 427-442 expanded variant; summary497; clears feedback on load |
| BmonthDetailReport/MD02 | page-local semantic variant | 415-446 expanded variant; detail553 and strict query validation |
| BoutForm/OF02 | page-local semantic variant | 498-513 expanded variant; CRUD/Description/preview |
| BoutReport/OR02 | canonical inline | Canonical block; active current-page read/CRUD/preview caller, exact lines in matrix |
| budget/BH03 | BudgetPrintDetails component | HTML555 loads BudgetPrintDetails15-37;451-455 ten GETs;470 error output |

R16 T09 relation is page-consumer compatibility only: direct adapter testing does not prove shared WA.api.json browser acceptance. T10 belongs to draft/mutation workflows, not failed-save tests on read-only reports. Existing T12 90/90 bounded offline PASS retained.

## Keyboard/table/dialog semantics

CS-07/WA-FRONT-001 applies. Current source independently establishes nine click-only record/month edit/navigation candidates lacking keyboard-equivalent actions; some include hidden separate table headings and click-only modal close spans. These are separate page-local implementations.

| Page/candidate | Bounded evidence |
| --- | --- |
| BleaseRentForm/LF08 | Current row/close/header evidence at exact matrix locations |
| BleaseRentReport/LR04 | Current row/close/header evidence at exact matrix locations |
| BloanForm/LN08 | Current row/close/header evidence at exact matrix locations |
| BloanReport/NR04 | Current row/close/header evidence at exact matrix locations |
| BMoney/MY06 | td edit click303/355; native Delete is not edit selection |
| BmonthBudget/MB05 | span505 click509; encoded URL does not supply keyboard action |
| BmonthDetailReport/MD05 | Current row/close/header evidence at exact matrix locations |
| BoutForm/OF09 | rows585, spans407/455, header361; distinct ARIA state below |
| BoutReport/OR04 | Current row/close/header evidence at exact matrix locations |

**RC-DIALOG-STATE, owner attention:** BoutForm Description451 stays aria-hidden=true when709-712 adds show;715-722 close also does not synchronize it. Frequency825/832 correctly changes visibility. Visually open Description subtree remains excluded from accessibility tree. Original OF09 includes this; B03-BoutForm-OF09-ARIA preserves a distinct proposed correction/verification entry without adding a candidate. No screen-reader execution.

Budget print dialog is different: named role/aria-modal, native Print/Close, Escape and synchronized ARIA. Focus/printing remains unverified; no inherited click-only finding. Amortization nested anchor/button needs verification and is not labelled confirmed inoperability.

## Shared component cache and new dependency

| Path | SHA-256 | Reused/new evidence boundary |
| --- | --- | --- |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d | Prior full source read reused: restore/request/json, lock fail-closed/no unsafe mutation replay, typed messages. D08 and code-field type limitations retained; no universal certification. |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 | Prior full read reused: normal shared POST/current-token exit/no replay/redacted diagnostics. Exact S6-025 lifecycle remains per-page unverified. |
| httpdocs/js/inputSanitizer.js | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 | Prior full read reused: DOMPurify plain text/capture events; password/typed exclusions. Actual new-page event integration inspected, browser availability unverified. |
| httpdocs/sw.js | 2fc7d3ad3cdd8f528695fec9b77be8cd5eb4634f695ec19536ec0acd0b05bd5e | Prior full read reused: auth/API bypass, network-first HTML/auth module, precache/cleanup. Deleted local bday target remains; hosted install/mixed versions/rollback unverified. |
| routes/budget.js | b72d8ad1f4176c534d20f39746e34187784a6da335ab4cc700353a629e817767 | Generated CRUD/Description/preview evidence reused. New narrow662-682/695-749/753-850/853-902 month/activity/Money/detail subsets inspected. UserID predicates source-supported, not complete DB/security audit. |
| httpdocs/js/BudgetPrintDetails.js | bdc32094d0683e93d5fbfbcd4f84e152412f9049da8d7728678d94451e541508 | New full512-line read:15-37 error contract gap;93-169 text-node tables;432-473 ten GET aggregate;475-511 native controls/ARIA/Escape/afterprint. Account snapshot, focus/print/assets unverified. |

## Unverified requirements and proposed dispositions

- SESSION-TRANSPORT-MIGRATION: per-call token/presence gates remain measured migration work, not automatic bypass. Preserve local cross-port compatibility; no global fetch rewrite.
- DRAFT/RESPONSE-IDENTITY: late edit/dropdown/preview/account responses; double submit; successful save then failed refresh; delete while editing another row. Source sends each mutation once; no demonstrated loss or replay. Link T10/S6-008/018/007/027 as applicable.
- SENSITIVE-SNAPSHOT-IDENTITY: budget/BH05 combines independently credentialed GETs without account-generation guard. Owner privacy/identity verification needed; no real records retrieved, leak demonstrated or export run.
- RENDERING-TYPES: raw form date/occurrence/month label/year fields need producer/DOM checks. Existing date validation and normalized numeric producers retained as bounded evidence; no confirmed XSS.
- PWA-ASSET-COMPATIBILITY: one worker missing local precache target; current hosted/installed behavior and print-module mixed assets not checked. Link R16/S6-024 and R20 rollback; no worker correction/restore/removal authorized.
- USAGE-LIFECYCLE: ordered scripts and actual tracker usage source verified; exact expiry/logout/BFCache/delivery accounting not certified. S6-025 remains unresolved.
- OPTIONAL-REUSE:29 overlapping modernization references are not29 new helper proposals/defects. Keep display/domain precision, rounding, recurrence and workflows.

## R16-R20 relevance

| Requirement | Relevance | Remaining limit |
| --- | --- | --- |
| R16 | Local error/T09 relation; draft/T10; logging history; PWA mixed assets; identity/privacy | No tests executed; preserve bounded T12/T06/T11 and real shared-client browser gates. |
| R17 | Keyboard/focus, locale/date inputs, print/cancel/dialog, cache assets across supported browsers | Browser matrix not run/presumed passed. |
| R18 | No native/TNNA source/device change in scope | Native acceptance unchanged; no pass inferred from web source. |
| R19 | MY08 narrow unverified range/resource-budget dependency; concurrency scenarios need controlled prioritization | No rate/proxy/load/refresh-replay test or newly proven R19 failure. GET races do not close session concurrency acceptance. |
| R20 | Asset/cache rollback and preserved source baseline feed future reversal/release review | No environment/DB/service change, reversal drill, release or final independent review performed. |

Preserve R10/R14/R15 and November15 R16-75 T12 90/90 bounded offline PASS. Later T06/T11 evidence remains bounded; no accepted tests repeated. Standards approval, source findings, unexecuted scenarios and actual test results remain distinct. All authoritative documents/registers preserved. Corrections require separate owner authorization.
