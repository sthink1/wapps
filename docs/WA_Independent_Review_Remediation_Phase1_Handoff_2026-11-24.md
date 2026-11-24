# Wonderful Apps — Independent Review Remediation: Phase 1 / M03-H02 Handoff

**Handoff date:** November 24, 2026  
**Project:** Wonderful Apps (WA)  
**Status:** Planning and read-only investigation only; **no remediation, test execution, merge, or deployment authorized by this handoff**  
**Next chat entry point:** Phase 1, first issue **M03-H02 / WA-PR-002 / Claude IR-02**  
**Authoritative location:** Google Drive `My Drive/wonderfulApp` (folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`); local mirror `G:\My Drive\wonderfulApp`  
**Code repository (read-only to assistant):** `sthink1/wapps`

## 1. Owner decision and immediate objective

The owner **approved the six-phase path forward** after comparing the two November 23 independent reviews. Continue in a new conversation, beginning with **Phase 1 — determine immediate Family Tree authorization exposure**, and **Step A — agree the narrow design and acceptance requirements** for the first correction. The first issue is **M03-H02**, because it affects ordinary Family Tree relationship endpoints beyond the deferred cross-tree One Tree merge feature.

**Next deliverable:** a clearly sourced, read-only analysis of exact relationship-route authorization behavior, production/staging source differences, dependencies and legitimate workflows, with a *proposed* minimal remediation scope, regression safeguards, exact acceptance criteria, and an approval decision requested only once that Step A analysis is complete. **Do not generate a replacement ZIP or modify source in the new chat before the owner approves Step A.**

Proceed independently through read-only examination; ask for assistance only where a material fact cannot be established from existing sources or a controlled test/implementation needs owner approval. Combine logically related tests later; do not duplicate accepted results.

## 2. Governing rules and read-first order

First consult the authoritative **root `README.md`**, particularly mandatory Section 0, and current approved standards, then inspect exact source and related evidence:

1. `standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` — approved Core v1.0.
2. `standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` — approved Detailed v0.4.1.
3. `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md` — D01–D14 plus later approved clarifications; administrators retain all approved privileges.
4. `standard/WA_File_Development_and_Delivery_Process.md` — owner-approved A→B→C→D workflow, version 1.1.
5. `CLAUDE.md`, `TechSummary.md`, applicable current source, and cited test/review documents.

**Absolute operating restrictions:** GitHub, authoritative Google Drive, local WA project files, databases, Render and production are read-only to ChatGPT. No file writes in those locations, no GitHub changes, no Render settings, no production or staging state-changing actions. Proposed implementation deliverables must be prepared *separately for owner download/manual installation*. `main` merges, production deployments, database schema/data changes and staging deployments require separate owner authorization. Never claim an unexecuted test passed.

**A→B→C→D:** A: agree intended outcome, scope, constraints, acceptance criteria, implementation authorization. B: one complete coherent ZIP with operational source at precise WA-relative paths; `install/INSTALL.md`, manifest and rollback; `change/` per-revised-file unified `.diff` and separate `.md` verification, SHA-256/test evidence; `docs/` for project documentation; independently perform feasible tests. C: owner installs locally and synchronizes to Drive. D: controlled local/hosted acceptance with previous PASS results preserved; owner commits and deploys only after applicable separate approvals. No `.original` files or unrelated changes.

**Readiness budget:** November 16, 2026 owner-approved **40-hour maximum planning ceiling**, with reassessment if a critical blocker cannot be resolved. Cumulative actual hours have not been reconciled. Do not launch a comprehensive standards/refactor program.

## 3. Verified baseline, environments and recent result

- Last verified `reviseLogIn` GitHub HEAD: **`3fadbe0b2d4b4807e1434f526e7d6834b689f992`**; owner screenshot confirms matching Render staging service `wapps-stage6-test` was **Live** November 23, 2026, about 8:35 AM EST.
- Last compared `main` HEAD: **`d92ef54428f3d6cea6e4b28eaa5237a53c3b913e`**. Before starting, **verify current branch HEADs again read-only**, because they may change between chats.
- `3fadbe0` changed documentation/install/change evidence and removed **78 tracked `_COPY` files**; compared with preceding staging code commit `72b8ee0`, **no operational source code changed**. Full read-only tree inspection found **zero tracked `_COPY` files under `httpdocs/`**, corroborated by fresh Drive copy.
- Existing branch change inventory: **91 operational source paths** relative to the cited main baseline: **77 modified, 13 added, one removed** (`httpdocs/bday.html`), excluding `_COPY` and image assets. This is an *end-state diff*, not a test count. The reports and CSV should be retained without repetition.
- Isolated Render staging URL: `https://wapps-stage6-test.onrender.com`; staging DB is HelioHost Morty2 `wapps_test`, with required TLS and database-identity guard. Production and `main` are separate and must remain unchanged.
- Prior R20 compatibility package: 40/40 owner-reported isolated environment/connection assertions PASS; `72b8ee0` deployed Live and logged `Stage 6 environment: staging; database identity verified`; owner-confirmed staging browser login, Weights record retrieval, logout PASS. Cleanup commit inherited code unchanged. Do not repeat absent specific regression risk.
- Prior accepted bounded R10/R14/R15 hosted results, R16 T12 **90/90 PASS**, R16 T06 **3/3 hosted**, T09/T10 browser evidence, Group 5G hosted password/reset/TNNA token lifecycle, and isolated 66-table production dump restore must be preserved. The latest full R01–R20 state is not an unconditional blanket PASS; avoid treating a targeted test as certification of every route.

## 4. Independent design-engineer reports: controlling findings

**Reports in authoritative `review/` folder, November 23, 2026:**

- `review/WA_Claude_Independent_Design_Security_Production_Readiness_Review_2026-11-23.md`
- `review/WA_Codex_Independent_Design_Security_Production_Readiness_Review_2026-11-23.md`

Both conclude **CONDITIONAL / NOT YET READY**. Both permit continued isolated staging work but block `reviseLogIn` → `main` and production rollout at the reviewed revision. They endorse targeted correction rather than broad refactoring. Codex independently checked 91-path inventory/current commit and reviewed standards; Claude added a deeper potential cross-tree membership/privilege-chain analysis (source-derived, not an executed exploit).

**Family Tree security findings (must remain open until corrected, contained and tested):**

| Tracking | Finding | Owner-approved planning direction to evaluate — NOT implementation authorization |
|---|---|---|
| **M03-H02 / WA-PR-002 / IR-02** | `POST /familytree/relationships` and `POST /familytree/related-person` may accept out-of-Tree Person IDs without validating both focal and related Tree membership before writes. `/relationships` can insert association into `FTFamilyTreePersonT`, potentially creating access to foreign Person records. | **First investigate in detail.** Require exact-Tree membership of any existing Person before writes, without breaking valid new-person and same-tree flows; carefully assess existing association insert and authorized administrator behavior. |
| **M03-C01 / WA-PR-001 / IR-01** | One Tree review/merge accepts caller-selected arbitrary target Tree without proof of a legitimate initiating operation. | Consider tightly scoped **server-side cross-tree operation restriction, default OFF**, pending later `oneTreeM` capability redesign. Keep same-tree cases/undo and legitimate admin behavior as appropriate. Include privacy unlock endpoint in restriction evaluation. |
| **M03-H03 / WA-PR-003 / IR-03** | Extra, unreviewed duplicate `same` decisions can be passed through to merge. | Reject extras/unknown/duplicate/stale decisions, or ensure cross-tree operation is completely server-side restricted. |
| **M03-M04 / WA-PR-004 / IR-04** | Privacy check/use race during cross-tree merge, source-confirmed window, no executed race exploit. | Risk contained while cross-tree merge is disabled; otherwise locks/revalidation and targeted test. |
| **FP03 / WA-PR-007** | Potentially broad `X-FT-Page-Token` forwarding in `httpdocs/js/FTPrivacy.js`; Codex flagged possible cross-origin URL matching. | Verify active behavior and determine whether small exact-origin/approved-path guard belongs in same coherent change scope. |

**Important current-production observation:** A previous read-only GitHub comparison located the implicated ordinary relationship handlers and cross-tree review/merge patterns in **both** `main` at `d92ef54` and `reviseLogIn` at `3fadbe0`. This indicates a **possible existing production exposure**; neither review nor that comparison constitutes demonstrated exploitation. The next chat should compare the exact handler bodies, authorization dependencies, and any effective compensating controls in both branches. Do not assert identical behavior merely because route names appear in both.

**Other cross-review blockers / gates:** Both highlighted insufficient `/users/login` and web/TNNA verification-code attempt limits; Codex recommends fixing before merge, Claude at least before production. Safer project recommendation: fix before merge, under a **separate approved scope** after Family Tree Step A. Production data migration, secure-table initialization, retained subscription grants, PWA mixed-version cache/rollback, TNNA continuity, environment configuration and combined code/database rollback are future release gates, not reasons to abandon accepted testing.

## 5. Approved six-phase path forward

1. **Immediate security exposure:** read-only verify M03 issues against existing production `main` and staging; assess impact and necessary protective action. Do not alter production.
2. **Narrow Family Tree correction:** owner agrees Step A scope, then one approved A→B→C→D package for relationship authorization and cross-tree containment as appropriate; consider FP03 only if logically within scope. Preserve unrelated features, admin privileges, privacy, and existing undo.
3. **Authentication abuse controls:** bounded web and TNNA password login/verification attempts; consult current DB dumps before proposing schema changes.
4. **Focused acceptance and independent re-review:** isolated routed HTTP negative/zero-write tests and representative positives; targeted staging tests only if necessary; review exact corrected hashes, not all 91 files again.
5. **Workstream B production database:** preserve approved November 19 approach — new final production DB using final tested staging schema and genuine production data; explicitly reconcile schema differences, subscription grants, `UserSecurityT`, admin designation, TNNA, cutover and rollback. No execution or DB modifications authorized.
6. **Owner release decisions:** only after risk dispositions, appropriate testing, independent review and separately authorized `reviseLogIn`→`main` merge, production DB cutover and deployment.

The owner expressly **approved these six phases**. This approval is to follow the plan, **not** authorization for implementation, database changes, production access, merge or deployment.

## 6. Exact next read-only investigation: M03-H02

In the new chat, proceed stepwise without a redundant permission prompt:

1. Read authoritative README, governing standards, both reports and relevant prior M03 handoff. Verify current Git/Drive source identity.
2. Inspect `routes/familyTree.js` in both `main` and `reviseLogIn`. Focus specifically on the real mounted HTTP routes `POST /familytree/relationships` and `POST /familytree/related-person` and helper `addRelationshipInTree`, `treeHasPerson`, `requireTree`, `getPersonTree` and any other Tree membership/permission check. Trace route order, transaction boundaries, all SQL writes, and what IDs come from the caller. Check if an `INSERT IGNORE INTO FTFamilyTreePersonT` can grant membership before checks.
3. Inspect `routes/ftPrivacy.js`, `services/administratorAccess.js`, `middleware/auth.js`, `middleware/subscriptionAccess.js`, `server.js` routing, and current staging/production schema definitions in the latest authoritative `*Dump.sql` exports as relevant. **Ask owner if dumps are current**; ask for live SQL only if a missing/current fact cannot be established from the dumps.
4. Map actual consumers and valid workflows using `httpdocs/FamilyTree.html`, `FamilyTree2.html`, other Family Tree Person/relationship pages and applicable JavaScript. Distinguish existing authorized Person links from **creating** new Persons or explicit legitimate cross-tree linking; do not break user functionality silently. Check admin exceptions in approved standards.
5. Compare exact behavior on `main` and `reviseLogIn`: distinguish identical pre-existing exposure, revised exposure, and unconfirmed assumptions. No live exploit tests on production. Preserve privacy of genuine people and credentials.
6. Determine the **minimal, verifiable** Step A correction design for H02 (and only inseparable dependencies): defensive validation before any DB mutation, denied manipulations with **zero writes**, valid positive paths unchanged, correct HTTP errors, authorization failures fail-closed, privacy/admin behavior preserved.
7. Plan **non-destructive offline routed HTTP tests** first (rather than testing extracted helpers alone). Outline isolated synthetic database acceptance only if strictly necessary, with explicit approval and cleanup. Combine related negative/positive cases into one controlled test group where feasible.
8. Present a Step A proposal: affected files and WA-relative paths, behavior/impact comparison, precise scope exclusions, acceptance criteria, safeguards, feasibility/tests, implementation package contents and any outstanding owner design choice. **Request implementation authorization at that point**; do not silently create or install changes.

### Proposed acceptance themes (not yet formally approved)

- Authenticated caller cannot attach a Person belonging only to an unrelated Tree through either route; denied before all inserts/updates/deletes and with demonstrable zero writes.
- An unauthorized or foreign focal Person ID is rejected before writes.
- Authorized same-tree existing-person relationships and valid new-person creation continue as intended.
- Existing cross-tree operations permitted only through an explicitly approved, properly authorized flow, or blocked by the separate agreed containment.
- Administrator privileges remain consistent with approved policy; privacy, Tree identity and `X-FT-Page-Token` checks remain intact.
- Both API and UI callers show controlled errors; no unintended replay or partial mutation.
- Regressions limited to affected routes and one representative real UI/browser workflow; prior unrelated accepted test evidence retained.

## 7. Authoritative reference file locations

**In Google Drive `My Drive/wonderfulApp`:**

- `README.md`; `CLAUDE.md`; `TechSummary.md`; approved `standard/` files above.
- `review/WA_Codex_Independent_Design_Security_Production_Readiness_Review_2026-11-23.md`
- `review/WA_Claude_Independent_Design_Security_Production_Readiness_Review_2026-11-23.md`
- `review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md`
- `docs/WA_OneTree_Merge_Deferred_Design_and_Security_Handoff_2026-11-21.md`
- `docs/WA_reviseLogIn_Change_to_Test_Coverage_Review_2026-11-23.md`
- `docs/WA_reviseLogIn_Operational_File_Coverage_Inventory_2026-11-23.csv`
- `docs/WA_reviseLogIn_High_Risk_Readonly_Coverage_Addendum_2026-11-23.md`
- `docs/WA_R16-R20_Testing_Continuation_Handoff_2026-11-21.md`
- `docs/Stage6_Render_TestPlan.md`; `docs/Stage6_OpenItems.md`; `docs/Stage6_Production_Implementation_Plan.md`
- `docs/WA_R20_Database_Migration_Readonly_Reconciliation_2026-11-22.md`
- `docs/WA_Production_Database_Transition_Plan.md`
- `wappsHelioProductionDump.sql`; `wappsHelioTestDump.sql` (November 22 snapshots; verify whether updated)
- Exact current operational source: `routes/familyTree.js`, `routes/ftPrivacy.js`, `services/administratorAccess.js`, `middleware/auth.js`, `middleware/subscriptionAccess.js`, `server.js` and relevant `httpdocs/FT*`, `httpdocs/FamilyTree*` pages/scripts.

**Repository comparison:** `sthink1/wapps` at `main` and `reviseLogIn` current HEADs; previously confirmed `d92ef54` and `3fadbe0` respectively. GitHub is **read-only**.

## 8. Preserved decisions, non-goals and stop conditions

- **Do not reopen full One Tree design now.** Feature redesign deferred to future `oneTreeM`, but existing live security exposure cannot be deferred without valid containment or explicit safe disposition.
- No full standards-correction campaign, comprehensive cross-page retesting, or rewriting unrelated WA features.
- Do not conflate completing R20 bounded test work with unconditional R20 PASS, a successful old-schema restore with a successful production migration, or an independent review with authorization to merge.
- Do not assume database migrations are part of this first Family Tree Step A correction.
- Do not alter authoritative code, GitHub, GD, Render, DB, production or `main`.
- If investigation reveals actual plausible unauthorized access to living people's private data, compromise or irreversible mutation, flag it as potentially release-blocking and seek an owner decision before any state-changing verification. Never probe genuine production user data.

## 9. Next-chat initial response goal

After reading this handoff and authoritative references, begin **M03-H02 read-only source/consumer/permission trace**. Report verified facts separately from hypotheses, then formulate the narrow correction Step A. Do not ask whether to begin: the owner already approved continuing this investigation. Ask for approval only when the completed Step A proposal would authorize implementation or any new state-changing test.

---

**Handoff prepared as a separate downloadable document. No authoritative project resources were modified in its creation.**
