# FTPrivacyVerification - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:38:52.2673178-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:39:38.382148-05:00 | 46.115 s |
| Inventory saved observed | 2026-11-16T10:39:38.383052-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:40:41.0966379-05:00 | 62.714 s |
| Evidence reconciliation completion observed | 2026-11-16T10:40:41.0966379-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:40:47.066338-05:00 | 5.970 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved; distinct boundary unresolved; combined actual anchor is not zero effort. Tool/orchestration included, CPU unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 6; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTPrivacyVerification.html | f3b34b9f89ac138ae4af06c814df2fa6c43f8621d9d790f9b162e9ec860d9dee |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |

Exact newly delivered report hashes:

WA_FTPrivacyVerification_Shared_Function_Review.md: 328c275082713fe211ae30adfb368a9d763decbd070068a442b89eac8babc918

WA_FTPrivacyVerification_Shared_Function_Matrix.csv: ef46ad41aecf347b3a3c8cb7d0e32d093676ce8c1644b98233d0bedac843e045

Frozen inventory: 1e6a86e723ee4efd4cb1c1ca1e210e3e9b6dfd9bc708dfd0bda0baf176cb7fc8

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3/4 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
