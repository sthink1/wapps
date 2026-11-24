# M03-C01_M04 — familyTree.js replacement verification

**Date:** 2026-11-24  
**Scope:** owner approved server-side temporary cross-tree restriction; M03-C01 / WA-PR-001 / IR-01, M03-M04 / WA-PR-004 / IR-04 containment.  
**Path:** `routes/familyTree.js` (REPLACE)  
**Branch:** `reviseLogIn`  
**Pinned Git baseline:** `8db2689f06a6ca79c6466793e2f3dab6a22eff76`  
**Authoritative Drive file ID:** `1pC_NFg6-Aq7uQpF_qDynrdodnANUYk8A`  
**Original SHA-256:** `75b705aed2b6958273e03e1e0bdf97be028f96cd2fc8d860b569b1fe7a3c8906`  
**Final SHA-256:** `c833499893f49ca11dea9ac8f3c09dc626fd55077e3f83d1052970a0527931f1`  
**Original raw Git blob:** `942d3cf08b2b5cb91902e5d8101b0c275ac11945`  
**Original LF-normalized Git blob:** `942d3cf08b2b5cb91902e5d8101b0c275ac11945`  
**Final raw Git blob:** `440a323df0861f43026d1cce7b7037de1c018508`  
**Final LF-normalized Git blob:** `440a323df0861f43026d1cce7b7037de1c018508`  
**Byte lengths:** 307747 -> 308778; unified diff 36 added / 11 removed lines.  
**Companion diff:** `change/M03-C01_M04_familyTree.js.diff`

## Authority and standards

Authoritative Drive root README.md §0 and deferred One Tree section; the installed `standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` (approved Core v1.0), `WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` (approved detailed v0.4.1), `WA_Standards_Decision_Register_v1.0_2026-11-12.md`, and `WA_File_Development_and_Delivery_Process.md` v1.1 were consulted for this change. Current CLAUDE.md, TechSummary.md, server mount, authorization/subscription/usage/expected-error helpers, and affected browser caller snapshots were reconciled against the pinned Git commit. Apply CS-01/02/04/05/06/07/09/10/11/12 and WA-PRESERVE-001, WA-FORMAT-001, WA-CORE-001, WA-SEC-ADMIN-001, WA-API-001/002, WA-ERROR-001, WA-PRIV-002, WA-DATA-001, WA-FRONT-001, WA-ENV-001 and WA-REVIEW-001; D01, D03, D04, D12–D14 plus the owner-approved temporary cross-tree suspension. Full compliance of the existing source is not asserted.

## Complete original-to-final comparison

1. Import the shared `requireCrossTreeOneTreeEnabled` guard from `./ftPrivacy`.
2. Add `resolveOneTreeTarget` beside the existing Person-to-Tree lookup. When a source Tree exists, establish exact membership in that authorized Tree before the global target lookup; reject unknown or foreign Persons identically while suspended. Reject absent/mismatching resolved Tree as well. Valid same-tree and active alias paths are retained.
3. Guard `oneTreeReviewNeededResponse` before `buildOneTreeReview`, so `use-existing-person` cannot generate a cross-tree review through an indirect caller. Move target resolution after source determination for this endpoint, and use the shared target helper when source exists. Keep the no-source enrollment branch and same-tree relationship branch as previously implemented. Source authorization/target-error evaluation order intentionally changes: unauthorized source requests cannot learn target existence from the former target-first check.
4. In GET `/one-tree/review`, resolve through the same target helper, guard the cross-tree branch before review generation, and return the optional controlled `ONE_TREE_UNAVAILABLE` response code using the existing expected-error helper. For other errors the undefined code is omitted by JSON serialization.
5. In POST `/one-tree/merge`, resolve through the same target helper and guard immediately before existing cross-tree privacy checks, before review construction, snapshot, merge-history writes, Person consolidation and R2 work. The complete accepted H03 decision-validation and subsequent write/error-handling block is byte-identical.

**Preservation evidence:** `addRelationshipInTree`, full `/relationships` and `/related-person` route bodies, `mergeTreesOneTree`, `undoOneTreeMerge`, all three undo route bodies and the H03 merge block are byte-identical. No HTML, CSS, client JS, database schema, dependency, startup or configuration edits. The only affected operations are the approved cross-tree suspension and necessary source-before-target validation. Current callers `FTOneTreeMerge.js`, `FTPerson.js`, `FTPersonNew.js` already consume controlled non-success responses and display `data.message`; the old 409 review-required redirect will not fire on the new 403. No browser rendering was executed. `FTUndoOneTreeMerge.js` and undo authorization are unchanged. No claim that all legacy join/search behavior is secure.

The complete unified diff was generated from the exact Drive original and final candidate. Independently applied forward and reverse to disposable copies with `git apply`; the resulting bytes matched the exact candidate and original respectively. No unrelated changes observed in the full diff. Syntax `node --check`: PASS (Node v22.16.0). Source bytes and hashes are verified after packaging. No modifications were made to authoritative resources.

## Independent test and release boundaries

The included runner executed actual registered route handlers with the current authorization, subscription and privacy middleware and synthetic SQL and external-service adapters, over loopback HTTP with a native test dispatch adapter (Node v22.16.0). Review generation, merge-record creation and destructive cross-tree merge helper calls are instrumented at their boundaries; the tests require no calls to those boundaries under suspension. Existing same-tree relationship, ordinary privacy unlock and the existing undo helper use their actual source and synthetic SQL responses. The 52/52 checks include one characterization of a preserved legacy first-Tree enrollment path, not a security clearance of that path. The separate log records all cases. This is not a real MySQL test, actual Express runtime acceptance, browser test or proof of production state. No external storage, email, live databases or deployed services were contacted. Run the installed runner with `--express` in the owner's local WA project before acceptance. Do not rerun older acceptance suites without a specific regression reason. A comprehensive One Tree browser/merge redesign and real cross-tree merge testing are deferred; do not attempt a genuine merge or real undo for this suspension test.

## Residual risk / independent-review gate

The pre-existing no-source-Tree branch of `POST /familytree/use-existing-person` creates target-Tree user membership based on a selected existing Person when no qualifying source Tree is found. This branch is preserved because first-Tree enrollment is not part of the approved cross-tree review/merge suspension and altering it would change ordinary enrollment policy. The synthetic characterization confirms the membership write path; this is a source-confirmed potential authorization exposure, **not an approved security behavior**. Assess enrollment eligibility and effective upstream controls separately before release; do not treat M03-C01/M03-M04 containment as full Tree-authorization clearance. No production testing or real-user access was attempted. Other global search/duplicate disclosure paths and full cross-tree eligibility, privacy-state locking/revalidation, and re-enablement remain outside this limited change. M03-C01 and M03-M04 remain pending local acceptance of the suspension; M03-M04 is containment, not a concurrency correction. The 40-hour planning ceiling remains in force; cumulative actual hours are not verified. The new potentially material finding requires owner review and a separate disposition before release.

## Rollback

Owner only: restore both original route files together from the owner-maintained pre-change `_COPY` backups; confirm the original hashes in the manifest. Because the routes depend on the shared exported guard, never install/rollback one file in isolation. If rollback is needed, leave cross-tree features unavailable to real users until a separately authorized safe containment/release decision; the baseline contains known C01/M04 defects. No schema migration or external compensation is required for this source package. If local tests fail, stop; do not commit or deploy. Prior M03-H02 and M03-H03 results remain bounded evidence, not authorization for unrestricted cross-tree operations.
