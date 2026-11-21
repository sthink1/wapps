# Wonderful Apps — M03 Same-Tree Authorization Assessment Addendum

**Date:** 2026-11-20
**Status:** Read-only technical assessment; independent security sign-off NOT completed
**Scope:** M03 same-tree relationship path and its effect on the release decision
**Reference:** `docs/WA_M03_Development_Branch_Preliminary_Security_Review_2026-11-20.md`

## Source identity

Authoritative Google Drive copies inspected read-only:

- `routes/familyTree.js`: SHA-256 `349020198849ecc82152f5c8d28610c16ac40611d4cb126f044192cce9fec3b6`
- `routes/ftPrivacy.js`: SHA-256 `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576`
- `httpdocs/js/FTOneTreeMerge.js`: SHA-256 `561e4602b8a7ee87c0ab817e700626848a9572d6a512472b04a980dcd875fd59`

## Finding M03-R03 — Same-tree relationship path lacks explicit per-Person privacy gate

**Evidence:** `routes/familyTree.js` around lines 7181–7227. The `POST /one-tree/merge` handler validates source Tree membership with `requireTree()`, resolves the `targetPersonID` to a Tree with `getPersonTree()`, and, when source and target Tree IDs are equal, calls `addRelationshipInTree()` if bridge values are supplied. It returns before invoking `missingOneTreePrivacy()`, which guards the distinct-Tree merge path.

**More specific code observation:** `addRelationshipInTree()` around lines 1050–1096 inserts a membership for the related Person, and, for `mother` or `father`, deletes an existing side-specific parent relationship before inserting the requested one. In this helper, there is no explicit Person privacy-code check, nor a pre-write verification that both supplied Person IDs already belong to the source Tree. The route's source-Tree membership check is not equivalent to per-Person privacy authorization. Constraints elsewhere in the application or database may affect actual exploitability and require separate verification.

**Security consequence:** An authenticated ordinary user who is a member of the source Tree may be able to submit a crafted same-tree bridge request to alter relationships involving a private Person without supplying that Person's privacy code. The precise permissions intended for ordinary Tree members, existence of other enforcement and DB constraint behavior have not been independently verified. Therefore this is a confirmed missing guard in the inspected control flow, **not a proven exploited vulnerability**.

**Disposition:** Treat as a provisional release blocker pending owner decision on the expected authorization policy and independent security review. Do not change this pre-existing behavior without explicit scope/implementation approval.

## Related bounded observations

- The distinct-Tree branch calls `missingOneTreePrivacy()` prior to `createOneTreeMergeRecord()` and `mergeTreesOneTree()`. The accepted tests cover expected rejections, two-code browser review and the administrator exception, but not a real successful merge or an unauthorized real DB merge POST.
- The response privacy filter in `routes/ftPrivacy.js` includes a special One Tree review check for all private Persons in both Trees before returning review content; the earlier 7/7 browser observations remain valid for tested cases.
- The undo POST delegates to `undoOneTreeMerge()` where authorization is checked against creator/merger/admin, but rollback/image behavior and concurrent states still need independent review.
- A separate question is whether cross-Tree public-Person merge authorization is adequately scoped; `requireTree()` explicitly verifies source membership but `getPersonTree()` resolves a target Tree by Person ID without an equivalent target membership check in the inspected section. This might be intentional by design; do not label it an exploit without reviewing approved business rules and broader access controls.

## Recommended minimal next actions

1. Confirm whether a user with ordinary membership in a Tree is expressly authorized to change relationships for *private* Persons without entering privacy codes. Clarify whether `focalPersonID` and `relatedPersonID` must both belong to the same Tree before mutation.
2. Obtain an independent engineer/security review of the three SHA-pinned files, the server route mounts, authorization middleware, database constraints, current standards and exact diff. Have that reviewer rate M03-R03 and the target-tree authorization question with evidence.
3. If the intended policy requires private-Person verification for same-tree relationship updates, approve a narrow source correction under A→B→C→D. The implementation should reject invalid Person IDs and missing privacy authorization **before any write**, preserve the two-tree behavior, and have one bounded regression test suite. Do not reuse removed synthetic fixtures or test against production.
4. Document reviewer decision and owner acceptance before any development-branch commit, merge or deployment. Keep the previously accepted tests and successful fixture cleanup unchanged.

## Assessment limits

This addendum was prepared by the same assistant that contributed to the M03 correction; it cannot count as the mandatory independent security assessment. No live endpoint was invoked, no real DB test was run, and no source, Google Drive, GitHub or production content was modified for this assessment. No new implementation was approved or performed.

**Outcome:** M03 remains *conditionally accepted / release gate open*. A narrowly scoped policy decision and independent assessment are required.
