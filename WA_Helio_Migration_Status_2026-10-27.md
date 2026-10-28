# Wonderful Apps — HelioHost MariaDB migration status

**Date:** October 27, 2026  
**Status:** Local-only evaluation; production remains unchanged.

## Authority and configuration

- WA authoritative Google Drive folder: `My Drive/wonderfulApp`, folder ID `1SBkEcRIb-ekv83-EoZXHkH0cderSHWec`; Windows `G:\My Drive\wonderfulApp`.
- Current local branch: `reviseLogIn`; preserve existing tracked and untracked Stage 6 work.
- Production: Render + existing freeSQLdatabase production database, **unchanged**.
- Old test database: freeSQLdatabase `sql5838929` (MySQL 5.5.62).
- New test database: HelioHost Johnny `wapps_test` (MariaDB 12.3.3).
- Dump names: `wappsHelioDump.sql` (source test dump) and `wapps_test.sql` (HelioHost export).
- `.env.test` points to HelioHost for the current local experiment.
- `.env.testFreeSQLdb` is the user's preserved reference copy of the original freeSQLdatabase test settings; it is not automatically read by Node. Treat both environment files as secrets.
- Preferred launch command: `node --env-file=.env.test server.js`.

## Evidence and results

1. Dump import succeeded; 71 tables created on HelioHost.
2. Comparing source and destination SQL dumps found matching exported data and key definitions; this does not certify runtime behavior.
3. Windows Node.js v24.22.1 / mysql2 v3.14.1 successfully connected to HelioHost using TLS and confirmed a cipher `TLS_AES_256_GCM_SHA384` with 71 tables.
4. WA local login and several sampled applications succeeded with HelioHost.
5. Budget Print My Details initially failed with error: `User wapps_test already has more than 'max_user_connections' active connections`.
6. HelioHost Johnny reports `max_connections=300` globally and **`max_user_connections=10`** per database account.
7. The pre-adjustment WA connection pool allowed up to **50** connections. After making the pool limit configurable and setting **`DB_CONNECTION_LIMIT=5`** in `.env.test`, **Budget Print My Details succeeded** locally.

## Important engineering conclusions

- Five connections is an initial **per-pool** cap, not a guaranteed total across all WA modules or processes.
- `waitForConnections: true` allows query requests to wait for a pooled connection, with potential latency under load.
- This specific failure was caused by exceeding the database user's connection limit; it is not evidence of MariaDB schema incompatibility.
- Morty account connection limits are **not confirmed**. Do not assume they equal Johnny's ten or exceed it.
- The restored password worked in Node TLS testing; do not record it in documentation or logs.
- Stage 6's startup database identity checks and production isolation must remain intact. HelioHost local-only exceptions are not staging authorization.

## Work remaining

- Test other WA operations, including intentional test-data writes and rollback/cleanup.
- Audit every `mysql2.createPool` / `createConnection` in the project for total possible connections.
- Monitor simultaneous usage and query latency; investigate errors and timeouts.
- Confirm behavior of outbound email/notifications/background jobs in local testing.
- Later establish Morty's limits and backups, and perform an independent Stage 6 review before any hosted/production migration.

## Documentation alignment

For future updates to `CLAUDE.md` and `TechSummary.md`, carry forward the facts above. Their older statements about historic table counts are not evidence of the October 27 HelioHost test inventory. Avoid rewriting unrelated architecture without a separate current-file audit.
