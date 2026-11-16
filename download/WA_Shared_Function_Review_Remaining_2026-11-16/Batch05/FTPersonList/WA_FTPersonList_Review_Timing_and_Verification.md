# FTPersonList - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:33:49.1701701-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:34:21.502070-05:00 | 32.332 s |
| Inventory saved observed | 2026-11-16T10:34:21.502841-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:35:09.9433820-05:00 | 48.441 s |
| Evidence reconciliation completion observed | 2026-11-16T10:35:09.9433820-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:35:16.317621-05:00 | 6.374 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved; distinct boundary unresolved; same combined timestamp not zero effort. Wall includes tool/orchestration, CPU unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 9; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTPersonList.html | 23e52db32f3cf6a6e380db34d1605bf889487a6dfcc5dea1ece8fd5ad9c3fde9 |
| httpdocs/js/FTPersonList.js | fa7e6ee386fafbddacae0f8bbe6c57e055598110b52457609585410f89243d4c |
| httpdocs/js/FTPrivacy.js | 5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced |
| httpdocs/js/inputSanitizer.js | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |

Exact newly delivered report hashes:

WA_FTPersonList_Shared_Function_Review.md: 05605b6344ff23fc88a53d7ec5627cecd400c23874dce6845d4620dc4fc392e4

WA_FTPersonList_Shared_Function_Matrix.csv: 8db311df964f1e4a90850c0e69a6665adea4c5a7b641165f413a6c6ea15f5728

Frozen inventory: e069af30a59dcc250a3a625f0b863c073d5d9c0b9bc1c844945d5835fea926b9

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3/4 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
