# R20 Database Migration — Read-only Structural Reconciliation

**Date:** 2026-11-22
**Status:** analysis only; not migration approval, final SQL, or cutover authorization

## Sources and limitations

- Authoritative root `README.md`; approved Core Standards v1.0, Detailed Standards v0.4.1, Decision Register D01–D14; `standard/WA_File_Development_and_Delivery_Process.md` v1.1.
- `docs/WA_Production_Database_Transition_Plan.md` (November 19 approved planning approach only) and Stage 6 Production Implementation Plan (version 2.0).
- `wappsHelioProductionDump.sql` and `wappsHelioTestDump.sql`, generated November 22, 2026 on MariaDB 12.3.4; source file hashes included below.
- This analysis compares exported snapshots. Exported row counts are counted from SQL value tuples, not approximate phpMyAdmin InnoDB display counts. No direct live database access, row-by-row migration, application validation, or DDL execution took place.

## Snapshot inventory

| Metric | Current production | Staging/test |
|---|---:|---:|
| SQL SHA-256 | `83dad8715ef1a74058e106f910578609fee641caa12121566ba0b03f78253893` | `cd5180b12b5e4b970b4f2f83bbf70ad4f8c239fd57e02694055a784b4923ce1d` |
| Tables | 66 | 72 |
| Inserted row tuples in export | 22,982 | 26,565 |
| Tables with exported INSERT rows | 64 | 69 |
| Foreign-key ADD CONSTRAINT statements | 63 | 62 |

## Specific differences needing review

- **`AdminSubscriptionGrantT` (Production-only):** Absent from staging.
- **`AdminTransferAuditT` (New in staging):** Staging-only table.
- **`AdminTransferStateT` (New in staging):** Staging-only table.
- **`LoginVerificationT` (Changed):** Staging-only columns: SecurityVersion.
- **`PasswordResetRateT` (New in staging):** Staging-only table.
- **`PasswordResetT` (New in staging):** Staging-only table.
- **`UserSecurityT` (New in staging):** Staging-only table.
- **`UsersT` (Changed):** Staging-only columns: IsAdministrator.
- **`WebRefreshTokenT` (New in staging):** Staging-only table.
- **`WebSessionT` (New in staging):** Staging-only table.

**Caution:** the `AdminSubscriptionGrantT` export has 12 production records; it cannot be silently omitted. The staging `UserSubscriptionT` table has the same column definitions, but that alone does not prove that the historical grant semantics were preserved. Do not move staging `WebSessionT`, refresh-token or test-identity data into production wholesale.

## All-table preliminary migration review matrix

| Table | Production rows | Staging rows | Classification | Proposed treatment (not approval) |
|---|---:|---:|---|---|
| `ActivitiesT` | 25 | 29 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `AdminSubscriptionGrantT` | 12 | — | Production-only | HOLD: reconcile existing records and business meaning; no implicit omission |
| `AdminTransferAuditT` | — | 14 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `AdminTransferStateT` | — | 1 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `AppT` | 8 | 8 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetCardT` | 3 | 3 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetDescriptionT` | 25 | 25 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetEstimateAllowanceT` | 10 | 10 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetInT` | 6 | 11 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetLeaseRentT` | 2 | 2 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetLoanT` | 2 | 2 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetMyInvestmentT` | 2 | 4 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetMyMoneyT` | 4 | 6 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetOutT` | 5 | 4 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetRecurrenceMonthlyDayT` | 17 | 19 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetRecurrenceT` | 32 | 36 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetRecurrenceWeeklyDayT` | 10 | 12 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `BudgetSubscriptionT` | 7 | 7 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `ConsentTextVersionsT` | 6 | 6 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `etfActivityT` | 32 | 32 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `etfCategoryT` | 6 | 6 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `etfSymbolT` | 107 | 107 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FamilyTreeT` | 6 | 6 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTContactEmailVerificationT` | 13 | 11 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTContactT` | 10 | 9 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTEventPersonT` | 122 | 122 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTEventT` | 122 | 122 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTFamilyTreeActivityT` | 919 | 933 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTFamilyTreePersonT` | 158 | 158 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTFamilyTreeUserT` | 19 | 20 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTImageT` | 136 | 136 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTNetworkT` | 5 | 5 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTNetworkVerificationT` | 23 | 24 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTNotificationT` | 320 | 336 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTParentT` | 200 | 200 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPartnerT` | 51 | 51 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPersonMergeT` | 3 | 3 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPersonPrivacyT` | 3 | 2 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPersonT` | 158 | 158 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPetT` | 1 | 0 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPrivacyAttemptT` | 21 | 34 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPrivacyRequestT` | 25 | 16 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTPrivacyUnlockT` | 0 | 1 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTRecordArchiveT` | 0 | 0 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTSiblingT` | 7 | 7 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `FTTreeMergeT` | 4 | 4 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `InterestEarnedT` | 38 | 40 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `LoginVerificationT` | 542 | 668 | Changed | Review schema/keys and adapt production data; verify constraints and existing row values |
| `NotificationConsentHistoryT` | 39 | 55 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `NotificationHistoryT` | 265 | 253 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `NotificationPreferencesT` | 17 | 18 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `NotificationSuppressionT` | 5 | 6 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `PasswordResetRateT` | — | 0 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `PasswordResetT` | — | 3 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `PromoCodeT` | 2 | 2 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `PromoRedemptionT` | 4 | 3 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `SubscriptionPlanT` | 4 | 4 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `SystemSettingsT` | 4 | 4 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `TNNADeviceT` | 3 | 6 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `TNNARefreshTokenT` | 29 | 41 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `TNNAUserT` | 3 | 4 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `TNNAVersionT` | 1 | 1 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `TrackUsageT` | 12742 | 14635 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `UserAgreementHistoryT` | 22 | 24 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `UserSecurityT` | — | 18 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `UserSequenceT` | 39 | 55 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `UsersT` | 17 | 18 | Changed | Review schema/keys and adapt production data; verify constraints and existing row values |
| `UserSubscriptionT` | 15 | 18 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `UserUsageT` | 5436 | 6678 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `WebRefreshTokenT` | — | 45 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `WebSessionT` | — | 142 | New in staging | Create target structure; initialize only with separately approved values and genuine production-derived relationships where applicable |
| `WeightActivitiesT` | 313 | 321 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |
| `WeightsT` | 795 | 801 | Structurally same | Copy actual production data into approved target schema; verify counts, keys, and references |

## Required reconciliation before candidate build

1. Confirm whether these November 22 exports remain the latest baselines when execution is contemplated; refresh only if outdated.
2. Explicitly map historical `AdminSubscriptionGrantT` records into the approved subscription model, including grant permissions, audit retention, current/expired status, and whether any original `UserSubscriptionT` rows already represent the same grants. Owner approval is required for disposition.
3. Define the `UsersT.IsAdministrator` initialization from the **approved central two-gate administrator policy**; no blanket flag, username-only inference, or copying staging users.
4. Define `UserSecurityT` creation and `SecurityVersion` initialization for each genuine production account and any existing verification records; choose a controlled handling policy for legacy session/revocation compatibility and TNNA continuity.
5. Initialize security tables (`WebSessionT`, `WebRefreshTokenT`, `PasswordResetT`, `PasswordResetRateT`, `AdminTransferStateT`, `AdminTransferAuditT`) using an expressly reviewed empty/seed/retention policy; never transplant staging test credentials or tokens.
6. Check foreign-key references, defaults, unique/primary indexes, AUTO_INCREMENT and generated identifiers as well as column definitions before final SQL authoring.
7. Preserve actual production data and external resource references (Cloudflare R2 etc.) without copying test rows; rehearse against a new isolated target with approved schema and reviewed data conversions.
8. Define exact compatible application/candidate sequencing, final write freeze or delta reconciliation, rollback triggers and owner/operator actions. The already successful 66-table restore proves original-backup recoverability, not a 72-table migration or combined rollback.
9. Independent security and design review, including deferred One Tree critical/high findings, must be dispositioned before a release decision; do not reopen One Tree development just to perform this inventory.

## Explicit boundaries

**Not performed:** database creation/import, DDL/DML, production/staging config changes, branch modification, schema migration execution, release authorization, migration acceptance.

**Suggested next discrete work:** read-only review of subscription-grant consumers and historical grant rows at a non-sensitive structural level, then prepare precise table mapping for owner approval. No new database queries unless dump evidence proves insufficient or outdated.
