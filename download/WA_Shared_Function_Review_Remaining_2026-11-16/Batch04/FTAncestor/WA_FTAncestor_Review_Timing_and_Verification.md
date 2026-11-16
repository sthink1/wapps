# FTAncestor - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:09:59.8549972-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:10:27.829596-05:00 | 27.975 s |
| Inventory saved observed | 2026-11-16T10:10:27.830568-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:11:47.4761956-05:00 | 79.646 s |
| Evidence reconciliation completion observed | 2026-11-16T10:11:47.4761956-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:12:05.426569-05:00 | 17.950 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved: distinct phase boundary unresolved; same combined-completion timestamp is not a zero-duration reconciliation. Tool observation/orchestration included; pure CPU/reasoning durations unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 9; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTAncestor.html | 7440d4e23446d9ee37ad8535b356b6898280d2b11389839f9231f6dc0ed28439 |
| httpdocs/js/FTAncestor.js | de69d0cbcf2ef8c465ac61ec3ef5eac206f26f02ede10d21af841b2e77dcbe81 |
| httpdocs/js/FTPrivacy.js | 5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| middleware/auth.js | 914aa485b426e2f17c87030b7ac60e69273e4b8f4c6bec0c0f272c3d36e6ec33 |
| download/WA_FTPerson_Shared_Function_Review_2026-11-15/WA_FTPerson_Shared_Function_Review.md | feb267e28e5bc031e2ea627acca769d140d87954b75848a2bb14884a051c914c |
| download/WA_FTPerson_Shared_Function_Review_2026-11-15/WA_FTPerson_Review_Timing_and_Verification.md | e66738384483f347b4f5acf2b07f89ae4c99f1f5ad31ed3abd540c2f1d16e217 |

Exact newly delivered report hashes:

WA_FTAncestor_Shared_Function_Review.md: 141d71c1309d2021eb4ce77cb59e9cb8eec201e7101ef7812df5b5ec5980ac5f

WA_FTAncestor_Shared_Function_Matrix.csv: 45f777529221360e61521101e5cc40aa4ea8fa20c2dda6511e5137cae34ac398

Frozen inventory: 6223f194a7d2518c475dc69b0364c2af0a914ad21f3ae44acd1f6e1666ca4763

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
