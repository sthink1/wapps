# Stage 6 Group 3A — Home KMLI Indicator (2026-10-26)

## Scope
Changes **only** `httpdocs/home.html` and `routes/users.js`. Does not change JWT lifetime, login or logout, refresh cookies, database schema, subscriptions, TNNA, or any other application. The Home indicator is based exclusively on a server-confirmed `WebSessionT.IsRemembered` for the authenticated session.

## IMPORTANT: local version check before installation
Source files were retrieved from the October 25 Google Drive copy. Local files may have changed since the copy. **Do not blindly overwrite.** Compare the candidate files to local files using VS Code Compare (or `git diff --no-index`) and review the localized changes. In particular, only the `session-status` handler and Home's restore/display sections should change. If local files contain newer differences, merge only these hunks.

## Suggested installation
1. Confirm branch `reviseLogIn`, `WA_ENV=local`, DB `sql5838929`, and save copies of current `httpdocs/home.html` and `routes/users.js` outside the project or with a `.bak` extension.
2. Compare the two proposed files and install only after checking the diff. No SQL required.
3. Run `node --check routes/users.js` and `git diff --check`.
4. Restart **only the local `.env.test` server** so `routes/users.js` is reloaded. Leave production untouched.
5. Hard-reload Home to avoid a stale cached page; verify in DevTools Network the new `/users/session-status` returns `keepMeLoggedIn: true/false` without credentials.

## Manual acceptance tests (Chrome Incognito)
A. Login as `sthink` KMLI **checked**: Home displays `Logged in as: sthink with KMLI`; correct admin controls and subscriptions.
B. Delete only `localStorage.token` and reload Home: refresh returns 200 and `with KMLI` persists.
C. Logout and login as `sthink` KMLI **unchecked**: Home displays only `Logged in as: sthink`.
D. Logout: Home displays `Not Logged In`, no KMLI label.
E. Standard user `charter` with checked KMLI: label shown but Standard permissions unchanged.
F. Wrong/revoked/expired ordinary access: never show a KMLI label or privileged controls.

## Scope note
The existing shared platform `WA.session.restore()` is untouched. New `/users/session-status` field is a Boolean and exposes no secret. The extra Home session-status read runs only for authenticated sessions; a failure hides the optional label.

## Rollback
Restore saved `home.html` and `users.js`, restart local test server, recheck Home. No database rollback.

## Tracking
Record this addition as a Group 3A change, and update `Stage6_OpenItems.md`, `Stage6_Render_TestPlan.md` and `Stage6_Production_Implementation_Plan.md` at the end of the test group. **Do not call it passed until actual browser tests finish.**
