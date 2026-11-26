# WA-PR-006 / IR-09 — tests/group5e.client-ip.unit.test.js

**Classification:** REPLACE existing file.  
**Authorization:** Step A approved November 26, 2026; owner-approved shared resolver, verified IP quotas, fallback and preservation.  
**Authority:** My Drive/wonderfulApp/tests/group5e.client-ip.unit.test.js (Drive file ID `1LmUqW5moA3lREgRptR1Anh-shqvn1EPv`).  
**Original SHA-256:** `837990d7d3dcedd56821e88d82161632eb1e45d2712064abcd36c3858d3d8f38`  
**Final SHA-256:** `dc75271740e89e4f8ed41c3276b8a128939393906cfa55d60df741adb5da0c15`  
**Original/final bytes:** 1929 / 2520.

## Complete original-to-final review

- Stub stage6Environment for new shared clientIp module instead of old reset adapter.
- Replace synthetic req.get/header fixture with Node-style rawHeaders and retain fake socket peer for negative assertions.
- Change old expected shared socket-peer fallback to null under disabled, malformed or missing CF conditions; new behavior is explicitly approved by WA-PR-006. Retain staging opt-in and forged-XFF tests. Add duplicate-header, zone ID rejection, canonical IPv6/IPv4-mapped assertions.
- Formatting: entire small historical test reformatted from compressed mixed style to readable four-space style; semantically relevant expectation/fixture changes itemized above. Historical accepted results remain intact for their original baseline.

Full unified diff: `change/WA_PR_006_group5e.client-ip.unit.test.js.diff`. The exact original was retrieved twice with identical bytes. The unified diff was applied to a separate copy of the original and reconstructed the final file byte-for-byte.

## Standards and independent evidence

CS-01/02/05/06/07/08/09/10/11/12 and relevant CS-03; WA-PRESERVE-001, WA-CORE-001, WA-AUTH-001, WA-API-001/002, WA-DATA-001, WA-ERROR-001, WA-LOG-001, WA-SHARED-001, WA-ABUSE-001, WA-ENV-001, WA-FORMAT-001 and WA-REVIEW-001 as applicable. D03/D04/D07/D09/D10/D13/D14 preserved. Unrelated privacy/administrator/session behaviors not altered. No whole-project conformance claim.

6/6 revised Group 5E cases PASS. Original historical test was superseded only where the new authorized fallback contradicts its old expectation; no retrospective change to historical test results.

See `change/WA_PR_006_test_evidence.md` and `docs/WA_PR_006_IR_09_acceptance_plan_2026-11-26.md`. No actual project/database/Render changes.

## Install and rollback

Verify local original SHA-256 matches above; keep owner-managed `_COPY` backup. Replace only `tests/group5e.client-ip.unit.test.js` with the exact packaged file and verify final SHA-256. Use coordinated package installation, not partial service replacement. On rollback, disable new login-IP activation, stop affected service, restore all five replacement originals from owner backups, remove only manifest-listed new files as appropriate, verify original hashes. DB rollback requires separate authorization; do not automatically drop table or reverse accepted PR-005 migration. See `install/INSTALL.md`.
