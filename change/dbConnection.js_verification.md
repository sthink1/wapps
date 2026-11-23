# dbConnection.js — original-to-final verification

- Status: REPLACE proposal only; not installed.
- Authoritative original: Google Drive `My Drive/wonderfulApp/dbConnection.js`; exact bytes reconciled to GitHub `b751e17`.
- Original SHA-256: `a16086c538cf93e87f60768e8912d4416f97ea3b15b1654953dbd95c5720beb6`.
- Final SHA-256: `887112e9180d0bd33aca26428cf7e867a6ef06cc325c033067986e03c7b7109a`.
- Scope: Validates DB port, connection limit, and TLS policy before creating pool; requires verified TLS for hosted modes.
- Original-to-final unified diff: `change/dbConnection.js.diff` (all additions/deletions accounted for; no undisclosed formatting passes).
- UI and database schema: no changes intended.
- Risks: Production identity is conditional on future explicit approved values and safe cutover; staged account/session/TNNA regressions need targeted owner tests.
- Rollback: restore owner's exact original copy of `dbConnection.js` before any branch commit; production change is not authorized.
- Independent checks: see `change/test_evidence.md`; no hosted or live DB tests claimed.
