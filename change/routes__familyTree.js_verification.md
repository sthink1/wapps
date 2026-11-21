# routes/familyTree.js — Original-to-final Verification

**Owner authorization:** 2026-11-20 — narrow relationship Person ID validation, preserving Option B same-Tree code-free relationship and legitimate cross-Tree discovery/merge.

**Baseline:** Authoritative Google Drive `routes/familyTree.js` reviewed and reconciled against existing consolidated M03 delivery; SHA-256 `349020198849ecc82152f5c8d28610c16ac40611d4cb126f044192cce9fec3b6`.

**Final:** SHA-256 `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d`.

## Entire-file comparison

The complete unified diff is in `change/routes__familyTree.js.diff`. Two scoped changes:

1. `addRelationshipInTree`: Validate supported relationship type; require two different positive safe-integer Person IDs; require BOTH Persons already belong to the target Tree before any INSERT/DELETE. Covers same-Tree merge and other callers of this shared helper. The prior unconditional `INSERT IGNORE` remains for compatible existing relationships but can no longer introduce unrelated Persons.
2. `POST /one-tree/merge`: Before `createOneTreeMergeRecord`, bound each supplied bridge endpoint to the **source OR target Tree**. No target-Tree user membership requirement. Continue existing M03 private-Person capability check.

No formatting-only modifications; no other code altered. No changes to HTML, browser JS, database, or administrator checks. SQL and image merging remain governed by existing code. This source-level validation does not certify successful live merges or undo.

## Regression considerations

- Adding an entirely new relationship endpoint previously not in the Tree now receives 403. This is intentionally disallowed within these existing-record relationship helpers, not a blanket restriction on normal Person creation.
- Normal same-Tree relationships among existing Tree Persons retain no privacy prompt.
- Cross-Tree merge can include source and target Tree members and does not require target-Tree membership for caller.
- `addRelationshipInTree` is also called by `/use-existing-person`, so this shared guard applies there; if that route legitimately intended to attach someone missing from the authorized Tree, it will be rejected instead of silently inserting membership. Owner should confirm this behavior during focused local regression.
- Independent security sign-off and real-database acceptance remain outstanding.
