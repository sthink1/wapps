# BleaseRentReport - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T09:32:15.013358-05:00 | Start |
| Independent inventory completed | 2026-11-16T09:32:56.638667-05:00 | 41.625 s |
| Inventory saved observed | 2026-11-16T09:32:56.639668-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T09:32:59.1771633-05:00 | 2.537 s |
| Evidence reconciliation completion observed | 2026-11-16T09:33:11.2797036-05:00 | 12.103 s |
| Report generation began | 2026-11-16T09:33:27.136860-05:00 | 15.857 s |

Missing/unresolved intervals: Shared initial instruction/baseline work before per-file start excluded. Observation anchors include tool scheduling/round-trip overhead; exact internal CPU or reasoning boundaries unresolved. No finer-grained timing estimated..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 8; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

## Exact source/evidence identities

Page read in full. Shared components: unchanged platform/tracker/sanitizer properties reused from completed batches after SHA-256 check, with each new page integration inspected independently. New or specialized dependencies inspected only to the extent stated in the main review; hashes do not imply full audit of entire backend/evidence document. Standards/architecture/testing documents reviewed in relevant portions and prior full reading retained when hashes unchanged.

| Path | SHA-256 |
| --- | --- |
| README.md | aeef796d5710fb0a892d48c1c07326937d15fe62495d5c2d642584c23e0c517d |
| AGENTS.md | f1dc56f8d5ef961c7195bdb36de5c016ef804771dda00dfb6474667a652bd3dd |
| CLAUDE.md | 1c585afd6cc6ac63941188a451e965b1300adaea97615393d8333e27f332c18e |
| TechSummary.md | 62283cfaa0959ab05a9de1f13e4a6108354b42457c573bcf5b4a14f58c9e57c6 |
| standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md | 02ccc4b35e9cc0de4218e23082cf17f0fba444e6f1b9b088a778266fae125361 |
| standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md | f6bb22bac44707bc2ec74e7111d0b3c1e73256958011974cf19929f6d0a50fd0 |
| standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md | 48d944deca7c4d03b465cf66c9082117e187aa8db0221107fffb8812e00e8fb2 |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/Stage6_Render_TestPlan.md | 67545a4732d3714d8948f081dc495dd61e6ea7137c1bb1ccf5c4eede3b771923 |
| docs/WA_Stage6_R16-R20_Continuation_Handoff_2026-11-15.md | fa1f943aabddad0fd4862ae6653c1ecffaf65f0a4dbd1ff7e143900e6a44b4a4 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |
| docs/WA_R16-75_T12_Offline_Results_2026-11-15.md | 93adff06c568e16e957dea0c36fea91cd13d8f0f1e6e6b8efa3fa816a0a432df |
| download/WA_Shared_Function_Review_Remaining_2026-11-16/Batch01/WA_Batch01_Shared_Function_Summary.md | 2531e74f2347188841623a2429f2758800aa3a58a41b55d889a7a1e1b993162b |
| download/WA_Shared_Function_Review_Remaining_2026-11-16/Batch02/WA_Batch02_Shared_Function_Summary.md | b651fbc7aae09e359201905c8ee19af39161342c490ccce101df4ea17ecec866 |
| httpdocs/BleaseRentReport.html | f1bce58b06affbe868e8ffedfa6ab02f4bef72097ad849702c027b76a39f6dca |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| httpdocs/sw.js | 2fc7d3ad3cdd8f528695fec9b77be8cd5eb4634f695ec19536ec0acd0b05bd5e |
| routes/budget.js | b72d8ad1f4176c534d20f39746e34187784a6da335ab4cc700353a629e817767 |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |

Exact newly delivered report hashes:

WA_BleaseRentReport_Shared_Function_Review.md: 83c1140638c0a3551ef07f1cc4b8a3016074c2e8492a90c2383a4279b87a8e88

WA_BleaseRentReport_Shared_Function_Matrix.csv: 59ef79457c299da208adeb797b5ebf94e5db9c8390497acf29a5a69d522a3646

Frozen inventory: bf6e2b706e39167beadc899a4678b4a387cfe6760fa5fbc13d6d58fa29bbbec0

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2 artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
