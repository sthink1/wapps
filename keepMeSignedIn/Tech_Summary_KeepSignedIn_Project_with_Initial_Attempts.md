# Wonderful Apps (WA) — Keep Me Signed In and Change Password
## Technical design briefing for review by the design engineer

**Prepared:** October 14, 2026  
**Development branch:** `reviseLogIn`  
**Status:** Requirements and design review; **not** an approval of the previously generated implementation for production.

## 1. Purpose and authoritative source

Introduce two features into the existing Wonderful Apps (WA) website:

1. Optional **“Keep me signed in on this device”** for up to 180 days, renewable through normal, authorized activity.
2. **Change Password**, available to an authenticated WA user.

**The existing Google Drive WA project files are the authoritative pre-change baseline.** The user has explicitly stated that the Drive copies remain the versions **before the revisions discussed in this thread**. The local working branch `reviseLogIn` has had experimental replacement files applied; those files are **not** the authoritative baseline. Compare each proposed modification directly against the corresponding original Google Drive source, not against an earlier AI-generated ZIP.

**Critical non-regression requirement:** Preserve every existing function, page layout, validation rule, event handler, navigation path, service-worker behavior, visual effect, subscription entitlement check, privacy rule, and authorization check unless a change is **strictly necessary** to implement these two agreed features. Do not opportunistically redesign or refactor unrelated code. Record and justify every changed line and test that the previous behavior survives. This requirement is as important as delivering the new functionality.

No new programming language or installation mechanism is authorized. WA remains **Node.js / Express / JavaScript / HTML / CSS / MySQL**. Supply complete revised/new files, any required SQL as separate scripts, and manual copy instructions; **no Python installer**. Discuss architectural or operational changes before introducing them.

## 2. Observed existing WA behavior (original Google Drive files)

The following details are based on the original WA files inspected in this discussion, principally `public/login.html`, `public/home.html`, `routes/users.js`, and `middleware/auth.js`, plus WA project documentation (`CLAUDE.md`). Reverify their latest versions on Google Drive before writing changes.

- The login screen submits username/password to `POST /users/login`; after credential validation the server sends a six-digit email verification code, associated with a temporary token.
- `POST /users/verify-code` checks the email code, then issues a **JWT valid for eight hours**. It also maintains the existing first-login development-subscription behavior and chooses `subscription.html` or `home.html` as appropriate.
- The browser stores the access JWT as `localStorage.getItem('token')`. Existing WA application pages read that token, including for `Authorization: Bearer ...` requests.
- The original `login.html` registers the service worker, loads the existing input-sanitizer and visual-effect scripts, and **on verified login** stores the JWT, calls `triggerConfetti()`, shows `Login successful! Redirecting...`, then redirects **after 1.5 seconds**. These are established requirements, not disposable cosmetics.
- The original `home.html` shows login/registration/logout controls, displays signed-in user information from the JWT, performs admin and subscription checks, tracks activity, and handles many application buttons/modals. Its existing layout and behavior must remain intact.
- `middleware/auth.js` verifies JWTs using `JWT_SECRET`, extracts `userId`, and currently does not check a server-side session version or revocation epoch.
- Existing registration (`routes/users.js` and `register.html`) requires passwords of **at least eight characters**. Keep this consistent in Change Password. Do **not** silently raise it to 12.
- The native Town Notification app (TNNA) has a **separate** refresh-token implementation using encrypted Android storage and a 180-day refresh-token scheme. Browser storage and threat models are different; TNNA native code and tables must not be replaced as part of this website change.

Relevant baseline Drive links previously retrieved:

- Original `login.html`: https://drive.google.com/file/d/1jTrMlFoQ79Fb9tgjmhZMSGaOJFl4LRFw/view
- Original `home.html`: https://drive.google.com/file/d/1NkoD-5vXADhaEfdyeJmIDyTXGmPkVFDS/view
- Original `routes/users.js`: https://drive.google.com/file/d/1DIlZ4VnPbixGA1WTC0gPMRP7YnaaEJZF/view
- Original `middleware/auth.js`: https://drive.google.com/file/d/1Y9DE2toaxVwZmuKLxexhTiRLEhRcLR6R/view
- Project overview `CLAUDE.md`: https://drive.google.com/file/d/125DqPcwgx4DSkqgbHBZH7d3-iEWvSFZU/view

## 3. Agreed functional requirements

### 3.1 Optional persistent website login

- Add a checkbox labeled **“Keep me signed in on this device”**, **unchecked by default**, to the existing login form.
- If not selected, preserve the current eight-hour login/JWT behavior; don't grant a 180-day persistent credential.
- If selected, the **normal username/password + email verification flow must complete successfully** before issuing the browser refresh credential. The eight-hour access JWT remains the access mechanism for existing WA endpoints.
- A secure refresh mechanism allows return visits without repeating username, password, and email code while the device remains authorized.
- Agreed period: **180 days, with renewal during normal use**. The precise idle-time expiration, absolute maximum session lifetime, frequency of rotation, and behavior after long inactivity need engineering specification; rotation and renewal are not synonymous.
- An explicit Logout must clear the local JWT, invalidate/revoke the corresponding server-side browser refresh credential, and expire its cookie. After logout, reopening the browser must not silently sign the user in.
- Other devices/sessions should not be affected by a normal single-device logout unless explicitly designed otherwise.

### 3.2 Change Password

- Add **Change Password** navigation on `home.html`, **visible only when authenticated**, not on the signed-out home view.
- Users who navigate directly to `changePassword.html` while unauthenticated must not be allowed to use the form and should be directed to Login; server authorization is mandatory regardless of UI checks.
- Require **Current Password**, **New Password**, and **Confirm New Password**.
- **Eight-character minimum** for the new password, consistent with registration; ensure client and backend agree. Do not modify registration rules incidentally.
- Confirm the current password by checking the user's stored password hash on the server before setting the new bcrypt hash.
- On success, show clear feedback and route the user to Login for fresh authentication. Revoke all outstanding **website** persistent refresh credentials for that user; determine and clearly communicate the treatment of existing access JWTs and TNNA sessions.
- Existing subscription rules, administration access, and account identity must remain unchanged.

## 4. Previous attempt, regression, and review findings

An earlier AI-generated package called `reviseLogIn_replacement_no_python.zip` included revisions to approximately 63 HTML files, new `wa-session.js`, `changePassword.html`, `services/browserSession.js`, modifications to `routes/users.js`, and SQL for a proposed `WebRefreshTokenT` table. It was installed on the local `reviseLogIn` branch, **not** into authoritative Google Drive copies. Another previous package included a Python installer; the user specifically rejected that approach. Do not reuse prior packages as unquestioned specifications.

### Confirmed regressions / mismatches

1. **Login confetti disappeared.** The prior revised `login.html` omitted the original confetti imports, `triggerConfetti()` call, success alert, and 1.5-second delay. The user reproduced the missing animation on verified login.
2. The earlier revised login also removed or altered original page styling, service-worker registration, input-sanitizer references, and some form-reset behavior. These were **not approved changes**.
3. The initial Change Password implementation demanded **12 characters** despite the established **eight-character** registration requirement. A later correction identified validation in `services/browserSession.js` as well as the front end; backend and UI must agree.
4. An earlier `home.html` displayed Change Password **even before login**. A later correction hid it for signed-out users; maintain this requirement and verify stale/expired token cases.

### Significant compatibility and security concerns to review

- Shared `wa-session.js` was injected into many pages and reportedly replaced or wrapped global `fetch` and included automatic reload behavior. **Do not reload an application page unexpectedly**, especially with unsaved user input. Define a non-disruptive startup and renewal contract for all pages.
- The site's many pages read JWT directly from `localStorage`. A refresh-on-load feature cannot safely assume all page scripts wait for restoration; review initialization ordering and promise coordination rather than merely adding a script tag everywhere.
- Multiple browser tabs refreshing simultaneously can race when refresh tokens are rotated. Engineer tab coordination and/or safe backend replay/grace behavior with explicit security limits.
- Do not silently overwrite application-specific `Authorization` headers or intercept unrelated third-party network requests. Limit refresh/retry behavior to WA-authenticated API requests, avoid retry loops, and preserve request semantics.
- Current `middleware/auth.js` accepts a cryptographically valid JWT until expiration. Revoking refresh tokens after a password change **does not immediately invalidate previously issued eight-hour access JWTs**. Decide whether to add a server-side password/session version or revocation epoch, and ensure all protected routes—including special admin checks—respect it if immediate revocation is required.
- Clearly define treatment of TNNA after a website password change: current draft revoked website refresh credentials but did **not** necessarily invalidate TNNA refresh tokens or still-valid native access JWTs. This is an unresolved security design decision, **not** an implemented guarantee.
- Review cross-origin local development (browser possibly on a localhost port different from the Node server), production HTTPS, browser cookie `Secure`, `HttpOnly`, `SameSite`, path/domain scope, credentialed requests, CORS, CSRF protections, reverse proxy/Render behavior, and cookie deletion matching its issuance attributes.
- Preserve the `subscription.html` redirect for a first login or inactive entitlement; do not bypass subscription/privilege checks when a JWT is refreshed.

The prior discussion identified three files to review **together**: `login.html` (definitely rebuild from original), `wa-session.js` (substantial review/revision), and `changePassword.html` (auth startup/success-flow revision). Integration review also includes `routes/users.js`, `services/browserSession.js`, and `middleware/auth.js`, with changes made only if necessary and explicitly justified.

## 5. Engineering design questions requiring decisions

1. **Session lifetime:** Is 180 days an idle timeout renewed on use, or an absolute cap? Recommend specifying both idle expiration and absolute lifetime, rather than permitting unbounded renewal without explicit review.
2. **Rotation and replay:** How does the server handle rotation, stale cookies, lost responses, browser crashes, two-tab races, and attempted reuse? Store only cryptographic refresh-token hashes server-side and support device-specific revocation.
3. **Client storage:** Prefer storing refresh credentials in a `HttpOnly`, `Secure` (production), appropriately scoped cookie rather than `localStorage`. Existing access-JWT storage is a compatibility constraint and merits a documented security assessment.
4. **Initial page load:** How can protected pages await the session state without reloading pages or running authenticated API calls with expired tokens?
5. **Unauthorized vs network error:** Distinguish actual revocation/expiration from temporary offline/server/network failures; avoid silently logging users out after transient errors.
6. **Password change:** Should changing the password immediately revoke *all* JWTs, all web refresh sessions, TNNA refresh sessions, or only website sessions? The agreed minimum is to revoke website persistent sessions; wider coverage is an open design choice requiring approval.
7. **Password confirmation:** Should the same verified account be logged out on success? The proposed UX is success feedback, followed by a fresh login using the new password and existing email verification.
8. **Limits and monitoring:** Rate limiting, verification-code retry limits, response uniformity, logging without secrets, cleanup of expired credentials, index and table compatibility with production MySQL, and potential free-tier database costs.
9. **Source-of-truth deployment:** Which local/production hostnames and reverse-proxy settings are authoritative? Avoid hard-coded assumptions that break the development setup.

## 6. Strict change-control instructions for the engineer

**Do not recreate or rewrite all existing HTML pages by default.** First identify the smallest integration surface that reliably supports authenticated state across WA. If changes to multiple HTML pages prove necessary, document why each page is included.

Implementation process:

1. Fetch **fresh originals** from Google Drive and review the authoritative database dump (`wappsDump.sql`) and routing configuration before producing code.
2. Produce a **file-by-file change plan** separating required feature additions from incidental or optional improvements.
3. For every modified file, provide an exact diff against its **original Google Drive version**. Every changed line must connect to an agreed feature, necessary integration, or a separately approved safety fix.
4. Preserve original `login.html` confetti, alert, 1.5-second delay, form resets, styling, scripts, and service-worker behavior. Build on it rather than replacing it with a simplified new design.
5. Preserve all existing home-page applications, buttons, information modals, labels, special administrator behavior, subscription restrictions, activity tracking, UI layout, privacy locks, and Family Networking features.
6. Preserve registrations and authentication behavior for existing users, including the eight-character password minimum. Never silently alter security/usage policies.
7. Avoid unrelated frontend or backend refactors, new frameworks, package upgrades, new languages, and installer scripts. Raise proposals in advance rather than bundling them into the feature.
8. Supply ready-to-copy **complete files**, separate SQL migration (and rollback plan if needed), folder-by-folder manual installation instructions, and tests. Do not modify the Google Drive originals unless explicitly authorized.
9. Verify file hashes or systematic text diffs and **functional regression tests**. Passing JavaScript syntax checks or ZIP integrity checks does not demonstrate working login or application compatibility.
10. Make an explicit **no-regression acceptance criterion**: existing WA behavior remains as before except for the two approved login/password features and any further changes separately approved by the user.

## 7. Required test and acceptance matrix

| Area | Test / expected outcome |
|---|---|
| Original login | Credentials, email code, invalid/expired code, back/reset paths unchanged |
| Confetti | Verified login plays original confetti, shows original message, waits 1.5 seconds before subscription-aware redirect |
| Login unchecked | Eight-hour JWT behavior only; no long-lived cookie is created |
| Login checked | 180-day policy correctly implemented; return after browser close/restart restores login where supported |
| Refresh | Eight-hour access expiry is handled without re-entering credentials or disruptive page reloads |
| Logout | Current browser refresh credential revoked; cookie and local JWT cleared; no automatic re-login |
| Multiple tabs | Concurrent refreshes do not break sessions or cause spurious revocation |
| Direct access | Signed-out direct navigation to `changePassword.html` does not expose an operable form |
| Button visibility | Change Password absent when signed out or token invalid; available to signed-in users |
| Change Password | Wrong current password rejected; eight-character new password accepted; confirmation mismatch rejected |
| Post-change | Appropriate revocations occur, success feedback appears, fresh login required; clearly document any residual JWT validity |
| Permissions | Admin, subscription, Family Tree privacy/permissions, and account ownership preserved |
| Apps | No lost unsaved entries, unexpected reloads, changed fetch payloads, or broken navigation |
| Devices | Browser on another device, Android TNNA, and multiple browser tabs behave per approved policy |
| Environments | Localhost variant(s), Render HTTPS, cookie rules, proxy configuration, and CORS verified |
| Regression | Compare each revised file against the original Drive file; prove all unrelated code remains unchanged |

## 8. Deliverables requested from the design engineer

1. A recommended **architecture and threat/compatibility assessment**, specifically addressing refresh-cookie handling, existing `localStorage` JWT consumers, token rotation races, and revocation after password change.
2. A concise **list of necessary files** and SQL changes, with an explanation of why each is required.
3. Explicit answers to unresolved questions in §5 before material behavior changes.
4. An implementation designed from the **original Drive baseline**, not previous generated replacements.
5. A complete **regression test plan** and any limitations or residual security risks.

**Bottom line:** The requested outcome is straightforward user convenience, but authentication touches many existing WA pages. Protecting the integrity of the existing app is a firm requirement. The earlier accidental loss of the login confetti and the unapproved 12-character password rule are concrete examples of changes that must not recur.
