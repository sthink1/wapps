# Batch 4 - Family Tree core and relationships

Completed scope: seven authorized HTML pages, processed sequentially. Sixty independently discovered A/C candidates; zero post-reconciliation additions. FTPerson and Batches 1-3 remain preserved and were not reexamined. No Batch 5 work or folder created.

Core v1.0 and Detailed v0.4.1 with 3A-3C approved November 12 despite DRAFT filenames; Decision Register D01-D14. README Section 0, AGENTS, CLAUDE, TechSummary and relevant current local Stage 6 sources consulted. The original November 16 assignment plus explicit Batch 4 authorization governs read-only local examination. No connector/Drive/GitHub/service/database operations or application tests/builds/probes. Only new reports and current batch ZIP created.

Local branch reviseLogIn; HEAD 1bc93d86a194cdcc57a7280de226f1bfee10f10c. Exact page/companion/evidence hashes in individual timing reports and final verification. This does not assert Drive revision or live deployment equivalence.

| File | Independent candidates | Confirmed candidate occurrences | Need verification | Separate deferred modernization | Page review wall seconds | Significant findings |
| --- | --- | --- | --- | --- | --- | --- |
| FamilyTree.html | 6 | 1 | 6 | 5 | 115.072 | Dialog focus gap; optional lookup startup/status and late identity unverified |
| FamilyTree2.html | 9 | 2 | 9 | 8 | 110.950 | HTTP categories; dialog/label/focus/error accessibility |
| FTAncestor.html | 9 | 3 | 9 | 7 | 125.577 | HTTP; existing shared private-person handoff; shared popup accessibility |
| FTAncestorChild.html | 8 | 3 | 8 | 6 | 86.645 | HTTP; missing private focal access flow; error announcement |
| FTAncestorPartner.html | 8 | 3 | 8 | 6 | 49.676 | Same demonstrated mechanics as Children; separate actual Partner integration |
| FTContact.html | 10 | 4 | 10 | 7 | 115.435 | HTTP; private access flow; post-commit email outcome; accessible errors |
| FTEvent.html | 10 | 3 | 10 | 8 | 98.047 | HTTP; private access flow; history-dialog/error accessibility |
| Total | 60 | 19 | 60 | 47 | 701.401 | Counts overlap |

These are candidate-level occurrences, not 19 independent root causes, and not 60 proven failures. All 60 retain targeted runtime/contract verification; 47 also have separate staged migration or optional-helper items. Mandatory corrections are not deferred merely because an optional helper is listed.

## Findings requiring owner review

Five recurring finding families account for the 19 confirmed candidate occurrences: HTTP failure-category loss (6 pages); missing private focal-person capability flow (4 pages); existing shared handoff failure (1 selected-page integration); accessibility (7 pages, several distinct local/shared implementations); and contact mail-after-commit outcome reporting (1 candidate with create/update/resend subfindings). Each confirmed candidate belongs to one primary family. The detailed cause graph preserves subfindings without increasing the original count.

Private focal access: Children, Partner, Contact and Event lack FTPrivacy/page-token acquisition and send bearer-only detail requests. Current server privacy gate intentionally denies ordinary private requests with 423. The source establishes incomplete access integration; it does not establish a privacy bypass or executed user incident. Ancestor intentionally permits redacted relationship views and uses shared openPerson; its destination handoff defect is reused from unchanged prior FP04 evidence without reexamining FTPerson.

Contact: server commits contact/verification state before email delivery, then returns an ordinary error if sending fails. Client treats that as a failed save. Persisted state vs delivery failure needs explicit reporting/reconciliation; automatic or user-induced duplicate consequences were not tested.

Current routes/ftPrivacy.js:49 delegates central administrator service; service requires current database flag AND configured normalized name. Older standards/architecture username-only description is stale documentation, not a new current-source administrator defect. This bounded positive source evidence does not certify full admin CRUD/privacy/record-transfer coverage.

No actual cross-account disclosure, external token exfiltration or XSS exploit demonstrated. Delayed identity responses remain unverified. Known shared originless header wrapper is dormant on Ancestor because it calls openPerson but not ensurePageAccess; no new active forwarding occurrence counted. Four-character recoverable privacy codes follow D06 and are not called a storage nonconformance.

## Stage 6 / proposed Master Register

See companion common-cause report and 60-row proposed mapping CSV. B04/RC labels are review-local proposals, not assigned authoritative IDs. Stage6_OpenItems already has a Master register table; a separate broader WA Master Register/schema was not found in bounded docs/standard searches. Do not infer it is absent elsewhere. No existing register or testing document edited.

R16: map privacy to S6-017/009, statuses/drafts to S6-008/018/033, identity to S6-007/027, telemetry/cache/logs to S6-025/024/030. Business calls on these pages use local adapters; shared tracking calls alone do not verify their business error handling. T09 actual shared-client browser and T10 real unsaved-form cases remain open. R17 browser/keyboard/navigation; R18 TNNA not exercised or implicated by these page-only changes; R19 proposed bounded capability/async/repeated-action cases, not a new replay failure; R20 asset/rollback/environment and independent release review remain open. S6-041 references have unreconciled original-row provenance; no severity/status allocated.

Preserve R10/R14/R15 and November 15 R16-75 T12 90/90 bounded offline PASS plus later bounded T06 3/3 and selected T11 logs. No test was repeated. Standards approval/static source checks/package verification are not application acceptance.

## Timing and exact clarifications

First retained reliable batch anchor 2026-11-16T10:05:41.9131548-05:00; baseline observed 2026-11-16T10:05:52.749049-05:00 across 904 pre-existing files. Initial instruction work before that retained anchor is excluded/unresolved. Seven page review intervals total 701.401 seconds; final observed packaging endpoint, batch elapsed and per-page start-to-ZIP/wait intervals appear in Final_Verification and final tool receipt. These overlapping durations must not be summed.

Assessment and evidence reconciliation were interleaved for every page, including FamilyTree: their separate boundary is UNRESOLVED. Identical combined-completion anchors do not mean zero reconciliation work. Each timestamp follows composition of both tasks; pure phase effort/CPU duration is unresolved, not estimated. Tool-call wall durations are subsets, not batch execution time.

Explicit locator correction, without altering immutable inventory or original delivered reports: FamilyTree FT01 actual HOME/MENU anchors are httpdocs/FamilyTree.html:321-322, with example handlers665-669. The original frozen318-321 range omits MENU322. Use corrected321-322;665-669 for navigation evidence. Count/classification/assessment unchanged. FamilyTree report text318-321 is corrected by this notice and final verification.

Full functional markup/scripts were inspected; broad styling/formatting and business-logic audits excluded. Tool display elided some compact CSS during FamilyTree retrieval; no comprehensive appearance audit claimed.

## Package

Each page has required review MD, 14-column one-row-per-candidate CSV, timing/verification MD and preserved inventory JSON. Batch summary, common-cause/component evidence, proposed mapping and final verification are additional current-batch review artifacts. ZIP contains these reports only; no source/secrets/installers. Final member bytes/hashes/CRC and preservation checked after sealing; exact ZIP SHA-256 emitted in final receipt. No source revised, so replacement/.diff/installation package not applicable.

Batch 4 only. STOPPED - explicit owner authorization required before Batch 5.