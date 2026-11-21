# R16 T09 — `httpdocs/Weights.html` Final-Deliverable Verification

**Date:** November 21, 2026  
**Change status:** Step B candidate, awaiting owner installation and Step D acceptance.  
**Scope:** one replacement file, no new operational files.

## Authoritative baseline

- Source: read-only `My Drive/wonderfulApp/httpdocs/Weights.html` (Drive file ID `1_VDYqMNRqP5Buh4kmKHC1Dv3N71UwuLL`).
- Exact source bytes: 80,270.
- Baseline SHA-256: `e605dd4e661ae726eb401473e1399fbb7111e5ab11493549d5a9ea51b9f9d54c`.
- Final ZIP source bytes: 80,654.
- Final SHA-256: `925982a144bba7f54821ba32f37ba2f0cccc27784562c3333ef392e27b0e5c87`.
- Unified diff: `change/Weights.html.diff`.
- Comparison: independently asserted original source replaced by only the approved string-to-nested-message handling block; complete-file comparison and diff verified against final deliverable bytes.

## Approved behavior

- For non-401/403 failed HTTP responses, accepts a nonblank `error` string or an object with a nonblank string `error.message`.
- Rejects other error-value types and falls back to `Request failed (HTTP NNN)`.
- Preserves original 401 login-required and 403 subscription-denied messages.
- Preserves success JSON and 204 success behavior, HTTP status on thrown errors, and existing `WA.api.request` flow.
- No changes to the initial Weights data-loading handler, backend, shared browser code, or other files.

## Executed verification

- Isolated Chromium **144.0.7559.96**, using function source extracted from the **final `Weights.html`**, with a mocked `WA.api.request` response transport and synthetic response objects: **10 of 10 PASS**.
- Cases: nested 400, flat 400, 401, 403, sanitized nested 500, malformed object, null envelope, blank nested message, success 200, success 204.
- Recorded calls: **10 GET** calls to `/weights/search?weight=123.4`; **no POST/PUT/PATCH/DELETE**.
- No requests reached a WA server, its authentication endpoints, or its database. The browser test substituted a fixed origin for `window.location.origin` solely to isolate the extracted helper in `about:blank`.
- Test observations: `change/R16_T09_Isolated_Chromium_Evidence.json`.
- Static code/diff integrity: PASS (exact byte-level replacement assertion, diff generation check).

## Not tested / limitations

- **Not** a real hosted browser-server acceptance pass; no deployed/staging version or test DB identity verified.
- No live session preservation, entitlement interaction, true server-generated nested failure, or full-page integration was executed.
- Synthetic test messages were known-safe; the change assumes the server provides only approved public error text, consistent with current centralized handler behavior.
- Existing previously accepted tests (including R16 T10 and T12) were not rerun and remain accepted.

## Release disposition

One-file Step B candidate: **PASS for isolated feasibility tests, pending owner Step C installation and controlled Step D acceptance**. R16 T09 full real-browser nested-error evidence remains OPEN; never mark this as a hosted PASS based solely on these results.
