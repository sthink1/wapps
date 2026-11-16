# FTAncestorChild - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:12:06.6847285-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:12:33.903771-05:00 | 27.219 s |
| Inventory saved observed | 2026-11-16T10:12:33.904715-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:13:18.9319363-05:00 | 45.027 s |
| Evidence reconciliation completion observed | 2026-11-16T10:13:18.9319363-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:13:33.324044-05:00 | 14.392 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved; separate boundary unresolved. Identical combined-completion anchors do not imply zero reconciliation work. Tool and orchestration overhead included; CPU timing unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 8; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTAncestorChild.html | fafdf643f5f2eeee9ccebf83f4e8d94d80095567290460d49556630be5d679aa |
| httpdocs/js/FTAncestorChild.js | cf5690b2151f6224636e6a07b64883aa28df835810cf992e1897e777470e45f7 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| middleware/auth.js | 914aa485b426e2f17c87030b7ac60e69273e4b8f4c6bec0c0f272c3d36e6ec33 |

Exact newly delivered report hashes:

WA_FTAncestorChild_Shared_Function_Review.md: dab0c4ecac98ba7ea46f1d505171e75db8d635216ed64a73bb23ad361c44d798

WA_FTAncestorChild_Shared_Function_Matrix.csv: 82e4185c7c030459d802139dc0cc508a10d9c179549e3cc227026ed4a3a4f476

Frozen inventory: aa0d58fe9752b03ed4bb228175cf150496aced7a4619728e11f4307de918a194

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
