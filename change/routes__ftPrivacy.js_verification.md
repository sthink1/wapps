# M03 Source Verification — routes/ftPrivacy.js

**Classification:** REPLACE
**Authorization:** November 20, 2026 — consolidated M03 browser, POST guard and multi-private scope approved.
**Baseline:** Authoritative Drive routes/ftPrivacy.js SHA-256 149a76627c9bd2bd43f62db2cf72e49f75f5325896e09c3c80f1097bb7cbde5b; previous M03 Step C source SHA-256 6da469559c9f88952f01fc8b0404aaa7bb2e8cb5d8ccb7f56d0b7dc4ca188306. Expected replacement baseline is previous installed M03, not the older Drive source. Confirm source before replacing.
**Final SHA-256:** `bd5026fb7af2181bb5f0418c74fb83541272b5e52dc000057ecea6e059bc2576`
**Full comparison:** `change/routes__ftPrivacy.js.diff` compares complete original Drive bytes to complete final source (displayed text diff; SHA-256 identifies byte-exact delivered file).
**Approved changes:** Adds a tree-scoped, multi-Person capability verifier; returns only missing PersonIDs on protected reviews; adds scoped privacy-code verification for One Tree without altering ordinary unlock route or administrator gate. Preserves original line-ending convention (CRLF).
**Nonfunctional differences:** No discretionary reformatting, renaming, or unrelated function changes; existing original line endings preserved.
**Tests:** `node --check` and `tests/stage6.m03.consolidated.test.js` executed against the exact package sources. Bounded synthetic results only; see `change/M03_test_evidence.md`.
**Open validation:** Real WA database/browser scenario, source baseline reconciliation after owner's manual installation, independent security review and release authorization. No production or hosted deployments.
**Rollback:** Restore the owner's corresponding `_COPY` backup. For `routes/ftPrivacy.js`, restore its prior M03 revision if this consolidated package replaces that revision.
