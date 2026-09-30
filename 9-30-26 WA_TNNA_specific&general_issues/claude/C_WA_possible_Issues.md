# Design Review: Other Issues Needing Attention in WA and TNNA

**Companion to:** `TNNA_Node_NVM_Design_Engineer_Response.md`
**Projects:** Wonderful Apps (WA) / Town Notification Native App (TNNA)
**Date:** September 30, 2026
**Status:** Recommendations for owner review.

---

## 0. Evidence and limits

**Reviewed:** `CLAUDE.md` and `TechSummary.md` (Sept 28, 2026) and `TNNA_Node_NVM_Technical_Review.md` (Sept 30, 2026).

**Not reviewed:** any source code, `package.json`, `.env`, the SQL dump, the Render dashboard, or the running system. Every finding is inferred from the documentation. Each one carries:

- **Evidence:** what in the documents led to the finding.
- **VERIFY:** the specific thing to check in code or configuration before acting.

Severity uses **High / Medium / Low**. "Blocks TNNA" means it should be decided before native screens are built. Store-policy items (Google Play) change over time; check current policy before submission.

---

## 1. Priority summary

| ID | Area | Issue | Severity | Blocks TNNA |
|---|---|---|---|---|
| T1 | TNNA | The Town Notice data model and API are not documented anywhere | High | **Yes** |
| T2 | TNNA | API base URL: `window.location.origin` breaks inside the WebView | High | **Yes** |
| T3 | TNNA | CORS allowlist does not include the app's WebView origin | High | **Yes** |
| T4 | TNNA | Login requires an emailed code every 8 hours; token stored in `localStorage` | High | **Yes** |
| T5 | TNNA | No push-notification channel; needs new tables and service work | High | **Yes** |
| T6 | TNNA | Two production hosts, an unstable `onrender.com` name, and a permanent `appId` | High | **Yes** |
| T7 | TNNA | Store compliance: account deletion, privacy, billing dead end | High | Before release |
| T8 | TNNA | Native security hardening not yet defined | High | Before release |
| T9 | TNNA | WebView behavior: service worker, safe areas, theming | Medium | Yes |
| T10 | TNNA | No API versioning or forced-upgrade mechanism | Medium | Before release |
| T11 | TNNA | Deep links: `.well-known` files and static-serving defaults | Medium | Before release |
| T12 | TNNA | Repo layout: `.gitignore`, Render redeploys, secrets | Medium | **Yes** |
| W1 | WA | MySQL 5.5 is unsupported; transport encryption unknown | High | No |
| W2 | WA | No automated tests | High | No (but enables safe change) |
| W3 | WA | Possibly unauthenticated endpoints; no rate limiting or security headers documented | High | Before release |
| W4 | WA | Admin identity based on user ID 1 or a username | Medium | No |
| W5 | WA | No token revocation | Medium | Before release |
| W6 | WA | Tokens in URLs may reach logs and referrers | Medium | No |
| W7 | WA | Schema changes not source-controlled | Medium | Yes (new tables) |
| W8 | WA | Runtime and dependency governance | Medium | No |
| W9 | WA | Hosting: cold starts, scheduled dispatch, ephemeral logs | Medium | Before release |
| W10 | WA | Documentation drift and duplication | Low | No |
| W11 | WA | Family Tree personal-data posture | Medium | Before release |
| W12 | WA | `familyTree.js` size and maintainability | Low | No |

---

## 2. TNNA issues

### T1. The Town Notice feature is not described in the documentation (High, blocks TNNA)

**Evidence.** `AppT` lists `town_notice` (Standard plan, development available). But the route table has no Town Notice module, and none of the 56 tables looks like a town, notice, or follow-a-town table. The route list names `activities`, `budget`, `etf`, `familyTree`, `geocode`, `interestEarned`, `notifications`, `subscriptions`, `track`, `users`, `weightActivities`, `weights`. `CLAUDE.md` says the documents describe current implemented behavior.

**Why it matters.** TNNA is described as a native version of the Town Notification app, but I cannot tell from the documents what a "notice" is, who creates it, or where it is stored. A native notification app needs a defined data source before anything else.

**Questions to answer (and then document):**

1. Is Town Notice today a front-end-only page (for example, a static page or a call to an external feed)? Or does it have a route and tables not listed?
2. Who authors notices: an administrator, town officials, users, or an external feed (RSS/CAP/email)?
3. Is a user tied to one town or several?

**Suggested minimum model if it is new** (MySQL 5.5 compatible, `utf8mb4`, `UserID` ownership rules preserved):

```text
TownT                 TownID, Name, Region/StateCode, Timezone (IANA), Active
TownNoticeT           NoticeID, TownID, Title, Body, Severity, Category,
                      EffectiveAt, ExpiresAt, CreatedByUserID, CreatedAt (UTC)
UserTownFollowT       UserID, TownID, CreatedAt   (unique on UserID+TownID)
TownNoticeDeliveryT   NoticeID, UserID, Channel, Status, AttemptedAt
```

Route it through `requireAppAccess('town_notice')` and the central notification service, like the other subscription-controlled apps.

### T2. `window.location.origin` will point at the wrong server (High, blocks TNNA)

**Evidence.** `CLAUDE.md` tells developers to use `window.location.origin` or the existing base-URL pattern instead of hard-coding a host.

**Problem.** Inside a Capacitor Android WebView the page origin is the app's own local server (by default `https://localhost`), not WA. Any shared front-end code that builds API URLs from `window.location.origin` will call the wrong place.

**Recommendation.**

- Introduce a single `apiBase` constant, loaded before any page script. On the web it resolves to `window.location.origin`. In TNNA it is the production API host.
- Never let pages build API URLs on their own.
- **VERIFY:** search the front end for `location.origin`, `location.host`, and hard-coded hosts in `httpdocs/` and `httpdocs/js/`.

### T3. CORS will block the app (High, blocks TNNA)

**Evidence.** Allowed origins in `server.js`: `http://localhost`, `http://localhost:8080`, `https://wapps.helioho.st`, `https://wapps-ypez.onrender.com`.

**Problem.** The default Capacitor Android origin is `https://localhost` (note **https**). It is not in the list. The origin `http://localhost` in the *production* list is also a development convenience that ships to production.

**Recommendation.**

- Add the app's WebView origin.
- Move the allowlist to environment configuration, with a separate development list and a stricter production list.
- Alternatively, enable Capacitor's native HTTP plugin so requests bypass WebView CORS. A correct allowlist is still worth having.
- **VERIFY:** test one real API call from the debug APK before writing more screens.

### T4. Authentication model is not mobile-ready (High, blocks TNNA)

**Evidence.** Final JWT lasts 8 hours, is issued after an emailed verification code, and is stored in browser `localStorage`. No refresh token is documented.

**Problem.**

- A notification app should not ask users for a new emailed code every 8 hours. People will churn.
- `localStorage` inside a WebView is readable by any script in the page and, by default, included in Android's backup (see T8).

**Recommendation.**

- Add a **device-bound refresh session**: a `UserDeviceT` (or `UserSessionT`) table with a hashed refresh token, device label, last-seen, and revoke flag. Access tokens stay short-lived.
- Offer a "trust this device" option that skips the emailed code for a bounded period (for example, 30 days), while still requiring it on new devices.
- In TNNA, keep the refresh token in Android Keystore-backed secure storage (a Capacitor secure-storage plugin), not `localStorage`.
- Optional: biometric unlock on top of the stored session.
- Keep the backend authoritative (per `CLAUDE.md`): the refresh path must re-run subscription and ownership checks.

### T5. There is no push channel (High, blocks TNNA)

**Evidence.** The notification system covers email (Resend) and preference fields for SMS. Categories: `ACCOUNT`, `SUBSCRIPTION`, `APP_NOTICE`, `FAMILY_TREE`, `MARKETING`. No push, no device tokens.

**What a native notification app needs:**

- **Device registry table** (for example `UserDevicePushT`): `UserID`, device ID, platform, app version, active flag, last seen, and the push token.
- **MySQL 5.5 index limit.** With `utf8mb4`, InnoDB on 5.5 limits indexed `VARCHAR` keys to 767 bytes, about 191 characters. Push tokens can exceed that. Store the token in a `TEXT` column and keep a `CHAR(64)` SHA-256 of the token for the unique index.
- **Preferences and consent:** a push preference in `NotificationPreferencesT` (for example `AppNoticePush`), a `PUSH` channel in `NotificationSuppressionT`, and consent-history rows, so opt-outs work like email opt-outs.
- **Delivery adapter** inside `services/notificationService.js` (Firebase Cloud Messaging over HTTP v1, with a service-account credential in environment variables, never committed). Do not send push from route code directly (`CLAUDE.md` already forbids bypassing the central service).
- **Token hygiene:** delete or deactivate tokens FCM reports as unregistered; handle logout and account deletion.
- **Android specifics:** the notification runtime permission (Android 13+), notification channels per severity, and quiet hours per user time zone (add a time zone field; the UTC standard covers storage, not delivery windows).
- **Rate limits and dedupe** so one notice cannot be pushed twice or flood a user.

### T6. Hosting names and `appId` are effectively permanent (High, blocks TNNA)

**Evidence.** CORS lists two production hosts: `wapps.helioho.st` and `wapps-ypez.onrender.com`. `capacitor.config.json` sets `appId` `com.wonderfulapps.townnotification`.

**Problems.**

- The API address will be built into installed apps. A Render `*.onrender.com` name with a random suffix can change if the service is recreated. Changing it later needs an app update, and old versions keep calling the old address.
- It is not clear which of the two hosts is canonical.
- Once published, the `appId` (Android package name) can never change.

**Recommendation.**

- Register a **custom domain** you control, point it at Render, and make that the API base for TNNA and for `PUBLIC_BASE_URL`.
- Confirm the `appId` is final and matches a domain you own (reverse-domain convention).
- Use **Play App Signing** so the signing key is recoverable, and keep the upload keystore backed up outside Git.

### T7. Store compliance and the entitlement dead end (High, before release)

**Evidence.** Registration creates accounts and requires phone 1. Payment processing is not implemented. Development trials expire globally after development.

**Items to check against current Google Play policy:**

- **Account deletion.** Apps that allow account creation are expected to offer in-app deletion and a public web link for it. `UsersT` deletes cascade, but I found no delete-account endpoint in the documented routes. **VERIFY.**
- **Privacy policy URL and Data Safety form** covering tokens, contact details, push tokens, and Family Tree data if it is reachable from the app.
- **Billing.** If TNNA ever sells digital subscriptions in-app, Play's billing rules apply. Because WA's payments do not exist yet, a store release before payments leaves users with a trial that expires and no way to continue.
- **New-account testing requirements** for personal developer accounts (closed test with a minimum number of testers for a minimum period). Check current numbers.

**Recommendation.** Decide the release-day entitlement plan: for example, `town_notice` is free for all users (or free for a defined period) so that a store release cannot strand users. Payment work stays out of scope until requested, as `CLAUDE.md` says.

### T8. Native security hardening (High, before release)

`CLAUDE.md` says the frontend security rules continue in a WebView. That is right, but the native shell adds its own surface:

| Item | Recommendation |
|---|---|
| Backup | Set `android:allowBackup="false"` (or exclude storage) so tokens are not copied to cloud backups |
| Cleartext | Disallow cleartext HTTP; add a network security config |
| Mixed content | Keep `allowMixedContent` off |
| WebView debugging | Disabled in release builds |
| CSP | Add a Content-Security-Policy `<meta>` to the bundled pages |
| Loading remote pages | Prefer bundled assets over pointing the app at the live site (`server.url`), which is also a store-review risk |
| Signing | Keystore and `keystore.properties` never in Git |
| Minification | Turn on release shrinking and check it does not break plugins |
| Secure storage | Tokens in Keystore-backed storage (T4) |
| Link handling | Open external URLs in the system browser, not the app WebView |

### T9. WebView behavior differs from a browser (Medium, blocks screens)

- **Service worker.** WA is a PWA with a service worker and manifest. Do not register it inside TNNA. It would cache API responses and fight with bundled assets. Guard registration by environment.
- **Safe areas.** Recent Android targets (API 35+) draw content behind system bars. WA pages need `viewport-fit=cover` and safe-area padding. Capacitor 8 has a reported safe-area console error on Android 16; watch that issue.
- **Theming.** WA declares `color-scheme: only light`. Keep it, and test that Android's forced dark mode does not recolor pages.
- **Sanitization and output rules.** DOMPurify, `inputSanitizer.js`, and safe-output rules apply unchanged. Make sure the bundled copy loads them locally, not from a CDN.
- **No `window.open`/popup assumptions.**

### T10. No API versioning or forced-upgrade path (Medium, before release)

**Evidence.** `CLAUDE.md` stresses preserving exact API parameter names, and one legacy endpoint (`/track/free-tier-usage`) is kept "temporarily for compatibility."

**Problem.** Installed apps live on phones for months. The web app can change any day; an old APK cannot.

**Recommendation.**

- Send an app-version header from TNNA on every request.
- Add a lightweight "minimum supported app version" endpoint, and a friendly upgrade screen when the app is too old.
- Pick an explicit compatibility window and a deprecation rule for endpoints TNNA uses. Stable machine-readable error codes (the subscription denial codes already qualify) help.

### T11. Deep links (Medium, before release)

Notification, unsubscribe, and verification links open in the browser today. To open them in the app, Android App Links need `/.well-known/assetlinks.json` on your domain.

- `express.static` ignores dot-directories by default, so `httpdocs/.well-known/` would return 404 unless you set `dotfiles: 'allow'` for that path or add a dedicated route.
- Public token pages (unsubscribe, network verification) should keep working in a browser for people without the app.
- Requires the canonical domain from T6.

### T12. Repository layout and secrets (Medium, blocks TNNA)

TNNA lives inside the WA repository on branch `townNNA`. Keeping one repo is reasonable because the API contract is shared. Add these safeguards:

- **`.gitignore` for TNNA:** `TNNA/node_modules/`, `TNNA/android/.gradle/`, `TNNA/android/build/`, `TNNA/android/app/build/`, `TNNA/android/local.properties`, `*.jks`, `*.keystore`, `keystore.properties`. Decide deliberately about `google-services.json`, and never commit a Firebase service-account key.
- **Commit the generated `android/` project** (minus build output), per Capacitor guidance, so it never has to be regenerated from nothing.
- **Render redeploys:** every commit to the deploy branch can trigger a WA deploy, including TNNA-only commits. Use Render's monorepo build filters (included/ignored paths) so `TNNA/**` changes do not redeploy the API. **VERIFY** in the dashboard.
- **Render Node pin:** do not add root `.nvmrc` / `.node-version` casually (see the companion document, Section 2.5).
- **Root Directory:** confirm Render's build still runs against the WA root with TNNA's separate `package.json` present.
- **How TNNA gets its pages:** decide whether `TNNA/public` is a build output from `httpdocs` (shared source, one copy step) or a hand-copied fork. Hand-copying will drift.

---

## 3. WA platform issues

### W1. MySQL 5.5 is unsupported, and transport encryption is unknown (High)

**Evidence.** The dump was generated from MySQL **5.5.62**. `CLAUDE.md` requires 5.5 compatibility "unless the database platform is intentionally changed." The provider row in `routes/track.js` shows a small hosted plan ($21.15/year, 100 MB).

**Why it matters.**

- MySQL 5.5 reached end of life in December 2018: no security fixes for a database holding Family Tree personal data, contact details, and credentials hashes.
- It limits design: 767-byte index keys with `utf8mb4` (T5), no JSON type, no modern SQL, so more logic ends up in application code.
- TLS may be absent or weak. **VERIFY:** does `dbConnection.js` set `ssl`? If not, credentials and personal data cross the public internet in clear text between Render and the database host. If TLS is used with old certificates, Node 24 (OpenSSL 3.5, security level 2) may refuse them (see the companion document, Phase 2).

**Recommendation.**

1. Verify transport encryption this week.
2. Plan a deliberate migration to a supported MySQL (8.4 LTS) or compatible service, with backups and a rehearsal against a copy. The 5.5 rule in `CLAUDE.md` is then intentionally revised.
3. Until then, keep new SQL 5.5-safe, as documented.

### W2. No automated tests (High, enables everything else)

**Evidence.** No test framework appears in the dependency list. `CLAUDE.md` and `TechSummary.md` prescribe manual checklists (allowed and denied subscription paths, merge testing, split-view persistence). A manual End-to-End Undo test in September 2026 is recorded as a success.

**Why it matters.** The Node upgrade, database migration, TNNA API changes, and refactoring of a very large Family Tree module are all riskier without a safety net.

**Recommendation (small and staged):**

1. Add a smoke suite using Node's built-in test runner plus an HTTP test helper: register/login, protected call, subscription allow/deny, admin grant, promo redemption.
2. Add a **golden-path Family Tree test**: create tree and people, One Tree Merge, then Undo, then assert membership and relationships.
3. Run it against a disposable database in CI (GitHub Actions) for both Node 24 and the current Node.
4. Gate merges to the deploy branch on it.

### W3. Public surface and hardening not documented (High, before release)

**Evidence.** `/send-email` is defined directly in `server.js` with no documented auth. `/api/geocode` is documented as "currently not wrapped by subscription middleware." No rate limiting or security-header package is in the dependency list (no `express-rate-limit`, no `helmet`).

**Concerns:**

- If `/send-email` is reachable without a login, it is a spam relay and burns your email-provider quota, which the Track page already monitors.
- If geocode is unauthenticated, it can be used to consume a third-party quota.
- Login, email-code verification, promo redemption, and the public token endpoints are all brute-force or abuse targets. Also check the email code's length, expiry, and attempt limit.
- Without `helmet`, standard headers (CSP, `X-Content-Type-Options`, HSTS, referrer policy) may be missing.

**VERIFY, then act:** confirm authentication on `/send-email` and `/api/geocode`; add per-IP and per-account rate limits (strictest on login, code verify, contact/email, and public token routes); add `helmet`; cap request body sizes.

### W4. Admin identity model (Medium)

**Evidence.** Admin is `UserID === 1` or the JWT username equals `ADMIN_USERNAME`. Admin grants any plan, edits promos, and views usage.

**Concerns.** Identity by magic number or by name is brittle. A username-based check is safe only while that username can never be registered by anyone else (deleted admin account, case-folding differences, re-registration). It also cannot express more than one admin or a lesser role.

**Recommendation.** Add an explicit role (for example `IsAdmin` or a `Role` column) enforced server-side and carried as a token claim that is re-checked against the database for admin routes. Remove the ID and username shortcuts once the column exists.

### W5. No token revocation (Medium, before release)

**Evidence.** 8-hour JWT, no revocation documented.

**Concern.** Logout, password change, account deletion, and a lost phone do not invalidate an issued token before expiry.

**Recommendation.** Tie this to T4: short access tokens plus a revocable refresh session, or a per-user token version checked on each request. Revoke on password change, deletion, and "sign out everywhere."

### W6. Tokens in URLs may leak (Medium)

**Evidence.** Unsubscribe and Family Network verification links carry tokens in the URL path. Morgan is in use, and `CLAUDE.md` forbids logging sensitive credentials.

**Concern.** Default request logging records the full path, so raw tokens can land in log files. Referrer headers can also leak them to other sites.

**Recommendation.**

- Redact those two path patterns in the Morgan format.
- Send `Referrer-Policy: no-referrer` on those pages.
- The existing design (GET shows a page, POST performs the change) is good; keep it, so email scanners that pre-fetch links cannot unsubscribe or verify anyone.

### W7. Schema changes are not source-controlled (Medium, needed for TNNA tables)

**Evidence.** `wappsDump.sql` is the schema authority, but `*Dump.sql` is Git-ignored, so it is a local/Drive reference. Historical migration SQL exists but "is not the current database authority."

**Risk.** TNNA adds tables (T1, T4, T5). Without versioned migrations, local, test, and production can drift, and there is no record of what ran where.

**Recommendation.**

- Add numbered migration files under a tracked folder (for example `db/migrations/`), plus a small `schema_migrations` table recording what has been applied.
- Track a **schema-only** export (`mysqldump --no-data`) so structure is reviewable in Git. Never track data dumps (the current ignore rule is right about that).
- Keep migrations 5.5-safe until W1 is done.
- Test restore from a real backup at least once.

### W8. Runtime and dependency governance (Medium)

- Node is unpinned in the documentation: `CLAUDE.md` and `TechSummary.md` do not state a Node version, and neither mentions TNNA. Add an explicit "Runtime and tooling" section (Node, npm, JDK, Android Studio, Capacitor versions).
- Add an `engines` field to both `package.json` files (and `engine-strict` for TNNA).
- Turn on automated dependency alerts and review `npm audit` regularly. `sharp` and the AWS SDK are pinned to exact versions; document why and when to revisit.
- The ETF module depends on third-party market-data sources (Yahoo via an unofficial package, plus Finnhub, Polygon, and Tiingo per earlier work). Those change without notice; keep them behind the Diamond app key and isolated, as they are today.
- See the companion document for the Node 24 plan.

### W9. Hosting behavior (Medium, before release)

**VERIFY the Render plan.**

- **Free instances sleep after inactivity.** A cold start of tens of seconds is a poor first-open experience for a notification app.
- **Scheduled dispatch** (timed notices, digest emails, push) cannot run on a sleeping instance. Use a Render cron job or an always-on service for the sender.
- **Ephemeral disk:** `logs/` in the repo layout suggests file logging. Files on Render's instance disk are lost on deploy; write to stdout and let the platform collect it.
- **Database is external** to Render (helioho.st host), adding latency and a network hop (see W1 for TLS).

### W10. Documentation drift and duplication (Low)

- `CLAUDE.md` and `TechSummary.md` repeat most of the same content (about 40 KB each). Duplicated text drifts. Make `CLAUDE.md` the concise rules file and `TechSummary.md` the architecture reference, and link rather than copy.
- The documented project root is `wonderfulApp/`, but the local folder is `WonderfulAppsRender`. Note the real name and mention TNNA.
- Add a TNNA section: purpose, versions, how to build, how it reaches the API, where the Town Notice logic lives (T1).
- Add a short "environment variables" list (names only, never values).

### W11. Family Tree personal-data posture (Medium, before release)

Family Tree stores names, contact details, images, event data, and networking preferences for people, including living relatives, who may never have used WA. The verification flow for Networking is good. Beyond that:

- Define retention for archived and merged records (`FTRecordArchiveT`, merge snapshots, R2 objects).
- Provide a way to answer access and deletion requests for a person who is not a WA user.
- Make sure adoption relationships (used to compute blood lines) cannot be inferred from Network search results.
- A mobile release makes the Data Safety declaration and privacy policy (T7) cover this feature too, or decide that TNNA exposes only Town Notice.

### W12. `familyTree.js` size (Low)

The Family Tree API is described as a very large single route module holding relationship calculation, merge and undo, networking, uploads, and notification logic. Extract the relationship, merge, and networking logic into service modules (the pattern already used by `notificationService.js` and `subscriptionService.js`). Do this after W2's tests exist, not before.

---

## 4. Suggested sequencing

**This week (no risk to production):**

1. Companion document, Phases 0 and 1: snapshot, portable Node 24, `npx cap add android`.
2. Check Render's Node version and plan (W9); check DB TLS (W1); check `/send-email` and `/api/geocode` auth (W3).
3. Answer T1 in writing: what Town Notice is and where its data comes from.

**Before building TNNA screens:**

4. Decide T2 (`apiBase`), T3 (CORS), T6 (custom domain, `appId`), T12 (`.gitignore`, Render filters).
5. Prove one authenticated API call from a debug APK.

**Before a closed beta:**

6. T4/W5 (device session and revocation), T5/W7 (push tables through migrations), T8 (hardening), W2 (smoke tests).

**Before a store release:**

7. T7 (deletion, privacy, entitlement plan), T10 (versioning), T11 (deep links), W3/W6 (hardening), W11 (data posture), and a decision on W1 (database).

---

## 5. Questions I could not answer from the documents

1. What is Town Notice today: what does it store, and who publishes notices? (T1)
2. Which Render plan does WA run on, and what Node version does the service actually use? (W9, companion Section 2.2)
3. Does `dbConnection.js` use TLS? (W1)
4. Are `/send-email` and `/api/geocode` protected by login? (W3)
5. Which production host is canonical, and will you buy a custom domain? (T6)
6. Will TNNA bundle a copy of WA's Town Notice pages, or load them from the live site? (T8, T12)
7. Is the notification channel for TNNA push only, or push plus the existing email and SMS categories? (T5)

---

## 6. Sources

- Capacitor 8 environment and upgrade documentation: `capacitorjs.com/docs`
- Render Node version precedence and defaults: `render.com/docs/node-version`
- Node 24 changes (OpenSSL security level, deprecations) and release schedule: nodejs.org release pages and secondary summaries
- WA and TNNA facts: `CLAUDE.md`, `TechSummary.md`, `TNNA_Node_NVM_Technical_Review.md`

Google Play policy items (T7) and Capacitor Android defaults (T3, T9) are from general knowledge of current practice and were **not** re-checked against live policy pages in this review. Confirm them before acting.
