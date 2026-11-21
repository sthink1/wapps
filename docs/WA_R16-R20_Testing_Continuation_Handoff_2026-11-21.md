# Wonderful Apps — Stage 6 R16–R20 Testing Continuation

**Handoff date:** November 21, 2026  
**Purpose:** Resume remaining production-readiness acceptance testing in a new chat, one step at a time, without reopening completed tests or the deferred One Tree redesign.  
**Suggested destination:** `docs/WA_R16-R20_Testing_Continuation_Handoff_2026-11-21.md`

## 1. Owner direction

Continue R16–R20 testing now. The owner has explicitly deferred further One Tree merge adjustments to a separate future `oneTreeM` branch, planned after the authorized `reviseLogIn` → `main` integration and before broader `refractor` work. Do not start that design or install the previously prepared M03 candidate. Continue unrelated acceptance testing despite the open M03 risks. Deferral is not a security PASS or approval to release affected functionality. Determine a safe release disposition separately before merging production-bound code; any interim restriction requires specific owner approval and effective server-side enforcement. H02 also affects ordinary relationships, so disabling only the One Tree UI would not necessarily contain it.

Maintain the November 16 owner-approved 40-hour maximum planning budget for the remaining production-readiness effort, subject to reassessment for critical blockers. Actual cumulative time is unmeasured in this handoff; do not invent elapsed or remaining hours. No broad 124-finding standards-correction program. Preserve accepted evidence and working functionality.

## 2. Authority and mandatory workflow

- Authoritative Google Drive: `My Drive/wonderfulApp`, `G:\My Drive\wonderfulApp`, folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`.
- Local: `C:\AppProjectwDB\WonderfulAppsRender`.
- GitHub: `sthink1/wapps`; expected development branch `reviseLogIn`. Verify current HEAD and status when consequential; historical commits are not a current baseline guarantee.
- First read current root `README.md`, approved Core Standards v1.0, Detailed Technical Standards v0.4.1 (3A–3C), Decision Register, `CLAUDE.md`, `TechSummary.md`, and `standard/WA_File_Development_and_Delivery_Process.md` v1.1. Check installed effective versions and applicable current source/test evidence.
- Assistant access to existing local project, Drive, GitHub, Render, production and databases is strictly read-only. Do not modify them. Owner controls installation, database operations, commits, merges and deployments; separate explicit approvals required. Codex's specific authorization to create a review report in Drive does not transfer to ChatGPT.
- A: agree scope, constraints and acceptance. B: one complete proposed ZIP with exact operational destinations, distinct new/replacement files, syntax and feasible offline tests, per-revised-file unified `.diff`, separate `.md` verification, SHA-256, and rollback. `install/INSTALL.md` and installation guidance; `change/` diffs/evidence; `docs/` general docs. No `.original` copies or root INSTALL.md. C: owner installs locally then copies to Drive. D: focused acceptance; owner-controlled commit/sync only after successful tests and explicit approval. Do not repeatedly ask the owner to confirm this procedure.
- For DB questions inspect the latest authoritative database-specific `*dump.sql` first and ask whether current; request live queries only for necessary unavailable information. Never expose credentials, tokens, real private data or connection strings.

## 3. Reference documents and reconciliation

Read the latest authoritative versions where available, not obsolete snapshots:

- November 16 `WA_Production_Readiness_40_Hour_Handoff_2026-11-16.md` and November 15 Stage 6 continuation handoff.
- `docs/Stage6_OpenItems.md`, `docs/Stage6_Render_TestPlan.md`, `docs/WA_Standards_Compliance_Register.md`.
- `docs/WA_Master_Findings_Register_2026-11-16.xlsx`, `docs/WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md`, associated review notes and approved installation manifest. Owner approved the reconciliation; verify installed copies rather than repeating the examinations.
- `WA_New_Chat_Handoff_2026-11-19.md`: subscription acceptance and database transition planning; its older instruction to pause R16 is superseded by today's direction.
- `docs/WA_OneTree_Merge_Deferred_Design_and_Security_Handoff_2026-11-21.md`: separate One Tree continuation; retain latest owner decisions and open questions, not an implementation instruction.
- `review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md`: independent FAIL report (Drive ID `1oIB6uoNs6yPdXMeTPR-gfiy1oYDv1dEi`).

The 63 completed HTML examinations and 124 source-confirmed finding occurrences are not 124 unique defects or automatic release blockers. Preserve their approved register; only investigate materially consequential items.

## 4. Accepted testing evidence — do not restart

| Area | Recorded result and scope |
|---|---|
| R10, R14, R15 | Accepted bounded PASS; preserve original evidence and version limits. |
| R16-75 T12 | 90/90 offline PASS (Nov 15); six T12-specific checks also recorded. |
| R16 T06 hosted | 3/3 parser/error response probes PASS: malformed JSON 400, parameter limit 413, incomplete multipart 500. |
| R16 T09 | Flat HTTP/user-facing error and browser recovery observations accepted in the November 16 continuation; nested-error real-browser coverage remains to be reconciled. Preserve 400/401/403 no-store observations. Do not equate a simulated test with browser coverage. |
| R16 T10 | 11/11 isolated cases passed; later unsaved-draft/no-automatic-POST-replay browser evidence accepted within observed scope. Verify exact recorded scope before asking for further tests. |
| R16 T11 | Selected isolated checks and sanitized hosted log samples, not a complete disclosure audit. |
| S6-002, S6-037 | Prior targeted closeouts remain accepted. |
| Subscription administration | Local acceptance of revised entitlement/display behavior and Standard 403 / Platinum 200 access; inactive trial denial and restoration observed. Do not repeat absent regression risk. |

Latest formal historical disposition: R16 IN PROGRESS; R17 OPEN; R18/R19/R20 PARTIAL. These are not newly verified counts. Reconcile current authoritative test record and November 16 onward evidence before updating any status. No additional tests were executed to create this handoff.

## 5. First next testing action

Read the current README and reconcile only the R16 T09/T10 record against later accepted evidence. The latest known outstanding candidate is **R16 T09 nested-error real-browser coverage**, on a genuine `WA.api` or `WA.api.json` business-call consumer. Confirm this remains outstanding before selecting a stimulus. If already accepted, advance to the next outstanding requirement, rather than rerunning it. Preserve T10 accepted no-replay observations and do not automatically repeat T10. Offer the owner ONE precise next safe action, not a long batch.

T09: verify intelligible nested/flat error text, correct category/session behavior, no `[object Object]`, no sensitive details, and safe recovery. An imported `waPlatform.js` alone does not prove the business call uses the shared client. Use a non-mutating, controlled test-account scenario. Record page, exact client path, browser, request/status, redacted evidence and bounded result. Do not fabricate a server failure in production or change source without approval.

## 6. Remaining R16–R20 gates

- R16: reconcile remaining error, cache, session, logging and privacy/security coverage; preserve T06/T11/T12 and accepted T09/T10 scopes.
- R17: risk-based browser and essential accessibility checks (Chrome, Edge, Firefox, DuckDuckGo; other D07 targets as feasible). Record supported but untested environments explicitly.
- R18: preserve hosted TNNA API evidence; Android native lifecycle/device/offline testing only with separate safe authorization.
- R19: duplicate/replay prevention, account switching, authorization races, uncertain save/transaction/email outcomes. Controlled synthetic tests; no production stress or blind retry of uncertain mutations.
- R20: environment isolation, startup, backups/recovery, rollback, pinned versions, deployment and mixed-version PWA behavior, independent review and release gates.

Known material triage candidates from November 16 (verify current status before work): FP03 capability-header origin/path forwarding; LG04/RG01 password byte fidelity; CT06/P07 commit-before-email ambiguity; CU03 resolved provider-error handling; S6-039 Weights date-range deletion (owner-deferred, no destructive DELETE without explicit authorization); historical `sw.js` deleted `/bday.html` precache issue. Source findings do not automatically establish a live exploit. No blanket refactoring.

## 7. One Tree / M03 — deferred, retain evidence

Codex independent review November 20: **FAIL**. C01 critical arbitrary target Tree review/merge; H02 high out-of-tree PersonIDs on actual relationship HTTP routes; H03 high extra unreviewed duplicate decisions; M04 medium privacy concurrency window. No complete real HTTP merge/undo or demonstrated runtime race accepted. Earlier 11/11 offline, 8/8 isolated HTTP, 19/19 consolidated privacy, 7/7 browser, 9/9 relationship offline and 7/7 source-extracted test-DB assertions remain bounded accepted evidence; named synthetic rows absent after rollback. These do not close Codex findings.

Do not install `WA_M03_Codex_Four_Finding_Consolidated_Candidate_2026-11-20.zip` (14/14 offline candidate checks; C01 unresolved; superseded by subsequent policy discussion). Latest observed authoritative `routes/familyTree.js` retrieved Nov 21: modified Nov 20 21:23:33 UTC, 305202 bytes, historical SHA-256 `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d`. Current source retains privacy-code guard during cross-tree merge; new no-code policy not implemented. Recheck actual source if needed; do not infer browser review behavior from merge guard alone.

Future owner decisions: no separate target owner consent or dual membership; no privacy codes during legitimate merge; full Person information during legitimate review; privacy preserved after merge; reconcile relationship and Person conflicts. Need to design eligibility, other-Tree examination/edit authority, potential multiple-Person match requirement, identity contradiction safeguards, preview, rollback and independent review. Those are future `oneTreeM` work, not today's acceptance scope. Do not declare them implemented or accepted. Before any production-bound integration, obtain an evidence-backed disposition of open critical/high findings; deferral of development is not a waiver of security.

## 8. Environment and production investigation

Historically local test server command `node --env-file=.env.test server.js`, test database `wapps_test` (HelioHost Morty2); `.env` historically production. Verify identity, isolation and safe credentials before any test; never use production for destructive or synthetic mutation tests. Test Render service `wapps-stage6-test.onrender.com` is separate from production `wapps`. Reverify current deployed revision/configuration when needed. November 6 production exited-status-1 incident needs separate evidence-based disposition; November 2 freeSQLdatabase issue is not automatically its cause. No Render changes, database migrations, or deploys unless separately approved. Review recent status/logs read-only; distinguish observed facts from uncertainty.

## 9. Tracking and release decisions

After each test record: formal ID, source identity/environment, stimulus, PASS/PARTIAL/FAIL/OPEN, redacted evidence, precise limitations, next action, release impact and actual time only if measured. Preserve completed results; retest only where a linked regression or material evidence gap exists. Stop and request owner reassessment for critical blockers that cannot safely be contained/resolved in budget, production contamination, major privacy/data-integrity issues, or unrecoverable changes. Independent production-readiness review remains required; Codex's M03 FAIL is not an overall PASS. No authorization to commit, merge, deploy or migrate production is conveyed by this handoff.

## 10. Paste into the new chat

> Continue Wonderful Apps Stage 6 R16–R20 testing using the attached November 21, 2026 handoff. First read the authoritative Google Drive root README.md and approved standards. Preserve all accepted evidence, including R16 T12 90/90 PASS and later bounded T09/T10 results. Reconcile the latest testing record and give me the single next outstanding safe test, likely the remaining T09 nested-error browser check if not already accepted. Do not restart testing or undertake broad standards remediation. One Tree redesign is deferred to future oneTreeM work; preserve Codex's FAIL and unresolved release risks without installing the correction candidate. Continue unrelated testing under the approved 40-hour planning ceiling. Follow the A→B→C→D workflow, keep access read-only, and do not change production, main, GitHub, Google Drive, local project files or databases. Any changes require separate owner authorization. Proceed one step at a time.

---
Prepared from the November 16 readiness handoff, November 19 continuation, November 20 M03 findings and accepted evidence, and November 21 owner-directed deferral and testing-resumption decisions. This is a new downloadable handoff, not an amendment to authoritative files or a release approval.
