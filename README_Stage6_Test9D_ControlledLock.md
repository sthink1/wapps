# WA Stage 6B — Test #9D Controlled Cross-Tab Refresh (Version 2)

**Scope:** LOCAL `http://localhost:8080` with `.env.test` and previously verified test database `sql5838929` only. No application, SQL schema, database records by manual intervention, Git, Render, or TNNA modifications. The ordinary server-side refresh endpoint will perform its normal test-session token rotation.

## Why this version

The first BroadcastChannel timer test had no overlapping calls (Tab 1 completed before Tab 2 began). This version temporarily holds the application's **existing** named Web Lock `wa-web-refresh`, deletes only `localStorage.token`, and starts `WA.session.restore()` in both tabs while the lock is held. It then uses `navigator.locks.query()` to measure queued lock requests before releasing the gate. The expected outcome is **two restoration operations pending, but only one actual refresh HTTP call**. It does **not** try to force two competing cookie rotations.

## Prerequisites

- **Chrome Normal (non-Incognito)**, two tabs in the same Chrome profile, each showing `Logged in as: charter` after a recent KMLI login.
- The local test server remains running with `.env.test` and verified test database.
- Don't run the old `Stage6_Test9D_Console_Arm.js` in either tab; reload both tabs once to clear any old Console scripts before proceeding.
- Do not run the test on a hosted site or production user account.

## Procedure

1. Open F12 > Console on Tab 1. Paste the complete `Stage6_Test9D_ControlledLock.js` and press Enter. Confirm `READY`.
2. Repeat in Tab 2, and confirm `READY`. Chrome may require its standard permission step for Console pasting.
3. In **Tab 1 only**, run `__waControlled9D.start()` once. Do not refresh, navigate, or click Logout during the test.
4. On Tab 1, look for `LOCK EVIDENCE` and `SUMMARY`. In both tabs, look for `RESULT`.
5. Review Network > Fetch/XHR, filter `refresh-session`; note **only HTTP status and count** for each tab, never request headers, responses, token values, or cookies.

## Pass criteria

- The test logs `entered=2`, with `pending>=2` and `held>=1` at the lock snapshot.
- Both participants report `authenticated=true`.
- One participant normally reports `restored=true` and the other `restored=false` because it reuses shared storage.
- **Exactly one** successful `refresh-session` request (HTTP 200) is observed across the two tabs for the run, and no 401/replay conflict occurs.
- Both Home tabs remain authenticated as `charter` (their already-rendered UI is not a fresh server revalidation; if uncertain reload *after* saving results).

If pending <2, two results aren't seen, any participant isn't authenticated, or more than one refresh HTTP request occurs, mark **inconclusive/fail** and stop; share only sanitized status/count and summaries.

## Limits and cleanup

This controlled gate **proves simultaneous pending restoration calls competing for the same lock**, not simultaneous HTTP token rotations—the lock should prevent those. The synthetic missing-token condition is not genuine 8-hour JWT expiration; **Test #8B remains separate** and should not be marked passed by this result.

To disarm a tab: `__waControlled9D.close()`; or close/reload the tab. No server changes are needed. This code is meant only for the Chrome Console and should **not** be loaded by any WA HTML page or shipped to users.
