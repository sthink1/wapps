# Wonderful Apps — R16-75-T07 Offline Evidence

Date: November 14, 2026  
Classification: **TEST-PASS-BOUNDED** (synthetic, isolated offline verification)

## Objective

Preserve compatibility of the existing catch-all HTTP 404 route, direct authentication HTTP 401 handling, browser-only HTTP 403 access control, subscription HTTP 403 denial payload and positive authentication/entitlement continuation after the proposed R16-75 central-error-handler correction.

## Source basis and scope

- Proposed corrected `wonderfulApp/server.js`, SHA-256 `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- Read-only source copies of `middleware/auth.js` and `middleware/subscriptionAccess.js` retrieved from the authoritative WA project for review; mocked imports simulate the token verifier, database pool, subscription service and administrator verifier.
- Test extracts the unchanged catch-all handler from the proposed server source and executes **the actual middleware function bodies** within controlled JavaScript sandboxes. No server startup, application credentials, database, network or Render deployment was used.
- The synthetic `TOKEN_INVALID` and `SUBSCRIPTION_REQUIRED` codes reflect **mocked** verifier/service outputs; their particular labels were not certified as live production responses.

## Execution

`node --test tests/stage6.r16-75.t07.offline.test.js`

Results: **7 tests passed; 0 failed.** See original TAP output in `docs/WA_R16-75_T07_TAP_2026-11-14.txt`.

| Check | Finding | Result |
| --- | --- | --- |
| T07-A | Catch-all: 404, exact flat `{error:"Endpoint not found"}`, URL omitted in log | PASS |
| T07-B | Missing bearer: existing flat 401, no next | PASS |
| T07-C | Verifier rejection: 401 with verifier-provided error code, no next | PASS |
| T07-D | Native client token rejected on web route: flat 403, no next | PASS |
| T07-E | Subscription denial: 403, `error`, `reason`, `app` retained, no next | PASS |
| T07-F | Mocked valid web token and entitlement allowed: no error response, invokes next | PASS |
| T07-G | Source registration order and route-level no-store declarations retained | PASS |

## Limitations and residual tests

- This is not a live Express HTTP test; source-extraction and VM-mocked dependencies do not establish deployed server behavior, actual token validity, real administrator authorization, database entitlement decisions, or full `Cache-Control` HTTP headers.
- Route-level no-store is verified as an unchanged source declaration, not as an observed HTTP response.
- T06 remains PARTIAL: actual malformed JSON / URL-encoded / multipart HTTP request parsing has not been tested.
- T08–T12, integrated regression and hosted acceptance remain open. T01–T05 previously passed in isolated scope and were not rerun.
- No proposed source changes were required by T07; the executable test file is new and therefore does not have an original-file `.diff`.

## Handling and installation

The evidence ZIP contains only `wonderfulApp/tests/stage6.r16-75.t07.offline.test.js`, both T07 evidence files under `wonderfulApp/docs/`, and `wonderfulApp/change/SHA256SUMS_T07.json`. It **does not** contain or install revised server or middleware source. Place files manually if desired; retain approved project read-only access rules. Verify all checksums before reuse. To rerun the test, do so on a separately managed isolated WA test copy containing the proposed corrected `server.js`, `middleware/auth.js` and `middleware/subscriptionAccess.js`.
