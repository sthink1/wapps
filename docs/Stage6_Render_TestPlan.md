# Wonderful Apps — Stage 6 Render Staging Acceptance Test Plan

**Version:** 1.2  
**Prepared:** October 25, 2026  
**Status:** Planning document; staging service has **not** been authorized for deployment  
**Branch:** `reviseLogIn` (verify exact branch and deployed commit before any setup)  
**Test database:** `sql5838929` exclusively (verify actual connection identity)  
**Companion register:** `docs/Stage6_OpenItems.md` (Version 2.3 prepared October 25; synchronize after review)  
**Production:** Existing Render services, database, `main`, and deployed/installed TNNA remain unchanged.

## 1. Objective and evidence policy

Prove the completed Stage 6 browser-authentication design works on an **isolated HTTPS Render test service** while avoiding unnecessary duplication of local tests. Reuse local Node/unit, SQL-race, and browser results as supporting evidence. Repeat only security-critical browser flows affected by HTTPS, cookies, proxy behavior, deployment/build/runtime, or server restarts; use smoke tests for otherwise completed functional work.

A local passing test is not a hosted passing test. For each hosted test record date/time, deployed Git commit, test browser/device, KMLI setting, expected/actual result, safe HTTP status observations, sanitized logs, issue ID, and disposition. **Do not capture passwords, JWTs, refresh cookies, email codes, reset links/tokens, or full Authorization headers in documentation.**

## 2. Non-negotiable isolation and approval gates

- **Before creating a staging service:** obtain explicit authorization to create it and approve estimated costs, service name, database, and staging hostname/origins. This document itself does not create or deploy anything.
- Create **new** Render service from a verified `reviseLogIn` commit. Do not repoint, redeploy, alter environment variables of, or link to the existing production WA service.
- Connect only to the verified test database **`sql5838929`**; inspect runtime database identity after connection, and abort on mismatch. Never permit staging to access production credentials or database.
- Configure separate staging secrets, session-cookie settings, email destinations/test account policy, `WA_ENV=staging` (only if supported by tested code), and explicit staging allowed origins. Validate environment guards against the actual branch before deployment. Do not invent variable names; map each to current `server.js`, `.env.test`, and auth services.
- HTTPS must be enforced; browser cookie security must be verified under Render's proxy. Do not relax Secure/SameSite/Origin protections just to make tests pass.
- Use test accounts only. No live customers, production emails, production TNNA device changes, account migration, production database SQL, or `main` merge without separate approval.
- Ensure staging access is restricted appropriately and email verification/reset links use the staging origin. Never send unintended emails to real users.
- Establish rollback: staging service may be stopped/deleted without changing production. Back up test database as appropriate before tests that mutate test-account credentials; verify restoration procedures and ownership.

## 3. Entry criteria / preflight checklist

| ID | Preflight verification | Pass evidence |
|---|---|---|
| P01 | Local Group 2 fixes and subsequent application integrations are committed/reviewed on intended branch (not `main`) | `git branch -vv`, commit hash, reviewed `git status` |
| P02 | Local unit/SQL/browser tests summarized with outstanding limitations | `Stage6_OpenItems.md` and sanitized commands/results |
| P03 | Staging service has isolated repo branch, environment and intended runtime versions | Render build/deploy configuration screenshot with secrets obscured |
| P04 | Runtime confirms expected `WA_ENV` and **connected** test database `sql5838929` | Sanitized startup guard log |
| P05 | Staging hostname, HTTPS, CORS/Origin and cookie parameters are mapped to current code | Approved configuration matrix |
| P06 | Test email and recovery flows cannot affect production users | Verified test recipients and link origin |
| P07 | Test accounts and reversible password-change plan approved | Test-account inventory; no passwords in register |
| P08 | Browser mode and device specified for each run | Chrome Normal primarily; Incognito for targeted private-session behavior |
| P09 | Baseline production service remains unchanged | Independent pre/post configuration comparison |

**Stop gate:** Any mismatched database, production credential/origin, insecure staging cookie, or unexpected impact on production halts hosted testing.

## 4. Hosted test matrix — required versus selective

**Priority:** `H` = required hosted acceptance; `S` = focused smoke/repeat; `L` = reuse local evidence, hosted repetition only if changed code or a failure warrants it. Test numbers are new Render IDs; local tests retain their separate numbering.

| ID | Priority | Scenario and browser | Hosted expected result | Open-items mapping |
|---|---|---|---|---|
| R01 | H | Chrome Normal: ordinary login, email code, **KMLI unchecked**, logout | Login completes; no persistent remembered refresh credential for unchecked mode; logout server-confirmed | S6-003, 015, 019 |
| R02 | H | Chrome Normal: KMLI checked; close/reopen all normal browser windows | Account restored without another email verification; cookie persists only as designed | S6-003, 011 |
| R03 | H | Chrome Normal: after an actual 8-hour access-token expiry, revisit Home | Fresh 8-hour JWT issued; no new login; sanitized timestamp evidence; do not claim success solely from UI | S6-003, 011 |
| R04 | H | Chrome Normal: remove *access token only* with KMLI cookie retained; reload | Authorized `/users/refresh-session` returns 200; Home authenticated; cookie not exposed to JS | S6-004, 019 |
| R05 | H | Chrome Normal: logout remembered session then browser restart | Remains signed out; no silent resurrection; distinguish confirmed/unconfirmed revocation | S6-001, 004, 020 |
| R06 | H | Change Password in Chrome Incognito, second active remembered session in Chrome Normal | Existing sessions revoked; old browser displays **Not Logged In** and fails closed on app permissions; new password works; old password rejected | S6-009, 016, 037 |
| R07 | H | Forgot/Reset Password: generic request, one-time 30-minute link, success and reuse rejection | Safe links to staging; all relevant sessions revoked; invalid/expired/reused codes handled correctly | S6-016, 023, 029 |
| R08 | H | HTTPS cookie/Origin/CSRF behavior, invalid cross-origin request, logout and refresh protections | Secure, HttpOnly, appropriate SameSite/path; exact allowed origin; CSRF defenses reject wrong origin/header; no credential leakage | S6-011, 019, 020 |
| R09 | H | Render restart/redeploy with active remembered session | KMLI continues if server/session store valid; env identity retained; no temporary bypass or indefinite session | S6-011, 024, 031 |
| R10 | H | Revoked/stale token on Home; subscription API 401/403/temporary 5xx | No false authenticated label, no unrestricted apps, appropriate unavailable state; no forced logout for mere outage | S6-008, 009, 018, 037 |
| R11 | H | Validate proxy `req.ip`, rate-limit grouping, forward headers and trusted hop policy | No proxy-shared global denial and no spoofable identity assumption; document hosting headers | S6-012, 031 |
| R12 | S | Two Chrome tabs using same remembered session; login/logout propagation and refresh | Both authenticate; logout invalidates on reload; one refresh expected when coordinated | S6-002, 007, 027 |
| R13 | L | Full controlled Web Lock contention via existing local test harness | Re-run only if hosted behavior differs or helper/proxy changes; local controlled two-tab test is primary evidence | S6-002, 026 |
| R14 | S | Admin versus Standard subscriptions, access expiry, protected routes | Correct admin-only controls and server authorization; app buttons match validated entitlements | S6-009, 018 |
| R15 | S | Family Tree/Networking, Budget, ETF, uploads/privacy header and representative authenticated reads/writes | No regressions; preserve `X-FT-Page-Token`; no unsafe automatic POST replay | S6-005, 017, 025 |
| R16 | H | Logs/caches: errors, no-store on sensitive auth routes, mixed old/new assets, service worker | No JWTs, cookies, reset links in logs; helper/cache version compatibility; sensitive responses not cached | S6-024, 028, 030 |
| R17 | S | Dedicated DuckDuckGo Windows, Edge, Firefox | Targeted login/KMLI/refresh/logout; document browser privacy features; no assumed equivalence to Chrome | S6-026, 036 |
| R18 | H | TNNA staging API contract checks without production device changes | No disruption of existing TNNA endpoint/auth contracts or offline behavior; any device testing separately approved | S6-010, 032 |
| R19 | L | SQL race, token-replay family handling, brute-force and challenge locks | Reuse dedicated local DB tests; run focused staging verification only where network/proxy behaviors matter; no uncontrolled load | S6-006, 012, 021, 022, 029 |
| R20 | H | Production isolation & reversal rehearsal | Staging can be disabled/deleted without touching production; verify no secret, DB or DNS cross-wiring | S6-011, 013, 031 |

### Why some tests are repeated

Re-run R01–R10 because HTTPS Secure cookies, browser restarts, actual hosted network errors and independently revoked sessions are release-critical. Reuse local 19/19 module tests, Group 0a database races, overnight JWT renewal evidence (Oct 25), and controlled two-tab lock test. A simple new staging smoke test does **not** substitute for omitted security controls; record blocked/open gaps.

## 5. Execution sequence and stop points

1. **Provisioning review only:** verify all P01–P09, obtain explicit creation approval, approve hostname/service plan, record isolated configuration.
2. **Staging startup:** deploy approved commit, check actual connected DB identity and HTTPS; stop immediately on wrong DB or insecure origin/cookie behavior.
3. **Low-impact smoke:** R01, R02, R04, R05, R09, R14, R15. Keep test accounts and browser profiles distinct.
4. **Credential-mutating tests:** R06 and R07 with planned account/password recovery. Never use production accounts.
5. **Security/proxy tests:** R08, R10, R11, R16, R19; rate-limit checks must be bounded and cannot affect other users.
6. **Overnight expiration:** R03 with timestamps and no activity that renews token in intervening interval; include Network Preserve log *before* navigation where practicable.
7. **Compatibility & dependencies:** R12, R13 if warranted, R17 and R18 only with appropriate safe device/browser setup.
8. **Exit controls:** R20, update outstanding register, independent final engineering review, explicit user decision. No automatic production deployment.

## 6. Test execution record (copy one per test)

```text
Test ID:
Date/time (timezone):
Staging URL (no secrets):
Git branch / commit:
Node version / WA_ENV:
Verified database identity:
Browser / Normal or Incognito / OS:
Test account alias (no passwords):
KMLI checked/unchecked:
Prerequisites:
Actions performed:
Expected result:
Actual result:
HTTP status summary (no credential values):
Console/server messages (redacted):
Result: PASS / FAIL / BLOCKED / NOT RUN
Evidence location:
Related S6 item(s):
Follow-up / retest owner:
```

## 7. Exit / acceptance criteria

- All `H` tests pass, or any exception is explicitly documented and approved with an acceptable risk decision. No release when a critical security/isolation gate remains unresolved.
- All `S` tests completed or justified with targeted prior evidence; `L` tests accurately mapped to local results and their limits.
- No credentials exposed in logs/artifacts. All test account password changes, reset links and resulting sessions accounted for.
- Staging environment and production environment are proven isolated, and no changes to installed production TNNA phones occurred.
- `Stage6_OpenItems.md` updated item-by-item with hosted evidence; any new defect receives next stable ID. Do not automatically close a broad item because one case passes.
- Final independent engineering reviewer assesses implementation, evidence, limitations, outstanding issues, migrations and rollback. User explicitly authorizes any future merge/production action.

## 8. Reuse of evidence already established locally (October 24–25, 2026)

- `waPlatform.js`: 19 automated tests passed (including expired access-token behavior, same-tab single-flight, Web Locks cross-tab rotation, no unsafe POST retry).
- Initial Login/Home tests #1–#7: ordinary/remembered login, logout, browser restart and signed-out persistence passed in user-reported Chrome runs.
- #8A: missing-token restore using remembered cookie; `/users/refresh-session` 200.
- #8B: approximately 15h10m after login, new JWT issued October 25 at 9:10:24 AM and expiring at 5:10:24 PM; Home authenticated. Direct refresh Network request not captured; timestamp evidence supports renewal.
- #9D: controlled Chrome Web Locks test: `entered=2, pending=2, held=1`, authenticated 2/2, observed one refresh 200 plus session-status 200 in other tab.
- #10A–#10E: Change Password form, success, old-session 401 revocation, corrected Home fail-closed UI, new password accepted and old rejected all passed in targeted tests.
- S6-037 Home revoked-session defect corrected and targeted Chrome regression passed. Broader error handling and app-by-app integration still open.
- Local startup: `WA_ENV=local; test DB verified`; this is **not** evidence of hosted staging isolation.

### Local password-recovery baseline — October 25, 2026

- Tests **#11A–#11G passed** in Chrome Normal/Incognito against `sql5838929`: forgot form; generic email-request confirmation; successful mail delivery; reset form; successful reset; preexisting Incognito session revoked (`session-status` and `refresh-session` 401); consumed link rejected; a separate unused link rejected ~40 minutes after issuance (30-minute configured window).
- **Do not mark hosted R07 complete** using these local results. Render R07 must confirm HTTPS staging reset URLs, correct origin and email delivery, cookie/session revocation, one-time reuse and expiry under hosted settings.
- **New-password fresh login after reset remains unverified** and should be tested locally, then included in hosted R07.
- Token-bearing diagnostic Console output remains a known defect in `amortization.html` (S6-030); R16 must validate removal across affected pages before release.
- No password, verification code, reset token, complete reset link or session cookie belongs in the evidence packet.

## 9. Register updates and follow-through

At the end of each hosted test session, review `Stage6_OpenItems.md` and update linked statuses, dated evidence, residual risks, and follow-up owner. Use this plan as a *test matrix*, not a replacement for the register. The current Google Drive register fetched during drafting was v2.1; a v2.2 file had been prepared for download in the conversation. Reconcile the latest local and Drive versions before uploading any replacement to avoid overwriting newer entries.

**No staging service has been provisioned and no production change is authorized by this document.**

## Revision history

| Date | Version | Change |
|---|---|---|
| 2026-10-25 | 1.1 | Added completed local Forgot/Reset Password #11A–#11G evidence; clarified hosted R07 and R16 remain pending. |

## October 26, 2026 — Local evidence carried forward to staging

Group 3B-1 preservation revision of `httpdocs/Weights.html` (based on `Weights_COPY.html`) passed local Chrome Incognito `sthink` KMLI restoration (#16D-R; refresh 200 and weights 200), Search/Cancel (#16F), Print (#16G), Date Range/chart (#16H), Add/Edit form Cancel (#16I/#16J), and actual Delete for **2026-09-19 through 2026-09-23** on verified local test DB `sql5838929` (#16L). Reload confirmed selected records absent and surrounding data present; no new Console errors. The original Delete dialog's `earliestDate.toISOString()` initialization error remains reproducible and **explicitly deferred by user** as S6-039; date entry by hand allowed successful DELETE. This is **local evidence only**; it does not satisfy hosted HTTPS/Render test gates. Add/Update database writes, authorization negative paths and usage tracking remain pending locally.

Production and hosted staging remain unauthorized/unchanged.

| 2026-10-26 | 1.2 | Carried forward local Group 3B-1 Weights KMLI and functional evidence, actual test-DB Delete, deferred preexisting S6-039 and outstanding hosted/local regressions. |

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

### Render preflight addition — database connections

- As of October 27 there is **no** separate Render Stage 6 staging service. This document is planning only.
- Staging remains targeted at `sql5838929` unless an independently approved revision explicitly authorizes a different test database and updates the identity guard.
- Capture host/database/user identity (redacting passwords), required TLS and certificate verification, all connection pool sizes, other background connections, connection account quotas, and DNS/egress access. A `DB_CONNECTION_LIMIT=5` local Johnny success is supporting evidence, not a hosted result.
- Add to eventual hosted test matrix: simultaneous Budget Print My Details plus representative protected application requests; measure exhausted-connection errors, queueing and recovery. Fail the test if user account limit is exceeded or the connection is unencrypted.

<!-- STAGE6-LOGGING-HOSTED-2026-10-30 -->
### October 30, 2026 — Logging-security regression and outstanding checks

- `reviseLogIn` Render test service `wapps-stage6-test` was verified Live at commit `8fa035f`, using `WA_ENV=staging` and verified HelioHost test DB `wapps_test`; production and `main` unchanged. This supersedes older planning-only staging assumptions for current testing; retain historical entries as historical context.
- Logging fix in `server.js` and `morgan.js`: local redaction smoke test confirmed omission of a synthetic token-like URL query from `access.log`, `error.log`, and `combined.log`; hosted raw filesystem logs were not independently accessed on the free Render service.
- Hosted H01 normal login, H02 remembered-session reload, H03 restoration after removing access token, and H04 logout/reload: user-reported passed on commit `8fa035f` (Chrome Incognito, `charter` test account). These targeted regressions do not replace the formal hosted test matrix.
- Consolidated logging-only changes in 14 additional JS files: local `git diff --check` passed (line-ending warnings only), `node --check` passed 14/14, diff summary 69 additions / 69 deletions, and all proposed diffs reviewed. **Not yet committed, deployed or functionally regression-tested.** Preserve working tree and `_COPY.js` backups.
- Pending: local startup/functional checks, reviewed commit, isolated staging deployment and targeted hosted regressions for the consolidated revision. Do not claim hosted testing of the uncommitted revision.
- Add negative API-error-response security tests after the independent review of S6-041 (`routes/familyTree.js` Favorite Pets, plus related routes). Do not record actual credentials, tokens, cookies, reset links or sensitive exception text.
