# Wonderful Apps — Stage 6B-2 Group 1

**Status:** isolated candidate shared platform module, NOT integrated. Date: 2026-10-24.

## Files
- `httpdocs/js/waPlatform.js` — shared browser authentication/API facade.
- `tests/waPlatform.unit.test.js` — independent Node test suite; uses mock HTTP; no database.

## Scope and non-actions
This package DOES NOT modify `home.html`, `login.html`, routes, SQL, TNNA, Render, or production. Do not add `<script src="js/waPlatform.js">` to application pages yet. No deployment or Git push. The current WA project and branch remain authoritative; compare before copying anything.

## Controlled local installation (only when you elect to test)
1. Confirm `reviseLogIn`, commit `d91d76b` remains in history and the working tree is clean; retain a backup.
2. Create `httpdocs/js/waPlatform.js` by copying the supplied file, and place the test under `tests/`.
3. Run: `node --check httpdocs/js/waPlatform.js`.
4. Run: `node --test tests/waPlatform.unit.test.js`.
5. If tests pass, inspect `git diff` and `git status --short`. **Do not add it to HTML pages** until a later integration group has tests.
6. To undo only this group, remove the two new files (if you have not added further changes). No schema rollback needed.

## Contract
Global `window.WA.session` exposes `restore()`, `isAuthenticated()`, `logout()`, `setAccessToken(token)`, `getAccessToken()`. `window.WA.api` exposes `request(path,options)` returning a native Response, and `json(path,options)` parsing JSON or throwing `WAApiError` (status/code).

### Intentional limitations and release gates
- This module temporarily keeps the WA-compatible `localStorage` access token. It is NOT a completed XSS defense or final storage-policy decision.
- Session refresh relies on `navigator.locks` for cross-tab exclusion, which is supported in modern secure contexts / localhost; when absent it fails closed and returns a `CROSS_TAB_LOCK_UNAVAILABLE` error. A compatible fallback is an open item.
- Only GET/HEAD without a request body are retried on HTTP 401. POST/PUT/PATCH/DELETE are not retried automatically; their callers require separate recovery UX and tests.
- `logout()` always clears local access state, but its `serverRevoked:false` must be shown as revocation **unconfirmed**, not success. No change is made to the server's cookie on failed logout.
- Non-401 errors do not trigger refresh. 403 does not clear an authenticated session.
- The current backend cookie is scoped to `/users`; only `/users/refresh-session` can use it for renewal.
- The module never globally replaces `fetch`, preserving the Family Tree privacy wrapper.
- The unit tests are pure mocked requests. **They do not test real browsers, the MySQL database, server-side effects, Render HTTPS, or adversarial cross-tab races.** All these remain required before integration/release.
- Existing page logic may not be compatible with `.api.json()` automatically. Integrate one page at a time with full-page regression testing.
- Cross-tab logout consistency, cross-tab refresh broadcast, state races and refresh-token replay revocation remain future hardening tasks.
- Real deployed script must be served from the expected same-origin static root with appropriate no-cache/versioning strategy.

## Observed test run
`node --test tests/waPlatform.unit.test.js`: 9 tests passed, 0 failed in isolated Node mocks on 2026-10-24.

## Next integration candidate
Group 2 should wire the tested facade into a small page group only after inspecting local `d91d76b` versions. Suggested: `login.html` and `home.html` with explicit logout and session-restoration tests. Do not overwrite local files with stale Drive copies.
