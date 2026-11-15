# Wonderful Apps — R16-75-T09 Offline Test Evidence

**Date:** November 14, 2026  
**Disposition:** **FAIL — 8/10 T09 checks passed; 2 failed**.  
**Scope:** isolated `httpdocs/js/waPlatform.js` execution under Node.js v22.16.0 with stubbed fetch and simulated HTTP responses. No app startup, database, external network, GitHub or authoritative WA file changes.

## Baseline and source authority

- Authoritative file location: `My Drive/wonderfulApp/httpdocs/js/waPlatform.js`.
- GitHub `sthink1/wapps`, `reviseLogIn`: blob `336cbfb369f20990bf5dc4f407e07f436862033b`.
- Retrieved review copy `waPlatform.js`: SHA-256 `e88dd8f9afff24e4a7b16e107619ba36fd8d01f3dd3a9ba284600aecf35304a5`, Git blob `336cbfb369f20990bf5dc4f407e07f436862033b` (same content as GitHub branch).
- This report tests the **existing** client source. No source correction is supplied or installed.

## Results

| Case | Response | Result |
|---|---|---|
| T09-A | Flat `{error:"Flat validation message",code:"INVALID_INPUT"}` | PASS |
| T09-B | Flat `{message:"Message field text"}` | PASS |
| T09-C | Nested `{error:{message:"Request failed"}}` | **FAIL** — actual message `[object Object]` |
| T09-D | Nested `{error:{message:"Access denied",code:"ACCESS_DENIED"}}` | **FAIL** — actual message `[object Object]` (code assertion not reached) |
| T09-E | Empty JSON object | PASS — `HTTP 404` fallback |
| T09-F | JSON null | PASS — `HTTP 500` fallback |
| T09-G | Non-JSON text | PASS — `HTTP 503` fallback |
| T09-H | Empty body | PASS — `HTTP 400` fallback |
| T09-I | Flat error-only code | PASS — existing behavior preserved |
| T09-J | Error response read without additional fetch | PASS |

**T09 automation:** 10 checks; 8 pass, 2 fail; process exit code 1.  
**Existing `waPlatform.unit.test.js`:** 19 checks; 19 pass, 0 fail; process exit code 0. Existing unit tests do not exercise the nested response case.

## Source-level cause

Current `readError` uses `(data && (data.message || data.error)) || ...` to choose the error message, and `data && (data.code || data.error)` to choose the code. For the central server's nested `{error:{message:"..."}}` response, the selected error value is an object. Passing it to `Error` yields the user-facing string `[object Object]` and may also set the error code to an object rather than a bounded string.

## Required follow-up

1. Keep T09 **FAILED** until a narrowly scoped, approved client compatibility correction is prepared and retested.
2. Any new replacement for `httpdocs/js/waPlatform.js` must follow WA standards: full verified baseline comparison before delivery, complete replacement, separate `.diff` and `.md` verification reports, checksums under `change/`, dependency and rollback analysis, and additional tests for flat/nested/empty/non-JSON responses.
3. Preserve existing session, credential, refresh-lock, non-replay, and logout behavior; run the existing 19-unit-test regression suite and new T09 cases.
4. Do not change existing server nested error response solely to evade the client defect; the contract-format migration is a separate deferred decision.
5. The client source comment says it is a candidate not loaded by existing WA pages. Accordingly, actual browser integration and consumer impact are not established by this test.
6. T06 malformed real-HTTP parsing remains **partially tested/open**. T01–T05, T07 and T08 retain their prior **bounded offline passes**.

## Files in evidence archive

- `tests/stage6.r16-75.t09.offline.test.js` — standalone project-relative automated test.
- `docs/WA_R16-75_T09_TAP_2026-11-14.txt` — raw T09 TAP output, including failures.
- `docs/WA_R16-75_T09_Existing_Unit_TAP_2026-11-14.txt` — existing client-unit-test TAP output.
- This report.
- `change/SHA256SUMS_T09.json` — manifest of the four evidence files, excluding manifest itself.

No WA application source replacement is contained in this archive. The authoritative project must remain unchanged until an owner-controlled installation of a separately verified correction package.
