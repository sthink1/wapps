# M03-C01_M04 — ftPrivacy.js replacement verification

**Date:** 2026-11-24  
**Scope:** owner approved server-side temporary cross-tree restriction; M03-C01 / WA-PR-001 / IR-01, M03-M04 / WA-PR-004 / IR-04 containment.  
**Path:** `routes/ftPrivacy.js` (REPLACE)  
**Branch:** `reviseLogIn`  
**Pinned Git baseline:** `8db2689f06a6ca79c6466793e2f3dab6a22eff76`  
**Authoritative Drive file ID:** `1JB0KUA9UYVqnJcifveWB_lRHpTlfBM9H`  
**Original SHA-256:** `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576`  
**Final SHA-256:** `6e1bedf5b011dac4af7fe8ffc6524632d276b65411fb7456eacc4f307cba3d55`  
**Original raw Git blob:** `6dd14f0d16dfe1a3c95288ad5d9a648448441188`  
**Original LF-normalized Git blob:** `25bf3a539199194b4c89497ed787035eb1ec60ed`  
**Final raw Git blob:** `fd18241292d0e466e34cd1c99446ece3fcd51a15`  
**Final LF-normalized Git blob:** `18206bd3bbdc1d885e2352d21623c2ef2d475229`  
**Byte lengths:** 24401 -> 25161; unified diff 17 added / 1 removed lines.  
**Companion diff:** `change/M03-C01_M04_ftPrivacy.js.diff`

## Authority and standards

Authoritative Drive root README.md §0 and deferred One Tree section; the installed `standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` (approved Core v1.0), `WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` (approved detailed v0.4.1), `WA_Standards_Decision_Register_v1.0_2026-11-12.md`, and `WA_File_Development_and_Delivery_Process.md` v1.1 were consulted for this change. Current CLAUDE.md, TechSummary.md, server mount, authorization/subscription/usage/expected-error helpers, and affected browser caller snapshots were reconciled against the pinned Git commit. Apply CS-01/02/04/05/06/07/09/10/11/12 and WA-PRESERVE-001, WA-FORMAT-001, WA-CORE-001, WA-SEC-ADMIN-001, WA-API-001/002, WA-ERROR-001, WA-PRIV-002, WA-DATA-001, WA-FRONT-001, WA-ENV-001 and WA-REVIEW-001; D01, D03, D04, D12–D14 plus the owner-approved temporary cross-tree suspension. Full compliance of the existing source is not asserted.

## Complete original-to-final comparison

1. Add the source-level constant `ONE_TREE_CROSS_TREE_ENABLED = false` and the shared `requireCrossTreeOneTreeEnabled` expected-client-error guard. No environment override, administrator exception or token override is provided. Re-enabling requires a reviewed source change after the permanent One Tree design and acceptance work.
2. Invoke the guard as the first action inside the specialized `POST /one-tree/unlock/:personID` handler, before parsing input, checking Person membership, querying privacy state, comparing a key or performing any privacy attempt/unlock write. The former handler body is retained byte-for-byte after the guard for future redesign. The existing privacy error handler returns a safe 403 message; it does not add a new response field.
3. In the existing response filter, pass the specific server-generated 403 suspension response directly only when there are no PersonIDs in its payload and the controlled code is `ONE_TREE_UNAVAILABLE`. Avoid unnecessary privacy/admin queries for a data-free denial. Other responses, including ordinary private Person responses and ordinary unlock, retain prior filtering/authorization behavior.
4. Export the shared guard alongside existing exports. The complete ordinary `/unlock/:personID` route body, existing One Tree privacy-check helper and existing special unlock body are preserved.

**Formatting and normalization:** original source had mixed CRLF/LF, with 256 CRLF sequences. Existing line endings are preserved; inserted lines follow the local CRLF convention. No wholesale formatting changes. The authoritative original raw Git blob differs from repository blob solely because of CRLF normalization: replacing CRLF with LF gives exact pinned Git blob. The forward/reverse diff is generated from raw authoritative bytes, not the normalized Git copy. The proposed source is shipped in the raw authoritative style.

The complete unified diff was generated from the exact Drive original and final candidate. Independently applied forward and reverse to disposable copies with `git apply`; the resulting bytes matched the exact candidate and original respectively. No unrelated changes observed in the full diff. Syntax `node --check`: PASS (Node v22.16.0). Source bytes and hashes are verified after packaging. No modifications were made to authoritative resources.

## Independent test and release boundaries

The included runner executed actual registered route handlers with the current authorization, subscription and privacy middleware and synthetic SQL and external-service adapters, over loopback HTTP with a native test dispatch adapter (Node v22.16.0). Review generation, merge-record creation and destructive cross-tree merge helper calls are instrumented at their boundaries; the tests require no calls to those boundaries under suspension. Existing same-tree relationship, ordinary privacy unlock and the existing undo helper use their actual source and synthetic SQL responses. The 52/52 checks include one characterization of a preserved legacy first-Tree enrollment path, not a security clearance of that path. The separate log records all cases. This is not a real MySQL test, actual Express runtime acceptance, browser test or proof of production state. No external storage, email, live databases or deployed services were contacted. Run the installed runner with `--express` in the owner's local WA project before acceptance. Do not rerun older acceptance suites without a specific regression reason. A comprehensive One Tree browser/merge redesign and real cross-tree merge testing are deferred; do not attempt a genuine merge or real undo for this suspension test.

## Residual risk / independent-review gate

The pre-existing no-source-Tree branch of `POST /familytree/use-existing-person` creates target-Tree user membership based on a selected existing Person when no qualifying source Tree is found. This branch is preserved because first-Tree enrollment is not part of the approved cross-tree review/merge suspension and altering it would change ordinary enrollment policy. The synthetic characterization confirms the membership write path; this is a source-confirmed potential authorization exposure, **not an approved security behavior**. Assess enrollment eligibility and effective upstream controls separately before release; do not treat M03-C01/M03-M04 containment as full Tree-authorization clearance. No production testing or real-user access was attempted. Other global search/duplicate disclosure paths and full cross-tree eligibility, privacy-state locking/revalidation, and re-enablement remain outside this limited change. M03-C01 and M03-M04 remain pending local acceptance of the suspension; M03-M04 is containment, not a concurrency correction. The 40-hour planning ceiling remains in force; cumulative actual hours are not verified. The new potentially material finding requires owner review and a separate disposition before release.

## Rollback

Owner only: restore both original route files together from the owner-maintained pre-change `_COPY` backups; confirm the original hashes in the manifest. Because the routes depend on the shared exported guard, never install/rollback one file in isolation. If rollback is needed, leave cross-tree features unavailable to real users until a separately authorized safe containment/release decision; the baseline contains known C01/M04 defects. No schema migration or external compensation is required for this source package. If local tests fail, stop; do not commit or deploy. Prior M03-H02 and M03-H03 results remain bounded evidence, not authorization for unrestricted cross-tree operations.
