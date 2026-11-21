# Wonderful Apps — M03 Targeted Authorization Source Assessment

**Date:** 2026-11-20  
**Classification:** Source-backed preliminary finding; not independent sign-off  
**Scope:** `GET /familytree/one-tree/review`, `POST /familytree/one-tree/merge`, same-tree relationship bridge, and available November 19 test-database dump.  
**No live requests, database changes, commits, merges or deployments were performed.**

## Owner-approved policy

**Option B:** An authorized member may create or modify a relationship involving a private Person in the same Family Tree without entering that Person's privacy code. This waives a **privacy-code prompt**, not valid Tree membership, target authorization, or integrity checks. The separate two-tree privacy guard remains mandatory.

## F1 — Same-tree relationship accepts nonmember Person IDs (source-confirmed control gap)

- In `familyTree.js` `POST /one-tree/merge` near lines 7181–7220, `requireTree` validates the user's membership in the **source Tree**; `getPersonTree(targetPersonID)` establishes the target Person's resolved Tree, and the same-tree branch can invoke `addRelationshipInTree(c, sourceTreeID, userID, bridge.focalPersonID, bridge.relatedPersonID, bridge.relationshipKind)`.
- Neither this branch nor `addRelationshipInTree` (around lines 1050–1096) checks that the request-supplied **focal** and **related** IDs both belong to that Tree. In particular, `bridge.relatedPersonID` can override the validated `targetPersonID` when nonzero.
- The helper runs `INSERT IGNORE` for `related` into `FTFamilyTreePersonT` and can change `FTParentT`, `FTSiblingT` or `FTPartnerT`; adding a foreign existing Person to the source Tree is not an authorized same-tree relationship merely because `targetPersonID` refers to a genuine member.
- The inspected SQL dump shows unique keys on `(FamilyTreeID,PersonID)` and relationship FKs enforcing that referenced Persons exist. Those constraints do not establish that both Persons were members of the source Tree when the relationship operation was authorized.
- **Preliminary severity: potentially significant authorization/integrity defect** for manipulated direct API calls. No live exploit was attempted; affected identity and endpoint reachability must be independently validated.
- **Disposition:** This is separate from the now-accepted Option B privacy-code policy. Do not classify it as accepted solely because no privacy code is required.

## F2 — Different-tree review/merge lacks explicit target Tree user-access check (source-confirmed omission)

- The routes `GET /one-tree/review` (around 7141–7178) and `POST /one-tree/merge` (around 7181–7230) require source-Tree access through `requireTree`, but resolve the **target** via `getPersonTree(c,targetPersonID)` rather than `requireTree`/`userHasTree` for the target Tree.
- The GET builds review candidates from both Trees using `buildOneTreeReview`, which can include personal facts, conflict values and associated records. The private-Person response filter performs an all-private-Person capability check before returning this review, but that is **not equivalent to validating ordinary membership in the target Tree**.
- If a target Tree contains only public Persons, the checked source code has no missing-private-capability denial. If it contains private Persons, correct per-Person capabilities (or administrator status) may satisfy privacy checks while target membership remains unchecked.
- The POST likewise verifies privacy unlocks for private Persons before merge, but source alone does not show a target-Tree user membership requirement. It can proceed to `mergeTreesOneTree` if review decisions validate.
- `server.js` establishes JWT authentication and `requireAppAccess('family_tree')` upstream; these are **app-level authorization** and do not supply the missing per-Tree authorization.
- **Preliminary severity: potentially high** if target Tree inclusion is intended to require target membership; this may permit unauthorized target-Tree review or merge. No live exploitation was performed. Review must establish the approved intended cross-Tree selection/merge policy before choosing a fix.

## Confirmed protective controls

- The two-tree merge POST invokes `missingOneTreePrivacy` before `mergeTreesOneTree` and protects review content through the privacy response middleware; private records require per-Person user-scoped, time-limited capabilities or verified administrator access.
- JWT, app subscription/access middleware and the Family Tree privacy middleware are mounted before the Family Tree routes.
- Browser-level accepted scenarios and earlier isolated tests remain valid, but do not prove F1/F2 impossible for manually crafted requests.

## Suggested narrow decision and independent review gate

**Do not proceed to a development-branch commit or deployment based solely on M03 privacy tests.** Obtain a separate, independent review focused on F1 and F2; ensure the reviewer examines exact routing and intended policies and provides evidence-backed PASS, CONDITIONAL or FAIL. The owner needs to approve the Tree-access policy for cross-Tree review and merging if undocumented.

For a minimal correction, consider enforcing source-Tree membership and explicit, context-appropriate membership validation for bridge Person IDs, and deciding whether target Tree membership or a constrained invitation/consent is required before review or merge. This is a proposal for Step A discussion, **not an authorized source change**.

**No repeat of already-accepted M03 browser or offline suites is warranted without an identified regression risk.** If F1/F2 lead to corrections, add focused negative HTTP tests using synthetic isolated records and verify no mutation after denial; do not attempt unapproved real merges.

## Source files checked (SHA-256)

| File | SHA-256 |
|---|---|
| `familyTree.js` | `349020198849ecc82152f5c8d28610c16ac40611d4cb126f044192cce9fec3b6` |
| `ftPrivacy.js` | `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576` |
| `server.js` | `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81` |
| `wappsHelioTestDump.sql` | `e306575dd35a868bea44c91ac80169508ed6c0f239f39324527e5f6124e46f56` |

## Decision and evidence boundaries

- **Option B privacy code exception:** closed/accepted.
- **F1, F2 membership and integrity authorization:** open pending independent assessment and owner approval of any corrective scope.
- **Independent security assessment:** not performed; this document is a source inspection by the same assistant that worked on M03.
- **M03 release:** not authorized.
