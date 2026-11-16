# FTUndoOneTreeMerge - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:37:31.6695931-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:37:56.941414-05:00 | 25.272 s |
| Inventory saved observed | 2026-11-16T10:37:56.942345-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:38:44.9594493-05:00 | 48.017 s |
| Evidence reconciliation completion observed | 2026-11-16T10:38:44.9594493-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:38:51.065075-05:00 | 6.106 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved; distinct boundary unresolved; actual combined anchor not zero effort. Tool/orchestration included, CPU unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 8; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTUndoOneTreeMerge.html | 87da01982de94c5698584c2d0055b6fedfb46d6ef6f560658a1d002fed47d533 |
| httpdocs/js/FTUndoOneTreeMerge.js | e26e5f8f4ba7c1d1d5a91e58c35ea4ac46aa1d40728d854e6068f26a77eb26e5 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |

Exact newly delivered report hashes:

WA_FTUndoOneTreeMerge_Shared_Function_Review.md: af163ac4a4436b129cc4ce9017ff3d9883b2a5511cfa02516109e5b593717f51

WA_FTUndoOneTreeMerge_Shared_Function_Matrix.csv: 5e0107bf83df0dcf3c213b9595e69410bf612b54d352fa0d11b684734ed483b8

Frozen inventory: 79089494b9641d61b0d9dc75e1ebf8e08af960749b83894279146a14303f9c2c

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3/4 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
