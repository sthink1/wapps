# M03-C01 / M03-M04 — Read-only acceptance test

Install manually from the extracted ZIP. All four files listed below are new; no operational replacement. This INSTALL.md is reference only; do not overwrite the project install/INSTALL.md.

- `tests/M03-C01_M04_readonly_db_test.cjs` — new executable; SHA-256 `6c3e3363ec3a3dc1992432848d5497036e1c0634537dca5a6c6edd80e38f4073`
- `change/M03-C01_M04_readonly_db_test_verification.md` — new verification report
- `change/M03-C01_M04_readonly_db_test_preparation.log` — new offline preparation evidence
- `change/M03-C01_M04_readonly_db_test_SHA256SUMS.txt` — new checksum manifest (excludes itself)

In the WA root on reviseLogIn at 8db2689 with both installed containment routes, run:

```powershell
if ((Get-FileHash .\tests\M03-C01_M04_readonly_db_test.cjs -Algorithm SHA256).Hash -ne '6c3e3363ec3a3dc1992432848d5497036e1c0634537dca5a6c6edd80e38f4073') { throw 'Test runner hash mismatch' }
node --env-file=.env.test .\tests\M03-C01_M04_readonly_db_test.cjs
if ($LASTEXITCODE -ne 0) { throw 'Acceptance incomplete; stop and report the output' }
```

Expected final lines (only if all checks pass):

```
READ-ONLY TRANSACTION ROLLBACK: PASS
DATABASE CASES: 8 passed, 0 failed or not run
READ-ONLY DATABASE ACCEPTANCE: PASS
```

No application restart. No SQL mutation, synthetic records, actual merge/undo, external storage or notification. The runner stops on baseline, database identity, TLS, fixture or assertion failure; do not bypass safeguards. Remove these new files manually to roll back the package; no existing source changed. Do not commit or deploy until separately authorized.
