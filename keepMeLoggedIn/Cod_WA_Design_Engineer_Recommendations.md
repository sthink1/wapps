# Wonderful Apps: recommendations for Keep Me Signed In and Change Password

**Prepared:** October 14, 2026  
**Role:** Project design engineer  
**Workspace reviewed:** `C:\AppProjectwDB\WonderfulAppsRender`  
**Observed branch:** `reviseLogIn`  
**Deliverable:** Design recommendation and implementation roadmap; no application changes or deployment approval.

## 1. Recommended direction

Proceed with both features through a controlled, narrowly scoped implementation. Retain the existing eight-hour access JWT and email verification flow. Add a separate, revocable browser session with a refresh secret in an HttpOnly cookie. Build Change Password around current-password verification and an atomic update that invalidates website sessions.

My recommendation combines the first review's attention to small changes with the second review's stronger revocation and concurrency design. Neither review should be adopted wholesale. In particular:

- Do not deploy the earlier replacement package or rewrite all HTML pages.
- Include immediate website access-token revocation in the target design. Revoking refresh credentials alone leaves existing JWTs usable for up to eight hours.
- Integrate renewal explicitly into affected application startup/request paths. A universal bounce through `login.html` is insufficient for this codebase and can lose unsaved work.
- Preserve the eight-character minimum, confetti, existing success alert and 1.5-second delay, subscription redirects, page layout, application handlers, administrator behavior, and Family Tree privacy checks.
- Treat lifetime caps, TNNA revocation, legacy-token cutover, and password whitespace handling as explicit policy choices before implementation. This document recommends choices; it does not treat them as already approved.

The immediate next deliverable should be a baseline comparison and a short approved decision record, followed by backend/session work and incremental browser integration. A production release should follow the acceptance gates in section 11.

## 2. Evidence and limits of this review

I read all three supplied documents:

1. [Technical summary and initial attempts](Tech_Summary_KeepSignedIn_Project_with_Initial_Attempts.md).
2. [C design engineer review](C_WA_tech_response_Design_Engineer_Review.md).
3. [P design engineering review](P_WA_KeepSignedIn_ChangePassword_Design_Engineering_Review.md).

I inspected local `routes/users.js`, `routes/tnna.js`, both authentication middleware files, `server.js`, `dbConnection.js`, `package.json`, `logger.js`, `morgan.js`, `httpdocs/login.html`, `httpdocs/sw.js`, and relevant portions of `home.html`, `subscription.html`, Budget, Weights, Family Tree scripts, TNNA's browser entrypoint, `subscriptionService.js`, `CLAUDE.md`, and `TechSummary.md`. I searched the browser token consumers and JWT issuance/verification sites, and inspected relevant CREATE/ALTER definitions in `wappsDump.sql`.

This is a source-informed design review, not a completed runtime security audit. I did not connect to production or a live database, run browser tests, download fresh Drive originals, or inspect the old replacement ZIP. The SQL dump is evidence of its recorded schema, not proof of the currently installed database schema. Files not specifically inspected remain subject to the implementation inventory.

**A material discrepancy:** the summary describes experimental replacement files as installed locally. At this review, the local branch is `reviseLogIn`, but the inspected code has no browser-session service, browser-session helper, Change Password page, or corresponding endpoints. `login.html` still contains the confetti call, success alert, and 1.5-second redirect. The initial Git status showed only `keepMeSignedIn/` as untracked. Therefore, I cannot attribute the reported regressions to the current local files or assume the earlier experiment is still installed. Preserve and reconcile the actual versions before coding.

The supplied summary identifies Google Drive originals as the authoritative pre-change baseline. Before implementation, download actual originals, record hashes, and compare them with this working tree. Do not overwrite useful local changes or edit Drive originals as part of that comparison.

## 3. Findings from executable code

| Finding | Local evidence | Engineering consequence |
|---|---|---|
| Browser access JWTs last eight hours; refresh is absent. | `routes/users.js:301`; browser stores `localStorage.token`. | Add a separate refresh credential; never make the access JWT last 180 days. |
| Logout currently has no server-side effect. | `routes/users.js:243` is a success stub; `home.html:1340` removes the local token. | Implement device/session revocation and cookie clearing, including expired-token logout. |
| There are three direct JWT verification locations. | `middleware/auth.js:13`, `middleware/subscriptionAccess.js:16`, `routes/users.js:334`. | All must honor the same revocation rules; one permissive path defeats immediate revocation. |
| The two middleware functions expose different user shapes. | `auth.js` keeps only `userId`; subscription middleware keeps the whole payload. | Preserve each public middleware contract, especially `username` used by administrator checks. |
| The native issuer identifies its JWTs. | `routes/tnna.js:31` includes `client: 'tnna'`; current web issuer lacks a client marker. | Separate web/native validation deliberately; do not accidentally break native tokens in shared middleware. |
| The login experience is currently intact locally. | `login.html:191-196` contains confetti, alert, and delayed subscription-aware redirect. | Use additive changes and verify the exact original experience. |
| Token consumers are widespread and inconsistent. | Search found 53 HTML/JS files reading `localStorage.getItem('token')`; this is a file count, not 53 independent pages. | Inventory pages and shared scripts before choosing the integration surface. |
| There is no universal 401-to-Login behavior. | `subscription.html` redirects on 401; `BinForm.html:493` throws an API error; `Weights.html:683` can clear the token and throw without redirecting; Family Tree handlers commonly display errors. | The C review's universal Login recovery assumption does not hold. |
| Some pages capture a token once; others read it per request. | `Weights.html:658` has a top-level token; Family Tree uses token getter functions. | A refresh that updates storage does not update captured variables. Review each affected request path. |
| Password behavior conflicts with documentation. | Registration trims in `routes/users.js:26` and `register.html`; Login compares the supplied password unchanged; `CLAUDE.md` says preserve password bytes. | Resolve whitespace behavior explicitly rather than silently copying either review. |
| Verification can race and has no visible attempt cap. | Web `/verify-code` reads/updates without a transaction; `/login` uses `Math.random()` for six-digit codes. | One-time challenge consumption and bounded guessing are particularly important when issuing a long-lived credential. |
| Native refresh provides useful primitives, not the complete browser design. | `tnna.js` hashes secrets, locks, rotates, and binds to DeviceID; no browser-cookie or family replay-grace contract. | Reuse cryptography/transaction patterns, not the endpoint wholesale. |
| Browser credentialed CORS is not configured. | `server.js:40-42` has fixed origins/headers, no `credentials: true`; no configured proxy trust. | Define exact browser origins and HTTPS handling before cookie rollout. |
| Service worker already bypasses API/authentication requests. | `sw.js` skips non-GET requests, Authorization requests, and non-allowlisted paths. | No authentication-driven cache rewrite is indicated; test deployment and offline behavior. |
| Relevant SQL types are available. | `UsersT.UserID` and challenge/native `UserID` are signed `int(11)`; tables use InnoDB/utf8mb4. | Match foreign keys exactly; maintain MySQL 5.5 compatibility and UTC. |

No `WebRefreshTokenT` or `WebSessionT` definition was found in the local dump. Check the live staging/production schema before preparing a migration; an experimental table may exist there even though it is absent here.

## 4. Where I agree and disagree with the reviews

| Topic | Assessment and recommendation |
|---|---|
| Preserve existing stack/UI and use narrow diffs | Agree with both. Scope control means justified changes, not a predetermined tiny file count. |
| Keep JWT in localStorage for compatibility; refresh in HttpOnly cookie | Agree for this feature. Document existing XSS exposure; moving all access storage is a separate project. |
| C: leave nearly all pages unchanged and silently return from Login | Useful fallback for some entry paths, insufficient as the primary design. Code disproves uniform redirect handling, and navigation can lose entered data. |
| C: defer access-JWT revocation | Smaller patch, but weaker password-change semantics. Recommend P's revocation-aware website sessions for the target release. If deferred, disclose and explicitly accept the eight-hour residual window. |
| P: session records for unchecked logins | Agree. They permit individual logout and all-website revocation without granting persistent refresh authorization. |
| C: 30-second access-only grace for rotated tokens | A possible bounded concurrency fallback, not dropped-cookie recovery. Require active-family/version/expiry checks before issuing anything. |
| P: strict rotation and coordination | Good default mechanism, but unsupported locks and requests already in flight need a tested fallback. Do not claim strict reuse rejection alone guarantees multi-tab success. |
| C: revoke TNNA refresh rows using SQL alone | SQL can make the next native refresh fail, but does not immediately revoke existing native JWTs or serialize every native issuance race. Account-wide invalidation needs coordinated backend validation and tests. |
| P: do not trim passwords | Correct direction for byte-preserving password handling, but local registration already trims. Resolve the contradiction before creating a different password policy on Change Password. |
| C: short retention and small estimated database growth | Do not adopt the estimates without measurement. Frequent loads, races, and replay-history retention can increase row counts. |

## 5. Proposed policy decision record

| Decision | Recommended choice | Consequence / status |
|---|---|---|
| Remember period | 180 days of sliding inactivity for browser refresh authorization. | Renewal occurs on successful foreground renewal, not hidden polling. This makes the agreed period precise. |
| Absolute lifetime | 365 days from full password/email authentication. | Proposed additional cap; requires acceptance. No automatic renewal beyond it. |
| Unchecked login | Eight-hour access JWT plus a nonrefreshable website session. | Retains the existing eight-hour behavior; browser closing need not destroy the local JWT. |
| Ordinary logout | Revoke current website session and all refresh generations; reject its subsequent access requests. | Other browser sessions remain usable. This strengthens current server logout behavior. |
| Password change | Immediately revoke all website access/refresh sessions, including unchecked sessions; require full login. | Recommended target. Invalidate challenges from the old credential state. |
| TNNA | Recommend account-wide online invalidation for a password change. | Requires acceptance and native compatibility verification. Offline town monitoring cannot be remotely stopped by server revocation. |
| Legacy web JWTs | Require one fresh website login at cutover. | Proposed operational change. A temporary eight-hour legacy allowance is an alternative with incomplete revocation during transition. |
| Password whitespace | Preserve current-password input exactly; reject leading/trailing whitespace in new passwords with a clear message rather than silently trimming. | Proposed compatibility rule for Change Password, requiring acceptance. Keep registration unchanged in this feature; resolve a broader byte-preserving registration policy separately. |
| Password minimum / bcrypt | Eight characters, bcrypt cost 10, backend confirmation check. | Existing minimum/cost preserved. Review Unicode and bcrypt byte limits before adding a maximum-length policy. |
| Rotation fallback | Strict serialized rotation; consider a 30-second access-only grace for already consumed tokens. | Grace is a proposed, explicitly bounded replay tradeoff. It cannot recover a lost successor cookie. |

Do not add new-equals-old rejection, a different password minimum, security notification email, or a device-management screen without recording it as an additional feature/policy choice. The numeric cap, grace window, and throttle values here are engineering proposals, not values prescribed by external standards.

## 6. Recommended backend architecture

### 6.1 Website sessions and access validation

Use one website session model for both checked and unchecked logins. Suggested logical components:

- `WebSessionT`: random SessionID, UserID, persistent flag, website credential version at issuance, creation time, refresh inactivity/absolute expiry, revocation time/reason. Unchecked sessions expire with their eight-hour JWT and have no refresh secret.
- `WebRefreshTokenT`: hashed high-entropy refresh secrets linked to SessionID, generation, issuance/consumption/expiry timestamps. Retain bounded consumed-token history for replay recognition.
- A small user-linked security table: website credential version and, if approved, a separate native invalidation epoch/version. Avoid reusing `UsersT.TimeStamp`; it changes for unrelated account updates.
- Extend challenge state with credential-state binding, attempt tracking, and client/remember intent where needed. Native and website challenge consumers share `LoginVerificationT`, so this change requires both-path review.

These are logical names, not migration SQL. Reconcile any installed experimental table first. A consolidated model is acceptable if it supports the same invariants; do not create overlapping stores accidentally. Use signed `int(11)` UserID, InnoDB, appropriate unique/hash/session/user/expiry indexes, UTC DATETIME values, and MySQL 5.5-compatible DDL. Never include real account data or credentials in migration examples.

New web JWTs retain `userId` and `username`, with explicit web client, session ID, and credential-version claims. A shared verifier checks signature, established algorithm, expiry, account version, and session revocation before existing authorization. Keep the external `req.user` shapes expected by each middleware. Update the inline `/users/is-admin` validation while retaining its existing administrator decision rules.

Use request-scoped reuse of a validated result if a request crosses both middleware paths. Initially avoid a cross-request revocation cache that would weaken immediate invalidation. Measure added database latency and connection demand. On database failure reject protected work with a temporary-service error; do not accept a signature alone as fallback.

For native tokens, preserve the verified `client: 'tnna'` classification. New website-session checks must not demand a WebSessionID from existing native JWTs. If native online invalidation is approved, enforce the chosen native epoch/version in both native refresh/issuance and shared access verification. Define handling of existing unmarked web JWTs and reject malformed/unrecognized token classes.

### 6.2 Endpoints and issuance

Prefer names that extend existing routes:

| Endpoint | Contract |
|---|---|
| `POST /users/login` | Existing credentials/email workflow. Record a strict boolean remember choice in challenge state; absent means false. Preserve TNNA callers with no new required field. |
| `POST /users/verify-code` | Atomically consume the challenge once, validate credential state, create website session, issue eight-hour JWT, optionally issue refresh cookie. Preserve response keys and subscription-aware redirect. |
| `POST /users/refresh-session` | Cookie-authorized renewal after explicit request defenses; validate session/version/lifetime, rotate, return access JWT. Never create or extend development entitlement. |
| `POST /users/logout` | Idempotently revoke current website session. Accept valid cookie identification and/or validated session-bearing JWT; an expired access JWT must not prevent cookie logout. |
| `POST /users/change-password` | Valid website session plus current/new/confirm password; derive identity only from authentication. Commit password/revocation atomically. |

After a successful full login, supersede the old browser session represented by its cookie. If unchecked, clear the old refresh cookie and issue no new refresh secret. Do this only after successful verification: failed credentials/code must not revoke a legitimate existing session. Do not trust a client-supplied UserID.

Preserve `getOrCreateDevelopmentTrial` on interactive verification and its redirect logic. Its current helper uses the pool directly; implementation must review transaction boundaries rather than assume it shares a new session transaction. Prefer a scoped connection-aware integration if needed to preserve one-time entitlement creation safely. Refresh does not call this helper. Entitlement denial must still come from existing subscription middleware, including after renewal.

Return `Cache-Control: no-store` on credential responses. Add machine-readable errors distinguishing access expiry, revoked session, CSRF, and temporary dependency failure while preserving existing response conventions. Wrong current password should return 403 with a specific error code, avoiding existing clients' 401 sign-out behavior; session failure is 401, malformed input 400, throttle 429, dependency failure 503.

### 6.3 Rotation, retention, and concurrency

Generate refresh secrets with Node `crypto.randomBytes` (at least 32 bytes); store only a SHA-256 hash, never plaintext or a browser-readable refresh response. Copy the original absolute-expiry anchor across rotations:

```text
refresh expiry = min(successful foreground renewal time + 180 days,
                     original full-login time + approved absolute lifetime)
```

Serialize current-generation validation and consumption inside a database transaction. All website issuance/refresh/password-change operations should lock in a consistent order: user/security state, session, then challenge/token rows as applicable. A preliminary hash lookup may identify the user, but must be revalidated after locks. Review native operations for the same order if they participate in account-wide revocation. Retry database deadlocks only with bounded, transaction-safe handling.

Use one refresh promise per tab and browser-wide coordination where supported. Recheck storage after acquiring the lock. A lock coordinates cooperating tabs; it does not eliminate delayed responses or malicious replay.

If adopting the proposed 30-second grace, a consumed token may yield an access JWT only while its session, version, idle expiry, and absolute expiry remain valid. It must not rotate again, extend refresh expiry, or set a replacement cookie. A stale response must not clear or overwrite a valid successor cookie. Outside grace, recognized reuse can revoke that session family; unknown random credentials cannot revoke unrelated families. Test retries and dropped responses to avoid false theft detection during routine use.

The grace admits brief reuse by an attacker holding a consumed token; record that tradeoff. Hash-only storage cannot reconstruct a random successor secret. If the successor cookie is lost, full authentication may be required. Do not build indefinite recovery or repeat a potentially consumed refresh automatically after a timeout.

Keep consumed history for the session's relevant replay-detection lifetime, or explicitly document a shorter detection horizon. Deleting rotated rows after 30 days prevents recognizing older reuse; it does not provide full-family-lifetime detection. Use bounded cleanup and measure table/index growth using observed renewal frequency rather than assuming a maximum of three rows per day.

### 6.4 Change Password transaction

Verify the current password and calculate the new bcrypt hash before holding avoidably long database locks. Then lock user/security state and recheck that the verified password-hash/version snapshot is still current. Update password, increment applicable security version, revoke website sessions, invalidate old-state challenges, and, if approved, revoke native authorization in the same transaction. A concurrent change must not silently overwrite a newer password.

All challenge consumers must reject a challenge established before the credential change, including native verification if account-wide scope is selected. A shared challenge's missing client classification complicates web-only challenge revocation: add classification/binding or explicitly accept broader challenge invalidation. Merely deleting visible rows without coordinating an in-flight verification is insufficient.

Commit before reporting success; then expire the browser cookie. Never change username, user identity, subscription rows, administrator status, or privacy state as a side effect. If the success response is lost, the UI must explain uncertainty and direct the user to login with the new password; do not automatically resubmit the change.

### 6.5 Necessary hardening

Treat single-use challenge consumption, secure code generation, bounded code guessing, and credential-version race handling as prerequisites for safely issuing long-lived browser credentials, subject to the documented change plan. They directly protect these features, although the weaknesses predate them.

Propose five failed code/current-password attempts per 15 minutes with appropriate challenge/user/IP keys and a retry policy; confirm limits before implementation. Throttle Login as well. An in-memory limiter is acceptable only with documented single-instance/restart limitations; durable/shared enforcement is stronger and may require additional schema. Do not promise distributed protection from a process-local map.

Log event types, nonsecret session identifiers, and user IDs through existing Winston/Morgan facilities. Never log passwords, email codes, raw cookies, refresh secrets, JWTs, or request bodies containing them. No new package, framework, or installer is needed for the core design; any operational expansion should be reviewed explicitly.

## 7. Browser integration without regressions

Create `httpdocs/js/wa-session.js` as an opt-in module/helper with an explicit namespace and no conflicting top-level `BASE_URL`. It must not replace global `fetch`, overwrite unrelated Authorization headers, or reload application pages. Suggested methods: `ensureSession`, `getAccessToken`, `waFetch`, and `logout`.

`ensureSession` returns authenticated, signed out, or temporarily unavailable. Decode JWT expiry only to schedule renewal; browser decoding is not authoritative validation. Use a server-validated session-status operation or equivalent protected validation before enabling Change Password. A cached, unexpired JWT does not prove the server has not revoked it.

Protected startup awaits session resolution before initial protected API calls. Requests obtain the current token when sent instead of relying on captured constants. Restrict `waFetch` to approved WA API origins/routes. Preserve headers, payloads, and Family Tree `X-FT-Page-Token`. Retry at most once after a specific pre-handler access-expiry rejection, with a replayable body. Never retry arbitrary 403s, network timeouts, uploads without an explicit policy, or a mutation that may already have executed.

Integrate home, login, and Change Password first, then shared Budget and Family Tree paths and other inventoried consumers in reviewable batches. Include each page that needs startup restoration or renewal; leave unrelated public content unchanged. Test each batch. Login may remain a recovery fallback, with explicit allowlisted same-origin return targets and loop prevention. Do not rely on `document.referrer`: it may be absent and loses important page parameters/state.

For login, add the unchecked checkbox and carry its choice through the existing verification flow. Preserve script imports, service-worker registration, Show/Back/reset handlers, error messages, styles, confetti, alert, and delayed redirect. Silent restoration should not play interactive-login confetti.

Home's new link starts hidden and appears after validated authentication. New Change Password form starts disabled until authorization is resolved; signed-out direct navigation goes to Login. Backend authorization remains mandatory. Follow existing light-mode styling, show toggles, eight-character validation, and `textContent` messages.

Before logout, increment a local authentication generation, clear the access token, record pending logout, and notify other tabs. An in-flight refresh result may only update storage if its generation/account still matches. Successful server logout revokes the session and clears the cookie. Offline failure keeps the pending marker and blocks all restoration until revocation succeeds; do not claim remote revocation has completed. Coordinate logout/account switching with refresh so delayed Set-Cookie responses cannot leave a newly usable session. Server revocation remains the authority even if a stale revoked cookie arrives.

Password-change success clears local access, blocks silent restoration, notifies tabs, shows success, and directs the user to fresh login. Preserve unsaved form text on temporary failures and disable protected actions until authentication can be established. A logout marker is a local safeguard, not protection if storage is erased or a copied credential is used elsewhere.

## 8. Cookies and environment configuration

For the proposed `/users/*` endpoints, recommend a host-only cookie such as `wa_rt` with `HttpOnly; Secure; SameSite=Strict; Path=/users`. Limit Max-Age to the server's remaining refresh lifetime. Use the same name/path/domain policy for clearing. Different production hostnames have separate cookies and browser storage; do not promise shared login across them.

Production Secure should come from explicit deployment configuration and verified HTTPS/proxy topology. Do not make it depend solely on an arbitrary `X-Forwarded-Proto` header. Local HTTP may use a clearly development-only non-Secure setting. No unconditional global `trust proxy` change is indicated; if needed, configure it for the actual trusted proxy topology.

Require JSON and a custom session header plus strict approved Origin handling on cookie-authorized operations, including logout and full verification that sets/supersedes cookies. Reject unexpected or `null` origins; explicitly define missing-Origin handling instead of accepting it accidentally. Existing native clients need their separate token/body contract. Keep exact credentialed browser CORS origins and headers; retain `X-FT-Page-Token`. Do not automatically grant all existing native origins browser-cookie privileges.

The local URL rule sends pages on other localhost ports to port 8080, but the current CORS list does not authorize arbitrary ports. Confirm actual development ports. Same-site/different-origin localhost still needs credentialed CORS. A genuinely cross-site deployment requires a different cookie policy and may face third-party-cookie restrictions; prefer same-origin hosting.

The current service worker already bypasses API/POST/Authorization requests. Keep its cache strategy unless tests demonstrate a necessary change. Use a versioned helper URL and test old/new page/backend combinations, offline fallback, browser cache, and installed PWA updates. Do not promise 180-day retention if browser privacy settings, cookie clearing, or storage eviction remove authorization earlier.

## 9. Expected file and SQL changes

| File/component | Reason / scope |
|---|---|
| `routes/users.js` | Challenge binding/consumption, session issuance, refresh, real logout, password change, revocation-aware admin validation. |
| `services/browserSession.js` (new) | Browser session, cookie, rotation/revocation, and transaction helpers. |
| Shared verification helper (new, final location to choose) | One revocation contract reused by existing verification paths. |
| `middleware/auth.js`, `middleware/subscriptionAccess.js` | Integrate verifier while preserving request-user and authorization contracts. |
| `httpdocs/login.html`, `httpdocs/home.html` | Add checkbox/restoration and authenticated navigation/logout with minimal layout changes. |
| `httpdocs/changePassword.html` (new) | Validated authenticated form and fresh-login success flow. |
| `httpdocs/js/wa-session.js` (new) | Explicit startup, scoped request renewal, tab/logout coordination. |
| Affected protected HTML/JS consumers | Inventory-driven startup/current-token integration; justify every file. |
| `server.js` | Necessary credentialed CORS/header and environment integration only. |
| `routes/tnna.js` | Challenge compatibility review; issuance/refresh revocation integration if native scope is approved. |
| Separate SQL migration and operational rollback instructions | Session/security/challenge state, indexes, installed-schema preconditions, retention. |
| `CLAUDE.md`, `TechSummary.md`, schema reference | Update after validated implementation to reflect actual approved behavior. |

Normally leave `dbConnection.js`, registration, notification delivery, application business rules, styling assets, and service-worker caching unchanged. Review registration semantics without incidentally editing them. If the chosen design needs a connection-aware subscription helper, document its narrowly scoped change separately.

## 10. Required acceptance evidence

Use checked browser A with multiple tabs, unchecked browser B, separate device C, administrator/nonadministrator accounts, and new/active/expired subscriptions. Include native online/offline testing if affected. Exercise time boundaries through a controlled test clock or test configuration, not production-clock changes.

| Test group | Required result |
|---|---|
| Baseline login | Wrong credentials/code, expiry, Back/reset/Show, confetti, alert, delay, and original subscription redirects preserved. |
| Checked/unchecked issuance | No persistent credential before verification; checked gets cookie; unchecked removes superseded persistence and remains eight-hour-only. |
| Return visits/direct links | Remembered browser restores home and affected app startup; relevant query parameters preserved. |
| In-page expiry | Renewal preserves unsaved Budget/Family Tree input; no forced reload, third-party request interception, or changed payloads. |
| UTC expiry | Sliding and absolute limits/cookie lifetime obey exact boundaries; background polling does not sustain authorization indefinitely. |
| Races/replay | Multi-tab requests, unsupported locks, delayed Set-Cookie, lost responses, grace expiry, consumed-token reuse, and cleanup horizon follow the specified contract. |
| Logout | Current session's access and refresh rejected; other device remains usable; pending offline logout blocks restoration; refresh cannot undo logout. |
| Password validation | Wrong current password, malformed input, mismatch, seven/eight-character boundary, accepted whitespace/Unicode policy, throttling. |
| Password-change races | Concurrent changes and simultaneous refresh/web/native verification cannot issue usable authorization from old credential state. |
| Revocation | All targeted website sessions rejected, including unchecked; approved native scope enforced online; offline limitation demonstrated. |
| Navigation/UI | Change Password hidden/disabled while signed out/checking; direct endpoint and page access cannot bypass authorization. |
| Permissions | Original administrator, subscription, ownership, Family Networking and per-visit privacy-unlock behavior survive renewal. |
| Environment | Actual localhost ports, Render HTTPS, each deployed hostname, forged origins/headers, cookie deletion, installed PWA, mobile browsers. |
| Failure handling | Database/network/service failure never grants access; no automatic retry of uncertain mutations; sensitive data absent from logs/caches. |
| Deployment/rollback | Legacy transition and mixed-version handling documented; rollback does not revive revoked JWTs or restore old passwords. |
| Regression | Exact baseline diffs with feature justification per hunk; every touched app tested, untouched relevant files remain unchanged. |

There is no working test command in `package.json`: `npm test` is a placeholder that fails. Plan a meaningful authentication/API test harness and browser checks; do not represent syntax checks as feature validation. Record environment, test ID, expected/actual results, and evidence, with credentials redacted.

## 11. Implementation sequence and release gates

1. **Capture versions.** Download authoritative originals; preserve local/experimental copies; hash and compare them. Obtain installed schema definitions without exporting account data. Reconcile the summary's installation claim.
2. **Record decisions.** Confirm section 5 choices and actual origins/proxy topology. Produce the final claim, cookie, endpoint, locking, retry, and transition contracts plus a page integration inventory.
3. **Implement backend on an isolated branch.** Add schema, session/verification services, atomic challenge/password paths, and middleware integration. Prove revocation and race behavior before UI integration.
4. **Integrate login/home/password UI.** Demonstrate original login behavior and device-specific logout. Review exact diffs before expanding to application consumers.
5. **Integrate affected apps in batches.** Start with Budget and Family Tree, then remaining inventory. Prove startup restoration and in-place expiry without input loss; retain private-page tokens and application-specific headers.
6. **Validate and package.** Run the complete matrix. Supply complete files, baseline diffs, file/change manifest, separate SQL, manual copy instructions, migration/cutover steps, and test evidence. No installer or broad refactor.
7. **Release only after operations review.** Back up code/schema, apply additive SQL first, deploy compatible backend/frontend, execute approved legacy cutover, smoke-test, and monitor failures/table growth.

Use focused commits and a hunk-by-hunk change ledger. SQL DDL on MySQL 5.5 must be treated as operational migration work, not assumed transactionally reversible. Rollback must retain enforcement of new revocation state or use maintenance mode; returning to the old stateless verifier can revive still-unexpired credentials. Never restore old password hashes as routine rollback or immediately drop security-state tables.

These gates apply to the subsequent implementation/release. They do not prevent producing this recommendation now. The recommendation is complete; runtime acceptance remains future engineering work.

## 12. Residual risks and supporting guidance

Even the recommended design retains browser-readable access JWTs and existing third-party scripts. HttpOnly protects against direct refresh-cookie reading, but a successful same-origin script injection can still act as the user. A CSP/XSS-hardening effort is valuable separate work, with care for existing inline code and CDN dependencies. A stolen unlocked browser remains authorized until expiry/revocation; offline logout cannot revoke a copied remote secret. Native offline activity and browser retention limits also remain outside immediate server control.

The following primary references were checked for general security guidance. WA-specific lifetime values, grace algorithms, and scope choices above are my engineering proposals:

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): server-managed expiration/invalidation and cookie defenses support the session lifecycle approach.
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): current-password verification and throttling support the password-change/login controls.
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html): origin validation and restricted custom-header/CORS contracts support explicit defenses for cookie-authorized endpoints.

**Engineering disposition:** proceed to baseline reconciliation and policy approval, then implement the revocation-aware browser-session design in measured stages. Release only when authentication, concurrency, and existing application behavior have been demonstrated together.
