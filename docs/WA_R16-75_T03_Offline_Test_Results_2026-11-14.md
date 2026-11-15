# Wonderful Apps — R16-75-T03 Offline Test Evidence

**Date:** November 14, 2026  
**Disposition:** **PASS — bounded isolated offline central-handler test**  
**Purpose:** Confirm that HTTP 500 and 503 exceptions, whether marked or unmarked as expected client errors, return fixed public server-error text while preserving HTTP status and omitting internal exception text and synthetic secrets from responses and application error logs.

## Test baseline and integrity

- Proposed `server.js` from `WA_R16-75_T01_Corrected_Test_and_Evidence_2026-11-14.zip` (unchanged), SHA-256: `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- Test file `tests/stage6.r16-75.central-error.offline.test.js` (unchanged), SHA-256: `ce9e3eebc3d739e6c8875e36417f989600194b0fe4253cb6592e60705a325c2e`.
- Shared `services/stage6ExpectedClientError.js` copied read-only from the earlier authoritative source, SHA-256: `daa68079b56cf487792bf3b8acbced5caf36c677ae481320df9196788e3918ae`.
- All **9/9** entries in the earlier correction package's `change/SHA256SUMS.json` were verified against extracted package files: matched.
- Node.js `v22.16.0` in this isolated runtime. No project installation, GitHub or Google Drive mutation, application startup, Render call, database or network access.
- The previous Drive-to-GitHub `server.js` baseline reconciliation and original bounded T01/T02 PASS evidence were retained; this run did not independently reverify the currently deployed Render revision.

## Execution

From the isolated `wonderfulApp/` directory:

```powershell
node --check server.js
node --test --test-name-pattern='T03' tests/stage6.r16-75.central-error.offline.test.js
```

The selected T03 test extracted the proposed central error middleware from `server.js`, ran it in a Node.js VM with mocked `res`, `req`, `next`, and `logger`, and injected synthetic exceptions.

## Assertions and results

The exception message in every case was `SYNTHETIC_R16_75_SECRET_MUST_NOT_LEAK`.

| Status | Error classification | Response status | `error.message` | Secret absent from body/log | Result |
|---|---|---|---|---|---|
| 500 | Unmarked | 500 | `Internal Server Error` | Yes | PASS |
| 500 | Marked expected | 500 | `Internal Server Error` | Yes | PASS |
| 503 | Unmarked | 503 | `Internal Server Error` | Yes | PASS |
| 503 | Marked expected | 503 | `Internal Server Error` | Yes | PASS |

The existing nested response shape `{ "error": { "message": "Internal Server Error" } }` is preserved by the tested handler. The test produced **one passing automated test with four internal scenarios, zero failed**, and JavaScript syntax check completed successfully.

## Raw Node TAP execution result

```text
TAP version 13
# Subtest: T03: marked and unmarked 500/503 always return generic error
ok 1 - T03: marked and unmarked 500/503 always return generic error
  ---
  duration_ms: 4.636583
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
# duration_ms 81.949626
```

## Limitations and disposition

- This test confirms **isolated extracted-handler behavior**, not an HTTP integration test of the running Express app, its real parser, routes, cache headers, or deployed staging service.
- Response and logging assertions use mocks; no production diagnostics, credential details, or user data were involved.
- **No changes to proposed `server.js` or the existing test source are necessary based on T03.** T01 and T02 remain accepted at their recorded bounded scope; this result does not promote either to hosted acceptance.
- **R16-75-T04** (missing or invalid status and missing error) is the next isolated test in the approved sequence. Independent staging/source release gates remain applicable.

## Manual filing

Place the two evidence files in `G:\My Drive\wonderfulApp\docs\` (relative path `wonderfulApp/docs/`). These records are not source revisions and require no `.diff`. Keep earlier change-package checksum records under `wonderfulApp/change/`.
