# Wonderful Apps — Stage 6B Technical Design Review

**Prepared:** October 18, 2026  
**Review status:** Pre-implementation architecture and dependency review; **not** the mandatory final independent design-engineer approval review.  
**Project:** Wonderful Apps (WA), Node.js 24 / Express 5 / MySQL 5.5; separate Capacitor-based Town Notification Native App (TNNA).  
**Development branch:** `reviseLogIn`  
**Test database ONLY:** `sql5838929`  
**Source of truth:** Current Wonderful Apps Google Drive files, and fresh `wappsTestDump.sql` (test) / `wappsDump.sql` (production) snapshots; the attached Stage 6 handoff records historical decisions and reported test outcomes.  
**Google Drive root:** https://drive.google.com/drive/folders/1SBkEcRIb-ekv83-EoZXHkH0cderSHWec  
**Assessment basis:** Stage 6 handoff and read-only source inspection of authentication files, top-level WA HTML pages, shared `httpdocs/js` scripts, and route wiring. This review is not a source-controlled diff, exhaustive endpoint audit, live security assessment, or independent replay of tests.

## 1. Purpose and requested engineering input

Please review the observed browser authentication integration gaps, evaluate the proposed shared-client approach, recommend corrections to the design, and provide written findings (severity, reasoning, proposed resolution, and acceptance criteria). In particular, evaluate single-use refresh token behavior under concurrency, authenticated request retry semantics, account/logout revocation, browser storage, XSS/CSRF defenses, cookie origin and proxy trust, and legacy/TNNA compatibility. The implementation team should resolve design questions **before generating bulk revisions of the individual WA pages**.

**Approval boundary:** This review is advisory for Stage 6B design. A **separate independent design-engineer review is mandatory after all Stage 6A–6D implementation and local/hosted testing, but before any decision to merge `reviseLogIn` into `main`, migrate production SQL, or deploy to production.** Only the user authorizes those actions after that final review.

## 2. Non-negotiable agreed requirements (confirmed by handoff)

1. Work exclusively on `reviseLogIn` and use **only test DB `sql5838929`**. Do not touch production DB, existing Render production service, or `main`.
2. Maintain normal 8-hour website JWT sessions and **optional** Keep Me Logged In: rotating, single-use HTTP-only refresh cookie, sliding 180 days, absolute maximum 365 days.
3. Login continues through username/password **and email verification code**. Registration does not automatically log in.
4. Support logout, change password, forgot/reset password, session/account-wide revocation, and validation of reset links.
5. Audit the **entire WA project** and inventory files by change required, no change, or further investigation; issue **complete revised files** in manageable tested groups with backup and rollback instructions.
6. Create a **separate** Render test service using the Stage 6 branch and test DB only, after verifying configuration, limits and cost. Test HTTPS cookies, proxy, email/reset links, all applications and TNNA integration.
7. Keep the test database as a permanent development/regression resource. Protect installed TNNA phones and offline behavior.
8. No production merge/migration/deployment until all Stage 6 phases, separate hosted testing, final independent engineer review, corrections and retesting, and explicit user approval.

## 3. Existing baseline and evidence boundaries

### 3.1 Stage 6A backend as recorded

The handoff records that Stage 6A planned local functional safeguards passed in the user's environment. These were **user-reported** outcomes, not newly replayed here. Main features include a versioned web JWT (`client:'web'`, `sid`, `securityVersion`), database-backed `WebSessionT` validation and revocation, optional rotating `wa_refresh` cookie, 180-day sliding/365-day absolute lifetime, password change/reset revocation of web and TNNA refresh credentials, hashed one-use reset tokens, MySQL-backed reset rate limiting, and bounded cleanup. Remaining hosted and operational verification is explicit.

SQL snapshot reported in the handoff (October 18, 2026): **66 production tables versus 71 test tables**. Only the test dump contains `UserSecurityT`, `WebSessionT`, `WebRefreshTokenT`, `PasswordResetT`, and `PasswordResetRateT`; `TNNARefreshTokenT` appears in both. This table diff is handoff-reported and should be independently revalidated against fresh dumps before migration planning. **No SQL was run as part of this review.**

### 3.2 Verified code references (current Google Drive inspection)

- `routes/users.js` contains `/login`, `/verify-code`, `/logout`, `/refresh-session`, `/session-status`, `/change-password`, `/forgot-password`, `/validate-reset-token`, `/reset-password` and `/is-admin`. `verify-code` takes `keepMeLoggedIn = false`; it calls `sessions.create(..., keepMeLoggedIn===true)` and conditionally sets the cookie. Source: https://drive.google.com/file/d/14qi5ho906HDhz_K7L8FwFSWo3J7c7C6W/view
- `services/browserSession.js` establishes 8-hour JWTs, 180/365-day remembered lifetimes, `wa_refresh` cookie with `httpOnly`, `sameSite:'lax'`, `path:'/users'`, and `secure` determined by `NODE_ENV==='production'`. It uses a single-use rotation operation with consumed/replayed-token rejection; it currently throws unless `DB_NAME==='sql5838929'`. Source: https://drive.google.com/file/d/1_u_AYHMn76AKkUlposxkHtQlZjhT_Tby/view
- `services/verifyAccessToken.js` checks JWT signature, client, security version, current session (for web), and fails closed for DB outages. Its stale introductory comment incorrectly says it is not wired into routes. Source: https://drive.google.com/file/d/1hFHX8oYY2EUuOT95y0zGlMEmE4WqDEBM/view
- `middleware/auth.js` calls `verifyAccessToken`. `middleware/subscriptionAccess.js` calls `auth`, requires `client==='web'`, and applies application subscription access. Source: https://drive.google.com/file/d/1FFqupA6BFa5UDLyNnFC8_7ocLNL0pMBc/view
- `server.js` mounts protected weights, activities, interest, Budget, Family Tree and ETF endpoints using shared middleware; other routers (`/users`, `/subscriptions`, `/notifications`, `/track`, `/tnna`) have additional internal checks to review. Its CORS origin allowlist does not yet name an independent Stage 6 Render test host. Source: https://drive.google.com/file/d/1WPCna9iiz06MXistRZR8Cjqc5_V29Nxf/view
- `httpdocs/login.html` submits verification data as `{tempToken,verificationCode}` and on success calls `localStorage.setItem('token', data.token)`. It does not pass the agreed Keep Me Logged In selection. Source: https://drive.google.com/file/d/1soy2tdb8HHqpBvlsTuqQmx6G09Qx_qIX/view
- `httpdocs/home.html` directly reads/decodes the localStorage JWT and removes the token during logout rather than calling `/users/logout`. Source: https://drive.google.com/file/d/17xdBhMpZLp97wToYErWP2H4ptbFoLoZt/view
- `httpdocs/subscription.html` sends stored JWT in Bearer headers; on 401 removes it and redirects to login without a refresh attempt. Source: https://drive.google.com/file/d/1oqhBsYhqhP_gk4Dz_DV8iWco26Ca-5wW/view
- Family Tree scripts use per-file token helpers and `fetch`; e.g. `FamilyTreePage.js`, `FTPerson.js`, `FTPrivacy.js` and `usageTracking.js`. **Important interaction:** `FTPrivacy.js` currently intercepts `window.fetch` to attach `X-FT-Page-Token` to familytree requests. Any replacement wrapper must preserve this protection without altering unrelated requests or creating recursion. Source folder: https://drive.google.com/drive/folders/1n-NPAA4Tz5MxRGjlHmj9AsQxwsEzRvvH
- `httpdocs/sw.js` maintains a PWA cache (`wonderful-apps-cache-v9`), including HTML and selected assets; examine cache activation/update behavior against new auth scripts. Source: https://drive.google.com/file/d/1yhwft-vWCtwWSXPJtquB9hYoe273Na-2/view

## 4. Preliminary findings — observations versus risk hypotheses

| ID | Classification | Observation (confirmed) | Risk / action (requires design review) |
|---|---|---|---|
| AUTH-01 | **Confirmed gap; high priority** | `login.html` does not pass `keepMeLoggedIn` to `/users/verify-code`. | Remember-me preference is not available end-to-end. Add accessible checkbox and propagate boolean only after email code verification. |
| AUTH-02 | **Confirmed gap; high priority** | `home.html` removes local token without calling backend `/users/logout`. | Server session/remembered cookie may remain valid. Plan authenticated revoke-first logout, failure handling, and cross-tab notification. |
| AUTH-03 | **Confirmed gap; high priority** | No shared browser use of `/users/refresh-session` identified across HTML/shared JS scan. | Browser cannot transparently restore an access session using its HTTP-only refresh cookie. Centralize restoration/refresh behavior. |
| AUTH-04 | **Confirmed variation** | Pages independently read token, construct Bearer headers, and differ in 401 behavior. | Inconsistent expiry, missing-token, 403 subscription, and 503 outage experiences. Introduce common status classification. |
| AUTH-05 | **Confirmed architecture + inferred race risk** | Refresh tokens are single-use and rotated by backend. | Concurrent tabs or concurrent fetches could compete for one cookie. Design and test in-tab and cross-tab coordination; never quietly weaken replay defense. |
| AUTH-06 | **Confirmed interaction; high attention** | Family Tree privacy module modifies `window.fetch` and inserts `X-FT-Page-Token`. | Ensure wrapper ordering and privacy-token propagation preserve existing defenses; avoid request loops. |
| AUTH-07 | **Confirmed environment gap** | `browserSession.js` restricts DB to `sql5838929`; other Stage 6A service guards also prohibit `NODE_ENV=production` in handoff. | HTTPS staging needs explicit *test-only* environment isolation, without disabling production protection. |
| AUTH-08 | **Confirmed** | `sw.js` caches page/assets and has a versioned cache. | Old HTML/scripts and new auth module may become mixed across PWA update. Define cache lifecycle and test navigation/back-forward cache. |
| AUTH-09 | **Confirmed policy difference** | Backend distinguishes authenticated users from subscription eligibility via 403. | Do not interpret every 403 as logout. Treat subscription denials independently from JWT 401 and service 503. |
| AUTH-10 | **Unresolved** | Legacy JWTs lack new `client`, `sid`, `securityVersion` structure. | Rollout could require re-login. Plan transition and installed TNNA compatibility before final gate. |
| AUTH-11 | **Unresolved** | Source includes direct `localStorage` access to JWT throughout frontend. | Choose token storage/security policy explicitly; evaluate XSS threat model and cross-tab behavior. Refresh credential must remain HttpOnly. |
| AUTH-12 | **Unresolved** | Handoff notes unverified forwarding IP headers behind Render and potential exhaustion of global reset limiter. | Do not trust `X-Forwarded-For` blindly; evaluate operational/DoS risks and test proxy behavior. |

**Note on severity:** “High priority” above is planning priority, not a formal vulnerability severity rating. The independent engineer should assign final severity based on exploitability, impact, and actual reachable conditions.

## 5. Dependency inventory — browser pages and scripts

The audit examined all 63 top-level `.html` pages in `httpdocs` and the listed 21 `.js` files in `httpdocs/js`. The classification **Change indicated** means the file has direct storage/Bearer access or an essential account-navigation concern; it is not yet a decision to alter business logic. **Review/test** means the initial scan found no direct token reference or requires dependency tracing through scripts. The engineer should validate the inventory against the latest branch contents and all inline external scripts.

### 5.1 Login, home, and account/administration

- **Change indicated:** `login.html`, `home.html`, `subscription.html`, `SubControl.html`, `track.html`, `notificationPreferences.html`.
- **Review/test:** `register.html`, `forgotPassWord.html`, `index.html`, `ContactUs.html`, `unsubscribe.html`, `networkVerification.html`, `terms.html`, `privacy.html`.
- **New UI proposal:** account or Change Password navigation; current full-page placement is unapproved. Verify existing menus before adding one.

### 5.2 ETF Investing

- **Change indicated:** `etfCategory.html`, `etfSymbol.html`, `etfCompare.html`, `etfActivity.html`, `etfAPItest.html`.
- **Review/test:** `etf.html`.

### 5.3 Budget

**Direct storage/Bearer dependencies; change indicated:**

`budget.html`, `BMoney.html`, `BmonthBudget.html`, `BmonthDetailReport.html`, `BinForm.html`, `BinReport.html`, `BoutForm.html`, `BoutReport.html`, `BcardForm.html`, `BcardReport.html`, `BloanForm.html`, `BloanReport.html`, `BleaseRentForm.html`, `BleaseRentReport.html`, `BsubscriptionForm.html`, `BsubscriptionReport.html`, `BestimateAllowanceForm.html`, `BestimateAllowanceReport.html`, `Breports.html`.

**Review/test:** `bday.html`.

Do not modify Budget calculations or SQL behavior merely to adopt the shared auth helper.

### 5.4 Family Tree and Networking

- **Direct HTML dependency:** `FamilyTree.html`.
- **HTML review through linked JS:** `FamilyTree2.html`, `FTPerson.html`, `FTPersonNew.html`, `FTPersonList.html`, `FTPersonDuplicate.html`, `FTNetwork.html`, `FTEvent.html`, `FTContact.html`, `FTAncestor.html`, `FTAncestorChild.html`, `FTAncestorPartner.html`, `FTOneTreeMerge.html`, `FTUndoOneTreeMerge.html`, `FTPrivacyVerification.html`, `FTEmailVerification.html`.
- **Shared JS direct auth references; change indicated:** `FTPerson.js`, `FTPets.js`, `FTPersonList.js`, `FTPersonNew.js`, `FTPersonDuplicate.js`, `FTAncestor.js`, `FTAncestorChild.js`, `FTAncestorPartner.js`, `FTNetwork.js`, `FTEvent.js`, `FTContact.js`, `FTPrivacy.js`, `FTOneTreeMerge.js`, `FTUndoOneTreeMerge.js`, `FamilyTreePage.js`, `BudgetPrintDetails.js`, `usageTracking.js`.
- **Shared JS review/test:** `FTInstructions.js`, `inputSanitizer.js`, `holidays.js`, `confetti.js`.

**Special cases:** Family Tree privacy tokens, public email-ownership verification, privacy-verification endpoints, sessionStorage tree state, uploads (multipart), tree association, and Family Tree navigation. Those must not be broken by generalized fetch interception.

### 5.5 Other pages

- **Change indicated:** `Weights.html`, `weighIn.html`, `Activities.html`, `InterestEarned.html`, `amortization.html`, `propertyInfo.html`.
- **Review/test:** `TownNotice.html` (separate from TNNA native app).

### 5.6 Backend inventory to complete

- **Auth core:** `server.js`, `routes/users.js`, `services/browserSession.js`, `services/verifyAccessToken.js`, `middleware/auth.js`, `middleware/subscriptionAccess.js`.
- **Security/ops:** `services/passwordResetLimiter.js`, `services/passwordResetRateCleanup.js`, `dbConnection.js`, `send_email.js`, environment files and Render config.
- **Endpoint-level permission tracing:** `routes/subscriptions.js`, `routes/notifications.js`, `routes/track.js`, `routes/tnna.js`; also confirm protected application route semantics and Family Tree public exceptions.
- **Client dependencies:** `httpdocs/sw.js`, static asset inclusion order, PWA manifest, potentially service-worker-controlled cache.
- **TNNA:** `TNNA/public/index.html`, `TNNA/public/config.js`, Android native background/service code and online/offline token storage.
- **Tests:** all `tests/stage6a.*`, `tests/verifyAccessToken.test.js`, plus new Stage 6B–6D tests.

## 6. Recommended design (proposals, not yet approved)

### 6.1 Introduce `httpdocs/js/waAuth.js`

A single, small browser module should provide documented interfaces for:

- `restoreSession()` — restore a web JWT from the refresh cookie where available; handle public pages without forcing login.
- `getAccessToken()` — return a valid token or an explicit unauthenticated result; do not construct `Bearer null`.
- `authenticatedFetch(input, init, options)` — attach credentials to protected API requests while respecting URL origins, custom headers, content types, multipart uploads, abort signals, and non-replayable bodies.
- `refreshSession()` — call `/users/refresh-session` with same-origin credentials, origin verification and no caching; coordinate concurrent calls.
- `getSessionStatus()` — optional authenticated server-status verification where UI needs authoritative identity.
- `logout()` — revoke current session server-side, clear local browser state and publish cross-tab logout; specify behavior if server is temporarily unavailable.
- Explicit classification of 401/403/503 and notification/hook for application UI.

**Do not automatically intercept every global `fetch` as a first implementation default.** An explicit wrapper is easier to audit, especially because `FTPrivacy.js` already wraps `window.fetch`. Provide an integration pattern for existing per-file headers; preserve `X-FT-Page-Token` and upload behavior.

### 6.2 Storage policy requiring engineer decision

**Proposal:** keep refresh secrets **only** in HttpOnly cookies, as the backend does today. Decide whether access JWTs remain in `localStorage` during migration, move to memory, or use a transitional strategy. Document XSS consequences, tab synchronization, reload continuity and deployment risks. Avoid falsely claiming `localStorage` is secure against injected JavaScript. Consider whether all pages and PWA lifetimes can operate with a memory-token architecture before selecting it.

### 6.3 Safe replay requirements

A 401 may mean access JWT expiry or revoked credentials; when refresh is allowed, try once. Do not replay a non-idempotent request just because its response is 401 unless the server has unequivocally rejected the request *before mutation*. For methods such as POST and file uploads, require an idempotency strategy or an explicit non-retry policy. Preserve original request headers and data. Never retry endlessly.

### 6.4 Concurrency requirements

The backend uses single-use refresh tokens. A `Promise` single-flight guard within one page is insufficient for **multiple tabs**. Engineer should select and document a coordination mechanism (e.g. `BroadcastChannel` plus lock/leadership or a design that restores without competing rotations), with fallback behavior and handling for tab crashes, storage restrictions and simultaneous browser restoration. Preserve token-reuse detection; do not silently allow replay to solve UX races.

### 6.5 Cookie, origin, and CSRF configuration

- Keep `HttpOnly`, `SameSite=Lax`, appropriate `/users` cookie path, and `Secure` on actual HTTPS staging/production.
- Validate allowed origins explicitly with a separately configured staging origin; do not trust arbitrary `Host`/proxy headers.
- Review whether current `requireOrigin()` and CORS rules are sufficient for all state-changing cookie endpoints and account actions.
- Do not use `NODE_ENV` alone as proof that production data is safe. Use a **positive staging mode**, DB allowlist and fail-closed startup checks with secret separation.
- Keep staging and production on distinct hostnames with host-only cookies and independent JWT/refresh secrets where practical.

### 6.6 Account UI and logout

- Add Keep Me Logged In checkbox to `login.html` and pass its boolean in `/users/verify-code`; do not omit second-factor verification.
- Add a discoverable Change Password view, but first inspect existing UI and choose placement with the user.
- Logout should call `/users/logout` using a validated token, await/confirm revocation where possible, clear browser state and coordinate tabs. If backend unavailable, make the user-visible outcome precise: locally signed out versus server revocation unconfirmed.
- Account-wide reset/change should invalidate remembered web sessions and TNNA refresh credentials as currently designed; plan user notifications and offline TNNA behavior.

## 7. Staging Render test service design and isolation

**Not yet created.** Create a new service only after configuration plan is reviewed; branch `reviseLogIn`, test DB `sql5838929` exclusively. Verify actual service-tier availability/cost rather than assuming the historic free plan is offered. Before opening test access, confirm:

- Correct Git branch, repository, Node runtime, command and origin URL.
- Explicit staging environment identity and *verified* `DB_NAME=sql5838929`; fail closed if inconsistent.
- Different production/staging hostnames; `APP_PUBLIC_ORIGIN` set to staging HTTPS URL; cookie `Secure` and allowed origins correct.
- Private secrets separated; debug logging does not reveal credentials, tokens, reset links or cookies.
- Email suppression/controlled test-recipient strategy and no accidental emails to real WA users.
- Render proxy trust (`req.ip`, `X-Forwarded-For`, direct access) tested empirically; IP limiter remains supplemental pending proof.
- Reset-rate limiter global limit exhaustion and cleanup scheduler capacity monitored.
- No changes to existing production service or installed TNNA device API destinations.

## 8. Action plan, implementation order and review gates

### Gate 0 — Complete remaining design audit

1. Refresh and fingerprint the files/dumps against the same Google Drive snapshot; check current Git commit/branch separately on developer workstation (Drive does not prove live branch checkout).
2. Finish endpoint-level authorization audit for subscriptions, notifications, track and TNNA; inventory exact HTML `<script>` inclusion and per-request methods, error handlers, redirects, token mutations and cache pathways.
3. Assess JWT/Cookie storage, refresh concurrency, safe retry, Family Tree fetch interception, and test-hosted configuration.
4. Design engineer reviews proposals and signs off architectural decisions *for implementation only*.

### Group 1 — Core browser integration

Generate complete replacements (not snippets) with explicit file paths: new `waAuth.js`, revised `login.html`, `home.html`, `subscription.html`, and only the required auth/backend/config/service-worker files. Test ordinary and remembered sign-in, email verification, access expiry, refresh rotation, reopen/new tab, logout, revocation, expired and replayed refresh, 401/403/503 handling, PWA upgrades and back-forward cache.

### Group 2 — Account/admin flows

Update `track.html`, `SubControl.html`, `notificationPreferences.html`, account navigation and password-change UI. Check admin authorization, redirection, reset invalid-link experience, account-wide revocation and warning/notice emails.

### Group 3 — Application-wide integration

Update ETF, Budget, Family Tree, weights, activities, interest and property clients in coherent, tested batches. Keep business calculations and routes unchanged unless a verified auth dependency requires change. Regression-test each app's reads/writes, form uploads, navigation, subscription denial and multi-tab refresh. Preserve Family Tree privacy and public-token paths.

### Group 4 — TNNA, hosted test and acceptance

Complete isolated Render HTTPS testing, email/reset links, proxy, restart persistence, cross-device browser states, usage/subscriptions, TNNA API compatibility and offline announcement continuity. Do not change existing installed phone credentials or production routing.

### Final mandatory independent review gate

**Only after Stage 6A–6D and hosted tests finish:** assemble complete diff, architecture, SQL schema comparison/migration draft, backups and rollback/migration analysis, risk register, test logs and unresolved issues for an **independent design engineer**. Record severity-ranked findings and go/no-go advice; correct material issues on `reviseLogIn`, repeat local/hosted tests, obtain engineering recheck and **user approval** before any production decision. An implementation-time design discussion does not fulfill this gate.

## 9. Required test matrix for engineer approval

| Case | Minimum evidence |
|---|---|
| Ordinary login | Email verification, 8-hour JWT, no remembered refresh, expected expiry behavior |
| Remembered login | Opt-in only, cookie flags and scope, refresh, sliding 180 days/365 absolute cap |
| Multi-tab | Two or more tabs refreshing at once, no spurious lockout or replay acceptance |
| Browser restoration | Browser close/open, page navigation, PWA restart, stale JS asset migration |
| Logout | Server revocation confirmed, browser cleanup, second tab behavior, offline service failure |
| Change/reset password | New password enforcement, notification, revocation of all web/TNNA credentials |
| Expired / bad tokens | JWT expiry, consumed refresh, replay rejection, revoked/unknown session |
| API response codes | 401 vs subscription 403 vs DB/auth 503, correct user messages |
| Data mutation safety | POST/PUT/DELETE, duplicates not created through refresh-and-retry |
| Family Tree | Existing privacy `X-FT-Page-Token`, public verification links, person/relationship actions, file uploads |
| Applications | ETF, Budget, Weights, Activities, InterestEarned, Property, tracking and subscription checks |
| Hosted configuration | Stage-only DB, HTTPS cookie, Origin/CSRF, CORS, proxy IP trust, logs and emails |
| TNNA | Stage-specific test client, JWT compatibility, refresh revocation and screen-off/offline town announcements |
| SQL/operational | MySQL 5.5 transaction isolation, key/index compatibility, cleanup/rate limit and restart persistence |

## 10. Questions submitted to the design engineer

1. Do you endorse an explicit `waAuth.authenticatedFetch()` wrapper rather than global `window.fetch` interception? If not, how would you preserve `FTPrivacy.js`?
2. Should web access tokens remain in `localStorage` during Stage 6 transition, or move to memory/session storage? Please specify security and UX trade-offs.
3. Which cross-tab single-flight design can coexist with backend single-use refresh rotation without weakening replay defenses?
4. What precise operations are safe to retry automatically after a 401? What is the policy for non-idempotent requests and multipart uploads?
5. How should logout behave if the server revocation request fails but the browser clears local state?
6. Is existing Origin/CSRF checking sufficient for refresh, logout and account changes behind Render? What proxy configuration and tests are necessary?
7. Are global password-reset limits and cleanup capacity operationally acceptable at current quotas; what metrics/alerts should be added?
8. How should legacy WA sessions and installed TNNA access/refresh credentials transition safely at rollout and rollback?
9. What additional tests or observations are necessary before initial implementation approval and before the later independent final go/no-go review?

## 11. Deliverables requested from reviewer

- Written findings by **Critical / High / Medium / Low / Informational**, distinguishing confirmed defects from risk hypotheses.
- Recommended architecture and explicit decision record for session lifecycle, storage, retry and concurrency.
- Review of planned file-by-file scope; additions/removals to the inventory.
- Staging isolation, test-data/email, migration and rollback precautions.
- Clear acceptance criteria for Groups 1–4 and open questions requiring user decisions.
- **For the later independent final review only:** formal go/no-go recommendation after all implementation and hosted test evidence has been supplied.

---

**Change control status as of this review:** No database migration, production access, Git merge, production deployment, or Stage 6 hosted service creation authorized or performed here. Current document is a technical review aid, not a rollout instruction. Keep secrets, passwords, bearer JWTs, live reset tokens and private database connection strings out of review artifacts.
