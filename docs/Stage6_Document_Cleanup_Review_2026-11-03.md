# Wonderful Apps — Stage 6 Documentation Consolidation and Cleanup Review

**Prepared:** November 3, 2026. **Action: proposed only; nothing deleted, renamed, moved, committed or uploaded.** Drive `My Drive/wonderfulApp` remains strictly read-only to the assistant.

## Three replacement master documents

1. `docs/Stage6_OpenItems.md` — version 3.0; S6-001–041 and original acceptance criteria, new evidence/status revisions and Oct 31 addendum.
2. `docs/Stage6_Render_TestPlan.md` — version 2.0; current formal R01–R20 matrix, November 3 R08 steps, original plan, Oct 31 append, full H05–H50 ledger, Group 5D/5E and Group 5G evidence.
3. `docs/Stage6_Production_Implementation_Plan.md` — version 2.0; production gates and rollback planning, original full plan and Oct 31 addendum.

**Installation:** preserve a local backup of each existing master, inspect replacement differences, and install these three manually. Check files in your actual `reviseLogIn` checkout and Drive are the same versions before you remove any old copies. Do not merge into `main` or deploy merely to update planning documents.

## Candidates to eliminate as separate files *after* verification

These three October 31 append documents have been included verbatim within their corresponding consolidated master and are plausible deletion candidates from a cleaned **local project working tree**, after a backup and proof of duplication:

- `docs/Stage6_OpenItems_H05-H50_Append_2026-10-31.md`
- `docs/Stage6_Render_TestPlan_H05-H50_Append_2026-10-31.md`
- `docs/Stage6_Production_Implementation_Plan_H05-H50_Append_2026-10-31.md`

The following dated evidence texts are also incorporated in full into the new **Render TestPlan**, but retain historical audit value and are recommended for **archive**, not immediate permanent deletion:

- `docs/Stage6_H05-H50_Hosted_Evidence_2026-10-31.md`
- `docs/Stage6_Group5G_Hosted_Acceptance_Evidence_2026-11-03.md`
- `WA_Stage6_Group5D_Results_and_Remaining_Acceptance_2026-11-01.md`
- `WA_Stage6_Group5E_Closure_and_Next_Acceptance_2026-11-02.md`

## Installation notes and READMEs — not safe to delete by filename alone

Root contains `INSTALL_Stage6B2_Group1.md`, `INSTALL_Stage6B2_Group1A.md`, `INSTALL_Stage6B2_Group2.md`, `INSTALL_Group0a.md`, `INSTALL_Replay.md`, `INSTALL_Home_KMLI.md`, `INSTALL_and_Test.md`, `README_Group5E_Manual_Installation.txt`, `README_Group5D_Render_Controlled.md`, `README_Group5D_Render_Preflight.md`, `README_Group5C_Offline.md`, `README_H109.md`, `README_H109_Connection.md`, `README_Stage6_Logging_Consolidated.md`, `README_Stage6_Logging_Fix.md`, `README_Group2_RevokedSessionFix.md` and several others. They likely include installation instructions, historical design decisions, exact local test commands and repair/rollback context. **No content-level supersession certification was completed for these documents**. Recommend organizing as a separate historical Stage 6 archive, retained outside the runtime/deployment file set, rather than deleting now.

## Scripts, source backups and SQL dumps

Never treat these as unneeded merely because their names begin with README, INSTALL, `_COPY`, `stage6a`, or `apply-`. Some are source mutators or dangerous DB test scripts, but their provenance may be important to audit. No code, scripts, SQL dumps, Git history or authentication evidence is on the automatic deletion list. Do not run the old `apply-` or concurrency scripts for cleanup.

## Minimum local-only cleanup procedure (future, after approval)

1. Confirm `git branch --show-current` is `reviseLogIn`; inspect `git status --short` and `git ls-files` for each proposed file.
2. Keep a versioned offline archive before any removal; ensure links in other docs are updated.
3. Install/inspect the three consolidated master files; compare their retained historical sections against originals.
4. Remove only user-approved redundant local files. Do not touch Drive, production, `main` or installed TNNA.
5. Validate `git diff --check`, affected file inventories and documentation references. Do not commit or push until separately authorized.

**Next action:** Review the three delivered files first. If you approve a second-phase cleanup, perform a targeted content audit of INSTALL_/README_ files and check which are tracked/referenced before issuing an exact keep/archive/delete manifest.
