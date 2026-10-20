# Wonderful Apps — Keep Me Logged In / Change Password: design engineering review and recommendations

**Prepared:** October 19, 2026
**Role:** Project design engineer (Claude)
**Branch under review:** `reviseLogin`
**Scope:** All eight Markdown documents in `wonderfulApp/keepMeLoggedIn/` and `keepMeLoggedIn/implement plan/`, supplemented by a read-only reading of the Google Drive copies of the backend and browser source.
**Disposition:** Continue Stage 6 on the current architecture, but do not start the bulk browser rollout until the backend contract fixes in Section 4 are in place. The integrated feature is not ready for release acceptance on present evidence.

---

## 1. Bottom line

The architecture is sound and has improved at each review round: separate browser sessions, short access JWTs, hashed single-use refresh tokens in an HttpOnly cookie, database-backed revocation, a security-version fence for password changes, and a native (TNNA) path kept separate from the browser path. I endorse the direction recorded in the Stage 6B request and in the earlier Cod Stage 6B review: keep `localStorage.token` for this release, use one explicit `waAuth.js` helper rather than a global `fetch` interceptor, and integrate pages from an inventory rather than editing all ~63 pages.

I independently confirmed the High backend findings in the Cod Stage 6B review (DE6-01 through DE6-05, DE6-07, DE6-10) against the Drive copies of `routes/users.js`, `services/browserSession.js` and `services/verifyAccessToken.js`. I did not find a reason to downgrade any of them.

I add eight findings that the earlier reviews did not state concretely (Section 3). The most important are:

1. **The hosted test service cannot start as the code is written** (R-01). The reset limiter throws when `NODE_ENV=production`, and the cookie `Secure` flag appears to depend on that same setting.
2. **Two concrete race interleavings** between login verification and password change (R-02) that a version fence on the challenge and a fixed lock order would close together.
3. **Behind Render's proxy, the per-IP reset limit probably acts as a second global limit** (R-03), because `server.js` sets no `trust proxy`.

---

## 2. How the document set fits together

| Document | Current standing |
|---|---|
| `Tech_Summary_KeepSignedIn_Project_with_Initial_Attempts` | Still the source of the non-regression requirements. Its experimental-ZIP history is historical only. |
| `Cl_WA_tech_response_…`, `P_WA_KeepSignedIn_…` | Useful frameworks; their uniform-login-bounce and deferred-access-revocation ideas were rightly set aside. |
| `Cod_WA_Design_Engineer_Recommendations` | Source-informed reconciliation; its challenge/version-race point is still open. |
| `Synthesis`, `WA_Stage6_Handoff` | Handoff is the record of agreed decisions: 180-day sliding / 365-day absolute remember lifetime, account-wide online revocation, expanded reset-password scope. I treat those as decided, not reopened. |
| `WA_Stage6B_…_Technical_Review` | Good question set. Cod's answers to its nine questions are sound; Section 4 below lists where I refine them. |
| `Cod_WA_Stage6B_Design_Engineering_Review` | The most complete finding list so far. I use its IDs (DE6-xx) and add R-xx items. |

Two housekeeping points. The branch is `reviseLogin` (the user-facing name and the observed Git name agree); several older documents still say `reviseLogIn`, which should be corrected to avoid a mistyped checkout on the hosted service. And the feature name is now "Keep Me Logged In" everywhere, with request field `keepMeLoggedIn`; the old "Signed In" wording remains in file names and should not leak into UI text or API fields.

---

## 3. Findings

"Confirmed" means visible in the Drive copy of the source. Nothing here was executed, so races are static analyses that need a two-connection test to prove.

| ID | Severity | Relation to earlier work | Finding |
|---|---|---|---|
| R-01 | **High** (blocks hosted testing) | Extends DE6-09 | Hosted staging cannot boot; cookie security is tied to a setting the guards forbid. |
| R-02 | **High** | Extends DE6-01 and DE6-13 | Version fence missing: stale challenge and surviving-session races. |
| R-03 | **Medium–High** | New (Cod DE6-09 notes a shared-IP risk in passing) | Per-IP reset limiter likely collapses to a second global limiter. |
| R-04 | **Medium** | Extends DE6-09 | Cross-port dev path conflicts with the origin rule; no custom CSRF header; shared parent domain. |
| R-05 | **Medium** | Extends DE6-10 | Error contract is inconsistent; cookie-clearing semantics are undefined. |
| R-06 | **Medium** | New | Deploy order and the security-row backfill can break login and TNNA refresh. |
| R-07 | **Medium** | Extends DE6-07 | Login challenges are not scoped by client, not superseded, and each login sends mail without a limit. |
| R-08 | **Medium** | Extends DE6-11 | Rate-table growth can be attacker-driven; a concrete limiter change avoids it. |
| R-09 | Low (policy) | New | TNNA refresh has no absolute lifetime, unlike web. |
| R-10 | Low | Extends Cod Q1 | Helper delivery: cache versioning and avoiding pointless restore calls. |
| R-11 | Low | New | `authenticateToken` swallows the error passed to its callback. |

### R-01 — Staging environment model (High, blocks hosted testing)

`routes/users.js` requires `services/passwordResetLimiter` at load time. The limiter throws unless `DB_NAME` is the test database **and** `NODE_ENV` is not `production`. `server.js` also starts the rate cleanup in its `listen` callback, which carries the same guard. As I read `browserSession.js`, the cookie `secure` attribute is turned on only when `NODE_ENV === 'production'`.

Taken together: a hosted HTTPS test service that needs `Secure` cookies would have to set `NODE_ENV=production`, which makes the server throw at startup. Setting staging to development to get past the guard would silently send the refresh cookie without `Secure`. Both outcomes are wrong, and the earlier reviews were right that neither "delete the guard" nor "run staging as development" is acceptable.

**Recommendation.** Introduce one explicit environment variable and derive everything from it:

- `WA_ENV` = `local` | `staging` | `production`. Startup fails on any other value.
- `WA_ALLOWED_DB_NAMES` (comma list per environment). Staging must name `sql5838929`; production must **not** contain it. Verify the connected database identity with `SELECT DATABASE()` at boot, in addition to reading the env var.
- `Secure` cookie = `WA_ENV !== 'local'`. Do not read `NODE_ENV` for security decisions.
- `WA_ALLOWED_ORIGINS` as an explicit list used by both CORS and the origin check.
- Replace the limiter and cleanup guards with checks against these values (the limiter's own comment already says the guard must be replaced before production).

### R-02 — Credential-version fence (High)

DE6-01 describes challenges that survive a password change. Two concrete interleavings show why binding the challenge alone is not enough, and why DE6-13's lock-order concern is a security issue rather than only a deadlock issue.

**Interleaving A (challenge creation).** `/users/login` reads the password hash and checks it with bcrypt, then inserts the challenge. If a password change commits between those two steps, the challenge is created after revocation and is usable against the new version.

**Interleaving B (surviving session).** In `/verify-code`, `sessions.create()` inserts a session row inside a transaction. A concurrent `revokeAll()` runs `UPDATE WebSessionT SET RevokedAt … WHERE UserID=? AND RevokedAt IS NULL`; that statement cannot see the other transaction's uncommitted insert. The new session and its refresh token survive the password change, and the first refresh issues a JWT carrying the *new* security version.

**Recommendation — one fence, used everywhere.**

1. Add `SecurityVersion` (same type as `UserSecurityT.SecurityVersion`) to `LoginVerificationT` and to `PasswordResetT`. Optionally add `Client` (`web`/`tnna`), see R-07.
2. In `/login`, read the password hash **and** the security version in one statement, run bcrypt, and insert the challenge with *that* version. Do not re-read the version at insert time.
3. Define a single lock order for every credential operation: `UserSecurityT` row → `UsersT` row → `WebSessionT` → refresh-token tables → challenge/reset tables. Take the security row first with `FOR UPDATE`.
4. Consumption (web and TNNA verify): lock the security row, require `challenge.SecurityVersion = current`, consume the challenge with the existing conditional `UPDATE` (add the version to its `WHERE`), create the session, commit.
5. Change/reset password: lock the security row first, bump the version, then revoke sessions and TNNA refresh rows. With step 4, any in-flight create either commits before the fence (and is revoked) or fails the version check afterwards.
6. Refresh rotation: its current single `SELECT … JOIN … FOR UPDATE` locks rows in every joined table in optimizer-chosen order. Restructure so the security row is locked first, then re-read and lock the token row. Retry once on a deadlock error.
7. Reset links: check the stored version at consumption, which also closes DE6-04 without needing extra deletes. Keep the explicit "mark prior links used" step for hygiene.

Test with two real connections, using the existing MySQL 5.5/`mysql283` test harness: pause one transaction between its statements and run the other to completion, for both interleavings above.

### R-03 — Per-IP reset limit behind the proxy (Medium–High)

`server.js` does not call `app.set('trust proxy', …)`. On Render, `req.ip` is therefore the proxy's address for all clients. The limiter's IP bucket (20 per hour) would then count every user's reset requests together, and it is lower than the global ceiling of 100. Anyone requesting a reset after the twentieth in an hour would receive the generic response with no email sent. This is an availability bug, the reverse of the spoofing worry in the earlier reviews. I am assuming the forgot-password route passes `req.ip` to the limiter; confirm that line.

**Recommendation.** On the staging service, log `req.ip`, `req.ips` and the raw `X-Forwarded-For` for a few real requests, then set `trust proxy` to the verified hop count for that host only. Until then, treat the IP bucket as informational (log, do not deny). Keep per-email and global limits as the enforcement.

### R-04 — Origin, CSRF header and development topology (Medium)

- `login.html` points `BASE_URL` at `http://localhost:8080` whenever the page is served from another localhost port. That request is cross-origin, so the Origin ≠ Host check will reject it, the cookie needs `credentials: 'include'`, and the CORS config in `server.js` has no `credentials: true`. The remember-me flow will fail there with no obvious cause. **Decision:** auth pages in development are served same-origin from port 8080; `waAuth.js` should not carry the cross-port branch for cookie-authorized calls.
- The Host-derived origin comparison is acceptable *because* both headers are set by the browser and Origin is required. I would not raise it above Medium on its own. The real hardening is to add an enforced custom header (for example `X-WA-Request: 1`) on cookie-authorized POSTs: refresh-session, cookie logout and verify-code. Add it to the CORS `allowedHeaders` list.
- Production appears to be on `wapps.helioho.st`. `SameSite` is evaluated on the registrable domain, so unless `helioho.st` is on the Public Suffix List (check publicsuffix.org), other tenants' subdomains are same-site and their requests would carry the cookie. The strict Origin check is what stops them, so keep it exact (no suffix or wildcard matching) and add the custom header as a second control.

### R-05 — Error contract and cookie clearing (Medium)

- `server.js`'s global handler returns `{ error: { message } }`, while `login.html` throws `new Error(errorData.error)` and shows it. An object there would display as "[object Object]", and machine codes such as `VERIFICATION_ALREADY_USED_OR_EXPIRED` are shown to the user raw. `waAuth.js` and the pages need one normalizer: `error` is a string, `code` is a stable machine code, and the UI maps codes to text.
- Extending DE6-10: split `TOKEN_INVALID_OR_EXPIRED` into at least `ACCESS_EXPIRED` (only when the signature is valid and the only failure is `exp`), `ACCESS_INVALID`, `SESSION_REVOKED`, and `AUTH_UNAVAILABLE` (503). Only `ACCESS_EXPIRED` may trigger a refresh-and-retry. Change Password's wrong-current-password case should be 400 or 403 with `CURRENT_PASSWORD_INVALID`, not 401.
- `/refresh-session` leaves the cookie in place on a definitive 401. Clearing it is right for expired or revoked families, but **not** for a consumed token: a lost race could otherwise delete the valid successor cookie, the hazard P and Cod both describe. This only works if the server distinguishes `REFRESH_CONSUMED` from `REFRESH_EXPIRED`/`REFRESH_REVOKED`, which ties to DE6-05.

### R-06 — Deploy order and the security-row backfill (Medium)

As I read the services, `securityVersion()` throws when a user has no `UserSecurityT` row, and both web and TNNA verification/refresh call it. If the schema and backfill are applied and then the new code is deployed later, any user registered by the *old* code in between has no row, and that user's login or TNNA refresh fails. Conversely, deploying code before the schema fails everyone.

**Recommendation.** Make the backfill idempotent (`INSERT … SELECT … WHERE NOT EXISTS`) and re-run it immediately after the code deploy. As a belt-and-braces measure, have `securityVersion()` create a missing row with version 1 (`INSERT IGNORE`) instead of throwing; that is safe because no version-carrying token can exist for a user with no row. Record the exact deployment order and the post-deploy count check in the migration plan.

### R-07 — Challenge hygiene (Medium)

- The challenge table is shared by web and TNNA with no record of which client it was issued for. A challenge from the website login can be redeemed at `/tnna/verify-code` and mint a long-lived native refresh token. Add `Client` and require a match in each verifier.
- When a new challenge is issued for a user, mark that user's older unverified challenges superseded (if `/login` does not already do this). This shrinks the guess surface to the most recent challenge.
- Every valid-password `/login` sends an email and nothing limits it, so the endpoint can be used to flood a victim's inbox and burn mail quota (which then blocks legitimate verification emails). Add a per-account issuance limit independent of IP.
- DE6-07 already requires `crypto.randomInt` and attempt limits. Starting values to propose, to be tuned with data: burn a challenge after 5 wrong codes; 5 challenges per account per hour; 5 wrong current-password attempts per 15 minutes per account.

### R-08 — Limiter growth (Medium)

`passwordResetLimiter.allow()` inserts or increments the email, IP and global keys even when the request is already over the limit, and the cleanup deletes a bounded number of rows per day. Unique rejected addresses can grow the table faster than cleanup shrinks it, and I did not verify the database's storage quota, which is the real ceiling. Change the order: evaluate the global key first and return early, without creating per-email or per-IP rows, once it is exceeded. Run cleanup hourly and loop within a time budget until the expired backlog is empty. Also confirm the current database quota before sizing any retention policy.

### R-09 — TNNA absolute lifetime (Low, policy)

`routes/tnna.js` issues a fresh 180-day refresh token on every rotation with no absolute cap, whereas web has a 365-day cap. That may be intended for phones that announce offline, but it should be recorded as a decision, since revocation on password change is then the only way to end a stolen native credential.

### R-10 — Helper delivery (Low)

- `express.static` serves JavaScript with `maxAge: '1d'`. A one-day-stale `waAuth.js` against a changed server contract is a real failure mode. The project already uses `?v=` on `inputSanitizer.js`; use the same on `waAuth.js` and update it on every pages-wide change, rather than waiting for evidence of a problem.
- JavaScript cannot see an HttpOnly cookie, so every public page load would call `/refresh-session` even for anonymous visitors. Set a non-secret `localStorage` hint (for example `wa_remembered=1`) at checked login, clear it at logout and on definitive failure, and skip the restore call when it is absent. It is a hint only; the server remains the authority.
- Do not run the cookie-restore path inside the Capacitor shell (`capacitor://localhost`); native keeps its own token contract.

### R-11 — `authenticateToken` wrapper (Low)

`authenticateToken` passes `auth` a callback that ignores its argument and reads `req.user.client`. If `auth` ever calls `next(error)` for an unexpected error, `req.user` is undefined and a `TypeError` replaces the original error. Change the callback to `err => err ? next(err) : …`. Currently reachable only through an unexpected exception, but it will hide the real cause when one occurs.

---

## 4. Where I refine the Cod Stage 6B review

| Topic | Cod Stage 6B | My recommendation |
|---|---|---|
| DE6-05 reuse policy | Choose family revocation or document rejection-only. | Choose **family revocation on recognized reuse**. The cost is a forced email-code login after a lost refresh response; for a personal-finance app with a small user base, that is cheaper than silent theft. Implement it by returning a result object, committing the revocation, and then sending the 401, so a thrown error cannot roll the revocation back. No grace window unless you decide on one explicitly. |
| DE6-09 | One High item. | Split: environment model (R-01) is a hard blocker; the Host-derived origin rule is Medium hardening (R-04). |
| DE6-02 logout | Cookie-authorized logout. | Agree. Also accept a signature-valid but expired access token for logout only, as a fallback identifier. Never accept a client-supplied session or user ID. |
| DE6-03 supersession | Revoke the incoming cookie's session on full verification. | Agree. Do it inside the same transaction as the new session, after the fence in R-02, and only after successful code verification. |
| Group 0 | One backend group. | Split into 0a (schema + fence + challenge binding), 0b (logout and supersession), 0c (crypto codes, attempt limits, limiter order), 0d (environment model). Each ends with its own tests so a failure is easy to locate. |

---

## 5. Browser helper: additions to Cod's Section 5

I concur with Cod's contract for `restoreSession`, `getAccessToken`, `authenticatedFetch`, `refreshSession`, `getSessionStatus` and `logout`, and with Web Locks for cross-tab single-flight. Additions:

- `authenticatedFetch` should accept only same-origin API paths, and must never attach credentials to third-party URLs.
- Define the Family Tree seam first (Cod Q1): `FTPrivacy.js` wraps `window.fetch` and adds `X-FT-Page-Token` based on a string URL test, so test both script-load orders and Request versus URL inputs before touching Family Tree pages.
- Errors: use the normalizer from R-05 in the helper and in `login.html` so users never see raw codes.
- Keep the original login flow untouched: confetti, success alert, 1.5-second redirect delay, Show/Back handlers. Silent restoration must not trigger them.
- Change Password page: show only after `getSessionStatus()` confirms the session; send current, new and confirmation values; keep the eight-character minimum and bcrypt cost 10; on success, clear local state and require a fresh login on all devices, matching revokeAll.

---

## 6. Decisions needed from you

1. **Recognized refresh reuse:** family revocation (recommended) or rejection only.
2. **"New password must differ from the old one":** this rule is in the code but I did not find a recorded approval. Approve it or remove it, and make the UI match.
3. **Web cutover:** require a fresh website login after deployment (recommended) rather than accepting unversioned JWTs.
4. **Development topology:** auth pages served same-origin on port 8080 only.
5. **Environment variable names** in R-01 (or your preferred equivalents).
6. **Attempt-limit values** in R-07, as starting points.
7. **TNNA absolute lifetime** (R-09): keep unlimited sliding or add a cap.

---

## 7. Recommended order of work

1. **Group 0d + 0a.** Environment model; schema deltas (`LoginVerificationT`, `PasswordResetT`); fence and lock order; idempotent backfill; tests for both R-02 interleavings.
2. **Group 0b.** Cookie-authorized logout, supersession on verify, family revocation on reuse, error-code split; HTTP tests including a lost-response case.
3. **Group 0c.** `crypto.randomInt`, attempt and issuance limits, limiter early-exit, hourly cleanup loop, `trust proxy` evidence from the staging service.
4. **Group 1 browser foundation.** `waAuth.js` (versioned URL, restore hint, error normalizer), `login.html`, `home.html`, subscription page, new `changePassword.html`.
5. **Groups 2–3** per Cod's inventory: one row per deployable file, with "no change" justified.
6. **Group 4.** Hosted staging, native legacy-recovery test on a dedicated staging client (do not touch installed production phones), then the independent final review.

---

## 8. What this review did and did not do

I read the eight Markdown documents and the Drive copies of `routes/users.js`, `routes/tnna.js`, `services/browserSession.js`, `services/verifyAccessToken.js`, `services/passwordResetLimiter.js`, `middleware/auth.js`, `middleware/subscriptionAccess.js`, `dbConnection.js`, `server.js` and `httpdocs/login.html`, and listed the first page of the `tests/` folder (five Stage 6A files; more may follow).

Checked and found sound: `dbConnection.js` pins mysql2 to UTC (`timezone: 'Z'`) and sets each session to `+00:00`, so JavaScript `Date` parameters compare correctly with `UTC_TIMESTAMP()`. I had suspected a mismatch on a Florida-local development machine and it does not exist.

Not done: nothing was run, no database or email was touched, and I did not establish that the Drive files match the local working tree that Cod inspected. `waAuth.js` and `changePassword.html` are not in the Drive folder. I did not audit route-by-route business authorization beyond the middleware files above, and I did not read the other pages' source. This review does not replace the independent final review of the complete candidate, and it authorizes no merge, migration or deployment.
