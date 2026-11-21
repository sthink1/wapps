# Wonderful Apps — M03 Manipulated-Request Authorization Review

**Date:** 2026-11-20  
**Status:** Read-only source findings; no exploit attempted; independent security sign-off outstanding  
**Scope:** `routes/familyTree.js` — `POST /one-tree/merge` and associated helpers  
**Owner-approved policy:** Same-tree relationship changes require membership in the Tree, not a Person privacy code. A legitimate different-tree One Tree merge does not require membership in both Trees. Manipulated requests must not modify unrelated records.

## Finding 1 — Same-tree relationship ID scope not enforced

- `routes/familyTree.js` around lines 7196–7217: authenticates the caller and calls `requireTree` on `sourceFamilyTreeCode`; obtains a Tree for `targetPersonID`; if source and target Trees are the same, it forwards caller-controlled `bridge.focalPersonID`, `bridge.relatedPersonID` and `bridge.relationshipKind` to `addRelationshipInTree`.
- Around lines 1050–1096: `addRelationshipInTree` adds `related` to `FTFamilyTreePersonT` using `INSERT IGNORE` and creates a parent, sibling or partner relationship; no explicit verification that **both** bridge Persons already belong to the authorized Tree. Existing foreign keys on individual Person IDs, if any, are not equivalent to a membership/authorization check.
- **Risk:** A crafted authenticated request could attempt to create a cross-Tree membership or relationship through the same-tree branch. Precise runtime outcomes depend on DB constraints and other middleware; no live exploit was attempted.
- **Narrow requirement:** For the same-tree path, validate that both relationship Person IDs belong to the authorized Tree before any write, and that the chosen relationship kind is valid. Do **not** require a privacy code solely for the same-tree relationship.

## Finding 2 — Different-tree merge bridge ID scope not enforced

- Around lines 7223–7228: `missingOneTreePrivacy` checks the private Persons for source and target Trees; this existing check must be preserved.
- Around lines 7230–7265: duplicate decisions are limited to reviewed candidate groups; around lines 3300–3330 `mergeTreesOneTree` verifies the chosen duplicate pair belongs to its intended Trees. This is an existing positive control.
- Around lines 7266–7288: caller-controlled bridge Person IDs are normalized but not explicitly bounded to the two Trees. Around lines 3455–3467, `mergeTreesOneTree` maps these IDs and calls `addRelationshipInTree` in the surviving Tree. The helper does not establish that both original bridge Persons were in the participating Trees.
- **Risk:** A crafted merge request could attempt to attach an unrelated third-tree Person or relationship to the surviving Tree while a legitimate two-tree merge otherwise proceeds. A successful exploit was **not** demonstrated.
- **Narrow requirement:** Confirm pre-merge bridge Person IDs belong to the **source or target Tree**; confirm the intended relationship endpoints are valid after deduplication/mapping and before writes. Do not impose a blanket requirement that the caller belong to both Trees.

## Other related observations

- `GET /one-tree/review` around lines 7141–7179 validates source Tree access and target Person's active Tree and returns early for same Tree. Cross-Tree discovery is intentional under the owner's approved One Tree policy; absent target membership alone is **not** a defect.
- Security controls should live on the server: `FTOneTreeMerge.html` does not provide direct relationship editing controls, but crafted requests can address the endpoint directly.
- `withTx` around lines 99–120 wraps the POST work in a SQL transaction. This limits partial SQL modifications on failure but cannot replace authorization validation.
- No review of all Family Tree endpoints was performed; no claim is made about their authorization posture.

## Disposition and next gate

**Policy: agreed. Source validation findings: open.** The evidence supports a **narrow correction proposal**, but does not approve implementation on its own. Under the WA A→B→C→D workflow, request explicit approval of the exact server-side validation changes and targeted acceptance criteria before preparing a replacement ZIP. Keep prior accepted M03 results and fixture cleanup intact; do not repeat broad suites without regression-specific justification.

**Targeted acceptance criteria for a future approved correction:**
1. A same-tree relationship between two actual members of the source Tree remains allowed with no privacy code.
2. A same-tree request whose focal or related Person is outside that Tree is rejected before any write.
3. A legitimate cross-Tree merge initiated by a source-Tree member still works without target-Tree membership, subject to the existing privacy-code policy.
4. Cross-Tree bridge IDs outside both merging Trees are rejected before merge writes.
5. Previously accepted M03 privacy authorization behavior remains unchanged; no automatic POST replay; rollback/undo behavior is not silently altered.
6. Every changed file is compared against authoritative source with unified diff, separate verification report, SHA-256 evidence and rollback guidance in one coherent ZIP.

**Operational changes:** None. No DB commands, file changes in the authoritative project, GitHub edits, branch edits, merges or deployments were performed.
