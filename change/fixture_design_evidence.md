# M03 fixture design evidence

- Based on Google Drive November 19, 2026 `wappsHelioTestDump.sql` (schema reviewed, NOT executed).
- Relevant tables checked: `UsersT`, `FamilyTreeT`, `FTFamilyTreeUserT`, `FTPersonT`, `FTFamilyTreePersonT`, `FTPersonPrivacyT`, `FTPrivacyUnlockT`, `FTPrivacyAttemptT`, `FTTreeMergeT`, `FTImageT`.
- Test fixture setup/cleanup executes only when the active database reports `wapps_test` and `.env.test` specifies `DB_NAME=wapps_test`.
- Transactional setup and cleanup, IDs uniquely recorded to `%TEMP%` manifest, stop-on-unexpected-state guard.
- No real-DB execution by ChatGPT. The approval authorizes the owner to run the fixture locally, not a production change.
- Full HTTP/browser acceptance not yet executed and must not be reported as passed.
- Full successful merge/undo intentionally excluded because the current fixture cleanup does not claim to reverse that complex operation.
