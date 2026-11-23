# Wonderful Apps — `reviseLogIn` Change-to-Acceptance Coverage Reconciliation

**Date:** November 23, 2026  
**Status:** Independent read-only review packet, **NOT** final engineering/security certification  
**Authoritative source:** `My Drive/wonderfulApp`, root `README.md`, approved November 12 Core v1.0 / Detailed v0.4.1 / D01–D14, and approved November 19 file-delivery v1.1  
**Branch comparison:** `main` `d92ef54428f3d6cea6e4b28eaa5237a53c3b913e` versus `reviseLogIn` `72b8ee04dfae191250bdb09b0b53bf7b963a8a85`. GitHub tree API recursive listings were **not truncated**.  
**Interpretation:** This is an end-state *tree difference*, not an exhaustive chronology of commits or a deployment test ledger. Branches have diverged (74 commits ahead / 3 behind on `reviseLogIn`); the comparison must be reconciled with the final merge base and updated if branch heads change.

## Executive conclusion

**No, it is not verified that every changed code/database dependency has all necessary Render hosted acceptance.** Strong representative and targeted hosted evidence exists for many features, but file-specific coverage, database dependency mapping, public asset inventory, and several negative cases remain incomplete.

**Do not repeat all past tests.** Map source changes to accepted R/H/Group/Stage evidence, identify risk-bearing missing assertions, and test only gaps demonstrably requiring a real Render browser/API/database integration. The final independent design-engineer review must see the limitations.

## Complete tree-comparison accounting

- `main` has **282 blobs** and `reviseLogIn` has **1,073 blobs** at the cited commits.
- **881 differing blob paths** in the complete comparison (adds/modifies/deletes; includes installation artifacts, historical materials, docs, tests and backups).
- **91 operational source paths** after filtering `_COPY` files and non-code image assets: **77 modified, 13 added, 1 deleted**. Complete 91-row inventory in the companion CSV and Appendix A below.
- **65 changed `_COPY` files inside `httpdocs/`** are distinct from the 91 operational source paths. They are not operational-feature test requirements, but require release packaging / public-access review.
- **86 changed/added files under `tests/`** and **7 new files under `sql/`**: distinguish runnable tests, legacy harnesses and manual migration scripts from production runtime code. Presence of a test script is not proof it ran or passed.
- Additional old documentation, `change/` or `download/` artifacts and files elsewhere account for the bulk of 881 changes. The diff includes one removed non-code image `httpdocs/images/logo.png`; verify whether any live references remain.
- `.node-version` and `package-lock.json` are identical at the compared commits (previously source-reviewed); they are not counted among the 91 changed operational paths. A deployment's actual Node version still requires runtime evidence.

## Evidence sources consulted and limits

| Evidence | Verified/recorded coverage | Boundary |
|---|---|---|
| `docs/Stage6_H05-H50_Hosted_Evidence_2026-10-31.md` | Render commit `09ece26`; H05–H50 browser/API tests covering session lifecycle, selected Budget/Family Tree/ETF/Weights, denial cases, notifications, password UI | User-observed bounded samples, not all modified files or latest commit |
| `docs/Stage6_Group5G_Hosted_Acceptance_Evidence_2026-11-03.md` | Render commit `f023cc3`; actual password reset/change, web session revocation, TNNA token rotation/replay 401 | Hosted API and browser cases; not all token error/concurrency conditions or every subsequent revision |
| `docs/Stage6_Render_TestPlan.md` consolidated v2.3 and `docs/Stage6_OpenItems.md` | R10 bounded authentication, R14 bounded entitlement, R15 hosted integration/tracking, R16 scoped error/cache and R20 expectations | Historical status snapshots; `S6-005`, `S6-024` etc. retain open criteria despite bounded passes |
| November 21 R16–R20 handoff and later owner-confirmed tests | R16 T09/T10, R17 browser, R18 native Android, R19 cases carried as accepted; R20 staging identity, browser read/login/logout | Dated evidence and limitations apply; does not create per-file certification |
| November 22 R20 Step B/Step D | Node 24.22.1; local 27+13 assertions; verified installed files; staging commit `72b8ee0` Live, expected DB identity log; login / Weights / logout | Three production-compatibility application files plus two synthetic tests; not full regression across 91 changes |
| Nov 22 SQL dumps and `docs/WA_R20_Database_Migration_Readonly_Reconciliation_2026-11-22.md` | Current production 66 tables, staging 72; successful restoration of production 66-table dump in disposable DB | Export snapshots and sampled counts; not final 72-table migration or all DBA behavior tests |

**Evidence granularity:** The CSV uses `HOSTED-TARGETED` where directly relevant hosted scenarios were observed, `HOSTED-SAMPLED` where a feature family has real hosted evidence but specific file paths were not individually verified, `HOSTED-SAMPLED + BLOCKER` for unresolved independent findings, and `GAP` for missing behavioral checks. **No row asserts that the exact individual changed file received exhaustive hosted testing.** Tests at earlier deployed commits cannot automatically certify later modifications of their consumers.

## Coverage by evidence classification

| Classification | Changed operational paths | Meaning |
|---|---:|---|
| HOSTED-TARGETED | 9 | Directly related live scenarios, but bounded and not exhaustive |
| HOSTED-SAMPLED | 76 | Feature tested on Render, individual changed file not independently certified |
| HOSTED-SAMPLED + BLOCKER | 5 | Some hosted evidence; unresolved material security findings |
| GAP | 1 | Specific behavior/removed asset needs further review |
| RECONCILE | 0 | Dependency and test mapping not sufficiently established |

## Priority residual coverage requirements — risk-based

| Priority | Area / actual changed paths | What is not proved | Disposition before independent final decision |
|---|---|---|---|
| **Critical** | One Tree: `routes/familyTree.js`, `routes/ftPrivacy.js`, `httpdocs/js/FTOneTreeMerge.js`, related merge pages | Codex findings **C01 critical, H02/H03 high, M04 medium**; arbitrary-target/relationship HTTP negative paths and unreviewed pair decisions | Document release blocker. Owner deferred feature changes to `oneTreeM`; deferral is not safe-production release acceptance. Do not install prior candidate without authorization |
| **High** | Stale/static assets: **65 `_COPY` files in `httpdocs/`** | Express static middleware normally publishes files under `httpdocs`; exact unauthenticated accessibility and privacy impact not dynamically tested | Review publication manifest; exclude old backups from release or formally review contents. Do not delete or change now |
| **High** | PWA: `httpdocs/sw.js`, `home.html`, `login.html`, `js/waPlatform.js` | `skipWaiting()`/`clients.claim()` mixed old/new clients and rollback transition; S6-024 remains open | Targeted old/new browser test or independently documented accepted limitation at review; no full rerun solely from R20 five-file change |
| **High** | Admin / subscriptions: `routes/adminManagement.js`, `services/administratorAccess.js`, `services/subscriptionService.js`, subscription pages | Full admin-transfer positive/negative HTTP paths and migration of old admin-grant semantics | Review actual endpoint matrix and historical tests; targeted absent scenarios only; no production migration without separate approval |
| **High** | Origin, CSRF, proxy, password abuse: `routes/users.js`, `services/browserSession.js`, `passwordReset*`, `middleware/auth.js` | Alternative ingress spoof/provenance, limiter fairness, some negative cookie/Origin cases | Independent reviewer decide if existing R08/R11/R19 scope satisfies release criteria or needs bounded hosted test |
| **High** | Error/logging: `server.js`, `logger.js`, `morgan.js`, multiple routes | Complete public error/no-store/cache and token-leakage inventory not proved; S6-041 raw-error path remains recorded | Focus on specific vulnerable routes or sampled unexpected-error tests rather than blanket rewrite |
| **Medium** | Budget/ETF/Family Tree/Weights UI and API changes | R15 representative workflows do not cover every modified form, report, calculation or failure case | Identify materially changed behavior from diffs; test only risks not already covered by R14/R15/H evidence |
| **Medium** | Deleted `httpdocs/bday.html` and `httpdocs/images/logo.png` | No complete link/publication regression proven; production `sw.js` v9 references `/bday.html`, staging v11 does not | Static reference inventory/limited navigation test before production merge |
| **High** | DB target schema and SQL scripts | Staging tests exercise much of schema, but Nov 22 current-prod-to-test shape conversion untested | Keep as **Workstream B**, not extra R20 test. Migration rehearsal, data mapping and release approval separately gated |

## Database-change-to-evidence map

| Table/area | Structural delta from November 22 dumps | Existing test evidence | Coverage / required review |
|---|---|---|---|
| `UsersT` | `IsAdministrator` new staging column | R14 admin/normal authorization and staged administrator tests | Not a production-data backfill test; map central two-gate admin bootstrap |
| `LoginVerificationT` | `SecurityVersion` new staging column | Group 5G login challenge, reset, password-change tests | Existing production challenges/version migration not rehearsed |
| `UserSecurityT`, `WebSessionT`, `WebRefreshTokenT` | 3 new staging tables | Group 5G real staging tokens/sessions; R17–R19 bounded lifecycle coverage | No legacy production account/session seeding/cutover test; production migration separate |
| `PasswordResetT`, `PasswordResetRateT` | 2 new staging tables | Group 5G one-use reset and revocation; cleanup H21; related offline suites | Expiry/error/limiter fairness coverage partial; no production migration rehearsal |
| `AdminTransferStateT`, `AdminTransferAuditT` | 2 new staging tables | M03/admin tests at bounded scope; R14 central auth | Full admin-transfer HTTP, race, rollback and retention test mapping not established |
| `AdminSubscriptionGrantT` | Production-only table, **12 exported records**, absent staging | Separate November 18 subscription migration discussion and sample tests | 12 production records need explicit mapping; never silently drop; Workstream B |
| 63 column-identical common tables | Stable column definitions but potential data/index/constraint differences | R14/R15/H hosted representative CRUD and business flows | Not per-table exhaustive; full production migration/source-data preservation remains Workstream B |

**Structural note:** Both dumps share 65 tables; 63 share column definitions and two differ as above. SQL dump comparison also recorded production 63 vs staging 62 FK-add statements. Referential, index and engine effects still need deliberate migration review.

## Documentation-only and test-only exclusions

Do not ask the owner to redo Render tests for each `docs/`, `change/`, `download/`, `install/`, historical report, `_COPY` file, offline test or manual SQL script. Instead (a) verify operational source dependency if any, (b) decide what to exclude from production artifact/publication, and (c) inspect tests as supporting evidence with dated PASS/FAIL status only when actually run.

The full end-state diff encompasses **881** path changes. It is not appropriate to claim that all 881 require hosted regression or that 91 distinct interactive tests are required. Risk is determined by behavior, shared dependencies, exposure, security and data effects.

## Requested independent engineer disposition

1. Confirm the actual branch heads, resolved merge base, 91 operational entries, and any production-only changes before signing the inventory. Git merge is not authorized.
2. Check the companion CSV row-by-row: identify behaviorally substantive changes versus formatting/preservation edits; associate exact test IDs and target deployed commits; flag unsupported claims.
3. Prioritize **security-critical functional coverage** and exposed files. Do not equate representative R15 PASS with feature-wide proof.
4. Review the deferred One Tree independent findings as **open release blockers**, not exempt because development is deferred.
5. Accept or require focused tests for service-worker mixed-version and non-destructive staging rollback. Current R20 remains PARTIAL in formal classification.
6. Review production-candidate data migration and simultaneous app/DB rollback as a **separate Workstream B approval process**. The 66-table restore proves recovery of old schema only.
7. Document any remaining risk explicitly with owner decision, compensating controls, severity, and no-go conditions. Do not silently convert partial evidence to PASSED.
8. Prepare a concise targeted follow-up test list, not a sweeping standards-correction program; keep the approved 40-hour ceiling and stop/reassess on unresolved critical blockage.

## Appendix A — Complete changed operational source paths

| # | Status | WA-relative path | Existing coverage | Risk/review focus |
|---:|---|---|---|---|
| 1 | MODIFIED | `dbConnection.js` | HOSTED-TARGETED | Review startup failure/TLS/connection exhaustion negatives; no broad new hosted rerun presumed |
| 2 | MODIFIED | `httpdocs/Activities.html` | HOSTED-SAMPLED | Delete dialog S6-039 deferred; do not infer every write/date-range behavior tested |
| 3 | MODIFIED | `httpdocs/BMoney.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 4 | MODIFIED | `httpdocs/BcardForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 5 | MODIFIED | `httpdocs/BcardReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 6 | MODIFIED | `httpdocs/BestimateAllowanceForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 7 | MODIFIED | `httpdocs/BestimateAllowanceReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 8 | MODIFIED | `httpdocs/BinForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 9 | MODIFIED | `httpdocs/BinReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 10 | MODIFIED | `httpdocs/BleaseRentForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 11 | MODIFIED | `httpdocs/BleaseRentReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 12 | MODIFIED | `httpdocs/BloanForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 13 | MODIFIED | `httpdocs/BloanReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 14 | MODIFIED | `httpdocs/BmonthBudget.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 15 | MODIFIED | `httpdocs/BmonthDetailReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 16 | MODIFIED | `httpdocs/BoutForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 17 | MODIFIED | `httpdocs/BoutReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 18 | MODIFIED | `httpdocs/Breports.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 19 | MODIFIED | `httpdocs/BsubscriptionForm.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 20 | MODIFIED | `httpdocs/BsubscriptionReport.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 21 | MODIFIED | `httpdocs/FTAncestor.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 22 | MODIFIED | `httpdocs/FTAncestorChild.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 23 | MODIFIED | `httpdocs/FTAncestorPartner.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 24 | MODIFIED | `httpdocs/FTContact.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 25 | MODIFIED | `httpdocs/FTEvent.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 26 | MODIFIED | `httpdocs/FTNetwork.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 27 | MODIFIED | `httpdocs/FTOneTreeMerge.html` | HOSTED-SAMPLED + BLOCKER | C01 critical, H02/H03 high, M04 medium unresolved; negative actual HTTP/merge tests not covered by bounded R15 |
| 28 | MODIFIED | `httpdocs/FTPerson.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 29 | MODIFIED | `httpdocs/FTPersonDuplicate.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 30 | MODIFIED | `httpdocs/FTPersonList.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 31 | MODIFIED | `httpdocs/FTPersonNew.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 32 | MODIFIED | `httpdocs/FTUndoOneTreeMerge.html` | HOSTED-SAMPLED + BLOCKER | C01 critical, H02/H03 high, M04 medium unresolved; negative actual HTTP/merge tests not covered by bounded R15 |
| 33 | MODIFIED | `httpdocs/FamilyTree.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 34 | MODIFIED | `httpdocs/FamilyTree2.html` | HOSTED-SAMPLED | Not every revised page individually tested; map page consumers and high-risk mutations; One Tree is unresolved |
| 35 | MODIFIED | `httpdocs/InterestEarned.html` | HOSTED-SAMPLED | Error display/UI observation H33 outstanding; not every revision covered |
| 36 | MODIFIED | `httpdocs/SubControl.html` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 37 | MODIFIED | `httpdocs/TownNotice.html` | HOSTED-SAMPLED | TNNA native coverage is separate; page/client or protocol boundary review needed |
| 38 | MODIFIED | `httpdocs/Weights.html` | HOSTED-SAMPLED | Delete dialog S6-039 deferred; do not infer every write/date-range behavior tested |
| 39 | MODIFIED | `httpdocs/amortization.html` | HOSTED-SAMPLED | D11 defers geocode changes; sensitive logging/error and provider response paths not fully tested |
| 40 | DELETED | `httpdocs/bday.html` | GAP | Check direct references, navigation, and release asset list; no hosted deletion acceptance identified |
| 41 | MODIFIED | `httpdocs/budget.html` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 42 | NEW | `httpdocs/changePassword.html` | HOSTED-TARGETED | Retain bounded expiry/negative-case scope and confirm no post-test change to these paths |
| 43 | MODIFIED | `httpdocs/etf.html` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 44 | MODIFIED | `httpdocs/etfAPItest.html` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 45 | MODIFIED | `httpdocs/etfActivity.html` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 46 | MODIFIED | `httpdocs/etfCategory.html` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 47 | MODIFIED | `httpdocs/etfCompare.html` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 48 | MODIFIED | `httpdocs/etfSymbol.html` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 49 | NEW | `httpdocs/forgotPassWord.html` | HOSTED-TARGETED | Retain bounded expiry/negative-case scope and confirm no post-test change to these paths |
| 50 | MODIFIED | `httpdocs/home.html` | HOSTED-SAMPLED | Mixed old/new HTML/module and SW activation/rollback S6-024 partial; exact per-file test mapping needed |
| 51 | MODIFIED | `httpdocs/js/FTOneTreeMerge.js` | HOSTED-SAMPLED + BLOCKER | C01 critical, H02/H03 high, M04 medium unresolved; negative actual HTTP/merge tests not covered by bounded R15 |
| 52 | MODIFIED | `httpdocs/js/usageTracking.js` | HOSTED-SAMPLED | Page-by-page tracking migration not exhaustive; new/stale client interactions partial |
| 53 | NEW | `httpdocs/js/waPlatform.js` | HOSTED-SAMPLED | Mixed old/new HTML/module and SW activation/rollback S6-024 partial; exact per-file test mapping needed |
| 54 | MODIFIED | `httpdocs/login.html` | HOSTED-SAMPLED | Mixed old/new HTML/module and SW activation/rollback S6-024 partial; exact per-file test mapping needed |
| 55 | MODIFIED | `httpdocs/propertyInfo.html` | HOSTED-SAMPLED | D11 defers geocode changes; sensitive logging/error and provider response paths not fully tested |
| 56 | MODIFIED | `httpdocs/subscription.html` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 57 | MODIFIED | `httpdocs/sw.js` | HOSTED-SAMPLED | Mixed old/new HTML/module and SW activation/rollback S6-024 partial; exact per-file test mapping needed |
| 58 | MODIFIED | `httpdocs/track.html` | HOSTED-SAMPLED | Page-by-page tracking migration not exhaustive; new/stale client interactions partial |
| 59 | MODIFIED | `httpdocs/weighIn.html` | HOSTED-SAMPLED | Delete dialog S6-039 deferred; do not infer every write/date-range behavior tested |
| 60 | MODIFIED | `logger.js` | HOSTED-SAMPLED | Whole-app error disclosure audit not proven; S6-041 remains open |
| 61 | MODIFIED | `middleware/auth.js` | HOSTED-SAMPLED | Email/provider failures and public capability edge cases not exhaustive |
| 62 | MODIFIED | `middleware/subscriptionAccess.js` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 63 | MODIFIED | `middleware/usageActivity.js` | HOSTED-SAMPLED | Page-by-page tracking migration not exhaustive; new/stale client interactions partial |
| 64 | MODIFIED | `morgan.js` | HOSTED-SAMPLED | Whole-app error disclosure audit not proven; S6-041 remains open |
| 65 | NEW | `routes/adminManagement.js` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 66 | MODIFIED | `routes/budget.js` | HOSTED-SAMPLED | Not every B-form/report tested after final revision; prioritize changed calculations, writes, print and error responses |
| 67 | MODIFIED | `routes/etf.js` | HOSTED-SAMPLED | Representative coverage only; API limits/error and all revised ETF pages not certified individually |
| 68 | MODIFIED | `routes/familyTree.js` | HOSTED-SAMPLED + BLOCKER | C01 critical, H02/H03 high, M04 medium unresolved; negative actual HTTP/merge tests not covered by bounded R15 |
| 69 | MODIFIED | `routes/ftPrivacy.js` | HOSTED-SAMPLED + BLOCKER | C01 critical, H02/H03 high, M04 medium unresolved; negative actual HTTP/merge tests not covered by bounded R15 |
| 70 | MODIFIED | `routes/geocode.js` | HOSTED-SAMPLED | D11 defers geocode changes; sensitive logging/error and provider response paths not fully tested |
| 71 | MODIFIED | `routes/interestEarned.js` | HOSTED-SAMPLED | Error display/UI observation H33 outstanding; not every revision covered |
| 72 | MODIFIED | `routes/notifications.js` | HOSTED-SAMPLED | Email/provider failures and public capability edge cases not exhaustive |
| 73 | MODIFIED | `routes/subscriptions.js` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 74 | MODIFIED | `routes/tnna.js` | HOSTED-SAMPLED | TNNA native coverage is separate; page/client or protocol boundary review needed |
| 75 | MODIFIED | `routes/track.js` | HOSTED-SAMPLED | Page-by-page tracking migration not exhaustive; new/stale client interactions partial |
| 76 | MODIFIED | `routes/users.js` | HOSTED-TARGETED | Not exhaustive race/Origin/error paths; match final revisions with exact test checkpoints |
| 77 | MODIFIED | `routes/weightActivities.js` | HOSTED-SAMPLED | Delete dialog S6-039 deferred; do not infer every write/date-range behavior tested |
| 78 | MODIFIED | `routes/weights.js` | HOSTED-SAMPLED | Delete dialog S6-039 deferred; do not infer every write/date-range behavior tested |
| 79 | MODIFIED | `send_email.js` | HOSTED-SAMPLED | Email/provider failures and public capability edge cases not exhaustive |
| 80 | MODIFIED | `server.js` | HOSTED-TARGETED | Review startup failure/TLS/connection exhaustion negatives; no broad new hosted rerun presumed |
| 81 | NEW | `services/administratorAccess.js` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 82 | NEW | `services/browserSession.js` | HOSTED-TARGETED | Not exhaustive race/Origin/error paths; match final revisions with exact test checkpoints |
| 83 | NEW | `services/credentialFence.js` | HOSTED-TARGETED | Not exhaustive race/Origin/error paths; match final revisions with exact test checkpoints |
| 84 | MODIFIED | `services/notificationService.js` | HOSTED-SAMPLED | Email/provider failures and public capability edge cases not exhaustive |
| 85 | NEW | `services/passwordResetClientIp.js` | HOSTED-SAMPLED | Alternate ingress/spoof, limiter fairness and cleanup failure remain review gaps |
| 86 | NEW | `services/passwordResetLimiter.js` | HOSTED-SAMPLED | Alternate ingress/spoof, limiter fairness and cleanup failure remain review gaps |
| 87 | NEW | `services/passwordResetRateCleanup.js` | HOSTED-SAMPLED | Alternate ingress/spoof, limiter fairness and cleanup failure remain review gaps |
| 88 | NEW | `services/stage6Environment.js` | HOSTED-TARGETED | Review startup failure/TLS/connection exhaustion negatives; no broad new hosted rerun presumed |
| 89 | NEW | `services/stage6ExpectedClientError.js` | HOSTED-SAMPLED | Whole-app error disclosure audit not proven; S6-041 remains open |
| 90 | MODIFIED | `services/subscriptionService.js` | HOSTED-SAMPLED | New admin-transfer full HTTP/rollback and subscription migration coverage not proven; grant retirement separate |
| 91 | NEW | `services/verifyAccessToken.js` | HOSTED-TARGETED | Not exhaustive race/Origin/error paths; match final revisions with exact test checkpoints |

## Integrity and permission boundaries

This deliverable is review documentation only. It does **not** modify existing local/Drive/GitHub/Render/database files, authorize SQL, certify a release, or replace the separately approved A→B→C→D implementation workflow. It does not contain secrets or raw user records. The review is based on public/connected read-only source and dated acceptance evidence; actual hosted behavior not observed here remains unexecuted. File-by-file test assertions are a **provisional mapping**, not independent re-execution.
