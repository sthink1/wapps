# FamilyTree2 - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:08:07.6683698-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:08:36.637476-05:00 | 28.969 s |
| Inventory saved observed | 2026-11-16T10:08:36.638361-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:09:41.6009759-05:00 | 64.963 s |
| Evidence reconciliation completion observed | 2026-11-16T10:09:41.6009759-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:09:58.611526-05:00 | 17.011 s |

Missing/unresolved intervals: Assessment and reconciliation were interleaved; their distinct boundary is unresolved. The same observed combined-completion anchor is used for both, and zero delta does not mean zero reconciliation work. Initial batch instruction/baseline excluded from this page; internal CPU timing unresolved.

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 9; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| httpdocs/FamilyTree2.html | 93908b6e21c607f8c6fb933aa64f9fbc13868190ca4edcf4df180d15b5f540d6 |
| httpdocs/js/FamilyTreePage.js | d75ea5be56de5db1e55deb38b1d550e5d1e0e3946688bae1d3b74edaf76665f4 |
| httpdocs/js/FTInstructions.js | 9c3662afee5b26b77fe8dd17adac0b64ccfb78d74eca2ce887f4cc4418eca402 |
| httpdocs/js/inputSanitizer.js | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |

Exact newly delivered report hashes:

WA_FamilyTree2_Shared_Function_Review.md: 65d331de37859c0d242c99d14dc060bf654158072348372f63d932f4baadee72

WA_FamilyTree2_Shared_Function_Matrix.csv: e4dc6d285c9683d3d707d3ba774fd5eeec29b77348d10436bbd40b808e4711f3

Frozen inventory: c522e1c98cb8aa9d49f4e7b62a7ffa8c9d1830335eec04bfd66cb8b9c5adedbe

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
