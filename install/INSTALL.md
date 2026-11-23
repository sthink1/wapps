# R20 Production Environment Compatibility — proposed installation

Date: 2026-11-22. Scope approved for Step B preparation only; **NOT APPROVED FOR INSTALLATION, COMMIT, DEPLOYMENT OR DB CHANGE**.

## Baseline and destinations

Branch `reviseLogIn` at `b751e17`. Exact Google Drive originals matched GitHub blob IDs for three files. All paths in `install/manifest.json` are WA-relative. `REPLACE` files are complete; `NEW` offline test is complete. Compare baseline to current local branch before installation; if source changed, stop and rebase.

## Recommended owner-controlled Step C (separate approval)

1. Review complete diffs and file verification reports under `change/`.
2. Back up the three original source files using the owner's `_COPY` convention OUTSIDE public assets.
3. Install only the five operational files from the ZIP into the exact manifest paths on the development branch; then synchronize manually to the authoritative Drive folder.
4. Keep `WA_PRODUCTION_RELEASE_GATE` **unset** in staging; do not configure real production values, connect to a real production database, or deploy to production.
5. No changes to `main` or production are approved. Staging Auto-Deploy is On Commit: a later authorized development push triggers staging deploy, and must be separately coordinated.

## Verification (after separately authorized installation)

Read-only checksum comparison to `change/SHA256SUMS.txt`; `node --check` for each revised JS file; `node tests/r20.environment-compatibility.offline.test.js`; `node tests/r20.db-connection.offline.test.js`. Before any staging deployment, run targeted staging environment guard, login/refresh/logout and TNNA smoke tests. Record all results; do not infer pass.

## Production release prerequisites

Before proposing the final production settings, owner must approve candidate DB name, user, origin, TLS, connection cap and cutover sequence. This prepared implementation currently uses explicit `WA_PRODUCTION_RELEASE_GATE=owner-authorized`, `WA_PRODUCTION_DB_NAME`, `WA_PRODUCTION_DB_USER`, `WA_PRODUCTION_ORIGIN` gates. They are *configuration confirmations*, not substitute for external release approval. Current code refuses existing `wapps_production`, staging `wapps_test` and R20/H109 disposable DBs in production mode. Future production must use an approved new DB and credentials. Production operations, schema/data conversion, rollback rehearsal, independent security review, and One Tree findings remain separate mandatory gates.

## Rollback

If local acceptance fails, owner restores exact pre-install `_COPY` versions of three revised files and removes the two newly added offline tests, then validates hashes. No SQL changes exist in this package. Do not describe a code rollback as an adequate rollback of future database migration or writes.

## Limitation

Tests are offline, synthetic and mock-based. Real Render runtime, real production connection, source/DB migration, production PWA version switch, external review and production operation remain untested/unapproved.
