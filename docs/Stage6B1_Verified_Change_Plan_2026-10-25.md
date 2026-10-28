# Wonderful Apps — Stage 6B-1 Actionable Authentication Change Plan

**Date:** October 25, 2026  
**Status:** Read-only reconciliation / preliminary implementation schedule — NOT an authorization to modify application code, SQL schema, Render, or production.  
**Branch:** `reviseLogIn` (local HEAD comparison pending)  
**Source:** Google Drive `WA_Stage6B1_Authentication_Inventory_2026-10-24.md` and targeted Google Drive file reads.

## Classification rules

- **Confirmed change candidate:** Current retrieved source contains a concrete direct authentication, API, or token-logging pattern. Exact replacement still requires current local source review.
- **Targeted review:** Inventory recommends inspection, but no specific change is approved without source/control-flow analysis.
- **Regression only:** Test UI and linked scripts; may be reclassified as linked code is reviewed.
- These labels do **not** mean the code is a confirmed security vulnerability or that every file must change.

## Source-confirmed priority candidates

| File | Source evidence | Action proposal | Tests |
|---|---|---|---|
| `httpdocs/changePassword.html` | Line 53 reads `localStorage.getItem('token')`; line 60 calls `GET /users/session-status` with direct Bearer; line 80 calls `/users/change-password` | Use shared session validation/request contract; preserve rejected-current-password 401 as form error and existing UI, including signout on actual success | Tests #10A–#10E, #13A–#13D; revoked/expired token, network error |
| `httpdocs/amortization.html` | Lines 266–315: direct token handling, time-spent payload includes `token`, entire payload logged to Console | Remove secret-bearing diagnostic output and assess whether server truly requires token in JSON body; migrate tracking to shared authenticated request without changing amortization calculations | Page/time tracking and navigation; no token in logs, revoked session fails closed |
| `httpdocs/etfSymbol.html` | Line 143 captures token once; lines 179–375 independently supply Bearer headers for ETF GET and mutations | Fetch token at request time via shared helper; never auto-replay unsafe POST/PUT/DELETE; preserve ETF validation/calculations | GET; create/edit/delete; 401/403/5xx and expired/remembered session |
| `httpdocs/BMoney.html` | Lines 247–262 define `token()` and `apiFetch()` with a direct Bearer header; many reads/writes invoke it | Replace duplicated wrapper with standardized API contract, carefully preserving response handling and delete safeguards | Budget summaries; investments; account pocket edits and deletes; session errors |

## Group schedule and gates

| Group | Planned scope | Entry gate | Exit evidence |
|---|---|---|---|
| 3A — Foundation/admin/tracking | Change Password, subscription, SubControl, Track, notification preferences, shared usage tracking; Home/Login targeted regression | Inspect current local `waPlatform.js`, Home and touched files; resolve higher-priority session/replay issues before wide rollout | Valid/expired/revoked sessions, subscription and admin 401/403, no token in Console, current UI preserved |
| 3B — Smaller applications | Weights, Activities, Interest Earned, propertyInfo, amortization, weighIn | 3A shared APIs and error convention settled | Login/logout/restore, read/write behavior, time logging, app-specific calculations |
| 3C — ETF | `etfSymbol`, `etfCompare`, `etfCategory`, `etfActivity`, `etfAPItest` | API call matrix and safe mutation policy reviewed | Existing quote/provider behavior and investment actions, 401/403 handling |
| 3D — Budget | `BMoney` plus Budget forms/reports and `BudgetPrintDetails.js` | Shared Budget API helper pattern tested in one representative page | Financial calculations/printing unchanged, read/write regression and authorization |
| 3E — Family Tree and Networking | FT JS and linked HTML; special privacy/contact/verification routes | Audit page-token and FTPrivacy interception first; do not monkeypatch `fetch` | Privacy headers, relationship, Networking, uploads, duplicates, public verification and app nav |
| 3F — Backend and final | `browserSession`, `users`, `tnna`, route/middleware, cache, environment, hosted acceptance | Local app groups complete, test harness green | TNNA compatibility, replay/Origin/rate tests, Render acceptance, independent engineer review |

## Baseline checks before code generation

1. Read current Google Drive sources and compare with local `reviseLogIn` working tree. Google Drive snapshots may lag locally applied Group 2 patches.
2. Record `git branch --show-current`, `git status --short`, latest commit, and `git diff --check` (read-only).
3. Preserve `home.html`/`login.html` Group 2 changes and backups. Do not commit backups, test data, or secrets.
4. Inventory exact HTTP verbs and auth guards for each page before replacing fetch calls; preserve Family Tree page-token and public-token behavior.
5. Do not conduct tests in Chrome Normal until the pending ordinary KMLI-unchecked Test #12C has completed; local source review can proceed in parallel.
6. Do not alter production, `main`, SQL schema, Render, or installed TNNA phones without explicit approval.

## Open-items links / future updates

- `S6-005` application-wide rollout; `S6-008` 401/403 safety; `S6-009` entitlements; `S6-017` privacy; `S6-024` caching; `S6-025` usage tracking; `S6-030` sensitive logging; `S6-034` source provenance.
- Update `Stage6_OpenItems.md`, `Stage6_Render_TestPlan.md`, and `Stage6_Production_Implementation_Plan.md` after each implementation group; this file is an implementation planning companion, not a replacement.

## Evidence limitations

The October 24 inventory's approximate counts (59 CHANGE, 41 REVIEW, 23 REGRESSION) were carried forward as **preliminary counts**. Only four retrieved source files were independently sampled in this reconciliation. Do not assert that all inventory entries have been individually reverified, or that current local HEAD has been compared byte-for-byte with Drive.

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

### Group 3D Budget evidence update (October 27, 2026)

- On `reviseLogIn`, the local Budget Print My Details report against HelioHost `wapps_test` initially failed because the account exceeded `max_user_connections=10`. This is verified as an **environment/pool capacity issue**; it is not a confirmed regression in Budget algorithms or shared auth.
- Changing the local pool limit from 50 to `DB_CONNECTION_LIMIT=5`, followed by restarting, resulted in a user-confirmed successful report. Preserve Budget calculation/printing logic.
- Group 3D still requires original authorization/session behavior and full CRUD/regression testing. Record the result as one focused local acceptance point, not completion of Group 3D or hosted testing.
- For development hygiene, do not commit `.env.test` or `.env.testFreeSQLdb`; Stage 6 and production guardrails continue to apply.
