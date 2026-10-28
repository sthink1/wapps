# Wonderful Apps — Stage 6 Outstanding Items Register

**Document version:** 2.4  
**Created:** October 24, 2026  
**Revised:** October 26, 2026  
**Reconciliation scope:** `10-13-26 keep logged in; chng pw`; `10-18-26 Keep logged in CONTINUED`; October 18 Stage 6 handoff; October 19 engineering-review synthesis  
**Project:** Wonderful Apps (WA) — Keep Me Logged In / Authentication Security  
**Development branch:** `reviseLogIn`  
**Last verified local commit:** `d91d76b` (Stage 6 Group 0a)  
**Authoritative project copy:** `docs/Stage6_OpenItems.md` in the WA project and corresponding Google Drive folder, once copied there  
**Test environment:** local `.env.test`, database `sql5838929` only  
**Production status:** No Stage 6 production deployment authorized

## Purpose and rules

This is the **single outstanding-items register** for deferred Stage 6 design decisions, defects, tests, dependencies, and release gates. It is **not** a list of confirmed defects: several entries represent required verification or future implementation.

1. Add an item as soon as it is identified, with a stable ID. Never silently discard or renumber IDs.
2. At the end of each implementation/test group, update the status, evidence, affected files, and date reviewed.
3. Mark an item **Verified Closed** only after the specified acceptance criteria have been met and evidence recorded. A passed unit test alone does not establish that live browser, hosted, or production behavior works.
4. The user may explicitly mark an item **Accepted Limitation**, with rationale and remaining risk. Do not silently treat deferred work as complete.
5. Before any merge or production decision, reconcile this register with tests, code, migrations, and the required independent design-engineer review.
6. No production database changes, deployment, `main` merge, GitHub push, or changes to installed TNNA phones without explicit approval. Keep the test database for future development.

**Status vocabulary:** `Open` (identified), `In Progress`, `Pending Test`, `Blocked`, `Verified Closed`, `Accepted Limitation`.  
**Evidence label:** `Confirmed in code/test`, `Documented requirement`, `Reviewer finding—not independently retested`, or `Requires current-source verification`. These labels should not be confused with the status field.  
**Priority vocabulary:** `Critical` (release-blocking safety), `High`, `Medium`. Priorities are planning recommendations, not incident severity assessments.

## Master register

| ID | Priority | Stage | Outstanding item | Status | Evidence / current understanding |
|---|---|---|---|---|---|
| S6-001 | High | 6B Group 2 | Register the Home Logout listener independently of whether a token exists at initial page rendering; ensure session-restoration and button visibility are consistent. | In Progress | Ordinary/remembered/logout-after-restart and logged-out no-op passed; visible Logout button is approved design. Listener lifecycle on restored/revoked states and exceptional failure still needs code review.
| S6-002 | High | 6B / 6C | Test *real Chrome tabs* refreshing the same remembered session concurrently, including Web Locks and rotated cookie; prevent false replay flags. | Verified Closed | Oct 24 real Chrome Normal two-tab controlled-lock test: entered=2, pending=2, held=1; 2/2 authenticated and restored; one observed refresh-session 200, other tab session-status 200. 19 isolated module tests also passed. Scope: tested shared lock/rotation, not network-loss or every browser.
| S6-003 | High | 6C | Test browser restart with Keep Me Logged In checked **and** unchecked, distinguishing ordinary 8-hour access from persistent refresh. | In Progress | Oct 24 KMLI checked Chrome Normal browser restart passed; unchecked ordinary-session full-restart/8-hour behavior not yet verified.
| S6-004 | High | 6C | Test server-side Logout with expired access token, valid remembered refresh, failed refresh, and offline server. Report whether revocation was confirmed. | In Progress | Confirmed server-revoked logout for ordinary and KMLI sessions plus post-restart no restoration; expired/logout-offline/rejected-refresh variants remain.
| S6-005 | High | 6B | Standardize authenticated requests/session handling in Budget, ETF Investing, Family Tree/Networking, tracking, and remaining WA applications, preserving app-specific logic. | Open | 6B-1 inventory found widespread direct `localStorage` and Bearer handling. |
| S6-006 | Critical | 6B security | Design and test confirmed refresh-token replay handling and revocation of the affected session/token family, without punishing legitimate tab races. | Open | Group 0a rejects consumed token, but a newer child token can remain active. |
| S6-007 | High | 6C | Test login/logout and account switching across multiple browser tabs; prevent stale in-flight refresh from resurrecting a prior account. | In Progress | Oct 24 same-user three-tab auth and logout succeeded; account-switch/late-response race live-browser verification pending.
| S6-008 | High | 6C | Standardize 401 vs 403 behavior: session renewal only when appropriate; preserve permission/subscription denials. | In Progress | Oct 25 password-change revocation returned 401 from session-status/refresh; Home correction handled signed-out state. Other 401/403/transient/mutation error cases pending.
| S6-009 | High | 6C | Verify administrator and subscription permissions after session restoration and refresh across Home, Track, SubControl, and protected applications. | In Progress | Oct 25 charter Standard subscription and restricted buttons verified after new-password login; Home signed-out fail-closed behavior corrected. Admin, other apps, and edge cases pending.
| S6-010 | Critical | 6D / rollout | Verify TNNA API compatibility, installed-device continuity, existing tokens, and offline/screen-off town announcements; define credential transition. | Open | Group 0a test TNNA flows passed; installed production phones not changed or reverified. |
| S6-011 | Critical | Hosted 6D | Test Stage 6 in a **separate** Render service using `reviseLogIn` and test DB only: HTTPS Secure cookies, origins, emails/reset links, restarts, browser flows, and proxy behavior. | Open | Stage 6 hosted test service not yet established. |
| S6-012 | High | 6D | Review global/password reset rate limits, cleanup throughput, and trustworthy client IP under Render proxy; test operational denial-of-service tradeoffs. | Open | 6A functional/cleanup tests passed; hosted proxy/IP authenticity unresolved. |
| S6-013 | Critical | Predeployment | Produce verified production migration, rollback, preflight/postflight checks, legacy web/TNNA session transition, and backup plan; preserve existing TNNA data. | Open | Production/test SQL differ; production migration not authorized. |
| S6-014 | Critical | Final gate | Obtain independent design-engineer review **after** Stage 6 implementation/testing and **before** merge/rollout decision; remediate findings and seek explicit user approval. | Open | Required October 18, 2026; review not yet performed. |
| S6-015 | High | 6B / 6C | Preserve Login UI behavior (verification code, checkbox default unchecked, Show/Back controls, confetti on interactive success, alert, ~1.5-second redirect, subscription-aware destination), while silent restoration causes no celebratory UI. | In Progress | Oct 24 interactive checked/unchecked login, email verification and redirects tested without errors; further UI variants and recovery validation remain.
| S6-016 | High | 6B / 6C | Confirm registration, forgot/reset, password-change pages use standardized session state without inadvertent navigation, form reload, or loss of unsaved data. | In Progress | Oct 25 Change Password form, success/redirect, cross-session revocation and new login passed. Forgot/Reset Password browser #11A–#11G passed Oct 25 (email, successful reset, revoked session, one-time link and >30-minute expiration). Registration, error validation and unsaved-form paths remain.
| S6-017 | High | 6B | Preserve Family Tree privacy `X-FT-Page-Token`, page-specific fetch interception, file uploads, public privacy/contact verification, and non-auth sessionStorage preferences. | Open | Existing `FTPrivacy.js` and independent Family Tree modules; do not globally patch `fetch`. |
| S6-018 | High | 6B / 6C | Standardize failed refresh and login outcomes across 401, 403, transient network error and 5xx/503; do not treat incorrect current password as session expiry; preserve unsaved form state. | Open | Engineering review noted inconsistent error mapping. Some `waPlatform` unit paths passed; whole-project behavior pending. |
| S6-019 | Critical | 6B security / hosted | Review CSRF and exact Origin checks for cookie-authorized refresh/logout, same-origin cookie rules, HTTPS Secure flags and caching; prevent unsafe cross-origin authenticated requests. | Open | Cookie defenses implemented in Group 0a in part; new logout contract and hosted tests still required. |
| S6-020 | High | 6B / 6D | Verify first-class logout using a validated refresh cookie when JWT expired/absent; no arbitrary session IDs; preserve pending-logout state if server unreachable, and no false revocation claims. | Open | Group 2 handles remembered expired JWT by refreshing first, but cookie-only authenticated logout backend not verified/implemented. [DE6-02, R-05] |
| S6-021 | High | 6B security | On **successful** verification of a new web login, explicitly revoke/supersede the previous remembered browser session; on failed verification leave existing session intact. Test both cases transactionally. | Open | Engineering review DE6-03; Group 0a fence tests don't establish old-cookie supersession. |
| S6-022 | High | 6B security | Verify login-code entropy (`crypto.randomInt` or equivalent), attempt ceilings, resend/issuance rate limits, password-guess throttling, and web/TNNA challenge scope separation. | Open | DE6-07/R-07; no claim all controls are absent in current code; needs fresh implementation audit/tests. |
| S6-023 | High | 6B / 6C | Explicitly decide password reuse prohibition, whitespace handling and UI validation; test wrong-current-password responses and post-change notification failures. | Open | Engineering synthesis treats password reuse as unapproved policy; backend behavior must be checked against current branch. |
| S6-024 | High | 6B / hosted 6D | Review script/service-worker cache versioning so updated `waPlatform.js`, Login and Home load together; test stale-client rollout, browser cache, reload, and service-worker update. | Open | October 18 review and engineering synthesis; PWA caching may affect staged deployment. |
| S6-025 | High | 6B / 6C | Verify usage tracking uses the current session token and does not silently skip or duplicate page/time logging on initial restore, logout, and `beforeunload`. | In Progress | Oct 25 Home page tracking logged successfully after fresh login; stale-token tracking errors seen before fix. Time-spent / lifecycle / all apps remain pending.
| S6-026 | High | 6B security | Decide Web Locks unsupported-browser policy and test safe fallback (or explicit re-login) across supported browsers; ensure missing lock never causes false replay detection. | Open | `waPlatform` unit test fails closed; actual browser-support policy not decided. |
| S6-027 | High | 6B / 6C | Review account logout/login races across tabs when refresh response arrives after explicit logout or a different-user login; add real-browser tests beyond isolated simulations. | Pending Test | Group 1A/2 unit test prevents overwrite; integration evidence pending. |
| S6-028 | Medium | 6B security / final review | Evaluate XSS exposure of transitional `localStorage.token`, safe output encoding, sanitization and a Content Security Policy migration plan; do not claim HttpOnly refresh cookie also protects access token. | Open | Review synthesis recommends retaining legacy storage temporarily and performing CSP review. |
| S6-029 | High | 6B / 6D | Test login challenges and reset links bind to account `SecurityVersion`, client scope, one-time use, cleanup, and concurrent password changes; retain Group 0a protections. | Pending Test | Local Group 0a concurrency passed for tested interleaving; Oct 25 browser reset-link one-time reuse rejected and unused link rejected after ~40 minutes. SecurityVersion concurrency, scope and hosted testing still remain. |
| S6-030 | Medium | 6B / 6D | Review sensitive credential/token logging, error payloads, mail URLs and diagnostics in local/hosted environments; scrub test output before sharing. | In Progress | Oct 24 token property confirmed in Home Console. Oct 25 targeted Home correction: token not seen in tested output. Oct 25 `amortization.html` Console also displayed a token property; broader source/runtime remediation remains pending.
| S6-031 | High | 6B / hosted 6D | Establish explicit `WA_ENV` local/staging/production isolation with connected-database identity verification, origin/secret separation, and working Secure-cookie staging; retain test-only guard until reviewed. | Open | Group 0d local guard passed; staging-specific setup unresolved. [DE6-09, R-01] |
| S6-032 | High | 6D / rollout | Decide whether native TNNA refresh tokens need an absolute lifetime cap and whether web/TNNA must share that rule; do not change installed phones or native policy without approval. | Open | Engineering synthesis identifies TNNA absolute limit as unapproved policy. |
| S6-033 | Medium | 6B / final | Record consistent `WA.session`/`WA.api` naming, HTTP error envelope, base-origin configuration, shared usage and navigation conventions for future WA development. | Open | User explicitly requested common handling; module exists, rollout not complete. |
| S6-034 | High | 6B / 6C | Verify exact local `reviseLogIn` code matches Google Drive before any generated replacement; preserve current changes, backups, script syntax checks and no accidental staging of copies/review files. | In Progress | Oct 25 narrow home.html fix applied by guarded local script; syntax and git diff --check passed. Full diff/release-file review and backups exclusion remain.
| S6-035 | Critical | Final gate | Reconcile the completed Stage 6 requirements matrix against predecessor conversations, handoff, engineering review findings DE6-01–DE6-14 and R-01–R-11; document closed/deferred/accepted decisions and source evidence. | Open | This version is a retrospective synthesis, not a line-by-line exhaustive verification of both chat transcripts. |
| S6-036 | High | 6D browser acceptance | Verify cross-browser authentication compatibility in DuckDuckGo (dedicated Windows browser), Chrome, Edge and Firefox; focus on cookie/storage persistence, KMLI, logout and Web Locks behavior. | Pending Test | User requested DuckDuckGo coverage October 24; Chrome Normal/Incognito results are not proof of DuckDuckGo compatibility. No DuckDuckGo tests reported yet. |

| S6-037 | High | 6B Group 2 | Correct revoked-session Home display and fail-closed subscription permissions after Change Password; ensure no stale user presentation or diagnostic token logging; verify fresh login restores permissions. | Verified Closed (targeted regression) | Oct 25 Chrome Normal revoked charter token: session-status/refresh 401, Home now Not Logged In, subscription blank, protected apps restricted and Change Password hidden. Incognito fresh login with new password showed charter Standard plan, appropriate restrictions and no Console errors. Broader auth error handling remains S6-008/S6-018; log audit remains S6-030. No commit reported. |

## Acceptance criteria and closure evidence

| ID | Required evidence before closing |
|---|---|
| S6-001 | Logout can be invoked after successful restoration, direct login, and cross-tab state changes; button state and click handler work in Chrome without duplicate listeners; server logout outcome displayed accurately. |
| S6-002 | Two or more actual Chrome tabs: one rotation per renewal window, no false replay or unexpected logout; verify refresh under overlapping requests, tab reloads, and token changes. |
| S6-003 | Checked/unchecked flows tested with fresh browser sessions/restarts; document expected 8-hour ordinary session and 180-day sliding/365-day absolute remembered limits, including expiry behavior. |
| S6-004 | Test valid and expired JWTs against real test backend, valid/rejected refresh cookie and network outage; inspect session revocation in `sql5838929` where safe; UI accurately distinguishes unconfirmed server revocation. |
| S6-005 | File-by-file inventory reconciled with final modifications; each app passes authenticated navigation, session expiry, API error, and app-specific regression tests; no unrelated UI changes. |
| S6-006 | Design review and concurrency tests prove real token theft/replay handling and acceptable multi-tab behavior; database transaction/race safety demonstrated. |
| S6-007 | Real Chrome cross-tab logout and new-account login behave consistently; no old account token reappears after asynchronous refresh; all permissions recomputed. |
| S6-008 | 401, 403, network errors, unsafe mutations, and valid GET retries tested in shared module and representative protected pages. |
| S6-009 | Non-admin, admin, active/expired subscription test accounts; authorized actions allowed and protected operations correctly denied after refresh. |
| S6-010 | TNNA API regression plus device/offline/background testing with approved test devices or safe migration simulation; installed production devices not affected without consent. |
| S6-011 | Separate Render staging environment identity verified, hosted HTTPS/Origin/cookie/email tests pass, no production database or user-device effects. |
| S6-012 | Document IP trust model, rate-limit abuse cases, safe error behavior, monitoring and cleanup throughput; hosted checks completed. |
| S6-013 | Dry-run migration on compatible test database; reviewed SQL/schema differences, account initialization, legacy token behavior, backups, rollback limitations, and explicit approval gate. |
| S6-014 | Review packet and independent findings recorded, material issues resolved/retested, user signs off before any merge or production rollout. |
| S6-015 | Chrome checked/unchecked interactive login preserves original UI actions, delay and destination; silent restoration triggers none of them. |
| S6-016 | Registration, recovery, and change-password workflows tested end-to-end, including error validation and unsaved input. |
| S6-017 | All privacy requests include required page token, ordinary Family Tree requests function, uploads remain intact, and public verification still works. |
| S6-018 | Defined error contract tested at browser and API boundaries; 401/403/503 and wrong-password conditions are distinguishable. |
| S6-019 | Threat model and tests for CSRF/Origin/cookies/credentials/HTTPS, including forged cross-origin attempts and staging behavior. |
| S6-020 | Expired, absent and valid JWT logout with/without refresh cookie tested; session revocation verified or UI declares uncertain state; no token-family side effects. |
| S6-021 | Successful new verification revokes prior remembered session; failed verification leaves prior session usable; real DB transaction tests pass. |
| S6-022 | Current code audit plus behavioral tests for random code generation, rate limits, attempts, web/native challenge separation and cleanup. |
| S6-023 | User-approved password policy documented; input/whitespace, incorrect current password and email-failure behavior tested. |
| S6-024 | Simulated stale service-worker cache/version mix tests and hosted browser update tests pass. |
| S6-025 | Page/time tracking logs exactly expected events across restoration, expiry, navigation and logout without unauthorized retries. |
| S6-026 | Supported browser matrix and lock-absent behavior documented, with browser tests and acceptable UX. |
| S6-027 | Actual two-tab logout/account-switch/late-refresh sequences tested without resurrecting a previous identity. |
| S6-028 | XSS/storage/CSP review complete with risk and staged mitigation or explicit acceptance documented. |
| S6-029 | Version-bound web/TNNA login/reset challenge tests and concurrency/rollback checks pass locally and at appropriate hosted scope. |
| S6-030 | Source and runtime review finds no credential/token leakage in logs, email URLs, errors or diagnostics, or issues remediated and retested. |
| S6-031 | Tested staging environment rejects incorrect database/origin/secret settings while supporting HTTPS Secure cookies. |
| S6-032 | TNNA lifetime policy explicitly approved, migration/device consequences tested, no unapproved native changes. |
| S6-033 | Approved shared APIs/documentation integrated incrementally; conventions implemented in touched apps and enforced by regression checks. |
| S6-034 | Local-vs-Drive source provenance recorded for each package; scripts tested and Git diff/staging reviewed; backups excluded. |
| S6-035 | Traceability matrix completed: requirements and DE6/R findings mapped to code/tests/open items; final independent review approves or records accepted risks. |
| S6-036 | Dedicated DuckDuckGo Windows: normal login/logout, KMLI checked/unchecked, restart persistence, missing-access-token refresh, tab sharing/logout, cookie-clear behavior (Fire Button) and any Fireproofing exception documented. Edge and Firefox targeted login/KMLI/refresh/logout smoke tests pass or findings are recorded. Distinguish dedicated browser from DuckDuckGo Search in Chrome. |

| S6-037 | Targeted Chrome Normal revoked-session regression plus Incognito authorized re-login must show signed-out/fail-closed state after revocation and original Standard permissions after new authentication; retain no-op Logout visibility by design; broader pages/errors remain tracked separately. |

## October 24, 2026 — Group 2 real-browser evidence (user-reported)

Browser-mode policy: Use **Chrome Incognito** for ordinary workflows by default (user preference); use **Chrome Normal** for persistence across a complete browser restart and real refresh-cookie tests. State the browser mode explicitly in every test instruction. Chrome Normal and Incognito results **do not substitute** for testing a separate DuckDuckGo browser.

| Test | Browser | Result | Evidence / limitation |
|---|---|---|---|
| #1 ordinary login, KMLI unchecked | Chrome Incognito | Passed | User reported login, verification and redirect normal; no Console errors. |
| #2 ordinary logout | Chrome Incognito | Passed | User received confirmed logout message; no errors. |
| #3 KMLI checked login | Chrome Incognito | Passed | User reported success; Home showed `charter`. |
| #4 Home in another Incognito tab | Chrome Incognito | Passed | User screenshot showed `charter`; this is *not* a browser-restart test. |
| #5 KMLI survives closing/reopening all normal Chrome windows | Chrome Normal | Passed | User reopened Home and saw `charter` without new login; no Console errors. |
| #6 remembered-session logout | Chrome Incognito | Passed | New tab displayed `Not Logged In`; no errors. |
| #7 logout survives complete restart | Chrome Normal | Passed | User reopened Chrome and saw `Not Logged In`; later screenshot showed no red errors. |
| #7a click Logout when already logged out | Chrome Normal | Passed (by-design no-op) | User confirmed no visible effect and no errors; **Logout button remains visible by approved design**. Do not introduce a hide-button requirement. |
| #8A restore after removing access token | Chrome Normal | Passed | `localStorage.removeItem('token')`, reload; `/users/refresh-session` returned HTTP 200 and Home showed `charter`. Not proof of actual JWT expiry. |
| #8B truly expired token browser refresh | Chrome Normal | Passed October 25 | Original KMLI login approximately 6 PM Oct 24; returned approximately 9:10 AM Oct 25. New JWT iat 9:10:24 AM, exp 5:10:24 PM; charter remained logged in. Network was opened after page navigation, so the refresh HTTP request was not captured. |
| #9A same user in three tabs | Chrome Normal | Passed | `charter` appeared in all three; no errors. |
| #9B restore in Tab 1 while two tabs open | Chrome Normal | Passed — sequential only | After removing shared access token, Tab 1 reloaded and `/users/refresh-session` returned 200. Does **not** prove simultaneous rotation. |
| #9C logout in Tab 1, then reload tabs 2/3 | Chrome Normal | Passed | All tabs displayed Not Logged In; no errors. |
| #9D controlled concurrent refresh | Chrome Normal | Passed October 24 | Controlled-lock browser test produced entered=2, pending=2, held=1; 2/2 authenticated and restored; Tab 1 refresh-session 200, Tab 2 session-status 200 without refresh. Lock contention demonstrated; wider failure cases remain out of scope. |

**Observed security concern:** Usage/page-view diagnostics displayed an authentication `token` property in Chrome Console. User redacted screenshot. Track under **S6-030**, review and eliminate token contents from logs before rollout; preserve tracking functionality. No raw token/cookie values should be pasted into review reports.

**Current item dispositions:** S6-001 retains broader exceptional-state verification; its *button visibility* aspect is accepted as designed. S6-002 is Verified Closed for the controlled two-tab contention acceptance criteria; exceptional network/race cases remain under S6-004/S6-007/S6-027. S6-003 remains pending for the **unchecked** browser restart/expiration branch despite passing checked restart. S6-007 has passed same-user tab logout tests but still needs account-switch/race coverage. S6-030 is an observed risk, not merely hypothetical. S6-036 added for separate browser coverage. These items are **not marked Verified Closed** merely because narrower checks passed.


## October 25, 2026 — Group 2 revocation correction and Change Password evidence (user-reported)

**Environment:** local `node --env-file=.env.test server.js`, startup confirmed `WA_ENV=local; test DB verified` against `sql5838929`; Chrome Normal and Incognito. **No production change or database schema migration.** Password-change test updated the *test account credential* by design. Evidence is browser screenshots, user-observed behavior and local installation output; no fresh independent code/security audit is claimed.

| Test | Browser | Result | Evidence / limitation |
|---|---|---|---|
| #8B expired eight-hour token renewal | Chrome Normal | Passed (strong indirect evidence) | Original KMLI approximately 6 PM Oct 24; return 9:10 AM Oct 25, still `charter`, no Console error. Token inspection gave `iat=2026-10-25 09:10:24`, `exp=2026-10-25 17:10:24`; HTTP refresh was not captured because Network opened afterward. |
| Phone KMLI persistence | Mobile browser, exact browser not verified | Supplemental passed | `sthink` logged in ~1 AM, returned ~9:15 AM still signed in; not independently verified as refresh rotation. |
| #9D controlled browser lock contention | Chrome Normal, two tabs | Passed | LOCK EVIDENCE `entered=2, pending=2, held=1`; SUMMARY `results=2/2, authenticated=2/2, restoredTrue=2`; Tab 1 refresh-session 200; Tab 2 session-status 200 and no refresh request. Both durationMs=827 per reported script output. |
| #10A Change Password form | Incognito | Passed | Current, new, confirm password; show passwords; Return to Home; warning of revocation, no console errors. |
| #10B Change Password submission | Incognito | Passed | Success message reported all existing sessions revoked; Return to Login worked. Do not store new/old password in register. |
| #10C old-session revocation | Chrome Normal | Server rejection passed; **initial Home UI defect** | Existing KMLI session received 401 on session-status, refresh-session, subscription, admin and tracking. Yet Home incorrectly showed `Logged in as: charter`, missing status and enabled-looking apps; diagnostic Console exposed a token. |
| #10C-R1 revoked-session Home patch | Chrome Normal | Passed targeted regression | Applied guarded `tests/apply-stage6b2-revocation-fix.cjs` to `httpdocs/home.html`; backup `.group2-revocation-before`. `node --check` and `git diff --check` passed. After reload: Not Logged In, blank subscription, Change Password hidden, restricted apps not accessible, Logout remains visible by design. Two expected 401 responses on session-status/refresh. |
| #10D new password and subscriptions | Incognito | Passed | Fresh `charter` login after email verification, Standard subscription restored, correct app restrictions, no Console errors. |
| #10E old password rejected | Chrome Normal | Passed | Original password returned `/users/login` 401 and displayed `Invalid credentials`; no verification proceeded. Newly authenticated Incognito session unaffected. The prior revoked-session 401 messages remained in preserved Console history. |

**S6-037 disposition:** Verified Closed for the *specific Home revoked-session display and fail-closed permissions regression*. This does not close project-wide 401/403 handling (S6-008/S6-018), login/session race coverage (S6-007/S6-027), or broad credential logging audit (S6-030).

**Current installation state:** Local `httpdocs/home.html` and `httpdocs/login.html` still modified/uncommitted according to the most recent diff; new shared module and tests were previously untracked. Backup files must be excluded from any future commit. The latest local file is newer than the fetched Google Drive Home copy; do not overwrite it from Drive.

## October 25, 2026 — Forgot Password / Reset Password browser evidence (user-reported)

All tests ran against local `http://localhost:8080`, `WA_ENV=local`, test DB `sql5838929`; no production actions. Chrome Normal was used for reset links and Chrome Incognito retained the prior `charter` session for revocation testing. Passwords, reset tokens and links are deliberately excluded from this record.

| Test | Result | Observed evidence and limitation |
|---|---|---|
| #11A Forgot Password page | Passed | `forgotPassword.html` displayed email field, Send Reset Instructions, Request New Reset Link, Back to Login; no visible Console errors. |
| #11B Request/email delivery | Passed | Generic non-enumerating confirmation; reset email delivered to `charter`, stated 30-minute lifetime. |
| #11C Reset form | Passed | Local reset link opened new/confirm password fields, eight-character guidance and actions. |
| #11D Successful reset | Passed | Server/UI displayed “Password reset successful”; no visible Console errors. |
| #11E Existing-session revocation | Passed | Incognito's prior `charter` login became **Not Logged In** after reload; `/users/session-status` and `/users/refresh-session` returned 401. |
| #11F One-time token enforcement | Passed | Opening the same consumed link again displayed invalid/expired/used/replaced message without password-entry fields. |
| #11G Expiration | Passed | A **new unused** link received at 11:49 AM EDT was opened about 12:29 PM EDT (~40 minutes later); `/users/validate-reset-token` returned 401; invalid-link message and no password inputs. |

**Still pending:** Fresh login using the newly reset `charter` password; negative/edge validation, challenge issuance/rate limits, concurrent reset and account-security-version race tests, and hosted HTTPS/email-link testing. The invalid-link 401s are expected security outcomes, not successful authentication.

**Security follow-up:** `amortization.html` page/time logging exposed a `token` property in a preserved DevTools Console history. The broader logging issue **S6-030 remains open** even though the targeted Home logging correction was verified.

## Additional review checkpoints (not separate release IDs yet)

- Group 2: Confirm complete Login/Home integration in Chrome against `node --env-file=.env.test server.js` and `sql5838929`. **Status: Partially verified; #1–#10E browser sequence recorded above, app-wide integration remains**. `waPlatform` Group 2 isolated tests: **19 passed, 0 failed**, as reported by user on October 24, 2026.
- Group 2: Verify Home's original subscription loading, administrator visibility, Family Tree navigation, and usage tracking remain intact. **Status: Partially verified for Home Standard plan; broader app/admin still pending**.
- Group 2: Keep `home.html.group2-before` and `login.html.group2-before` locally but **exclude from commit**. **Status: Open until commit review**.
- Group 2: Review installation script (`apply-group2.ps1`) and generated diff before staging; do not include unneeded temporary files or secrets. **Status: Open until commit review**.
- Future integration: Family Tree's special privacy header / `fetch` interception must not be broken by shared APIs; preserve file uploads and app-specific storage. **Status: Open under S6-005**.
- Future integration: Avoid authenticated unsafe-request automatic replay; if client gets 401 for mutation, communicate state clearly. **Status: Open under S6-008**.
- Future integration: Web Locks unavailable behavior should be browser-tested and documented rather than silently promising automatic refresh. **Status: Open under S6-002/S6-003**.

## Baseline test and source facts

- **Group 0a local commit:** `d91d76b`, `reviseLogIn`. User verified clean working directory after committing.
- **Group 0a:** Local account/email, browser refresh rotation, replay rejection, TNNA HTTP flow, SQL rollback/concurrency, and Section 8 HTTP race tests passed in previous discussion. These results **do not** replace later browser/hosted tests.
- **6B Group 1A:** 18 isolated unit tests passed locally.
- **6B Group 2:** 19 isolated unit tests passed locally; `home.html` and `login.html` updated via corrected integration script. The user inspected the Git diff; seven initial browser tests and subsequent restoration/multi-tab checks passed as documented above; genuine expiry and controlled overlapping refresh subsequently passed on October 25 and October 24 respectively, as recorded below.
- **Current uncommitted Stage 6B files (as last reported):** `httpdocs/home.html`, `httpdocs/login.html` modified; new shared module, tests, Markdown plans, installation script, and two `.group2-before` files untracked. Re-run `git status --short` before any staging action.
- **Google Drive references:** source authority for WA files; local branch may be newer until synchronized. Compare before copying over either version.

## Source reconciliation and evidence limitations

- **Conversation titles:** `10-13-26 keep logged in; chng pw` (predecessor) and `10-18-26 Keep logged in CONTINUED` (current). This revision draws on retrievable conversation context, the existing register, and the October 18 handoff / October 19 engineering-review synthesis. **It is not a certified message-by-message audit of both entire transcripts**; any earlier chat detail unavailable in retrieved context remains subject to review.
- **Engineering interim reports:** October 18/19 review findings (`DE6-01`–`DE6-14` and `R-01`–`R-11`) are design findings, **not automatically proven defects**. A final independent review of the finished build is still required.
- **Previously completed versus remaining:** Group 0a local successes and Group 2 unit-test passes remain recorded as successful; live Chrome, hosted testing, migration and integration evidence are separate requirements.
- **Source hierarchy:** latest verified **local** `reviseLogIn` files for implementation state; Google Drive project's copies for shared reference when synchronized; test output and dated commits for closure proof. Do not overwrite a newer local file with an older Drive version.
- **No production authorization:** no production DB/schema change, existing Render service change, `main` merge, GitHub push or installed TNNA device change without explicit approval.

## Update / audit trail

| Date | ID(s) | Action / outcome | Updated by |
|---|---|---|---|
| 2026-10-24 | S6-001–S6-014 | Initial register established from Stage 6B discussion and October 18 handoff; unresolved items carried forward. | Stage 6 planning |
| 2026-10-24 | S6-015–S6-035 | Retrospective reconciliation added 21 distinct items/decisions and closure criteria; original IDs and statuses retained. No code or testing action claimed. | Stage 6 planning |
| 2026-10-24 | S6-001, S6-002, S6-003, S6-007, S6-030 | Recorded browser tests #1–#9C, their limits, observed Console token logging, and approved visible Logout no-op design; no premature closures. | User-reported testing |
| 2026-10-24 | S6-036 | Added targeted DuckDuckGo/Edge/Firefox cross-browser acceptance requirement; Chrome-only coverage does not establish compatibility. | User-approved planning |

| 2026-10-25 | S6-002, S6-003, S6-007, S6-009, S6-030 | Recorded #8B overnight JWT issue/expiry timestamps, #9D actual lock contention, three-tab results and token logging risk; clarified untested branches. | User-reported Chrome testing |
| 2026-10-25 | S6-016, S6-008, S6-009, S6-025, S6-034, S6-037 | Recorded Change Password tests #10A–#10E, the original stale-UI defect, guarded Home fix, fail-closed regression and fresh Standard permissions. S6-037 targeted verification closed; broader items remain open. | User-reported Chrome testing |

| 2026-10-25 | S6-016, S6-023, S6-029, S6-030 | Added user-reported #11A–#11G reset request, delivery, success, session revocation, consumed-token reuse and 40-minute expiry evidence; recorded `amortization.html` diagnostic token exposure. Fresh login and broader security checks pending. | Stage 6 browser review |

## Update template

For every status change, add a dated row above and update the corresponding master row. Suggested entry:

> `2026-MM-DD | S6-00X | Pending Test → Verified Closed; commit <hash>; tested with <environment>; evidence <test command/output>; remaining risk <if any>. | Reviewer`

**Release rule:** Stage 6 cannot be declared finished on the basis of a clean Git commit or unit tests alone. Hosted tests, the independent design-engineer review, and user authorization remain separate mandatory gates.

## October 26, 2026 — Group 3B-1 Weights preservation and local browser evidence

- **S6-005 / S6-038 — Weights authenticated requests:** Preservation-first `httpdocs/Weights.html` revision based on `Weights_COPY.html`, retaining both existing Print handlers, page structure and styling. Chrome Incognito `sthink`, KMLI checked, local `.env.test` / `sql5838929`: #16D-R recovered from a removed `localStorage.token` by `/users/refresh-session` 200 followed by `/weights` 200, displayed existing table/chart and had no Console errors. #16F Search/Cancel, #16G Print, #16H Date Range/chart, #16I Add-form Cancel and #16J Edit-form Cancel passed with no Console errors. Add/Update **database writes have not been tested**. Authentication standardization across other WA pages remains open.
- **S6-039 — Weights Delete dialog date initialization (deferred, preexisting):** Confirmed against authoritative `Weights_COPY.html`: `earliestDate`/`latestDate` are assigned database date strings and original `deleteBtn.onclick` calls `.toISOString()` on them. Clicking DELETE reproducibly logs `TypeError: earliestDate.toISOString is not a function` before defaults populate; user can manually enter valid dates. **User explicitly elected to postpone fixing this unrelated original defect.** No source alteration for S6-039 is authorized now; retain as Open — Deferred by user, for future dedicated review.
- **#16L actual Delete by date range — local test passed:** With existing code unchanged, user confirmed test database `sql5838929`, chose **2026-09-19 through 2026-09-23**, manually entered the dates, and successfully deleted matching test data. Subsequent `/weights` returned HTTP 200; related requests shown as 200/304; no additional Console errors. User then reloaded Weights and confirmed range records absent, adjacent records retained, chart/table displayed, and no Console errors. This supports the tested Delete database-write path despite the separate initialization defect; it does not prove all boundary/error conditions.
- **Still open:** POST Add, UPDATE Edit, logged-out and subscription-denied Weights regressions with the preservation revision, usage tracking, further boundary validation and hosted HTTPS acceptance. No production changes or complete Stage 6 sign-off.

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

### New item S6-040 — HelioHost connection budget and local/test environment isolation

**Status:** In Progress. **Priority:** High. **Stage:** Local DB-host evaluation / 6D operational readiness. **Evidence:** User-confirmed Johnny MariaDB `max_user_connections=10`, server `max_connections=300`; `BudgetPrintDetails` exhausted connections with WA pool max 50; local setting `DB_CONNECTION_LIMIT=5` and restart resolved Print My Details. **Unverified:** all pools and background workers, long-run concurrency, Morty limits and hosted behavior. **Acceptance criteria:** documented inventory of pools and limits, successful representative local tests without connection errors, bounded stress/recovery test, verified staged identity guard, and review before any hosting change. Do not classify as Verified Closed merely because the Budget report passed.

**Recordkeeping note:** All pre-October 27 references to `sql5838929`-only *local* testing are historical baselines. Locally, `wapps_test` is now an additional approved test endpoint under reviewed safeguards; hosted staging remains restricted to `sql5838929` pending separate approval. Existing S6 IDs and statuses remain unchanged.
