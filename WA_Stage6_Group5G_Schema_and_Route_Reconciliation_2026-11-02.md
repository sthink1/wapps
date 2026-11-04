# Wonderful Apps — Stage 6 Group 5G schema and route reconciliation

Date: 2026-11-02. **Read-only review; no account creation or SQL changes authorized.**

## Decision and environment
MariaDB is the intended future production backend **only after reliability and acceptance testing**. The later production migration will take a fresh dump from the then-current MySQL production database, import it to MariaDB, validate it, and deliberately switch Render environment settings. This is a separate decision from the current Stage 6 test and is **not approved for execution here**. Scope now: `reviseLogIn`, hosted `wapps-stage6-test`, `wapps_test` MariaDB. Last user-confirmed Git checkpoint: `66c7b31`.

## Sources actually examined
- `My Drive/wonderfulApp/wappsTtest11226Dump.sql`, created by phpMyAdmin Nov 2, 2026 14:39 per header, 71 CREATE TABLE statements; MariaDB 12.3.3-log per header. A dump is a schema/data snapshot, not a live permission/grant or runtime identity check.
- `routes/users.js`, `routes/tnna.js` from the same Google Drive project folder.
- `WA_Stage6_Group5G_Disposable_Account_Test_Plan_2026-11-02.md`.

## Actual route-created records
Registration (`POST /users/register`) creates UsersT; NotificationPreferencesT; NotificationConsentHistoryT (marketing email and SMS decisions via logConsent); UserAgreementHistoryT (terms and privacy); UserSecurityT. Requires active configured consent text versions. It **does not automatically log the registrant in**.

Web login (`POST /users/login`) creates LoginVerificationT and sends a real verification email to the controlled inbox. `POST /users/verify-code` consumes challenge and creates WebSessionT, and (if remembered) WebRefreshTokenT; trial-entitlement provisioning may touch subscription tables after session issuance.

Forgot-password writes PasswordResetRateT counters and, for an existing account, PasswordResetT; it sends a real reset email after commit. Reset-password updates UsersT hash, sets PasswordResetT used/revoked fields, calls account-wide WebSessionT/TNNARefreshTokenT revocation and security-version increment. The limiter is **not user-owned**: deleting a user will not delete its HMAC counter rows.

TNNA `/verify-code` consumes LoginVerificationT; upserts TNNAUserT and TNNADeviceT; inserts TNNARefreshTokenT and calls logConsent (NotificationConsentHistoryT). TNNA `/refresh` updates/rotates refresh-token records. It requires TNNAVersionT configured; do not enroll a device unless covered by a separate scoped test design.

## Key relationship and cleanup findings
- Authentication tables UserSecurityT, LoginVerificationT, PasswordResetT, WebSessionT, TNNAUserT, TNNADeviceT, TNNARefreshTokenT have user-linked CASCADE deletes. WebRefreshTokenT cascades from WebSessionT.
- NotificationConsentHistoryT and NotificationHistoryT reference UsersT with **ON DELETE SET NULL**, hence can remain after deletion with email/phone metadata. They require separate test-owned-ID assessment and cleanup **before user deletion**, where permitted and appropriate.
- PasswordResetRateT has no UserID FK; its HMAC keys are shared counters by email/IP/global per hour. **Never delete an entire current-hour global/IP bucket** as cleanup. Prefer allow controlled expiration and normal scheduled cleanup unless exact ownership can be established without affecting other requests.
- UserUsageT and TrackUsageT **do have declared CASCADE foreign keys to UsersT** in this Nov 2 dump. An earlier statement listing UserUsageT among tables without an FK was incorrect.
- Some Family Tree user-like columns have no declared FK; a new test identity must not use Family Tree or other app features. FTSiblingT.CreatedByUserID has a restricting reference to UsersT, so any such rows must be checked before deletion.
- User deletion is not assumed to constitute comprehensive deletion. `SET FOREIGN_KEY_CHECKS=0` and TRUNCATE are prohibited.

## Read-only reconciliation before live test
1. Verify the live target host/database/database user/TLS and staging service variables, then compare actual live schema constraints to this dump. Dump header alone cannot prove what Render is connected to.
2. Confirm controlled test mailbox, permission to use registration, and whether subscription trial writes occur.
3. After user creation, capture a newly generated UserID and source-generated IDs; ensure no preexisting same email/user before testing. Record IDs privately, not in chat.
4. Before cleanup, query exact test-owned row counts and IDs across UsersT, LoginVerificationT, WebSessionT, WebRefreshTokenT, PasswordResetT, UserSecurityT, TNNAUserT, TNNADeviceT, TNNARefreshTokenT, NotificationConsentHistoryT, NotificationHistoryT, NotificationPreferencesT, UserAgreementHistoryT, UserSubscriptionT, UserUsageT, TrackUsageT, and all other tables which actually acquired test-owned rows. Examine referencing users and SET NULL rows.
5. Construct and review a **separate, ID-scoped** cleanup script after observing test-owned record IDs. Do not run unverified destructive SQL; preserve audit/consent records if required by policy and document retained artifacts explicitly.
6. Password reset end-to-end and old credential revocation must be proved with controlled staged HTTP requests, not inferred solely from SQL or simulation; TNNA full-HTTP validation is a separate acceptance gate.

## Current disposition
Schema and route creation paths: **reconciled from snapshot/source**. Guaranteed safe cleanup: **NOT YET ESTABLISHED**, because live user IDs, actual side effects, policy on retaining consent/notification history, and exact HMAC bucket ownership cannot be known before executing the bounded test. No SQL write commands or live tests are included. Independent design engineer/security review remains mandatory before any merge or production decision.
