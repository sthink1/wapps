# Wonderful Apps — Stage 6 Continuation and Handoff

**As of:** October 18, 2026  
**Status:** Stage 6A functional safeguards tested; Stage 6B–6D and hosted testing not complete  
**Purpose:** Authoritative *conversation handoff* to accompany current project code and SQL dumps in Google Drive. Paste or attach this document at the start of a new ChatGPT discussion.  
**Nature of document:** Records decisions and observed test outcomes; it is **not** an instruction to deploy.

---

## 1. Non-negotiable agreements and approval gates

1. **Finish all of Stage 6 before touching production.** No Stage 6 schema changes in the production database, no Stage 6 deployment to the existing production Render web service, and no merge of the `reviseLogIn` branch into `main` during development or testing.
2. **Test locally against the separate test database** `sql5838929` using `.env.test` and `node --env-file=.env.test server.js` (or equivalent explicit test-file invocation). Do **not** simply run `node server.js` because it may read another environment configuration.
3. **Create a separate Render test web service**, connected to the `reviseLogIn` branch and **test database only**, to finish hosted testing including HTTPS cookies, account flows, reset links, email behavior, and the Render proxy environment. The user previously created a free Render service for Node 24 testing. A free service may be available again, but availability, instance choice, and cost must be verified during setup; do not assume a particular tier is available or permanent.
4. **Review the Wonderful Apps project comprehensively in Stage 6B**, not only login-related pages. Produce a file-by-file inventory of which files require changes, which remain unchanged, and which require regression testing. Generate revised *complete* files in manageable, tested groups. Google Drive's current project files are the reference/authority.
5. **NEW USER REQUIREMENT (October 18, 2026):** After **all of Stage 6 is finished and tested**, and **before deciding whether to integrate `reviseLogIn` into `main`**, conduct a **design-engineer review** of the implementation. The review is an explicit gate: provide the reviewer with the full design, code changes, schema differences, test evidence, risk assessment, and open issues; record findings, correct material issues, rerun tests, and obtain user approval *before* any merge/production rollout decision. Do not portray the review as already done or presume which engineer or review channel will be used.
6. The **test database remains permanently useful** for later WA development and regression testing, including after Stage 6 goes live. Do not delete it as part of rollout. Coordinate any refresh of its data carefully.
7. Protect existing WA/TNNA users and **do not disturb installed TNNA phones**. Production and TNNA legacy-session behavior need explicit migration planning; code rollbacks do not necessarily roll back database schema or reinstate revoked credentials.
8. New code and SQL packages should be **ready to test**, tested for syntax, narrowly scoped, with backup, explicit instructions, and rollback steps. Do not change production or merge branches without the user's explicit approval.

---

## 2. Project and environment

- **Project:** Wonderful Apps (WA), Node.js 24 / Express 5 / MySQL; web apps include Family Tree with Networking, ETF Investing, Budget, tracking and several others. Separate Capacitor/Android project: Town Notification Native App (TNNA), integrated through WA backend API.
- **GitHub:** `sthink1/wapps`. Current Stage 6 work branch **`reviseLogIn`** (case-sensitive spelling); `main` is the production branch. Do not conflate branch names.
- **Development workstation/project path:** `C:\AppProjectwDB\WonderfulAppsRender` (Windows 10, PowerShell / VS Code).
- **Test database:** `sql5838929` on FreeSQLdatabase (MySQL 5.5, UTC SQL sessions). `.env.test` contains test configuration, and `APP_PUBLIC_ORIGIN=http://localhost:8080` was needed for local password-reset links. Keep credentials/secrets out of handoff documents.
- **Production database:** a different FreeSQLdatabase schema; no Stage 6 changes applied. **Do not confuse the production database with `sql5838929`.**
- **Google Drive project root:** <https://drive.google.com/drive/folders/1SBkEcRIb-ekv83-EoZXHkH0cderSHWec>. Relevant folders include `routes`, `services`, `httpdocs`, `tests`, and TNNA.
- **Fresh dumps uploaded October 18, 2026:** `wappsDump.sql` = **production**, `wappsTestDump.sql` = **test**. Both verified in this handoff's preparation; keep refreshing references as subsequent updates occur.
- **Test service:** a new separate Render service is **planned, not yet established for Stage 6**. A prior short-lived free Render service for Node 24 testing existed and was removed.
- **Security of test environment:** Never point a public-facing test site to the production DB. Verify environment variables, reset URL base, secret separation, email recipients/suppression, and deployment branch before enabling access. Restrict test access where possible.

---

## 3. Agreed Stage 6 phases — current working interpretation

The exact original full Stage 6 charter should be reconciled with any earlier project-specific requirements found in prior discussions or documents. The structure below reflects the subsequent explicit agreement, not an assertion that every original detail has been recovered.

| Phase | Work | Where tested | Status |
|---|---|---|---|
| **6A — Authentication backend and safeguards** | Web sessions; optional persistent login; login email verification; password change/reset; account-wide revocation across web/TNNA; rate limiting; cleanup | Local + `sql5838929` | **Functional safeguards and planned tests passed; hosted/production-readiness work remains** |
| **6B — Whole-project review and code integration** | Audit all WA pages/routes/middleware/session handling and TNNA dependencies; generate full revised frontend/backend files; implement Keep Me Logged In and account UI | Local + test DB; potentially early Render test service | **Next major work** |
| **6C — Integration and functional refinements** | Navigation, cross-page JWT/refresh handling, login/logout/password workflows, multi-tab behavior, session expiry, subscriptions, all changed apps | Local + test DB | Pending |
| **Separate Render test service** | Stage 6 branch + test DB; development URL, HTTPS, cookies, email, concurrency/proxy checks | Separate hosted environment | Pending; can be set up during 6B when safe |
| **6D — Full regression and hosted acceptance** | Entire WA application, TNNA API compatibility, registration/password flows, browser/device cases, service restarts; fixes and retesting | Render test service + test DB; local as needed | Pending |
| **Independent design-engineer review** | Review implementation, architecture, migration, rollback, security, operational risk, test evidence; remediate issues | Review of full Stage 6 candidate | **Required by user after Stage 6 completion, before merge decision** |
| **User decision and production rollout** | Only *after* review/approval: prepare final migration, backup, staged deploy, monitor, rollback | Production | Not authorized; no work executed |

**Crucial sequencing:** Preparing a document explaining possible production work is permissible, but **do not execute migrations or deploy code** until Stage 6, hosted verification, design-engineer review, and user's explicit go-ahead are complete. Focus effort on 6B–6D rather than prematurely migrating production.

---

## 4. Stage 6A implemented functionality — summary

- **Website JWT:** 8-hour access tokens with `client:'web'`, `sid` (session identifier), and `securityVersion`; live database verification rejects revoked sessions/security-version mismatches. Test backend intentionally rejects legacy JWT shape; must plan transition.
- **Keep Me Logged In (backend support):** optional HTTP-only refresh cookie (`wa_refresh`, under `/users`), rotating single-use refresh tokens; intended sliding expiration 180 days, bounded by a 365-day absolute lifetime. Frontend integration across WA is not complete.
- **Ordinary login:** username/password and email verification code; final session issued after code confirmation. `keepMeLoggedIn` accepted by verification route; registration does not log in automatically.
- **Logout:** revokes current website session. Password change/reset: transactionally changes password, revokes website sessions and TNNA refresh tokens, increments `UserSecurityT.SecurityVersion`; sends password-change notification after commit (email failure does not undo password change).
- **Forgot/reset password:** generic response to avoid address enumeration; random one-time reset token stored by SHA-256 hash; 30-minute lifetime; new request invalidates prior unused tokens; reset invalidates credentials. Read-only `/users/validate-reset-token` checks links before displaying editable password form. `APP_PUBLIC_ORIGIN` governs generated URLs.
- **Rate limiting:** MySQL 5.5-compatible `PasswordResetRateT`; per-email **5/hour**, per-IP **20/hour** (supplemental only), global **100/hour**. Counters are keyed by HMAC; no raw email/IP in table. Atomic InnoDB upserts and ordered locking tested, including 10 simultaneous attempts. **Global limit can itself be exhausted and deny legitimate resets**; revisit policy and monitoring before rollout.
- **Counter cleanup:** `services/passwordResetRateCleanup.js`, scheduled in `server.js` approximately 60 seconds after boot, then daily; expiration >48 hours; bounded 250-row batches and up to 12 batches/3,000 deletions per run; errors logged; scheduling and live two-batch deletion tested. Monitor backlog growth and maintenance costs before production. Per-process overlap guard, if enabled, must not be mistaken for cross-instance leader election.
- **TNNA online credentials:** `services/browserSession.revokeAll` revokes `TNNARefreshTokenT` entries; increased `SecurityVersion` invalidates TNNA JWTs. Offline town announcements were *not* verified in the revocation test itself.

**Known guards in existing source (do not simply deploy):** `services/browserSession.js` throws if `DB_NAME !== 'sql5838929'`; `services/passwordResetLimiter.js` and `services/passwordResetRateCleanup.js` also forbid non-test DB and/or `NODE_ENV=production`. A separate Render test service normally using `NODE_ENV=production` will need a carefully designed **test-hosted, explicitly isolated** configuration, not a blanket guard deletion. Review `.env.test`, app origin, cookie `secure`, and service env without leaking secrets.

---

## 5. Stage 6A verified test results (user reported)

These are **reported outcomes from the user's Windows environment**, not claims that the assistant independently ran the user's database/server. Automated tests supplement but do not replace final hosted end-to-end verification.

### 5.1 User initialization

- First audit: **17 users**, **17 `UserSecurityT` rows**, all matched, no missing/duplicate/invalid records.
- User registered a new account **UserID 63, `glaw`**; after registration: 18 users, 18 security records, 18 matched; `SecurityVersion=1`, `UpdatedAt=2026-10-18 13:50:39` (UTC from DB). Registration security record insertion is inside same transaction in `routes/users.js`.
- **Result:** existing and new user initialization passed.

### 5.2 Password change/reset transaction handling

- Initial temporary-table MySQL test failed because account lacked privilege; **not** an app rollback failure.
- Revised MySQL InnoDB test using existing `charter` (UserID 62) test records: both simulated password-change and reset SQL errors rolled back, restoring original security records; no commits.
- Separate local HTTP/handler tests with injected/mock DB failures: actual route callbacks for `/change-password` and `/reset-password` returned HTTP 500, invoked rollback, released connections, and preserved mocked data.
- **Limitations:** No live HTTP request with an injected real database failure; scope intentionally split between real InnoDB transaction semantics and mocked handler errors.

### 5.3 TNNA revocation

- Controlled synthetic credentials for `charter`/UserID 62, using real test DB and `revokeAll` inside a rollback-only transaction: before revocation JWT accepted and refresh token eligible; afterward both rejected; transaction rolled back; synthetic TNNA records absent; no existing phone changes.
- **Limitations:** Did not change a real password or call TNNA's HTTP endpoints in this test.

### 5.4 Password reset and rate limits

- Earlier local live `charter` account flows passed: regular/remembered login, token rotation and replay rejection, logout/session invalidation, password change and reset, notice email, expired/replaced links, one-time token consumption, frontend invalid-link status. This involved controlled test account/password changes in test DB; don't assume its old password persists.
- Per-email 5/6, per-IP 20/21, concurrency 10 requests exactly 5 allowed; persistence across MySQL pools; test keys removed.
- Global 100/101 test: passed against test MySQL; test indicated exact-key cleanup attempted for 203 keys, **not verified by that output**. Later separate HTTP-to-MySQL test verified removal of its four synthetic keys.
- Mocked Forgot Password HTTP: first five allowed; sixth generic/no extra email; unknown address generic; injected DB error HTTP 500/rollback; invalid Origin HTTP 403; connection release.
- **Actual local HTTP route + real MySQL limiter:** seven requests against nonexistent synthetic addresses, email counter six, global counter seven; no emails, invalid Origin rejected; **4 synthetic keys removed and verified absent**.
- No live email-sending flood tests. Render-specific proxy IP authenticity remained unresolved.

### 5.5 Cleanup capacity

- Unit test: 283 expired records handled in two 250-sized batches; large backlog capped 12 batches/3,000; empty backlog one batch; injected mid-run error reported accurately.
- Local `node --env-file=.env.test server.js`: connected to MySQL, cleanup scheduler logged **`removed 0 expired records in 1 batch(es)`**, which is an expected successful no-op.
- Live MySQL test: inserted **283 synthetic expired rows** plus one recent control row, preflight proved no unrelated expired rows; actual `cleanupOnce` deleted **283 in two batches**, verified recent record untouched; exact-key cleanup deleted control row; **no synthetic keys remained**.
- **Result:** planned cleanup capacity functional verification complete.

---

## 6. Database structure and migration implications — fresh October 18 dumps

SQL dumps are in Google Drive project root and were freshly fetched during handoff preparation.

| Table | Production `wappsDump.sql` | Test `wappsTestDump.sql` |
|---|---|---|
| `UserSecurityT` | Absent | Present |
| `WebSessionT` | Absent | Present |
| `WebRefreshTokenT` | Absent | Present |
| `PasswordResetT` | Absent | Present |
| `PasswordResetRateT` | Absent | Present |
| `TNNARefreshTokenT` | **Present** | **Present** |

- **Verified table counts from dumps:** production **66**; test **71**.
- Both dumps' header identifies MySQL **5.5.62** on FreeSQLdatabase and are generated **October 18, 2026**. The dumps are snapshots, not evidence of a later live database state.
- Production migration, **only after all gates**, must create the five missing tables, initialize existing users' security records, preserve existing TNNA refresh tokens/devices/registrations, and supply preflight/postflight verification + backups/rollback plan. Changes to historical session semantics need specific review.
- The test DB is retained after Stage 6; do not assume it is a clean copy of production after months of testing.

---

## 7. Files and project-wide Stage 6B review inventory

**Source of truth:** latest Google Drive versions; do not replace with reconstructed code or stale conversation attachments. The following are the **starting scope**, not a claim that every file must be edited.

| File/area | Required review focus |
|---|---|
| `server.js` | Mounts, middleware sequence, cleanup scheduler, proxy handling, origins, test-hosted configuration |
| `routes/users.js` | Register, verification, login, logout, keep-logged-in, change/forgot/reset, token status, errors |
| `routes/tnna.js` | TNNA verification, access JWT, refresh and offline-login interaction |
| `services/browserSession.js` | Session lifecycle, refresh rotation, cookie attributes, `revokeAll`, test-only guard |
| `services/verifyAccessToken.js` | JWT and session-security-version enforcement, legacy-token transition |
| `services/passwordResetLimiter.js` | Email/IP/global counters, failures, test-only guard, operational limits |
| `services/passwordResetRateCleanup.js` | Batch bounds, scheduling, DB maintenance, test-only guard |
| `middleware/auth.js`, `middleware/subscriptionAccess.js`, other authorization/usage middleware | All API paths enforce same semantics; subscriptions, cross-app auth |
| `send_email.js` | Verification, reset and password-change emails, trustworthy URL, sender/suppression in test |
| `dbConnection.js`, `.env.test`, Render environment settings | DB isolation, UTC, connection limits, JWT secrets, APP_PUBLIC_ORIGIN, NODE_ENV, HTTPS |
| `httpdocs/login.html` and related JS | Keep Me Logged In checkbox; forgot link; login/verification flow; redirect behavior |
| `httpdocs/forgotPassWord.html` | Token status, reset screens, validation/errors, generic messages |
| Registration page(s), Home page, account menu/change password page | Navigation, consistent logout and session expiry behavior |
| All WA HTML/JS apps including Family Tree/Networking, ETF Investing, Budget, tracking, property etc. | Find direct `localStorage` JWT handling, fetch wrappers, hard-coded redirects, auth failures and cross-tab flows; inventory whether changes needed |
| `TNNA/public/index.html`, `TNNA/public/config.js`, native Android service/notification code | Test service URLs; online revocation behavior; offline announcements not harmed; device notification behavior |
| `tests/` | Verify tests reflect latest code; build reusable regression suite, do not rely only on one-off mocks |
| SQL dumps and migrations | Full schema diff, new tables, explicit isolation of production/test, planned migration and rollback |

**Expected Stage 6B deliverable:** a **file-by-file audit** listing file path, current auth behavior, change needed (yes/no), proposed change, impact/risk, test case(s). Then implement groups of full revised files. Do not assume all project pages need edits just because they are inventoried.

---

## 8. Render test service — requirements and open decisions

- Create a **new independent** web service wired only to `reviseLogIn` (or a dedicated Stage 6 test branch if explicitly approved) and `sql5838929`.
- Verify the free plan is currently available; note sleeping/restart behavior, limits and any charges. Prior free test service for Node 24 succeeded but does not guarantee current entitlements.
- **Before connecting test service to actual user records**, verify all environment values, service base/origin URL, required secrets, test DB identity, and email suppression/test-recipient approach. Separate test and production refresh-cookie contexts by host and secure settings.
- Stage 6A services currently prohibit `NODE_ENV=production` and/or non-test DB. Adapt to a **separate explicit environment and database allowlist** for hosted test so staging can emulate HTTPS/secure cookies, while never allowing accidental production database access.
- Exercise real HTTPS cookies, 8h access sessions, refresh rotation, multi-tab refresh, restart persistence, password-reset redirect links, email flows, security-version invalidation, TNNA HTTP endpoints, subscription checks, app navigation, mobile browsers, and concurrency.
- **Render IP issue:** Render AI did **not** guarantee `CF-Connecting-IP` or `X-Forwarded-For` sanitization, precise proxy hop configuration, or direct-access exclusion. Do **not** unconditionally trust unverified forwarding headers. Retain per-email and global limits independently; IP limit is supplementary. Test safe IP resolution before using it for security-critical decisions. Potential global limit exhaustion is itself an availability risk.
- TNNA installed clients may still point at the **production** API; do **not** assume the phones connect to staging. Never change their account credentials to conduct testing.

---

## 9. TNNA existing devices and continuity

Previously identified identities (production-facing phones; not staging devices):

| Phone | TNNA account |
|---|---|
| Motorola A15 | `sthink`, UserID **1** |
| Motorola A8 | another account, UserID **40** |
| Ulefone Armor X16 Pro, Android 16 | UserID **58** |

The Ulefone announced towns successfully and showed a notification that Town Notification was active, but did not display the `TN` status-bar icon. This was categorized as a secondary Android notification-display concern, **not** evidence that town announcements failed.

**Mandatory rollout review:** Understand TNNA stored refresh credentials, 8-hour access tokens, versioned JWT changes, offline login policy (previously 30 days), and actual screen-off/background town-announcement functionality. The Stage 6A synthetic revocation test does **not** establish that account revocation preserves every offline user flow. Do not invalidate already installed phones without a migration strategy and user approval.

---

## 10. Remaining risks and work before any deployment

- **Global rate limiter:** fixed window 100/hour across all accounts can be intentionally exhausted; check denial-of-service trade-offs and operational alerts. IP source behind Render remains unverified.
- **Counter maintenance:** up to 3,000 expired rows/day in tested configuration; monitor growth and decide behavior for extremely large backlogs or multiple staging/production instances.
- **Production SQL:** requires migration and initial security row insertion. Avoid altering `TNNARefreshTokenT` unnecessarily; verify foreign keys/indexes/collations against actual MySQL 5.5 database.
- **Session transition:** legacy tokens may fail immediately when revised verifier deploys; ensure seamless or explicitly approved re-login behavior for WA/TNNA.
- **Test-hosted deployment:** test-only hard guards must be replaced safely before using production-like NODE_ENV on separate Render test service, without removing isolation.
- **Email and reset URLs:** distinguish staging/production origins, sender identity and test recipients; verify invalid token feedback and privacy.
- **Cross-page application inventory:** frontends may independently cache JWTs, handle expiry, or redirect. Stage 6B audit is required to find these.
- **Review owner:** design engineer identity and method not yet designated by user. Provide complete review packet when Stage 6 candidate is ready.

---

## 11. Design-engineer review — NEW mandatory gate

**Timing:** AFTER Stage 6A–6D are implemented and have completed local **and hosted Render test-service** testing; BEFORE any decision to merge into `main`, migrate production DB, or deploy Stage 6 to production.

**Scope for the engineer:**

1. Verify all Stage 6 requirements versus implementation and document any deviations.
2. Review complete file-by-file diff for web HTML/JS, Express routes, middleware, email, TNNA integration, service configuration, and database SQL.
3. Audit security model: access/refresh lifecycle, remember-me semantics, cookie options, origin/CSRF, account enumeration, rate limits, JWT invalidation, session/TNNA revocation, failure handling, proxy header trust, privacy/PII.
4. Audit operations: MySQL 5.5 compatibility, concurrency, DB indexes and quotas, cleanup scheduling, server restarts, mail delivery, logs/secret leakage, account initialization.
5. Audit migration/rollback and installed-client compatibility; assess **what happens if rollback is necessary after a schema or token-format change**.
6. Independently evaluate test evidence and coverage gaps; recommend additional tests as appropriate.
7. Produce **written findings** grouped by severity, required corrections, residual risks, and explicit go/no-go recommendation.

**After review:** Implement accepted corrections on Stage 6 branch, rerun regression and hosted tests, have engineer recheck material items, then present results to user. **Only the user approves** merge and production deployment. An engineer review is not a substitute for user authorization.

---

## 12. Suggested opening message for the new chat

> **Wonderful Apps — Stage 6B continuation.** I am attaching `WA_Stage6_Continuation_2026-10-18.md`. Read it before suggesting changes. Our source of truth is the current Google Drive Wonderful Apps project files and fresh SQL dumps (`wappsDump.sql` production; `wappsTestDump.sql` test). Continue on `reviseLogIn`, using test DB `sql5838929` exclusively. Do not touch production, Render's existing production service, or `main`. Stage 6A safeguards have passed their planned functional tests; Stage 6B now begins with a comprehensive WA project file audit and file-by-file change inventory, followed by revised complete files. We will also establish a separate Render test service for Stage 6 testing. After *all* Stage 6 work and hosted testing, an independent design engineer must review the completed implementation **before** any merge/production decision. Start by explaining the Stage 6B audit approach and examining Google Drive code; distinguish confirmed decisions from proposals.

---

## 13. Provenance and limits of this handoff

- Written from the Stage 6 discussion, user-provided terminal output, current mounted project source files, and October 18 Google Drive SQL dumps.
- **Directly verified in the dumps:** production 66 tables vs test 71 and precise five-table difference listed above.
- **Reported, not independently replayed here:** user's local tests, free Render experience, installed TNNA behavior, and historical account testing outcomes.
- This document records the most important known decisions but **does not claim to recover every original Stage 6 design detail** from older discussions. At Stage 6B kickoff, reconcile any missing original acceptance criteria from relevant prior design materials; flag uncertainty instead of inventing requirements.
- Never store passwords, JWT secrets, refresh secrets, real reset links, production DB credentials, or copies of `.env` secrets in this handoff.

**End of handoff — no production changes authorized.**
