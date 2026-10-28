# Wonderful Apps — Stage 6B Group 2, revoked-session Home correction

**Scope:** Local `reviseLogIn` branch only, `httpdocs/home.html` only. No SQL, JWT lifetime, backend, Render, or production changes.

## Install (do not skip source-check)

1. Stop local test server with Ctrl+C, if convenient. Preserve `sql5838929` test isolation.
2. Copy `apply-stage6b2-revocation-fix.cjs` into the project's `tests` folder (plural, alongside `waPlatform.unit.test.js`).
3. From `C:\AppProjectwDB\WonderfulAppsRender`, run:

```powershell
node --check tests/apply-stage6b2-revocation-fix.cjs
node tests/apply-stage6b2-revocation-fix.cjs
git diff --check
git diff -- httpdocs/home.html
```

The installer checks 8 source anchors and **stops before any write** if the local Group 2 file differs. It creates `httpdocs/home.html.group2-revocation-before`. **If it stops, do not hand-edit blindly; share the error.**

## Intended behavior

- Home trusts server-validated `WA.session.restore()` before showing username, change-password link, or making protected tracking/admin calls.
- Restricted application buttons fail closed when subscription status cannot be verified. The normal logged-out page retains its existing Login-required modal behavior and Logout button visibility.
- Confirmed 401 subscription rejection clears obsolete local access token; transient outage is not treated as confirmed revocation.
- The page-tracking diagnostic no longer prints the JWT; the existing tracking payload is preserved for backend compatibility.
- The patch does not change `waPlatform.js` or other pages.

## Validate using Chrome Normal and Incognito

1. Restart local server only with `node --env-file=.env.test server.js`; confirm `WA_ENV=local; test DB verified`.
2. **Chrome Normal:** stale remembered `charter` session left over from Change Password → Ctrl+R on Home. Expected: **Not Logged In**, no Change Password link, no restricted app navigation. 401 requests may still be visible during the first restore attempt; this is expected when credentials have been revoked. Never rely on button color as authorization proof.
3. **Chrome Incognito:** currently signed out after Change Password → Home displays Not Logged In. Confirm Logout button stays visible and its click has no effect.
4. **Chrome Incognito:** log in using the *new* test password, KMLI unchecked, email verification; confirm `charter`, Standard permissions and expected disabled buttons. Do not share password.
5. **Chrome Normal:** log in using new password with KMLI checked; ensure Home shows Standard permissions. Later retry missing-token restoration and Logout to check against regression.
6. Confirm no `token:` value is printed by `Sending time spent data:` in Console. Other scripts may have separate logs that require review.
7. Re-run `node --test tests/waPlatform.unit.test.js` (expected 19 passing if unchanged) and `git diff --check`.

**Important:** This is a targeted mitigation of the reproduced Home behavior. It does not prove every protected destination and API authorization path is safe, nor does it replace browser acceptance tests. It also does not change the intentionally visible Logout button when signed out.

## Open Items

Record new item **S6-037** (High): *After password change, revoked account persisted in Home UI and failed subscription fetch left restricted buttons apparently usable.* October 25 test evidence: `/users/session-status`, `/users/refresh-session`, `/users/subscriptions/status`, `/users/is-admin`, and tracking returned 401, while Home showed `Logged in as: charter`. State **Patch prepared; local regression pending**. Add cross-session revocation test result and verify server-side endpoint authorization independently.

Record under **S6-030** that `home.html` console printed a JWT in `Sending time spent data`; patch removes this one diagnostic exposure, but broader credential-logging audit remains open.

Keep production untouched and do not commit or push until validation.
