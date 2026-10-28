# Wonderful Apps — Stage 6B-2 Shared Platform Design (review candidate)
Date: 2026-10-24
Baseline: reviseLogIn commit d91d76b (user-confirmed), test database sql5838929.
Status: DESIGN ONLY. No changes to active application code or production.

## Goal
One Wonderful Apps web-platform interface for authenticated API calls, session restoration, refresh, logout and errors, reused by Family Tree, Budget, ETF, and other apps. TNNA retains its separate native credential transport but shares backend validation/revocation policy.

## Verified source findings
- `login.html`: submits `keepMeLoggedIn` at `/users/verify-code`, then puts access JWT in `localStorage`.
- `home.html`: reads JWT from `localStorage`, handles logout locally.
- `changePassword.html`, `track.html`, `subscription.html`, `notificationPreferences.html`, ETF and Budget pages: independently read tokens and call `fetch`.
- Several `httpdocs/js/FT*.js` files build their own Bearer authorization headers. `FTPrivacy.js` additionally wraps window.fetch to add `X-FT-Page-Token`; global fetch overriding must NOT interfere with this privacy behavior.
- `/users/refresh-session`: POST, requires Origin, rotates HttpOnly `wa_refresh` cookie (Path /users), returns `{token}`; 401 `REFRESH_INVALID` on invalid/consumed token.
- `/users/logout`: authenticated POST; revokes current web session, clears refresh cookie.
- `/users/session-status`: authenticated GET, 200 authenticated, else 401.
- Current cookie is only for a user who selected Keep Me Logged In.

## Standard platform facade (proposed)
`window.WA.session.restore()` => Promise<SessionState>; checks existing access token against server and attempts a single refresh only when needed. Does not mint persistence for ordinary login.
`window.WA.session.isAuthenticated()` => Promise<boolean>.
`window.WA.session.logout()` => Promise<LogoutResult>; attempts server revoke BEFORE clearing local token; always removes local credentials; if server could not confirm, reports `serverRevoked:false`.
`window.WA.api.request(path, options)` => Promise<Response>; same-origin WA endpoints only, injects Authorization, preserves FormData/body/headers, and attempts refresh once on HTTP 401. Distinguishes HTTP 403 (not authorized, NOT logout) from 401 (authentication). Must not resend a non-replayable request body.
`window.WA.api.json(path, options)` => Promise<parsed JSON>; standardized API error with HTTP status and server error code.
`window.WA.session.setAccessToken(token)` => validation/transition adapter for login page during migration.

## Key design rules
1. Never override global `window.fetch`. Existing Family Tree privacy wrapper depends on request-specific headers.
2. Preserve `X-FT-Page-Token`, custom headers, multipart uploads, AbortSignal, and app-specific error displays.
3. Attempt session refresh only once per request. Never replay unsafe/non-replayable bodies without an explicit caller choice. Abort and errors remain observable.
4. Keep user data, Family Tree context, budgeting preferences, and subscription status OUT of auth state. Do not erase unrelated localStorage/sessionStorage on logout.
5. Keep current JWT localStorage usage temporarily for compatibility; assess memory-only access tokens for future hardening during hosted review. Refresh secret stays HttpOnly and inaccessible to JS.
6. Refresh is serialized within a tab and across tabs using a proven lease/lock mechanism; do not activate cross-tab replay-family revocation until browser concurrency is safe and tested. Prefer `navigator.locks` where available, with an audited fallback, and broadcast only non-secret session-change events.
7. 403 means authorization denied; it must not automatically clear a valid login. 401 with failed refresh means reauthentication needed.
8. Distinguish explicit logout from offline/network failure. On failed server logout, clear local access and display revocation-unconfirmed warning; do not falsely claim server-side revocation.
9. All browser requests use same-origin by default, `credentials:'same-origin'`; do not send Bearer tokens to third-party URLs.
10. Continue enforcing auth + subscription + per-user authorization on the server. No frontend mechanism substitutes for backend checks.

## Integration sequence
G1: agree on facade and tests; no application edits.
G2: implement shared module with unit tests for 401/403, ordinary vs remembered, interrupted network, abort, cross-tab races, login/refresh timing.
G3: integrate `login.html`, `home.html`, `changePassword.html`, `subscription.html`, `notificationPreferences.html`, `track.html` with complete-file changes.
G4: integrate Budget wrappers and shared tracking without changing calculations.
G5: integrate ETF wrappers without changing investment algorithms.
G6: integrate Family Tree modules, preserving privacy headers, images, relationship controls, and consent workflows.
G7: integrate other pages as warranted by exact call-site audit; passive pages are regression-only.
G8: replay-family revocation backend changes after concurrency mitigation; MySQL test-only migration if necessary.

## Test matrix
- Checked vs unchecked persistence, browser restart, no cookie, expired cookie, 180-day sliding and 365-day cap.
- 401→one refresh→one retry; repeated 401→login; 403 preserves session; 5xx/network shows retry error, not false logout.
- simultaneous tabs and requests; no legitimate concurrent refresh mistaken for theft.
- logout success/failure, server-side invalidation, cross-tab UI consistency.
- password change and reset revokes web/TNNA credentials; hostile/replayed token handling.
- Budget CRUD, ETF API, Family Tree privacy `X-FT-Page-Token`, upload/FormData, subscription/track access.
- service restart, Chrome/Firefox/Edge, HTTPS staging, mobile browsers, installed TNNA offline compatibility.

## Safety gates
- No existing file replacement until compare of authoritative Drive snapshot with local commit d91d76b.
- `.env.test` only; test DB sql5838929; existing devices, Render production, production DB unchanged.
- Stage 6B then 6C, separate Render HTTPS test service, 6D full acceptance, independent design engineer review, explicit approval before merge/deploy.
- Existing Stage 6A / Group 0a tests remain baseline and must keep passing.

## Open technical decisions before implementation
- Precise policy for retrying non-idempotent POST/PATCH/DELETE when 401 is returned (recommended: retry only after evidence request was rejected before business mutation, and body replayable).
- Cross-tab lock fallback when Navigator Locks API unavailable; tests required before replay-family response changes.
- Access-token storage policy and legacy `localStorage` migration.
- Whether API helpers return raw Response or parsed JSON in each legacy caller and how to preserve domain error messages.
- Which routes are public (e.g. verification/unsubscribe) and must bypass authenticated wrapper.
