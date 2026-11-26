# WA-PR-006 / IR-09 — services/passwordResetRateCleanup.js

**Classification:** REPLACE existing file.  
**Authorization:** Step A approved November 26, 2026; owner-approved shared resolver, verified IP quotas, fallback and preservation.  
**Authority:** My Drive/wonderfulApp/services/passwordResetRateCleanup.js (Drive file ID `11dllTNWQFDgU6P9cKd6M3CK37mY6UQFJ`).  
**Original SHA-256:** `98c8407dcb53c4491e57331a361eac025df8ed941620e28e6d462492de32874f`  
**Final SHA-256:** `1d66b5f363ae6eabc205ac9f882c8ac6d5b7f83f3417a3d52ac47aea72fae3c1`  
**Original/final bytes:** 2056 / 3154.

## Complete original-to-final review

- Import new login IP limiter solely to read feature-enable state.
- Add separate indexed DELETE predicate on LoginIpRateT UpdatedAt older than 48 hours, with existing 250 row batch/12 batch maximum. New cleanup function reports counts/safe failure only.
- Existing scheduler tick runs existing reset cleanup unchanged, then new cleanup only when feature enabled; same first delay/day interval, non-overlap, stop and timer unref behavior. Export new function and SQL for targeted tests; existing exports unchanged.
- Formatting: existing two-space style preserved; only the tick try block expanded and new function added. No unrelated formatting.

Full unified diff: `change/WA_PR_006_passwordResetRateCleanup.js.diff`. The exact original was retrieved twice with identical bytes. The unified diff was applied to a separate copy of the original and reconstructed the final file byte-for-byte.

## Standards and independent evidence

CS-01/02/05/06/07/08/09/10/11/12 and relevant CS-03; WA-PRESERVE-001, WA-CORE-001, WA-AUTH-001, WA-API-001/002, WA-DATA-001, WA-ERROR-001, WA-LOG-001, WA-SHARED-001, WA-ABUSE-001, WA-ENV-001, WA-FORMAT-001 and WA-REVIEW-001 as applicable. D03/D04/D07/D09/D10/D13/D14 preserved. Unrelated privacy/administrator/session behaviors not altered. No whole-project conformance claim.

Existing reset cleanup unit and capacity scripts PASS; new login-IP cleanup mock bounds and failure path PASS. Actual deletion and lock behavior pending; no cleanup was executed against database.

See `change/WA_PR_006_test_evidence.md` and `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md`. No actual project/database/Render changes.

## Install and rollback

Verify local original SHA-256 matches above; keep owner-managed `_COPY` backup. Replace only `services/passwordResetRateCleanup.js` with the exact packaged file and verify final SHA-256. Use coordinated package installation, not partial service replacement. On rollback, disable new login-IP activation, stop affected service, restore all five replacement originals from owner backups, remove only manifest-listed new files as appropriate, verify original hashes. DB rollback requires separate authorization; do not automatically drop table or reverse accepted PR-005 migration. See `install/INSTALL.md`.
