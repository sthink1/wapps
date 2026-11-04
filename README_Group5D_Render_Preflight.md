# Group 5D — Render read-only preflight

**Target:** `https://wapps-stage6-test.onrender.com/home.html` ONLY.

## Established from current Google Drive source
`stage6Environment.js` restricts staging origin to `https://wapps-stage6-test.onrender.com`, requires `WA_ENV=staging`, `NODE_ENV=production`, and a single matching allowed origin. It requires `wapps_test` on HelioHost with specific credentials and TLS; `server.js` verifies the connected database before it begins listening.

The old `Stage6_Test9D_ControlledLock.js` **rejects Render** because it only accepts `http://localhost:8080`. Do not paste the old script or the less restrictive `Stage6_Test9D_Console_Arm.js` into hosted DevTools.

## Before browser testing — Render dashboard (read-only)

Check the **existing Stage 6 test service only**. Record these non-secret fields, never secrets or database passwords:

- Service URL: `https://wapps-stage6-test.onrender.com`
- Deployed branch: `reviseLogIn`
- Deployed commit SHA: compare with `git rev-parse origin/reviseLogIn`
- Most recent deploy status: Live / successful, no start-up guard error
- `WA_ENV=staging`; `NODE_ENV=production`
- `DB_HOST=johnny.heliohost.org`; `DB_NAME=wapps_test`; `DB_USER=wapps_test`; `DB_PORT=3306`; `DB_SSL=required`; `DB_CONNECTION_LIMIT=5`
- `APP_PUBLIC_ORIGIN=https://wapps-stage6-test.onrender.com`
- `PUBLIC_BASE_URL=https://wapps-stage6-test.onrender.com`
- `WA_ALLOWED_ORIGINS=https://wapps-stage6-test.onrender.com`
- Email isolation: **not verified yet**. Inspect delivery settings and routes before login / verification tests. Do not trigger outbound emails during this preflight.
- Confirm test-only users/sessions for the eventual credential-rotating test.

**No real credentials or secret values should be posted in chat.** `DB_NAME` is an environment setting, not proof of current connection; startup logs should confirm test DB identity check passed.

## Browser preflight — read-only

1. In Chrome, open the exact URL `https://wapps-stage6-test.onrender.com/home.html`.
2. Open DevTools Console.
3. Paste `Stage6_Group5D_Render_ReadOnly_Preflight.js` and press Enter.
4. Share only the Boolean checklist and `PREFLIGHT PASS` / `NOT READY`.
5. Do not run Test9D yet. This script does not read, remove, print, or send the token and makes no requests.

## Acceptance staging

This read-only preflight is **not** a live two-tab test. Only after service/DB/email isolation and preflight confirmation should the invasive controlled-lock diagnostic be adapted and authorized. The planned final test must record tab outcomes and HTTP status counts **without** sharing raw Authorization headers, cookies, JWTs, or query-string credentials.

No application source files, database rows, or Git branches were changed by preparation of this package.
