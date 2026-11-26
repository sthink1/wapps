# WA-PR-006 / IR-09 — routes/users.js

**Classification:** REPLACE existing file.  
**Authorization:** Step A approved November 26, 2026; owner-approved shared resolver, verified IP quotas, fallback and preservation.  
**Authority:** My Drive/wonderfulApp/routes/users.js (Drive file ID `1viwBYD1ZIhx1YgcTbfzeHSBUsbuCJuyP`).  
**Original SHA-256:** `d7b3b598c7b9462e55fdf56e16ec0217f3eb9329b107b5d085c5f6a280486a17`  
**Final SHA-256:** `39299e4c24d14baf394f78a2029363e0c1b236eda569a346eabbd69d40b49cfd`  
**Original/final bytes:** 24349 / 24694.

## Complete original-to-final review

- Import the new login IP service alongside the unchanged account limiter.
- Move the existing username/password validation inside the existing try block, immediately after the IP quota check. The same generic 401 body is used for IP denial, malformed input, nonexistent accounts and wrong passwords. Account lookup does not occur on quota denial; reservation is committed separately before lookup. Malformed body values reaching this route now also consume verified IP quota.
- Clarify existing comment: unknown usernames do not create **account** counter rows; IP rows may now be created. No other route, reset handler, account-fence path, bcrypt/challenge/email path, registration, session/verification, cache or response changes.
- Formatting: the moved validation block is indented one level due to its new enclosing try; the rest of the file is byte-preserved. No unrelated formatting.

Full unified diff: `change/WA_PR_006_users.js.diff`. The exact original was retrieved twice with identical bytes. The unified diff was applied to a separate copy of the original and reconstructed the final file byte-for-byte.

## Standards and independent evidence

CS-01/02/05/06/07/08/09/10/11/12 and relevant CS-03; WA-PRESERVE-001, WA-CORE-001, WA-AUTH-001, WA-API-001/002, WA-DATA-001, WA-ERROR-001, WA-LOG-001, WA-SHARED-001, WA-ABUSE-001, WA-ENV-001, WA-FORMAT-001 and WA-REVIEW-001 as applicable. D03/D04/D07/D09/D10/D13/D14 preserved. Unrelated privacy/administrator/session behaviors not altered. No whole-project conformance claim.

Offline actual-route callbacks: unknown/malformed pre-lookup counting, generic 401, quota DB failure stops lookup, account password failure/reservation/success paths and unverified fallback; reset route generic status, Origin and no-store. Existing Group 5E source audit PASS. Actual Express/browser/TNNA and DB Step D outstanding.

See `change/WA_PR_006_test_evidence.md` and `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md`. No actual project/database/Render changes.

## Install and rollback

Verify local original SHA-256 matches above; keep owner-managed `_COPY` backup. Replace only `routes/users.js` with the exact packaged file and verify final SHA-256. Use coordinated package installation, not partial service replacement. On rollback, disable new login-IP activation, stop affected service, restore all five replacement originals from owner backups, remove only manifest-listed new files as appropriate, verify original hashes. DB rollback requires separate authorization; do not automatically drop table or reverse accepted PR-005 migration. See `install/INSTALL.md`.
