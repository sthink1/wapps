# FamilyTree - timing and verification

America/New_York offset -05:00, November 16. Wall-clock differences between actual observed timestamps; not CPU/model execution time. Assessment/reconciliation anchors are captured after those tasks are composed, not inferred from a prior source-read time. Report generation completes after this ledger is sealed and is therefore recorded in the batch final-verification supplement. ZIP verification follows the sequential file work; per-file waiting and overlapping start-to-ZIP intervals are reported separately. No future timestamps invented.

| Milestone | Observed timestamp | Delta from preceding anchor |
| --- | --- | --- |
| Examination start observed | 2026-11-16T10:06:11.3615982-05:00 | Start |
| Independent inventory completed | 2026-11-16T10:07:03.729524-05:00 | 52.368 s |
| Inventory saved observed | 2026-11-16T10:07:03.730774-05:00 | 0.001 s |
| Assessment completion observed | 2026-11-16T10:07:52.6330962-05:00 | 48.902 s |
| Evidence reconciliation completion observed | 2026-11-16T10:07:52.6330962-05:00 | 0.000 s |
| Report generation began | 2026-11-16T10:08:06.423820-05:00 | 13.791 s |

Missing/unresolved intervals: Shared initial instruction/baseline work before per-file start excluded. Observation anchors include tool scheduling/round-trip overhead; exact internal CPU or reasoning boundaries unresolved. No finer-grained timing estimated..

Phase durations above are bounded wall-clock intervals, including reasoning, tool calls and orchestration. Shell durations are individually available in the tool ledger; per-file shell subtotal not separately instrumented. No external-source/approval wait, sleep, user interruption or application execution.

## Discovery and report completeness

Frozen candidate count 6; post-reconciliation additions 0. Independent source inspection precedes selected-page register/prior-findings reconciliation. Names, source ranges, A/B/C classifications, rationale, local responsibility and confidence preserved in original JSON and main report. CSV has exactly one row per candidate and all 14 required columns; report-generation checks validate row count/IDs/nonempty cells and source line bounds.

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
| httpdocs/FamilyTree.html | aabbf1a3f771cdc46ec836b934f38d2acbbd286fb93aff548f3e3ee69ed38b55 |
| httpdocs/js/FTInstructions.js | 9c3662afee5b26b77fe8dd17adac0b64ccfb78d74eca2ce887f4cc4418eca402 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/Stage6_Render_TestPlan.md | 67545a4732d3714d8948f081dc495dd61e6ea7137c1bb1ccf5c4eede3b771923 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |
| docs/WA_Stage6_R16-R20_Continuation_Handoff_2026-11-15.md | fa1f943aabddad0fd4862ae6653c1ecffaf65f0a4dbd1ff7e143900e6a44b4a4 |

Exact newly delivered report hashes:

WA_FamilyTree_Shared_Function_Review.md: 90cf7a3ceb6e906ad8361b5c625d9fb6eb5b497f7c89f503c8a727ebcdef3d14

WA_FamilyTree_Shared_Function_Matrix.csv: 9bfb39dbc65b358f3fdd66476c7514fdc2f80aada99e5ebf76fc43d6b819edcf

Frozen inventory: 228aecd89ce6128b6850e6ec5a840ce6ba3836b411335a0d94bbb9fc568ba11c

Timing report and final package hashes are in the final verification manifest/tool ledger; no self-referential hash is claimed. Source page SHA-256 is rechecked here and full pre-existing baseline is checked at batch finalization. Batch 1/2/3 and FTPerson artifacts remain preserved.

All existing WA files read-only. Pre-existing bday/logo deletions and untracked handoff/Wave0/download state unchanged. Packaging checks (CSV/hash/ZIP integrity) do not constitute application tests or acceptance PASS. No credentials/private record values copied into reports.
