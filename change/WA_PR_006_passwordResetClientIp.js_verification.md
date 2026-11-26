# WA-PR-006 / IR-09 — services/passwordResetClientIp.js

**Classification:** REPLACE existing file.  
**Authorization:** Step A approved November 26, 2026; owner-approved shared resolver, verified IP quotas, fallback and preservation.  
**Authority:** My Drive/wonderfulApp/services/passwordResetClientIp.js (Drive file ID `1rYq3x2pbYQZI48_6L-OBbeJ5CHS_du-e`).  
**Original SHA-256:** `e972b57e8c22b001e9adbf38529fb903a59bf2150ea9106b772b622b794c205c`  
**Final SHA-256:** `fd4e132f5fe145e5eb1c5ba9790fbdd5cfdf614df4e62ee1e1e514227eab0ae2`  
**Original/final bytes:** 1040 / 338.

## Complete original-to-final review

- Replace the standalone resolver with a thin compatibility adapter delegating to the shared clientIp service. Preserve exported `singleIP`, `trustedCfEnabled`, `clientIpForReset` names.
- Remove direct socket-peer/unknown fallback, old local IP parsing, and duplicated trust policy. `clientIpForReset` now returns canonical verified IP or null. Duplicate raw-header validation and separate production assurance live in the new shared service.
- Formatting: complete small adapter rewritten in readable four-space style; no unrelated code remains to reformat.

Full unified diff: `change/WA_PR_006_passwordResetClientIp.js.diff`. The exact original was retrieved twice with identical bytes. The unified diff was applied to a separate copy of the original and reconstructed the final file byte-for-byte.

## Standards and independent evidence

CS-01/02/05/06/07/08/09/10/11/12 and relevant CS-03; WA-PRESERVE-001, WA-CORE-001, WA-AUTH-001, WA-API-001/002, WA-DATA-001, WA-ERROR-001, WA-LOG-001, WA-SHARED-001, WA-ABUSE-001, WA-ENV-001, WA-FORMAT-001 and WA-REVIEW-001 as applicable. D03/D04/D07/D09/D10/D13/D14 preserved. Unrelated privacy/administrator/session behaviors not altered. No whole-project conformance claim.

Updated Group 5E tests and shared-service cases cover default off, explicit staging, production assurance, malformed/missing/joined/duplicate rejection, XFF ignored, canonical forms and loopback Node raw-header behavior. Actual production provenance outstanding.

See `change/WA_PR_006_test_evidence.md` and `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md`. No actual project/database/Render changes.

## Install and rollback

Verify local original SHA-256 matches above; keep owner-managed `_COPY` backup. Replace only `services/passwordResetClientIp.js` with the exact packaged file and verify final SHA-256. Use coordinated package installation, not partial service replacement. On rollback, disable new login-IP activation, stop affected service, restore all five replacement originals from owner backups, remove only manifest-listed new files as appropriate, verify original hashes. DB rollback requires separate authorization; do not automatically drop table or reverse accepted PR-005 migration. See `install/INSTALL.md`.
