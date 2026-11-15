# Wonderful Apps — R16-75-T10 offline test evidence

**Date:** November 15, 2026  
**Test:** R16-75-T10 — GET authentication recovery, 403/503, denied/timed-out POST, logout and unsaved-form considerations.  
**Disposition:** **TEST-PASS-BOUNDED** for 11 isolated checks. **OPEN** for real browser unsaved-form acceptance and actual hosted/integration behavior.

## Source and execution boundary

- Tested the **proposed** `httpdocs/js/waPlatform.js` from `WA_R16-75_T09_Client_Compatibility_Correction_2026-11-14.zip`, not a live WA installation.
- Proposed client SHA-256: `57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d`.
- Original authoritative Google Drive/GitHub client previously verified as identical; original SHA-256: `e88dd8f9afff24e4a7b16e107619ba36fd8d01f3dd3a9ba284600aecf35304a5`; GitHub `reviseLogIn` blob `336cbfb369f20990bf5dc4f407e07f436862033b`.
- The prior verified GitHub staging branch head for the R16-75 baseline was `73722f1338e00cea3e5f17fee81affb51d749c76`. This result does **not** establish what is currently installed or running in Render.
- Used Node.js `v22.16.0`, `node:test`, `vm` and controlled mocked `window.fetch`, storage and browser locks. No real authentication, database, HTTP server, Render, browsers or network.
- Only ephemeral test/work files under the generated isolated workspace were written; no WA source or service modified.

## Execution

```text
node --test tests/stage6.r16-75.t10.session-mutation.offline.test.js
# tests 11; pass 11; fail 0

node --test tests/*.test.js
# tests 47; pass 47; fail 0

node --check tests/stage6.r16-75.t10.session-mutation.offline.test.js
node --check httpdocs/js/waPlatform.js
# both exit 0
```

The tests in the combined run comprise 19 preexisting browser-session/authentication checks, 10 earlier T09 checks, 7 T09 supplemental regressions and 11 new T10 checks. Test names and TAP output are preserved in the separate evidence files.

## T10 case disposition

| Case | Stimulus / assertions | Result |
|---|---|---|
| A | GET 401 → single refresh → one GET retry with new bearer | PASS |
| B | GET 401 + failed refresh → return original 401, no GET replay | PASS |
| C | 403 flat error/code; no refresh or replay | PASS |
| D | 503 nested message/code; no refresh or replay | PASS |
| E | POST 401: one submission, original body retained, no refresh | PASS |
| F | POST 503: rejection propagated and no replay | PASS |
| G | Simulated POST transport timeout/rejection: no replay | PASS |
| H | Successful logout: server revocation first; local token cleared and explicit logout enforced | PASS |
| I | Failed logout: no false server-revocation claim; local token cleared | PASS |
| J | Expired token + refresh rejection: do not send protected GET | PASS |
| K | Form-like POST body retained; 401 never causes retry | PASS, bounded |

## Unresolved acceptance work

1. **Unsaved browser form**: A form-like request body is not a browser's editing state. Preserve real unsaved-input behavior and confirm user-facing error rendering in controlled browser testing; T10 cannot be declared fully browser-accepted from this evidence.
2. **Real networking**: Node mocked fetch rejects as a simulated timeout; real AbortSignal, disconnected-network and race behavior were not exercised.
3. **Deployment and installed-source reconciliation**: These tests exercised the package's proposed client. Check the installed client hash before relying on the results for that environment.
4. **T06**: Express/Multer malformed-request integration remains outstanding independently of T10.

## Required installation and rollback

- New reusable test only: `wonderfulApp/tests/stage6.r16-75.t10.session-mutation.offline.test.js`.
- Evidence: `wonderfulApp/docs/WA_R16-75_T10_Offline_Test_Results_2026-11-15.md`, `WA_R16-75_T10_Offline_Results_2026-11-15.tap`, and `WA_R16-75_T10_Combined_Regression_2026-11-15.tap`.
- Manifest: `wonderfulApp/change/SHA256SUMS_T10.json`.
- No existing WA application file is replaced. Undo installation by removing only the new T10 test/evidence files if needed; do not remove earlier T01–T09 evidence.
- Do not change production, GitHub, Render or the authoritative Google Drive files through the assistant.
