# Wonderful Apps — Consolidated Subscription Administration: INSTALL and TEST

## Authoritative sources and preservation

Checked the owner-approved November 12 Core Standards v1.0, Detailed Technical Standards v0.4.1, decision register, `README.md`, `CLAUDE.md`, and `TechSummary.md`. The source originals are the authoritative Google Drive files. The previous Stage 2E package was NOT installed per owner. Stage 2C and 2D proposals are included here in full; this ZIP is the single intended source package.

**Do not install the old Stage 2C/2D/2E ZIPs afterward.** User installs all files locally and copies to authoritative Drive; no direct assistant changes.

## Critical installation order — preserve existing subscriptions

1. Work ONLY against the isolated `wapps_test` staging/test database. **Never use production credentials.** Obtain a verified, independently restorable full SQL backup and keep it outside the WA project. Stop if this is unavailable.
2. Copy **only** `tools/wa-subscription-one-time-migration.js` into the test WA project first (other replacement files must remain inactive until migration). In a test-only WA checkout using the already installed `mysql2` module, set the actual `wapps_test` connection variables in the existing secure method; never copy or disclose credentials. Run **`node tools/wa-subscription-one-time-migration.js --check`**. It is read-only and demands the exact 18-user, 16-base, 13-grant, 3-redemption snapshot. Any mismatch: STOP, do not force it.
3. Only after explicitly choosing to migrate that **test database**, run **`node tools/wa-subscription-one-time-migration.js --apply --confirm-staging-wapps-test --backup-file=C:\CBS_Backups\wa-subscription-before.json`** (change the backup path to a real *absolute existing folder outside the WA repository*). This performs nine UPDATEs and two INSERTs in one verified transaction; it does NOT drop or modify `AdminSubscriptionGrantT`. The backup JSON is created exclusively before commit; it is NOT a replacement for the full SQL backup.
4. Confirm **`node tools/wa-subscription-one-time-migration.js --check`** returns `MIGRATED` and base count 18. Do not proceed if it fails.
5. Install the complete new `services/subscriptionService.js`, `routes/subscriptions.js` and `httpdocs/SubControl.html` (after preserving originals as `_COPY`) along with the test and documentation files in their exact directories. Avoid restarting the WA server with the new service until the migration is complete. Copy installed files to Google Drive.
6. Run the listed offline tests, then start the local test-only WA app with known environment controls. Verify admin access, 18 users, promo redemption history, preserved admin transfer, and several access paths. No production deployment is authorized.

**Why the order matters:** This update disables the old grant overlay. Activating it before migration would remove the old grant entitlement for users whose underlying trial has expired.

## Paths and classifications

- REPLACE: `services/subscriptionService.js`, `routes/subscriptions.js`, `httpdocs/SubControl.html`.
- NEW: `tools/wa-subscription-one-time-migration.js`, `tests/stage2c.development-entitlement.offline.test.js`, `tests/stage2d.direct-subscription.offline.test.js`, `tests/stage2e.subcontrol.offline.test.js`, `tests/wa-subscription-final.offline.test.js`, `tests/wa-subscription-migration.offline.test.js`.
- NEW: `docs/INSTALL_Subscription_Administration.md`, `docs/WA_Subscription_Migration_Matrix_2026-11-18.md`, `change/*.diff`, `change/*.verification.md`, `change/SHA256.txt`, `change/offline-tests.txt`.
- No `.original` files; the owner maintains `_COPY` references at functional paths.

## Run offline tests

From the WA root after installing the complete package:

```powershell
node --test tests/stage2c.development-entitlement.offline.test.js tests/stage2d.direct-subscription.offline.test.js tests/stage2e.subcontrol.offline.test.js tests/wa-subscription-final.offline.test.js tests/wa-subscription-migration.offline.test.js
```

Do not use `npm test` (the repository's package script is a placeholder). The one-time migration is **never auto-executed** on installation or application startup; explicit flags and an exact DB identity are mandatory. Do not run the script on production.

## Acceptance / rollback

Check `change/SHA256.txt` against each installed file. Test both active and inactive development trials, production-mode cutoff, `ADMIN_GRANT` until 2200, normal promo expiration, admin direct update and stale-save rejection, 401/403, and original administrator-management/promo flows. Record browser and staging results separately.

**Source rollback:** Stop the test server, restore the owner's saved `_COPY` files at the three operational paths, and verify their original hashes. If the database migration was committed, these original files can continue reading the retained legacy grant table; however, new base rows and converted access types remain and must be reconciled against the independent SQL backup. **Database rollback is not performed automatically**. Restore from a validated backup only with a separately authorized DB recovery plan, not by casually rerunning the migration or deleting subscriptions. Preserve promo redemption history and all grant records.

No Google Drive, GitHub, staging, production or DB changes were performed by the assistant. Final production release still requires complete acceptance and independent review.
