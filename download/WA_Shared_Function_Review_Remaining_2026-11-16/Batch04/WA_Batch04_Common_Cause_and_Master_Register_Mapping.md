# Batch 4 - common causes, component evidence and proposed register mappings

Read-only proposals. No authoritative register/testing status changes. Original candidate inventory remains fixed; 60 original candidates, 19 confirmed occurrences, zero additions. Five primary confirmed finding families (not a claim of five independently remediable code defects).

| Primary family | Confirmed original candidates | Common vs local implementation | Required disposition / tests |
| --- | --- | --- | --- |
| RC-HTTP | FM02, FA02, FC02, FPB02, CT02, EV02 (6) | Separate local adapters discard status/code; FTPrivacy23 shared variant also affects FA02. Same invariant, several implementations | CORRECT preserving domain fields; 401/403/423/409/503/offline/cancel/nonJSON; no uncertain mutation replay; S6-008/018/033 |
| B04-PRIVATE-DETAIL | FC03, FPB03, CT03, EV03 (4) | Four page integrations send bearer-only detail requests; Child/Partner mechanics source-diff equivalent | CORRECT explicit privacy acquisition/propagation with owner scope; keep fail-closed423, tree/user/person binding/admin integrity; S6-017/009 |
| RC-FT-HANDOFF | FA04 (1) | Existing unchanged FTPerson FP04: api23 overwrites opt.headers supplied by ensurePageAccess30; Ancestor actually calls openPerson36-39 | Correct once in shared component, test all affected consumers only as authorized; do not count existing FTPerson again |
| B04-ACCESS | FT04, FM06, FA08, FC07, FPB07, CT09, EV09 (7) | Local dialog implementations FT/FM/EV, shared FTPrivacy popup FA, local status/field errors Child/Partner/Contact plus EV subfinding. These are distinct implementations, not one identical root | Preserve separate focus/semantics/labels/aria-invalid/announcement subfindings; scoped correction and keyboard/screen-reader verification |
| B04-CONTACT-DELIVERY | CT06 (1) | Shared contact server sequence create/update/resend commits before send; client lacks persisted-vs-send-failure outcome | Correct partial/uncertain outcome and reconciliation, no replay; synthetic mail-after-commit tests later; S6-018 and WA-DATA-001 |

## Important non-confirmed or existing-only distinctions

B04-IDENTITY: FT03/FM03/FA06/FC05/FPB05/CT07/EV08 lack page-level response fences or identity-keyed caches. Source absence is documented; cross-account disclosure remains unverified. Distinguish current-token reads before send, shared refresh protections, and response/UI application after an account change. Proposed R16 S6-007/027 and R19 asynchronous UI cases do not reopen bounded completed R12/R14 refresh cases.

RC-FT-SCOPE: prior FP03 identifies FTPrivacy8 substring-only URL matching, no same-origin route validation. FA03 imports component but never invokes ensurePageAccess/installPageToken. No active local wrapper installation on this page established. Shared scope correction remains mandatory under prior evidence, not a new leak/defect count for each importer. waPlatform captures fetch before an async FT wrapper can install; any migration needs explicit actual composition tests.

EV04 dateUS unescaped fallback is a contract risk; inspected API supplies DB date fields, no arbitrary-string path/exploit proved. No new XSS candidate count. Current admin dual gate is source positive; older username-only descriptions are documentation drift, not grounds to weaken D01. D06 short/recoverable privacy codes accepted; actual recovery/rate-limit controls not certified. Public Contact email verification is distinct from privacy-code recovery.

## Component evidence registry

Properties reused only when hashes match previous bounded evidence; SHA equality is identity, not universal certification. New integration evidence is per-page. Parent FTPerson artifacts preserved; no current FTPerson HTML/JS reexamination. Narrow FTPrivacy portions re-read only to resolve new Ancestor composition and actual call reachability.

| Component | Relevant functions/properties and standards | Bounded findings | Outstanding limits | SHA-256 |
| --- | --- | --- | --- | --- |
| httpdocs/js/waPlatform.js | WA.session/WA.api/readError; CS-03/05/08; SESSION/API-002 | Same-origin/current credential, Web Locks fail closed, no mutation replay, typed flat/nested parsing retained from earlier batches | Actual business pages here do not delegate; browser T09/T10, identity, D08 pending | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |
| httpdocs/js/usageTracking.js | restore/start/flush/exit; CS-03/08/10 | Normal shared WA.api plus current-token keepalive exit, no unsafe retry | Expiry/logout/BFCache/exact counts/uncertain delivery not globally certified | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| httpdocs/js/inputSanitizer.js | capture click/submit/blur/change/Enter; CS-07/08 | DOMPurify plain-text defense on covered static/dynamic fields; password/typed exclusions | CDN failure retains original string; actual field semantics/output/server validation separate | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 |
| httpdocs/js/FTPrivacy.js | api/status/unlock/openPerson/ensurePageAccess/popup; PRIV-002/SESSION/FRONT | Same hash as prior5355f4...; known header-scope and handoff overwrite; popup accessibility actual new Ancestor use | Dormant scope on ancestor; full privacy-setting/recovery/admin coverage not audited | 5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced |
| routes/ftPrivacy.js | protection/redactPerson/isUnlocked/isAdmin; PRIV-002/ADMIN | Same prior149a76...; user/person/token-expiry binding, nested response redaction and central admin delegate in inspected fragments | Runtime/expiry/cache/recovery/complete admin method coverage open | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | getAdministratorStatus/isVerifiedAdministrator; ADMIN | Same prior107d33...; current row flag1 AND configured normalized name, no username-only fallback in inspected callers | Config/runtime failures, former-name/flag0, full action/integrity matrix untested | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| httpdocs/js/FTInstructions.js | frozen instruction strings; FRONT/SHARED | Fixed local strings used as static HTML on Instructions and text on menu | No account or server authority from explanations | 9c3662afee5b26b77fe8dd17adac0b64ccfb78d74eca2ce887f4cc4418eca402 |
| httpdocs/sw.js | prior cache bypass/allowlist rules; CACHE | Unchanged prior bounded evidence: auth/nonGET/API bypass; asset lifecycle issue remains common | No complete reread; stale clients/versioning/install availability/rollback unverified | 2fc7d3ad3cdd8f528695fec9b77be8cd5eb4634f695ec19536ec0acd0b05bd5e |

Child/Partner companions have DIFFERENT hashes. After both independent inventories, a read-only line diff verified only data/message differences, not hash equality. Equivalent implementation assessments reused accordingly. Other page companions independently read; full unrelated backend excluded.

## Proposed Master Register / remaining Stage 6

60-row CSV maps every original candidate to one primary family, its evidence status, distinct subfindings, existing issue references, verification and disposition. Rows are not new issue allocations. Existing Stage6_OpenItems Master register table is read-only; bounded docs/standard filename/content search found no separate broader WA Master Register/schema. Owner must reconcile keys/schema/existing findings before adopting. WA-CF-003/004/005/011/014/016 are contextual existing items, not changed or closed.

R16 prioritize mandatory privacy/HTTP/outcome issues, relevant S6-017/009/008/018/007/027; public capability wrong/expired/reused/changed-address denials and no-secret/cache scope remain. R16-75 T09 must use actual shared WA.api business consumer, not assume inclusion=use; T10 real unsaved forms/no replay, page-only tests labelled. R17 exact D07 browsers plus focus/error/navigation coverage. R18 no TNNA page/native/device examination. R19 bounded asynchronous identity, repeated-click and capability concurrency proposals; no load/proxy/replay execution. R20 no installation/release; old/new assets, preservation/rollback/environment and independent final review open.

S6-041 original row provenance is unreconciled per current Compliance Register: treat as contextual response-audit reference only, not an allocated delivery issue/severity/status. Preserve dated T12 90/90, T06 3/3, selected T11/R10/R14/R15 evidence exactly; this batch adds no runtime PASS.

All corrections and installation require separate owner approval. No automatic broad rewrite, token-storage design selection, global fetch replacement or appearance change. Mandatory safety corrections separated from optional shared-helper modernization.

## Governing source identities

| Path | SHA-256 |
| --- | --- |
| AGENTS.md | f1dc56f8d5ef961c7195bdb36de5c016ef804771dda00dfb6474667a652bd3dd |
| CLAUDE.md | 1c585afd6cc6ac63941188a451e965b1300adaea97615393d8333e27f332c18e |
| README.md | aeef796d5710fb0a892d48c1c07326937d15fe62495d5c2d642584c23e0c517d |
| server.js | 00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81 |
| TechSummary.md | 62283cfaa0959ab05a9de1f13e4a6108354b42457c573bcf5b4a14f58c9e57c6 |
| docs/Stage6_OpenItems.md | efa544fe603ca97c4daa9909bb9a9214772df9ae86c2f29eacd1e895a8137447 |
| docs/Stage6_Render_TestPlan.md | 67545a4732d3714d8948f081dc495dd61e6ea7137c1bb1ccf5c4eede3b771923 |
| docs/WA_Stage6_R16-R20_Continuation_Handoff_2026-11-15.md | fa1f943aabddad0fd4862ae6653c1ecffaf65f0a4dbd1ff7e143900e6a44b4a4 |
| docs/WA_Standards_Compliance_Register.md | 94dce444aed2f2679ae2579189680a863fa34fe01f19ed993a30fafc327db344 |
| httpdocs/sw.js | 2fc7d3ad3cdd8f528695fec9b77be8cd5eb4634f695ec19536ec0acd0b05bd5e |
| routes/familyTree.js | 0af2b52700afdcc49e9d3068bd000e4f7c350895237c55a3a81c07d6617d6bb0 |
| routes/ftPrivacy.js | 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b |
| services/administratorAccess.js | 107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c |
| standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md | 02ccc4b35e9cc0de4218e23082cf17f0fba444e6f1b9b088a778266fae125361 |
| standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md | f6bb22bac44707bc2ec74e7111d0b3c1e73256958011974cf19929f6d0a50fd0 |
| standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md | 48d944deca7c4d03b465cf66c9082117e187aa8db0221107fffb8812e00e8fb2 |
| httpdocs/js/FTInstructions.js | 9c3662afee5b26b77fe8dd17adac0b64ccfb78d74eca2ce887f4cc4418eca402 |
| httpdocs/js/FTPrivacy.js | 5355f41f25534c8dd8e6d42f37b9a67c932bcc2300ba65148451b179d1eafced |
| httpdocs/js/inputSanitizer.js | eec2fa21e13fb1a3d831d12ffa38a35a72a3fa391ed612cb46553a5743e481c0 |
| httpdocs/js/usageTracking.js | 717e04c20fd1e56e7013aafa9f020fb70304c4d466b2b21f9b6a1434f2bcd138 |
| httpdocs/js/waPlatform.js | 57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d |