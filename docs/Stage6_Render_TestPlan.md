# Stage 6 Render Acceptance Test Plan — consolidated current edition

**Consolidated version 2.3 — November 9, 2026; R15 bounded acceptance supplement prepared for manual installation.** This file is intended to replace `docs/Stage6_Render_TestPlan.md` and incorporate its dated October 31 append. The full prior formal plan and hosted H05–H50 ledger remain below as preserved evidence, not active deployment instructions.

**Approved staging reality:** `reviseLogIn`; November 9 user-reported Live ETF tracking commit `2602795` (superseding November 8 tracking commit `6434509` and November 7 snapshot `d4e5d1a`; earlier `f023cc3`); service `wapps-stage6-test`; `https://wapps-stage6-test.onrender.com`; HelioHost Morty2 `wapps_test`, user `wapps_test`; 16/16 environment tests passed. Older references saying staging does not exist, pointing exclusively at `sql5838929`, or reporting commit `09ece26` are historic snapshots.

**Read-only Google Drive rule:** Never modify the authoritative `My Drive/wonderfulApp` folder using the assistant. All downloaded replacement documents require local user review/installation. No Stage 6 change to production, `main`, or installed TNNA approved.

## Current R01–R20 status (formal requirements, not test-count percentage)

| Test | Current assessment | Evidence / outstanding acceptance |
|---|---|---|
| R01 | PASSED (bounded) | H05/H07 routine unchecked login/logout; unchecked persistence expiry precision still R03. |
| R02 | PASSED (bounded) | H23-H24 and Group 5D remembered full Chrome restart. |
| R03 | PARTIAL | #8B overnight issue/expiry time; H26 behavior, not exact hosted expiry verification. |
| R04 | PARTIAL | Local #8A and Group 5D restoration; exact hosted manual access-token-only removal not fully established. |
| R05 | PARTIAL | H25/H27 logout persistence; missing/expired token and offline result pending. |
| R06 | PASSED (bounded) | Nov 3 Group 5G web change-password session 117 revoked and old/new password outcomes. |
| R07 | PARTIAL | Nov 3 Group 5G reset used/reused link and session 115 revoked; exhaustive hosted invalid/expiry/negative cases incomplete. |
| R08 | PARTIAL | Nov 3 HTTP Steps 1–8 pass; valid Chrome secure cookie observed; authenticated forged Origin and failure-response cache review pending. |
| R09 | PASSED (bounded) | H23 server restart with remembered account. |
| R10 | PASSED (bounded) — Nov 7 | R10-01–R10-15, real earlier revocation, synthetic-invalid-token and hosted offline/recovery checks; 503 injected, not a real hosted backend outage. Linked S6-008/009/018 remain open; see Nov 7 supplement. |
| R11 | PARTIAL | Nov 2 Group 5E hosted resolver selected CF header and 6 unit tests; spoof provenance and limiter fairness pending. |
| R12 | PASSED (bounded) | Group 5D + H27 two-tab refresh/logout. |
| R13 | PASSED (bounded) | Controlled Web Locks 9D and waPlatform 19/19. |
| R14 | PASSED (bounded) — Nov 7 | R14-01–R14-23 hosted expired/active subscription, centralized entitlement, protected GET/POST/PUT/DELETE, admin/non-admin, and corrected page-visibility checks. S6-009/018 remain In Progress; see R14 supplement below. |
| R15 | PASSED (bounded) — Nov 9 | R15-01–53C representative app reads/writes, privacy-header cases, upload lifecycle, Budget/Family Tree/Weigh In/ETF and other app tracking, hosted and local user-observed verification. Full S6-005/017/025 lifecycle/privacy/auth acceptance remains separately open; see Nov 9 supplement. |
| R16 | PARTIAL | H21/H22 bounded logs, Group 5E cleanup; May 2027 cookie; five 401/403 responses lack no-store; source-wide log/caches open. |
| R17 | OPEN | DuckDuckGo dedicated browser, Edge, Firefox not yet evidenced. |
| R18 | PARTIAL | Nov 3 Group 5G real TNNA HTTP success; no native Android app tests. |
| R19 | PARTIAL | Group 5B H109 real DB and Group 5G sequential TNNA replay 401; remaining stress/fairness/concurrent replay review. |
| R20 | PARTIAL | Staging isolation guard and Morty2 startup verified; formal non-destructive reversal drill and production transition plan open. |


## November 9, 2026 — R15 final bounded acceptance supplement (current disposition)

**Formal decision: R15 PASSED (bounded).** This supersedes the earlier `R15 | PARTIAL` master-row classification **for R15 only**. The accepted scope is representative Family Tree/Networking, Budget and ETF authenticated browser operations; uploads, selected privacy-header paths, standard usage tracking across eight app categories, and three narrow page/session lifecycle checks. It is **not** acceptance of exhaustive application authorization, privacy, unsafe-request retries, all browser lifecycle transitions, token-expiry handling or release readiness.

**Environment and evidence provenance:** Local `http://localhost:8080` using `.env.test` and separate Render staging `https://wapps-stage6-test.onrender.com`, both using isolated HelioHost Morty2 `wapps_test`; `reviseLogIn` branch. Accounts: administrator `sthink` (UserID 1) and nonadministrator `charter` (UserID 64), as specified per test. Browser work was primarily Chrome Incognito. Browser Network/Console screenshots and phpMyAdmin query outputs were supplied by the user; this is **user-observed acceptance evidence**, not an independently captured automated server audit. User reported staging commit `6434509` Live after broad tracker deployment (November 8) and `2602795` Live after six ETF HTML revisions (November 9). Both commits also included `_COPY` files per user statement; inspect and remove public-path backup/copy assets in a future **separately reviewed** cleanup before any production merge. Do not infer these commits reached `main` or production.

### Representative application integration evidence (R15-01–R15-32)

| Test range | Representative scenario | Observed evidence and scope |
|---|---|---|
| R15-01–05 | Family Tree entry, navigation and privacy/page-token boundary | Selected valid navigation and missing `X-FT-Page-Token` rejection/guard were exercised. **Not** an audit of every `FTPrivacy.js`, public contact verification, networking privacy or token propagation path. |
| R15-06–11 | Budget protected reads | Selected authenticated pages and data loaded. Not an exhaustive role/subscription/error matrix. |
| R15-12–18 | ETF protected reads, comparison and disabled configuration | Selected ETF endpoints/pages exercised; development-mode and disabled endpoint behavior remained bounded to tested paths. |
| R15-19–21 and R15-32 | Image/upload lifecycle | Controlled upload persisted across reload without duplicate creation; matching delete succeeded. Not all file types, permissions or public/private sharing paths. |
| R15-22–27 | Budget controlled In/Out mutation lifecycle | Authenticated create, reload without duplication, and delete returned expected results. Not a controlled 401/timeout/ambiguous-outcome replay test. |
| R15-28–31 | ETF activity, inventory, sales report and transaction history | Representative existing-data views, reports and reloads succeeded; no new ETF transaction mutation was required. |

### Usage-tracking correction and evidence (R15-33–R15-51C)

| Tests | Evidence | Result / limit |
|---|---|---|
| R15-33–45C | Existing Budget tracking missed time on `B*.html` subpages; 18 Budget subpages instrumented using shared `waPlatform.js` then `usageTracking.js`; local `BinForm.html` page/time POST 200. November 8 SQL for `sthink`: `/BinForm.html` two views, seven TimeSpent records, 155 seconds; `/budget.html` nine views, eight TimeSpent records, 70 seconds. Dashboard Budget 12 visits, three sessions, 3m49s. | PASS for tested local page and aggregated Budget reporting; no independent all-pages functional mutation rerun. |
| R15-43 / Family Tree | `FamilyTree2.html` added to `family_tree` SQL page mapping, and shared tracking scripts installed on Family Tree menu/subpages. November 8 SQL showed `/FamilyTree.html` 63 seconds, `/FamilyTree2.html` 358 seconds; dashboard later 7m17s. | PASS for bounded Family Tree page tracking; wider privacy behavior remains under S6-017. |
| R15-46A–46D | Hosted `charter` `/BinForm.html`: scripts and page-view POST 200; periodic TimeSpent POST 200 at ~30s; Nov 9 SQL two views, 13 TimeSpent rows totaling 330 seconds. Hosted Budget dashboard four visits, one session, 7m39s across Budget pages. | PASS. 7m39s includes Budget activity beyond the SQL query for `/BinForm.html`; do not equate all seconds to one page. |
| R15-47 | Hosted `charter` dashboard reports time for Loan Payment 2m57s, Property Info 1m25s, Town Notice 2m16s, Weigh In 2m09s, Interest Earned 2m30s, Family Tree 2m33s; Budget already separately verified. | PASS for bounded multi-app dashboard reporting; Property Info 1m25s alone is not evidence of a defect absent measured foreground duration. |
| R15-48A–48D | Hosted ETF originally displayed one visit, zero time; browser found only `usageTracking.js?v=20260927-1`, no `window.WA` session facade and no time-spent requests despite no Console errors. | Confirmed instrumentation gap. |
| R15-49A–50A | All six ETF pages (`etf.html`, `etfCategory.html`, `etfSymbol.html`, `etfCompare.html`, `etfActivity.html`, `etfAPItest.html`) revised to load existing `waPlatform.js` before shared `usageTracking.js?v=20261108-1`. Local ETF `/etf.html` multiple TimeSpent POST 200; Nov 9 SQL two views, seven TimeSpent rows totaling 163 seconds. Dashboard 2m43s then 8m22s after all five further pages produced view/time requests. | PASS local six-page tracking/browser check; no ETF business-logic source change requested. |
| R15-51A–51C | User-reported Render staging commit `2602795` Live; hosted ETF scripts, page-view and periodic time-spent POSTs 200 with no unexpected Console errors; `sthink` ETF dashboard increased from 8m22s to 10m45s (17 visits, five sessions). | PASS hosted representative ETF page and cumulative dashboard. Local and staging share the **same test database**, so dashboard total mixes both sources. |

### Targeted tracking lifecycle tests (R15-53A–53C)

| Test | Browser observation | Disposition and limitation |
|---|---|---|
| R15-53A | Hosted Chrome Incognito `charter` authenticated reload of `/BinForm.html` produced **one** `POST /track/log/page` with HTTP 200. | PASS for reload/restore single-view check. **Not** complete browser-restart restoration or every refresh/expiry path; other scripted assets and session-status status were not separately enumerated in the final user response. |
| R15-53B | After explicit `charter` logout, Home displayed `Not Logged In`; 70-second signed-out observation showed no newly initiated `/track/log/page` or `/track/log/time-spent` POST requests and no Console errors. | PASS for tested logged-out interval; a pre-logout in-flight request could complete afterward. |
| R15-53C | Hosted `/BinForm.html`: first foreground time-spent event observed, then browser tab backgrounded ~80s; at return, a second time-spent request payload had `duration: 3`, and ~30s after return the third had `duration: 30`. | PASS for bounded background/foreground behavior. Observations are consistent with flush-on-hide/pause and resumed periodic accounting, **not proof** of exact server-side duplicate-free totals in every pagehide/visibilitychange race. |

**Important distinctions and remaining work:**

- **S6-005 remains Open:** The broader file-by-file migration to session-aware authenticated API handling and app-specific error/refresh regressions was not completed by adding a tracking script. Cross-page session-expiry, denied-access and unsaved-form scenarios remain.
- **S6-017 remains Open:** Representative Family Tree `X-FT-Page-Token` rejection/navigation and an upload lifecycle were tested, but token propagation, FT privacy/contact verification, file access permissions and page-specific fetch interception require further review.
- **S6-025 remains In Progress:** Current-token tracking, periodic checkpoints, sign-out stop and one reload/background path passed. The full acceptance criterion still requires exact-event accounting across token expiry, refresh, restoration, page navigation/pagehide, logout and uncertain delivery, including authenticated error/401 outcomes and duplicate suppression.
- **No unsafe replay:** Controlled Budget/upload reload tests and the shared tracking module's no-automatic-retry design support narrow no-duplicate conclusions. They **do not** establish no unsafe POST replay under an actual 401, network timeout or concurrent refresh for every application. S6-008 and related error handling remain open.
- **Operational cleanup:** `_COPY` files were included in commits by user report, potentially exposing alternate HTML/JS in publicly served `httpdocs`. Review staging/public URLs and correct through a separate user-approved change before any production decision. Do not silently remove files or alter the already deployed test environment.
- **Deferred unrelated defect:** `amortization.html` day-31 date-warning discrepancy was reported; current Drive source includes 29/30/31 in change-handler validation but Calculate lacks independent check. The user explicitly deferred revision. Weights date-range initialization defect S6-039 also remains deferred.
- **Release gates:** Formal R15 bounded PASS does not alter the rest of R01–R20 statuses, close linked S6 issues, satisfy browser matrix R17, certify production readiness or replace mandatory independent design-engineer/security review S6-014 before `main`/production.

**Next formal area:** R16 logs/caches, subject to user-selected priorities and evidence reconciliation. All changes in this document are prepared only as a download for user review/manual installation; the source Drive document and user's local project remain untouched by the assistant.

---

## November 7, 2026 — R14 final bounded acceptance supplement (current disposition)

**Decision:** **R14 PASSED (bounded)** for the formal authorization and subscription-entitlement scenario: *administrator versus Standard subscriptions, access expiry, protected routes; correct admin-only controls and server authorization; Home buttons aligned with validated entitlements*. This supersedes the original `R14 | PARTIAL` status and statements that expired subscriptions have not been tested **for R14 only**. It does **not** close the broader S6-009 or S6-018 issues or establish exhaustive route/security review. Preserve the dated H30–H44 and R10 statements below as historical snapshots.

**Environment and provenance:** `wapps-stage6-test.onrender.com`, Render staging, branch `reviseLogIn`, isolated HelioHost Morty2 database `wapps_test`; reported starting Live commit `d4e5d1a` on November 7. Browser/DevTools and phpMyAdmin outputs were reported directly by the user, not independently audited against server logs. Both `track.html` and `SubControl.html` were subsequently replaced and deployed to staging and passed user-observed regressions; **the final deployed commit identifier after these two fixes was not provided**, so do not attribute their hosted verification to `d4e5d1a`. Chrome Incognito was used for nonadministrator `charter`, and a separate Chrome session for administrator `sthink`. No production DB/service, Git `main`, or installed TNNA changes were authorized.

### R14 evidence ledger — hosted results

| Test(s) | Scenario / account | User-reported observed evidence | Disposition / limit |
|---|---|---|---|
| Baseline H30–H44, R10-14 | Standard `charter`, privileged `eg`, admin `sthink` | Earlier Standard Home 4 enabled/5 disabled; selected non-admin Weights/Activities/Interest Earned 403; authorized `eg` reads and controlled add/delete; H41/42/43 Tracking 403; H44 `sthink` Tracking positive case | Retained prior evidence; dated tests at earlier commits; not rerun wholesale |
| R14-01 | `charter` expired test state | `UserID=64`, `UserSubscriptionID=21`, base Platinum `DEVELOPMENT_TRIAL`, EndDate temporarily 2026-10-15, Active=1, zero *active* administrator grants. Home authenticated `true`, 8 subscription-app buttons disabled, Contact Us enabled. `GET /subscriptions/access/weigh_in` 403 `SUBSCRIPTION_EXPIRED` | PASS for tested state and Home behavior. Contact Us is an authenticated, non-subscription-key feature; policy discussion deferred |
| R14-02 | Eight central entitlements for expired `charter` | `/subscriptions/access/{weigh_in,loan_payment,property_info,interest_earned,town_notice,budget,family_tree}` all 403 `SUBSCRIPTION_EXPIRED`; `etf_investing` 403 `NOT_AVAILABLE_DURING_DEVELOPMENT`. Family Tree full reason confirmed in a separate call | PASS for all eight denials; ETF development availability is checked before expiry |
| R14-03 | Protected application APIs, expired `charter` | Actual GETs `/weights`, `/activities`, `/weightActivities`, `/interestEarned`, `/budget`, `/familytree` returned 403 `SUBSCRIPTION_EXPIRED`; `GET /etf/category` returned 403 `NOT_AVAILABLE_DURING_DEVELOPMENT` | PASS for sampled protected routes; incorrect exploratory keys `/subscriptions/access/WEIGHTS` (`APP_NOT_CONFIGURED`) and `/interest-earned` (404) were corrected and **not** scored as authorization passes |
| R14-04 | `GET /subscriptions/status`, expired `charter` | exists=true, active=false, expired=true, Platinum, DEVELOPMENT_TRIAL, effectiveEndDate=2026-10-15, adminOverride=false | PASS for returned fields; HTTP status not included in the copied output |
| R14-05 | Subscription page, expired `charter` | Platinum / 2026-10-15 / Expired shown; no Console errors | PASS |
| R14-06–R14-08 | Write-denial probes, expired `charter` | `POST /interestEarned` with `{}`, `DELETE /interestEarned/0`, `PUT /interestEarned/0` with `{}` each returned 403 `SUBSCRIPTION_EXPIRED`, app `Interest Earned` | PASS for middleware denial of tested methods before record handler. Invalid payloads/ID were intentionally used; not an exhaustive mutation or DB side-effect audit |
| R14-09 | Restore `charter` base subscription | Guarded SQL update affected 1 row: base EndDate 2026-10-15 → original 2026-12-02, Active=1; status fields active=true, expired=false, Platinum, effectiveEndDate=2026-12-02, adminOverride=false. Reloaded Home authenticated, 7/8 subscription apps enabled (ETF blocked by development), Contact Us enabled; `GET /weights` 200 without new login | PASS. Earlier Standard administrator grant was **not** reinstated; restored entitlement is base Platinum, not the original grant-based Standard. No active admin override |
| R14-10–R14-12 | Active Platinum `charter`, non-admin | `GET /track/stats` 403 `Administrator access required.`; `GET /subscriptions/admin/promos` 403 `Administrator access is required.`; `GET /admin-management/status` 403 `Administrator access required.` | PASS: high plan tier does not grant administrator privileges for these endpoints |
| R14-13–R14-14 | Admin `sthink` | `GET /admin-management/status` 200, isAdmin=true, configuredUsername=`sthink`, username=`sthink`; `/subscriptions/admin/promos` 200 | PASS: selected administrator management and subscription APIs |
| R14-15–R14-16 | Admin `sthink` app override | Subscription status 200, adminOverride=true, accessType=ADMIN, active=true; eight apps allowed=true, reason=ADMIN_OVERRIDE; actual `GET /etf/category` 200 (versus 403 for non-admin charter) | PASS; server-side administrator override demonstrated on an actual protected API |
| R14-17–R14-18 | Admin `sthink` after Home reload | Authenticated=true, administrator display, all 8 subscription-app buttons plus Contact Us enabled; repeat `/admin-management/status` 200, isAdmin=true, configured/authenticated username `sthink` | PASS for reload; **not** proof that an expired JWT underwent refresh |
| R14-19–R14-20 | Admin vs non-admin Home buttons | Admin `sthink`: Track Activity and Sub Control visible+enabled. Non-admin `charter`: both hidden (DOM `.disabled` property still `false`, but server admin endpoints return 403) | PASS for tested UI visibility and independent server gates |
| R14-21 | Non-admin `charter` direct `SubControl.html` | Redirected to Home without Console error; initial testing noted administrator interface flash. Mistaken URL `BsubscriptionForm.html` was a Budget page and is excluded from this test | PASS for redirect; flash defect addressed by later fix/regression |
| R14-22 | Non-admin `charter` direct `track.html`; admin `sthink` | Before fix: administrator UI briefly flashed, `/track/users` 403, then Home redirect (existing H41 issue). Complete updated `track.html` installed/deployed: non-admin shows short verification message then redirects without Tracking UI flash; admin shows verification message then full working Tracking interface, with normal sections and no unexpected Console errors | **CLOSED — PASS** for hosted fix plus both roles; no claim of broader UI audit |
| R14-23 | Updated `SubControl.html`, both roles | Complete updated file installed/deployed: non-admin verification message then Home redirect without Sub Control UI flash; admin verification message then normal Administrator Management, promos, grants and other controls, no Console errors | **CLOSED — PASS** for hosted fix plus both roles |

**Database/test-account disposition:** `charter`'s temporary expired base entitlement was restored to original **2026-12-02** and verified active with one-row guarded UPDATE. The former active Standard administrator grant was removed/deactivated for this test and **not recreated**; the current verified `charter` entitlement is **base Platinum**, not the earlier Standard grant. The reported `ActiveAdminGrants=0` proves no active grant at that time, but the available outputs do not establish whether the prior grant row was physically deleted versus deactivated. Any decision to reinstate Standard access is separate and must not be silently performed.

**Limits and deferred decisions:** R14 passing evidence is bounded to the tested Home UI, subscription page, select admin pages, selected protected endpoints and representative GET/POST/PUT/DELETE requests. The entire application authorization matrix, session-token expiry/refresh under admin state, and sensitive data/logging/caching review were not exhaustively proved. ETF's development-mode restriction takes precedence for ordinary users. Contact Us access after subscription expiry and the duration/eligibility of 30-day development Platinum trials were **explicitly deferred by the user**, not accepted as permanent policies. Do not conflate a transient verification message with unauthorized interface exposure. No actual production deployment, independent engineering review or `main` merge was approved.

**Formal acceptance:** **R14 PASSED (bounded).** Linked **S6-009 remains In Progress** for fuller authorization after refresh/session restoration across Home, Track, SubControl and protected apps; **S6-018 remains In Progress** for 401/403/transient/503 and unsaved-form consistency. S6-008 also remains In Progress as previously recorded. Keep H41 as historically observed and mark its *tested track.html flash regression* resolved after staged correction; the separate Sub Control flash is likewise resolved for tested roles. The independent design-engineer review remains mandatory before any merge/production decision. Next formal area: R15, subject to current testing priorities.

---

## November 7, 2026 — R10 final acceptance supplement (current disposition)

**Decision:** **R10 PASS — bounded acceptance** for the formal Home authentication and subscription-failure scenario. This supersedes the November 3 `R10 | PARTIAL` snapshot above/below **only for R10**. The historical R10 narrative and H05–H50 ledger are preserved unchanged. This is a focused acceptance decision, not a claim of complete application-wide authorization or Stage 6 release readiness.

**Environment / provenance:** isolated Render staging service `wapps-stage6-test`, `https://wapps-stage6-test.onrender.com`, branch `reviseLogIn`. User reported commit **`d4e5d1a` Live** on November 7, 2026. The November 7 functional results are user-reported browser/DevTools observations, not an independently captured server audit. Prior revocation and authorization cases were run at earlier staging/local commits, as described in the dated evidence sections. Test environments included Chrome Normal and Incognito for previous cases and Chrome Guest for the synthetic-token check. No production or `main` changes were authorized.

**Formal R10 definition:** Revoked/stale token on Home; subscription API 401/403/temporary 5xx. Expected: no false authenticated label, no unrestricted applications, appropriate unavailable state, and no forced logout merely because the service/network is temporarily unavailable.

| Evidence | Verified result | Qualification |
|---|---|---|
| Earlier Change Password revocation and S6-037 | Revoked session rejected and Home corrected to signed-out, fail-closed behavior; new valid login restores permitted features | Real revocation evidence, from earlier targeted tests; not rerun as R10-15 |
| R10-01–R10-13 | Selected invalid 401, forbidden 403, injected 503, network/offline, GET retry and non-replay behaviors passed | Some HTTP 503 and failure outcomes used controlled simulation; 19/19 existing shared-module tests reused |
| R10-14 local, signed-out | Offline Home displayed unverified-session and unavailable-access messages; 9/9 restricted buttons and Subscription/Notifications disabled; online signed-out Home restored green buttons and Login Required popups for Loan Payment and Contact Us | Local functional test, followed by staged commit |
| R10-14 hosted, signed-out | Loan Payment and Contact Us Login Required popups passed without protected navigation; offline reload: 9 restricted buttons, 9 disabled, Subscription/Notifications disabled; after restoring connection: `Not Logged In`, 9 enabled, Subscription/Notifications enabled | Chrome Incognito, user observations on reported Live `d4e5d1a` |
| R10-14 hosted, authenticated | `charter` restored as authenticated; `Plan: Standard \| Access Expires: 2200-12-31`; 4 enabled/5 disabled; offline reload preserved session token but disabled 9/9; online recovery restored `charter` and 4/5 permissions | Standard-plan scenario, not proof of expired-plan/admin cases |
| R10-15 hosted synthetic invalid JWT | Guest profile invalid token installed; `/users/session-status` 401, `/users/refresh-session` 401; Home remained `Not Logged In`, no subscription, authenticated `false`; 9 green buttons retained signed-out popup semantics; synthetic token removed successfully | Synthetic invalid token proves rejection, **not** revocation of a previously valid session |

**Limitations / deliberately open scope:** A real hosted backend 503 outage was not induced; 503 handling was tested using controlled injection. R10-15 did not exercise authentic server-side revocation, which is supported separately by password-change tests. These acceptance results do not close cross-application 401/403/error behavior, unsafe mutation protection across all pages, administrator permissions, expired-subscription behavior, or the R14 authorization matrix. Those requirements remain tracked under **S6-008**, **S6-009**, **S6-018**, and other existing integration/security items. S6-037 remains Verified Closed for its targeted regression. Previously observed unauthorized-page UI errors remain for later triage.

**Disposition and gate:** **R10 PASSED (bounded)**; R14 may resume. The global Stage 6 register, code/security review, independent engineering review, and separate user approval before any production/main decision remain outstanding. This supplement records test results and review disposition only; it does not imply that the November 7 results were independently verified by a different engineer.

---

### R08 latest recorded bounded steps (Nov 3)

| Step | Request or browser check | Observed result |
|---|---|---|
| 1 | `GET /users/session-status`, no authentication | HTTP 401; no `no-store` header; ETag present |
| 2 | `POST /users/refresh-session`, `Origin: https://example.com`, no cookie | HTTP 403; no Access-Control-Allow-Origin/Credentials |
| 3 | POST refresh, missing Origin, no cookie | HTTP 403 |
| 4 | POST refresh, allowed exact staging Origin, no cookie | HTTP 401; allowed-origin and credentials CORS response; `Vary: Origin` |
| 5 | `GET /weights`, no auth | HTTP 401 |
| 6 | Chrome Normal `wa_refresh` cookie | `HttpOnly` checked; `Secure` checked; `SameSite=Lax`; `/users`; expires May 2027; value redacted |
| 7 | Chrome authenticated `GET /users/session-status` | HTTP 200; `Cache-Control: no-store`; JSON; no `Set-Cookie` response |
| 8 | Same request's browser context | `Sec-Fetch-Site: same-origin`; Origin absent (normal for GET) |
| 9 | DevTools activity sampled | session-status 200; no refresh-session seen; *not an actual refresh correctness proof* |

**R08/R16 observation:** Failure responses tested in Steps 1–5 lack `Cache-Control: no-store` and expose an ETag. Treat as a cache-policy review finding, not a demonstrated incident or security bypass. Repeated success of a negative Origin test without cookies does not establish the fully authenticated CSRF case. Preserve secrets in private browser contexts only.

### Remaining work and stop rules

Finish targeted R08/16 error response caching and authenticated-CSRF design review first. Then prioritize R10/14 authorization negative tests, R11/19 failure/limiter fairness, R17 cross-browser, R18 native TNNA only with an isolated approved device, and R20 non-destructive environment/rollback review. Preserve R01/02/06/09/12/13 and H05-H50/Groups 5A–5G successes without gratuitous repetition. Actual changes to test credentials must be approved case-by-case. No production validation requiring production write.

**Completion:** 70% ± ~5 percentage points remains a provisional engineering planning estimate; not a statistically defensible fraction of R01–R20 formal cases.

---

# Earlier v1.2 formal plan — preserved historical requirements

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

---

# Integrated October 31 plan addendum

## October 31, 2026 addendum - deployed staging and hosted regression evidence

**Supersedes historical preflight statements only:** a separate Render staging service now exists: `wapps-stage6-test`, branch `reviseLogIn`, candidate `09ece26`, `WA_ENV=staging`, verified staging test DB `wapps_test`. It was user-reported Live and completed H05-H50. Older sections describing an uncreated/unauthorized staging service or the `sql5838929`-only target are historical, not current operating facts. No production deployment has been authorized.

**Evidence detail:** See companion `Stage6_H05-H50_Hosted_Evidence_2026-10-31.md` for the complete H05-H50 ledger, accounts, browser modes, observations and limitations. These H labels do not replace formal R01-R20 IDs. No full release acceptance or closure is implied.

**Dispositions requiring attention:** H20 reproduced S6-039, an existing deferred dialog error; H26 later became signed out without KMLI (behavior consistent with 8-hour design, but exact JWT expiry not checked); H50 rejected an expired password-reset link (actual server-side enforcement not traced). H30/H33/H36/H41 yielded nonblocking UI/error-handling observations. H42/H43 confirmed `users` API 403 and limited response; H44 authorized Tracking operation. Other routes and security pathways remain unverified.

**Pending formal test mapping:** Map these hosted observations to formal R01-R20 only where acceptance evidence actually matches. Preserve unresolved HTTPS cookie, origin/CSRF, proxies/rate limits, browser/device, TNNA, password reset/change/revocation, cache headers, logs, and independent-review gates.

---

# October 31 H05–H50 hosted test ledger — integrated evidence

# Stage 6 Hosted Consolidated Test Evidence — H05 through H50

**Evidence cutoff:** October 31, 2026.
**Project / branch:** Wonderful Apps / `reviseLogIn`.
**Hosted staging service:** `wapps-stage6-test` (`https://wapps-stage6-test.onrender.com`).
**Deployed candidate:** commit `09ece26` (user-confirmed staging deployment).
**Database:** staging HelioHost test database `wapps_test`, with `WA_ENV=staging` identity guard reported verified at startup.
**Production scope:** none; no authorized changes to production Render, database, `main`, or installed TNNA.
**Evidence source:** user-reported browser behavior, Console/Network observations, selected Render logs, and follow-up clarifications in Stage 6 conversation. Where evidence is partial, dispositions are explicitly bounded. Individual test timestamps generally were not recorded.

**Important distinction:** H05-H50 are the sequential conversational hosted regression IDs, **not** formal R01-R20 test-plan IDs. Do not count them as completion of the full formal security matrix. Earlier H01-H04, local L01-L03, and separately numbered R tests retain their own original evidence.

## Hosted test ledger

| ID | Check | Context | Disposition | Observed evidence / limitation |
|---|---|---|---|---|
| H05 | Normal login; KMLI unchecked | charter / Incognito | Pass | Home signed in; email verification completed; no Console errors |
| H06 | KMLI login and F5 reload | charter / Incognito | Pass | Remained signed in; no Console errors |
| H07 | Explicit logout and F5 | charter / Incognito | Pass | Stayed signed out; no Console errors |
| H08 | Weights existing records | eg / Incognito | Pass | Records/chart displayed; no Console errors |
| H09 | Activities existing records | eg / Incognito | Pass | Records displayed; no Console errors |
| H10 | Interest Earned existing records | sthink / Incognito | Pass | Existing records displayed; no Console errors |
| H11 | ETF categories and symbols | sthink / Incognito | Pass | Existing configuration displayed; no Console errors |
| H12 | Family Tree existing authorized data | sthink / Incognito | Pass | Authorized information displayed; no Console errors |
| H13 | Tracking interface | sthink / Incognito | Pass | Statistics and usage information displayed; no Console errors |
| H14 | Family Tree privacy (read-only) | sthink / Incognito | Pass | Existing privacy information displayed; no Console errors |
| H15 | Town Notice page (read-only) | sthink / Incognito | Pass | Normal interface displayed; no Console errors |
| H16 | Budget existing views | sthink / Incognito | Pass | Budget view/calculations displayed; no Console errors |
| H17 | Notification Preferences (read-only) | sthink / Incognito | Pass | Existing preferences displayed; no Console errors |
| H18 | ETF 1Y comparison | sthink / Incognito | Pass | Comparison completed; no Console errors |
| H19 | Favorite Pets (read-only) | sthink / Incognito | Pass | Existing information displayed; no Console errors |
| H20 | Weights date-range delete dialog | eg / Incognito | Known limitation | earliestDate.toISOString is not a function; S6-039; no DELETE submitted; server DELETE log path untested |
| H21 | Scheduled reset rate cleanup | Render staging logs | Pass (normal path) | 2026-10-30 18:57:21: removed 0 expired records in 1 batch; failure path untested |
| H22 | Application error log search | Render staging logs | Pass (bounded search) | No matches for [ERROR] in selected window; not proof of absence of all errors |
| H23 | KMLI after Render service restart | charter / Chrome Normal | Pass | Remained logged in; no Console errors |
| H24 | KMLI after full Chrome restart | charter / Chrome Normal | Pass | Remained logged in; no Console errors |
| H25 | Logout then Chrome restart | charter / Chrome Normal | Pass | Remained logged out; no Console errors |
| H26 | Unremembered 8-hour session lifecycle | charter / Chrome Normal | Pass (behavior observed) | KMLI off; remained logged in after earlier Chrome restart, later reopened not logged in; JWT exp/network timing not independently inspected |
| H27 | Two-tab remembered logout | charter / Incognito | Pass | Both tabs signed in; logout first; second signed out on refresh; no Console errors |
| H28 | Independent session isolation on logout | charter / Normal + Incognito | Pass | Incognito logout did not revoke still-valid Normal session; no Console errors |
| H29 | Different-account browser isolation | charter Normal / eg Incognito | Pass | Account and plan status remained distinct; no Console errors |
| H30 | Unauthorized Weights API and save | charter / Incognito | Pass, UI observation | GET weights 403; activities 403; POST weights 403; Add form still accessible, repeated 403 Console messages; no write readback |
| H31 | Authorized Weights and Add form | eg / Incognito | Pass | Records/chart/activities displayed; Add form opened and cancelled; no Console errors |
| H32 | Unauthorized Activities direct navigation | charter / Incognito | Pass (403) | No Activities button on Home; direct page GET activities 403, subscription denied Console message |
| H33 | Unauthorized Interest Earned | charter / Incognito | Pass, UI observation | GET and save rejected 403; form allowed input; uncaught promise rejection; no DB readback |
| H34 | Authorized Interest Earned add/delete | eg / Incognito | Pass | Created and deleted test contract; no Console errors; eg entitled but previously had no saved records |
| H35 | Authorized Activities add/delete | eg / Incognito | Pass | Created and deleted temporary activity; no Console errors |
| H36 | Activities after logout | eg / Incognito signed out | Pass, UI observation | No data displayed; uncaught Please log in error; no server 401 independently verified |
| H37 | Weights after logout | Incognito signed out | Pass | No data; LOGIN_REQUIRED; Service Worker registered; no unexpected Console errors |
| H38 | Interest Earned after logout | Incognito signed out | Pass | Redirected to login.html; no Console errors |
| H39 | Family Tree after logout | Incognito signed out | Pass | Public instruction page displayed; FamilyTree2 Menu redirected to Login; no Console errors |
| H40 | Tracking after logout | Incognito signed out | Pass | Redirected to Login; no Console errors |
| H41 | Tracking as non-admin | eg / Incognito | Pass (UI gate) | track.html flashed briefly then redirected home; no Console errors |
| H42 | Tracking protected users API | eg / Incognito | Pass (specific request) | Network showed users 403; session-status 200; some page resources 304; other admin APIs not exhaustively verified |
| H43 | Tracking denial response | eg / Incognito | Pass (specific request) | users 403 response: {"error":"Administrator access required."}; no user records in that response |
| H44 | Tracking as administrator | sthink / Incognito | Pass | Tracking and statistics displayed, users API reported successful as expected; exact HTTP code not separately transcribed |
| H45 | Change Password interface | sthink / Incognito | Pass (UI only) | Fields displayed; no password changed; no Console errors |
| H46 | Forgot Password interface | Incognito signed out | Pass (UI only) | Form and navigation worked; no reset request in this test; no Console errors |
| H47 | Reset email request submission | charter / Incognito | Pass (observed) | Expected generic confirmation; no Console errors; equivalence for unknown email not compared |
| H48 | Reset email delivery and URL | charter inbox | Pass | Email received; link started https://wapps-stage6-test.onrender.com/forgotPassWord.html?; token never recorded |
| H49 | Reset form from email link | charter / Incognito | Pass (UI only) | Fields displayed; no change submitted; no Console errors |
| H50 | Expired reset link | charter / Incognito | Pass (observed) | After expiry window, message Reset password no longer valid; no server-side enforcement independently traced |

## Reconciliation and residual findings

1. **S6-039 remains deferred.** H20 reproduced the previously reported `earliestDate.toISOString is not a function` error in the Weights date-range dialog. Opening/canceling that dialog did not exercise the server-side DELETE route; prior controlled local delete evidence is separate. Do not classify H20 as clean/no-error.
2. **S6-041 remains open.** The fact that H43 returned a safe, limited administrator-denial JSON message does not establish that other route exception handlers avoid raw `e.message` disclosure (notably Family Tree Favorite Pets and other previously flagged routes). An endpoint-by-endpoint error-path review remains required.
3. **UI observations to triage (not server-side authorization bypasses):** H30 unauthorized Weights user could open Add before POST 403, with repeated Activities 403s; H33 unauthorized Interest Earned user could open Add before POST 403 and an uncaught promise rejection; H36 Activities page emitted an uncaught login-required exception; H41 `track.html` briefly appeared before redirect. Preserve in review queue; assigning a new S6 issue ID requires reconciling the latest local register first.
4. **H26 is behavioral, not timestamp-level proof.** Unchecked-KMLI session survived an early browser restart and was later signed out. Exact access-JWT `iat`/`exp`, 8-hour threshold and server response were not inspected, so precise expiry mechanism is unverified. No indication that this result failed the intended design.
5. **H50 is behavioral.** Previously emailed reset link was rejected with 'Reset password no longer valid.' The server-side expiry check and one-time-token reuse protection were not inspected in this hosted test. Actual reset completion, password-change and cross-session revocation remain required hosted cases.
6. **H22 was a bounded log check.** Zero matches for `[ERROR]` in the selected period; other severity formats, missing logs, error-path safety and PII/log leakage are not globally excluded. H21 validated normal cleanup only (0 expired records, 1 batch).
7. **H42-H44 are endpoint-specific.** H43 establishes the observed `users` 403 response body contains no user records. The 304 entries for cached resources do not establish safe cache headers for sensitive API data; broader admin route authorization and cache header inspection remain required.
8. **Tests H34/H35 made temporary changes to *staging/test* records only.** Users reported a test contract and test activity were created and deleted. No independent database reconciliation was conducted.
9. **Formal release gates remain open:** hosted password change/reset with revocation/one-use tests; HTTPS cookie / Secure / SameSite / Origin and CSRF; X-Forwarded-For/proxy and rate-limit safeguards; multi-tab simultaneous refresh; protected API caching; service-worker compatibility; other browsers/devices; TNNA compatibility; account/subscription negative scenarios beyond sampled routes; controlled rate/DB limits; sanitized logging audit; exact production diff / migration / rollback; and independent design-engineer review after all Stage 6 changes and tests. Map these to the current R01-R20 matrix and S6 IDs without automatically closing any.

## Summary counts and controls

- **46 tests recorded:** H05-H50 inclusive.
- **45 pass or qualified-pass observations** (including H26, with limited expiry evidence), and **1 known-limitation case H20**. This count is descriptive, not a formal release readiness score.
- Existing production service, production data, `main`, and TNNA clients remain out of scope.
- Passwords, JWTs, refresh cookies, reset tokens, full password-reset links, and personal data are intentionally absent.

## Update policy

This appendix is a **dated supplement**, not a replacement for older formal test-plan sections. Reconcile newer local copies of the three source documents before applying any update. Do not silently rewrite historical statements; add a 'superseded by October 31 staging evidence' note where old descriptions incorrectly refer to staging as not yet created. No production authorization is implied.

---

# November 3 Group 5G hosted acceptance — integrated evidence

# Wonderful Apps — Stage 6 Group 5G Hosted Credential-Lifecycle Acceptance Evidence

**Date:** November 3, 2026
**Scope:** Stage 6 Group 5G only; web password-reset/change-password and TNNA API credential lifecycle
**Disposition:** **PASS for the explicitly observed hosted scenarios; Stage 6 overall NOT released / NOT fully accepted**
**Branch / hosted deployed commit:** `reviseLogIn` / `f023cc3` (user-confirmed successful Render startup and Live deployment)
**Service:** `https://wapps-stage6-test.onrender.com`
**Database:** HelioHost Morty2 MariaDB `wapps_test`, version `12.3.3-MariaDB-log`, staging identity and UTC verified in Render startup messages
**Synthetic user:** `charter`, **UserID 64**. Previous `charter` UserID 62 was deleted and 14 identified user-reference tables checked as zero before new registration.
**Evidence provenance:** User-supplied phpMyAdmin SQL results, Render logs/screenshots, Chrome observations, and PowerShell output from real staging HTTP requests in this conversation. No full secret-bearing HTTP traces, automated capture bundle, or Android device test was provided. Unless stated otherwise, PASS means the reported result was observed in the bounded test, not an exhaustive security certification.

## A. Deployment and scope verification

- The stage-only database hostname changed to `morty2.heliohost.org` in `services/stage6Environment.js` and `dbConnection.js`; `tests/group0d.environment.test.js` updated. On local branch `reviseLogIn`, `git diff --check` was clean aside from harmless LF/CRLF notices; all **16/16** group0d environment tests passed.
- Git commit **`f023cc3`** (`Stage 6: update HelioHost test endpoint to Morty2`) was pushed to `origin/reviseLogIn`, changing only the three reviewed files. Render startup then showed successful DB UTC connection, verified Stage 6 database identity and listening port 10000. No `main`, production Render service, or production database modification was authorized as part of Group 5G.
- A separate local credentialed/TLS MariaDB test reported `johnny.heliohost.org` access denied and `morty2.heliohost.org` connection successful to `wapps_test`. This supports the stage-only host change; it does not establish future production migration readiness.

## B. Hosted web password-reset lifecycle — PASS (observed)

1. Normal Chrome KMLI login for `charter` established remembered **WebSessionID 115**. Pre-reset DB: `UserID=64`, `IsRemembered=1`, `RevokedAt=NULL`, `CreatedAt=2026-11-03 15:38:51 UTC`, `ExpiresAt=2027-05-02 15:38:51 UTC`.
2. Separate Incognito browser: Forgot Password showed generic response; reset email delivered. Existing KMLI window was kept open.
3. Reset link submitted with a different password; page reported success. DB: WebSessionID 115 `RevokedAt=2026-11-03 15:47:38 UTC`.
4. Original Normal Chrome session returned to logged-out state on reload; old password rejected; new password accepted via subsequent login (KMLI unchecked).
5. Reopening same reset link was rejected. DB `PasswordResetT` record for UserID 64 showed `CreatedAt=2026-11-03 15:44:45 UTC`, `ExpiresAt=2026-11-03 16:14:45 UTC`, `UsedAt=2026-11-03 15:47:38 UTC`, `RevokedAt=NULL`. The used timestamp, not `RevokedAt`, prevents reuse.
6. `UserSecurityT.SecurityVersion` read **2** afterward. Its exact pre-reset value was **not recorded**, so the increment is consistent with expected behavior but not independently measured as a before/after pair.

## C. Hosted authenticated Change Password lifecycle — PASS (observed)

1. Re-established remembered Normal Chrome KMLI session **WebSessionID 117**: `UserID=64`, `IsRemembered=1`, `CreatedAt=2026-11-03 16:00:46 UTC`, `RevokedAt=NULL` before change.
2. Authenticated Change Password returned success. DB later showed session 117 `RevokedAt=2026-11-03 16:05:18 UTC`.
3. Original Normal Chrome browser became logged out on reload. Previous password rejected. Newly changed password accepted via normal login, KMLI unchecked.

## D. TNNA hosted HTTP and credential-revocation lifecycle — PASS (Windows API client)

**Device boundary:** Executed from Windows PowerShell using real `wapps-stage6-test` routes, a synthetic test-device identifier, and `charter` UserID 64. **Not an Android APK/device end-to-end test**. Samsung A15 TNNA installation remained signed in as `sthink` in offline mode and was not altered.

1. `POST /users/login` accepted test-only credentials and sent verification email; its temporary challenge was retained privately in the user's PowerShell session.
2. `POST /tnna/verify-code` succeeded, returning UserID 64 and actual access and refresh tokens. `GET /tnna/me` with issued access token succeeded and identified `charter`, UserID 64.
3. DB baseline **TNNA RefreshTokenID 28**, `CreatedAt=2026-11-03 16:24:23 UTC`, `ExpiresAt=2027-05-02 16:24:23 UTC`, `RevokedAt=NULL` (180-day lifetime).
4. `POST /tnna/refresh` with token 28 succeeded and returned new, different access/refresh credentials. DB then showed token **28 revoked at 2026-11-03 16:27:37 UTC**, and replacement **RefreshTokenID 29**, `CreatedAt=2026-11-03 16:27:37 UTC`, `ExpiresAt=2027-05-02 16:27:37 UTC`, `RevokedAt=NULL`.
5. Replaying token 28 against `/tnna/refresh` returned **HTTP 401** (PASS).
6. The user changed `charter` password through the hosted normal web interface while token 29 was active. DB showed token **29 revoked at 2026-11-03 16:31:10 UTC**.
7. Using the previously issued TNNA access token on `GET /tnna/me` returned **HTTP 401** (PASS). Using the previously issued TNNA refresh token 29 against `POST /tnna/refresh` also returned **HTTP 401** (PASS).

**Evidence limitation:** Token contents, verification codes, passwords, email addresses, and reset links were deliberately not captured or shared. We have user-reported HTTP outcomes and selected database states, not a separate signed/automated log bundle. The initial refresh rotation and replay protection are also covered by prior offline tests, but this Group 5G record establishes actual hosted HTTP behavior for the specific sequential scenario above. It does not prove concurrent replay behavior at the hosted network layer or other TNNA device flows.

## E. Group 5G disposition and outstanding gates

**Group 5G planned web and TNNA API credential lifecycle: completed / PASS for observed cases.** Neither Group 5G PASS nor successful Stage 6 staging connection authorizes a merge or production deploy.

Still outstanding or separately tracked:

- Native Samsung/Android TNNA app flow on a staging-connected installation (Windows API client is not a substitute for the Android UI, app lifecycle, or offline-to-online transition).
- Formal R01–R20 security matrix mapping and any cases not directly supported by these specific observations; broader origin/CSRF/cookie/header/caching controls, cross-browser/device behavior, concurrent failures, abnormal DB/rate limits, error-response/logging audit, access-control/entitlement negative cases.
- Existing **S6-039** Weights delete date-range dialog error (`earliestDate.toISOString is not a function`), deferred; **S6-041** incomplete sanitized error-response audit; additional UI observations H30/H33/H36/H41 require triage against the authoritative issue register.
- Production MariaDB migration planning, fresh production MySQL dump/import validation, operational rollback, exact source/database schema and environment diff; **not part of Group 5G**.
- **Mandatory independent design-engineer/security review after all Stage 6 work and testing, before any merge or production decision**.
- The distinct, proposed account-deletion SOP (in `docs/WA_Account_Deletion_SOP_Design_2026-11-02.md`) and unresolved retention/shared Family Tree/subscription policy choices remain a **future enhancement**, not installed in Stage 6.

## F. Documentation reconciliation

This is a **dated November 3 supplement** to the historical October 31 `Stage6_H05-H50_Hosted_Evidence_2026-10-31.md`, `Stage6_OpenItems_H05-H50_Append_2026-10-31.md`, and `Stage6_Render_TestPlan_H05-H50_Append_2026-10-31.md`. Their statements that hosted password completion, one-time use and TNNA credential revocation were *still untested as of October 31* are historically correct and **superseded for the bounded cases recorded here**; do not rewrite or silently change their original observations. Do not mark the entire Stage 6 project finished.

**Credentials and secrets:** None included. **Production/main/A15:** No change reported in the Group 5G test sequence.

---

# November 1 Group 5D acceptance notes — integrated evidence

# Wonderful Apps — Stage 6 Group 5D acceptance record and remaining-test reconciliation
**Date:** 2026-11-01
**Branch:** `reviseLogIn`
**Hosted environment:** existing `wapps-stage6-test` Render service and HelioHost `wapps_test` database
**Reported deployed commit:** `9e443c7` (user's Render dashboard screenshot).
**Evidence basis:** user-reported Chrome Console and Network screenshots, phpMyAdmin query output, earlier local Node test output, Google Drive source/inventory. No new network or database test performed for this report.

## Group 5D — results verified from supplied evidence

| Test / observation | Result | Qualification |
|---|---|---|
| `waPlatform.unit.test.js` | PASS, 19/19 | Offline mocked browser/database interfaces; not live HTTP |
| Hosted read-only browser preflight | PASS, 7/7 | User screenshot; correct Render origin, browser APIs available |
| Controlled hosted two-tab restoration | PASS for tested run | Console: 2/2 participated, 2/2 authenticated, `restored=1/2` |
| Browser Network request evidence | Consistent with one refresh | Tab 1: one `/users/refresh-session` HTTP 200; Tab 2: none observed, `/users/session-status` HTTP 200. This is a captured-run conclusion, not universal concurrency proof |
| Keep Me Logged In through Chrome restart | PASS, user confirmed | Automatically authenticated |
| Explicit logout + page refresh | PASS, user confirmed | Remained signed out |
| Logout persistence through Chrome restart | PASS, user confirmed | Remained signed out |
| DB row for remembered session | PASS with linkage caveat | `wapps_test.WebSessionT`: WebSessionID 111; UserID 62; IsRemembered 1; CreatedAt 2026-11-01 13:50:33 UTC; RevokedAt 2026-11-01 14:19:42 UTC |
| Refresh history associated with WebSessionID 111 | Consistent with one rotation | Two issued, one consumed. Row linkage inferred from timing and behavior; browser session ID was not independently captured |
| Refresh-token rejection after logout | Not independently probed | Browser stayed signed out; no isolated attempt to replay post-logout refresh cookie |

### Interpretation
The tested two-tab refresh, remembered browser-restart, explicit logout, and persistence scenarios passed. Browser and DB evidence reinforce each other. A database revocation timestamp is recorded, but no separate credential-level rejection probe was run after logout.

## Stage 6 remaining work / distinctions

1. **Group 5C full HTTP integration** — OFFLINE handler tests passed in earlier user-reported runs. They do not validate all real Express middleware, database, and end-to-end HTTP behavior. Real HTTP website and TNNA scenarios remain outstanding unless separately documented as performed. Do not reinstate legacy tests using `charter`/UserID 62 and password mutation without isolated fixture and explicit cleanup.
2. **Proxy/client IP hosted attribution** — OPEN. Earlier source/loopback audit does not establish the actual Render proxy chain or client-IP rate-limiter attribution.
3. **Source patcher `tests/apply-stage6b2-revocation-fix.cjs`** — KEEP BLOCKED. It writes application source; it is not a test.
4. **Unreconciled test inventory** — The Oct 31 inventory enumerated 29 then-present items (16 migrated, 13 pending). The Drive test folder has changed since that audit. Reconcile actual local branch and current test suite before claiming all Stage 6 tests are complete. Do not treat this as an exhaustive inventory of project tests.
5. **Independent design-engineer review** — REQUIRED after all Stage 6 implementation and hosted acceptance work, before merge or production decision.
6. **Production smoke check** — A limited post-deployment sanity check follows a future, separately authorized merge and production deployment; not a substitute for pre-merge testing.

## Operational safeguards
- No merge into `main`, no production deployment or production database operations.
- Keep existing dedicated Render staging service and database; no need to install the unused H109 startup-fix ZIP.
- Avoid posting raw tokens, cookies, headers, passwords, secret strings, or SQL dumps with private records.
- This report does not authorize destructive replays or tests targeting an existing shared account.
- Record separately the disposition of outstanding live HTTP, TNNA, and proxy checks. Do not silently mark them passed based on Group 5D.

## Suggested next acceptance sequence
A. Reconcile the current test suite against the Oct 31 audit and the recent Group 5A–5D evidence, identifying exact remaining cases.
B. Design minimally invasive hosted HTTP tests with dedicated test identity and cleanup, only where coverage cannot be demonstrated from existing results.
C. Perform hosted proxy/client-IP attribution test with nonsecret observable evidence.
D. Complete independent design-engineer review, resolve findings, then make a separate merge/production decision.

---

# November 2 Group 5E closure — integrated evidence

# Wonderful Apps — Stage 6 Group 5E closure and remaining acceptance
Date: 2026-11-02
Branch: reviseLogIn
Latest user-verified local and origin commit: d7ebc3c
Scope: documentation only; no code, database, or Render modifications.

## Confirmed Group 5E evidence
- Permanent password-reset client-IP resolver committed in ff6eef2, deployed to the separate wapps-stage6-test service.
- Feature flag WA_TRUST_RENDER_CF_IP initially absent; later set to 1 in the separate staging service by the user.
- Six resolver unit tests passed locally, including disabled default, valid CF IP selection, malformed-header fallback, and rejection of X-Forwarded-For as authority.
- Previously reported HTTP-failure, email/IP and global rate-limit unit regressions passed.
- Hosted Home page, login, authenticated state and logout smoke test passed.
- Temporary authenticated diagnostic deployed in d1e427b; hosted response reported trustProxy=false, cfPresent=true, cfValidSingleIp=true, peerValidSingleIp=true, selectedEqualsCf=true, selectedEqualsPeer=false, cfEqualsPeer=false and xffPresent=true.
- User removed temporary secret WA_GROUP5E_VERIFY_KEY from Render, and saved/deployed configuration.
- User restored server.js and deleted the temporary diagnostic module locally. Git diff showed exactly two diagnostic route lines removed.
- Cleanup committed and pushed as d7ebc3c; the temporary module deleted from the repository. Render post-cleanup deployment was not independently checked by design, per agreed workflow.

## Interpretation and security limitation
The hosted check confirms the application's actual resolver selected the valid CF-Connecting-IP header rather than the immediate socket peer on the tested ingress path. This is not proof that the header is unspoofable across all alternate ingress paths. Previous client-supplied CF-Connecting-IP test encountered Cloudflare error 1000 on the tested route; this provides limited supporting evidence, not a universal guarantee. Independent reviewer must evaluate header provenance and fail-safe behavior before use in production. Express trust proxy remains false in the verified diagnostic.

## Remaining Stage 6 acceptance gates
A. Reconcile unresolved HTTP/TNNA integration cases against safe, prior tests and select only material gaps. Avoid shared accounts, credentials, and mutating legacy scripts.
B. Compare local reviseLogIn test file inventory against prior recorded runs and the authoritative Drive tests inventory. Include Stage 6A rate-limit and cleanup cases.
C. Complete any narrowly justified, bounded staging tests that remain after that reconciliation.
D. Mandatory independent design-engineer/security review after implementation and hosted acceptance, before merge to main or production changes.

## Next recommended action (read-only)
Run this PowerShell inventory in the local Wonderful Apps checkout:

  git branch --show-current
  git log -1 --oneline
  git ls-files tests

No tests, database connections, code changes, commits or deployments are required just to collect the list. Review against recorded acceptance evidence before selecting further tests.

## Source references
- My Drive/wonderfulApp/WA_Stage6_Remaining_Acceptance_Reconciliation_2026-11-01.md
- My Drive/wonderfulApp/WA_Stage6_Group5E_Proxy_Trust_Decision_2026-11-01.md
- User-provided PowerShell output and hosted diagnostic response in the current conversation.
