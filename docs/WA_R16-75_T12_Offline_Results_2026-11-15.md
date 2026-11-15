# Wonderful Apps — R16-75-T12 Offline Preservation Regression

**Date:** November 15, 2026  
**Disposition:** PASS — bounded offline; not hosted or browser acceptance  
**Authorization:** user requested T12. All work was done in a separate temporary test directory; no WA authoritative source, GitHub, Render, production, or database modifications.

## Test intent

Check that the proposed R16-75 central-handler correction and T09 client compatibility correction preserve the previously established R16-55/56 error-disclosure safeguards, and selected R10/R14/R15 session, authorization, app-gating and unsafe-operation expectations. Do **not** repeat or expand R10/R14/R15 hosted acceptance claims.

## Exact test versions

- `server.js` proposed SHA-256: `00b8fe5e521ab65cd41dca62d48968d8739d7282f8b0458f79660d06dd60cc81`.
- `httpdocs/js/waPlatform.js` proposed SHA-256: `57a5aae55188ab89d279dc69466414f14f2b3965b8c17f8f64eeb7d568ecc17d`.
- Shared expected-error service and route sources obtained from the read-only authoritative Google Drive retrievals in this testing continuation.
- Node.js runtime: v22.16.0.

## Executed test suites

| Suite | Automated subtests | Result |
|---|---:|---|
| Existing `stage6.r16-55.unexpected-4xx.offline.test.js` | 9 | PASS |
| Existing `stage6.r16-56.expected-4xx.offline.test.js` | 15 | PASS |
| Corrected R16-75 central-handler tests | 7 | PASS |
| Existing WA shared-client session tests | 19 | PASS |
| T09 compatibility and extra regression tests | 17 | PASS |
| T10 session/mutation tests | 11 | PASS |
| T11 cache/log tests | 6 | PASS |
| New T12 preservation contract guards | 6 | PASS |
| **Total** | **90** | **90 pass, 0 fail** |

The 90 tests ran together in one `node --test` process; the six T12 guards were also executed independently (6/6). The complete TAP outputs are supplied alongside this report.

## T12-specific assertions

- Protected app routes and Family Tree privacy route remain gated by existing authorization and subscription checks.
- `/users`, `/subscriptions`, and `/admin-management` retain the existing route-level no-store policies.
- Browser client preserves cross-tab refresh lock, fail-closed recovery, explicit-logout and account-change protections.
- Browser client preserves same-origin credentials and rejection of automatic replay for mutating requests.
- Central handler discloses approved 4xx messages only for shared-classifier-marked errors and sanitizes 5xx errors.
- Browser client accepts both flat and nested error shapes without changing session and API exports.

## Distinction from prior formal acceptance

- **R10 — previous bounded PASS retained, not repeated.** The offline tests give supporting regression evidence for session and refresh behavior. No home-page interactive browser state or offline restoration tests were rerun.
- **R14 — previous bounded PASS retained, not repeated.** Protected route wiring, selected cache behavior and client 401/403 logic checked offline. No real admin/Standard/expired-account database authorization testing repeated.
- **R15 — previous bounded PASS retained, not repeated.** Route registration and no-replay protections checked offline. No Budget/ETF/Family Tree writes, uploads, subscription status, usage tracking, or browser page lifecycle tests were rerun.
- **R16-55/56 — previously tested safeguards re-executed** in the isolated workspace against the corrected package and source dependencies.

## Source-scope assessment

Comparison of the proposed `server.js` to the previously reconciled Google Drive original found only a new import of the shared error classifier plus a change in the central error middleware. Comparison of `waPlatform.js` to the Drive original found changes confined to `readError()`. Both proposed file SHA-256 checksums match the certified earlier proposal packages. No source replacement is delivered in this evidence-only package.

## Open acceptance requirements

- **T06** remains partial: actual Express/Multer malformed-body integration and real headers must be tested.
- **T08** full HTTP routes involving Budget, ETF, and Users remain bounded/source-only.
- **T10** real browser form edits surviving failure have not been tested.
- **T11** live/hosted response caching, pre-route parser failures and logging have not been demonstrated.
- **T12** is a *bounded regression pass*, not whole-project R10/R14/R15 recertification or final R16-75 hosted acceptance.
- Confirm installed artifact hashes and Render staging deployment identity before hosted testing; do not infer deployment from the offline result.

## Reproduction

From an isolated WA test tree containing the two proposed source files, unchanged route/service dependencies, and the test scripts listed above, run `node --test` on the eight targeted regression files and the existing `tests/waPlatform.unit.test.js`. The full TAP log identifies each executed case. No database or network was contacted.

## Rollback

This archive introduces no application-source change. If the optional T12 test is installed into a test project, remove that new test only to revert this evidence addition. The previous R16-75 and T09 code corrections retain their separately documented original baselines and rollback instructions.
