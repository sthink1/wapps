# Wonderful Apps — WA-PR-005 / IR-05 authentication abuse controls

**Review package, November 25, 2026.** Step A approved. Step B offline candidate delivered. Step C installation and Step D real acceptance not authorized or executed by this document. Test DB migration requires explicit separate approval. Do not install/run SQL/commit/deploy merely by downloading this archive.

## Manifest — exact WA-relative paths

| Path | Action |
|---|---|
| `routes/users.js` | REPLACE after checking original SHA-256 |
| `routes/tnna.js` | REPLACE after checking original SHA-256 |
| `services/loginLimiter.js` | NEW |
| `services/loginVerification.js` | NEW |
| `sql/WA_AUTH_ABUSE_2026-11-25_apply.sql` | NEW; review, execute only after separate test DB authorization |
| `sql/WA_AUTH_ABUSE_2026-11-25_rollback.sql` | NEW; execute only after separate rollback authorization |
| `change/WA_AUTH_ABUSE_users.js.diff` | NEW evidence |
| `change/WA_AUTH_ABUSE_users.js_verification.md` | NEW evidence |
| `change/WA_AUTH_ABUSE_tnna.js.diff` | NEW evidence |
| `change/WA_AUTH_ABUSE_tnna.js_verification.md` | NEW evidence |
| `change/WA_AUTH_ABUSE_offline_test.cjs` | NEW offline acceptance runner |
| `change/WA_AUTH_ABUSE_offline_test.log` | NEW actual test log |
| `change/WA_AUTH_ABUSE_source_verification.log` | NEW source verification log |
| `change/WA_AUTH_ABUSE_SHA256SUMS.txt` | NEW checksum manifest (all other archive files) |
| `docs/WA_AUTH_ABUSE_acceptance_plan.md` | NEW acceptance plan, limitations and proxy gate |
| `install/INSTALL.md` | Package instructions only; keep with extracted package, do not overwrite unrelated existing project INSTALL.md |

No original backups, dumps, secrets, .env files, frontend or unrelated source files in ZIP. Owner maintains backups separately. Branch `reviseLogIn`; GitHub HEAD verified `e8d3129fe652f1997084234e590e555cd373ffee` before package creation. The authoritative route files match exact Git blobs.

## Review / verify without installing

Extract ZIP outside WA. In PowerShell, from extracted root:

```powershell
Get-Content .\change\WA_AUTH_ABUSE_SHA256SUMS.txt | ForEach-Object {
    $expected, $relative = $_ -split '\s+', 2
    $actual = (Get-FileHash -LiteralPath $relative -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) { throw "Checksum mismatch: $relative" }
    Write-Host "PASS $relative"
}
```

Compare current project originals using `Get-FileHash -Algorithm SHA256` against the individual verification reports. `credentialFence.js` must have SHA-256 `7cf2c7c48bb6cd8aa947f54347f527d1e5342f2aa49840aa4081737e8fca6ba7`. Stop for any baseline or destination conflict. New paths must not already exist. Run offline test before installation if desired, using actual unchanged fence path (adjust if needed):

```powershell
node --check .\routes\users.js
node --check .\routes\tnna.js
node --check .\services\loginLimiter.js
node --check .\services\loginVerification.js
node .\change\WA_AUTH_ABUSE_offline_test.cjs --fence "C:\AppProjectwDB\WonderfulAppsRender\services\credentialFence.js"
```

Expected offline result: `46 passed, 0 failed, 46 cases.` This uses local loopback only and does not load credentials or connect to a real database. Evidence produced independently on Node 22.16.0; local Node 24.22.1 rerun is outstanding.

## Migration gate — wait for explicit authorization

Target only `wapps_test`, `morty2.heliohost.org`, TCP 3306, authorized `wapps_test` database account, TLS with certificate validation. Use owner-controlled test DB client. Do not share credentials. Do not execute against production. Back up the test DB before migration; keep dump private. Pause all local/staging authentication traffic sharing this database under separate authorization, including old route instances; allow existing pending challenges to expire (ten minutes) before new code is enabled. Verify branch/source and secure test DB identity. Read-only preflight queries:

```sql
SELECT DATABASE(), CURRENT_USER(), @@hostname, @@port;
SHOW STATUS LIKE 'Ssl_cipher';
SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES
 WHERE TABLE_SCHEMA='wapps_test'
 AND TABLE_NAME IN ('UsersT','UserSecurityT','LoginVerificationT','LoginRateT');
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
 FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA='wapps_test' AND TABLE_NAME='LoginVerificationT'
 AND COLUMN_NAME='FailedAttempts';
SELECT COUNT(*) FROM wapps_test.LoginVerificationT;
```

Expect correct identity/account, TLS active, existing three tables InnoDB, no LoginRateT and no FailedAttempts. Record the existing challenge row count while quiescent. If any check fails, do not execute. DDL autocommits; execute statements of apply script individually in order, stop on first error. Do not blindly rerun. The migration creates one InnoDB table and adds one NOT NULL counter with default zero. No existing session or user data modified by the apply script. Post-check table engine, index, columns, `FailedAttempts` default and count unchanged, and empty new table while quiescent. Example:

```sql
SHOW CREATE TABLE wapps_test.LoginRateT;
SHOW COLUMNS FROM wapps_test.LoginVerificationT LIKE 'FailedAttempts';
SELECT COUNT(*) FROM wapps_test.LoginRateT;
SELECT COUNT(*) FROM wapps_test.LoginVerificationT;
```

If partial DDL success, stop; inspect actual schema and agree a recovery plan. No automatic SQL execution in the package. The test migration is not a production migration script; final production schema and migration/release are separate previously agreed workstreams.

## Installation and acceptance after authorization

Stop local server and prevent staging from using mismatched old/new routes during migration. Preserve owner-managed exact backups of both old routes (outside public static paths). After successful test schema migration, manually install the two replacements and two new services at exact project paths, then supporting files as listed; do not overwrite unrelated install docs. Verify installed hashes and syntax. Follow the real acceptance plan in docs; use Node 24.22.1, actual local Express and test DB only. The new code requires the migration and will deny/fail if schema is absent. Do not start with missing schema. Do not commit/sync until acceptance and owner approval. Owner manually syncs accepted files to authoritative Drive according to approved process.

## Rollback

Stop all affected app instances. Restore original route backups and verify original SHA-256; remove only the two new services if they were installed by this package. The previous routes work with the added schema while recovery is arranged. Do not drop schema while new code is running. With separate approval, execute rollback SQL only on verified wapps_test, after checking the actual schema and backups. It expires all outstanding unverified login challenges (prevents resurrecting exhausted codes), drops FailedAttempts and LoginRateT, discards newly recorded rate-limit data. Existing authenticated sessions are not intentionally revoked by rollback. DDL is nontransactional; stop on error. For partial migrations do not run the full rollback blindly; inspect and authorize only needed statements. Verify original schema and source before starting old server; accept that old code lacks these protections. Production rollback/release is outside this package.
