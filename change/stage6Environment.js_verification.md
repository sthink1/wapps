# services/stage6Environment.js — original-to-final verification

- Status: REPLACE proposal only; not installed.
- Authoritative original: Google Drive `My Drive/wonderfulApp/services/stage6Environment.js`; exact bytes reconciled to GitHub `b751e17`.
- Original SHA-256: `0cc0fac9b30cbd217c3be5b568e1f64736db408b378164db1a48bbf9ba8b0a76`.
- Final SHA-256: `c85e89823706441bc0bb399ec73b9f04d5e44c3db3cd71915d547fc6a8e98f9f`.
- Scope: Adds explicit gated production identity, HTTPS origin and secure-cookie support while preserving test-mode validation.
- Original-to-final unified diff: `change/stage6Environment.js.diff` (all additions/deletions accounted for; no undisclosed formatting passes).
- UI and database schema: no changes intended.
- Risks: Production identity is conditional on future explicit approved values and safe cutover; staged account/session/TNNA regressions need targeted owner tests.
- Rollback: restore owner's exact original copy of `services/stage6Environment.js` before any branch commit; production change is not authorized.
- Independent checks: see `change/test_evidence.md`; no hosted or live DB tests claimed.
