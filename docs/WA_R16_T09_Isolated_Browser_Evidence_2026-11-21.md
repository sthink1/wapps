# Wonderful Apps — R16 T09 isolated browser-response evidence

**Date:** 2026-11-21  
**Status:** FAIL for nested error presentation in isolated browser simulation; full hosted T09 remains OPEN.  
**Browser:** Headless Chromium 144.0.7559.96 (Linux test container).  
**Source examined:** Authoritative Google Drive `httpdocs/Weights.html`, shared `httpdocs/js/waPlatform.js`, `routes/weights.js`, and `server.js` (read-only).  
**Browser operation:** An isolated harness reproduces the source-inspected `waLocalPath`, `waOptions`, `authenticatedResponse`, and `makeAuthenticatedRequest` logic, with a mocked `WA.api.request` returning synthetic browser `Response` objects. For the sandbox origin, the harness substitutes a fixed synthetic origin instead of `window.location.origin`. It does not execute the full hosted Weights page or the real shared WA client implementation.

## Individual observations

| Synthetic response | Observed status/message | Bounded outcome |
|---|---|---|
| HTTP 400 `{ "error": { "message": "Safe synthetic validation error", "code": "TEST_NESTED" } }` | `400`, `[object Object]` | **FAIL**: nested error rendered as object string |
| HTTP 400 `{ "error": "Safe synthetic validation error" }` | `400`, `Safe synthetic validation error` | PASS (isolated flat-response behavior) |
| HTTP 401 nested body | `401`, `Please log in to use Weights.` | PASS (isolated status message) |
| HTTP 403 nested body | `403`, `Your subscription does not include Weights.` | PASS (isolated status message) |
| HTTP 200 `[]` | `200`, `[]` | PASS (isolated success-path recovery) |

**Transport inventory:** Five mocked calls to `/weights/search?weight=123.4`, all `GET`. No real network calls to WA or any database, no credential transfer, no server errors induced, and no writes to protected project locations. These are mocked calls, not recorded network requests.

## Root cause / limitation

`makeAuthenticatedRequest()` constructs an error from `details.error || fallback`, without validating that `details.error` is a string. The browser's `Error` constructor stringifies a nested error object to `[object Object]`. The real `WA.api.json()` parser separately supports nested messages, but the Weights search consumer calls `WA.api.request()` and performs its own parsing. The central server can format nested errors; however the normal `/weights/search` validation path uses flat 400 responses. An actual safe, deterministic server-produced nested-error stimulus for this business page has not been established.

**Not established:** End-to-end hosted T09 outcome, real 401/403 session retention, UI screenshot/alert handling, actual server error privacy, service worker behavior, and true network recovery. Previously accepted T09 flat, T10 no-replay and T12 offline results must not be reopened because of this isolated result.

## Next controlled step

Retain the nested-response defect as a source-supported, browser-reproduced issue. Under Step A, agree on a minimal correction to the `Weights.html` error adapter and its exact acceptance criteria, or an explicitly controlled browser-only response override for end-to-end UI evidence. No correction, installation, staging change, deployment or database operation is authorized or executed by this test. Preserve the November 21 One Tree deferral and unresolved M03 release-security findings.
