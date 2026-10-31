# WA Stage 6 — H109 real disposable MySQL integration test

## Scope

One **new** test file only. No changes to the existing three Group 5B files, application code, or SQL schema in shared `wapps_test`. Its purpose is to restore integration coverage that simulations cannot establish:

- Actual `credentialFence.lock()` across two MySQL connections, including a blocked `SELECT ... FOR UPDATE` and rollback.
- Actual `browserSession.create()` and `browserSession.rotate()` against InnoDB tables in a **separate, empty disposable test database**.
- Consumed-token replay rejection and two simultaneous rotations yielding one success, one rejection and one successor row.

The test creates four minimal tables inside the disposable database, inserts one synthetic user, and drops its own tables after execution. No email, HTTP, Chrome, TNNA, or existing account is involved. Failure during cleanup is reported, not silently ignored. The test cannot claim production HTTP integration.

## Important existing code constraint

`services/stage6Environment.js` intentionally only permits the main test database identities. H109 locally overrides that module **inside this one Node test process** before importing the unchanged real `browserSession.js` so an independent database can be used. It does not edit or deploy any application source. Test sessions use a new random JWT secret generated at runtime, not `.env.test` JWT_SECRET.

## Gate and database creation

**DO NOT run a live test against `wapps_test`, `sql5838929`, production, or a database containing any tables.** The H109 file refuses them by name and requires the disposable schema to be completely empty.

An authorized database administrator must first create a **separate empty MySQL database** named, for example, `wa_h109_isolated`, and a database-only user with schema CREATE/DROP/SELECT/INSERT/UPDATE privileges *restricted to that database*. Database service/host can be local or HelioHost if its account permissions allow a separate schema. Do not create or run this on the production service. No SQL statements are provided for changing existing users or database grants.

Supply dedicated environment variables to a new PowerShell session, preferably by `Read-Host -AsSecureString` plus a safe short-lived test-only credential handling workflow. Never print a password or copy it into Git:

```
H109_DB_HOST
H109_DB_PORT    (optional, defaults to 3306)
H109_DB_NAME    (must start with wa_h109_)
H109_DB_USER
H109_DB_PASSWORD
```

These are deliberately **separate** from `DB_NAME` and `DB_PASSWORD` in `.env.test`. The test checks the actual connected database identity and that `information_schema.TABLES` reports exactly **zero tables** before creating fixtures. It also requires TLS when the host is not local. The actual MySQL account must have suitable permissions.

## Installation and first safe check

Copy only `tests/stage6.h109.disposable-integration.test.js` to the project's `tests` folder on `reviseLogIn`.

```powershell
git branch --show-current
git status --short
node --check .\tests\stage6.h109.disposable-integration.test.js
node --env-file=.env.test .\tests\stage6.h109.disposable-integration.test.js
```

The final command **must print `SAFE STOP` without connecting to MySQL**. Do not add any switches or new database credentials until the separate empty database, privileges, and source diff are reviewed.

## Live execution — separate approval step only

After an actual independent disposable database has been created and verified, and test credentials set using H109_DB_* variables, the controlled command would be:

```powershell
node --env-file=.env.test .\tests\stage6.h109.disposable-integration.test.js --run-live --confirm-empty-disposable-db
```

This **does perform DDL and DML** in the dedicated H109 database; it must not be run yet. Do not confuse successful source/safety checks with actual InnoDB and replay verification. If a test fails, inspect the exact error and verify table cleanup before any rerun.

## Coverage limits

Tests real service code plus MySQL row locks, token rotation, and token replay. It does not exercise Express routes, proxy trust, delivery of real email, or browsers. Its minimal isolated schema may not match all future production constraints; review it if WA migrations change the service SQL. The H109 database is deliberately empty at both start and successful finish.
