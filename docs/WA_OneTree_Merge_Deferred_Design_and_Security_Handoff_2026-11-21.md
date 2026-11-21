# Wonderful Apps — Deferred One Tree Merge Design and Security Handoff

**Date:** November 21, 2026  
**Status:** Owner-directed deferral of further One Tree adjustments; design and security issues remain open.  
**Suggested destination:** `docs/WA_OneTree_Merge_Deferred_Design_and_Security_Handoff_2026-11-21.md`  
**Planned future branch:** `oneTreeM`  
**Purpose:** Preserve the November 20–21 discussions and resume them in a separate chat without delaying unrelated WA readiness testing or losing security evidence.

## 1. Owner direction and sequencing

The owner considers One Tree critical to Family Tree functionality, but does not want the entire WA project and testing program held up by the One Tree merge issues. Stop further One Tree adjustments now. Continue unrelated WA acceptance work, preserving accepted results. The planned sequence is to complete the remaining readiness work, obtain the necessary release dispositions and explicit authorization, merge `reviseLogIn` into `main`, then create a new development branch `oneTreeM` from the approved resulting baseline and address One Tree before the broader refactoring program.

**This is a deferral of implementation, not a security PASS, permission to deploy, or acceptance of uncontrolled exploitation.** Codex's critical/high findings remain open. Before allowing affected code onto a production-bound branch, separately determine whether the affected operations must be safely restricted or disabled pending correction, or whether another explicit, evidence-backed disposition is appropriate. A UI-only restriction is insufficient for a server authorization weakness. The owner has not yet approved any particular restriction, merge, deployment, database change or risk exception. Review the shared relationship endpoints as well as the One Tree endpoints: H02 is not necessarily isolated to One Tree. Continue unrelated testing while that release decision is outstanding. Do not imply that deferral alone satisfies the root README's release rules.

## 2. Authority and working rules

- Authoritative Drive: `My Drive/wonderfulApp`, `G:\My Drive\wonderfulApp`, folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`.
- Local WA project: `C:\AppProjectwDB\WonderfulAppsRender`; repository `sthink1/wapps`.
- First read root `README.md`, approved Core and Detailed Standards, Decision Register, `CLAUDE.md`, `TechSummary.md`, and `standard/WA_File_Development_and_Delivery_Process.md` v1.1. Reverify effective versions and current authoritative source. The supplied README section 0 explicitly requires release blockers to be dispositioned and independent review before the release decision.
- ChatGPT access to project files, Drive, GitHub and databases is strictly read-only. Owner installs/synchronizes deliverables. Codex was separately authorized by the owner to write its review report only; this does not authorize future writes.
- Follow A (agree scope and acceptance), B (build complete source ZIP, exact paths, per-file unified diffs, separate verification reports, SHA-256 and rollback), C (owner installs locally then synchronizes Drive), D (controlled acceptance; owner approval before commits, merges and deployments). ZIP documentation: `install/`, `change/`, `docs/`; no `.original` copies or root INSTALL.md.
- Preserve Stage 6 accepted evidence, avoid indiscriminate retesting and general standards remediation. Respect the production-readiness planning budget and reassess unresolved material blockers.

## 3. Decisions made in the November 20–21 discussions

| Subject | Owner decision / status |
|---|---|
| Same-tree relationships | Authorized members may modify relationships among Persons in their authorized Tree without individual privacy codes. Server must enforce Tree scope. |
| Cross-tree membership | Legitimate One Tree merges do not require the initiating user to become a member of both Trees. |
| Target Tree approval | **Option B explicitly selected:** no separate approval from the other Tree's owner; keep merges simple. |
| One Tree privacy codes | **Remove the individual privacy-code requirement during legitimate One Tree review/merge.** The owner reconsidered the previously approved requirement because it complicates or could stop the process. |
| Review visibility | **Option B explicitly selected:** full Person information during a legitimate One Tree review, even for Persons otherwise private. Exact scope of full information (e.g. contacts/images/events) needs definition before implementation; no general authorization to reveal private records outside the review. |
| Privacy after merge | Maintain private status and applicable privacy rules after merging. How to combine public/private flags, credentials, unlocks, and permissions when two records become one remains to be specified. A conservative proposed default is private if either record was private; do not treat this as a final approved technical rule. |
| Relationship conflicts | Owner explicitly wants One Tree to reconcile conflicting family relationships as well as conflicting Person fields. |
| Identity protection | Owner likes the suggestions for discrepancy review, blocking serious unresolved contradictions, and preview/validation. Balanced safeguards were recommended; no detailed thresholds or final implementation rules approved. |
| Scheduling | Defer all further One Tree adjustments; resume on `oneTreeM` before refactoring after the planned `reviseLogIn` integration, subject to release controls. |

These latest decisions supersede earlier One Tree-specific privacy-code policies in historical M03 handoffs. Do not silently change system-wide privacy rules or the approved administrator authority. In particular, full review visibility plus no target consent means arbitrary review is itself a serious confidentiality risk, not just a merge-integrity risk. A token issued on the basis of a caller's self-asserted relationship is not independent evidence of legitimacy.

## 4. Existing evidence and independent review

Original Codex report: `review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md` (owner-reported SHA-256 `876EE344CBD7DB570920E87512036754361DED155F563A29054066E3F9D2DB8E`). Retrieved and read in the November 20 conversation from Drive file ID `1oIB6uoNs6yPdXMeTPR-gfiy1oYDv1dEi`. Overall **FAIL**. Codex reported local and Drive byte-for-byte equality at review time.

| Finding | Review result and future work |
|---|---|
| M03-C01 Critical | Review/merge can address arbitrary target Tree without proof of a legitimate initiating operation. Earlier receipt proposal was only partial mitigation. Define a server-verifiable eligibility rule consistent with no dual membership or target approval, then bind review/commit to that operation, validate both sides, expire/replay-protect. Do not claim a receipt proves truth of a family relationship. |
| M03-H02 High | Actual POST `/relationships` and `/related-person` bypass the corrected `addRelationshipInTree()` guard. Validate every existing Person's membership of the exact authorized Tree before writes; validate focal Person before new Person creation. Assess separately for interim readiness because ordinary relationship functionality is implicated. |
| M03-H03 High | Additional unreviewed `same` decisions can merge arbitrary pairs from participating Trees. Reject unknown, duplicate, extra or stale decisions; normalize only server-generated allowed groups and candidates before mutations. |
| M03-M04 Medium | Source-confirmed privacy check/use race; no demonstrated runtime exploit. Reassess under revised no-code/full-review policy: protect current privacy state, membership, merge eligibility, authorization and preservation of privacy flags against concurrent changes; use deterministic locking/transaction revalidation as appropriate. Do not simply carry forward obsolete privacy-code tests as new acceptance evidence. |

Historical source identifiers from Codex (not current branch guarantees):

- `routes/familyTree.js`: `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d`
- `routes/ftPrivacy.js`: `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576`
- `httpdocs/js/FTOneTreeMerge.js`: `561e4602b8a7ee87c0ab817e700626848a9572d6a512472b04a980dcd875fd59`
- `httpdocs/FTOneTreeMerge.html`: `1d78a09658bbb4a2119e2deae2a3a0c167b9fe4310a617b0f101cdf3b6d4c8b4`

Historical review paths: `routes/familyTree.js` lines 7157–7304 (review/merge), 3310–3457 (merge), 3537–3612 (initiation), 4778–5023 (relationship routes), 1050–1065 (helper); `routes/ftPrivacy.js` 76–95 and 209–216 (privacy). Recheck line numbers on future source. Also inspect `FTPerson.js`, the other One Tree entry paths, middleware, centralized administrator verification and DB constraints.

### Accepted historic testing (bounded)

| Test | Result |
|---|---|
| Original offline | 11/11 PASS |
| Isolated HTTP integration | 8/8 PASS |
| Consolidated privacy offline | 19/19 PASS |
| Real-browser privacy/admin observations | 7/7 PASS |
| Relationship guard offline | 9/9 PASS |
| Source-extracted real-DB assertions | 7/7 PASS |
| Named synthetic fixture absence after rollback | PASS |

Real-DB checks were not full HTTP routes or a complete committed merge/undo. The initial post-rollback harness count assertion had a JavaScript row-access error (`NaN !== 0`); a separate read-only verifier confirmed no named fixtures remained. Keep these historical passes within scope, but privacy-code behavior will deliberately change and affected tests need revision in the future design.

### Superseded correction candidate — HOLD / DO NOT INSTALL

`WA_M03_Codex_Four_Finding_Consolidated_Candidate_2026-11-20.zip` contains proposed `routes/familyTree.js`, `routes/ftPrivacy.js`, focused offline tests, diffs, verification records, and `docs/M03_C01_RESIDUAL_AUTHORIZATION_RISK.md`. Previously reported 14/14 offline checks and syntax checks passed; C01 remained unresolved and full browser/HTTP/DB/concurrency acceptance was not done. The candidate uses the old code-based privacy policy and is no longer the intended implementation. Do not install, merge or treat as independently cleared. Retain as historical reference only. Verify actual branch/Drive/local source before resuming; never assume candidate installation.

## 5. Reconciliation design discussed

Prior discussion described current behavior as user selection of SAME PERSON / DIFFERENT PERSON and older/newer field choices, with partner relationships generally combined rather than explicitly reconciled. Parent transfers may preserve older rows on uniqueness conflicts. Verify actual current source and database constraints before relying on these descriptions; these are not verified guarantees for every relationship type.

### Examples to preserve

1. William Smith in older Tree A has partner Mary, birth year 1940. William in newer Tree B has partner Susan, birth year 1942. Current process was described as permitting a birth-year choice while retaining both partner links. Future process should distinguish legitimate multiple partners from incorrect relationships; neither difference nor absence alone justifies deletion.
2. Tree A William born 1940, died 2020, father James, partner Mary, children John and Susan; Tree B William born 1958, died 2024, father Robert, partner Elizabeth, children Peter and Anne. A common name alone is inadequate. Even if the initiator presses SAME PERSON, combined discrepancies should trigger substantial identity review and potentially a block.
3. A person recorded as dying in 1945 cannot ordinarily be the biological parent of a child born in 1980; investigate the underlying facts and relationship type, rather than silently selecting convenient values. Avoid simplistic assumptions about dates, adoption, step-parenting, multiple partners, historical records and assisted reproduction.

### Proposed safeguards (supported in principle; detailed policy still open)

- Level 1 compatible information: missing versus known values, additional non-conflicting family links. Preserve valid information without unnecessary questions.
- Level 2 conflicting information: display evidence and older/newer choices; allow both when semantically appropriate, or an unresolved discrepancy where safe; allow DIFFERENT PERSON or cancel.
- Level 3 serious identity contradictions: block unresolved high-confidence conflicts and demonstrably invalid ancestry/self-relationships. Let users correct evidence and retry; do not declare identities permanently different solely from imperfect data. No simple repeat-click override of blocking checks.
- Compare name/suffix/maiden name, birth/death date and place, mother/father and relationship type, partners, children, siblings, events and corroborating evidence. Additional relatives are not automatically contradictory.
- Proposed balanced safeguards: stronger than warnings-only, less rigid than blocking every factual difference. Explicitly define measurable rules, acceptable evidence, severity and permitted resolutions before building. Software cannot guarantee historical identity from record similarity alone.

### Proposed process

1. Identify proposed connection and validate eligibility for the specific Trees/Persons without mutation.
2. Compare identity evidence and generate server-authoritative candidate groups and discrepancy classifications.
3. Reconcile Person fields and conflicting family relationships, showing both sets of facts and permitting appropriate choices.
4. Preview resulting Persons, family links, privacy/permission changes, records to be retained/deleted and unresolved issues. Allow cancel without mutation.
5. Validate exact reviewed decisions, eligibility, current state and graph constraints on server; reject stale or manipulated submissions. Commit atomically, audit the decision and preserve a safe recovery/undo path. Coordinate non-transactional storage and notification effects. Never automatically replay an ambiguous merge POST.

## 6. New questions raised by owner — not yet decided

### 6.1 Entering, examining and changing the other Tree

What exactly happens when a user enters another Tree before, during or after One Tree? Separate entering by FamilyTreeCode, switching default Tree, viewing another Person, reviewing a proposed merge, and ordinary membership. Audit existing entry/adoption, discoverability, access, edit, delete and transfer rules. Determine which users can see private/nonprivate details, whose authorization is required, whether temporary review access grants membership or lasting edit authority, and how membership/permissions change after merge and undo. Decide whether merely knowing a code or PersonID is intended to grant those capabilities. Test that review-only visibility cannot automatically grant general edits. Clarify post-merge rights and audit/notification expectations, including former memberships. These questions remain open; do not assume the current implementation is correct or that all other Trees are private property.

### 6.2 Multiple Person matches before combining Trees

Consider requiring more than one credible Person match before One Tree can complete. Define whether this is a hard minimum, evidence-weighted rule, requirement only for a duplicate-based merge, or a warning. Multiple records of the same name or closely related evidence must not be counted as independent corroboration. Consider small Trees, new users, one genuinely shared ancestor, and legitimate cross-tree relationship bridges between two distinct Persons (e.g., marriage) where there may be no duplicate Person at all. Decide the number of matches, evidence quality, false-positive/false-negative tolerance, and whether any narrow alternative eligibility exists. Multiple matches can reduce errors but do not prove identity or permission by themselves. No minimum count has been approved yet.

### 6.3 Other topics for structured design review

- Legitimate cross-tree linkage versus duplicate-person consolidation; whether linking distinct Persons requires whole-Tree merge; possible safe alternatives if eligibility is insufficient.
- How a user establishes legitimate eligibility without target-owner consent; prevent using arbitrary IDs or fabricated matches to gain full private review access. Determine whether existing verified facts or user permissions can support this boundary; if not, revisit the policy or consciously restrict feature access.
- Private/public duplicate flags, privacy-code ownership, inherited privileges, unlock invalidation; review visibility lifespan and minimization of persistent browser/log/cache exposure.
- Relationship types, competing biological parent links, chronology, prohibited graph cycles, multiple partners, missing relationships, duplicate links, conflicts among several candidate groups.
- Contacts, events, images, provenance, conflicting metadata, deduplication, notification recipients and storage side effects; no data loss from silent conflict resolution.
- Surviving Tree/Person identifiers, historical aliases, membership changes, audit history, and correction of an erroneous merge: undo after subsequent edits, split behavior, restoration of records/privacy/rights and external objects.
- Stale previews, concurrent merges/edits, double submissions, transaction locks, retry/replay protection, rollback and recovery; administrator exceptions and abuse auditing.
- Usability: simple normal-case workflow, meaningful exceptions only, preview and clear cancellation; avoid new permission or code prompts unless explicitly approved.

## 7. Future acceptance plan (not authorized for execution now)

At resumption, first conduct Step A design review: reconcile the current source and policy, inventory all entry/review/mutation paths and data contracts, review the latest authoritative relevant test DB dump and ask whether current before requesting missing live queries. Decide eligibility, multiple-match rule, conflict classification, privacy handling, ownership/membership and undo requirements. Obtain explicit implementation approval before B. Keep scope focused on One Tree plus shared safety controls actually required.

Focused acceptance should include real HTTP endpoint checks with zero-write denials for manipulated third-Tree IDs, arbitrary Tree review/commit, extra duplicate decisions and stale/replayed intents; legitimate no-dual-membership/no-target-approval flow under the final policy; privacy preservation and review-bound disclosure; compatible/contradictory identity and relationship examples; new related Person creation; one authorized isolated full merge/undo with synthetic fixtures; concurrent edits/privacy changes and ambiguous response recovery. Exact tests depend on approved requirements. Preserve unrelated tests; test the affected old rules only when relevant. Never operate on production or real personal data for security tests. Require separate owner approval for test DB mutations, verify isolation and cleanup. Obtain fresh independent review (e.g., Codex read-only review) of exact hashes and resolve/restrict/disposition material findings before release.

## 8. References and resume prompt

Keep historical evidence alongside this handoff; locate by exact filename if needed:

- `review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md`
- `docs/WA_M03_Final_Development_Branch_Review_and_Independent_Assessment_Handoff_2026-11-20.md` (historical policy, superseded where stated above)
- `WA_M03_Consolidated_OneTree_Privacy_2026-11-20.zip`
- `WA_M03_Relationship_Person_Scope_Correction_2026-11-20.zip`
- `WA_M03_RealDB_Rollback_Only_Relationship_Acceptance_2026-11-20.zip`
- `WA_M03_Rollback_Verification_Harness_Fix_2026-11-20.zip`
- `WA_M03_Codex_Four_Finding_Consolidated_Candidate_2026-11-20.zip` (HOLD)

Suggested prompt for a future separate chat:

> Continue Wonderful Apps One Tree merge design on the planned `oneTreeM` branch using this November 21, 2026 handoff. First consult the authoritative WA README, standards, current source and Codex independent report. Verify the actual branch and release disposition; do not assume the planned merge or branch creation occurred. Preserve the latest owner decisions: simple legitimate merges without dual membership, target-owner approval or individual privacy codes; full information within legitimate review and privacy maintained after merging. Define how to prevent unauthorized review/edit and incorrect identity merges, including the potential multiple-Person match requirement, relationship reconciliation and undo. Discuss one issue at a time and obtain approval for final requirements before implementing. Preserve historical test evidence and read-only restrictions. Do not install the superseded candidate or modify main, production, Drive, GitHub or local project files.

**End of handoff. No code, database, branch or release action authorized by this document.**
