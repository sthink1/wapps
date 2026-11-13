# WA Stage 6 — R16-64 Family Tree privacy error sanitization

**Source:** `sthink1/wapps`, `reviseLogIn`, baseline commit `436dd79444887c06e142e61210e253e41e1ac7da` (read-only GitHub review plus synchronized Drive source). Date: 2026-11-10.

## Problem and scope

Isolated R16-63B reproduced disclosure of an *unexpected* synthetic exception message carrying `status=400` in `routes/ftPrivacy.js`. This is a source-level problem, not evidence that a secret was disclosed in a real request.

## Changes

Only `routes/ftPrivacy.js` is modified (five changed/added lines). It imports the already deployed `services/stage6ExpectedClientError.js`. Its existing `error()` factory now marks intentionally created application validation errors. The existing `sendError()` helper returns the original message only if the error is marked and the status is 4xx; for unmarked 4xx or 5xx, it returns the existing generic text `Privacy request failed.` while retaining the HTTP status. Other router logic, privacy/approval transactions, key handling, email behavior, and response shapes are not changed.

Added `tests/stage6.r16-64.ft-privacy-error-sanitization.offline.test.js`, with isolated test cases for marked/unmarked 400/403/404/409/429, 500/503, actual route-level expected validation and synthetic unexpected errors, and preservation of private-person protection logic.

**No database, credential, Render, production, or `main` operations are needed to run the offline tests.**

## Installation (by user only)

1. Confirm working branch `reviseLogIn` and review `git status --short` before installing.
2. Extract from the ZIP and copy `routes/ftPrivacy.js` and `tests/stage6.r16-64.ft-privacy-error-sanitization.offline.test.js` into their matching relative paths in `C:\AppProjectwDB\WonderfulAppsRender`, preserving any user backups as desired. Do not copy anything to production or `main`.
3. From that project directory run:

```powershell
node --check routes/ftPrivacy.js
node --test tests/stage6.r16-64.ft-privacy-error-sanitization.offline.test.js
git diff --check
git diff -- routes/ftPrivacy.js
git status --short
```

4. Report the output for review before any commit. The previous 32/32 R16-56 offline tests and hosted PASS outcomes remain accepted; no broad retest is prescribed absent a related regression reason.

## Offline artifact verification

The 11 new tests passed 11/11 under Node v22.16.0 in an isolated copy with the same R16-56 marker implementation. This does **not** prove that the replacement has been installed or that the local full-project or hosted integration works. User should run the test under their installed Node v24 and test on `reviseLogIn` before deployment.

## Non-goals / remaining security scope

- No change to `server.js` routing, database schema, public-token approval semantics, or Person privacy lock.
- The direct `sendNotification` failure 502 response remains unchanged; this is a deliberately authored fixed message and does not expose a caught exception message.
- General route-wide API error sanitization, HTTP cache policy, logging, and final independent engineering signoff remain open under Stage 6.
- Chrome Incognito remains default for browser acceptance; this offline test does not need a browser.
