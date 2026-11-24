# M03-H03 / WA-PR-003 / IR-03 — replacement verification

Date: November 24, 2026. Intended branch: `reviseLogIn`. Owner approved the five Step A changes as one Step B package. This does not authorize installation, database mutation, commits, synchronization, merges or deployment beyond the established owner-controlled process.

## Baseline and scope

- Authoritative original: Google Drive `My Drive/wonderfulApp/routes/familyTree.js`, file ID `1pC_NFg6-Aq7uQpF_qDynrdodnANUYk8A`, 306261 bytes. Raw downloaded bytes independently hashed; Git blob `451a790cee8b73b431cd1ac9d44a6ed044d550c6`, matching GitHub commit `fd2e1c308b3f8f4e4ff55c6996a5e00a13af5c10` on `reviseLogIn`.
- Original SHA-256: `7930f3165aea158891fbbda2672f9e89fbe4a33e66258f452c09cdaac61aedea` (accepted M03-H02 file).
- Replacement SHA-256: `75b705aed2b6958273e03e1e0bdf97be028f96cd2fc8d860b569b1fe7a3c8906`.
- Reviewed governing requirements: root README mandatory Section 0; previously examined approved Core v1.0, Detailed v0.4.1 (including full verified administrator authority subject to integrity), Decision Register D01–D14, delivery process v1.1; CLAUDE.md and TechSummary.md One Tree workflow; November 24 handoff and previously examined independent reports (M03-H03 / WA-PR-003 / IR-03).
- Exact authoritative browser caller `httpdocs/js/FTOneTreeMerge.js`, line 136–137, emits one decision per group, `different` or `same` with selected older ID, conflict resolutions and retained picture IDs. Existing UI ordering follows the server review group order. No browser file revised.
- Only `POST /one-tree/merge` in `routes/familyTree.js` changes. The complete file outside that handler, including the M03-H02 correction, is byte-identical to the original. No schema change or SQL migration. No changes to other routes, review generation, actual merge mechanics, snapshot implementation, privacy middleware, subscription/authentication or undo logic.

## Full diff accounting

The accompanying unified diff is complete. Six hunks (original line locations):

1. 7214: Preserve omitted decisions as an empty array, but do not silently coerce an explicitly malformed list to empty. Cross-tree review validation now rejects malformed lists. Same-tree path remains untouched.
2. 7262: Replace last-entry-wins Map construction with an explicit validated map. Reject non-array lists, non-object or array elements, invalid or unknown newer IDs, repeated newer IDs (including numeric-string aliases), and unsupported decision types with a marked safe 409 `ONE_TREE_REVIEW_INCOMPLETE` response. Create a separate normalized list. Reuse the already accepted positive safe integer / decimal-string ID parser without modifying it.
3. 7279: Strictly parse older IDs for `same` decisions; keep the existing candidate-membership and duplicate older-ID checks and error semantics.
4. 7292: Construct one allowlisted decision per reviewed group in server review order. Preserve `resolutions` and `keepImageIDs` for valid same decisions, using the existing downstream defaults for absent/non-array selections. Different decisions contain only the newer ID and decision. Arbitrary extra top-level metadata is not persisted. The required decision completeness check is preserved. Empty reviews accept omitted or empty decisions, not nonempty/malformed lists.
5. 7322: Pass the validated normalized list to merge history/snapshot creation rather than raw client input.
6. 7330: Pass that same normalized list to the merge operation rather than raw client input.

Formatting-only changes: none outside the necessary edits; no global formatting or line-ending transformation. Review order normalization is a deliberate decision: current UI already submits that order; raw request ordering is no longer authoritative. Existing same-tree branch ignores decision input as before, because it does not merge Persons. Existing conflict/picture-selection semantics are preserved, not comprehensively revalidated in this change.

## Executed checks

- Original SHA-256 and Git blob verified against the accepted baseline.
- Complete source comparison; byte equality outside the merge handler verified programmatically.
- Unified diff forward application to original reproduced exact replacement; reverse application reproduced exact original in an isolated temporary directory.
- `node --check` passed on replacement and new test runner (isolated Node v22.16.0).
- 47/47 HTTP cases passed on loopback (45 candidate cases plus two original-baseline controls). See exact `M03-H03_offline_test.log`.
- Runner loads the complete route module and existing auth, subscription, administrator, usage, privacy and expected-error modules with synthetic credential verifier, entitlement and DB adapters. The review provider is substituted with controlled server-review fixtures; the two downstream destructive functions are substituted with recording boundaries. Tests exercise the actual route and actual validation, check no attempted SQL mutations, no merge-history calls, no merge calls or usage writes on rejection; compare the exact approved decisions delivered to both boundaries; exercise the actual same-tree relationship helper. Rollback is mocked. Real merge SQL, full review generation, real database, real credentials, browser and R2 are NOT exercised. The two baseline controls demonstrate raw additional/duplicate decisions reaching the mock boundary without any actual merge.
- Native Node HTTP adapter used because Express is unavailable in this isolated container. The identical runner supports local Express via `--express`; local Express test is outstanding. The runner never loads server.js, real database, real external storage or notification adapters, and uses loopback only.

## Remaining acceptance and risk

Run the local Express test as documented in install/INSTALL.md. Any real database merge/undo or browser merge requires a separately agreed synthetic-only test plan and authorization. In particular M03-C01 (arbitrary cross-tree target) and M03-M04 (privacy-state race) remain open; this package does NOT make cross-tree merge safe for release or reopen the deferred One Tree redesign. Production `main` still has M03-H02 and M03-H03; production disposition remains separate. Preserve all earlier accepted results. No live environment was contacted and no authoritative project files were changed.

## Rollback

Restore the exact pre-change `routes/familyTree.js` from the owner's backup or committed baseline, verify original SHA-256 above. Remove only newly added M03-H03 evidence files if desired; retain prior M03-H02 evidence. Revert any later authorized deployment separately under owner control. No database migration was made and this package's offline tests have no persistent database or external side effects.
