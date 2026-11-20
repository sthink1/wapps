# WA Subscription migration identity correction — November 19, 2026

## Authority and scope

- Baseline: `tools/wa-subscription-one-time-migration.js` in `WA_Subscription_Administration_FINAL_2026-11-18.zip`.
- Source of identity truth: November 18 `wappsHelioTestDump.sql`, `UsersT` insert, user 57.
- Corrected destination: `tools/wa-subscription-one-time-migration.js` (replace existing).
- Existing owner's `_COPY` backup serves as rollback; **no `.original` file is included**.
- **Only code difference:** expected UserID 57 username changed from `mglavinnj` to `mgalvinnj`.
- Formatting-only changes: none.
- Other code, SQL, migrations, test logic, counts and authorization controls: unchanged.

## SHA-256

- Baseline: `1d55db217140e2e119fd46cc6762b1b12848c903585da13c40d78ea764a07f0c`
- Corrected final: `6a0dbefa16b86826644127648a9e3c50b201bb3adbab50a29be0f0e465790129`

## Validation performed in isolated workspace

- Cross-check against all 18 UsersT identities in SQL dump: **18/18 match**.
- Cross-check expected source rows against 16 UserSubscriptionT records: **16/16 match**.
- `node --check tools/wa-subscription-one-time-migration.js`: **PASS**.
- Isolated Node.js mock migration and independent identity-fixture tests: **6/6 PASS**.
- No live database / project / Google Drive mutations performed.

## Risk and rollback

- `--check` remains read-only to DB (uses transaction + SELECT ... FOR UPDATE and rolls back).
- Migration remains disabled unless `--apply` with additional staging and external-backup arguments is explicitly supplied.
- In case of failure, restore user's `_COPY` utility and investigate before applying; do not weaken guards.
