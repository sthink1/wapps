# Wonderful Apps — M03 Policy Disposition and Independent Security Review Handoff

**Date:** November 20, 2026  
**Status:** Owner policy decided; preliminary read-only assessment completed; independent security sign-off outstanding  
**Scope:** One Tree review/merge privacy and its pre-existing same-tree relationship branch  
**Destination:** `docs/WA_M03_Policy_Disposition_and_Independent_Security_Handoff_2026-11-20.md`

## 1. Approved owner decision

**Option B — no privacy code is required for an authorized Family Tree member to add or modify a relationship involving a private Person within the same Family Tree.**

This decision applies to the **same-tree relationship operation** associated with the One Tree endpoint. It does **not** remove two-tree review/merge privacy-code checks, expand ordinary user Tree membership, change administrator verification, or authorize other changes to Family Tree security behavior.

**Disposition M03-R03:** The absence of a per-Person privacy-code check in the same-tree branch is **accepted by owner policy**; do not change the branch merely to add that check. This decision does not waive ordinary Tree authorization or data-integrity controls.

## 2. Source-backed control-flow observations

- `routes/familyTree.js` `POST /one-tree/merge` (`~7181–7230`) calls `requireTree()` for the source Tree, resolves the target Person's Tree, and branches if both Tree IDs are equal.
- The same-tree branch may call `addRelationshipInTree()` (`~1050–1096`) and returns before `missingOneTreePrivacy()`. This is consistent with the approved Option B **only as to the privacy-code requirement**.
- `requireTree()` relies on Tree membership (or the centrally verified administrator). The helper `addRelationshipInTree()` inserts a related Person's Tree membership and updates relationship tables; the inspected helper does not explicitly verify both supplied Person IDs belong to the Tree before writing. The precise exploitation and intended behavior require independent assessment. **Do not treat the Option B decision as approval of arbitrary Person IDs or unauthorized Tree access.**
- The different-tree branch calls `missingOneTreePrivacy()` before the main merge write path; the guard is server-side and separate from the browser prompts.
- The source's GET review also returns early for already-same-tree requests, without providing full two-tree review payloads.

## 3. Source identity

These read-only reviewed files match the source identities documented in the earlier M03 review:

| WA-relative file | SHA-256 |
|---|---|
| `routes/familyTree.js` | `349020198849ecc82152f5c8d28610c16ac40611d4cb126f044192cce9fec3b6` |
| `routes/ftPrivacy.js` | `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576` |
| `httpdocs/js/FTOneTreeMerge.js` | `561e4602b8a7ee87c0ab817e700626848a9572d6a512472b04a980dcd875fd59` |

## 4. Accepted testing evidence (do not repeat without a specific reason)

- Local offline tests: **11/11 PASS** (previously recorded).
- Isolated HTTP integration tests: **8/8 PASS** (previously recorded).
- Consolidated source-backed tests: **19/19 PASS** (previously recorded).
- Targeted ordinary-user and administrator real-browser observations: **7/7 PASS** (owner confirmations).
- Synthetic `wapps_test` fixture: owner reported successful setup, guarded verification and cleanup (four Persons, two Family Trees); no successful real merge performed.

**Boundaries:** An unauthorized real-database merge POST, successful real merge/undo, concurrency, all derived disclosures, and all endpoint callers have not been fully tested. No test is claimed beyond the above record.

## 5. Independent security review — specific open questions

An engineer/security reviewer **independent of the correction author** should inspect the pinned source, approved M03 diff, relevant middleware, administrator verification, DB constraints, and endpoint mount order, then issue a written PASS / CONDITIONAL / FAIL:

1. **Same-tree authorized relationship operation:** Verify ordinary source Tree membership and that `focalPersonID`, `relatedPersonID`, and `targetPersonID` cannot be manipulated to mutate unrelated Persons or Trees. Owner's Option B waives **privacy codes**, not membership or ID validation.
2. **Different-tree target authorization:** Determine whether resolving a target Tree solely through `targetPersonID` is intended and allowed, whether private/public data could be exposed to an ordinary user who lacks target Tree membership, and whether other middleware protects the route.
3. **Two-tree review confidentiality:** Verify nested/derived conflict and candidate values remain protected for every private Person.
4. **Capabilities and administrator:** Verify tokens are Person/user/expiry bound, failed unlock throttling, header parsing, token replay behavior, and two-gate administrator authorization.
5. **Merge/undo atomicity:** Verify pre-write privacy checks, transaction rollback, image/R2 side effects, no automatic ambiguous POST replay, and preservation of existing authorized behavior.
6. **Evidence sufficiency:** Identify only targeted additional tests essential to disposition, not blanket repeats of accepted test suites.

**Open risk:** The independently unresolved Person/Tree membership and target-Tree access questions are distinct from the now-decided same-tree *privacy-code* policy. Do not close the security gate on policy approval alone.

## 6. Branch/release controls

- The three source files were previously verified byte-for-byte against the authoritative Google Drive copies and the delivered M03 ZIP. `reviseLogIn` on GitHub was read-only inspected and did not yet match those delivered changes.
- This report changes **no operational code**, no GitHub content, no Google Drive files, no database records, and no deployment.
- Owner controls installation/synchronization and subsequent development-branch commit. No commit, merge, or deployment is implied by this disposition.
- No new M03 implementation is approved. If an independent reviewer finds a defect, use the WA A→B→C→D process to agree the narrow scope first.

## 7. Final provisional status

**M03 privacy-code policy question: CLOSED — Option B accepted for same-tree relationship operations.**  
**M03 independent security assessment: OPEN — external reviewer sign-off required.**  
**Development-branch commit / merge / deployment: NOT AUTHORIZED by this report.**
