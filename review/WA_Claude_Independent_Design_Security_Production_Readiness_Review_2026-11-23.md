# Wonderful Apps - Independent Design, Security and Production-Readiness Review

**Reviewer:** Claude (Anthropic), independent of the implementing and testing parties
**Date:** November 23, 2026
**Candidate under review:** `reviseLogIn` commit `3fadbe0` (as identified in the review brief)
**Authoritative source read:** Google Drive `My Drive/wonderfulApp` (read-only)
**Status:** **REVIEW ONLY. This document is NOT an approval, merge authorization, deployment authorization or test authorization.** The reviewer changed no source, Drive content (other than creating this one authorized file), GitHub, database, Render setting or production resource, and executed no application code.

---

## 1. Executive opinion

**Overall: CONDITIONAL / NOT YET READY.**

| Decision | Opinion | Basis |
|---|---|---|
| Continue staging work on `reviseLogIn` | **PROCEED** | Core authentication, session, administrator and environment-guard design is sound (Appendix B). Remaining work is bounded. |
| Integrate `reviseLogIn` into `main` | **NOT YET READY** | Three Family Tree authorization defects (IR-01, IR-02, IR-03) are **confirmed open in the current source** and meet the owner's own release-blocker rule. IR-02 is the easiest to exploit and, in my assessment, has a larger impact than the November 20 review stated. |
| Production deployment | **BLOCKED** | In addition to the above: no verified application-plus-database rollback, no data-conversion rehearsal, a fail-closed production environment contract that will refuse to start unless prepared (IR-07), and an unthrottled email-code second factor (IR-05). |

**What is good.** The Stage 6 authentication core is well built: live revocation on every request, hashed single-use refresh and reset tokens, transactional account locking, exact-Origin checks, fail-closed environment identity, and a dual-gate administrator model. None of the blockers below requires redesign. Each can be closed by a narrow, testable change.

**The central message.** Deferring One Tree work to `oneTreeM` is reasonable as a *feature* decision, but it does not remove the live endpoints from a production-bound branch. The smallest safe path is: fix H02 and H03 (small), place the cross-tree merge behind a server-side switch that defaults OFF (small), and leave the full capability redesign for `oneTreeM`.

---

## 2. Scope, provenance and limitations

### 2.1 What I did

- Read the root `README.md` (mandatory Section 0 onward) and the review brief in full.
- Read the following source files in full from the Drive copy: `server.js`, `dbConnection.js`, `services/stage6Environment.js`, `middleware/auth.js`, `middleware/subscriptionAccess.js`, `services/verifyAccessToken.js`, `services/browserSession.js`, `services/administratorAccess.js`, `routes/adminManagement.js`, `routes/users.js`, `services/passwordResetClientIp.js`, `services/passwordResetLimiter.js`, `httpdocs/sw.js`, `httpdocs/js/waPlatform.js`, `morgan.js`, `routes/ftPrivacy.js`, `.gitignore`.
- Searched (not read in full) `routes/familyTree.js` (about 8,500 lines; targeted reading of the One Tree, relationship, person-authorization and helper regions), `routes/tnna.js` (refresh, verify-code, admin routes), `services/subscriptionService.js` (trial and grant logic), and `httpdocs/forgotPassWord.html` (token handling).
- Read the prior M03 review (`review/WA_M03_Codex_Independent_Security_Review_2026-11-20.md`), the Change-to-Test Coverage Review and its 91-row appendix, the High-Risk Read-only Addendum, the R20 database reconciliation, and selected passages of the Production Implementation Plan.
- Ran Drive searches to check the served `httpdocs` tree for backup, SQL, environment, log and archive files, and for references to the removed `bday.html` and `images/logo.png`.
- Used `grep`/`sed` over read-only local copies of Drive files stored in the review sandbox. Nothing was executed against any application, database or hosted service.

### 2.2 What I did NOT do (limitations)

- **No tests were executed or witnessed.** Every statement about runtime behavior is derived from source or from prior written records.
- **GitHub and Render were not accessible to me.** I could not diff `main` (`d92ef54`) against `3fadbe0`, could not read the Render dashboard, and could not recompute the 91-file inventory. Whether H02/C01/H03 already exist on production `main` is therefore **unverified** (the M03 review states they are pre-existing).
- **I did not read the approved standards documents** (Core v1.0, Detailed v0.4.1, Decision Register, Delivery Process v1.1), `CLAUDE.md` or `TechSummary.md`. README Section 0 requires an explicit acknowledgement: **I acknowledge that I reviewed README.md and the review brief only, and that this report assesses security and production risk, not conformance to the programming standards.** Decisions D08 and D11 were taken from the README's summary.
- **Independence note:** I did not read `review/WA_Codex_Independent_Design_Security_Production_Readiness_Review_2026-11-23.md` before forming these findings. I did read the November 20 M03 review (it is cited in the brief) and **independently re-verified each of its findings in the current source**.
- Not read: `credentialFence.js`, `usageActivity.js`, `track.js`, `notifications.js`, `send_email.js`, `notificationService.js`, `etf.js`, `budget.js`, `weights.js`, the Budget/ETF/Weights pages, and approximately 70 other inventory files. Coverage statements for those rely on the owner's own coverage documents.
- Not read: `Stage6_OpenItems.md`, `Stage6_Render_TestPlan.md`, the H05-H50 and Group 5G hosted-evidence files, the Master Findings Register. I could not independently confirm the test results they record.
- Line numbers for `routes/familyTree.js` refer to the Drive copy last modified 2026-11-21 02:16 UTC; they match the line numbers cited in the November 20 review.

### 2.3 Version evidence

I could not compute file hashes. As corroboration only (not proof), Drive modified times of runtime files are consistent with "no operational source change after 2026-11-23 01:40 UTC": `dbConnection.js` and `services/stage6Environment.js` are the newest at that time; `routes/familyTree.js` 2026-11-21; `routes/ftPrivacy.js` and `httpdocs/js/FTOneTreeMerge.js` 2026-11-20; `httpdocs/sw.js` 2026-11-16; `routes/users.js` and `services/browserSession.js` 2026-11-11.

---

## 3. Findings

Severity is my own. "Blocks" means: blocks `main` integration (M), blocks production deployment (P), or conditional (C).

### 3.1 Release-blocking and release-conditional

| ID | Sev | Finding and evidence | Impact | Recommended control | Blocks | Authorization |
|---|---|---|---|---|---|---|
| **IR-01** | **Critical** | **One Tree cross-tree review/merge accepts a caller-chosen target (M03-C01 confirmed).** `routes/familyTree.js:7157-7188` (`GET /one-tree/review`) and `7197-7245` (`POST /one-tree/merge`): `requireTree` binds only `sourceFamilyTreeCode` to the caller; the target Tree is resolved globally from caller-supplied `targetPersonID` via `getPersonTree` (line 836). Nothing proves the request came from a legitimate `/use-existing-person` selection. Partial mitigation present: for private Persons in either Tree, `ftPrivacy.js` (`missingOneTreePrivacy`, response filter in `protection`) demands per-Person capabilities, so exposure is greatest against Trees with **no** private Persons. The production export shows only 3 `FTPersonPrivacyT` rows among 158 Persons (private state not examined), so many Trees likely have none. | An authenticated Family Tree user can review (disclosing duplicate-candidate Person data) and merge an unrelated Tree. | **Interim:** server-side switch (environment flag, default OFF in production) that rejects the cross-tree branch of review/merge **and** `POST /familytree/privacy/one-tree/unlock/:personID` (see IR-16), while preserving same-tree bridging, administrator behavior and undo of existing merges (undo routes not reviewed by me). **Proper fix (defer to `oneTreeM`):** short-lived, user-bound, single-use server capability issued only after validating a legitimate cross-tree selection, as M03 proposed. | **M, P** | Owner A-stage approval, then A-B-C-D |
| **IR-02** | **High** (I rate it the most readily exploitable of the four) | **Relationship routes accept out-of-tree Persons and self-grant Tree membership (M03-H02 confirmed, impact larger than stated).** `POST /relationships` (`4778-4901`) checks only that both Person IDs exist globally (4795-4803), then runs `INSERT IGNORE INTO FTFamilyTreePersonT (tid, related, ...)` with the caller-supplied `related` (4805-4818); `focal` is never membership-checked. `POST /related-person` (`4920-5023`) never validates `focalPersonID`. The corrected helper `addRelationshipInTree` (1050-1065) is bypassed. **Amplifier:** every person-scoped route authorizes by `FTFamilyTreePersonT` membership (`ftPrivacy.protection` calls `inTree`; `PUT /persons/:id` ~4058; `DELETE /persons/:id` ~6613; contacts, events, images). Attaching a foreign Person to one's own Tree therefore confers the same read/edit/delete path as a native member. The privacy response filter redacts only Persons flagged private, and `redactPerson` keeps names. Person IDs are sequential integers. Registration is open and (when the production settings `DevelopmentMode` and `AllowNewDevelopmentTrials` are `1`) every new account receives a Platinum trial (`subscriptionService.js:89-127`), so any registrant who can receive an email can reach Family Tree. **Chain derived from source; not executed.** | Cross-tree disclosure, modification and deletion of non-private Persons (living people's personal data) by ID enumeration. | Validate membership of **both** `focal` and `related` in the authorized Tree before the first write in both routes (reuse `treeHasPerson`); remove the membership `INSERT` from `/relationships` or confine it to the `/use-existing-person` flow; reject before any write. Regression scope: callers include `FamilyTree.html`, `FamilyTree2.html`, `FamilyTreePage.js`, `FTOneTreeMerge.js` and others. Confirm no legitimate flow attaches a non-member via `/relationships`; if one does, route it through `/use-existing-person`. | **M, P** | Owner A-stage approval, then A-B-C-D |
| **IR-03** | **High** | **Extra unreviewed `same` decisions can merge arbitrary Person pairs (M03-H03 confirmed).** The route validates only decisions for server-generated groups (`7245-7280`); `mergeTreesOneTree` (`3310-3345`) iterates every `same` entry in the raw `decisions` array and checks only that each pair belongs to the newer/older Trees, then merges and deletes the newer Person. | Within a permitted two-tree merge, a manipulated request merges unrelated Persons and deletes a Person record. | Build the allowed decision set from the freshly rebuilt server review; reject unknown, duplicate or extra `newerPersonID` entries; pass only the normalized list to snapshot and merge. Small change. | **M, P** while cross-tree merge is enabled | As above |
| **IR-04** | Medium | **Privacy-state race (M03-M04 confirmed by reading `missingOneTreePrivacy`).** The check reads private Persons and unlock rows without locking, then the merge performs many writes. | A Person made private mid-operation could be merged without the new capability. Source-confirmed window; no runtime race demonstrated. | Moot if IR-01's interim switch keeps cross-tree merge OFF. Otherwise: deterministic lock order and in-transaction revalidation, plus one controlled concurrency test. | C (only if merge enabled) | As above |
| **IR-05** | **High** | **Email-code second factor has no attempt limit; password login is unthrottled.** `routes/users.js` `POST /login`: no throttle or lockout. `POST /verify-code`: 6-digit code (`crypto.randomInt`), 10-minute TTL, a wrong code returns 401 with **no counter and the challenge stays valid**. `routes/tnna.js` `/verify-code` follows the same pattern (no attempt, limit or count logic found in lines ~134-200). An attacker holding a correct password obtains a `tempToken`, can iterate codes within the window, and can request fresh challenges (each emails the victim). The same codebase already rate-limits Family Tree unlock (5 attempts per 15 minutes) and password reset, so the pattern exists but is not applied to primary login. Also: `/login` returns before `bcrypt` for unknown usernames (timing enumeration, Low). | Second factor can be defeated by guessing once the password is known (credential stuffing). | Per-challenge failed-attempt counter (for example 5, then invalidate), plus a per-username/IP throttle on `/login`; apply to both web and TNNA. May need a small schema change (a column on `LoginVerificationT`) or an in-memory interim; owner decision. Est. 3-5 h with tests. | C (fix, or documented owner risk acceptance, before production) | Owner A-stage approval; schema change is a Workstream B item |
| **IR-06** | Medium | **HTTP caching defeats the "network-first" claim for `waPlatform.js`.** `server.js` sets `express.static(..., { maxAge: '1d' })` and overrides cache headers only for `.html`, `manifest.json` (content type only) and `sw.js`. All other JS/CSS/images, including `/js/waPlatform.js`, are served `public, max-age=86400`. `httpdocs/sw.js` fetches network-first with `fetch(request)` in default cache mode, which can be satisfied from a fresh HTTP-cache entry without contacting the server. With `skipWaiting()` and `clients.claim()`, new no-cache HTML can run with up to 24-hour-old JavaScript, on deploy **and** on rollback. The Addendum F3 states `waPlatform.js` is network-first; that holds at the service-worker layer only. Related: `install` uses all-or-nothing `cache.addAll` (one missing listed URL leaves the old worker in place). | Mixed-version failures (login, session restore, API contract) for up to a day after deploy or rollback. | `Cache-Control: no-cache` for `/js/*` and `manifest.json` (or versioned asset URLs); run the local mixed-version rehearsal (Test T5); verify every URL in `urlsToCache` returns 200 (Test T4). Est. 1 h plus tests. | C (before production) | Owner A-stage approval |
| **IR-07** | **High** (deployment hazard) | **Production environment contract is fail-closed and the merge may itself trigger a deploy.** `services/stage6Environment.js`: production mode refuses to start unless all of the following hold: `WA_PRODUCTION_RELEASE_GATE=owner-authorized`; `NODE_ENV=production`; DB host exactly `morty2.heliohost.org` port 3306; `WA_PRODUCTION_DB_NAME` and `_USER` match `^wapps_[a-z0-9_]+$` and are **not** `wapps_test`, `wapps_production`, `wapps_h109_test` or `wapps_r20_production`; `DB_SSL=required`; `DB_CONNECTION_LIMIT` 1-5; `APP_PUBLIC_ORIGIN`, `PUBLIC_BASE_URL`, `WA_PRODUCTION_ORIGIN` all equal and HTTPS; `WA_ALLOWED_ORIGINS` is exactly that one origin. The merged code also requires the **new** schema (`UserSecurityT`, `WebSessionT`, and others) and `JWT_SECRET`/`ADMIN_USERNAME`. If production Render `wapps` auto-deploys `main` (not verifiable by me), a merge onto the existing 66-table database will fail to start or lock out every login. Also: the credentialed origin is single; users reaching production by a second hostname get failing session calls. The guard compares environment variables to environment variables, so it detects inconsistent configuration, not a wrong-but-consistent database. | Production outage at merge; confusing recovery. | Before merging, confirm in the Render dashboard that `wapps` auto-deploy from `main` is **off**; prepare a reviewed production environment checklist and keep the previous environment values saved; choose a production database name not on the blocklist (the Transition Plan's naming must be checked against it); confirm the canonical production origin and redirect any alias. | **P** (and **M** unless auto-deploy is off) | Owner action (read-only dashboard check) |
| **IR-13** | Medium to High | **Data-conversion hazards that cause outage if missed (Workstream B gates).** (a) Every account needs a `UserSecurityT` row or authentication fails (`verifyAccessToken.js` returns `ACCOUNT_CREDENTIALS_REVOKED`; `browserSession.securityVersion` throws `USER_SECURITY_MISSING`). (b) `UsersT.IsAdministrator` and `ADMIN_USERNAME` must both be right or there is no administrator. (c) Open `LoginVerificationT` rows lack `SecurityVersion`. (d) Legacy JWTs intentionally fail: all web users must log in again; TNNA refresh tokens remain valid (same table, `tnna.js /refresh`) provided `UserSecurityT` exists, but whether the native app falls back to `/tnna/refresh` on 401 is not evidenced in what I read. (e) `AdminSubscriptionGrantT` (12 rows) is no longer read by `subscriptionService.js` (no references found); its meaning needs owner disposition. (f) `SystemSettingsT` values for `DevelopmentMode`, `AllowNewDevelopmentTrials` and `DevelopmentTrialDays` decide whether new users receive a Platinum trial; confirm production values deliberately. (g) 63 vs 62 foreign-key statements differ between dumps. (h) Decide whether `JWT_SECRET` is kept (rollback-friendly) or rotated deliberately. | Total login lockout, no administrator, unintended free entitlements. | Cover each item in the cutover rehearsal and runbook (Section 5, Test T7). | **P** | Separate Workstream B approvals |

### 3.2 Material but deferrable (with owner acceptance recorded)

| ID | Sev | Finding and evidence | Impact | Recommended control | Blocks |
|---|---|---|---|---|---|
| **IR-08** | Medium | **Administrator transfer** (`routes/adminManagement.js`). Design is strong: web-only, exact Origin on state-changing routes, current-password re-check, session binding (`InitiatorSessionPublicID`), 256-bit one-time token stored hashed with timing-safe comparison, `FOR UPDATE` locking on the control row and both accounts, audit rows, cancel only after Render is restored, completion only after Render matches the target. Gaps: (1) `/prepare` has no attempt limit on the password re-check (needs a valid administrator access token first); (2) the target is not checked to be login-capable (for example, has a `UserSecurityT` row), so a completed transfer to an unusable account leaves **no** working administrator; (3) failed attempts are not audited; (4) after `/complete`, recovery is manual (restore `IsAdministrator` by SQL and `ADMIN_USERNAME` in Render); (5) no hosted state-changing evidence. | Administrator lockout is possible but owner-recoverable. | **Acceptable as documented** if the production runbook states that transfers are break-glass only until a staging round trip has been done, and includes the manual recovery steps. A hosted staging round trip (prepare, Render switch, complete, plus a cancel path) is cheap and safe on staging but is **not** required for release. Add target validation and an attempt limit later. | No |
| **IR-09** | Medium (availability) | **Reset rate limits are shared in production.** `passwordResetClientIp.js` never trusts `X-Forwarded-For`, and trusts `CF-Connecting-IP` only when the origin is the hard-coded staging origin. In production the key is the socket peer, i.e. the Render proxy, so the per-IP bucket (20 per hour) is effectively global, as is the global bucket (100 per hour). Email bucket is 5 per hour. | Any 20 requests in an hour can block password reset for everyone; an attacker can keep a known email throttled. Not a bypass. | Accept for a 17-user system and state it in release notes; revisit with real traffic. | No |
| **IR-10** | Medium | **No application-level security headers** (no `helmet`, `frame-ancestors`/`X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`, HSTS) in `server.js`. Access token lives in `localStorage` (known; D08). Clickjacking is relevant to administrator pages and the privacy approval page. Reset-link handling is good: `forgotPassWord.html` has `<meta name="referrer" content="no-referrer">`, strips the token with `history.replaceState`, and loads no third-party resources. | Reduced defense in depth. | A small headers-only middleware (frame-ancestors `'self'`, Referrer-Policy, nosniff, HSTS). Defer CSP. Est. 1-2 h. | No (recommended before production) |
| **IR-11** | Low to Medium | **Unvalidated input types in `/login`.** `username` and `password` are used directly (`pool.query('... WHERE UserName = ?', [username])`) with `express.json()` and `urlencoded({ extended: true })`. This is known `mysql2` `query()` behavior (object parameters expand into column expressions). Practical effect here is limited because the password must still match, but it shows a pattern that may exist elsewhere. Not executed. | Input-hygiene gap; possible systemic pattern. | Type-check `/login` inputs; one targeted static scan (1-2 h) of `.query(` calls that receive raw `req.body`/`req.query` values across routes. | No |
| **IR-12** | Low | **Refresh-token reuse is not treated as compromise** (`browserSession.rotate`, `tnna.js /refresh`): a replayed consumed token gets 401 but the session chain is not revoked, so a thief who rotates first keeps a live chain. | Slower detection of token theft. | Document the accepted design or revoke the session on reuse. | No |
| **IR-14** | Low | **Connection pool headroom.** Hosted limit is 5, `queueLimit: 0`, no acquire timeout; each authenticated request issues 2+ queries; `bcrypt` runs while a transaction and row locks are held (login, change/reset password, admin prepare). Fine for about 17 users. | Latency pile-up under bursts. | Optional bounded concurrency smoke on staging; consider a finite `queueLimit`. | No |
| **IR-15** | Low | **Hygiene.** Stale comments (`verifyAccessToken.js` "NOT wired into routes yet"; `waPlatform.js` "no existing WA page loads this script yet"). `authenticateToken` (`subscriptionAccess.js`) ignores the error argument that `auth` can pass to `next`; effectively unreachable because `users.js` exits at startup if `JWT_SECRET` is unset. `httpdocs/etfAPItest.html` is a test page in the public web root (confirm it is intended, authenticated and non-sensitive, or exclude it). Consider a minimum `JWT_SECRET` length check. | Maintainability and minor exposure. | Fix opportunistically in the next approved edits. | No |
| **IR-16** | Medium | **`/one-tree/unlock` and plaintext keys.** `ftPrivacy.js` `POST /one-tree/unlock/:personID` lets a user attempt privacy codes on Persons in an arbitrary target Tree (membership is checked against the source Tree or the globally resolved target). Attempts are limited to 5 per 15 minutes per (Person, user), so several accounts multiply the guesses; codes may be as short as 4 characters. Codes are stored in plaintext (`FTPersonPrivacyT.KeyCode`, `FTPrivacyRequestT.ProposedKeyCode`) and compared without constant-time comparison; the root SQL dumps therefore hold them. | Weak protection of private Persons in the cross-tree flow; combines with IR-01. | Disable together with IR-01's switch; hash keys and tie unlock to a legitimate operation in `oneTreeM`. | Covered by IR-01 |
| **IR-17** | Low | **Public endpoints** `POST /send-email` (no rate limit or bot control) and `/api/geocode` (cost exposure) are intentional and deferred under D11. | Spam/cost abuse. | Keep monitored; revisit post-release. | No |

### 3.3 Source and publication hygiene (brief question 8)

- **Confirmed (Drive copy):** a Drive search of `httpdocs/` found **no** files named `*_COPY*`, `.sql`, `.env`, `.bak`, `.zip`, `.md`, `.log`, `.map`, `.csv`, `.txt` or `.ps1`. The brief reports zero tracked `_COPY` files under `httpdocs/` at `3fadbe0`; I could not check GitHub.
- `.gitignore` excludes `*Dump.sql`, `.env*`, `logs/`, `*.bak`, signing material and TNNA APKs. **Owner check:** run `git ls-files | grep -i dump` once, because `.gitignore` does not untrack files committed earlier.
- **Removed assets:** Drive full-text searches found no reference to `bday.html` in runtime `.html`/`.js`/`.json` files (excluding `_COPY`) and none to `images/logo.png` in `httpdocs/`. `sw.js` v11 does not list `bday.html`. Drive full-text indexing can be incomplete, so a final `grep -r` in the repository is still advisable. Production's `sw.js` v9 references `/bday.html`; the v9-to-v11 upgrade removes that cache entry on activate.
- **Static-served risk:** `express.static` serves everything under `httpdocs/`, so it should contain only runtime assets. `etfAPItest.html` is the one test-like page I noticed (IR-15).

---

## 4. Change-to-test coverage assessment

### 4.1 Inventory accuracy (brief question 1)

- I could not recompute the 91-path inventory (no repository access). Every operational file I examined appears in it, and its structure (77 modified, 13 new, 1 removed; `_COPY` and image assets excluded) is plausible. **Update the commit label from `72b8ee0` to `3fadbe0`** and re-add the `_COPY` deletion count to the ledger.
- The inventory's evidence classes are honest: no row claims exhaustive hosted testing of the individual file. I agree with its caution and with not requiring a hosted test per file.

### 4.2 Evidence recency matters

Drive modified times show that several security-critical files changed **after** the hosted evidence that is cited for them:

| Evidence | Date / commit | Files changed afterward (Drive modified time) |
|---|---|---|
| H05-H50 hosted | Oct 31, `09ece26` | `routes/users.js`, `services/browserSession.js` (Nov 11); `sw.js` (Nov 16) |
| Group 5G hosted (reset, change, TNNA rotation) | Nov 3, `f023cc3` | same as above, plus `subscriptionService.js` (Nov 19), `ftPrivacy.js` (Nov 20), `familyTree.js` (Nov 21) |
| R20 login / Weights / logout | Nov 22, `72b8ee0` | covers `dbConnection.js` and `stage6Environment.js` compatibility only |

README states that later bounded passes exist (R10, R14, R15, R16-75 T12 90/90 offline, hosted T06 3/3). I did not read those records. The `browserSession.js`/`users.js` revision of Nov 11 (a concurrency-oriented change to refresh rotation) is the one I would want covered on the final commit, which is why Test T3 below is a short smoke and not a rerun.

### 4.3 Accepted without repetition

Preserve and do not repeat: R10, R14, R15 bounded passes; R16-75 T12 90/90 offline; hosted T06 3/3; the 40/40 offline compatibility assertions; the login / Weights / logout check at `72b8ee0`; the Group 5G password and TNNA rotation evidence for the behaviors it exercised. I see no reason to rerun any of these absent the specific regression reasons given in Section 7.

### 4.4 Missing high-risk assertions

1. Routed **HTTP** negative tests for IR-02, IR-03 and IR-01 with zero-write assertions (the prior 9/9 and 7/7 checks exercise extracted helpers, not the real handlers).
2. Attempt-limit behavior for the login code (IR-05), once implemented.
3. HTTP-cache and header behavior on Render (IR-06, IR-10), which no test records.
4. Mixed-version (old to new, new to old) browser behavior (S6-024 remains PARTIAL).
5. Unauthenticated-access matrix across all mounted prefixes on the final commit.
6. Credential-lifecycle smoke on the final commit (Section 4.2).
7. Data-conversion rehearsal (Workstream B), not part of R20.

---

## 5. Database, rollback and One Tree disposition

### 5.1 Production migration is separate work

I agree it must remain **Workstream B**, and I endorse the owner-approved design of building a **new** production database from the tested schema and converting data into it. That choice leaves the existing production database untouched and gives the project a real rollback target. Mandatory before cutover (not deferrable): IR-13 items (a)-(h), and a rehearsal on a disposable database that logs in, as a minimum, the administrator, one ordinary user and one TNNA user.

### 5.2 Restore versus rollback

The successful restore of the production dump into a disposable database proves the **old** schema is recoverable. It does not demonstrate: conversion to the 72-table shape; application-plus-database rollback after new writes; or token and session behavior across a rollback. Specifically:

- **Rolling back after cutover** means repointing the environment to the old database and redeploying the previous `main` commit. The old database stays frozen at cutover time, so writes made in the new database afterwards are **lost unless exported and replayed**. Decide in advance between a write freeze, a short accepted loss window, or a replay plan.
- If `JWT_SECRET` is unchanged, tokens issued by the new code remain structurally acceptable to the old code; if it is rotated, every client must log in again on rollback too.
- Rolling back leaves the older, less safe service-worker behavior in clients (v9/v10 caches), as S6-024 notes.
- No rollback has been rehearsed (the Implementation Plan says so), so none can be called verified.
- Save the previous Render environment values before cutover; `WA_PRODUCTION_RELEASE_GATE` should be the **last** variable set.
- Render free-tier cold starts (tens of seconds) matter only if `wapps` runs on that tier; the first TNNA request after sleep may time out, and the app should retry via refresh. I did not see evidence of the tier.

### 5.3 One Tree: deferred feature versus open exposure

| Finding | Status in current source | Recommended disposition |
|---|---|---|
| C01 | **Open** (confirmed) | Interim server-side switch OFF; full fix in `oneTreeM` |
| H02 | **Open** (confirmed; impact higher than reported) | Fix before merge |
| H03 | **Open** (confirmed) | Fix before merge, or cross-tree merge OFF |
| M04 | **Open** (confirmed unlocked read) | Moot while cross-tree merge is OFF |

**Can the branch safely enter `main` while these endpoints remain present?** Not under the owner's own release rule (README Sections 0, 5 and the deferred One Tree note). The M03 review states the defects are pre-existing, so merging may not worsen production's current exposure, but that is **unverified by me**. The owner should diff the four handlers between `main` and `reviseLogIn`; if identical, production carries the exposure today, which argues for fixing H02/H03 promptly regardless of the merge timeline.

---

## 6. Prioritized recommendations

Estimates are mine, for human effort including tests, and are not commitments.

### 6.1 Release-blocking (before `main` integration or production, as marked)

| # | Action | Est. | Gate |
|---|---|---|---|
| 1 | IR-02: membership validation in `/relationships` and `/related-person`; remove or confine the membership insert; HTTP negative tests (T1) | 2-3 h | M |
| 2 | IR-03: server-normalized decision list; HTTP negative test | 1-2 h | M |
| 3 | IR-01: server-side switch (default OFF) for cross-tree review/merge and `/one-tree/unlock`; preserve same-tree, administrator and undo behavior; UI shows a clear "unavailable" message | 2-3 h | M |
| 4 | IR-07: verify Render `wapps` auto-deploy is off; production environment checklist; database name versus blocklist; canonical origin | 0.5-1 h | M/P |
| 5 | Fresh independent review of the **exact final hashes** after items 1-3 (required by README and the M03 conclusion) | 2-4 h | M |
| 6 | IR-05: attempt limiting on login code and password login, web and TNNA (or recorded owner risk acceptance) | 3-5 h | P |
| 7 | IR-13 / Workstream B: conversion rehearsal, runbook, rollback decision (write freeze or accepted loss window) | largest item; not estimated here | P |

### 6.2 Conditional before production

- IR-06 cache headers plus local mixed-version rehearsal (T4, T5): about 4-5 h.
- IR-08 production runbook text for administrator transfer (no hosted transfer test required): about 1 h.
- IR-10 minimal security headers: 1-2 h (recommended).

### 6.3 Safely deferred (record owner acceptance)

IR-04 (while merge is OFF), IR-09, IR-11 scan, IR-12, IR-14, IR-15, IR-16 (covered by the switch), IR-17, full capability design (`oneTreeM`), key hashing, CSP, token-storage modernization (D08).

### 6.4 Effort versus the 40-hour ceiling

Items 1-6 plus 6.2 are roughly 17-27 hours of development and test effort. That alone fits the ceiling, but **Workstream B (item 7) and the final re-review are what threaten it.** I recommend the owner explicitly reassess the ceiling for Workstream B rather than let it silently consume the remainder.

---

## 7. Required additional tests (only those necessary)

Every test below needs explicit owner authorization where it touches state. None was run by me.

| ID | Type and environment | Prerequisites | Procedure (planning level) | Expected result | Side effects and cleanup |
|---|---|---|---|---|---|
| **T1** | Offline, mocked `pool`, routed HTTP (supertest) | Items 1-3 implemented | For `/relationships`, `/related-person`, `/one-tree/merge`: submit out-of-tree `focal`/`related`, extra `same` decisions, and an arbitrary `targetPersonID`; assert status and **zero writes**; assert legitimate same-tree and (if enabled) legitimate cross-tree flows still pass | All negatives rejected before the first write; positives unchanged | None |
| **T2** | Local isolated test DB, **only if** cross-tree merge stays enabled | Owner authorization; synthetic data | One full merge and undo; one concurrent privacy-change versus merge case | Consistent final state; privacy honored | Synthetic data only; drop afterwards |
| **T3** | Hosted smoke on Render staging at the final commit | Staging DB identity log verified | Non-remembered login and logout; remembered login, one refresh rotation, logout; replay of the old refresh cookie value returns 401 | As designed; no mutation beyond sessions | Sessions created in `wapps_test`; logout revokes them |
| **T4** | Render staging, **read-only HTTP probes** | None | (a) `Cache-Control` of `/js/waPlatform.js`, `/manifest.json`, `/sw.js`, `/home.html`; (b) security headers; (c) every `urlsToCache` path returns 200; (d) unauthenticated requests to `/weights`, `/activities`, `/weightActivities`, `/interestEarned`, `/budget`, `/etf`, `/familytree`, `/subscriptions`, `/admin-management`, `/tnna/admin/users` return 401; (e) `POST /users/refresh-session` and `/users/logout` with missing and foreign `Origin` return 403 | Matches design; any mismatch becomes a finding | None; no credentials in logs |
| **T5** | **Local** real-browser mixed-version rehearsal (same origin `http://localhost:8080`) | Local mode per README; `main` run against a disposable database restored from the production-shaped dump; candidate against the staging-shaped database | Load and log in with `main` (SW v9); stop it; start the candidate on the same origin; observe SW activation, cache cleanup, legacy-token handling and no stale auth module; then reverse (rollback) | Clean redirect to login; no broken pages; v11 caches created/removed as designed | Local only; discard browser profile and databases |
| **T6** | Offline | IR-05 implemented | Wrong-code attempts invalidate the challenge after the limit; throttle on login; TNNA variant | Limits enforced; normal login unaffected | None |
| **T7** | Disposable database (Workstream B) | Owner-approved conversion plan | Convert a copy of production data; boot the candidate with the production environment contract against it; log in administrator, ordinary user, TNNA refresh with a pre-cutover refresh token | All succeed; administrator recognized; no lockout | Disposable database only |
| **T8** | Post-deploy production checklist (when ever authorized) | Approved window, rollback ready | Startup log shows verified identity; owner login; administrator check; one TNNA refresh; error-log review; rollback trigger criteria | Healthy | Minimal real-user effect |

Not required: a hosted administrator-transfer round trip (optional), a full Android device regression (only the single TNNA refresh in T7/T8), and reruns of accepted R10/R14/R15 suites.

---

## 8. Release-gate conclusion

**Done:** the Stage 6 authentication, session, environment-guard and administrator designs are sound and well covered at a bounded level; repository and served-directory hygiene on Drive looks clean; the owner's coverage ledger is honest about its limits; database differences are inventoried.

**Blocks completion of this review:** I have not seen GitHub `main` or the Render configuration, and I have not read the standards or the later hosted-evidence records. A fresh review of the exact final file hashes after the IR-01 to IR-03 correction is required.

**Requires owner decision or sign-off:** (1) the IR-01 interim switch versus full redesign now; (2) acceptance or fix of IR-05; (3) Workstream B scope, the rollback model (write freeze or accepted loss window) and the 40-hour ceiling; (4) whether production `JWT_SECRET` is kept; (5) the production values of `SystemSettingsT` trial settings.

**Owner inputs that would sharpen this report (not blocking its use):** Render `wapps` auto-deploy setting and current production origin; diff of the four Family Tree handlers between `main` and `reviseLogIn`; whether any UI flow depends on `/relationships` attaching a non-member; whether the native app retries via `/tnna/refresh` on 401; output of `git ls-files | grep -i dump`.

**Before integration into `main`:** items 1-5 of Section 6.1 completed and retested (T1, T4), IR-07 auto-deploy confirmed off, and the owner's dispositions recorded.
**Before production release:** additionally IR-05, IR-06, IR-13/Workstream B with a successful rehearsal (T7), a written and understood rollback plan, and a separate explicit go decision.

**This report is not authorization to commit, merge, deploy, migrate data or run any test.**

---

## Appendix A. Short answers to the brief's nine questions

1. **Coverage sufficiency:** Inventory plausible, not recomputed. Evidence is adequate for the bounded behaviors it exercised; gaps are the HTTP negative tests, cache/headers, mixed-version behavior and final-commit credential smoke. Smallest set: T1, T3, T4, T5 (plus T6 and T7 when their prerequisites exist).
2. **Critical authorization:** C01, H02, H03, M04 are all still open in current source. The branch should not enter `main` with them live; narrow mitigation is in IR-01 to IR-03.
3. **Administrator transfer:** well designed (IR-08). Hosted state-changing test is not necessary for release; document break-glass use and recovery.
4. **Authentication and session:** token lifecycle, cookies (`HttpOnly`, `Secure` in staging/production, `SameSite=Lax`, path `/users`), exact Origin, hashed single-use tokens and logging are good. Gaps: IR-05 (code attempts), IR-09 (proxy IP provenance), IR-12 (reuse), IR-10 (headers). Real hosted negative Origin/cookie probes are covered by T4(e).
5. **PWA:** IR-06 is the key finding; do not label upgrade or rollback as PASS until T5 is run.
6. **Operational rollback:** staging and production separation is credible (fail-closed contract). Rollback is not verified; see Section 5.2 and IR-07.
7. **Database:** mapping is good at inventory level; mandatory gates are IR-13; everything else belongs to Workstream B.
8. **Hygiene:** Section 3.3.
9. **Release decision:** Section 1 and Section 8.

## Appendix B. Strengths to preserve

- JWT algorithm pinned to HS256; live `SecurityVersion` and session checks on every request; database outage fails closed (503).
- Refresh and reset tokens are CSPRNG, stored hashed, single-use, bound to `SecurityVersion`, with transactional account locking; password change and reset revoke all sessions and TNNA tokens.
- Generic password-reset responses; reset page uses no-referrer and removes the token from the URL; Morgan and the central error handler omit URLs and exception text.
- Service worker bypasses requests with `Authorization`, non-GET requests and all API paths; HTML is not cached under query-string tokens.
- Environment guard is fail-closed with TLS, pool and origin constraints; administrator model requires both the database flag and the configured username.
- `.gitignore` coverage for dumps, environment files, logs and signing material.

## Appendix C. Files inspected

Read in full: `README.md`, review brief, `server.js`, `dbConnection.js`, `services/stage6Environment.js`, `middleware/auth.js`, `middleware/subscriptionAccess.js`, `services/verifyAccessToken.js`, `services/browserSession.js`, `services/administratorAccess.js`, `routes/adminManagement.js`, `routes/users.js`, `services/passwordResetClientIp.js`, `services/passwordResetLimiter.js`, `httpdocs/sw.js`, `httpdocs/js/waPlatform.js`, `morgan.js`, `routes/ftPrivacy.js`, `.gitignore`, the M03 review, the Coverage Review (with Appendix A), the High-Risk Addendum, the R20 Database Reconciliation.
Searched or partially read: `routes/familyTree.js`, `routes/tnna.js`, `services/subscriptionService.js`, `httpdocs/forgotPassWord.html`, `docs/Stage6_Production_Implementation_Plan.md`.
