# Group 0a — Local browser refresh replay test (test only)

## Scope
- `reviseLogIn` branch, local WA backend at `http://localhost:8080`, launched with `.env.test`, against `sql5838929` ONLY.
- Disposable account `charter` (UserID 62). No production / installed TNNA phones.
- The script never prints or saves cookie/token values. It clears the Windows clipboard after reading.
- It makes two HTTP requests: initial refresh (expected 200), then replay of the consumed cookie (expected 401). It also performs read-only MySQL assertions and reports whether the token family was revoked.
- It consumes/rotates the cookie outside Chrome; Chrome will no longer have the newest credential. Log in again after testing.

## Installation
1. Keep server running under `node --env-file=.env.test server.js`, with `DB_NAME=sql5838929`, `WA_ENV=local`.
2. Extract `tests/group0a.refresh-replay.local.js` into your project `tests/` folder. Do not replace backend files.
3. In logged-in Chrome, open F12 > Application > Storage > Cookies > `http://localhost:8080`.
4. Find the `wa_refresh` cookie, verify HttpOnly and that it exists. **Copy only its Value** into Windows clipboard. Do not send it through chat, paste it into a file, or include it in a terminal command. If Chrome shows the field value, avoid screenshots with the value visible.
5. Immediately run this command from a separate terminal in WA root:
   `node --env-file=.env.test tests/group0a.refresh-replay.local.js`
6. Script consumes clipboard value, clears clipboard, checks account 62 and database identity before any HTTP calls. It checks the current token is unconsumed. If checks fail, no HTTP calls occur.
7. Review output. Do not send any cookies or JWTs. Reauthenticate charter after test.

## Expected outcomes
- Preflight identity and charter token pass.
- Initial refresh 200, replacement token created and old consumed.
- Old-token replay 401 `REFRESH_INVALID`.
- **Current code limitation:** Consumed-token replay does not revoke entire family/session. An implementation change is needed if family-wide replay revocation is an intended Stage 6B requirement. Do not represent a replay 401 as proof of family-wide protection.

## Troubleshooting
- Clipboard invalid: copy the cookie Value (96 lowercase hex characters), not Name, Domain or the `Cookie: wa_refresh=` header.
- No active charter row: cookie may have expired, been rotated, or been revoked. Log in afresh with Keep Me Logged In checked.
- Wrong DB: stop; verify `.env.test` and test server identity.
- Port 8080 unreachable: start the test server.
- The HTTP code is intentionally *not* an automated browser test and does not restore cookies to Chrome.
