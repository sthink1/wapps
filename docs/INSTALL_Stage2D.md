# Wonderful Apps — Stage 2D installation manifest

**Status: PROPOSAL; owner review/approval required before manual installation.**

## Exact WA-relative destination paths

| ZIP path | Destination in WA | Action |
|---|---|---|
| `services/subscriptionService.js` | `services/subscriptionService.js` | REPLACE existing source |
| `routes/subscriptions.js` | `routes/subscriptions.js` | REPLACE existing source |
| `tests/stage2d.direct-subscription.offline.test.js` | same path | NEW test |
| `tests/stage2c.development-entitlement.offline.test.js` | same path | EXISTING test reference; do NOT replace if already installed and identical; compare hash |
| `change/subscriptionService.js.original` | `change/` | NEW immutable original reference copy |
| `change/subscriptions.js.original` | `change/` | NEW immutable original reference copy |
| `change/*.diff` and `change/*.verification.md` | `change/` | NEW verification evidence |
| `change/offline-test-results.txt` | same path | NEW isolated test evidence |
| `change/SHA256.txt` | same path | NEW checksum evidence |
| `docs/INSTALL_Stage2D.md` | same path | NEW installation/rollback instructions |

**Do not place source files or miscellaneous artifacts in the WA project root.**

## Installation steps (owner only)

1. Do not deploy to staging or production, or invoke the new mutation, merely because tests passed.
2. Confirm baseline `services/subscriptionService.js` and `routes/subscriptions.js` SHA-256 hashes against `change/SHA256.txt`. Stop on any mismatch and reconcile changes. Stage 2C must already be included in subscriptionService baseline.
3. Back up both existing source files and record original checksums.
4. Install the full replacements in their exact WA-relative directories. Add the one new Stage 2D test. Do not overwrite a differing Stage 2C test.
5. Verify delivered checksums, then run from the WA root: `node --check services/subscriptionService.js`, `node --check routes/subscriptions.js`, `node --test tests/stage2d.direct-subscription.offline.test.js tests/stage2c.development-entitlement.offline.test.js`.
6. Copy installed files to the authoritative Google Drive WA folder according to the established owner workflow; assistant remains read-only.
7. Review actual staging integration separately before enabling any live direct subscription writes. The legacy grant overlay remains in effect.

## API contract (for Stage 2E UI design)

- GET `/subscriptions/admin/user/:userId/subscription` returns `user`, `base` (underlying snapshot or null), `effective`, `plans`, and warning about legacy grants.
- PUT same path requires a JSON body with `planId` (positive integer), `accessType` (`ADMIN_GRANT` or `DEVELOPMENT_TRIAL`), `endDate` (`YYYY-MM-DD`), `active` (boolean), and `expected` set to the last GET's `base` snapshot (null for an absent base).
- Returns 409 if the stored subscription differs from the snapshot; client must reload, never retry a mutation automatically. The response deliberately does not claim effective access is updated, because separate grants can still override.
- PROMO access is created by the existing promo workflow; PAID subscriptions are not writable through this route without a billing-aware design.
- This is a backend-only stage: no SubControl UI changes, schema or data migration, grant-removal, or production deployment.

## Rollback

Before any deployment, restore both backed-up original source files and confirm their original SHA-256 checksums. Do not remove database records as a rollback step. This stage introduces no schema changes. If a direct-write request has already occurred, restoration of source alone does not undo that database transaction; any record-level reversal requires separately authorized, audited SQL and a current backup.

## Acceptance boundary

Offline 25/25 tests pass on package files only. These results do **not** authorize installation, hosted writes, grant cleanup, release, or completion of R16. Any change in authoritative originals requires a fresh full-file comparison and regenerated package.
