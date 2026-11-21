# M03 Source Verification — httpdocs/js/FTOneTreeMerge.js

**Classification:** REPLACE
**Authorization:** November 20, 2026 — consolidated M03 browser, POST guard and multi-private scope approved.
**Baseline:** Authoritative Drive source SHA-256 a831e5006291db4b41ed51332bed630f6180ef25db016cbf5bd5231b23262ac3
**Final SHA-256:** `561e4602b8a7ee87c0ab817e700626848a9572d6a512472b04a980dcd875fd59`
**Full comparison:** `change/httpdocs__js__FTOneTreeMerge.js.diff` compares complete original Drive bytes to complete final source (displayed text diff; SHA-256 identifies byte-exact delivered file).
**Approved changes:** Adds in-memory per-Person capabilities, masked privacy-code prompt and GET-only retry; headers accompany review and merge, but rejected merge POST is never retried automatically. Existing rendering and navigation logic is unchanged; CRLF preserved.
**Nonfunctional differences:** No discretionary reformatting, renaming, or unrelated function changes; existing original line endings preserved.
**Tests:** `node --check` and `tests/stage6.m03.consolidated.test.js` executed against the exact package sources. Bounded synthetic results only; see `change/M03_test_evidence.md`.
**Open validation:** Real WA database/browser scenario, source baseline reconciliation after owner's manual installation, independent security review and release authorization. No production or hosted deployments.
**Rollback:** Restore the owner's corresponding `_COPY` backup. For `routes/ftPrivacy.js`, restore its prior M03 revision if this consolidated package replaces that revision.
