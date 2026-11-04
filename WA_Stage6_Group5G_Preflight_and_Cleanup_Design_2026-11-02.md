# Wonderful Apps — Stage 6 Group 5G, preflight and cleanup design
Date: November 2, 2026
Branch: `reviseLogIn`; last user-confirmed commit `66c7b31`
Status: READ-ONLY DESIGN. No live account created or deleted. No approval for production or main.

## Authoritative inputs
- `My Drive/wonderfulApp/wappsTtest11226Dump.sql` (fresh HelioHost test dump)
- Current Google Drive `routes/users.js`, `routes/tnna.js`, prior Stage 6 test records
- User decision: MariaDB reliability testing first; later separately authorized fresh MySQL production export/import and Render production environment transition.

## Specific schema findings
- `UsersT` key is `UserID`; username and email unique.
- Browser login/register writes include `UsersT`, `NotificationPreferencesT`, `NotificationConsentHistoryT`, `UserAgreementHistoryT`, `UserSecurityT`, `LoginVerificationT`, `WebSessionT`, `WebRefreshTokenT`; subscription entitlement may create `UserSubscriptionT`.
- Password reset requests write `PasswordResetRateT` (shared hashed counters, keyed by `KeyHash`, no UserID) and `PasswordResetT` for recognized users. Do not delete general current-hour limiter rows as part of account cleanup.
- `NotificationConsentHistoryT.UserID` and `NotificationHistoryT.UserID` have `ON DELETE SET NULL`, so deleting a user DOES NOT erase their notification-history rows. Preserve audit history by default; an account test cannot truthfully claim no surviving rows if it generates such history.
- `FTSiblingT.CreatedByUserID` has an FK to `UsersT` without `ON DELETE CASCADE` (effectively restrictive); test should not exercise Family Tree. Other Family Tree tables contain UserID-like fields with no direct declared FK; use read-only checks before deleting a user.
- `UserUsageT.UserID` has a declared `ON DELETE CASCADE`, contrary to some earlier summaries.
- TNNA `verify-code` additionally writes `TNNAUserT`, `NotificationConsentHistoryT`, `TNNADeviceT`, `TNNARefreshTokenT`; keep TNNA enrollment out of initial web-only test.

## Important limitation
This SQL dump is a point-in-time schema and data snapshot, NOT a live identity check. The accompanying SQL performs only metadata reads on the currently selected database; it validates that the database is `wapps_test` but must be inspected and stopped if another name is returned. Exact test account creation, direct SQL deletes, and identity-derived cleanup are **NOT authorized by this document**.

## Recommended narrowly bounded acceptance sequence
1. Run the attached read-only preflight SQL in the explicitly selected HelioHost `wapps_test` database. Examine DB name, server version, table engines, foreign-key delete rules and potential user-id columns. No data-row exports required.
2. Treat consent/notification histories as immutable audit records unless project retention policy authorizes selective removal. If strict zero-footprint cleanup is required, do not use normal registration, because it creates consent audit history; instead consider a separate disposable complete-schema database after additional review.
3. In staging only, create a UNIQUE controlled-inbox disposable identity via registration after separate approval. No shared account credentials; no production access. Record the created UserID and test-created row IDs locally, not tokens/passwords in chat.
4. Execute the minimum web-only password-reset lifecycle against that identity: remembered session, reset request, reset success, rejected consumed link, old/new login behavior, rejected prior access/refresh. Use browser Network response statuses and sanitized state readback. Never send sensitive URLs/tokens to chat.
5. Before deletion, inspect all direct and indirect dependent rows and non-FK user references; ensure unexpected dependencies are zero. If there is a mismatch, STOP; do not disable FK checks. Document audit-history rows that must be retained.
6. Prepare a separate exact-ID cleanup SQL **only after** account IDs and read-only dependency counts are known; give the user a reviewable transaction with row-count assertions and post-delete verification. Do not issue global deletes or truncate tables.
7. Independently review full TNNA HTTP compatibility, logging/response leakage, proxy header provenance, and production migration/rollback gates before release.

## No-change record
Only a read-only SQL preflight file and documentation were created. Nothing was run against a live database; no app source, Git branch, Render environment or production resource was modified.
