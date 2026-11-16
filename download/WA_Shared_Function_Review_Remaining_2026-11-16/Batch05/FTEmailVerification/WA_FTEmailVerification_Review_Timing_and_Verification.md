# FTEmailVerification - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:40:48.2671108-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:41:14.559948-05:00 | 26.293 s |
| Inventory saved observed | 2026-11-16T10:41:14.560734-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:41:53.0054888-05:00 | 38.445 s |
| Evidence reconciliation completion observed | 2026-11-16T10:41:53.0054888-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:41:58.858416-05:00 | 5.853 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved; distinct boundary unresolved; same observed combined anchor is not zero effort. Tool/orchestration included, CPU unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 6; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTEmailVerification.html | c702f7c6b733269fd2ead234bc25ae46c24edf1a4d6c18bd521f8cea29547378 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |

Exact newly delivered report hashes:

WA_FTEmailVerification_Shared_Function_Review.md: 9f5612f9f9ea5bcc2352c36750b6410aa30ef2af9a98740d7637d5a8656d045e

WA_FTEmailVerification_Shared_Function_Matrix.csv: ce56872f36e91798df2547ac856b323ed215d39562d955c81ea3764f48dedcfd

Frozen inventory: ce73a244b24700091079fd5dc66fdcb3b8aba9bbb97973cfba81fbb8c2ad8e9d

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3/4 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
