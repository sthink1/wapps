# Wonderful Apps — R16-75-T06 Test Evidence

**Date:** November 14, 2026  
**Test ID:** R16-75-T06 — malformed JSON / URL-encoded / multipart early request-body parsing  
**Result:** PARTIAL PASS — isolated central-handler simulation; real request-parser integration remains OPEN

## Baseline

- Proposed `server.js` SHA-256: `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- Existing shared classifier: `services/stage6ExpectedClientError.js` (loaded in isolated working copy).
- Source from previously delivered R16-75-T01 corrected proposal. No original or proposed `server.js` edits for T06.
- Node.js version: 22.16.0.
- Source and test file JavaScript syntax checks: passed.

## What was executed

`node --test tests/stage6.r16-75.t06.parser-simulation.offline.test.js`

Three automated tests passed, zero failed:

1. **T06-A:** Simulated parser-origin exceptions representing malformed JSON, URL-encoded and multipart bodies at eight protected API paths (32 combinations). For simulated 400 errors, status remained 400 and message was `Request failed`; multipart error with no status used safe 500 `Internal Server Error`. Each protected response received `Cache-Control: no-store`; synthetic parser diagnostics were absent from returned JSON and captured log messages.
2. **T06-B:** Five synthetic public/unrelated paths did not acquire `no-store` as an unintended consequence of the central error handler; simulated error output was sanitized.
3. **T06-C:** Static source inspection confirmed JSON, URL-encoded and multipart middleware are registered *before* router-specific protected cache headers, and the proposed central handler has a bounded protected-path fallback.

The tests invoke the actual extracted proposed central handler with simulated Express request/response objects and fabricated parser-like errors. No actual HTTP requests were sent.

## What was NOT verified

- **Actual Express `express.json()` and `express.urlencoded()` parsing**, actual Multer `.none()` multipart parsing, parser-generated statuses/headers, or HTTP connection behavior: not tested because those dependencies were not available in the isolated runtime.
- Body-parser/Multer diagnostic errors or their status properties in the installed dependency versions were *simulated*, not independently established.
- Live `Cache-Control` precedence, malformed request delivery to middleware, router authorization/contract behavior, complete route coverage or installed/Render acceptance: not tested.

**T06 full acceptance remains OPEN.** Its central-handler sanitization and no-store subchecks have passed in an isolated simulation only. Do not classify T06 as fully passed or infer no source revision will ever be needed from this bounded result.

## Remaining T06 integration verification

In an authorized isolated installation with the correct project dependencies, send intentionally malformed synthetic JSON, URL-encoded and multipart POST bodies against representative sensitive API endpoints, and separately an unrelated public endpoint. Assert actual HTTP status, fixed safe error JSON, absence of synthetic sensitive strings in response/logs, and `Cache-Control: no-store` for sensitive paths. Verify route/auth behavior is not bypassed; no real credentials or database writes. Record dependency versions, expected test database identity if the app must start, and deployment commit. Do not run this against production.

## Installation / retention

This evidence ZIP contains only a **new offline test source**, test results and checksum manifest. It does **not** modify `server.js` or replace the earlier R16-75 correction package. The test source may be placed manually under `wonderfulApp/tests/`; both evidence documents under `wonderfulApp/docs/` and the manifest under `wonderfulApp/change/`. Preserve existing T01–T05 bounded results; do not rerun them solely because this evidence was generated.
