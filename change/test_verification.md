# M03 controlled live-database scope acceptance — verification

**Reviewed source:** `routes/familyTree.js` from `WA_M03_Relationship_Person_Scope_Correction_2026-11-20.zip` (SHA-256 `f0b758645927d02a3dce2bb22d669124b32e8c8b0ae55b6eae1961b11063f05d`).

**Existing evidence preserved:** 9/9 owner-run offline source-backed checks, and previously accepted M03 privacy browser/offline coverage. The new script does not repeat unrelated Stage 6 tests.

**New test:** `tests/stage6.m03.realdb.scope.acceptance.js`, NEW, pretty-formatted, complete source.

**Feasible checks performed by assistant:** `node --check` passed; exact source hash confirmed; source extraction boundaries and cross-tree guard order confirmed; SQL fixture fields inspected in the November 19 `wappsHelioTestDump.sql` schema; ZIP entries and SHA-256 checksums verified.

**Not performed by assistant:** No connection to `wapps_test`, no actual SQL transaction, no HTTP tests, no successful merge, no browser tests. All seven live assertions are PENDING owner execution and must not be labeled passed in advance.

**Safety rationale:** Actual real-database writes are limited to uncommitted fixture INSERTs and a partner relationship inserted by the exact approved helper. A `finally` rollback is followed by SQL confirmation of fixture absence. No committed merger/undo/third-party side effects are attempted. A failed rollback must be treated as a critical exception.

**Limitations:** This validates direct source logic against a real SQL connection, not the full Express endpoint/middleware path. The cross-tree *permitted* case is a successful guard evaluation, not a committed merge. Auto-increment counters may advance. A full cross-tree merge should require its own authorized, independently reversible acceptance design if deemed essential for release.
