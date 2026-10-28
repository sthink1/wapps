# Wonderful Apps — Stage 6B-2 Group 1A Hardening (TEST-ONLY CANDIDATE)

## Scope
- Branch: `reviseLogIn`; prior known clean baseline commit `d91d76b` (Group 0a).
- Replace only `httpdocs/js/waPlatform.js` and `tests/waPlatform.unit.test.js` from Group 1.
- Neither file is loaded by existing WA application pages yet.
- No production or test DB migration, no server change, no Render changes, no changes to installed TNNA clients.
- Keep `Stage6B2_Architecture.md`, the Group 1 installation document and 6B-1 inventory unchanged.

## Improvements
1. Failed refresh no longer sends a known-expired access token to the protected endpoint.
2. For an HTTP 401 to a mutating request (POST/PUT/PATCH/DELETE), no automatic refresh or request replay: the caller receives the original 401. A caller can explicitly request a new session and ask the user to resubmit safely.
3. GET/HEAD may retry once after an authorized refresh. An original 401 remains unchanged when renewal fails.
4. Caller-supplied Authorization headers are replaced by the active WA session credential.
5. Refresh cannot overwrite a new login created during an in-flight refresh.
6. Explicit logout is recorded at the beginning of logout, preventing automatic concurrent session restoration; normal current-token logout calls `/users/logout`.
7. If logout starts with an expired JWT, it clears local state and reports server revocation UNCONFIRMED (not successful). Group 2 must implement a safe backend-approved revocation strategy for that case.
8. Web Locks continues to coordinate browser tabs sharing one origin. No lock -> fail closed. Existing 8-hour access and 180-day remembered server policy unchanged.

## Install (local only)
1. Back up both existing Group 1 files. Confirm `git branch --show-current` is `reviseLogIn`.
2. Copy the two files from this ZIP to their corresponding relative locations in `C:\AppProjectwDB\WonderfulAppsRender`.
3. Run from the project root:
   ```powershell
   node --check httpdocs/js/waPlatform.js
   node --test tests/waPlatform.unit.test.js
   git status --short
   ```
4. All 18 tests should pass. Stop and share diagnostics if any fail. No production database, Render test instance, or live TNNA app should be touched.
5. Do NOT run `git add .`, `git commit`, Sync Changes, or push until we review results and the forthcoming browser integration plan.

## Known limitations / gates for Group 2
- The mock-based tests are not real Chrome two-tab / browser restart tests, and do not cover live backend or SQL. Test in actual browser before integrating Home/Login.
- The ordinary login's access JWT remains in `localStorage` for legacy compatibility and can survive restart for up to eight hours. Server session lifecycle remains authoritative.
- A Web Locks API capable, secure-context browser is required for refresh; no automatic refresh on unsupported browsers.
- No script is yet loaded by any page. The `WA.session.setAccessToken()` interface is ready for login integration but *not yet wired in*.
- Do not treat a failed `/users/logout` call or expired-token logout as confirmed server revocation. The refresh cookie might remain until the server clears it or it expires. This requires a server/API contract decision before real logout integration.
- Do not use this module to bypass existing Family Tree-specific privacy request headers or native TNNA authentication.
- Unit tests do not replace review of credential-family replay policy or the independent security-design review before production.

## Rollback
Restore your backed-up Group 1 copies of the two files. No database rollback required.
