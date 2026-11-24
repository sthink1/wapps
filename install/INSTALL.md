# M03-H03 — Real database acceptance test

**Approved scope:** November 24, 2026; owner-authorized controlled synthetic test creation, merge and cleanup in `wapps_test`. This is a Step D test package, not a change to operational source.

## Installation manifest

| ZIP-relative file | WA-relative destination | Classification |
|---|---|---|
| `tests/M03-H03_real_db_test.cjs` | `tests/M03-H03_real_db_test.cjs` | NEW test runner |
| `change/M03-H03_real_db_test_verification.md` | `change/M03-H03_real_db_test_verification.md` | NEW test evidence/limitations |
| `change/M03-H03_real_db_test_SHA256SUMS.txt` | `change/M03-H03_real_db_test_SHA256SUMS.txt` | NEW checksums |
| `install/INSTALL.md` | None — read in extracted package | Package-only instructions; do not overwrite previous installation instructions |

Extract outside the project. Copy the three new files manually to their specified project paths. Stop if any already exists with different content. Do not replace `routes/familyTree.js` or any existing project file. Synchronize new files to authoritative Google Drive according to the established owner-controlled workflow. Do not commit or deploy yet.

## Execute from WA root

```powershell
node --env-file=.env.test .\tests\M03-H03_real_db_test.cjs
```

The runner independently checks branch `reviseLogIn`, HEAD `fd2e1c308b3f8f4e4ff55c6996a5e00a13af5c10`, installed route SHA-256 `75b705aed2b6958273e03e1e0bdf97be028f96cd2fc8d860b569b1fe7a3c8906`, DB host, user, name, port, authenticated DB identity, TLS, transactional engines, visible triggers and transaction state before exercising the route. It uses an isolated Express listener on loopback and a single database connection with an outer transaction. It never commits the outer transaction. If a check fails, stop and return the output; do not bypass guards or rerun with a different database. No WA application restart or manual SQL query is needed.

Expected final lines (not yet executed on the owner database):

```text
DATABASE CASES: 15 passed, 0 failed
ROLLBACK AND SYNTHETIC RECORD CLEANUP: PASS
REAL DATABASE ACCEPTANCE: PASS
```

An optional no-database guard check is `node .\tests\M03-H03_real_db_test.cjs --self-test`. This already passed independently and is not another required owner step.

The checksum manifest lists the runner and verification report (paths relative to WA root). To verify the runner independently: `Get-FileHash .\tests\M03-H03_real_db_test.cjs -Algorithm SHA256`. Compare with the manifest. The package instructions are not intended to replace an existing project file.

## Rollback / limitations

The runner stops route activity before rolling back the single outer transaction, checks the scoped fixture IDs in all listed tables after rollback, checks the merge IDs, and closes the connection. Auto-increment sequence gaps may remain even after successful rollback. If cleanup cannot be confirmed, do not attempt manual deletion or further merges; preserve output for reconciliation. If the runner must be withdrawn, remove only the three newly installed files manually; no operational source rollback is necessary. Do not remove previously accepted M03-H02/M03-H03 source or evidence.
