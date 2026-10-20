# WonderfulApps — Design Engineering Review
## Keep Me Signed In and Change Password

Date: October 14, 2026
Branch under review: reviseLogIn
Review type: Requirements, architecture, security, integration, and release-readiness review
Disposition: Proceed with a controlled design and implementation review; do not approve the experimental package for production yet.

## 1. Executive decision

The requested features fit WA's existing architecture. Retain the eight-hour access JWT, add a separate browser-session/refresh mechanism, and implement Change Password as an authenticated server-side operation. Do not lengthen access JWTs to 180 days, store browser refresh credentials in localStorage, or replace the existing login/home pages with simplified versions.

The previous attempt is not acceptable as the implementation baseline because the briefing reports unapproved functional regressions and unresolved authentication behavior. Preserve it for comparison, not deployment approval. [file:17]

This is a substantive design review of the supplied documentation, not a verified source-code audit. No application has been run, no browser or database tests performed, and no original-versus-experimental code diffs inspected. Proposed contracts and logical fields below are design specifications subject to source verification; they are not claims about existing code.

## 2. Evidence and confidence

| Material | Reviewed | Evidentiary role |
|---|---|---|
| WA_reviseLogIn_Design_Engineer_Technical_Summary.md | Yes | Requirements, reported regressions, unresolved issues, and change-control constraints. |
| CLAUDE.md | Yes | Documented architecture, routing, database conventions, subscription boundaries, and native-app context. |
| TechSummary.md | Yes | Documented application contracts and deployment overview. |
| Original login/home/user routes/auth middleware/server/database dump | Not inspected in this review | Required to validate the detailed design against executable behavior and actual schema. |
| Experimental replacement files | Not inspected | Required to classify actual changes and confirm reported problems. |
| Runtime, production configuration, installed database state | Not tested | Required before release approval. |

Treat the missing confetti and password-minimum mismatch as reported confirmed regressions in the briefing, not independently reproduced observations. Treat fetch wrapping, reload behavior, races, and revocation gaps as review findings requiring code inspection. [file:17]

Documentation discrepancies already require reconciliation: the briefing names public/ pages while the guides describe httpdocs/; TechSummary includes both a 60-table description and a 56-table subtotal. Neither document should determine final migration paths or table counts in place of current source and wappsDump.sql. [file:17][file:6][file:9]

Security guidance checked for this review: OWASP Authentication, Session Management, and CSRF Prevention cheat sheets. They support current-password verification, server-enforced revocation/expiry, and explicit CSRF protection for cookie-authenticated operations. The exact WA policy and numeric limits below are engineering proposals, not OWASP-prescribed values. [web:18][web:19][web:20]

## 3. Mandatory requirements and scope boundaries

Preserve these requirements:

- Optional checkbox, unchecked by default, labeled “Keep me signed in on this device.”
- Password and email-code verification must complete before persistent browser credentials are issued.
- Unchecked login retains eight-hour access-token behavior without granting long-lived refresh authorization.
- Persistent login supports the agreed 180-day renewable period.
- Ordinary logout targets only the current browser session unless another policy is explicitly approved.
- Change Password requires active authentication, current password, new password, and confirmation.
- Keep the existing eight-character minimum; do not trim or sanitize passwords or silently change registration rules.
- On successful password change revoke website persistent credentials and require fresh login.
- Preserve confetti, success message, 1.5-second delay, layout, script dependencies, service-worker registration, subscription redirects, admin behavior, and application/privacy functions.
- Use the existing JavaScript/Node/Express/HTML/CSS/MySQL stack. Deliver complete files, separate SQL, exact diffs, and manual installation instructions; no installer or unrelated upgrades.

These are supplied requirements, not discretionary improvements. [file:17]

Out of scope unless separately approved: forgot-password/reset-password, new MFA mechanisms, registration-policy redesign, payments, native-app storage replacement, unrelated UI cleanup, and framework migration.

## 4. Findings and release blockers

Severity here denotes impact on acceptance, not a formal vulnerability rating.

| ID | Priority | Finding | Required resolution |
|---|---|---|---|
| DE-01 | Blocker | Source baseline and experimental state not compared. | Obtain originals, experimental files, and installed schema; produce exact diffs. |
| DE-02 | Blocker | Briefing reports removed confetti and altered login behavior. | Rebuild modifications on original login page and reproduce full baseline behavior. |
| DE-03 | Blocker | Password policy differed between registration and change flow. | Enforce consistent existing rules in UI and backend; test eight-character boundary. |
| DE-04 | Blocker | Refresh revocation does not guarantee access-JWT revocation. | Approve revocation scope and enforce it at every protected validation path. |
| DE-05 | Blocker | Frontend startup and refresh integration are unspecified. | Inventory consumers; define asynchronous startup without reloads or global request interference. |
| DE-06 | Blocker | Rotation/replay handling is unspecified. | Test concurrency, stale responses, dropped responses, replay, and crash recovery. |
| DE-07 | Blocker | Cookie/CORS/CSRF environment assumptions are unverified. | Specify and test actual origins, cookie scope, CSRF defenses, and proxy configuration. |
| DE-08 | Decision required | 180-day renewal and absolute lifetime unresolved. | Record an explicit policy before implementation. |
| DE-09 | Decision required | TNNA revocation after password change unresolved. | Approve web-only or account-wide behavior and disclose limitations. |
| DE-10 | Release requirement | Failure, logout-offline, migration, and rollback semantics incomplete. | Specify failures and a security-preserving rollback procedure. |

DE-02 through DE-09 derive from issues recorded in the supplied briefing; their actual implementations remain unverified. [file:17]

## 5. Recommended policy decision record

### P1 — Session lifetime

Propose a 180-day sliding inactivity period for persistent browser authorization, renewed by successful foreground session renewal. Do not renew solely because a hidden tab polls the server. Continue issuing access JWTs with the existing eight-hour duration.

Also propose a 365-day absolute browser-session-family lifetime from full password/email authentication. Renewal must never extend beyond that cap. Formula:

    refreshExpiresAt = min(now + 180 days, absoluteExpiresAt)

The 365-day value is a proposed convenience/security tradeoff, not an approved requirement. It adds periodic full authentication beyond the supplied requirement and therefore requires explicit approval. If unlimited rolling renewal is chosen instead, record that residual risk rather than pretending an absolute timeout exists. OWASP distinguishes idle, absolute, and renewal timeouts; the long remember-device credential is separate from a short interactive session. [web:20]

Specify expiry boundaries in UTC and enforce them on the server. Cookie lifetime must not exceed server authorization lifetime.

### P2 — Ordinary logout

Recommend immediate revocation of the current website session and its access JWTs, with other browsers unaffected. Revocation requires server-side session checks, not just cookie deletion. [web:20]

### P3 — Password change

Recommend immediate invalidation of all website access and refresh sessions, including nonpersistent website logins. Require a new password/email-code login after success. Revoke any pending website verification challenges established under the old credential state.

### P4 — TNNA scope

Recommend account-wide invalidation for a password change, but only with explicit approval and coordinated native compatibility testing. If the approved scope is website-only, use a website-specific version/session namespace so shared middleware does not accidentally revoke native sessions.

Native offline use is an important limitation: the guides describe TNNA offline continuation. Server revocation cannot instantly reach a disconnected native device; do not promise immediate cessation of local/offline town monitoring. Online native access and refresh rejection can be tested separately. [file:6][file:9]

### P5 — Re-login with checkbox unchecked

After a successful full login with the box unchecked, revoke/replace any old persistent website session belonging to that browser and clear its refresh cookie. Issue a nonpersistent eight-hour session only. This avoids a previously remembered browser silently retaining long-lived authorization contrary to the new choice. Do not revoke the old session merely because an unverified login attempt began.

### P6 — Password requirements

Preserve the existing eight-character minimum and all verified baseline password semantics. Do not silently add a 12-character minimum. Review maximum length and Unicode/bcrypt handling against registration before adding any new rule. Reject confirmation mismatch on the backend as well as in the UI. Current-password verification is mandatory. [file:17][web:18]

All P1–P5 choices are proposed decisions. User approval remains outstanding.

## 6. Proposed server architecture

### 6.1 Logical components

- Browser-session service: issue, validate, renew, rotate, and revoke website sessions.
- Existing login/verification integration: issue a web session only after the existing successful verification path.
- Shared access-token verifier: verify signature/expiry and server revocation state before route authorization.
- Change-password operation: verify current password, update hash, increment applicable credential version, and revoke sessions atomically.

Do not duplicate JWT verification in a new helper while old admin or subscription checks remain permissive. Inventory every jwt.verify call, custom administrator check, and token issuer before modifying validation.

Preserve existing identity claim names and request.user conventions. Proposed additions are session ID, client type, and web credential version; exact claim names must be chosen after inspecting existing tokens and TNNA consumers.

### 6.2 Access-token/session strategy

Recommend a server session record for every new website login, including unchecked login. Unchecked sessions have no refresh secret and expire with the eight-hour access token. Persistent sessions can renew via refresh cookie.

For each protected website request:

1. Verify JWT signature, accepted algorithm, expiry, and established claims.
2. Resolve the website session and user credential version.
3. Reject revoked/expired sessions or mismatched credential version.
4. Run existing subscription, ownership, admin, privacy, and validation checks unchanged.

An authentication refresh must not grant subscription access or unlock Family Tree privacy. It must not rerun development-entitlement creation or extend a trial. [file:6][file:9]

No revocation cache in the first implementation unless its delay is explicitly accepted. Database failures must not bypass authentication checks. Measure the extra query cost in WA's environment before release.

### 6.3 Logical persistence model — not executable SQL

Suggested table name: WebSessionT, or a reconciled extension of the experimental WebRefreshTokenT if the installed schema supports the approved model. Do not create both casually.

| Logical field | Purpose |
|---|---|
| SessionID | Random identifier used in JWT/session lookup; not itself a refresh secret. |
| UserID | Existing account linkage with exact type/collation verified from dump. |
| Persistent | Distinguishes remembered and eight-hour-only sessions. |
| CredentialVersion | Account website version at issuance. |
| RefreshTokenHash | Hash of current high-entropy refresh credential; nullable for unchecked sessions. |
| TokenGeneration | Monotonic rotation generation. |
| CreatedAt, LastRenewedAt | UTC lifecycle timestamps. |
| IdleExpiresAt, AbsoluteExpiresAt | Approved lifetime boundaries. |
| RevokedAt, RevocationReason | Revocation and operational audit. |

Use an account-level WebCredentialVersion, on UsersT or a small linked security table chosen after schema inspection. Increment it on website-wide revocation. Ordinary logout revokes only the session row.

Indexes should support unique session lookup, current-token-hash lookup where used, user-wide revocation, and cleanup. Determine exact indexes and foreign keys from actual schema. Preserve MySQL 5.5/InnoDB/UTC conventions; do not assume modern JSON columns or other unsupported features. [file:6][file:9]

Generate proposed refresh secrets using the existing Node cryptographic facilities with 32 random bytes and hash them server-side. Do not log them. This is a design choice; exact encoding, cookie length, and lookup implementation require code review.

## 7. Proposed endpoint contracts

Names below are proposals; inspect existing routes before fixing them.

| Operation | Proposed interface | Authorization and behavior |
|---|---|---|
| Start login | Existing POST /users/login | Retain baseline credentials/email-code behavior; carry the user's remember choice in trusted challenge state. |
| Complete verification | Existing POST /users/verify-code | Consume challenge once, preserve entitlement/redirect logic, issue access JWT and optional persistent cookie. |
| Restore/renew | POST /users/session/refresh | Cookie plus CSRF defenses; check session/version/expiry; rotate and return new access JWT. |
| Logout | POST /users/session/logout | Valid session/cookie identification plus CSRF defenses; idempotent current-session revocation and cookie clearing. |
| Change Password | POST /users/change-password | Valid website session, current password, new password, confirmation; atomic password/version/revocation update. |

Successful refresh response proposal:

    { token, expiresAt, sessionState: "authenticated" }

Keep existing application identity claims. Do not send the refresh credential in JSON, a URL, or browser-readable storage. Mark credential responses Cache-Control: no-store and exclude authentication responses from service-worker caching.

Use a stable error code for refreshable access expiry, distinct from revoked sessions, invalid credentials, subscription denials, ownership denials, and privacy denials. If changing existing HTTP status conventions would break clients, preserve status compatibility and add a machine-readable code. Never refresh in response to every 403.

Proposed outcomes: 400 malformed input; 401 invalid authentication/current password; 403 CSRF or authorization rejection; 429 throttled; 503 temporary dependency failure. Exact status mapping must be reviewed against existing clients.

## 8. Rotation, multiple tabs, and dropped responses

Choose an explicit algorithm rather than adding unrestricted “grace reuse.”

Recommended first design: strict one-time rotation with database serialization and browser-wide refresh coordination. This trades some lost-response convenience for simpler, auditable security.

Server transaction:

1. Identify and lock the current session row using the established refresh credential.
2. Check revocation, credential version, lifetime, and generation.
3. Generate a successor refresh credential.
4. Update its hash/generation and approved expiry atomically.
5. Commit, then return JWT plus replacement cookie.

Retain bounded consumed-hash history where needed to recognize replay. Reuse of a consumed token revokes that session family, not all of the user's devices. An unknown random token does not justify revoking unrelated sessions.

Client coordination:

- One refresh promise per tab.
- Browser-wide exclusive refresh where supported; after acquiring the lock, recheck whether another tab already renewed the shared access token.
- Notify other tabs of renewal/logout without exposing refresh secrets.
- Test the browser-support baseline; if a lock mechanism is unsupported, a tested fallback or documented full-login fallback is required. A casual localStorage “lock” is not adequate proof of correctness.

Dropped response behavior must be disclosed: if the server consumes a refresh credential but the successor cookie never arrives, transparent recovery is not guaranteed under strict rotation. Require full login rather than weakening replay defenses silently. Do not clear all local state for an ordinary timeout, but avoid automatic repeated refresh of a token that might already have been consumed.

Alternative, only if approved: bounded idempotent rotation recovery with a precisely defined request identifier, expiry, successor delivery method, and replay threat assessment. Do not claim hash-only storage can simply reconstruct a randomly generated successor secret. This alternative requires additional design and tests.

Tests must prove two tabs do not consume the same generation, a delayed old response cannot overwrite a newer cookie, and logout/password change cannot be undone by an in-flight refresh response. Before storing a returned token, recheck the local logout/account generation; the server still rejects revoked credentials.

## 9. Cookies, origins, CORS, and CSRF

Preferred deployment is frontend and API at the same origin. Verify WA's actual hostnames before selecting cookie settings; documentation lists multiple deployment origins but is not proof of current production configuration. [file:9]

Proposed same-origin production cookie:

- HttpOnly; Secure; explicit SameSite=Lax.
- Host-only: omit Domain unless a verified requirement justifies it.
- Path covering the proposed session endpoints; for example /users/session.
- Max-Age limited to approved remaining refresh lifetime.
- Clear with the same name, path, and domain scope on logout/revocation responses.

A __Host- cookie name requires Path=/ and no Domain; do not combine that prefix with the narrower proposed path. Choose one coherent configuration.

Cookie path is routing scope, not a substitute for CSRF protection. Require approved Origin/Fetch Metadata policy and a validated CSRF mechanism/custom-header policy for cookie-authorized endpoints. Define the treatment of missing Origin and nonbrowser native clients explicitly. SameSite alone is not the complete defense. [web:19]

For a truly cross-site deployment, SameSite=None requires Secure and introduces browser third-party-cookie compatibility concerns. Exact allowed origins, credentials: include, and credentialed CORS must be tested; do not use wildcard credentialed CORS. A same-site different-origin setup is distinct from a cross-site setup.

Local HTTP may need a development-only non-Secure configuration. Never make production security depend on an unverified proxy-header assumption. Test actual local ports and preview deployments. Do not share production credentials into arbitrary preview environments.

## 10. Frontend state machine and integration contract

Suggested session states:

    unknown -> checking -> authenticated
                       -> signedOut
                       -> temporarilyUnavailable

- Public home may render while authentication is checking, but hide Change Password until validated authentication is established.
- Protected pages await ensureSession() before protected API initialization.
- An expired JWT is not enough to decide the user is signed out when a valid refresh session may exist.
- An unreadable token or signed-out state is not permission to expose a usable password form.
- On network failure preserve unsaved input, disable authenticated operations as necessary, and show a recoverable status. Do not grant authenticated access simply because a token is cached.

Use an explicit WA request wrapper, not global fetch monkey-patching. Only retry a request after a specific authentication-expiry rejection that occurred before the route's mutation executed. Do not retry network timeouts or arbitrary mutation responses automatically. Handle non-replayable bodies and uploads explicitly.

After password change or logout, notify other tabs to stop authenticated work; preserve unsaved text where feasible but do not continue protected mutations. Broadcast identity/token changes only within the established origin and never send refresh secrets.

Preserve localStorage.token compatibility initially. Document that browser-readable access tokens remain exposed to successful script injection. HttpOnly refresh storage reduces direct refresh-secret access but does not defeat malicious same-origin scripts. Preserve sanitization and safe rendering rather than claiming the new session helper solves XSS. [file:6][file:9]

Service worker: never serve cached authentication responses or password submissions. Do not rewrite cache strategy incidentally. Verify updated helpers are deployed without creating mixed old/new startup behavior.

## 11. Change Password transaction and race handling

Proposed flow:

1. Require validated website session and approved request defenses.
2. Validate request shape, confirmation, and existing password rules; do not alter password bytes.
3. Read the user's current bcrypt hash and credential version.
4. Verify current password; rate-limit failures without logging submitted values.
5. Compute replacement hash using the established baseline bcrypt policy.
6. Begin transaction and lock the user/security row.
7. Recheck that the stored password hash/version still matches the verified snapshot; reject a concurrent change rather than overwrite it.
8. Update password hash and increment applicable credential version.
9. Revoke website sessions and pending website challenges; include native sessions only under the approved policy.
10. Commit before reporting success.
11. Expire current browser cookie, clear local token, notify tabs, show success, and require fresh password/email verification.

Do not hold a database transaction open during avoidably expensive hashing. Ensure refresh and password-change transactions share a documented lock order so a concurrent refresh cannot create a usable post-change session using old credentials.

A security notification is a worthwhile separate proposal: use the existing ACCOUNT notification path after commit. Delivery failure must not roll back a completed password change. This is not an approved new feature unless accepted.

Handle a lost success response: the password may already have changed even if the client sees a timeout. Do not automatically retry or assert failure. Give instructions to log in using the new password and handle uncertainty without revealing account details.

## 12. Migration and legacy-token transition

Immediate revocation cannot be guaranteed for preexisting JWTs lacking the new claims if the application continues accepting them unconditionally.

Recommended cutover: invalidate legacy website tokens and require one fresh website login. This is an operational change requiring approval. If legacy tokens are accepted until their existing eight-hour expiry, document that password-change access revocation is incomplete during that window.

Identify web/native tokens using verified existing issuance paths; do not guess client type from missing claims. Shared native claims or middleware may require coordinated deployment.

Migration procedure:

1. Back up code and database; snapshot actual installed experimental schema.
2. Review migration applicability and exact table/column definitions.
3. Apply additive compatible schema first; verify it explicitly.
4. Deploy backend and frontend in a controlled maintenance/cutover window if mixed versions cannot safely coexist.
5. Execute the approved legacy-token transition.
6. Run smoke tests before allowing normal use.

Rollback cannot simply restore the old verifier: that could reaccept credentials invalidated by a password change. Define a security-preserving rollback build or maintenance-mode response that continues honoring new revocation state. Never restore old password hashes as a routine feature rollback. Do not drop new session/security data until rollback implications are reviewed.

## 13. Necessary files and review surface

| File/component | Expected action | Justification |
|---|---|---|
| Original httpdocs/login.html, path to verify | Minimal revision | Checkbox and session issuance integration; retain entire established experience. |
| Original httpdocs/home.html | Minimal revision | Authenticated Change Password link and coordinated session/logout state. |
| httpdocs/changePassword.html | New/review experimental | Authenticated form, exact password rules, and success/error flow. |
| httpdocs/js/wa-session.js | New/review experimental | Explicit startup/request/session coordination without global fetch replacement. |
| routes/users.js | Required review/revision | Preserve login verification and integrate new operations. |
| services/browserSession.js | New/review experimental | Central browser-session lifecycle. |
| middleware/auth.js | Required review/revision | Shared revocation-aware authentication. |
| middleware/subscriptionAccess.js and custom JWT/admin checks | Required inventory; revise only where needed | Eliminate inconsistent validation paths without changing entitlement semantics. |
| server.js | Review; revise if needed | Route, cookie, CORS, CSRF, proxy and middleware integration. |
| dbConnection.js | Review, normally unchanged | Confirm UTC/transaction conventions. |
| Protected page scripts/pages | Inventory-driven revisions | Await startup and use controlled renewal where required. |
| Service worker | Review; scoped changes only if needed | Exclude sensitive caches and verify rollout compatibility. |
| routes/tnna.js and native session consumers | Review; modify only under approved integration | Password-change scope and token-class separation. |
| SQL migration and security state | Required | Session persistence, user-wide invalidation, indexes, installed-state reconciliation. |
| CLAUDE.md and TechSummary.md | Update after validated implementation | Describe actual approved behavior and limitations. |

This is a justified expected surface, not a final exact file count. The briefing's approximate 63-page replacement must not be reused without per-page justification. [file:17]

## 14. Test plan and objective acceptance evidence

Use at least: remembered browser A with two tabs; unchecked browser B; separate browser/device C; administrator and nonadministrator accounts; active/expired/new subscription cases; and TNNA online/offline if native scope is affected.

Use controlled clocks or a test-only configurable lifetime to exercise boundaries; do not wait 180 days or change production clocks.

| Test | Required evidence |
|---|---|
| Original full login | Email flow, reset/back paths, confetti, message and 1.5-second redirect preserved. |
| Unchecked/checked issuance | Cookie and database state prove no refresh secret for unchecked login and only post-verification issuance for checked login. |
| Browser restart | Remembered login restored; unchecked behavior matches baseline. |
| Access expiry | Coordinated refresh preserves form input without reload. |
| Idle/absolute limits | Boundary rejection and renewal obey approved UTC formulas. |
| Hidden-tab polling | Does not indefinitely renew authorization contrary to policy. |
| Concurrent tabs | One effective rotation; no spurious logout or stale-cookie overwrite. |
| Token replay | Consumed credential fails; affected family revocation follows specification. |
| Lost response/crash | Recovery or full-login fallback follows the documented rotation design. |
| Logout online | Current access/refresh tokens rejected server-side; other browser unaffected. |
| Logout offline | Local access cleared, explicit warning shown, restoration blocked locally; remote revocation remains pending and is not falsely claimed complete. |
| In-flight refresh versus logout | Old response does not restore a locally logged-out identity; server rejects revoked session. |
| Current password/confirmation | Wrong current password and mismatch rejected; baseline eight-character rule consistent in UI/backend. |
| Concurrent password changes | Only valid snapshot commits; no silent overwrite. |
| Password change versus refresh/login verification | Old credential state cannot create usable new sessions. |
| Password change revocation | All targeted access and refresh tokens fail, including unchecked website sessions. |
| Native scope | Online/native/offline behavior matches the approved policy and stated limitation. |
| Public/direct navigation | No operable password form without validated authentication. |
| Subscription/privacy/admin | No bypass or trial extension; privacy unlocks not conferred by session refresh. |
| CSRF/CORS/cookies | Reject unapproved origins and forged cookie-authorized requests; correct scope/deletion/local/HTTPS behavior. |
| Dependencies/network | Database/network failure never grants access; form data and useful recovery messaging retained. |
| Application inventory | Each touched page passes existing feature regression tests. |
| Deployment/rollback | Mixed-version and rollback behavior do not reaccept revoked credentials. |

Offline logout needs a specific design: browser JavaScript cannot delete an HttpOnly cookie or guarantee server revocation without connectivity. A local logout-pending marker can prevent that browser from restoring and trigger revocation when connectivity returns, but cannot invalidate a stolen remote token. Present this limitation honestly.

Attach test identifiers, environment, actual results, and evidence. A syntax check or ZIP checksum is not acceptance evidence for runtime authentication. [file:17]

## 15. Release gates and delivery requirements

Gate A — baseline: originals and experimental files compared; installed schema reconciled.

Gate B — decisions: approve lifetime, revocation, TNNA, legacy cutover, and refresh-recovery policies.

Gate C — design: endpoint, cookie, data model, startup state, validator inventory, and transaction/locking contracts reviewed.

Gate D — implementation: complete files and exact diffs; no unrelated edits; static checks pass.

Gate E — acceptance: functional/security/regression tests pass; untested areas explicitly listed.

Gate F — operations: backup, migration, cutover, monitoring, and security-preserving rollback rehearsed.

Required package: design decision record; file-by-file change manifest; complete new/revised files; original-baseline diffs; separate SQL; manual installation instructions; rollback procedure; test evidence; residual risk statement; updated guides. Do not alter Drive originals or deploy remotely without explicit authorization.

## 16. Final design-engineering recommendation

Approve the two features in principle, but do not approve the previous experimental implementation for release on the current evidence. The recommended architecture is a separate browser session/refresh layer with revocation-aware access validation and explicit frontend coordination, preserving the established login and application contracts.

The next engineering action is source acquisition and a baseline/experimental diff review, followed by approval of the proposed policy choices. This document provides a concrete review framework and target design; it does not pretend that missing source-code evidence or runtime tests have been completed.
