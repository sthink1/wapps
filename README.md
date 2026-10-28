# WA Stage 6 — Render staging predeployment candidate (2026-10-28)

## Source and scope
Based on current `My Drive/wonderfulApp` copies of `services/stage6Environment.js`, `dbConnection.js`, and `server.js`. No production or Git files were changed by preparing this package. `server.js` is included **unchanged** for context.

## Changes
- `services/stage6Environment.js`: allow HelioHost `wapps_test` as the exclusive permitted HelioHost database in **local and staging** modes; retain fixed host, user, port and TLS checks. Staging using HelioHost requires pool limit exactly 5, `APP_PUBLIC_ORIGIN` exactly `https://wapps-stage6-test.onrender.com`, and `PUBLIC_BASE_URL` equal to that origin. Existing staging `NODE_ENV=production` and single CORS origin requirements remain.
- `dbConnection.js`: apply `ssl: {rejectUnauthorized:true}` to the HelioHost test identity in **staging** as well as local mode. Existing `DB_CONNECTION_LIMIT` support remains unchanged.
- `server.js`: no modification; retains startup DB identity/timezone check before listening.

## Preflight only — NOT READY FOR FIRST DEPLOYMENT
The following must be reviewed independently before creating the Render service:
1. **No production access**: `DB_HOST=johnny.heliohost.org`, `DB_NAME=wapps_test`, `DB_USER=wapps_test`, `DB_PORT=3306`, `DB_SSL=required`, `DB_CONNECTION_LIMIT=5`, `WA_ENV=staging`, `NODE_ENV=production`, `APP_PUBLIC_ORIGIN=PUBLIC_BASE_URL=WA_ALLOWED_ORIGINS=https://wapps-stage6-test.onrender.com`; do not expose secrets.
2. **R2 isolation**: use a separate staging R2 bucket and restricted staging credentials; production and staging must not share the bucket/object keys for write/delete. The pool and stage6Environment guards do not verify R2 isolation.
3. **Email isolation**: verify real-email sending cannot reach unintended recipients; MAIL_TO_ADDRESS alone may not globally restrict sends.
4. **Other external integrations**: inspect TNNA, notification, ETF and background jobs for side effects; direct references to production services must be isolated.
5. **Security reviews**: run the existing Group 0d/Stage 6 regression tests and independently assess whether the approved staging DB change affects authentication tests; source files have only passed syntax and targeted configuration checks here.
6. **Git**: render deploys only pushed commits. Ensure revised `ftPrivacy.js` and all intended Stage 6 files are in the reviewed deploy commit; preserve other working changes.

## Installation (only after review)
Back up the existing local files; replace only `services/stage6Environment.js` and `dbConnection.js` on `reviseLogIn`. `server.js` is informational and is unchanged. Run `node --check` on both files and the existing test suite. Do not merge into `main` or deploy production.

## Rollback
Restore the two backed-up files; do not use the staging changes to alter production configuration.
