# Wonderful Apps — HelioHost local test guide

**Updated:** October 27, 2026  
**Scope:** local testing only, `reviseLogIn`; no Render deployment or production migration authorization.

## Source of truth

Authoritative WA folder: `My Drive/wonderfulApp` (Windows `G:\My Drive\wonderfulApp`; folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`). This guide documents the October 27 local test and does not replace source-code review.

## Test databases and environment files

| File | Purpose |
|---|---|
| `.env` | Existing local environment; leave unchanged for this migration test |
| `.env.test` | **Active** local test settings; currently points to HelioHost `wapps_test` |
| `.env.testFreeSQLdb` | Preserved reference copy of the previous freeSQLdatabase test settings for `sql5838929`; **not automatically loaded** |

Do not commit environment files containing passwords or secrets. Confirm that `.gitignore` excludes **both** `.env.test` and `.env.testFreeSQLdb` (and avoid exposing their contents in logs, screenshots, or Git commits). A filename such as `.env.testFreeSQLdb` is not used unless passed explicitly to Node or copied into `.env.test`.

## Confirmed database details

- FreeSQLdatabase test source: MySQL 5.5.62, `sql5838929`.
- HelioHost Johnny test: MariaDB 12.3.3, host `johnny.heliohost.org`, port `3306`, database and user `wapps_test`.
- Source dump `wappsHelioDump.sql`, imported into HelioHost; 71 tables. HelioHost export: `wapps_test.sql`.
- SQL dump comparison indicated matching exported rows and key definitions; application-level testing is still in progress.
- Node.js v24.22.1 + mysql2 v3.14.1 connected successfully over TLS, showing cipher `TLS_AES_256_GCM_SHA384`, and counted 71 tables.

## Connection limits — verified on Johnny

| Variable / setting | Value | Meaning |
|---|---:|---|
| MariaDB `max_connections` | 300 | Global server maximum, **not** the individual account allowance |
| MariaDB `max_user_connections` | **10** | Maximum active connections for the MariaDB user |
| Original WA pool `connectionLimit` | 50 | Higher than Johnny's user limit |
| Local HelioHost pool `DB_CONNECTION_LIMIT` | **5** | Working conservative local test setting |

In local tests, the Budget **Print My Details** action failed with: `User wapps_test already has more than 'max_user_connections' active connections`. After changing `dbConnection.js` to accept `DB_CONNECTION_LIMIT` and setting it to 5 in `.env.test`, **Print My Details worked**. This demonstrates the connection limit was the cause of that observed failure, not a confirmed schema or calculation error.

`waitForConnections: true` and `queueLimit: 0` let pending pool requests queue when all five pool connections are occupied. **The five-connection setting applies to one pool**, not necessarily every pool or process using the same MariaDB user. SQLTools, phpMyAdmin, additional Node processes, and any other pools consume the same ten-connection account allowance. Morty's actual limits are not yet confirmed.

## Local `.env.test` configuration

Use the existing `.env.test`, preserving its unrelated development settings and secrets. Example relevant entries (do not paste your real password into this document):

```dotenv
WA_ENV=local
NODE_ENV=development
APP_PUBLIC_ORIGIN=http://localhost:8080
WA_ALLOWED_ORIGINS=http://localhost:8080
DB_HOST=johnny.heliohost.org
DB_PORT=3306
DB_USER=wapps_test
DB_NAME=wapps_test
DB_PASSWORD=<stored secret: enter locally>
DB_SSL=required
DB_CONNECTION_LIMIT=5
```

The local-only `stage6Environment.js` revision permits HelioHost `wapps_test` only when `WA_ENV=local` and its approved host/user/port/TLS requirements match. Do **not** broaden staging or production allowances. The local-only `dbConnection.js` revision must use a TLS configuration that validates the server certificate (`rejectUnauthorized: true`). Verify these are present before running the application; the original files alone do not provide those settings.

## Start, verify, and stop

From `C:\AppProjectwDB\WonderfulAppsRender`:

```powershell
node --env-file=.env.test server.js
```

Expected startup: `Stage 6 environment: local; test DB verified`. Then visit `http://localhost:8080`, sign in with a test account, and test ordinary operations. The Budget **Print My Details** report succeeded after reducing the pool setting to 5. Other applications have been sampled, **not** comprehensively certified. Monitor Node logs for connection limit and timeout errors. Use `Ctrl+C` to stop the local server.

`node --env-file=.env.test server.js` is the preferred explicit test command; it avoids modifying `.env`. Variables already set in the PowerShell process can override file values, so verify the test target before start. Don't run multiple WA server processes against Johnny unnecessarily.

## Returning to freeSQLdatabase test

Stop the server, carefully restore the freeSQLdatabase test values from the preserved `.env.testFreeSQLdb` to `.env.test` (or explicitly launch Node with that alternate file), ensuring the active test targets `sql5838929` and satisfies Stage 6's identity guard. Retain the `DB_CONNECTION_LIMIT` configuration support; its default of 50 can be used for the original provider if appropriate. Never substitute production database credentials. Restart the local test and inspect startup identity logs.

## Restrictions and next work

- Do not change the production Render service, production MySQL database, or `main` branch.
- Stage 6 is not production-ready; independent engineering review is required before production decisions.
- Confirm every independently created MySQL pool and its connection-limit behavior before heavy load testing.
- Maintain private, strong credentials; restrict remote IP access where practical after network testing.
- Validate email, notification, background job, and external API side effects separately before functional write tests.
- Morty database connection limits, reliability, TLS settings, and backups require their own verification.
