# Wonderful Apps — Independent M03 Security Review

**Date:** November 20, 2026  
**Reviewer:** Codex in VS Code  
**Scope:** Stage 6 M03 — Family Tree One Tree privacy and relationship authorization  
**Overall result:** **FAIL**

## A. Executive assessment

M03 is **not suitable for owner-controlled development-branch acceptance in its current form**. The installed local files were compared read-only with the authoritative Google Drive copies and match byte-for-byte. The approved Core Standards v1.0 and Detailed Standards v0.4.1 are effective despite their historical `DRAFT` filenames.

The M03 private-Person capability design has useful controls: capabilities are bound to user and Person, expire, are kept in page memory, verified administrators use the central two-gate service, and the two-tree merge checks private Persons before its main writes. However, three confirmed server-side authorization defects allow manipulated requests to escape the intended operation:

1. a caller can select an arbitrary target Tree for review/merge without a server-verifiable proof that the request came from a legitimate cross-tree relationship operation;
2. the actual same-tree relationship HTTP routes remain outside the new membership-checking helper and accept out-of-tree Person IDs; and
3. the merge accepts extra `same` decisions that were never part of the server-generated duplicate review, allowing arbitrary Person pairs in the two Trees to be merged.

A separate medium-risk privacy time-of-check/time-of-use window is also present. No correction was initiated.

## Standards and authoritative baseline

Reviewed in the required order: root `README.md` Section 0; Core Standards v1.0; Detailed Standards v0.4.1; Decision Register v1.0; `CLAUDE.md`; `TechSummary.md`; `standard/WA_File_Development_and_Delivery_Process.md` v1.1; relevant M03 handoffs, diffs, verification records and accepted evidence; current source, middleware and tests.

The following authoritative Drive files matched the local review copies:

| File | SHA-256 |
| --- | --- |
| `routes/familyTree.js` | `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d` |
| `routes/ftPrivacy.js` | `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576` |
| `httpdocs/js/FTOneTreeMerge.js` | `561e4602b8a7ee87c0ab817e700626848a9572d6a512472b04a980dcd875fd59` |
| `httpdocs/FTOneTreeMerge.html` | `1d78a09658bbb4a2119e2deae2a3a0c167b9fe4310a617b0f101cdf3b6d4c8b4` |
| `services/administratorAccess.js` | `107d3368b4ca7f6d9220f5607af3c3566cfd76fbcfbd48a6084e5c2a96986c8c` |

## B. Findings

### M03-C01 — CRITICAL — Cross-tree merge is not bound to a legitimate initiating operation

**Location:** `routes/familyTree.js:7157-7188`, `7197-7245`, `7282-7304`, `3310-3457`; related initiation path `3537-3612`.

**Evidence:** Both review and merge require authorization only for `sourceFamilyTreeCode`; the target Tree is resolved globally from caller-controlled `targetPersonID`. The POST accepts that target directly and does not require a server-issued, user-bound authorization established by a validated `/use-existing-person` operation. The M03 bridge guard only proves that optional bridge IDs are in either participating Tree. It does not prove the target Tree or merge itself is legitimate. `mergeTreesOneTree()` then moves memberships and relationships, deactivates the source Tree, and marks it merged.

**Realistic impact:** An authenticated Family Tree user who knows or discovers a Person ID can directly address an unrelated Tree. If its private-Person checks are satisfied (or it contains no private Persons), the user can attempt to review and merge that unrelated Tree, changing Tree status, memberships and relationships. This does not require recommending blanket dual membership; the defect is the absence of a narrower legitimacy proof.

**Origin:** Pre-existing One Tree authorization design; M03 retained it and the final bridge guard does not close it.

**Recommended correction:** Issue a short-lived, user-bound, single-purpose server capability only after validating a legitimate cross-tree relationship selection. Bind it to source Tree, target Tree, focal Person, related Person and relationship kind; require it on review and merge; consume or otherwise replay-protect it. Preserve the approved ability to merge without target-Tree membership. Validate the bridge endpoints on their intended sides, not merely against the union of both Trees.

**Blocks acceptance:** **Yes.**

### M03-H02 — HIGH — Same-tree relationship HTTP routes still accept out-of-tree Person IDs

**Location:** `routes/familyTree.js:4778-4819` and `4821-4901` (`POST /relationships`); `4920-4979` and `4981-5023` (`POST /related-person`). The corrected helper is at `1050-1065`.

**Evidence:** `/relationships` verifies that both Person IDs exist globally, then inserts the caller-supplied related Person into the authorized Tree before writing a parent, partner or sibling row. It does not verify that either Person was already in that Tree and does not call the corrected `addRelationshipInTree()` helper. `/related-person` creates a Person but does not verify that caller-controlled `focalPersonID` belongs to the authorized Tree before writing the relationship. The 2026-11-20 M03 diff added membership validation only inside `addRelationshipInTree()`.

**Realistic impact:** A member of Tree A can submit Person IDs from Tree B, attach an unrelated Person to Tree A, or create relationship rows involving an out-of-tree focal Person. This violates the approved rule that same-tree relationship authority is limited to Persons in the authorized Tree. No privacy code is required by policy, but Tree/Person scope remains mandatory.

**Origin:** Pre-existing route code; the M03 relationship-scope correction is incomplete rather than the source of the defect.

**Recommended correction:** Route all existing-record relationship writes through one server helper that first verifies the caller's Tree authority, supported relationship kind, and membership of every existing Person ID in that exact Tree. For `/related-person`, validate the focal Person before creating the new Person or any relationship row. Reject before the first write.

**Blocks acceptance:** **Yes.**

### M03-H03 — HIGH — Extra unreviewed merge decisions can merge arbitrary Person pairs

**Location:** `routes/familyTree.js:7245-7280`, `3310-3345`, and destructive deletion at `3449-3451`.

**Evidence:** The route confirms that every server-generated duplicate group has a decision and validates a selected candidate for those groups. It never rejects additional decision objects whose `newerPersonID` is absent from the review. `mergeTreesOneTree()` independently consumes every caller-supplied `same` decision and checks only that the two Persons belong to the newer and older Trees. It then merges their records and deletes the newer Person.

**Realistic impact:** During an otherwise permitted two-tree merge, a manipulated request can combine two unrelated Person records that the server did not identify as duplicate candidates, move contacts/events/images, and delete the newer Person record.

**Origin:** Pre-existing merge-decision validation; not introduced by the privacy-code changes.

**Recommended correction:** Construct the exact allowed decision set from the freshly rebuilt server review. Reject unknown, duplicate or extra `newerPersonID` entries; for `same`, require the selected older ID to be a current candidate. Pass only the normalized, server-approved decision list to snapshot and merge functions.

**Blocks acceptance:** **Yes.**

### M03-M04 — MEDIUM — Private-state authorization has a concurrency race window

**Location:** `routes/ftPrivacy.js:76-95`; merge use at `routes/familyTree.js:7236-7245`; privacy-setting write at `routes/ftPrivacy.js:209-216`.

**Evidence:** `missingOneTreePrivacy()` reads current private Persons and unlock rows without locking the relevant privacy/person/tree state. The merge then builds the review and performs extensive writes. A concurrent approved privacy change can occur after the check. No final locked revalidation occurs immediately before the merge state transition.

**Realistic impact:** A Person that becomes private during the operation may be merged without the newly required capability. The race window is source-confirmed; a successful runtime race was not demonstrated.

**Origin:** Pre-existing transaction/concurrency design exposed by the M03 privacy gate.

**Recommended correction:** Establish a deterministic lock order for both Trees and relevant privacy rows, then revalidate Tree status, Person membership, privacy state and capabilities inside the merge transaction immediately before mutation. Add one controlled concurrency test.

**Blocks acceptance:** **Yes, unless the owner explicitly accepts this privacy race after independent evidence.**

## C. Requirements verification

| Approved security rule | Result | Basis |
| --- | --- | --- |
| Ordinary users may modify same-tree relationships for authorized Tree Persons without a privacy code | **FAIL** | No-code policy is preserved, but actual HTTP routes do not reliably constrain all Person IDs to the authorized Tree. |
| Legitimate cross-tree One Tree merge may proceed without dual membership | **FAIL** | Dual membership is not required, but the server does not distinguish a legitimate operation from an arbitrary target Tree request. |
| Private Persons remain protected during two-tree review and merge | **NOT VERIFIED** | Strong bounded checks exist and accepted tests pass, but the concurrency window and absence of a full real merge leave the complete claim unverified. |
| Manipulated requests cannot modify unrelated Tree records; relationship IDs are server-validated before writes | **FAIL** | Findings M03-C01, M03-H02 and M03-H03. |
| Centrally verified administrator retains the approved exception | **PASS** | `services/administratorAccess.js:10-29` enforces current `UsersT.IsAdministrator=1` plus normalized `ADMIN_USERNAME`; M03 calls the central service and fails closed on verification error. |
| Transaction integrity and rollback for a complete merge/undo | **NOT VERIFIED** | SQL uses a transaction and cleanup planning, but no complete real-database merge and undo was executed; concurrency is not covered. |
| No material unauthorized disclosure | **FAIL** | An arbitrary target Tree can be addressed for review; private-data capability checks reduce exposure but do not establish operation legitimacy, and public/candidate context may be returned. |

## D. Test-evidence assessment

The reported 11/11, 8/8, 19/19, 7/7, 9/9, 7/7 and rollback results are retained as **bounded accepted evidence**. They were not unnecessarily repeated. They support the privacy-token mechanics, expected denial behavior, administrator exception, browser no-POST-replay behavior, helper-level Tree membership checks and fixture cleanup.

They are insufficient for acceptance because:

- the 9/9 and 7/7 relationship checks extract helper/guard code rather than exercising the real HTTP handlers;
- they do not call `/relationships` or `/related-person` with third-Tree IDs;
- they test only whether bridge IDs are in the union of two Trees, not whether the target merge is legitimate;
- they do not submit extra unreviewed `same` decisions;
- the real-DB harness explicitly does not execute the merge POST; and
- no complete merge/undo or privacy-state concurrency case was tested against the real test database.

Essential additional evidence after correction is limited to: (1) routed HTTP negative tests for the three confirmed manipulation paths with zero-write assertions; (2) a positive legitimate cross-tree flow proving no dual membership is required; (3) rejection of unknown/extra decisions; (4) one controlled full merge-and-undo on synthetic isolated data; and (5) one concurrent privacy-change/merge test. These require separate owner authorization where they mutate a test database.

## E. Regression analysis

- The final M03 helper guard can create a false sense of coverage because duplicate relationship-writing code bypasses it.
- The page-memory capability design and no-automatic-merge-retry behavior are positive and should be preserved.
- The M03 source hashes match Drive, so the findings are against the intended final files rather than stale local copies.
- No evidence was found that M03 changed page layout or appearance; `FTOneTreeMerge.html` is unchanged by the M03 source manifest.
- A narrow correction must preserve existing same-tree no-code behavior, verified-administrator authority, legitimate no-dual-membership merges, snapshot/undo history, and R2 cleanup ordering.

## F. Final recommendation

**FAIL — do not accept M03 into the owner-controlled development branch yet.** Agree on and prepare a narrowly scoped correction for M03-C01, M03-H02 and M03-H03, and disposition M03-M04. Then run only the focused tests listed above and obtain a fresh independent review of the exact final hashes. Do not commit, merge, deploy or alter production based on the existing bounded passes.

No source correction, database operation, GitHub action, commit, merge or deployment was performed during this review.