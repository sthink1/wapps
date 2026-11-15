# Wonderful Apps — R16-75-T04 Offline Test Evidence

**Date:** November 14, 2026  
**Disposition:** **PASS — bounded isolated offline handler test**  
**Purpose:** Verify that missing, invalid, or out-of-range HTTP status information safely falls back to HTTP 500 and a non-disclosing error body, without a secondary exception in the cases tested.

## Baseline and integrity

- Proposed `server.js` from the prior corrected R16-75-T01 package, unchanged. SHA-256: `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- Existing `tests/stage6.r16-75.central-error.offline.test.js`, unchanged. SHA-256: `ce9e3eebc3d739e6c8875e36417f989600194b0fe4253cb6592e60705a325c2e`.
- Nine of nine packaged manifest entries verified; all matched.
- Isolated test runtime: Node.js v22.16.0. No WA application startup, remote access, database, Render, GitHub, Google Drive mutation, or installed WA source change.

## Execution and assertions

Commands executed from the isolated `wonderfulApp` directory:

```powershell
node --check server.js
node --check tests/stage6.r16-75.central-error.offline.test.js
node --test --test-name-pattern='T04' tests/stage6.r16-75.central-error.offline.test.js
```

The T04 test extracted the central error-handler implementation from the proposed source, executed it in a Node.js VM with mocked response, request, logger and callback, and verified all conditions below.

| Error input | Expected response status | Expected nested `error.message` | Result |
|---|---:|---|---|
| `null` | 500 | `Internal Server Error` | PASS |
| `undefined` | 500 | `Internal Server Error` | PASS |
| `{}` | 500 | `Internal Server Error` | PASS |
| `Error` with status `399` | 500 | `Internal Server Error` | PASS |
| `Error` with status `600` | 500 | `Internal Server Error` | PASS |
| `Error` with status `'400'` | 500 | `Internal Server Error` | PASS |
| `Error` with status `400.5` | 500 | `Internal Server Error` | PASS |

The test also asserted absence of the synthetic sentinel from response bodies and application logs. One selected automated test passed, zero failed; no secondary exceptions occurred in these seven cases.

## Limitations

- This is an isolated extracted-handler test. It is **not** an HTTP integration, live Express, deployed staging or production test.
- The malformed-error coverage includes `null`, `undefined`, and an empty object. It does not assess arbitrary malicious accessors, proxies, getters, or other unusual JavaScript objects.
- T01–T03 previously recorded bounded passes remain unchanged; T04 did not repeat their assertions.
- No source modification is indicated by this T04 result; the overall R16-75 acceptance program remains open.

## Next

R16-75-T05: verify that an error occurring after headers have already been committed is delegated without a second HTTP response. Conduct first as an isolated test under the established sequence.

## Manual filing

Place this evidence report and the accompanying raw TAP log in `G:\My Drive\wonderfulApp\docs\` (relative path `wonderfulApp/docs/`). No replacement source files are included; no `.diff` or source checksum manifest update is required.
