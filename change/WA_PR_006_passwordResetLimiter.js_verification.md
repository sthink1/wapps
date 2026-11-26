# WA-PR-006 / IR-09 — services/passwordResetLimiter.js

**Classification:** REPLACE existing file.  
**Authorization:** Step A approved November 26, 2026; owner-approved shared resolver, verified IP quotas, fallback and preservation.  
**Authority:** My Drive/wonderfulApp/services/passwordResetLimiter.js (Drive file ID `1QYrJ2iPsJBTxCqq54bCvfaE7SIY3TSKm`).  
**Original SHA-256:** `e05451d9752ba144a7b6b8f7ff6ac8efa41bbbaccffa8d3f23b1430b73186c26`  
**Final SHA-256:** `8e41e27047aa9dfce70f9146cbefa173dc097036837bb113db60a46ca4f3b873`  
**Original/final bytes:** 1989 / 2155.

## Complete original-to-final review

- Build existing global and email key array unconditionally; append the IP key only when shared resolver returns a non-null canonical address. Remove previous normalization of arbitrary `String(ip)` because upstream now canonicalizes verified IP. Null cannot become a shared proxy/unknown HMAC bucket.
- Sort final key list in the same deterministic localeCompare order as before. Constants (5 email/20 IP/100 global), DB UTC-hour bucket, HMAC prefix, SQL atomic increment/locking and denial semantics unchanged. Existing reset handler is unchanged.
- Formatting: retain existing two-space style; only edited array construction and added explanatory comments. No unrelated formatting.

Full unified diff: `change/WA_PR_006_passwordResetLimiter.js.diff`. The exact original was retrieved twice with identical bytes. The unified diff was applied to a separate copy of the original and reconstructed the final file byte-for-byte.

## Standards and independent evidence

CS-01/02/05/06/07/08/09/10/11/12 and relevant CS-03; WA-PRESERVE-001, WA-CORE-001, WA-AUTH-001, WA-API-001/002, WA-DATA-001, WA-ERROR-001, WA-LOG-001, WA-SHARED-001, WA-ABUSE-001, WA-ENV-001, WA-FORMAT-001 and WA-REVIEW-001 as applicable. D03/D04/D07/D09/D10/D13/D14 preserved. Unrelated privacy/administrator/session behaviors not altered. No whole-project conformance claim.

Existing rate/global limiter and Group 5E source regressions pass; new verified 20/21, hour change, distinct IP, HMAC, deterministic ordering and unverified 2-key fallback tests pass. Existing email/global ceilings preserved. Real DB/hosted reset verification pending.

See `change/WA_PR_006_test_evidence.md` and `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md`. No actual project/database/Render changes.

## Install and rollback

Verify local original SHA-256 matches above; keep owner-managed `_COPY` backup. Replace only `services/passwordResetLimiter.js` with the exact packaged file and verify final SHA-256. Use coordinated package installation, not partial service replacement. On rollback, disable new login-IP activation, stop affected service, restore all five replacement originals from owner backups, remove only manifest-listed new files as appropriate, verify original hashes. DB rollback requires separate authorization; do not automatically drop table or reverse accepted PR-005 migration. See `install/INSTALL.md`.
