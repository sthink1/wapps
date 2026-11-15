# R16-75-T09 — Corrected Client Error Compatibility: Test Results

**Date:** 2026-11-14  
**Target:** Proposed `httpdocs/js/waPlatform.js` `readError()` only.  
**Baseline:** Google Drive original verified byte-for-byte with `reviseLogIn` GitHub file.

## Reproduction of original defect

Using unchanged T09 offline test suite against authoritative original: **8 pass, 2 fail**. Failures were T09-C (nested message) and T09-D (nested code); object coercion produced `[object Object]` as a message and code.

## Corrected source regression

Command run in isolated `wonderfulApp/` test tree:

```text
node --test tests/waPlatform.unit.test.js tests/stage6.r16-75.t09.offline.test.js tests/stage6.r16-75.t09.additional-regression.offline.test.js
```

**36 tests passed; 0 failed.** Breakdown: existing session/auth suite 19/19, original T09 suite 10/10, new supplemental test suite 7/7.

Targeted nested object cases now pass. Flat, empty, JSON null, non-JSON text, and empty-response fallbacks remained compatible. Supplementary scenarios covered nested code, top-level precedence, invalid nested shape, 401 GET refresh limit, 401 POST replay prohibition, 403 non-refresh, and same-origin protection.

## Acceptance interpretation

- **T09 isolated regression:** PASS — 10/10; initial 8/10 failure resolved in proposed source.
- **Additional offline regressions:** PASS — 26/26.
- **Integrated deployed/browser acceptance:** NOT EXECUTED. No claim of deployment or full R16-75 acceptance.
- **T06 actual Express/Multer parser integration:** remains outstanding separately.
- Proposed `server.js` is unchanged by this package.

No authoritative files or services modified.
