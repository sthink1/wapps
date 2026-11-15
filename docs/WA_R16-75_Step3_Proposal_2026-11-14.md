# Wonderful Apps — R16-75 Step 3 correction proposal

**Prepared:** 2026-11-14  
**Status:** Download-only proposal; baseline reconciled November 14, 2026. No installation or acceptance test has occurred.  
**First planned test:** **R16-75-T01**, expected marked 4xx preservation. **R16-75-T02** proves unexpected 4xx redaction.

## Governing requirements

Root README Section 0; approved Core v1.0 CS-01–CS-12 (especially CS-01,02,05,09,11,12); approved Detailed v0.4.1 (`WA-ERROR-001`, `WA-API-002`, `WA-CACHE-001`, `WA-REVIEW-001`); D03/D04/D05; Stage 6 Step 2 review. D05 authorized preparation, not installation.

## Exact destination mapping — relative to Wonderful Apps project root

| ZIP path | Manual installation destination |
|---|---|
| `wonderfulApp/server.js` | `G:\My Drive\wonderfulApp\server.js` (owner-controlled replacement after reviewing package and verifying the install target remains unchanged) |
| `wonderfulApp/tests/stage6.r16-75.central-error.offline.test.js` | `G:\My Drive\wonderfulApp\tests\stage6.r16-75.central-error.offline.test.js` (new file) |
| `wonderfulApp/change/server.js.diff` | `G:\My Drive\wonderfulApp\change\server.js.diff` |
| `wonderfulApp/change/server.js_Change_Verification.md` | `G:\My Drive\wonderfulApp\change\server.js_Change_Verification.md` |
| `wonderfulApp/change/SHA256SUMS.json` | `G:\My Drive\wonderfulApp\change\SHA256SUMS.json` |
| `wonderfulApp/docs/WA_R16-75_Step3_Proposal_2026-11-14.md` | `G:\My Drive\wonderfulApp\docs\WA_R16-75_Step3_Proposal_2026-11-14.md` |

**Existing file protection:** `services/stage6ExpectedClientError.js` is a required dependency, **not** a replacement. Keep the existing authoritative file unchanged. Owner performs any installation manually. Do not run tests against databases or staging under this source-review-only step; execution requires verified isolated test environment and agreed test scope.

## Source and version ledger

- Original `server.js` — Drive ID `1K6yf51Q1Ak6nxnqiiFaC1_PxXwCcWlq9`; observed modified `2026-11-10T03:33:26Z`; original SHA-256 `b6c6ec291ffc7674590cccb83d627c0dc9dac0431129ba017b991c7e8156f1e1`.
- Proposed complete `server.js` — SHA-256 `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- Required unmodified `services/stage6ExpectedClientError.js` — original SHA-256 `daa68079b56cf487792bf3b8acbced5caf36c677ae481320df9196788e3918ae`.
- New test — SHA-256 `da74d3fc8f2ecce7853331127405ac43731f502d519daa69ede7756f37560e73`.
- November 14 read-only GitHub verification: current `reviseLogIn` HEAD and commit `73722f1338e00cea3e5f17fee81affb51d749c76` are identical (0 commits ahead/behind). GitHub `server.js` Git blob `196cc4f1580c33e30b1d20b461764fea530fcc82` exactly matches the Git blob calculated from the retrieved Google Drive original. No source baseline difference requiring correction was found.
- Render staging was **reported** Live at commit `73722f1` on November 13; the actual deployed commit was not independently verified through Render. This limitation does not undermine the verified Drive-vs-GitHub byte comparison.

## What changes / what remains unchanged

Central handler now permits marked, approved 4xx text only; generic text for unexpected 4xx; fixed text for 5xx; preserve existing 400–599 status and nested error object. Add defensive handling for already-committed responses, and no-store on early errors under existing protected prefixes. No changes to routes, classification utility, frontend, database, session logic, admin privileges, public endpoint hardening, or response-envelope modernization.

## Acceptance sequence — after owner installation in an isolated test environment

1. **T01:** Isolated marked 400/401/403/404/409 status/message/shape tests.
2. **T02:** Unmarked 400/401/403/404/409 sentinel hiding tests.
3. **T03/T04/T05:** 500/503, malformed status/error, and already-sent headers.
4. **T06/T11:** Real malformed JSON/urlencoded/multipart parser and cache/log/headers tests in authorized isolated integration setup.
5. **T07–T10:** Direct route, domain response and browser/client regression checks.
6. **T12:** Impacted historic assertions selectively rerun with cause recorded.

The new offline test file **simulates** the extracted current central handler, not an Express HTTP server. It therefore cannot certify parser integration, frontends, hosted behavior or no DB effects. Nothing is marked PASS until results are actually captured.

## Installation gate and rollback

Owner can install the previously authorized narrowly scoped correction after reviewing this verified package, without an additional routine approval exchange. Before installation, confirm the local target file still matches the verified original checksum; if changed, reconcile rather than blindly overwrite. Render deployment and database-backed testing require their own applicable environment safety checks. Do not run code against the production DB or Render production. Owner-controlled rollback restores the verified original `server.js` with hash `b6c6ec291ffc7674590cccb83d627c0dc9dac0431129ba017b991c7e8156f1e1`; document any later source drift first.
