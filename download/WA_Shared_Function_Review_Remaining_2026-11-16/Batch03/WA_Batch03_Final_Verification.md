# Batch 03 - final timing and verification

This supplement completes observed per-file ledgers and records exact report bytes. Current Batch3 report artifacts only; all previous reports/source/registers read-only. No application tests/builds/probes/prints or deployment.

## Actual observed timing

America/New_York (-05:00), November16. Milestones captured from real PowerShell/Python timestamps after inventory, assessment/reconciliation composition and report generation. Deltas are wall-clock bounds including reasoning/composition/tool overhead, not isolated cognitive effort, CPU or uninterrupted source reading. Source discovery and assessment composition can overlap before inventory save; finer internal boundaries are UNRESOLVED, never estimated.

Batch first reliable anchor: 2026-11-16T09:29:13.9334360-05:00. Prior instruction reread unmeasured; no complete assignment-duration claim. Baseline captured 2026-11-16T09:29:49.174556-05:00. First per-file anchor 2026-11-16T09:29:50.629867-05:00. First-page interval includes report-generator adaptation; exact common setup versus page-only effort unresolved. New Print Details module discovery included in budget.html interval.

| File | Start | Inventory complete | Assessment complete observed | Reconciliation complete observed | Reports complete |
| --- | --- | --- | --- | --- | --- |
| BleaseRentForm | 2026-11-16T09:29:50.629867-05:00 | 2026-11-16T09:30:38.272727-05:00 | 2026-11-16T09:31:33.9676264-05:00 | 2026-11-16T09:31:57.1206364-05:00 | 2026-11-16T09:32:13.786068-05:00 |
| BleaseRentReport | 2026-11-16T09:32:15.013358-05:00 | 2026-11-16T09:32:56.638667-05:00 | 2026-11-16T09:32:59.1771633-05:00 | 2026-11-16T09:33:11.2797036-05:00 | 2026-11-16T09:33:27.141553-05:00 |
| BloanForm | 2026-11-16T09:33:28.331424-05:00 | 2026-11-16T09:34:19.328521-05:00 | 2026-11-16T09:34:21.9235918-05:00 | 2026-11-16T09:34:37.4268860-05:00 | 2026-11-16T09:34:50.196597-05:00 |
| BloanReport | 2026-11-16T09:34:51.396170-05:00 | 2026-11-16T09:35:27.305857-05:00 | 2026-11-16T09:35:29.9220060-05:00 | 2026-11-16T09:35:43.7383532-05:00 | 2026-11-16T09:35:56.886188-05:00 |
| BMoney | 2026-11-16T09:35:58.097327-05:00 | 2026-11-16T09:36:41.224434-05:00 | 2026-11-16T09:37:29.2755981-05:00 | 2026-11-16T09:37:43.1672030-05:00 | 2026-11-16T09:37:58.504024-05:00 |
| BmonthBudget | 2026-11-16T09:37:59.741042-05:00 | 2026-11-16T09:39:08.928866-05:00 | 2026-11-16T09:39:11.4882867-05:00 | 2026-11-16T09:39:23.9342814-05:00 | 2026-11-16T09:39:36.997627-05:00 |
| BmonthDetailReport | 2026-11-16T09:39:38.213319-05:00 | 2026-11-16T09:40:16.163044-05:00 | 2026-11-16T09:40:51.7024946-05:00 | 2026-11-16T09:41:05.4069140-05:00 | 2026-11-16T09:41:18.340530-05:00 |
| BoutForm | 2026-11-16T09:41:19.672708-05:00 | 2026-11-16T09:42:19.622665-05:00 | 2026-11-16T09:43:00.3087906-05:00 | 2026-11-16T09:43:14.5441840-05:00 | 2026-11-16T09:43:29.306664-05:00 |
| BoutReport | 2026-11-16T09:43:30.572853-05:00 | 2026-11-16T09:44:01.933009-05:00 | 2026-11-16T09:44:04.5840186-05:00 | 2026-11-16T09:44:20.3494435-05:00 | 2026-11-16T09:44:32.897108-05:00 |
| budget | 2026-11-16T09:44:34.191295-05:00 | 2026-11-16T09:46:29.315315-05:00 | 2026-11-16T09:46:31.9451117-05:00 | 2026-11-16T09:46:54.9364211-05:00 | 2026-11-16T09:47:09.528556-05:00 |
| amortization | 2026-11-16T09:47:10.734011-05:00 | 2026-11-16T09:48:42.126686-05:00 | 2026-11-16T09:48:44.6514025-05:00 | 2026-11-16T09:48:56.5681722-05:00 | 2026-11-16T09:49:10.850549-05:00 |

Inventory saved and report-generation-began timestamps are in the per-file timing reports. The following durations derive only from observed anchors; no pure-phase effort attribution implied.

| File | Start to inventory | Inventory save tail | Saved to assessment | Assessment to reconciliation | Reconciliation to reports complete | Sequential total | Report-generation shell call |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BleaseRentForm | 47.642860 s | 0.000996 s | 55.693903 s | 23.153010 s | 16.665432 s | 143.156201 s | 0.845450 s |
| BleaseRentReport | 41.625309 s | 0.001001 s | 2.537495 s | 12.102540 s | 15.861850 s | 72.128195 s | 0.688915 s |
| BloanForm | 50.997097 s | 0.000993 s | 2.594077 s | 15.503295 s | 12.769711 s | 81.865173 s | 0.721328 s |
| BloanReport | 35.909687 s | 0.000946 s | 2.615203 s | 13.816347 s | 13.147835 s | 65.490018 s | 0.706357 s |
| BMoney | 43.127107 s | 0.000826 s | 48.050338 s | 13.891605 s | 15.336821 s | 120.406697 s | 0.892583 s |
| BmonthBudget | 69.187824 s | 0.000983 s | 2.558437 s | 12.445995 s | 13.063346 s | 97.256585 s | 0.701766 s |
| BmonthDetailReport | 37.949725 s | 0.001031 s | 35.538419 s | 13.704420 s | 12.933616 s | 100.127211 s | 0.715048 s |
| BoutForm | 59.949957 s | 0.001005 s | 40.685120 s | 14.235394 s | 14.762480 s | 129.633956 s | 1.261141 s |
| BoutReport | 31.360156 s | 0.000892 s | 2.650117 s | 15.765425 s | 12.547665 s | 62.324255 s | 0.734339 s |
| budget | 115.124020 s | 0.000736 s | 2.629060 s | 22.991310 s | 14.592135 s | 155.337261 s | 0.723268 s |
| amortization | 91.392675 s | 0.000911 s | 2.523805 s | 11.916770 s | 14.282377 s | 120.116538 s | 0.719005 s |

Sequential per-file sum: **1147.842090 s**. Reliable setup before first file: **36.696431 s**. Inter-file orchestration: **12.378592 s**. Last per-file report through first payload ZIP verification: **528.840084 s** (QA/common-cause/Master mapping/summary/packaging). Total batch through payload verification: **1725.757197 s**.

Eleven report-generation exec_command wall_time_seconds values are measured separately, subtotal **8.7092011 s**. Only this eleven-call subset, not all tools/CPU or model composition. Other shell durations remain individually in tool ledger; no estimated aggregate.

Administrative delay: first Master mapping generation hit a table-parsing assumption before writing its outputs; corrected to use captured source hashes and rerun with exclusive new-file creation. No existing file changed/overwritten. This QA/mapping time is included above. No external-source/approval wait, escalation, sleep or user interruption.

## Archive verification milestone

First47-member payload archive verified in memory at **2026-11-16T09:57:59.690633-05:00**; each member matched staged bytes/SHA-256 and CRC/decompression check. This supplement is member48; final delivered ZIP then created once in exclusive mode and all48 final members independently reverified. Final delivered ZIP time/hash, supplement hash and sealing-tail duration are emitted after checking in the tool receipt/final response. Embedding a later final timestamp or own hash here would alter bytes; no self-reference claimed.

| File | Wait after reports until payload archive check | Start-to-payload-ZIP interval (overlapping) |
| --- | --- | --- |
| BleaseRentForm | 1545.904565 s | 1689.060766 s |
| BleaseRentReport | 1472.549080 s | 1544.677275 s |
| BloanForm | 1389.494036 s | 1471.359209 s |
| BloanReport | 1322.804445 s | 1388.294463 s |
| BMoney | 1201.186609 s | 1321.593306 s |
| BmonthBudget | 1102.693006 s | 1199.949591 s |
| BmonthDetailReport | 1001.350103 s | 1101.477314 s |
| BoutForm | 870.383969 s | 1000.017925 s |
| BoutReport | 806.793525 s | 869.117780 s |
| budget | 650.162077 s | 805.499338 s |
| amortization | 528.840084 s | 648.956622 s |

Start-to-ZIP per-file intervals include work on later pages and must not be summed. Sequential totals plus setup/inter-file/QA/sealing phases provide non-overlapping accounting.

## Completeness and preservation evidence

-11 assigned sources present; sequential discovery, immutable inventories before selected-page prior-finding reconciliation;100 original candidates, zero additions. Prior completed examinations/tests not repeated; no Batch4 source opened.
-33 required per-file reports plus11 frozen JSON inventories. Matrices11/8/11/8/11/8/8/12/8/9/6 rows;14 nonempty columns, unique IDs, original names/classification/ranges preserved, source line bounds checked. UTF-8/exact classification labels validated.
- Independently recomputed100 candidates/19 confirmed candidate gaps/91 verification references/29 modernization references. Counts overlap; common causes and actual component owners separated.
- Proposed mapping CSV99 unique evidence keys representing98 original candidates plus one OF09-ARIA subfinding row.15 nonempty columns; not a defect/candidate denominator. Existing Stage6 master table cross-referenced; broader WA Master schema/IDs unverified. No authoritative register changed.
-855 pre-existing baseline files unchanged at QA, including Batch1/2 reports/ZIPs; final post-seal preservation check reported in tool receipt. Excluded .git/node_modules/.aws/.codex/.agents/.gradle/build; no all-disk/metadata claim. Branch reviseLogIn/HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c unchanged; pre-existing bday/logo deletions and untracked handoff/Wave0/download entries preserved.
- Current output only:11 per-page folders, summary, common-cause report, proposed mapping CSV, this supplement and sibling batch ZIP. No source replacements/.diff/scripts/credentials/private records. No future batch output.
- R10/R14/R15 and November15 R16-75 T12 90/90 bounded offline PASS retained. Later bounded T06/T11 records and open real-browser T09/T10 preserved. No acceptance closure, installed conformance or production approval inferred.

## Exact final staged member SHA-256

Manifest covers final bytes of first47 members. This supplement/archive exact hashes emitted after final generation in tool receipt.

| Member | SHA-256 |
| --- | --- |
| amortization/WA_amortization_Frozen_Inventory.json | 9f4f3ca3e0b54d47a4e378f2b909909dfeab094219575bc6a84935d6a7ada828 |
| amortization/WA_amortization_Review_Timing_and_Verification.md | ac3f3e323f6b48b45de62bca59816bccf186b31e6e3100b0b77906c56080b596 |
| amortization/WA_amortization_Shared_Function_Matrix.csv | f58a9b4f9ad8cd4eec1fb9b19a7320a50d5b02147842b3d6e51cdaf6bdec04a3 |
| amortization/WA_amortization_Shared_Function_Review.md | cd079efa82b77d43c957fb0b162fba93c7bd075d825060dff6c6f1dc5c4ecf46 |
| BleaseRentForm/WA_BleaseRentForm_Frozen_Inventory.json | 7b15a8f65bc7725bd08ad18c11d873d6fb9085574173b36e9e5efbbbc53fa912 |
| BleaseRentForm/WA_BleaseRentForm_Review_Timing_and_Verification.md | bd2a2a0d07a755cdc2dd3e5e728cbbaa9d5b30ce259177160353c623bd3339df |
| BleaseRentForm/WA_BleaseRentForm_Shared_Function_Matrix.csv | 00be1e42386f4c0d75e7da3d1dde285da70b2c8750c029efc3d4645336df012b |
| BleaseRentForm/WA_BleaseRentForm_Shared_Function_Review.md | db1b80aff65070bab25efef21d8e2fcbef99e8fe32aa09b6479a0180b5318ff1 |
| BleaseRentReport/WA_BleaseRentReport_Frozen_Inventory.json | bf6e2b706e39167beadc899a4678b4a387cfe6760fa5fbc13d6d58fa29bbbec0 |
| BleaseRentReport/WA_BleaseRentReport_Review_Timing_and_Verification.md | 640c0040009ebb9a83e4035af62b22deb5a41cbf3d2edf32adb6b037569a8308 |
| BleaseRentReport/WA_BleaseRentReport_Shared_Function_Matrix.csv | 59ef79457c299da208adeb797b5ebf94e5db9c8390497acf29a5a69d522a3646 |
| BleaseRentReport/WA_BleaseRentReport_Shared_Function_Review.md | 83c1140638c0a3551ef07f1cc4b8a3016074c2e8492a90c2383a4279b87a8e88 |
| BloanForm/WA_BloanForm_Frozen_Inventory.json | cea8fef1a28b06662d258264c9ecc75d30060180506852af11063c7845136091 |
| BloanForm/WA_BloanForm_Review_Timing_and_Verification.md | 839a498af6c3af8b43e6584a3b5cdd46b932c606a9da5c0a537d84360d7a80c5 |
| BloanForm/WA_BloanForm_Shared_Function_Matrix.csv | 78cd3505c9e95b322eccefaec9cff761ac2db43eb5d7c572d025399b8b65123a |
| BloanForm/WA_BloanForm_Shared_Function_Review.md | f96c2f72645e3b4c73037eef0c37b314e8cca37cf9c59c80f6881ccfc752000c |
| BloanReport/WA_BloanReport_Frozen_Inventory.json | 2f011272b394dbade81559a787c0d9caa512d2869832bfe2a3eb22fd774576b6 |
| BloanReport/WA_BloanReport_Review_Timing_and_Verification.md | a99d857ef34031f674ac750a8d38fc09dc3820805fefa4037dfee68b9fc7a55c |
| BloanReport/WA_BloanReport_Shared_Function_Matrix.csv | bce9f94324a84e66f39f6efd8ec74c002a9417d624dd695ed7685d32ea6c942f |
| BloanReport/WA_BloanReport_Shared_Function_Review.md | a7cd9d7d9803547fef8db850c71b9db43f20339f3c84ae6c15cf3e632c2d8d2e |
| BMoney/WA_BMoney_Frozen_Inventory.json | 2c4437815c73e804c4caa5e43adcd580983faa07409636d22f30688a3a1e7aef |
| BMoney/WA_BMoney_Review_Timing_and_Verification.md | c0c37c1613421485160ef77b4d2a614dffdb8a92ca7cbe224082892801f36d28 |
| BMoney/WA_BMoney_Shared_Function_Matrix.csv | 25bb0c7235b528207decf896e807b1a4ca05682358fb7f499ac8562b98d6e6bd |
| BMoney/WA_BMoney_Shared_Function_Review.md | e3b1d4122b31da0ca023999ee3079cee7c4da4f1df5d526830b13fda78b8c36e |
| BmonthBudget/WA_BmonthBudget_Frozen_Inventory.json | 8d1d62794fae784ddc383801a4b4d897ca82a2762d4fbd226278bd9d59947f30 |
| BmonthBudget/WA_BmonthBudget_Review_Timing_and_Verification.md | 900f95c2ea0ae68ed8228597177a186a13db638bf82bfe336b35360cce5e1c36 |
| BmonthBudget/WA_BmonthBudget_Shared_Function_Matrix.csv | 4b8fe4f03d41a53c49f742bce02238ad9b0e8ce7ce863c063cbc3f2f34736ff2 |
| BmonthBudget/WA_BmonthBudget_Shared_Function_Review.md | ac27af64d83ff55e0ca0c2672a798e75321f419ad9f7d34196093ea3375ee3c6 |
| BmonthDetailReport/WA_BmonthDetailReport_Frozen_Inventory.json | 9f9218bb052e470fbf9c851a9c4ed6486f3be614f9c3b0d50e0fe0f28fd5ae21 |
| BmonthDetailReport/WA_BmonthDetailReport_Review_Timing_and_Verification.md | 55817ac7cf82fbfa7c0ac79c52a6d535b3d877bfc01c9643088eacbdf1ded1cf |
| BmonthDetailReport/WA_BmonthDetailReport_Shared_Function_Matrix.csv | acf92be4ca4e7c182ef2ed5b6472fa51b4eec2d2043d21d0b3a379bfd64bf00b |
| BmonthDetailReport/WA_BmonthDetailReport_Shared_Function_Review.md | 10d9c9928a9cad9b0541f9dc2f3417b44e5414f8644063b7531f11e53fbbf722 |
| BoutForm/WA_BoutForm_Frozen_Inventory.json | 776c810d74d3f834368392ccdf41bc5782e3c7aed9d7dcd9dadc9e0089c2e43a |
| BoutForm/WA_BoutForm_Review_Timing_and_Verification.md | 82458ba18f9eb5d1e32f4c00c017c42e7c22026ad51f8083a8b28a445c0adfcb |
| BoutForm/WA_BoutForm_Shared_Function_Matrix.csv | 89813e5cebff5dc9d1987359bc1c90239dd25088dd222ca6ad01933a2d7b680a |
| BoutForm/WA_BoutForm_Shared_Function_Review.md | 02589d8186d8b8628d816bde276629022d08c457fa6d207d9e96ce7d75ff9ba9 |
| BoutReport/WA_BoutReport_Frozen_Inventory.json | 2fe8c700332d6919691b90385be2fc73fb711f5743a7c67b395cf0f696be1277 |
| BoutReport/WA_BoutReport_Review_Timing_and_Verification.md | 16c8cb6f3ccc6d2b4e81b251e026f71b37f7f2c412905af0581194e55e1bd848 |
| BoutReport/WA_BoutReport_Shared_Function_Matrix.csv | b2e5aa8d16465f642106a10a893971bc0a820774040c3444481198869bcd10b6 |
| BoutReport/WA_BoutReport_Shared_Function_Review.md | 3f150b6c186ab7308e1e48e1f37a08e1ae2a57374eca3fbfde21705b83d4341b |
| budget/WA_budget_Frozen_Inventory.json | dd967e6463a6eea636bfb723d849482d394c27ab33135daab25f5503aba28872 |
| budget/WA_budget_Review_Timing_and_Verification.md | 1644782b2d13a3d4094e975433dc789e7b03b57e130814559e6232296482dfe8 |
| budget/WA_budget_Shared_Function_Matrix.csv | 4878316cbf60e416351d5e522c884f4b66d5020da53bf10bbdc2e03a65280b6c |
| budget/WA_budget_Shared_Function_Review.md | d697e91cf5939c22f1103102958127edddebdc22509a42fe52c9473c6de30212 |
| WA_Batch03_Common_Cause_and_Master_Register_Mapping.md | 70d670535013d3ece5b318d27a165c91202ec129841dd1e08fb42e2fd3e2e49c |
| WA_Batch03_Proposed_Master_Register_Mapping.csv | 36a7b346e4b3398358018792329436438209d6d3f9f417297b63afe473aafbf8 |
| WA_Batch03_Shared_Function_Summary.md | c05bf6ceef64fd21f518c833959d35acdc22a0a04acb906be0255c141426ad5d |

Approval references: explicit Batch3 authorization/four refinements; original assignment sections5-15; Core v1.0/Detailed v0.4.1 November12 approvals and D01-D14/later3A-3C. Source correction/installation/test/deployment not authorized. STOP after Batch3; new explicit Batch4 instruction required.
