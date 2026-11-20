# Stage 2C — Installation and approval manifest

**Status:** Proposed package for owner review; no installation/deployment authorized by package creation.

## Files and WA-relative destinations

| ZIP path | Intended WA destination | Classification |
|---|---|---|
| `services/subscriptionService.js` | `services/subscriptionService.js` | REPLACE existing |
| `tests/stage2c.development-entitlement.offline.test.js` | `tests/stage2c.development-entitlement.offline.test.js` | NEW |
| `change/subscriptionService.original.js` | none — rollback reference only | Evidence |
| `change/subscriptionService.js.diff` | none — complete original-to-final diff | Evidence |
| `change/subscriptionService.js.verification.md` | none — standalone file verification | Evidence |
| `change/SHA256.txt` | none — checksum evidence | Evidence |
| `docs/INSTALL_Stage2C.md` | none — package instructions | Documentation |

## Baseline verification before installation

1. Confirm local `services/subscriptionService.js` SHA-256 = `9cf2fc6ca2808e55b3e056b71923f93639adae8a5d529436d7deec46f9f64830`; **stop** if it differs and reconcile the source.
2. Independently review `change/subscriptionService.js.diff` and `change/subscriptionService.js.verification.md`; verify every difference is approved.
3. Confirm there is no existing `tests/stage2c.development-entitlement.offline.test.js` (new-file collision check).
4. Back up current source and follow owner-controlled staged installation only after explicit approval.

## Installation and verification (OWNER only, after approval)

1. Copy `services/subscriptionService.js` and `tests/stage2c.development-entitlement.offline.test.js` from the ZIP to those exact WA-relative paths. Do not copy `change/` or `docs/` files to the WA project root.
2. Verify SHA-256 from `change/SHA256.txt` for both installed operational files.
3. Run from project root: `node --test tests/stage2c.development-entitlement.offline.test.js`.
4. Conduct separate controlled integration/regression testing before staging deployment; do not deploy to production as part of Stage 2C.

## Rollback

Restore `change/subscriptionService.original.js` as `services/subscriptionService.js` and verify original SHA-256 `9cf2fc6ca2808e55b3e056b71923f93639adae8a5d529436d7deec46f9f64830`. Remove only the newly installed Stage 2C test file if appropriate. No schema/data rollback is needed because this package contains no database writes or migrations.

## Existing evidence preserved

All prior R16-75 T09/T10/T12 and R10/R14/R15 results remain unchanged. Stage 2C does not claim to complete any outstanding R16 acceptance requirement.
