# Wonderful Apps — Stage 6 Production Implementation Plan

**Version:** 1.2 — Draft / tracking document  
**Prepared:** October 25, 2026  
**Status:** **NOT AUTHORIZED FOR PRODUCTION DEPLOYMENT**  
**Project branch:** `reviseLogIn` (development); `main` (production)  
**Local/test DB:** `sql5838929` through `.env.test`  
**Production DB:** exact identity, host, schema and version **to be verified at preflight**  
**Related documents:** `docs/Stage6_OpenItems.md` (latest local v2.2 reported; Google Drive copy read as v2.1 on October 25), `docs/Stage6_Render_TestPlan.md`, Stage 6 handoff and engineering reviews.

> **Purpose.** Maintain a running deployment inventory throughout Stage 6. This is an implementation *plan*, not executable migration SQL, a verified Git diff, or authorization to update `main`, Render, the production database, or TNNA devices.

## 1. Guardrails and ownership

- Keep the existing production Render service, production SQL data, `main`, and installed TNNA clients unchanged until explicit user authorization after final review.
- Development and test activity stays on `reviseLogIn` and `sql5838929`. Separate Render staging must use the test database and isolated secrets, and must verify its connected database identity.
- Do **not** restore a complete test database dump into production. Generate a reviewed, minimal, ordered **schema/data migration** that retains production users, credentials, subscriptions, financial/Family Tree data and TNNA records.
- Do **not** publish test credentials, database connection strings, refresh secrets, cookies, JWTs or reset links in Git, documentation or screenshots.
- No deploy until local and hosted acceptance, independent post-implementation engineering review, reconciliation of Open Items, rollback rehearsal and the user's explicit final approval.

## 2. Master production-change inventory

Track each approved change with a durable ID; populate *exact* filenames, SQL migration names, current file hashes, reviewed commit hashes, and deployment order before cutover. The entries below are **known or anticipated categories, not a verified complete diff**.

| ID | Area | Known or anticipated change | Verification needed | Status |
|---|---|---|---|---|
| PC-001 | Git/code | Merge only approved Stage 6 commits from `reviseLogIn` into current `main`; account for any changes to `main` since branching | `git log`, `git diff main...reviseLogIn`, conflicts and code review | Inventory pending |
| PC-002 | Browser module | Add `httpdocs/js/waPlatform.js` (session restore/refresh/logout, safe API handling) | Exact final module, references, loading/cache behavior and tests | Implemented in local testing; release review pending |
| PC-003 | Login/Home | Approved changes to `httpdocs/login.html` and `httpdocs/home.html`, including session restoration, server logout, and revoked-session/permission fail-closed fix | Final tracked diffs; Login/Home regression | Local Group 2 tested; release review pending |
| PC-004 | Password/recovery UI | Change Password, Forgot/Reset Password and supporting pages/routes | Full file list and final behavior verification | Inventory pending |
| PC-005 | API/backend | Browser session, password security, login challenge, refresh rotation, server logout, revocation and rate-limit code | Full route/service/middleware diff and API contract | Inventory pending |
| PC-006 | App integration | Family Tree/Networking, Budget, ETF, tracking, other WA pages using standardized auth | File-by-file inventory; privacy header and write regressions | Work pending |
| PC-007 | Tests | Stage 6 regression tests, harnesses and fixtures | Separate release tests from test-only utilities; no test harness on public site | Inventory pending |
| PC-008 | Config | Node version, environment validation, cookie/Origin/CSRF, proxy/IP settings, cache/service-worker rules | Exact approved values per environment; no secret values in plan | Inventory pending |
| PC-009 | Database | New/changed tables, indexes, security/version columns, constraints and data initialization | Test schema vs production schema, precise forward/rollback SQL | **Not yet enumerated** |
| PC-010 | Legacy transition | Existing browser access/refresh sessions and TNNA online tokens; account security versions | Decide fresh-login policy, backward compatibility, expiry and device effects | Policy and test pending |
| PC-011 | Docs/runbooks | Open Items, Render test plan, production implementation plan, API/ops instructions | Update and version with release candidate | Ongoing |

### Per-file change ledger (complete before release)

| File path | Added/modified/deleted | Reason | Source commit/hash | Local tests | Hosted tests | Release decision |
|---|---|---|---|---|---|---|
| `httpdocs/js/waPlatform.js` | New | Shared session/auth API | TBD | 19/19 isolated module tests user-reported | TBD | Pending |
| `httpdocs/login.html` | Modified | Shared module login integration | TBD | Interactive login passed | TBD | Pending |
| `httpdocs/home.html` | Modified | Session restore/logout, revoked-session fail-closed correction | TBD | Local regression passed for tested scenarios | TBD | Pending |
| *(Generate remaining rows from verified Git diff)* | | | | | | |

**Release exclusion list:** `.env*` with secrets, local backups (`*.group2-before`, `*.group2-revocation-before`), temporary patch scripts and local console test harnesses unless specifically reviewed as release materials. Exclude local SQL dumps containing sensitive/test-user data from application deployment.

## 3. Database migration ledger — mandatory before deployment

**This section is intentionally unfilled until the actual schemas are inspected. Do not invent SQL based on the test database alone.** Record both connection identity and version without revealing passwords. Obtain a schema-only export or metadata of the **production** database by an authorized read-only process and compare to verified `sql5838929` schema.

| Migration ID | Object/column/index | Current production definition | Tested target definition | Forward SQL file | Data backfill/preconditions | Rollback method | Reviewed |
|---|---|---|---|---|---|---|---|
| DB-001 | Stage 6 security/session objects — exact list TBD | TBD | TBD | TBD | Existing-user safe initialization | TBD | No |
| DB-002 | Login verification/reset/rate-limit objects — exact list TBD | TBD | TBD | TBD | Preserve existing challenges if required | TBD | No |
| DB-003 | Additional changes from schema diff | TBD | TBD | TBD | TBD | TBD | No |

**Database gate:** Forward SQL must be idempotent where feasible, compatible with the actual production MySQL/MariaDB version, transaction/DDL behavior, existing foreign keys and user data. Test it against a suitably isolated production-like copy; measure row counts, collisions, errors and runtime. Some DDL cannot be rolled back transactionally: specify restore/compensating steps and planned outage/maintenance decisions. Never substitute the test DB contents for production data.

## 4. Render / environment configuration ledger

| Item | Local/test evidence | Production requirement | Status |
|---|---|---|---|
| Node/runtime | Local `WA_ENV=local`, `.env.test`, verified test DB; historical Node 24 update | Verify pinned Node version and dependency lock at release | Pending |
| Database identity | Startup log: test DB verified | Explicit allowlist/identity guard for production; independent production credentials | Pending |
| Cookies | Refresh cookie intended HttpOnly, SameSite/Path settings | Verify HTTPS `Secure`, domain/path, expiry and rotation behind Render HTTPS termination | Pending |
| Origin / CSRF | Same-origin local behavior tested | Explicit allowed origin(s), Origin/CSRF header tests | Pending |
| Proxy/rate limits | Local request behavior | Verify `trust proxy`, forwarded headers and effective IP handling on Render | Pending |
| Email/reset links | Local email flow tested | Production base URL, provider settings and non-leaking diagnostics | Pending |
| Service worker / cache | Home/Login use service worker | Consistent asset cache invalidation and script-version rollout | Pending |
| Secrets | Test-only secrets | Independent production secret configuration; no copy/paste from staging | Pending |
| Staging separation | Planned separate Render staging service | Confirm staging points only to `sql5838929`, never production | Pending |

Record setting **names and proof of correct behavior**, not secret values. Capture redacted Render service IDs, Git commit hashes, deployment timestamps, health checks and runtime logs.

## 5. Existing users, credentials and TNNA compatibility

- Preserve production user IDs, password hashes, verification state, subscriptions and billing/business information.
- Decide if legacy website sessions should be invalidated and require fresh verified login; **not yet approved**. Document impact and communication.
- Verify `SecurityVersion`/new account-security row initialization for every existing production user; prevent NULL/duplicate issues.
- Preserve TNNA's online credential compatibility and **offline/screen-off town notification operation**. Do not change installed TNNA configuration as part of the browser deployment without separate approval.
- Reconcile `180-day sliding / 365-day absolute` remembered website policy and any still-undecided TNNA lifetime policy; do not silently impose new native behavior.
- Test a controlled migration account set: ordinary, KMLI, admin, active/expired subscription, password-changed, and TNNA-linked (test-only identities).

## 6. Test and sign-off prerequisites

These prerequisites correspond to `Stage6_OpenItems.md` IDs and the separate `Stage6_Render_TestPlan.md` scenarios.

| Gate | Minimum acceptance evidence | Owner/reviewer | Status |
|---|---|---|---|
| G-01 | Local Group 0a and Stage 6B tests recorded, remaining defects resolved | User/development | In progress |
| G-02 | Group 2 Login/Home and password revocation regressions documented | User/development | Local results reported; hosted pending |
| G-03 | Remaining local Forgot/Reset, app integrations and error paths pass | User/development | Pending |
| G-04 | Separate Render staging verifies identity, HTTPS cookie behavior, Login/KMLI, revocation and email flows | User/development | Pending |
| G-05 | Targeted browser and TNNA compatibility, security/rate/IP checks | User/development | Pending |
| G-06 | Schema diff, forward migrations, production-like rehearsal, backup and rollback drill | Database reviewer | Pending |
| G-07 | Security and independent final engineering review after all changes/tests | Independent reviewer | Pending |
| G-08 | User explicitly authorizes production migration/merge/deploy | User | **Not authorized** |

**Local evidence already reported:** `waPlatform.js` isolated tests 19/19; Chrome normal/incognito KMLI tests #1–#7; missing-token restore #8A; overnight refreshed 8-hour token #8B (new JWT issued 2026-10-25 09:10:24 local); controlled concurrent Web Lock test #9D (entered=2, pending=2, held=1; one observed refresh HTTP 200); Change Password #10A–#10E including old password rejection and repaired revoked-session Home display. These are user-reported local results, **not hosted evidence**. Forgot/Reset Password tests #11A–#11G passed locally, including revocation, one-time link and >30-minute expiry; final fresh login and broad app integration remain pending.

## 7. Proposed release sequence — no execution authorization

1. **Freeze a release candidate:** Save/commit reviewed `reviseLogIn` work on the development branch; exclude temporary artifacts; record exact commit SHA and lockfile/runtime versions.
2. **Inventory and compare:** Review `main...reviseLogIn` diff and latest `main` additions, production vs test schema, Render configuration and the Open Items register. Resolve conflicts and create deployment manifests.
3. **Complete local acceptance:** Run unit/integration tests, browser flows, application smoke tests, password/reset/revocation cases, and token/privacy logging audit.
4. **Deploy isolated staging:** Create/verify separate Render staging from the approved candidate using test DB/secrets; execute `Stage6_Render_TestPlan.md`. Do not touch the existing production service.
5. **Independent engineering review:** Assess final code/SQL/deployment plan and all test evidence; remediate findings, repeat affected tests and update registers.
6. **Preproduction backup and rollback rehearsal:** Verify actual restore capability, retention, database point-in-time recovery feasibility, version-compatible rollback and communication plan.
7. **Approval checkpoint:** User reviews exact commit, SQL scripts, changed Render settings, downtime/user-session impact, backups, tested rollback, and open limitations. Require explicit approval for each production-changing phase.
8. **Production database migration:** After approval and appropriate maintenance planning, take fresh backup, confirm target identity, run reviewed ordered SQL, capture logs and verify schema/data integrity. Do not proceed on mismatch.
9. **Application cutover:** Merge reviewed candidate to `main`, deploy the approved commit to the existing Render production service, validate runtime config/HTTPS and startup DB guard. Coordinate order with backward-compatible schema requirements to avoid downtime or auth mismatch.
10. **Postdeployment validation and rollback decision:** Test login, session renewal, password recovery, access controls, subscriptions, tracking, and TNNA compatibility. Monitor health/error/security logs; if gates fail, enact documented rollback/mitigation and notify relevant users as appropriate.
11. **Close out:** Record production commit, migrations, timing, evidence, issues, recovery actions, approvals and updated `Stage6_OpenItems.md`.

**Sequence dependency:** Steps 8 and 9 must be refined against verified forward/backward compatibility; they are not blindly executable in the order above if old and new application versions require incompatible schemas.

## 8. Rollback and failure rules

**Before cutover:** no go if DB identity does not match, backup cannot be restored, production schema differs from reviewed manifest, security tests fail, unknown TNNA impact exists, or any critical open item lacks accepted disposition.

**During migration/deploy:** record a go/no-go point after each irreversible or potentially destructive operation. Halt on validation mismatch; do not retry partially executed DDL without examining actual state. Keep prepared prior application commit, previous Render settings snapshot and database restoration instructions.

**After cutover:** assess rollback **both** code and schema/data compatibility. Reverting Git alone may not reverse database changes; restoring database may discard new production writes. Prefer compatible additive migrations and reversible feature flags where practicable. Escalate any user-data risk rather than improvising rollback.

### October 25 — password recovery production-transition tracking

| Change area | Local evidence | Required production inventory/decision | Status |
|---|---|---|---|
| Forgot/reset UI and routes | Local browser #11A–#11G passed | Compare exact `reviseLogIn` vs `main` files; list approved routes/templates/services | Inventory pending |
| Reset/challenge SQL | Valid/consumed/expired token behavior observed | Schema-only comparison and idempotent migration DDL; preserve production data and active accounts | SQL not yet verified |
| Email links/provider | Local test link reached `localhost:8080` | Production URL/origin and approved email sender; no links accidentally point to staging/local | Pending |
| Session invalidation | Reset invalidated existing Incognito session | Confirm production security-version data transition and legacy web/TNNA compatibility | Pending |
| Security logging | Token property observed in `amortization.html` Console | Inventory/remediate token-bearing logs before release; safe redacted logs | Open S6-030 |
| Fresh reset-password login | Not yet checked after successful reset | Confirm current credential usable, former credential rejected, without leaking passwords | Pending |

**No executable production migration, new account initialization, schema conversion or cutover authorization has been generated from these observations.**

## 9. Production deployment execution log (blank until authorized)

| Date/time & timezone | Step ID | Target environment and verified identity | Commit/migration version | Operator | Result / redacted evidence | Go/no-go |
|---|---|---|---|---|---|---|
| TBD | Preflight | TBD | TBD | TBD | TBD | Pending |
| TBD | Backup | TBD | TBD | TBD | TBD | Pending |
| TBD | DB migrate | TBD | TBD | TBD | TBD | Pending |
| TBD | Deploy/verify | TBD | TBD | TBD | TBD | Pending |

## 10. Change control / revision history

| Date | Version | Change |
|---|---|---|
| 2026-10-25 | 1.0 | Initial tracking plan based on Stage 6 discussion, existing Open Items register and separate Render test plan. Unverified production schema/code diffs intentionally marked TBD. |
| 2026-10-25 | 1.1 | Recorded successful local Forgot/Reset Password #11A–#11G, including old-session revocation, one-use reset and 30-minute expiration; identified remaining production reset URL, email origin, schema migration and logging checks. No migration SQL approved. |

### Update convention after every Stage 6 implementation group

1. Update the exact code/file and SQL ledgers for the completed group.
2. Record local automated/browser evidence and relevant commits; cross-link the applicable `S6-###` items.
3. Mark staging evidence separately from local evidence; do not close hosted gates early.
4. Add a dated revision entry. Keep this plan, `Stage6_OpenItems.md`, and `Stage6_Render_TestPlan.md` synchronized.

**Final approval state: NOT AUTHORIZED FOR PRODUCTION DEPLOYMENT.**

## October 26, 2026 — Group 3B-1 change and regression evidence

- **Implementation scope:** Local `reviseLogIn` candidate `httpdocs/Weights.html` only, adapted from authoritative `Weights_COPY.html` to use the existing Stage 6 shared browser authentication facade; the existing layout, Print handlers and business behavior were preserved. No Weights SQL/schema migration required by this page revision. Do not assume the local candidate has been committed, uploaded to Drive or deployed.
- **Local test evidence:** Incognito `sthink` remembered-session refresh recovered after manual removal of `localStorage.token` (#16D-R; HTTP 200 refresh and Weights). Search/Cancel, Print, Date Range/chart and Add/Edit form Cancel passed. An actual Delete of test records dated **2026-09-19–2026-09-23** on verified `sql5838929` succeeded; after reload, deletion persisted and adjacent records remained. Tests of Add/Update database writes and negative authorization/usage tracking are pending.
- **Deferred preexisting defect S6-039:** Original Weights Delete dialog attempts `.toISOString()` on date strings and logs a TypeError when opened. User directed **no correction now**. It did not block manually entered range deletion. Carry forward as a disclosed UI defect for explicit later review; do not silently include optimization/cleanup in authentication delivery.
- **Deployment state:** No production approval, database migration, Render deployment or `main` merge. Preserve separation of local evidence from staging and independent design-engineer final review.

| 2026-10-26 | 1.2 | Added preservation-only Weights revision scope, confirmed local deletion, deferred S6-039, and outstanding regression/deployment gates. |

---

## October 27, 2026 — HelioHost MariaDB local testing update

**Scope:** Local `reviseLogIn` testing only. This update does not authorize a Render staging service, staging database substitution, production migration, Git merge, or TNNA device change. Production remains on its existing Render and freeSQLdatabase configuration.

- **Authoritative project files:** Google Drive `My Drive/wonderfulApp` (folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`). Treat Drive as synchronized with local files unless evidence establishes a difference.
- **Existing test database:** freeSQLdatabase MySQL `sql5838929`. Its prior local configuration was saved as `.env.testFreeSQLdb` (reference copy; not automatically loaded by Node).
- **Additional local test database:** HelioHost Johnny MariaDB 12.3.3, database and user `wapps_test`, hostname `johnny.heliohost.org`, port 3306. `.env.test` is currently the local HelioHost configuration and is launched with `node --env-file=.env.test server.js`. Never commit or publish either environment file or database password.
- **Migration verification:** The October 27 source/target SQL dumps matched across 71 tables, exported records, key/index and foreign-key definitions in the completed dump comparison. This is not full behavioral certification.
- **Secure connectivity:** Windows local Node.js 24.22.1 / `mysql2` 3.14.1 connected successfully using TLS (`TLS_AES_256_GCM_SHA384`) and read 71 tables. SQLTools' separate session previously showed an empty `Ssl_cipher`; that client session must not be claimed TLS-verified.
- **Connection limits:** On Johnny, `max_user_connections=10` per MariaDB account and `max_connections=300` server-wide. WA's previous pool setting `connectionLimit: 50` could exceed the account limit. Local HelioHost `.env.test` now uses `DB_CONNECTION_LIMIT=5`, supported by the modified local `dbConnection.js`; `waitForConnections: true` and `queueLimit: 0` preserve queued pool behavior. Five is a tested local setting, *not* a verified Morty limit or a guarantee that all additional pools/processes fit beneath ten.
- **Observed regression and resolution:** Budget **Print My Details** failed locally with `User wapps_test already has more than 'max_user_connections' active connections`. After configuring pool limit 5 and restarting, the user confirmed that this report worked. The cause was connection exhaustion; there was no evidence that Budget date calculations needed modification. Several other local applications were reported working but the entire WA test matrix has not passed.
- **Hosted Stage 6 isolation remains unchanged:** Existing Stage 6 Render test plan currently specifies `sql5838929` only for any future *separately approved* staging service. The local HelioHost allowance must **not** be inferred to authorize `wapps_test` in staging. No Render test service has been created. Any future switch requires separately reviewed environment guards, secure DB pool configuration, test secrets, account-connection budgets, and explicit approval before deployment.
- **Operations and rollback:** Preserve existing `.env`, production configuration and unrelated Stage 6 changes. To return to the freeSQLdatabase local test, restore the appropriate test settings from `.env.testFreeSQLdb`, retain approved guards, verify actual connected database identity, and restart; do not assume a renamed backup file is loaded automatically. Avoid concurrent test processes and unnecessary SQLTools sessions consuming the same account's ten connections.
- **Open verification:** Audit all WA database pools/background jobs and per-user connection consumption; verify connection reuse, bounded concurrency, performance and failed-query recovery; complete local app CRUD/authorization/security tests; determine Morty's actual per-user limit and TLS/backup policies; complete independent engineering review before any production decision.

### Production gate addition — database host change is a separate decision

- Record `DB_CONNECTION_LIMIT` and TLS verification among configurable deployment changes; do not silently carry Johnny's tested value of 5 into Morty or production.
- Before any database cutover, obtain Morty per-user connection allowance, maximum service-wide connections, TLS/certificate policy, backup/restore evidence and representative workload results.
- Keep Stage 6 production schema migration separate from a later MySQL-to-MariaDB hosting migration. Do not apply a test dump to production or imply that Johnny local success authorizes a Morty move.
- Maintain independent rollback plans for Stage 6 code/authentication and database hosting, with verified database identities and explicit approval for each.

<!-- STAGE6-LOGGING-RELEASE-GATE-2026-10-30 -->
### October 30, 2026 — Logging / API error-response release gate

- Commit `8fa035f` contains the earlier `server.js` / `morgan.js` HTTP URL logging fix, with H01–H04 targeted hosted login regressions reported passed. This evidence does **not** certify all application logging or response handling.
- A further consolidated logging-only revision modifies 14 JS files (69 logging replacements), currently **uncommitted and not deployed**. Local whitespace, syntax and code-diff review passed; local startup, representative functional tests and isolated hosted checks remain required. Preserve backups and the existing production environment.
- **Open security item S6-041:** `routes/familyTree.js` Favorite Pets handler returns raw `e.message` in a JSON API response; separate from server-side logging. Review potentially similar exception-to-client paths, define approved safe error-response behavior and regression-test before independent design-engineer review and any production decision.
- Do not merge to `main`, redeploy production, modify production SQL, or change TNNA devices without explicit approval and the existing Stage 6 release gates.
