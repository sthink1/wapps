# Wonderful Apps — M03 Development-Branch Review and Independent Security Review Handoff

**Date:** 2026-11-20  
**Scope:** `reviseLogIn`, M03 One Tree merge privacy only.  
**Review type:** Read-only preliminary technical/security assessment by ChatGPT, **NOT an independent engineer's security sign-off**.  
**Authoritative baseline:** Google Drive `My Drive/wonderfulApp`; these three files were fetched read-only and compared byte-for-byte to the approved 2026-11-20 consolidated M03 ZIP. GitHub `sthink1/wapps` was read-only inspected at `reviseLogIn`.

## 1. Version and provenance

| WA-relative file | Drive SHA-256 / package SHA-256 | Result |
|---|---|---|
| `routes/ftPrivacy.js` | `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576` | MATCH |
| `routes/familyTree.js` | `349020198849ecc82152f5c8d28610c16ac40611d4cb126f044192cce9fec3b6` | MATCH |
| `httpdocs/js/FTOneTreeMerge.js` | `561e4602b8a7ee87c0ab817e700626848a9572d6a512472b04a980dcd875fd59` | MATCH |

**GitHub:** `reviseLogIn` exists. Its three corresponding Git blobs are different from the delivered/Drive copies. The M03 patch is **not yet confirmed committed on GitHub**; preserve owner-controlled commit authority and do not infer that GitHub represents the just-tested local/Drive version.

**Test provenance:** Accepted 11/11 local offline, 8/8 isolated HTTP, 19/19 consolidated source-backed synthetic checks, seven bounded browser observations (two-code review, cancellation, verified admin), and owner-reported successful verification/cleanup of four synthetic Persons and two Trees in `wapps_test`. No successful real merge POST or unauthorized real merge POST was executed. Cleanup reported PASS. Do not repeat these checks without a specific regression reason.

## 2. Source review findings

### M03-R01 — Two-tree review confidentiality: improved, bounded PASS

`ftPrivacy.js` invokes `missingOneTreePrivacy()` on two participating Tree IDs and returns 423 with non-value metadata (missing Person IDs) when private Persons lack valid user/Person-bound unlock tokens. It protects the review even where conflict values lack a PersonID. The browser holds per-Person tokens in page memory and sends them only in request headers. The real-browser two-code workflow and administrator exception were observed passing. This is evidence for the tested paths, not universal disclosure assurance.

### M03-R02 — Two-tree merge POST pre-write guard: source-confirmed, live mutation acceptance OPEN

`routes/familyTree.js` around lines 7195–7229 checks both Trees' private Persons inside the merge transaction before invoking `buildOneTreeReview`, creating the merge record or updating merged relationships. The denial has a safe expected 423 response with a `PRIVATE_LOCKED` code (catch near lines 7313–7321). No real MySQL merge or real 423 merge submission was observed in the browser acceptance session. The synthetic suite exercised rejection before writes, not a full successful merge/undo or their side effects. The independent reviewer should verify transactional atomicity, locking, concurrent privacy changes, target membership/Tree ownership and exact existing merge effects.

### M03-R03 — Same-tree relationship mutation is outside the guard: **REVIEW REQUIRED**

`routes/familyTree.js` around lines 7204–7218 has a same-Tree branch that can call `addRelationshipInTree()` when a bridge is supplied. It runs **before** the new `missingOneTreePrivacy()` check at lines 7220–7227. The package deliberately retained this pre-existing same-Tree behavior. Consequently the M03 guard does **not** establish that same-Tree relationship operations involving private Persons require privacy verification. This is a verified **control-flow gap**, not a demonstrated unauthorized modification: pre-existing Tree permissions, endpoint consumers, and data-integrity checks may constrain it, and its scope may be separate from M03 two-tree merge. Before release, an independent reviewer must classify whether this violates the approved private-person protection or is an intentionally authorized relationship operation. Do not automatically expand the M03 patch or test with existing Persons.

### M03-R04 — Unlock scope and metadata: reviewer check

`ftPrivacy.js` around lines 64–95 accepts a JSON map of per-Person tokens (bounded header length) and verifies tokens using user/Person/hash/expiry. The unlock endpoint around lines 135–203 verifies Tree membership context and rates incorrect codes. The review responds to unauthorized users with PersonID metadata but not Person values. Independent review should verify PersonID metadata is appropriate, the `X-FT-Page-Token` header can safely traverse all supported proxies, and the correct privacy state is used under concurrent changes. No real-world exploitation claim is made.

### M03-R05 — Browser mutation replay: synthetic PASS; actual network uncertainty OPEN

`FTOneTreeMerge.js` around lines 108–123 may repeat GET review requests after code entry, but its merge POST around line 137 is not automatically retried after a 423. No actual timeout/ambiguous-commit merge execution was performed. Preserve the no-replay rule and confirm duplicate-suppression/rollback in the independent transaction review.

## 3. Owner-controlled branch-review disposition

**Read-only review completed; no commit/push/merge/deployment performed.** Exact Drive-to-ZIP source identity is verified. The tests show the intended narrow review behavior for tested cases. **Do not yet label the M03 release/security gate fully closed.** The owner controls any later `reviseLogIn` commit after deciding the disposition of M03-R03 and accepting the independent review.

## 4. Mandatory independent assessment requested

A **separate engineer/security reviewer**, independent of the assistant that prepared the correction, must examine the exact three SHA-256-pinned files, the unified diffs and test evidence in `WA_M03_Consolidated_OneTree_Privacy_2026-11-20.zip`, plus current `server.js`, `services/administratorAccess.js`, relevant auth middleware and the One Tree merge/undo transaction. Request a written PASS/CONDITIONAL/FAIL with evidence for:

1. Full privileged administrator two-gate check and ordinary user Tree/Person authorization.
2. Confidentiality of public/private candidate and derived conflict values, including legacy/nested payloads.
3. Wrong-user/expired/replayed tokens, multiple private Persons, and concurrent privacy changes.
4. Two-tree merge POST denial **before any write or irreversible external side effect**, including exceptional paths.
5. Same-tree bridge bypass M03-R03: release significance, existing permissions, and whether scoped correction or documented deferral is appropriate.
6. Preservation of public review, authorized merge/undo, R2 cleanup, tracking, and no automatic uncertain POST replay.
7. Tests still required (only if they add meaningful coverage) and any release blocker or separate approval needed.

**Explicit exclusions:** No production, staging, GitHub or authoritative Drive modifications; no production DB tests; no new test fixtures or destructive merge without separately approved rollback design. The user has agreed on consolidated testing and no redundant reruns.

## 5. Recommended next decision

Request the separate reviewer's decision on M03-R03 and full merger semantics **before** commit/release. If the review identifies a necessary change, agree on the smallest correction and prepare one full WA-compliant ZIP with diffs, separate per-file verification, hashes, rollback and a single consolidated impacted-test suite. If reviewer accepts the exception, document exact compensating safeguards and release-risk disposition; never equate bounded test passes with universal privacy assurance.
