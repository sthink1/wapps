# Wonderful Apps — Account Deletion TODO Addendum

Date: 2026-11-02
Status: BACKLOG — DESIGN DECISIONS REQUIRED; NOT APPROVED FOR IMPLEMENTATION
Authoritative design: `docs/WA_Account_Deletion_SOP_Design_2026-11-02.md`
Source exercise: Stage 6 Group 5G deletion of synthetic `charter` from HelioHost `wapps_test` (UserID 62 at the time).

## Add to project TODO / enhancement backlog

- [ ] **WA-ACCOUNT-DELETE — User-requested and administrator-initiated account deletion.** Implement *one* common server-side account-deletion service, with separate self-service and administrator authorization/confirmation paths. This is a future enhancement, **not** part of the current Stage 6 Group 5G authentication acceptance work. No endpoint or general-purpose destructive SQL until policies below are approved.
- [ ] **Policy: consent and notification retention.** Decide when to delete, redact or retain `NotificationConsentHistoryT`, `NotificationHistoryT`, related email/phone/text fields, and external logs/backups. Current schema's `ON DELETE SET NULL` retains history. The four consent rows for synthetic `charter` were explicitly deleted; do not generalize this to real users without legal/privacy review.
- [ ] **Policy: shared Family Tree data.** Resolve ownership, participant removal, attribution, transfer/reassignment and reference cleanup. `FTSiblingT.CreatedByUserID` is `RESTRICT`; other Family Tree tables contain user-related columns without direct user foreign keys. Do not delete other users' shared data or break referential integrity.
- [ ] **Policy: subscription and financial records.** Define active subscriptions, promotions, grants, refunds, transaction history, tax/accounting retention, and what happens when a user is the administrator/actor on someone else's records.
- [ ] **Policy: deletion experience and authority.** Decide immediate removal vs grace period, step-up verification, notices, administrative authority/approval, last-admin protections, and minimum privacy-preserving audit trail.
- [ ] **Implementation design after policy approval.** Use immutable UserID, recheck identity/ownership, transaction on one connection with explicit COMMIT/ROLLBACK, controlled dependent cleanup, real credential invalidation, post-commit verification, and bounded error handling; no broad SQL, TRUNCATE or disabled FK checks.
- [ ] **Tests and review.** Include owned and shared Family Tree cases, noncascading histories, active web/TNNA sessions, account-not-found, unauthorized admin, interrupted transaction, retry, backups, and audit evidence. Require independent security/design review before production.

## Stage 6 status note

Group 5G used a manually verified one-time deletion of the synthetic test account `charter` from `wapps_test`. The account was absent afterward, and all 14 previously identified tables containing UserID 62 returned zero. This establishes the outcome for that test identity **only**; it does not approve generic account deletion or cover historical emails, retained logs and backups. It does not block re-registering `charter` for Stage 6 Group 5G. Production, `main`, and production Render remain out of scope.
