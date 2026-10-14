 Wonderful Apps (WA) — Keep Me Signed In and Change Password
Design engineer guidance: how to proceed
Prepared: October 14, 2026 Branch: reviseLogIn Status: Design guidance only. Nothing here is an implementation, and nothing here approves the earlier generated ZIP. Answers: the open questions in §5 of WA_reviseLogIn_Design_Engineer_Technical_Summary.md, and the deliverables list in its §8.


0. Evidence base (what this guidance rests on)
I read these current Google Drive files directly:

CLAUDE.md, TechSummary.md, server.js, package.json, morgan.js, routes/users.js, routes/tnna.js, middleware/auth.js, middleware/subscriptionAccess.js, httpdocs/login.html, httpdocs/home.html, httpdocs/subscription.html (as a representative app page), httpdocs/sw.js.

I did not read, and the plan below depends on checking them before coding:

Not read
Why it matters
wappsDump.sql (2 MB)
Exact DDL for UsersT, LoginVerificationT, TNNARefreshTokenT. The SQL in Appendix A infers columns from queries in users.js and tnna.js. The UserID type and signedness must be copied from the dump or the foreign key will fail.
The other ~60 HTML pages
I verified one representative page. Run the grep audit in §8.3 to confirm they all behave the same way.
Other route files (subscriptions.js, track.js, and so on)
Some may call jwt.verify inline, as users.js /is-admin does. This only matters for the optional revocation-epoch work (§3, decision 6).
dbConnection.js, utils.js
Use the existing pool and handleDbError patterns exactly as tnna.js does.


One caution for the diff step: the Drive connector returns a flattened text rendering of files, with indentation lost and characters escaped. Do all diffs against real downloaded copies of the Drive files, not against anything copied from a chat or connector view.


1. Recommendation in one page
Use the TNNA refresh pattern for the web. routes/tnna.js already implements what is needed: SHA-256-hash-only storage, SELECT … FOR UPDATE, rotate on every use, and a device/lineage binding. Mirror it. Don't invent a new scheme.
Keep the refresh credential in an HttpOnly cookie. Keep the 8-hour access JWT in localStorage.token exactly as today, because every page depends on it.
Do not inject a script into 63 pages. Do not wrap fetch. The baseline gives us a smaller integration surface (see §2, F1–F2). Every app page already sends the user to login.html when the token is missing or gets a 401. So:
login.html becomes the universal silent-restore point.
home.html, the entry page, restores on load.
The other ~60 pages stay byte-for-byte unchanged.
Sessions are 180-day idle (sliding), with a 365-day absolute cap. The cap needs your approval (§3, decision 1).
Password change revokes all website sessions in one transaction. I recommend it also revokes TNNA refresh tokens. That is pure SQL, with no Android release needed (§3, decision 6). It needs your approval.
Phase 1 does not add a JWT revocation epoch. An access JWT can survive for up to 8 hours after a password change or logout. That is documented as residual risk (§10). Phase 2 can close it if you want (§6, optional).
No new packages. Cookie parsing is about 10 lines, and the rate limiter is an in-memory map. cookie-parser and express-rate-limit are not in package.json.

Files changed (existing): routes/users.js, server.js (CORS options only), httpdocs/login.html, httpdocs/home.html. Files added: services/browserSession.js, httpdocs/js/waSession.js, httpdocs/changePassword.html, one SQL script plus rollback. Files deliberately unchanged: sw.js, middleware/*, routes/tnna.js, and every other HTML page.


2. Baseline findings that drive the design
#
Finding (source)
Design consequence
F1
App pages read the token synchronously at script load: const token = localStorage.getItem('token') (subscription.html). A missing token or a 401 gives localStorage.removeItem('token') and then location.href = 'login.html'.
A "refresh on every page load" script cannot reliably beat page scripts to the token. The existing redirect to login.html is the natural recovery hook.
F2
login.html has no "already logged in" check, and pages redirect to it without a return parameter.
Silent restore in login.html can use document.referrer as the return target. This needs a strict allow-list and a loop guard (§5.2).
F3
home.html treats token presence as "logged in" (isUserLoggedIn()). It never checks expiry and has no 401 handling. Logout is purely client-side (removeItem, alert, redirect). It never calls POST /users/logout, which is a stub that does nothing.
home.html needs a restore step at the very start of its DOMContentLoaded handler. Logout must now call the server. Change Password visibility needs a real expiry check, not just "token exists".
F4
The JWT is verified in at least three places: middleware/auth.js (sets only req.user.userId), subscriptionAccess.authenticateToken (sets the full payload), and inline in users.js /is-admin. No revocation check exists anywhere.
Revoking refresh tokens cannot cut off an access JWT already issued. Closing that gap later means touching every verification point, so keep it out of Phase 1.
F5
routes/tnna.js already has hash-only storage, a FOR UPDATE lock, rotation on each refresh, and device binding. It has no replay grace window: the old token simply returns 401.
Reuse the pattern. The web version adds a short grace window and reuse detection, because browsers have multi-tab races that a single native app does not.
F6
package.json has no cookie-parser and no rate limiter. server.js CORS has no credentials: true. There is no trust proxy. sw.js bypasses every request carrying Authorization and every non-GET request.
No new dependency. CORS gets exactly one deliberate edit. sw.js needs no change, because refresh and logout are POSTs. Secure-cookie detection uses x-forwarded-proto directly, not a global trust proxy setting.
F7
/register applies .trim() to the password before the length check and hash. /login compares the untrimmed input to the hash.
A stored password never has leading or trailing spaces. Change Password must preserve that invariant (§4.4).
F8
Pre-existing: /verify-code has no attempt limit. The 6-digit code comes from Math.random(). The lookup has no FOR UPDATE.
A 180-day credential is only as strong as the login that mints it. These are not bundled into this feature. They are listed in §10 as separately approvable safety fixes.
F9
morgan.js uses the combined format with 4xx/5xx only. It logs the request line and user-agent, not cookies or headers.
Safe as is, provided tokens never appear in URLs or query strings. Keep them in cookie and body only.



3. Answers to the design questions (§5 of the briefing)
#
Question
Recommendation
Approval needed?
1
Session lifetime
Idle 180 days, renewed on each successful refresh. Absolute cap 365 days from the interactive login. After the cap, a full login (password + email code) is required. Unbounded renewal means a stolen device or cookie works forever, so avoid it.
Yes (the cap).
2
Rotation and replay
Rotate on every refresh. Keep rotated rows. A 30-second grace window returns a new access JWT only (no new cookie) for a just-rotated token. Presenting a rotated token after the grace window revokes the whole lineage (theft signal). Revoked, expired and unknown tokens all get 401 and a cookie clear.
No
3
Client storage
Refresh token in a cookie: HttpOnly, SameSite=Strict, Path=/users, Secure when the request is HTTPS, persistent (Max-Age 180 days). Access JWT stays in localStorage.token as a documented compatibility constraint (§10).
No
4
Initial page load
No global wrapper. home.html and changePassword.html await a restore before reading the token. login.html restores when bounced from an app page. Other pages keep their current behavior.
No
5
401 vs network error
Only HTTP 401 from the refresh endpoint is definitive. A thrown fetch, a 5xx or a timeout means "unknown": change nothing, show nothing new, fall back to today's behavior. Never log the user out on a transient error.
No
6
What a password change revokes
All web refresh lineages, and all TNNARefreshTokenT rows for that user. No Android release is needed, because TNNA already clears its saved login on a 401. Two caveats: (a) access JWTs, web and TNNA, live up to 8 more hours; (b) TNNA offline mode (up to 30 days, per CLAUDE.md §10.4) cannot be remotely revoked. Minimum, if you decline: website-only.
Yes (TNNA scope).
7
Post-change UX
Show success, clear localStorage.token, clear the cookie via the response, then go to login.html after a short delay. Fresh login uses the new password and the normal email code.
No
8
Limits and monitoring
See §4.5 (throttle, logging, cleanup).
No
9
Deployment hostnames
The cookie is host-only, so each hostname has its own session (wapps-ypez.onrender.com, wapps.helioho.st, wonderfulappscompany.com). That is correct and safe; just don't expect a login on one to carry to another. BASE_URL in the pages is the page origin except on localhost, so API and page share an origin in production. Please confirm this holds for every production host.
Confirm



4. Server design
4.1 Table WebRefreshTokenT (SQL in Appendix A)
One row per issued refresh token. TokenHash is the SHA-256 hex of the token. Plaintext is never stored or logged.
FamilyID identifies one browser lineage, one per interactive login. Logout, reuse detection and password change all act on the lineage.
SessionStartedAt is the absolute-cap anchor. It is copied unchanged through every rotation.
ExpiresAt is the idle expiry: MIN(NOW() + 180 days, SessionStartedAt + 365 days).
Rotated rows stay (RevokedReason = 'ROTATED', RotatedAt set) so reuse can be detected. Purge them after 30 days.
MySQL 5.5 rules (CLAUDE.md §5): DATETIME columns set by NOW() (the session is already +00:00), no JSON type, no multiple CURRENT_TIMESTAMP defaults, utf8mb4, InnoDB, and ON DELETE CASCADE to UsersT like other user-owned tables.
4.2 Cookie specification
Set-Cookie: wa_rt=<token>; Path=/users; HttpOnly; SameSite=Strict; Max-Age=15552000[; Secure]

Secure is added when req.secure || req.headers['x-forwarded-proto'] === 'https'. Plain-HTTP localhost development then still works. Don't add global trust proxy.
SameSite=Strict works because restore is a same-site fetch from a WA page. Strict cookies are sent on those requests even when the user arrived from an email link. Localhost on different ports is still same-site.
Path=/users limits where the browser sends it. It never travels with /familytree or /budget calls.
Deletion must repeat the same Path (plus Max-Age=0) or the browser keeps the cookie. Use one helper for both issue and clear so they cannot drift apart.
Don't use __Host- or __Secure- prefixes. They require Secure (and, for __Host-, Path=/), which breaks plain-HTTP dev.
4.3 Endpoints
POST /users/verify-code (existing, additive change only)

Accept an optional strict boolean keepSignedIn.
The response shape is unchanged: message, token, redirectTo, subscription.
Order of operations stays as today: code check, IsVerified = 1, getOrCreateDevelopmentTrial, JWT with { userId, username } and '8h'.
New, after those steps: if a wa_rt cookie arrived, revoke its lineage (reason SUPERSEDED). If keepSignedIn === true, create a new lineage and Set-Cookie. Otherwise send a clearing Set-Cookie.
Why always supersede: without it, a shared-PC user who logs in unchecked as person B would later be silently restored as person A, whose cookie was left behind.
TNNA is unaffected. It uses /tnna/verify-code.

POST /users/refresh-session (new)

Step
Behavior
Guards
Require header X-WA-Refresh: 1. If an Origin header exists, it must be on the allow-list (the CORS list or the request's own origin). Failure gives 403.
No cookie
401 { error, code: 'NO_SESSION' } before touching the database.
Lookup
Within a transaction: SELECT … WHERE TokenHash = ? FOR UPDATE. Not found gives 401 and a cookie clear.
Revoked, ROTATED, inside 30 s
Issue a new access JWT only. No new cookie: the browser already has the successor from the first response.
Revoked, ROTATED, past 30 s
Revoke the entire lineage, clear the cookie, log a warning (user id and lineage prefix only), 401.
Any other revoked reason
Clear the cookie, 401, code SESSION_REVOKED.
Expired (idle or absolute)
Revoke, clear the cookie, 401, code SESSION_EXPIRED.
User row missing
Clear the cookie, 401.
Success
Mark the current row ROTATED. Insert the successor (same FamilyID, same SessionStartedAt, new ExpiresAt). Commit. Set the new cookie. Return 200 { message: 'Session restored', token, username }. Username comes from UsersT, not from the old token.


The refresh endpoint must not call getOrCreateDevelopmentTrial. That belongs to the first interactive login only (CLAUDE.md §6.3). Subscription checks stay where they are, in requireAppAccess at API time, so a refreshed JWT never bypasses an expired entitlement.

POST /users/logout (existing stub, now real)

No JWT required. The cookie is the proof, and logout must work with an expired token.
Revoke the whole lineage (reason LOGOUT), clear the cookie.
Keep the response { message: 'Logged out successfully' }. It is idempotent, and other devices are untouched.

POST /users/change-password (new)

Authenticated with the existing middleware/auth.js. Use req.user.userId only. Never accept a user id from the body.
Body: currentPassword, newPassword, confirmPassword.
4.4 Change Password rules
Minimum 8 characters for the new password, matching /register. Register's validator does not change.
Trim the new password (same invariant as register, F7). Compare currentPassword exactly as typed, as /login does.
Reject a mismatch between newPassword and confirmPassword on the server as well as the client.
Recommended, but needs your OK because it is a new policy: reject a new password equal to the current one.
Wrong current password returns 403, not 401. The pages treat 401 as an expired session, so a 401 here would wrongly bounce the user to login.
Follow the existing message convention: validation texts end in .(be).
Hash with bcrypt cost 10 (same as register) before opening the transaction, so no locks are held during hashing.
One transaction:
UPDATE UsersT SET PasswordHash = ? WHERE UserID = ?
Revoke all WebRefreshTokenT rows for the user (reason PASSWORD_CHANGE).
If approved (decision 6): UPDATE TNNARefreshTokenT SET RevokedAt = NOW() WHERE UserID = ? AND RevokedAt IS NULL.
Response: 200 plus a clearing Set-Cookie.
Do not change username, subscription rows or any other user data.
4.5 Limits, logging, cleanup
Throttle: 5 failed current-password attempts per user per 15 minutes returns 429. Use an in-memory map in services/browserSession.js. It resets on restart and assumes one instance (true for a single Render instance). That is stated, not hidden.
Logging (Winston): user id, event name, lineage prefix (first 8 characters). Never the cookie, token, hash, password or JWT (CLAUDE.md §11).
Cleanup: opportunistic. On each refresh or login, delete up to 100 rows where ExpiresAt < NOW(), or RevokedAt < NOW() - 30 days. There is no cron on this host, and none is needed.
Row growth: about 3 rotated rows per device per day at most. At roughly 200 bytes per row that is far under the 100 MB database plan noted in track.js.


5. Client design
5.1 httpdocs/js/waSession.js (new, small, opt-in)
Loaded only by login.html, home.html and changePassword.html. Hard rules:

Wrap everything in an IIFE and expose one global, WaSession. Pages declare const BASE_URL at top level. A second top-level const BASE_URL would be a redeclaration SyntaxError and break the page. Compute the base URL inside the closure with the same rule the pages use.
Do nothing at load time. No fetch patching, no Authorization rewriting, no automatic reload, no retry loops.

Surface:

Method
Purpose
isTokenFresh(skewSeconds)
Decode exp from localStorage.token. Return true if it is at least skew seconds in the future.
restoreIfNeeded()
If the token is missing or not fresh, call refresh-session. Returns restored, none (definitive 401), or unknown (network or 5xx). Writes localStorage.token only on restored. Uses a Web Lock (navigator.locks) so two tabs don't refresh at once, and re-checks the token inside the lock. If Web Locks is unavailable, the server grace window covers the race.
logout()
Sets a waPendingLogout flag in localStorage, calls POST /users/logout with credentials: 'include', and clears the flag only on success.
flushPendingLogout()
If the flag is set (the earlier logout call never reached the server), retry before anything else and never restore. This is how "reopening the browser must not sign me in" survives an offline logout, since JavaScript cannot delete an HttpOnly cookie.


Every fetch sends credentials: 'include' and X-WA-Refresh: 1.
5.2 login.html — build on the original, don't replace it
Start from the Drive original. Allowed changes only:

Add <label><input type="checkbox" id="keepSignedIn"> Keep me signed in on this device</label> inside #loginForm, unchecked by default.

Add <script src="js/waSession.js"></script>.

Remember the checkbox in a script variable. Send it as keepSignedIn in the verify-code body, with credentials: 'include' on that fetch.

Silent restore on bounce. At load, call restoreIfNeeded() only when all are true:

document.referrer is same-origin;
its path matches ^/[A-Za-z0-9_-]+\.html$;
it is not login.html, register.html or home.html;
the loop guard allows it: a sessionStorage timestamp shows no auto-restore in the last 60 seconds.

On restored, go back to the referrer path. On none or unknown, show the normal form. Never put the referrer into location.href without that exact check (open-redirect risk). Show a small "Restoring your session…" line while waiting.

The loop guard is essential. If a page still gets a 401 after a good restore (for example, the user was deleted), it would bounce forever and rotate tokens on every pass.

Do not touch: confetti imports and triggerConfetti(), the alert('Login successful! Redirecting...'), the setTimeout 1.5 s redirect with data.redirectTo || 'home.html', DOMPurify and inputSanitizer.js includes, the service worker registration, the Show/Back handlers and form resets, the styles, or <meta name="color-scheme" content="only light">. A silent restore does not play confetti. Only a verified interactive login does.
5.3 home.html — four small insertions
Load js/waSession.js.
At the very top of the existing DOMContentLoaded handler, before loadSubscriptionAccess(): await WaSession.flushPendingLogout(); await WaSession.restoreIfNeeded();. The page already reads the token fresh inside its functions, so this order is enough.
A Change Password button in the "Other" group, using the same classes as the Subscription and Notifications buttons, with the hidden attribute by default. Show it only when WaSession.isTokenFresh(...) is true. Use the same click pattern as its siblings. This is a convenience only. The server decides.
The logout handler gains await WaSession.logout() before its existing removeItem, alert('You have been logged out.') and redirect, which stay as they are.

Do not touch: the app buttons and info modals, the Family Tree start modal, admin button logic, subscription status code, page and time tracking, the development-notice animation, or the footer.

A pre-existing quirk, left alone on purpose: with an expired token still stored, home.html shows "Logged in as: …" because it only decodes the token. With the new check, Change Password stays hidden in that state. Fixing the display is out of scope.
5.4 changePassword.html (new)
Style it after subscription.html and login.html: only light meta and CSS, css/wa-buttons.css, pretty-formatted, 2-space indentation, not minified.
Fields: Current Password, New Password, Confirm New Password. Add Show toggles like the login page.
Do not load inputSanitizer.js for these fields. Passwords must stay byte-for-byte as entered (CLAUDE.md §11). The page has no free-text fields.
Startup: await WaSession.restoreIfNeeded(). If there is still no fresh token, go to login.html. Don't expose an operable form to a signed-out visitor. The server still enforces this through the JWT.
On 200: show success, remove localStorage.token, redirect to login.html after about 2 seconds. On 400 or 403: show the server message in the page. On 401: it really is a dead session, so use the normal 401 path.
Message text via textContent only.
5.5 What this plan deliberately does not do
It does not add a script to every page or wrap fetch. It does not auto-reload pages. It does not silently refresh in the background on app pages. When the 8-hour JWT expires on an app page, today's behavior (401, then login.html) still happens. The difference is that login.html now signs the user straight back in and returns them to that page, where before they had to go through the email code. Unsaved input is lost exactly as it is today. If you later want true in-page renewal for long-lived pages (Budget, Family Tree), add one <script> plus one call per page, tested page by page (§6, optional).


6. File-by-file change plan
Required
File
Change
Why necessary
sql/web_refresh_token_schema.sql (new) + rollback
Create WebRefreshTokenT
Server-side revocable store
services/browserSession.js (new)
Token generate/hash, cookie parse/set/clear, lineage create/rotate/revoke, throttle, cleanup
Keeps users.js additions small
routes/users.js
verify-code additive branch; logout real; new refresh-session and change-password
The feature itself
server.js
CORS options only: credentials: true, and add X-WA-Refresh to allowedHeaders. No route or middleware changes.
Credentialed cross-origin dev requests (localhost on another port) and the custom header
httpdocs/js/waSession.js (new)
§5.1
Shared restore/logout logic without per-page duplication
httpdocs/login.html
§5.2
Checkbox, flag, silent restore
httpdocs/home.html
§5.3
Restore, Change Password button, real logout
httpdocs/changePassword.html (new)
§5.4
The Change Password UI

Intentionally unchanged
httpdocs/sw.js (no change: POST and Authorization requests already bypass it; leave CACHE_NAME at v9), middleware/auth.js, middleware/subscriptionAccess.js, routes/tnna.js, register.html, and the other ~60 pages.
Optional, each needs separate approval
Item
Cost
JWT revocation epoch (closes the 8 h window). A tiny table UserTokenEpochT(UserID PK, MinIssuedAt), set on password change. Checked in auth.js, subscriptionAccess.authenticateToken, /is-admin, and any inline jwt.verify the grep in §8.3 finds. Cache about 60 s per user.
One extra DB lookup on every authenticated request, plus changes to shared middleware.
Password-changed security email (existing sendNotificationEmail, ACCOUNT category; verify its signature first). A send failure must not roll back the change.
Small
Per-page in-page renewal for Budget and Family Tree
One script tag and one call per page
"Only use this on a private device" text under the checkbox
One line of UI text
Reject new password equal to current
One server check



7. Implementation sequence (stop at each gate)
Phase
Work
Exit gate
0
Baseline capture (§8.1). Read wappsDump.sql DDL for UsersT, LoginVerificationT, TNNARefreshTokenT. Run the §8.3 audits.
Baselines hashed. DDL types confirmed.
1
SQL, browserSession.js, users.js, server.js CORS. No UI.
All API tests in §9.2 pass with curl, including races and reuse.
2
waSession.js and login.html.
Login, confetti, 1.5 s redirect unchanged for unchecked logins. Checked login sets the cookie. Bounce restore works. Loop guard works.
3
home.html.
diff -u against the Drive original shows only the four insertions in §5.3.
4
changePassword.html and the endpoint wiring.
Full §9.1 matrix passes.
5
Update wappsDump.sql, CLAUDE.md, TechSummary.md (their own rules require it).
Docs match code.


Do not start a phase until the previous gate passes. Each phase ships as a separate commit on reviseLogIn, so any phase can be reverted alone.


8. Change control
8.1 Baseline capture
Download the Drive originals of every file you will modify into baseline/ (a real download, not a copy from a chat).
Record sha256sum for each. The next step shows every changed file is a deliberate diff.
The Drive copies are not modified by this work.
8.2 Diff ledger
For each modified file, produce diff -u baseline/<path> <path> and keep a ledger:

File
Hunk
Maps to
Justification
(one row per hunk)


Keep-signed-in / Change-password / necessary integration / approved safety fix




Any hunk that cannot be mapped is removed. Whole-file reformatting counts as a hunk. CLAUDE.md requires pretty formatting for edited HTML, but format only if the original is not already pretty-formatted, and never alter IDs, handlers or payload names.
8.3 Audits to run in the local repo before coding
grep -rn "jwt.verify" server.js routes middleware services

grep -rl "localStorage.getItem('token')" httpdocs | wc -l

grep -rn "removeItem('token')" httpdocs

grep -rln "login.html" httpdocs --include=*.html

grep -rn "Authorization" httpdocs --include=*.js

These confirm how many files verify a JWT, how many pages read the token, and whether any page bypasses the 401-to-login.html pattern. A page that does neither (like home.html today) is a candidate for the optional per-page work.
8.4 Hard prohibitions
No change to the 8-character minimum, or to register's validators.
No change to confetti, the alert, or the 1.5 s redirect.
No fetch wrapper, no auto-reload, no new global names other than WaSession.
No sanitizing of password fields.
No new package, no Python installer, no framework.
No change to subscription, admin or Family Tree privacy logic.
No refresh token, JWT or password in logs, URLs or localStorage.


9. Test plan
9.1 Acceptance matrix (extends §7 of the briefing)
Area
Steps and expected result
Original login
Wrong password, wrong code, expired code (wait 10 min), Back button and Show button all behave as before.
Confetti
Verified interactive login shows confetti, then the alert, then redirects after 1.5 s. redirectTo still sends first-time and expired users to subscription.html.
Unchecked login
Cookie jar has no wa_rt. The token dies at 8 h. If a wa_rt existed from an earlier login, it is cleared and revoked.
Checked login
wa_rt is present with HttpOnly, SameSite=Strict, Path=/users, about 180 days, and Secure on HTTPS. Close and reopen the browser. home.html restores without prompting.
Expiry
Set exp in the past by editing the stored token. Open home.html: restored. Open an app page: 401, bounce to login.html, silent restore, return to that page.
Loop guard
Force an app page to keep returning 401. Expect one auto-restore, then the login form. No loop.
Logout
Cookie gone, DB lineage revoked, token removed, alert and redirect as before. Reopen the browser: not signed in. A second device is still signed in.
Offline logout
Go offline, log out, go online, reopen. The pending-logout flag fires, and no restore happens.
Shared PC
Person A logs in checked, then person B logs in unchecked in the same browser. A's cookie is superseded. Closing and reopening does not restore A.
Multiple tabs
Open 3 tabs with an expired token and reload all at once. All end up signed in. No lineage is revoked. Repeat with Web Locks disabled to exercise the grace window.
Reuse
Replay a rotated cookie after 30 s: 401, whole lineage revoked, a warning logged. Replay inside 30 s: new JWT, no new cookie.
Direct access
Signed-out visit to changePassword.html: no operable form, redirect to login.html. POST /users/change-password with no JWT: 401.
Button visibility
Change Password hidden when signed out, with an expired token, and after a failed restore. Visible when signed in.
Change Password
Wrong current: 403. Mismatch: 400. 7 characters: 400. 8 characters: 200. A new password with leading or trailing spaces is stored trimmed, and a login with the trimmed value succeeds.
Post-change
All web lineages revoked. If approved, TNNA tokens revoked and the phone returns to its login after the next refresh. Fresh login with the new password and email code works. The old password fails.
Throttle
Six wrong current-password attempts in 15 minutes: the sixth gets 429.
Permissions
Admin buttons, subscription disabling, Family Tree privacy locks and account ownership behave as before.
Apps
Weigh In, Budget, Family Tree: no changed payloads and no unexpected reloads. Unsaved-input behavior is unchanged from baseline.
Environments
Localhost on 8080 and on another port (cross-origin credentialed), Render over HTTPS (Secure set, deletion works), each production hostname separately.
Devices
iPhone Safari (script-writable storage can be evicted after about 7 days without interaction, so verify that the cookie still restores), Android Chrome, the installed PWA, and TNNA on Android 8 and 15.
Service worker
After deploy, a normal reload gets the new login.html and home.html. sw.js is untouched.
Regression
Every modified file has a ledger-complete diff -u. Every unmodified file still matches its baseline hash.

9.2 API-level tests (Phase 1, no UI)
verify-code with and without keepSignedIn: check Set-Cookie headers and response shape.
refresh-session: no cookie, valid cookie, rotated cookie inside and past 30 s, revoked, expired, and cross-origin Origin.
Two parallel refresh-session requests with the same cookie: exactly one rotation, and the other gets the grace result.
logout with and without a cookie, and twice in a row.
change-password: each failure path, success, and the revocation counts in the database.
Check that the cookie Max-Age resets on every rotation and that the absolute cap truncates ExpiresAt.


10. Residual risks and separately approvable fixes
Residual risks after Phase 1 (state them in the docs; don't hide them):

Access JWTs survive logout and password change for up to 8 hours. This is true today for logout. The §6 epoch closes it.
localStorage.token is readable by injected script (XSS). This is the existing design. The new 180-day credential is not exposed that way. It is HttpOnly, but injected script can still call the refresh endpoint while the page is open. WA has no Content-Security-Policy today. A CSP would be the strongest next control.
A stolen, unlocked browser holds a 180-day credential. Logout and password change both revoke it. There is no "sign out other devices" screen in Phase 1.
TNNA offline mode (up to 30 days) cannot be remotely revoked. TNNA access tokens also live up to 8 hours after a password change.
Per-hostname sessions. Users on a second hostname log in again.
In-memory throttle resets on restart and doesn't span multiple instances.
Edge case: a browser crash between the server rotating a token and the browser storing the new cookie forces one full login. That is rare and safe.

Pre-existing weaknesses that the 180-day credential depends on (not bundled; each needs your approval):

Item
Fix sketch
/verify-code has unlimited attempts, and a 6-digit code is brute-forceable inside the 10-minute window
Attempt counter on LoginVerificationT, then invalidate the code after about 5 failures. Needs a schema change.
Code from Math.random()
Use crypto.randomInt(100000, 1000000).
/login has no throttle
The same in-memory limiter, keyed by username and IP.
/verify-code lookup lacks FOR UPDATE (a double-submit race)
Mirror tnna.js, which already locks.



11. Decisions I need from you
Absolute session cap: 365 days, as recommended, or a different number, or none?
TNNA on password change: revoke TNNA refresh tokens too (recommended), or website only?
JWT revocation epoch: Phase 1 without it (recommended), or include it now?
Hostnames: confirm API and page share an origin on every production host, and which hosts are in use.
Optional items: new-equals-old rejection, password-changed email, and the private-device note: yes or no for each?
Pre-existing hardening (§10): approve any item now, or defer?


Appendix A — SQL sketch (verify types against wappsDump.sql before running)
UserID INT NOT NULL below is a placeholder. The foreign key only works if the type and signedness match UsersT.UserID exactly. Confirm in the dump.

CREATE TABLE IF NOT EXISTS `WebRefreshTokenT` (

  `WebRefreshTokenID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,

  `UserID` INT NOT NULL,

  `FamilyID` CHAR(32) NOT NULL,

  `TokenHash` CHAR(64) NOT NULL,

  `SessionStartedAt` DATETIME NOT NULL,

  `CreatedAt` DATETIME NOT NULL,

  `ExpiresAt` DATETIME NOT NULL,

  `LastUsedAt` DATETIME DEFAULT NULL,

  `RotatedAt` DATETIME DEFAULT NULL,

  `RevokedAt` DATETIME DEFAULT NULL,

  `RevokedReason` VARCHAR(20) DEFAULT NULL,

  PRIMARY KEY (`WebRefreshTokenID`),

  UNIQUE KEY `UX_WebRefreshToken_TokenHash` (`TokenHash`),

  KEY `IX_WebRefreshToken_User` (`UserID`, `RevokedAt`),

  KEY `IX_WebRefreshToken_Family` (`FamilyID`),

  KEY `IX_WebRefreshToken_Expires` (`ExpiresAt`),

  CONSTRAINT `FK_WebRefreshToken_User`

    FOREIGN KEY (`UserID`) REFERENCES `UsersT` (`UserID`) ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

Rollback:

DROP TABLE IF EXISTS `WebRefreshTokenT`;

Reason values used: ROTATED, LOGOUT, PASSWORD_CHANGE, REUSE, SUPERSEDED.
Appendix B — Documentation to update after implementation
Per CLAUDE.md §14 and §17: update wappsDump.sql (it is Git-ignored, so keep the Drive copy current), CLAUDE.md and TechSummary.md. Record the new table, the three /users endpoints, the cookie contract, the "login.html as restore point" pattern, and the residual-risk list. While there, note that TechSummary.md §4.8 says 56 tables while the executive summary says 60, and several newer tables (FTPetT, the four Family Tree privacy tables) are missing from the inventories. Reconcile those against the dump.

End of guidance.
