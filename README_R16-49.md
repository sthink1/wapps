# Wonderful Apps — R16-49 Refresh-Session Error-Response Diagnostic

Source baseline: `reviseLogIn` GitHub commit `18e759e` (November 10, 2026).

This **offline-only** test reads the project's existing `routes/users.js` and executes **only the `router.post('/refresh-session',...)` declaration** in a Node.js VM with mocked `sessions` and `router`. It does not start Express, connect to the DB, use or print real secrets, or call any endpoint.

## Install

Unzip into the WA root `C:\AppProjectwDB\WonderfulAppsRender` preserving `tests/`.

## Run

`node --test tests/stage6.r16-49.refresh-error-response.offline.test.js`

## Expected with reviewed source (18e759e)

- R16-49A/B: existing 401 and 403 messages retained — PASS.
- R16-49C: unclassified error uses generic 503 — PASS.
- R16-49D/E: intentionally test *security requirement* that an unexpected error carrying status 500 or 503 does not expose the exception message. **These are expected to FAIL with the reviewed current handler** because it currently returns `e.message` for any truthy `e.status`. This is a synthetic, source-level behavior finding, **not evidence that a real production exception has exposed secrets**.

**Expected baseline: 5 tests, 3 pass, 2 fail**. If results differ, report them rather than assume a pass/fail.

A subsequent user-approved change may address this by preserving the explicitly allowed 401/403 messages while returning a fixed public error for 5xx. Do not modify the project as part of running this test.
