# Wonderful Apps — Stage 6B Engineering Reviews: Synthesis and Proposed Implementation Plan

**Date:** October 19, 2026  
**Status:** Proposed design and implementation plan; **not authorization to modify production or merge**  
**Scope:** Keep Me Logged In; Change Password; Forgot/Reset Password; closely coupled browser/TNNA authentication and test infrastructure.

## 1. Source documents and interpretation

This synthesis is based primarily on the two engineering reports located in the Google Drive folder `wonderfulApp/keepMeLoggedIn/implement plan`:

1. **Cod review:** [Code_WA_Stage6B_Design_Engineering_Review_2026-10-18.md](https://drive.google.com/file/d/1MEyyr2shihiXr8o0pSoMcQpA-iypTH0Q/view) — 14 findings **DE6-01–DE6-14**, proposed client contract, implementation groups, and acceptance matrix.
2. **Claude review:** [Claude_WA_Stage6B_Design_Engineering_Review_2026-10-19.md](https://drive.google.com/file/d/1ssPFeSi84jk2J7zdPIPWGXep7idZsV__/view) — validates several Cod high-priority findings, adds **R-01–R-11**, refines lock/order, staging, proxy, logout, replay, and testing recommendations.

Supporting context: the Stage 6 handoff and prior browser authentication dependency audit. **Evidence limitation:** This document synthesizes reviews; it does not claim fresh code execution, Git inspection, SQL reads, or a new runtime security audit. The two reports are engineering assessments, not passing test results or authorization for rollout.

**Branch discrepancy to resolve first:** The handoff specifies case-sensitive `reviseLogIn`, while Claude's report states observed `reviseLogin`. Do not silently normalize this. Inspect `git branch --show-current`, `git branch -a`, and the actual remote branch reference before creating packages or connecting Render. Until verified, use the user's established `reviseLogIn` restriction as the intended scope, without making assumptions about which spelling exists in Git.

## 2. Executive conclusion

**Both engineers support continuing Stage 6 with its current architecture, but recommend correcting high-priority backend contracts before mass browser integration.** Continue to use short, server-validated web JWTs, a browser-only rotating refresh token in an HttpOnly cookie, session revocation in the database, and separate TNNA native authentication. Implement one explicit browser helper (`httpdocs/js/waAuth.js`) rather than globally intercepting `window.fetch`. Retain `localStorage.token` for compatibility during this release; do not store refresh secrets there.

The strongest immediate risks are **stale authentication challenges after password changes; session-creation/revocation races; logout that cannot revoke a valid remembered session if its access JWT expired; incomplete supersession of a previous remembered login; refresh-token replay behavior; missing brute-force controls; and a staging environment unable to combine the present startup guards with Secure HTTPS cookies**. The feature is **not ready for production approval** on the reviewed evidence.

The recommended sequence is **environment and database/challenge safeguards → logout, supersession and refresh contract → challenge/rate controls → browser helper and account UI → application integrations → isolated hosted/TNNA acceptance → separate independent final design-engineer review → user production decision**.

## 3. Existing agreements that must be preserved

| Area | Agreed baseline / constraint |
|---|---|
| Development isolation | Work on the approved Stage 6 branch only; use **test DB `sql5838929` exclusively**; no modification to production DB, existing production Render service, or `main`. |
| Web access | JWT life **8 hours**, with server-side live session and security-version enforcement. |
| Optional Keep Me Logged In | **180-day sliding** refresh lifetime, with **365-day absolute** upper bound. Explicit opt-in; no hidden polling solely to extend the term. |
| Standard login | Username/password followed by email verification; an unchecked login gets no persistent refresh credential. |
| Password change/reset | Security-version increment and revocation of relevant web sessions and **TNNA online** credentials; new login required. |
| Reset link | One-time, 30-minute token; generic forgot-password responses; rate limiting and safe handling of expired/replaced links. |
| Separate test hosting | A new Render staging service will eventually use the correct branch and test DB only, with isolated secrets, origin, emails and secure cookies. |
| Native compatibility | Do not alter production TNNA accounts, APIs, credentials or installed phone configurations for Stage 6 tests; offline announcements must continue to work. |
| After Stage 6 | Keep the test DB; require **independent final engineering review after full local and hosted tests**, written findings/corrections/retesting, then explicit user authorization for any production decision. |

**Clarification:** The independent engineer reviews already received are valuable *interim design reviews*. Neither substitutes for the required review of the **completed, tested** Stage 6 candidate.

## 4. Consolidated engineering findings and action priorities

The following table groups overlapping issues while retaining the reviewers' identifiers.

| Priority | Cod finding | Claude finding | Consolidated problem and proposed disposition |
|---|---|---|---|
| **Blocker** | DE6-09 | R-01 | Hosted staging cannot safely use production-mode Secure-cookie behavior with current hard startup guards. Introduce explicit local/staging/production isolation and verify the **connected** DB identity before starting. |
| **High** | DE6-01, DE6-04, DE6-13 | R-02, R-06 | Stale verification/reset authorizations and credential-version races. Bind challenges and reset records to `SecurityVersion`; impose a consistent per-account lock order and test interleavings with real DB connections. |
| **High** | DE6-02 | R-05, Claude §4 | Expired access JWT prevents `/users/logout` from revoking a remembered session. Introduce validated cookie-authorized logout (and carefully scoped expired-but-signature-valid JWT fallback), exact Origin/CSRF protections, and pending-logout client handling. |
| **High** | DE6-03 | Claude §4 | A fully verified new login clears/overwrites browser cookie without revoking the old remembered session. Revoke incoming old session **in the successful verification transaction**; failed verification must not revoke it. |
| **High** | DE6-05 | Claude §4–5 | Recognized refresh reuse currently gets rejected, but family revocation is not established. Recommend **family revocation on recognized reuse**, committed before 401; never let arbitrary invalid tokens revoke others. Decide and test loss/race trade-offs explicitly. |
| **High** | DE6-06 | R-10 | No common browser restore/renewal integration. Introduce `waAuth.js` and integrate checked/unchecked login, direct deep links, expiry, logout and cross-tab behavior. |
| **High** | DE6-07 | R-07 | Code generation uses `Math.random()` and some login/verification/password attempts lack durable rate limits. Use `crypto.randomInt`, challenge attempt limits, per-account issuance and password-guess controls; bind web vs native challenge client. |
| **High for release** | DE6-08 | R-06, R-09 | Legacy website/TNNA token transition and secure rollback not proven. Require a signed-off strategy and dedicated staging-device tests; TNNA absolute refresh lifetime remains policy decision. |
| **Medium–High** | DE6-09, DE6-11 | R-03, R-04 | Proxy IP determination and cookie-origin safety unverified; missing `trust proxy` may make per-IP throttling a second global bucket. Verify hosting headers/hops before enabling IP-based denial; use explicit origin policy and custom CSRF header. |
| **Medium** | DE6-10 | R-05 | Distinguish expired vs invalid/revoked access; wrong current password should be a form validation error, not a logout-triggering 401. Normalize JSON errors and UI display. |
| **Medium** | DE6-11 | R-08 | Reset rate-table growth and global 100/hour exhaustion are availability risks. Avoid unnecessary per-address key inserts after a global denial; instrument table/backlog, choose tested bounded cleanup/overload policy. |
| **Medium** | DE6-12 | — | One Stage 6A test expects obsolete in-memory-throttle comments. Replace brittle source assertions with behavioral tests and record exact commands. |
| **Medium/Low** | DE6-13, DE6-14 | R-10, R-11 | Unify SQL locking, correct swallowed auth callback errors and obsolete comments; version/cache-check new helper; exclude backup/copy files from release manifest. |

**Important precision:** Claude labels R-01 and R-02 High. Several race and proxy outcomes are *static analyses requiring execution to validate*; the classification here reflects review priority, not a claim that the races or Render behavior were already reproduced.

### Specific race condition requiring priority resolution

Claude identifies two ways password changes and login verification may cross:

- `/login` can check an old password before a password change commits, then insert a verification challenge afterward; the challenge must remain bound to its **original** security version.
- `/verify-code` may insert a session not visible to a concurrent `revokeAll()` update. A common `UserSecurityT` lock and version fence must ensure the new session is either revoked or cannot commit.

Add `SecurityVersion` to `LoginVerificationT` and `PasswordResetT` as proposed, and review web/TNNA challenge `Client` scoping. A single **documented lock order** and real two-connection tests are essential; simply adding a version column is insufficient.

## 5. Where the engineers agree, differ or add specificity

### Strong agreement

- Keep the Stage 6A architecture and the 8-hour / 180-day / 365-day rules.
- Retain `localStorage.token` for this release; keep refresh secrets cookie-only.
- Use `waAuth.authenticatedFetch` **explicitly**, not a global `window.fetch` wrapper.
- Coordinate refresh across tabs; browser Web Locks plus per-tab single flight is the preferred design, with a **safe fallback** where Web Locks are unavailable.
- Treat 401 vs subscription 403 vs infrastructure 503 separately; do not automatically retry mutations, uploads or ambiguous failures.
- Preserve the existing interactive login UI and subscription redirect. A silent restoration must not produce confetti, success alerts or login-animation behavior.
- Preserve Family Tree's special `X-FT-Page-Token` / `FTPrivacy.js` interception, and public verification routes.
- Stage app integration in batches; test every touched app's reads/writes/navigation; do not assume every discovered HTML file requires edits.
- Treat hosted staging/TNNA compatibility and secure rollback as release blockers; final independent review occurs **after** complete testing.

### Claude refinements / decisions not yet approved

1. **Recognized refresh-token reuse:** Cod leaves rejection-only vs family revocation open and recommends stronger handling; Claude expressly chooses **family revocation**, no grace window. **Recommended:** adopt with the understood consequence that a lost successor response may force a new email-code login. Record user approval.
2. **Backend group granularity:** Cod proposes Group 0; Claude splits it into **0a** schema/version fence, **0b** logout/supersession/replay, **0c** generation/limits/cleanup, **0d** environment model. **Recommended:** use the subgroups, with **0d and 0a first**, then 0b and 0c.
3. **Environment contract:** Claude suggests `WA_ENV=local|staging|production`, `WA_ALLOWED_DB_NAMES`, and `WA_ALLOWED_ORIGINS`, with Secure cookies for hosted environments. **Recommended in principle**, but positive single-DB identity allowlisting is preferable to a broad or accidental production-capable list in the Stage 6 test build. The names and topology need approval.
4. **Password reuse:** Current backend rejects a new password identical to the old one. Both identify this as an additional behavior that must be explicitly approved and reflected in UI; it should not be silently labeled an agreed original requirement.
5. **Native token lifetime:** Claude observes TNNA sliding refresh currently lacks the web's 365-day absolute maximum. **Policy unresolved**; do not impose a new TNNA cap without explicit decision and impact assessment.
6. **Web cutover:** Both favor a planned fresh website login over indefinite acceptance of unversioned JWTs. It is a **recommended strategy, not user approval**.
7. **Development origin:** Claude suggests serving cookie-based auth pages same-origin at `localhost:8080` rather than relying on cross-port browser-hosting behavior. Decide development topology explicitly.
8. **Proxy/IP guard:** Claude adds the failure mode of proxy-shared `req.ip`, while Cod emphasizes forwarded-header spoofing. Both matter: no unconditional `trust proxy=true` and no security reliance on unverified headers.
9. **UI compatibility:** Claude calls out the original 1.5-second redirect, Show/Back controls and confetti; Cod also insists on no unexpected form reload or loss of unsaved content.

## 6. Proposed technical target design

### 6.1 Server-side authentication contracts

- **Account security fence:** `UserSecurityT.SecurityVersion` remains the authoritative revocation generation. Bind login challenges and reset grants to the version at issuance; require a version match at consumption under correct locking. Keep web/TNNA client scopes distinct.
- **Session creation:** Atomic challenge consumption + session insertion + supersession of prior browser session; only on successful verified login. Recheck version and transaction/lock order.
- **Logout:** Revoke the current server session using a validated web Bearer token or appropriately validated HttpOnly refresh cookie; support expired Bearer as a strictly limited fallback; do not accept arbitrary client-supplied session identifiers. Authentication and cookie security responses use `Cache-Control: no-store`.
- **Refresh:** One-time token rotation, hashed database secrets, parent linkage and a defined recognized-reuse policy. Commit any chosen family revocation before returning failure. Avoid clearing a valid successor cookie because of a harmless losing-tab response.
- **Password change:** Authenticated endpoint requiring current/new/confirmation passwords; maintain existing eight-character rule and bcrypt cost 10; decide the reuse and whitespace semantics. On committed change, revoke sessions/TNNA online credentials and invalidate stale login/reset grants. Notify user; a mail failure must not undo a committed password change.
- **Forgot/reset:** Generic forgot response; one-time 30-minute reset grant; limits; version-bound reset authorization; atomic update/revocation; safe link-origin generation and no leaked token in logs.
- **Errors:** Machine-readable stable codes (`ACCESS_EXPIRED`, `ACCESS_INVALID`, `SESSION_REVOKED`, `AUTH_UNAVAILABLE`, `CURRENT_PASSWORD_INVALID`, etc., names to finalize), consistent error envelope, and human-readable client messages. Only authenticated pre-handler expiration may qualify for controlled refresh/retry.

### 6.2 Browser `httpdocs/js/waAuth.js` (new)

Use an isolated namespace, no global fetch interception or automatic page reload. Proposed interface:

| Method | Key behavior |
|---|---|
| `restoreSession()` / `ensureSession()` | On protected page startup, resolve authenticated / signed out / temporarily unavailable; respect pending logout. |
| `getAccessToken()` | Read token at request time, not a captured value. Never send `Bearer null`. |
| `refreshSession()` | Same-origin POST with required Origin/CSRF defenses, cookie-only secret, single in-tab promise, cross-tab lock. No uncontrolled retries after uncertain response. |
| `authenticatedFetch()` | Attach token only to approved same-origin API requests; preserve headers, privacy page token, abort signals, Request/body semantics; bounded retry only where proven safe. |
| `getSessionStatus()` | Validate on server before sensitive account controls. Treat outage as unknown, not definitively signed out. |
| `logout()` | Block restoration and notify tabs; attempt server-side revocation; retain a pending marker if revocation cannot be confirmed, without falsely claiming complete logout. |

Retain `localStorage.token` for compatibility **for this release**; this has XSS exposure if same-origin scripts are compromised, so keep sanitizer/output safeguards and schedule a separate CSP/security-hardening review. Version the helper script or use an explicitly tested HTTP caching policy. A **non-secret remembered-session hint** may reduce needless cookie-restore requests, but cannot be an authorization source. Do not run web restore inside the Capacitor native client.

### 6.3 Browser UI behavior

- **Login:** Checkbox labeled **Keep Me Logged In**, default unchecked; persist the opt-in only after successful email verification; explicitly pass a strict `keepMeLoggedIn` boolean to `/users/verify-code`. Preserve legacy login visuals, 1.5-second redirect, confetti, alerts and subscription route.
- **Home:** Correct logout via shared helper; only show **Change Password** to an authenticated session; preserve existing navigation layout and application subscription checks.
- **Change Password:** New `changePassword.html` or an approved equivalent in existing account navigation; require current, new, and confirmation; show-password controls and autocomplete attributes. On success, explain that all affected sessions must log in again; never use automatic replay of the password-changing POST.
- **Forgot/reset:** Preserve anonymous flow and generic forgot response; validate link on opening, handle used/expired/superseded token; show clear messages without revealing whether an email is registered.
- **Other apps:** Modify only true token consumers, preserving form values, user operations, privacy headers, uploads, and GET/POST semantics. Unauthorized is not equivalent to subscription denied.

## 7. Recommended execution plan with exit criteria

### Preflight — read-only source and environment reconciliation

1. Verify exact local and remote branch casing; confirm branch points at intended Stage 6 candidate. Confirm test-only `.env.test` and **`sql5838929`**, without disclosing credentials.
2. Reconcile current Google Drive source with the actual local `reviseLogIn`/observed branch, including untracked new files; record commit/hash/date and a canonical deployable-file manifest.
3. Compare fresh `wappsDump.sql` (production snapshot, **read only**) with `wappsTestDump.sql` (test) and account for new `LoginVerificationT`/`PasswordResetT` alterations beyond the five test-only tables in the earlier handoff.
4. Prepare a versioned, file-by-file change ledger and existing functional-test baseline. Back up test files and test DB before writing. Do not run against production.

**Exit:** exact branch/candidate agreed; file inventory, schema delta and test safety guards documented.

### Group 0d — safe environment contract (design first, test locally)

- Define positively isolated local-test and hosted-test configuration; fail closed unless the effective/connected DB identity matches `sql5838929`; keep production mode as a separate future, unactivated design.
- Make HTTPS Secure-cookie behavior depend on trusted deployment mode, not a guard-prohibited `NODE_ENV` combination.
- Align exact allowed origins, CORS credential behavior and cookie-authorized endpoint CSRF defense; test missing/foreign/null Origin. Verify cookie domain/path/SameSite/clear behavior.
- Make `req.ip` policy conservative until Render proxy hops/header authenticity are tested; per-IP limit remains supplemental.

**Exit:** test process can start with safe local settings; proposed hosted staging start mode is explicitly test-only and rejects any other database.

### Group 0a — credential/version fence and schema

- Add version binding to login/reset grants and optional explicit web/TNNA challenge client field, with separate MySQL 5.5-compatible **test DB** SQL and verification scripts.
- Standardize lock order (`UserSecurityT` first) for login verification, password change/reset, revocation and refresh; revisit JOIN locking and bcrypt timing.
- Make security-row initialization/backfill idempotent; prove no registration/backfill window creates unprotected accounts.
- Write real two-connection race tests for challenge creation and session commit overlapping credential change/reset.

**Exit:** no stale challenge or reset link can mint/use a new valid credential after password change; rollback/deadlock outcomes are safe and observed.

### Group 0b — logout, supersession and refresh reuse

- Permit secure, cookie-bound logout when JWT expired; correctly clear only the intended cookie/session.
- Revoke existing incoming remembered session on successful full verification, including checked→unchecked login and account switch; failed verification must not revoke it.
- Implement and test approved recognized-reuse family policy and ensure revocation **commits**. Distinguish consumed, expired, revoked and random refresh secrets sufficiently to prevent sibling-cookie races and arbitrary revocation.
- Refine error/status contract. Test lost refresh response, delayed Set-Cookie, two tabs and offline logout.

**Exit:** tests prove server revocation and no silent restore after deliberate logout; unrelated devices/accounts remain unchanged.

### Group 0c — challenge controls and operational resilience

- Generate email codes with `crypto.randomInt`; cap attempts per challenge and per-account issuance; add durable throttling to relevant password/current-password attempts, with MySQL 5.5-compatible persistence.
- Set policy for old challenge supersession, client scoping, and challenge expiration.
- Evaluate global reset budget exhaustibility; avoid unbounded new keys once globally denied; define operational logging, backlog controls and safe cleanup scheduling.
- Repair obsolete tests (`stage6a.password-safety.test.js`) and add HTTP + DB behavioral tests; do **not** blindly execute `tests/*.js` with live side effects.

**Exit:** measured abuse limits, maintenance behavior and failure handling pass candidate tests without leaking identities or exhausting test quotas.

### Group 1 — browser foundation and password-account UI

- Deliver full `httpdocs/js/waAuth.js`, `login.html`, `home.html`, `subscription.html`, new `changePassword.html`, and necessary CSS/service-worker/cache changes.
- Implement checked/unchecked flow, silent restoration, protected-page startup, cross-tab serialization (Web Locks with safe fallback), correct server logout and 401/403/503 behavior.
- Preserve interactive login UI, original redirects, subscription eligibility, and user input. Link Forgot Password, Change Password and Login consistently.

**Exit:** local browser tests cover same/new tab, close/reopen, 8-hour boundary via controlled clock, sliding/absolute expiry, logout with expired JWT, unavailable DB and rate/email errors. No automatic mutation replay.

### Group 2 — account, admin and recovery pages

- Integrate `track.html`, `SubControl.html`, notification preferences, forgot/reset UI and any separately confirmed account dependencies.
- Test administrator versus non-administrator access, expired subscription versus expired JWT, password-change notification, valid/invalid/used/expired reset links, multiple browsers and account-wide revocation.

**Exit:** clear account UX and preserved server authorization; no incorrect logout on legitimate 403 or failed password entry.

### Group 3 — all other real browser consumers

- Integrate ETF, Budget, Family Tree/Networking, Weights, Activities, InterestEarned, property and their shared JS **in manageable tested batches**.
- Record one row **per deployable file**: original auth behavior, exact change (or no-change rationale), API dependencies, regression tests, result.
- Preserve Family Tree's `FTPrivacy.js` / `X-FT-Page-Token`, script order, uploads and public email/privacy verification; preserve financial mutations and unsaved forms; do not globally patch `fetch`.

**Exit:** each application's representative read/write/navigation test passes with remembered and ordinary sessions, expiration and denial cases; duplicate-mutating retries are absent.

### Group 4 — separate hosted test service and full acceptance

- Only after safe startup/isolation design, establish a **new** Render service bound to the verified Stage 6 branch, `sql5838929`, dedicated secrets/URLs and controlled email recipients. Verify instance plan/cost during setup; do not touch existing production service.
- Exercise HTTPS Secure cookies, Origin/CSRF, redirect/link hostnames, proxy IP reality/forged headers, restart persistence, multi-tab/device use, service worker cache, mobile browsers, PWA and outages.
- Use a dedicated **staging TNNA client/account**, not installed production phones, to test legacy access recovery, web/native credential revocation, online refresh, and offline/screen-off town announcements.
- Design a security-preserving rollback and future production migration sequence; never treat schema rollback or old JWT verifier redeployment as automatically safe.

**Exit:** redacted hosted test evidence, signed-off TNNA compatibility strategy, migration/rollback plan and complete regression matrix.

### Final approval gates

**After Groups 0–4 and all hosted/local acceptance:** assemble complete code diff, test commands/results, SQL/schema differences, threat/risk register, staging configuration, package manifest and rollback plan. Send the **completed candidate** to an independent design engineer (not merely these interim authors' reviews), resolve material findings, rerun tests and obtain user review. **Only after that** seek explicit user permission for any merge, production database changes or production deployment.

## 8. Decision register — approval needed before implementing dependent behavior

| ID | Decision | Recommended choice | Status |
|---|---|---|---|
| D1 | Exact Stage 6 branch case | Inspect Git; honor actual branch and user's no-`main` rule | **Verify** |
| D2 | Recognized refresh replay | Commit family revocation on proven reuse; no grace period; accept forced relogin after some lost responses | **Proposal** |
| D3 | Password different from current | Keep existing rejection, with clear UI/HTTP code, if explicitly approved | **Proposal** |
| D4 | Legacy web tokens at future cutover | Communicated fresh web login, no indefinite legacy acceptance | **Proposal** |
| D5 | Environment configuration | Positive `WA_ENV`-style staging/test guards and strict connected DB identity check | **Proposal** |
| D6 | Local cookie-auth development | Same-origin `http://localhost:8080` only unless an explicit alternative is reviewed | **Proposal** |
| D7 | Challenge/attempt thresholds | Initial engineering suggestion: 5 wrong codes/challenge; 5 challenges/account/hour; 5 wrong current passwords/account/15 min. Tune based on test evidence | **Proposal** |
| D8 | TNNA sliding token absolute cap | Defer policy change until native continuity/security review | **Unresolved** |
| D9 | Access-token browser storage | Keep `localStorage.token` for Stage 6, revisit separately | **Shared engineer recommendation** |
| D10 | Refresh lock fallback | Conservative full-login fallback if Web Locks absent and alternative unproven | **Proposal/test-dependent** |
| D11 | Password whitespace/Unicode handling | Standardize byte-preserving password policy after audit of registration/login/change/reset | **Decision needed** |

No decision should be marked user-approved solely because both engineering reports recommend it.

## 9. Acceptance matrix (compact)

| ID | Scenario | Required result |
|---|---|---|
| T01 | Original login UI and email code | Same visual flow, Show/Back/reset, confetti, success alert, 1.5-second redirect and subscription redirect. |
| T02 | Keep unchecked / checked | Only checked issues cookie; 8h standard; 180-day sliding and 365-day absolute remembered boundary. |
| T03 | Stale challenge and reset grant | Cannot mint/change credential after committed password change/reset, including concurrency. |
| T04 | Login supersession | Checked→unchecked, checked→different-account; prior session revoked only after successful verification. |
| T05 | Refresh races/replay | Serialized two-tab access; defined lost-response and recognized-reuse response; random invalid token cannot revoke anyone. |
| T06 | Logout with expired JWT | Server revocation using secure cookie/fallback; no silent restore; offline failure is honestly reported. |
| T07 | Change/reset password | Current/confirm checks, reused-password policy, notification, atomic all-session/TNNA-online invalidation and required login. |
| T08 | Errors/retry | 401 expiry, 403 subscription, 503 outage differentiated; no duplicate mutation, upload or lost form inputs. |
| T09 | Abuse controls | Guess/issuance limits, global limiter exhaustion, key/backlog growth and cleanup recovery verified. |
| T10 | Apps and privacy | Budget/ETF/FT/etc. work; Family Tree private headers and public verification paths preserved. |
| T11 | Hosted isolation | Dedicated staging branch, `sql5838929`, Secure cookie, strict CORS/Origin/CSRF, verified proxy, test-only mail and restart. |
| T12 | TNNA & rollback | Real staging native client recovers/refreshes; offline announcements unaffected; secure cutover/rollback documented. |
| T13 | Independent completed-candidate review | Written findings, severity, fixes, retests and go/no-go, then separate user decision. |

All tests should record exact candidate hashes, commands, dates, environment, expected and observed outputs, redacted evidence and unresolved issues. Existing Stage 6A tests are useful but are **not** substitute evidence for the revised candidate or hosted acceptance.

## 10. Delivery format for implementation groups

For every approved group, provide (1) complete new/revised source files, not excerpts; (2) per-file change ledger and exact baseline diff; (3) test-only, MySQL 5.5-compatible SQL where needed with preflight/postflight queries; (4) explicit local commands using `.env.test` and safeguards against production; (5) syntax and behavioral test evidence; (6) backup and rollback instructions; (7) a release manifest excluding `_COPY`, backups and handoff-only files; and (8) open issues requiring decisions.

**Safety boundary:** This synthesis does not authorize or perform any database update, credential reset, email delivery, branch merge, Render service creation or production change. Stage 6 remains under isolated development until all gates are satisfied.

---

### Review sources

- [Cod Stage 6B Design Engineering Review](https://drive.google.com/file/d/1MEyyr2shihiXr8o0pSoMcQpA-iypTH0Q/view)
- [Claude Stage 6B Design Engineering Review](https://drive.google.com/file/d/1ssPFeSi84jk2J7zdPIPWGXep7idZsV__/view)

**End of synthesis — proposed plan, not deployment authorization.**
