# Consolidated M03 independent test evidence — November 20, 2026

**Observed:** `node --test tests/stage6.m03.consolidated.test.js`: 19 PASS, 0 FAIL, 0 skipped (see accompanying TAP). `node --check`: four source/test scripts passed.

**Environment:** Isolated Node.js v22.16.0 tool runtime, read-only baseline loaded from authoritative Drive; fake database and Express transport simulation. The changed files were exercised directly, but no real WA server, MySQL connection, browser session or live merge was used.

**Coverage:** Missing, incorrect, expired/simulated wrong, wrong-user, rate-limited and valid codes; two private Persons; administrator/public review; no-candidate review; legacy candidateGroups; safe review errors; response redaction; scoped One Tree unlock route; merge POST pre-write guard; browser GET-only retry, page-memory token delivery and no automatic POST replay.

**Limitations:** A mocked DB cannot prove actual SQL schema compatibility, full merge transaction success, complete browser presentation, or privacy with real records. The merge route integration exercises a same-tree no-mutation branch and rejection before writes. A controlled local test with fictional test data remains necessary before production release; no database changes are authorized by this artifact. The legacy 11/11 and 8/8 accepted evidence remains historically valid; this test does not replace their original test reports.

**Release gate:** Independently reconcile installed baseline and run one meaningful end-to-end browser/database test with controlled synthetic fixtures, including success and denial, then obtain mandatory independent security review and separate owner release approval. Do not repeat these 19 synthetic checks as a stand-alone manual step unless source-integrity verification indicates need.
