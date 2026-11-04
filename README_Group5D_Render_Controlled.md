# WA Stage 6 Group 5D — Hosted Controlled Two-Tab Test

## Preconditions

- Render dedicated service `wapps-stage6-test` is Live on `reviseLogIn`; last screenshot showed commit `9e443c7`.
- Exact URL: `https://wapps-stage6-test.onrender.com/home.html`. **Never run on production.**
- Prior read-only browser preflight passed all seven checks.
- Use two tabs of **one Chrome Normal profile**, logged into the **same opted-in Keep Me Logged In session**. Do not use an existing unrelated user account; use a test account whose session may be rotated or invalidated.
- Sign in using the normal app UI before arming the test. The script does **not** create users, send emails, change passwords, or log in.
- Check both tabs say logged in. Do not use Incognito alongside Normal, a second Chrome profile, or a different browser.

## Execute

1. Open two normal Chrome tabs at the exact staging home URL; ensure both have the same authenticated session and remember-me option.
2. Open DevTools > **Console** in both tabs. Paste the entire `Stage6_Test9D_Render_ControlledLock.js` into each, pressing Enter in each. Both should report `ARMED`.
3. Optional: open DevTools **Network** in at least one tab, select Fetch/XHR, enable Preserve log, and filter `refresh-session`. Do **not** export HAR or copy any request headers or credentials.
4. In **only one** tab Console, run:

   `__waHosted5D.start('RUN_STAGE6_TEST')`

5. The diagnostic first obtains a two-tab readiness acknowledgement. If the other tab is absent, it aborts **without deleting the token**.
6. It then takes the existing `wa-web-refresh` Web Lock, removes the access token from same-origin localStorage, and triggers one `WA.session.restore()` per tab. Both should queue until the lock is released.
7. Record `LOCK counts`, `SUMMARY`, the two `RESTORE result` lines, and the number/status of `POST /users/refresh-session` requests **without including JWTs, cookies, headers or raw request/response bodies**.

## Expected evidence

- Two tabs entered, two results received, `authenticated=2/2`.
- A serialized refresh operation. In the expected success case, there should be one successful refresh-cookie rotation, and the waiting tab should reuse the new access token rather than rotate twice.
- Do not automatically interpret any single status, including 401, as a pass. An authenticated session and per-tab results are required.
- This script deliberately makes live staging authentication requests and modifies browser localStorage. It does not change schema or application source, but may update `WebSessionT` / `WebRefreshTokenT` in the staging database.

## Cleanup

In each tab, run `__waHosted5D.close()` (unless page was reloaded). Log out normally through the app when finished. If it reports unconfirmed server revocation, record that for follow-up. Do not clear all browser data as a routine shortcut.

## Limitations

This tests one controlled run. It is not a full proof of all races or network conditions. The diagnostic is not part of the deployed application. The lock count and network statuses should be interpreted together, and the independent design review is still required before merge/production decision.
