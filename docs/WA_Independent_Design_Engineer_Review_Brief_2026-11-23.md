# Wonderful Apps — Independent Design Engineer and Security Review Brief

**Prepared:** November 23, 2026  
**Request:** Independent, risk-based design, code, database-dependency, testing-coverage, operational-readiness, and security assessment of the `reviseLogIn` release candidate  
**Review baseline:** GitHub `sthink1/wapps`, `reviseLogIn` commit **`3fadbe0b2d4b4807e1434f526e7d6834b689f992`** (`3fadbe0`)  
**Production comparison:** `main` commit **`d92ef54428f3d6cea6e4b28eaa5237a53c3b913e`** (`d92ef54`) as read on November 23, 2026  
**Hosted staging:** Render `wapps-stage6-test`, `https://wapps-stage6-test.onrender.com`; owner-provided screenshot shows `3fadbe0` Live November 23, 2026, 8:35 a.m. EST  
**Authoritative project reference:** Google Drive, `My Drive/wonderfulApp` (folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`)  
**Review status:** **REQUEST FOR INDEPENDENT ASSESSMENT — NOT A RELEASE APPROVAL**

## 1. Introduction to the independent reviewer

We request an independent engineering and security review of Wonderful Apps (WA) before any decision to integrate its `reviseLogIn` development branch into `main` or deploy Stage 6 changes to production.

WA is a Node.js/Express, MySQL-compatible, browser/PWA application with JWT/session authentication, administrator and subscription functions, Budget, Family Tree/Networking, Weights/Activities, ETF research, Town Notice, and a related Android TNNA client. Stage 6 substantially revised authentication, credential lifecycle, access controls, session persistence, tracking, error handling, and other integrations. Significant local, hosted Render, and targeted database tests have been performed. We now need a reviewer **independent of those implementing/testing changes** to assess the actual final candidate and the sufficiency of its evidence.

**Please examine the code and supporting evidence, challenge assumptions, identify material defects and unsafe dependencies, and provide prioritized, actionable comments and recommendations.** In particular, tell us **which additional tests, if any, are genuinely necessary on Render staging or against an isolated test database**, what can be accepted from existing evidence, and what would prevent a safe merge or production release. Do not assume that a previously labeled PASS proves a broader condition than the recorded test actually exercised.

Our owner-approved production-readiness work operates under a **40-hour planning ceiling**, subject to reassessment for a critical blocker. We seek a *risk-based* review, **not** a comprehensive rewrite, broad standards-remediation campaign, or routine repetition of already accepted tests.

## 2. Review authority, project rules, and restrictions

**Start by reading the authoritative Google Drive root `README.md`, especially mandatory Section 0**, followed by the approved references:

1. `standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md` — approved Core Standards v1.0.
2. `standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md` — approved Detailed Standards v0.4.1.
3. `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md` — D01–D14 and later expressly approved clarifications.
4. `standard/WA_File_Development_and_Delivery_Process.md` — approved A→B→C→D development/delivery process v1.1.
5. Root `CLAUDE.md`, `TechSummary.md`, current source files, and dated acceptance evidence.

The original `_DRAFT` filenames of approved standards are historical filenames, **not** evidence that approval is lacking. Interpret approved rules and later authorized decisions together, noting conflicts rather than silently overriding them. Preserve previously accepted behavior and tests unless a specific regression risk warrants more work.

**Strict access rules:** Review Google Drive, GitHub, existing WA local files, databases, Render, and production **read-only**. Do not create, edit, overwrite, delete, commit, push, merge, run DDL/DML, change configuration, invoke state-changing application operations, deploy, or touch native devices. Provide findings and recommended steps separately. Any proposed code/SQL change, controlled test with state effects, branch operation, merge, or deployment needs the owner's explicit authorization through the established process. **Do not put secrets, tokens, passwords, reset URLs, or private production records into reports.**

## 3. Exact release candidate and evidence provenance

- **Candidate currently on staging:** `reviseLogIn` **`3fadbe0`**; screenshot supplied by owner shows Render **Live**. Read-only GitHub inspection independently confirmed branch HEAD at that commit.
- **Previous substantive compatibility patch:** `72b8ee0`; owner reported 27+13 = **40/40 local isolated assertions** passing (mocked database/network) and verified subsequent Render staging startup, successful login, Weights data read, and logout. Do not convert these bounded results into full-feature coverage.
- **Latest `3fadbe0` change:** GitHub comparison against `72b8ee0` shows **78 `_COPY` backup-file deletions** plus additions/revisions to `docs/`, `change/`, and `install/` evidence; **no changes to operational source between those two commits** were identified. The complete `3fadbe0` GitHub tree has **zero tracked `_COPY` files under `httpdocs/`**. The owner also states that the current local project was freshly copied to the authoritative Drive folder. Verify any remaining archival/non-runtime files separately before final deployment packaging.
- **Main-versus-candidate reconciliation:** `docs/WA_reviseLogIn_Change_to_Test_Coverage_Review_2026-11-23.md` compares the earlier `72b8ee0` source candidate with `d92ef54`: **91 operational source paths** differ (77 modified, 13 new, 1 removed). The **91-row CSV remains relevant to the same operational source at `3fadbe0`**, but its historical commit label and the earlier `httpdocs/_COPY` finding must be updated in the final review ledger. The full tree comparison, not the capped 300-file commit comparison, was used. Distinguish runtime files from tests, SQL samples, docs, packaging and backups.
- **Environment:** staging is isolated from production, configured for `wapps_test` on HelioHost Morty2 with TLS and bounded connection pool. Owner-provided startup logs on the prior compatible deployment showed `Stage 6 environment: staging; database identity verified`. The latest screenshot verifies deployment Live, **not a separate re-execution of every hosted browser test at `3fadbe0`**.
- **Production:** `main`, production Render service `wapps`, production database and installed TNNA devices have not been authorized for Stage 6 modification.

## 4. Primary documents and evidence to review

All paths below are WA-relative paths under the authoritative `wonderfulApp` root unless otherwise specified.

### A. Required acceptance/release evidence

| Document | Why it matters |
|---|---|
| `docs/WA_reviseLogIn_Change_to_Test_Coverage_Review_2026-11-23.md` | Full operational change inventory and test-evidence mapping; historical baseline `72b8ee0` |
| `docs/WA_reviseLogIn_Operational_File_Coverage_Inventory_2026-11-23.csv` | 91-line per-file coverage worksheet; update current baseline to `3fadbe0` without inventing extra tests |
| `docs/WA_reviseLogIn_High_Risk_Readonly_Coverage_Addendum_2026-11-23.md` | Seven residual findings, source evidence and open questions; update `_COPY` cleanup as confirmed |
| `docs/Stage6_Render_TestPlan.md` | Formal R01–R20 tests, hosted requirements, historical pass/partial dispositions |
| `docs/Stage6_OpenItems.md` and `docs/Stage6_Current_Testing_Status.md` | Outstanding S6 findings, release gates, accepted test provenance and limitations |
| `docs/WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md` and `docs/WA_R16-R20_Testing_Continuation_Handoff_2026-11-21.md` | Current risk-based testing scope, preservation of accepted results and R16–R20 remaining gates |
| `docs/Stage6_H05-H50_Hosted_Evidence_2026-10-31.md` and `docs/Stage6_Group5G_Hosted_Acceptance_Evidence_2026-11-03.md` | Actual staged browser/API observations, credential-change/reset, TNNA credential rotation/revocation |
| `docs/WA_Master_Findings_Register_2026-11-16.xlsx` and its review notes | Trace findings to decisions and remaining review work; do not equate every observation with a proven defect |
| `docs/WA_Production_Readiness_40_Hour_Handoff_2026-11-16.md` | Agreed release objectives, 40-hour planning ceiling, critical blocker reassessment |
| `docs/Stage6_Production_Implementation_Plan.md` | Release sequence, deployment inventory, schema, rollback, TNNA compatibility and explicit authorization gates |

### B. Database work — distinct future Workstream B

| Document or snapshot | Why it matters |
|---|---|
| `docs/WA_Production_Database_Transition_Plan.md` | Owner-approved **planning concept only**: final staging schema + genuine production records in a new candidate DB; never overwrite production with staging data |
| `docs/WA_R20_Database_Migration_Readonly_Reconciliation_2026-11-22.md` | November 22 schema inventory: production 66 tables, staging 72; mapping and unresolved transformations |
| Root `wappsHelioProductionDump.sql` and `wappsHelioTestDump.sql` | Authoritative exported database snapshots. **Check their export dates and ask the owner whether they remain current before treating them as live baselines**; avoid unnecessary queries |
| `docs/WA_Subscription_Migration_Matrix_2026-11-18.md` | Subscription/legacy-grant transition evidence and open disposition |
| `sql/` Stage 6 SQL scripts (inspect purpose and applicability, do not execute) | Distinguish test-only schema/bootstrap, read-only preflight and separately proposed manual migration steps |

A separate production-backup restore into an isolated database reportedly succeeded with 66 tables. That demonstrates bounded restorable-backup evidence, **not** actual migration of genuine production data into the staging schema or a production cutover/rollback rehearsal. Production migration is a **separate workstream** and needs its own later authorizations.

### C. Unresolved Family Tree / One Tree security assessment

- `review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md` — prior independent reviewer findings; consult the actual report, not only a summary.
- `docs/WA_OneTree_Merge_Deferred_Design_and_Security_Handoff_2026-11-21.md` — owner-approved **deferral of implementation**, not waiver or clearance.
- `docs/WA_M03_Final_Development_Branch_Review_and_Independent_Assessment_Handoff_2026-11-20.md` — historical technical context, superseded by newer policy decisions where conflicting.
- Current `routes/familyTree.js`, `routes/ftPrivacy.js`, `httpdocs/js/FTOneTreeMerge.js`, `httpdocs/FTOneTreeMerge.html`, `httpdocs/FTUndoOneTreeMerge.html`, other affected Family Tree routes and privacy/relationship consumers.

**Previously documented findings requiring explicit disposition:** C01 critical arbitrary target-Tree review/merge; H02 high out-of-tree PersonIDs accepted by actual relationship HTTP routes; H03 high extra/unreviewed duplicate decisions; M04 medium privacy-related concurrency. Verify which findings still apply to `3fadbe0`, whether vulnerable operations are accessible, whether existing controls constrain exploitability, and whether an effective **server-side** isolation/disablement or remediation is mandatory *before any merge into `main`*. The owner plans fuller One Tree development later on `oneTreeM`, but **deferral alone is not permission to include unsafe active endpoints in a production-bound branch**. Do not implement a restriction without authorization.

## 5. Priority source and test dependencies

**Authentication and access-control runtime** — read exact final source and callers:

- `server.js`, `dbConnection.js`, `services/stage6Environment.js`.
- `routes/users.js`, `middleware/auth.js`, `services/browserSession.js`, `services/verifyAccessToken.js`, `services/credentialFence.js`.
- `services/passwordResetLimiter.js`, `services/passwordResetClientIp.js`, `services/passwordResetRateCleanup.js`, `send_email.js`.
- `middleware/subscriptionAccess.js`, `routes/subscriptions.js`, `services/subscriptionService.js`.
- `routes/adminManagement.js`, `services/administratorAccess.js`; `httpdocs/SubControl.html`.
- `httpdocs/login.html`, `httpdocs/home.html`, `httpdocs/changePassword.html`, `httpdocs/forgotPassWord.html`, `httpdocs/js/waPlatform.js`.

**Browser/PWA, integration and regression** — trace network handling, cache transitions, authorization and user-visible behavior:

- `httpdocs/sw.js`, `httpdocs/manifest.json`, `httpdocs/js/usageTracking.js`, `httpdocs/track.html`.
- Representative changes to `httpdocs/Weights.html`, `httpdocs/Activities.html`, `httpdocs/budget.html`, `httpdocs/BinForm.html`, ETF pages (`etf.html`, `etfCompare.html`, `etfActivity.html`, etc.), `httpdocs/FamilyTree.html` and related pages.
- `routes/weights.js`, `routes/weightActivities.js`, `routes/budget.js`, `routes/etf.js`, `routes/track.js`, `routes/tnna.js`, `routes/notifications.js`, `middleware/usageActivity.js`, `services/notificationService.js`, `logger.js`, `morgan.js`.
- Relevant `tests/` suites include `tests/stage6.admin.dual-verification.offline.test.js`, `tests/stage6.r08.authenticated-origin.offline.test.js`, `tests/waPlatform.unit.test.js`, `tests/r20.environment-compatibility.offline.test.js`, `tests/r20.db-connection.offline.test.js`, and applicable R16/One Tree, subscription, TNNA, replay, and concurrency suites. **Inspect reports or execute only approved isolated tests; the existence of a test file does not prove a passing run.**

**Review every item in the operational CSV**; this prioritized list does not replace the 91-file change inventory. Determine whether any files, SQL scripts, test harnesses or sensitive artifacts should be excluded from a future production merge/build, and whether removed `httpdocs/bday.html` or `httpdocs/images/logo.png` still have references.

## 6. Specific questions for the engineer

Please respond with an explicit **evidence-based answer** to each question below, citing exact file paths, function/route names, test IDs, commit hashes and severity as applicable.

1. **Coverage sufficiency.** Is the 91-file operational change inventory accurate and complete for the `3fadbe0` candidate, and does the accepted local/Render/DB evidence adequately cover the changed behavior? Identify the *smallest specific set* of additional tests needed, distinguishing source review, offline mocks, local integration, Render browser/API, test DB, and Android/device tests. Do not require a separate Render test for every file without a behavioral reason.
2. **Critical security and authorization.** Which C01/H02/H03/M04 One Tree issues remain demonstrably open? Can the branch safely enter `main` while those endpoints remain present? If not, recommend a narrowly scoped server-side restriction or other mitigation with exact acceptance tests, preserving unrelated Family Tree behavior; do not presume the owner has approved this change.
3. **Administrator transfer.** Are `/admin-management/{status,target/:userId,prepare,pending,cancel,complete}`, current-password verification, session binding, one-time token, transactional locking, two-stage Render `ADMIN_USERNAME` switch, audit trails, and restoration/failure paths sufficiently secured and tested? Is a hosted state-changing transfer genuinely necessary, or can the current gap be accepted with controls?
4. **Authentication/session security.** Review JWT and refresh-token lifecycle, session logout/revocation, password reset version binding, cookie `HttpOnly`/`Secure`/`SameSite`/path, exact Origin/CSRF protections, proxy client-IP provenance, rate-limit fairness, error responses and logging/privacy. Highlight any untested *real hosted negative cases* that are material to release.
5. **PWA updates and rollback.** Assess `sw.js` v11 `skipWaiting()`/`clients.claim()`, network-first HTML and `waPlatform.js`, stale tabs/assets, login/logout state, offline fail-closed behavior, installation failure, old cache v9/v10, and eventual production rollback. Recommend a minimal safe mixed-version test or explicitly justify residual-risk acceptance. Do not label a nonexecuted browser upgrade/rollback PASS.
6. **Operational rollback and resilience.** Is staging/prod separation credible, and are startup DB identity, TLS, pool limits, backups, recovery, production authentication/DB cutover, and rollback procedures sufficiently specified? Precisely distinguish a successful *restore* from verified application-and-database rollback after new writes. Evaluate Render free-tier sleep/cold-start effects on TNNA and session handling only where relevant.
7. **Database changes and migration dependencies.** Are the seven new staging tables, two changed tables, legacy `AdminSubscriptionGrantT` retirement, subscription data, UserSecurityT initialization, administrator designation, and token/session transitions adequately mapped? What design/testing work is mandatory before production cutover versus deferrable to the separately approved Workstream B? Do **not** request production mutation or transfer test records to production.
8. **Source/publication hygiene.** Verify that `3fadbe0` removes tracked public `httpdocs/*_COPY*` backups; distinguish current source from archival artifacts and classify anything that must not ship. Review the deleted `bday.html` and image references. Identify exposures, if any, based on actual current source and served paths—not merely filenames.
9. **Release decision and residual risk.** Identify exact **BLOCK / CONDITIONAL / ACCEPTABLE AS DOCUMENTED** items, owner decisions required, minimal corrective action (if any), targeted retest plan, and post-merge/prod verification obligations. Clearly distinguish a development-branch review from permission to merge, deploy or migrate data.

## 7. Requested deliverable and answer format

Please return into the Wa project folder review, a **standalone written independent review**, preferably Markdown, structured as follows:

1. **Executive opinion:** `PASS within defined scope`, `CONDITIONAL / NOT YET READY`, or `FAIL / BLOCKED`, with a short explanation; separate suitability for further staging work, `reviseLogIn`→`main` integration, and actual production deployment.
2. **Scope and provenance:** exact inspected commit, source and docs, tests personally witnessed or executed versus prior records only, current source versions, assumptions, and limitations.
3. **Findings table:** stable ID, severity (Critical/High/Medium/Low), evidence (file, line, route, and reproduction where safe), impact, recommended change/control, whether blocking, and required owner authorization.
4. **Change-to-test coverage assessment:** reference the 91-row inventory and existing R/H/Stage evidence; indicate missing high-risk assertions, minimum test environment and acceptance criterion, and why previously accepted tests need or do not need repeating.
5. **Database/rollback and One Tree disposition:** explicit treatment of production migration as separate work, deferred feature implementation versus unresolved security exposure, and actual rollback limitations.
6. **Prioritized recommendations:** smallest practical next steps, with estimated human effort/risk where feasible; flag anything that threatens the 40-hour planning ceiling.
7. **Test requirements:** a concise list of only necessary additional offline/hosted/browser/Android/DB tests; for each give prerequisites, exact safe procedure at a planning level, expected result, database/configuration side effects and rollback/cleanup requirements. **Do not execute tests affecting state without permission.**
8. **Release-gate conclusion:** what's done, what blocks review completion, what requires owner sign-off, and what would be necessary before either integration or production release. Clearly state that the report itself is **not** authorization.

Please ask follow-up questions **only when genuinely required** by missing evidence. Do not rely on speculative vulnerabilities or mark unresolved critical findings as closed because their feature work is deferred.

## 8. Owners, approval and delivery

This is a **review request only**. The owner retains exclusive control of local installation, authoritative Google Drive synchronization, Git commits, staging configuration, database operations, `main` integration, and production release. Any change proposal should first specify A-stage scope, acceptance conditions and implications; if approved, prepare a separate complete download in accordance with the WA A→B→C→D rules (exact paths, per-file original-to-final unified `.diff` and verification `.md`, SHA-256, tests, and rollback). No project resources are to be modified by the independent reviewer.

**Requested first response:** Confirm which authoritative documents and exact candidate were inspected; provide your independent preliminary release-blocker assessment and a prioritized list of any truly necessary additional tests or changes.
