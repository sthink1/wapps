# WA M03 — Read-only rollback verification and test-harness correction

**Purpose:** Resolve the `NaN !== 0` false failure in the previous M03 `wapps_test` test. This package does **not** change operational source or databases.

## Exact WA-relative installation paths

- `tests/stage6.m03.realdb.scope.acceptance.js` — **REPLACE** the test script installed from the preceding acceptance package. Do **not rerun** it merely to verify cleanup; this is a future-use correction.
- `tests/stage6.m03.rollback.readonly.verify.js` — **NEW**. Read-only check for residual temporary rows.
- `install/INSTALL.md`, `change/*.diff`, `change/*.md`, `change/SHA256SUMS.txt` — installation/change documentation only, not operational runtime files.

Owner installs locally and synchronizes to authoritative Google Drive using the established workflow. No GitHub, production, database, or local WA modifications by assistant.

## Baseline verification

Original test `tests/stage6.m03.realdb.scope.acceptance.js` expected SHA-256: `e88d6122c70ed74f8b835049218aebc44ddce0921c99b6fcf064d3e73c232952`. If the existing local file does not match, **stop** and reconcile before replacement.

## Run once (READ-ONLY, no fixture creation)

In project root with existing `.env.test` configured for `wapps_test`:

```powershell
node --check .\tests\stage6.m03.rollback.readonly.verify.js
node .\tests\stage6.m03.rollback.readonly.verify.js
```

Expected `PASS: No M03SC Trees or matching Scope* Fixture Persons found after rollback.` Only if that appears may we conclude the earlier rollback left no matching synthetic rows. If rows are printed, do not manually delete; report output for review. Do not rerun the seven mutation tests.

## Rollback

Remove the **new** read-only verifier file if no longer needed; for the replaced test harness, restore your exact original saved copy. This package makes no change to operational source or database. Does not authorize GitHub commit, merge, or deployment.
