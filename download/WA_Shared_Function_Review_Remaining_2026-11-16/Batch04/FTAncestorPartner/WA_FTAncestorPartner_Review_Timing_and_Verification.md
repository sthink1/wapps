# FTAncestorPartner - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:13:34.5281880-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:13:54.457120-05:00 | 19.929 s |
| Inventory saved observed | 2026-11-16T10:13:54.457888-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:14:08.8673766-05:00 | 14.409 s |
| Evidence reconciliation completion observed | 2026-11-16T10:14:08.8673766-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:14:24.198617-05:00 | 15.331 s |

Missing/unresolved intervals: Assessment/reconciliation interleaved; separate boundary unresolved. Identical combined-completion anchors do not imply zero reconciliation work. Tool and orchestration overhead included; CPU timing unresolved..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 8; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FTAncestorPartner.html | 1af1c22dd995bf4dfb8f557044f2a509238332cfee29dc53548ba7d3fc3ac232 |
| httpdocs/js/FTAncestorPartner.js | 37df8de8c8742ecb75c183d59545a16f93a81f896a285d75f2fae79727483ee6 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| middleware/auth.js | 914aa485b426e2f17c87030b7ac60e69273e4b8f4c6bec0c0f272c3d36e6ec33 |

Exact newly delivered report hashes:

WA_FTAncestorPartner_Shared_Function_Review.md: 9f1b2a78fe8fb26ba010f68890903b6611c8abce02c5c882891d0e6a955e6a9c

WA_FTAncestorPartner_Shared_Function_Matrix.csv: eeebd12152b4056def7d6322db604c80c95d3285c150cc7c20c5fcfa27dcf3cb

Frozen inventory: 577033c8faf49d98c36164a5f3406741e2562f5d7706863839a4ad1d9586e5be

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
