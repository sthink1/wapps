# Wonderful Apps — High-Risk Coverage Reconciliation Addendum

**Date:** 2026-11-23  
**Scope:** Read-only follow-up to `WA_reviseLogIn_Change_to_Test_Coverage_Review_2026-11-23.md`.  
**Compared GitHub refs:** `main` `d92ef54428f3d6cea6e4b28eaa5237a53c3b913e`; `reviseLogIn` `72b8ee04dfae191250bdb09b0b53bf7b963a8a85`.  
**Source of truth and governance:** WA root `README.md`, approved standards, `standard/WA_File_Development_and_Delivery_Process.md`, November 21 Stage 6 handoff, accepted hosted evidence.  
**Nature of evidence:** Static source inspection and prior recorded tests only. **No tests were executed in this addendum**, and no project, GitHub, Drive, Render, or database changes occurred.

## Findings and test disposition

| Finding | Code and evidence inspected | What is established | What remains unestablished | Recommended disposition |
|---|---|---|---|---|
| F1 — Administrator transfer | `routes/adminManagement.js`, `services/administratorAccess.js`, `tests/stage6.admin.dual-verification.offline.test.js`, `httpdocs/SubControl.html`; historic R14 | `/prepare` checks current admin flag, configured admin name, session and password; `/complete` checks initiating session/token and configured target name; offline tests simulate wrong password, mismatch, completion and replay | End-to-end hosted change of Render `ADMIN_USERNAME`, transactional state, session behavior and recovery; offline test file presence is not proof that its current revision executed | **Additional hosted state-changing test requires owner authorization**, an isolated staging plan, verified backups, and an explicit administrator restoration procedure. Independent reviewer may instead assess a formally disclosed limitation but cannot call it PASS |
| F2 — Origin/CSRF and cookie | `services/browserSession.js`, `routes/users.js`, `tests/stage6.r08.authenticated-origin.offline.test.js`; R08/R10/Group 5G evidence | Exact Origin comparison is present; refresh cookie `HttpOnly`, `Secure` in staging and `SameSite=Lax`, scoped to `/users`; isolated origin denial tests exist; hosted credential lifecycle worked | Complete set of hosted negative Origin/cookie/CSRF cases and alternate ingress behavior | **Narrow targeted hosted negative probes**, only if the independent reviewer requires them after accepted R08 evidence is reconciled; avoid credentials in logs or actual mutations |
| F3 — PWA mixed-version | `httpdocs/sw.js` at staging; Home/Login; historic R16 cache inspections | v11 caches explicit assets; API paths bypass its handlers; HTML and `waPlatform.js` are network-first; `skipWaiting` and `clients.claim` permit immediate takeover | Existing-tab lifecycle across old/new deployments; rollback where older HTML depends on a newer API or cached module | **Keep R20/S6-024 PARTIAL**, with non-destructive browser version rehearsal only after a separately approved staging deployment scenario; or an explicit risk disposition by reviewer |
| F4 — Public `_COPY` files | GitHub full recursive tree comparison (not truncated), `server.js` static middleware | 65 `_COPY` paths inside `httpdocs/` differ across branches; Express serves `httpdocs/` as static root. Potential publication warrants inventory | Whether each copy is publicly reachable or contains sensitive obsolete content; whether owner's proposed cleanup has been committed | Owner plans to delete and commit copies. Verify final tree contains no unintended web-root copies, track any required external `_COPY` rollback archives separately, and avoid deleting current operational files. **Do not mark cleanup completed until new commit verified.** |
| F5 — Removed assets | Staging `httpdocs/sw.js`, `home.html`, `login.html`, `index.html`, `manifest.json`, selected FT pages/JS, server routes | No `bday.html` or `images/logo.png` reference was found in the selected files; staging v11 service worker excludes deleted `bday.html` | Whole-repository reference scan; installed PWA old-cache transition | **Small remaining static reference check**, not a broad browser regression; include deleted asset decision in release manifest |
| F6 — One Tree security | Deferred One Tree handoff Nov 21 and current `routes/familyTree.js`, `httpdocs/js/FTOneTreeMerge.js` | Outstanding independent findings C01 critical; H02/H03 high; M04 medium are documented | Remediation, real HTTP negative acceptance, release-risk disposition | **Open release blocker.** Owner-deferred `oneTreeM` development must not be mistaken for clearance. Do not edit/install proposed candidate without approval |
| F7 — Production database transition | Nov 22 `wappsHelioProductionDump.sql` and `wappsHelioTestDump.sql`, approved Nov 19 plan | Production backup restore bounded PASS; source/target schema mapping drafted | Genuine-data migration into staging schema, cutover rehearsal and write-safe rollback | **Separate Workstream B**, to be reviewed as dependency before production release, not rerun as R20 |

## Suggested order and approvals

1. Owner-managed `_COPY` deletion and commit: inspect exact staged deletions first; preserve necessary external backups; no assistant modifications to repository or files. Recalculate release inventory after commit.
2. Complete remaining **read-only source/evidence checks**: admin transfer endpoint-to-test cross-reference; cache/mixed-version assumptions; deleted-asset reference scan; disposition of scripts/SQL artifacts in the final release manifest.
3. Review accepted R08/R11/R16–R20 evidence to identify **only genuinely missing high-risk runtime assertions**, rather than rerunning complete suites.
4. Ask the owner for explicit approval only for a proposed live test that changes staging administrator settings/database rows, requires a staging redeployment, or impacts another controlled environment.
5. Independent design-engineer/security review must assess these limitations and unresolved One Tree findings. This addendum is not a sign-off or release authorization.

## Important limitations

- Static code inspection is not an executed hosted test. A named offline test file does not show a current passing run unless corresponding execution evidence exists.
- The observed `main`–`reviseLogIn` tree delta is a **release scope comparison**, not proof that each file was changed for Stage 6 or that every file must have its own hosted test.
- Earlier hosted PASS observations apply to their specific deployed commits and scenarios, not automatically to later changes.
- No production, main, database, or deployment action is authorized.
