# Wonderful Apps — R16-75-T02 Offline Test Evidence

**Date:** November 14, 2026  
**Disposition:** **PASS — bounded isolated offline central-handler test**  
**Purpose:** Confirm that unmarked unexpected HTTP 400/401/403/404/409 exceptions preserve their status while disclosing neither internal exception messages nor synthetic secrets in the response or application log.

## Test baseline

- Proposed `server.js` taken unchanged from `WA_R16-75_T01_Corrected_Test_and_Evidence_2026-11-14.zip`.
- Proposed `server.js` SHA-256: `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- Test file SHA-256: `ce9e3eebc3d739e6c8875e36417f989600194b0fe4253cb6592e60705a325c2e`.
- Shared `services/stage6ExpectedClientError.js` SHA-256: `daa68079b56cf487792bf3b8acbced5caf36c677ae481320df9196788e3918ae`.
- ZIP manifest verification: **9/9** SHA-256 entries match the extracted package files.
- Environment: Node.js **v22.16.0**, temporary isolated files only; no database, network, application startup, WA local installation or Render access.
- Earlier source reconciliation: Google Drive `server.js` matched GitHub `reviseLogIn` commit `73722f1338e00cea3e5f17fee81affb51d749c76`; this run did not recheck the current staging deployment.

## Execution

From the isolated `wonderfulApp/` directory:

```powershell
node --test --test-name-pattern='T02' tests/stage6.r16-75.central-error.offline.test.js
```

The selected test ran the actual central error-handling function extracted from the proposed `server.js` in a Node `vm` context using mocked request/response and logger objects.

## Assertions and observations

The test generated five unmarked errors with statuses **400, 401, 403, 404 and 409**, each carrying the sentinel `SYNTHETIC_R16_75_SECRET_MUST_NOT_LEAK`.

For **each** status:

1. Response HTTP status (mock `res.statusCode`) equaled the supplied status — **PASS**.
2. Nested response JSON `error.message` equaled the fixed string `Request failed` — **PASS**.
3. Sentinel absent from the serialized response body — **PASS**.
4. Sentinel absent from captured `logger.error` messages — **PASS**.

**Node TAP result:** 1 test passed; 0 failed; 0 skipped. The one automated test includes all five status subcases.

## Raw TAP output

```text
TAP version 13
# Subtest: T02: unmarked 400/401/403/404/409 never expose exception text
ok 1 - T02: unmarked 400/401/403/404/409 never expose exception text
  ---
  duration_ms: 4.481625
  type: 'test'
  ...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 83.861923
```

## Scope and limits

- This is **not** a live Express, request-parser, route, browser, or staging test.
- Only the exported behavior of the extracted central handler is evaluated. Express `next(err)` integration and real transport/cache headers have not been tested in this run.
- The current package's proposed `server.js` requires **no additional changes based on T02**.
- T01's previously recorded bounded PASS is preserved. T03–T12 remain separate testing work.
- No authoritative Google Drive, GitHub, WA local files, databases, production, or Render services were modified.

## Next controlled test

**R16-75-T03** — marked and unmarked unexpected HTTP 500/503 must preserve statuses while returning `Internal Server Error` and suppressing internal diagnostic content.
