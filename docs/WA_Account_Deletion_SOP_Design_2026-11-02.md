# Wonderful Apps — Account Deletion Standard Operating Procedure (Design)

**Date:** 2026-11-02  
**Status:** Proposed design, **not installed or approved for production**  
**Source:** `My Drive/wonderfulApp/wappsTtest11226Dump.sql` (MariaDB 12.3.3, `wapps_test`); Stage 6 Group 5G live cleanup of the disposable `charter` account; current TNNA route source.

## Scope and principles

Create one centralized **AccountDeletionService** with two entry paths: (1) verified user self-deletion and (2) authorized administrator-initiated deletion. Both use identical core validation, relationship handling and audit standards; only authorization, reason and notification rules differ. This is a **future implementation proposal**, not a claim that such code exists.

Never delete by username or email alone. Resolve account to an immutable `UserID`, verify its identity in the database immediately before deletion and ensure the target is not protected. Never allow a user, admin or routine to delete another account simply by editing a request parameter. Avoid `SET FOREIGN_KEY_CHECKS=0`, `TRUNCATE`, broad updates, or reliance on cascade as a substitute for an ownership/retention review.

## Lessons learned from charter

- Before deletion the 59-table user-reference inventory found 423 matching rows in 14 tables, including 231 `TrackUsageT`, 80 `LoginVerificationT`, 74 `WebSessionT`, 18 `PasswordResetT`, and 4 `NotificationConsentHistoryT` records.
- Declared `ON DELETE CASCADE` relationships removed most associated rows after deleting the parent account.
- `NotificationConsentHistoryT.UserID` and `NotificationHistoryT.UserID` use `ON DELETE SET NULL`; a normal parent deletion preserves history with the user reference cleared. For `charter`, 4 consent-history records were explicitly deleted, consistent with a synthetic test identity. **Do not generalize this deletion to real accounts without an approved retention/privacy policy.**
- `FTSiblingT.CreatedByUserID` has a restricting foreign key; nonzero references could block deletion. Other Family Tree tables have user ID columns without direct `UsersT` constraints and may contain shared or cross-user data.
- MariaDB's server had autocommit=1, but `START TRANSACTION` required an explicit `COMMIT`; running a no-COMMIT script in phpMyAdmin did **not** result in persisted deletion. Hence all application deletion operations need a single connection, explicit transaction, rollback handler, and post-commit verification.
- After committing, `UsersT` no longer returned `charter` and all 14 identified tables returned zero for the old UserID. This verified *identified user-ID references*, not email-address copies, audit logs outside the database, or historical emails.

## Authorization and experience

### User self-deletion

1. Require an authenticated web session, recent step-up verification (password and/or one-time email challenge), CSRF/origin protection, and explicit confirmation that account access and eligible personal data will be removed. Prevent deletion from merely possessing an old remembered refresh token.
2. Explain effects on Family Tree participation, subscriptions and retained transactional/consent records before confirmation. Account closure must not silently destroy shared data belonging to other users.
3. Apply a policy decision on immediate vs delayed closure and any recovery/grace window; **not yet decided**. Confirm any notice is sent outside the DB transaction and avoid logging secret tokens.

### Administrator deletion

1. Use dedicated server-side administrative authorization, not client-displayed UI state. A username-only admin check is insufficient as a long-term role-management design; exact future RBAC design is **proposed**.
2. Require a reason, confirmation of the actual immutable UserID and account identity, and an audit record of actor, target, time, result and legal/operational basis. Require elevated confirmation for accounts that have billing or shared-data relationships.
3. Define rules for preventing self-deletion by an administrator, the last administrator's deletion, and deletion of other protected accounts; all **pending design decisions**.

## Data classification and decision matrix

| Data class | Existing schema behavior / concern | Proposed final policy |
|---|---|---|
| UsersT, UserSecurityT, LoginVerificationT, PasswordResetT, WebSessionT | Cascading user-related references verified | Delete after approval; ensure no active authentication remains |
| TNNAUserT, TNNADeviceT, TNNARefreshTokenT | Cascading user relationships verified | Delete user-owned devices and refresh credentials; invalidate existing access JWTs via account/security-version checks |
| TrackUsageT, UserUsageT, app-owned budget/ETF/activity rows | User-related cascading relationships, check exceptions before every deletion | Delete user-owned records unless retention overrides |
| NotificationConsentHistoryT, NotificationHistoryT | `SET NULL`, and email/phone or notification text can survive independently | Retain/redact/delete only according to an approved retention/legal policy; never claim full erasure just because `UserID` is null |
| FTSiblingT | `CreatedByUserID` prevents deletion when referenced | Resolve shared ownership or reassignment through a reviewed workflow; **do not silently delete sibling relationships** |
| FTFamilyTreeUserT, FTFamilyTreeActivityT, FTPrivacyAttemptT, FTPrivacyUnlockT | User-related columns may lack FK to UsersT | Use explicit bounded cleanup/ownership decisions; account for other user references such as `AddedByUserID` and `TargetCreatedByUserID` |
| AdminSubscriptionGrantT and related billing/promotion records | Some columns refer to user as *subject* and others as *actor* | Preserve operational history where needed; do not remove grants for unrelated users simply because their admin actor is deleted |
| External email provider, server logs, backups, monitoring | Outside cascade scope | Define retention, export, and backup-expiration practices and describe residual copies honestly |

## Transaction implementation contract

- Run only through an explicitly authorized backend service on a **single acquired database connection**.
- Begin transaction, `SELECT ... FOR UPDATE` target row by UserID; assert precisely one row and stable identity; refuse protected targets.
- Discover material references and apply approved policies in dependency order. Abort if shared-data, restrict-FK or undeclared user-reference cases are unresolved.
- Remove applicable direct-history rows **only when policy authorizes that specific record class**; delete the parent `UsersT` row; assert exactly one affected row. Ensure all writes and ownership decisions are covered by the same transaction.
- Commit once; on any error, roll back on that same connection and release it. Never report success until commit succeeds.
- After commit, run bounded read-only checks: target absent, tokens/sessions revoked or absent, no unexpected residual user references, and account notification/audit handled securely. A post-commit verification failure is a critical incident to investigate, **not** a reason to retry broad deletion.
- Avoid attempting remote mail delivery inside the DB transaction; consider an outbox or retryable post-commit notification mechanism.

## Verification and evidence

- Capture a minimal audit event: request type, actor internal ID (or authenticated self), target internal ID, approval/consent, timestamp, counts by data class, retention exceptions, transaction status and verification status. Avoid copying passwords, reset links, tokens, email bodies or excessive personal information.
- Verify all potentially user-related columns (including alternate created/added-by references), not just rows where `UserID` equals target ID.
- Require a regression suite: standard user, active web refresh session, active TNNA session, reset link, pending login verification, no user record, mixed-ownership Family Tree records, restricted FK, nullified notification records, forced database failure/rollback, concurrent refresh/deletion, unauthorized admin request and retry/idempotency.
- Recheck all database names, table names, keys and constraints against the **current** deployed schema before production coding. The November 2 snapshot is not proof of future production equivalence.

## Rollout and relationship to Stage 6

This is a **separate enhancement proposal**, not a prerequisite for continuing the disposable Group 5G test once the synthetic account's cleanup has passed. Keep `reviseLogIn`, `main`, production Render and production MySQL unchanged until separately authorized. Conduct an independent design/security review before introducing a deletion endpoint into production. A production migration to MariaDB is a separate controlled project after reliability testing, using a fresh MySQL production dump and authorized Render connection switch.

## Decisions required before implementation

1. Self-service account deletion: immediate vs grace period, step-up method and reactivation policy.
2. Audit/consent/notification history retention period, redaction of email/phone/text, legal basis and backup policies.
3. Family Tree shared-content ownership and transfer semantics.
4. Subscription/refund/financial record handling.
5. Administrator authorization and whether deletion needs dual approval.

Until these are decided, do **not** create a general-purpose production deletion SQL script or a public account-deletion endpoint.
