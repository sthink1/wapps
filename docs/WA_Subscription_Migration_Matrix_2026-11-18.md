# Stage 2F — Per-user before/after review matrix

Source: refreshed wappsHelioTestDump.sql, exported November 18, 2026 at 19:35 (dump header).
User intent: 18-user inventory and approved development-trial Active flag policy.
No database operations were performed.

| User ID | Username | Current base (dump) | Active overlay grant (dump) | Proposed underlying subscription | Operation |
|---:|---|---|---|---|---|
| 1 | sthink | PROMO | Platinum | 2026-12-31 | Active=1 | RowID=2 | Diamond to 2200-01-01 (GrantID=13) | ADMIN_GRANT | Diamond | 2200-01-01 | Active=1 | UPDATE |
| 40 | eg | ADMIN_GRANT | Diamond | 2030-12-31 | Active=1 | RowID=3 | Diamond to 2030-12-31 (GrantID=2) | ADMIN_GRANT | Diamond | 2030-12-31 | Active=1 | RowID=3 | PRESERVE — NO DML |
| 42 | egalvin | PROMO | Platinum | 2026-12-31 | Active=1 | RowID=4 | None | PROMO | Platinum | 2026-12-31 | Active=1 | RowID=4 | PRESERVE — NO DML |
| 43 | malcolm4 | NONE | None | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | INSERT |
| 44 | laurel | ADMIN_GRANT | Platinum | 2030-12-31 | Active=1 | RowID=7 | Platinum to 2200-01-01 (GrantID=1) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 45 | sthink6386 | DEVELOPMENT_TRIAL | Platinum | 2026-10-19 | Active=1 | RowID=6 | None | DEVELOPMENT_TRIAL | Platinum | Until development ends (stored EndDate unchanged) | Active=1 | RULE ONLY — NO DML |
| 48 | mpgoutlook | DEVELOPMENT_TRIAL | Platinum | 2026-10-16 | Active=1 | RowID=5 | None | DEVELOPMENT_TRIAL | Platinum | Until development ends (stored EndDate unchanged) | Active=1 | RULE ONLY — NO DML |
| 49 | cotravel | DEVELOPMENT_TRIAL | Platinum | 2026-10-21 | Active=1 | RowID=8 | Platinum to 2200-01-01 (GrantID=3) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 51 | mmintonec | DEVELOPMENT_TRIAL | Platinum | 2026-10-22 | Active=1 | RowID=9 | Platinum to 2200-01-01 (GrantID=4) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 52 | janet | NONE | Platinum to 2200-01-01 (GrantID=5) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | INSERT |
| 53 | jlm4212 | DEVELOPMENT_TRIAL | Platinum | 2026-10-26 | Active=1 | RowID=10 | Platinum to 2200-01-01 (GrantID=6) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 54 | b0ulderagalvin | DEVELOPMENT_TRIAL | Platinum | 2026-10-29 | Active=1 | RowID=11 | Platinum to 2200-01-01 (GrantID=8) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 55 | dswim | DEVELOPMENT_TRIAL | Platinum | 2026-10-29 | Active=1 | RowID=12 | None | DEVELOPMENT_TRIAL | Platinum | Until development ends (stored EndDate unchanged) | Active=1 | RULE ONLY — NO DML |
| 56 | mpgiii | DEVELOPMENT_TRIAL | Platinum | 2026-11-01 | Active=1 | RowID=13 | Platinum to 2200-01-01 (GrantID=9) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 57 | mglavinnj | DEVELOPMENT_TRIAL | Platinum | 2026-11-03 | Active=1 | RowID=14 | Platinum to 2200-01-01 (GrantID=10) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 58 | kelsey | DEVELOPMENT_TRIAL | Platinum | 2026-11-09 | Active=1 | RowID=15 | Platinum to 2200-01-01 (GrantID=11) | ADMIN_GRANT | Platinum | 2200-01-01 | Active=1 | UPDATE |
| 63 | glaw | DEVELOPMENT_TRIAL | Platinum | 2026-11-17 | Active=1 | RowID=20 | None | DEVELOPMENT_TRIAL | Platinum | Until development ends (stored EndDate unchanged) | Active=1 | RULE ONLY — NO DML |
| 64 | charter | DEVELOPMENT_TRIAL | Platinum | 2026-12-02 | Active=1 | RowID=21 | None | DEVELOPMENT_TRIAL | Platinum | Until development ends (stored EndDate unchanged) | Active=1 | RULE ONLY — NO DML |

## Critical distinctions

- User 1: PROMO/Platinum underlying row becomes ADMIN_GRANT/Diamond; historical PromoRedemptionT rows remain unchanged.
- User 44: only extends EndDate from 2030-12-31 to 2200-01-01.
- Users 43 and 52: INSERT new underlying rows (no existing UserSubscriptionT row in dump).
- Users 49, 51, 53, 54, 56, 57, 58: convert expired DEVELOPMENT_TRIAL to ADMIN_GRANT, Platinum, 2200-01-01.
- Users 45, 48, 55, 63, 64: NO database writes. Stage 2C changes their eligibility in development.
- Users 40 and 42: NO database writes.
- User 55: authoritative dump expiration is 2026-10-29, not the 2026-10-16 date in the notes.
- User 64: Standard legacy grant (GrantID 14) is revoked and remains historical, never recreated.
- The consolidated package retires the runtime dependency but preserves the old grant table and all 13 historical rows for recovery.
- DML affects 11 users: 9 updates and 2 inserts. The 11 active overlay grants remain unchanged at Stage 2F.

## Deliberately unresolved before execution

- A fresh live preflight must match the snapshot before any DML; otherwise stop and reconcile changes.
- If an already-installed Stage 2D endpoint is used to edit records in the interim, the SQL migration must NOT be run blindly.
- Grant retirement, production cutover, schema removal, and deployment require separately approved work.
- No `Paid` subscriptions exist in this snapshot; paid-path compatibility still requires independent review.
