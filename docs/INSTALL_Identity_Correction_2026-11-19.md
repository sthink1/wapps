# Wonderful Apps — Install corrected migration utility

This update fixes a single incorrect username in the November 18 consolidated package. **It does not replace other application files or run the migration.**

## Files / WA-relative destinations

| Package path | Destination | Action |
|---|---|---|
| `tools/wa-subscription-one-time-migration.js` | Same | **Replace** existing utility |
| `tests/wa-subscription-identity.offline.test.js` | Same | **New** offline identity regression test |
| `change/wa-subscription-one-time-migration.js.diff` | Same | **New** baseline-to-final diff |
| `change/wa-subscription-one-time-migration.js.verification.md` | Same | **New** verification report |
| `change/SHA256.txt` | Same | **New** checksum evidence, scoped to this correction |
| `docs/INSTALL_Identity_Correction_2026-11-19.md` | Same | **New** instructions |

Note: `change/SHA256.txt` may already exist from an earlier package. Preserve or rename that earlier evidence before copying this scoped manifest. **Do not overwrite it without retaining it.**

No `.original` files are supplied. The owner maintains its own `_COPY` originals.

## Installation

1. Retain the existing utility as `tools/wa-subscription-one-time-migration_COPY.js`, if not already done.
2. Copy the corrected `tools/wa-subscription-one-time-migration.js` into the WA `tools/` directory.
3. Copy the new test file into WA `tests/`, and the verification and documentation files into their listed paths. Avoid overwriting previous `change/SHA256.txt` evidence without preserving it.
4. Copy the installed files to your authoritative Google Drive folder, following the established WA process.
5. From the WA root in PowerShell, run **only the read-only preflight**:

```powershell
node --env-file=.env.test .\tools\wa-subscription-one-time-migration.js --check
```

Expected, if live staging data still exactly matches the dump:

```text
CHECK PASS: SOURCE; subscription rows 16; grants 13; active grants 11; redemptions 3.
```

**Do not run `--apply` during this verification step.** The next action is to review the preflight result and confirm a restorable `wapps_test` backup before separately authorizing any database mutation.

## Independent offline tests (optional)

```powershell
node --test .\tests\wa-subscription-identity.offline.test.js .\tests\wa-subscription-migration.offline.test.js
```

## Rollback

Restore `tools/wa-subscription-one-time-migration_COPY.js` to the operational file only to return to the earlier utility version; note that it has the known UserID 57 typo and will fail preflight. File rollback is not database rollback. This correction does not write database data.
