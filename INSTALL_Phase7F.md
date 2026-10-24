# WA Group 0a — Phase 7F TNNA test-backend verification

**Test only.** Branch `reviseLogIn`, `.env.test`, and DB `sql5838929`. No production or installed TNNA device changes.

1. Stop any other authentication tests. Start the normal test server in its own terminal: `node --env-file=.env.test server.js`. Confirm `sql5838929`.
2. Extract this ZIP under `C:\AppProjectwDB\WonderfulAppsRender`, so the script is at `tests\group0a.tnna-http.local.js`.
3. In another VS Code PowerShell terminal from the project root, run: `node --env-file=.env.test tests/group0a.tnna-http.local.js`.
4. Type charter's current password at the local terminal prompt. Characters are not echoed (on a true interactive terminal). **If the terminal does not support hidden entry, stop rather than enter your password visibly.**
5. Read the new verification email and type only the six-digit code at the local terminal prompt. Do not paste passwords, codes, or tokens into ChatGPT.
6. Review the PASS/FAIL output and share only those lines.

The test calls actual test-server HTTP endpoints: `/users/login`, `/tnna/verify-code`, `/tnna/refresh`, `/tnna/logout`. It uses a random test-only device ID, verifies rotation and old-token rejection, and logs out the last refresh token. It does **write** disposable `charter` TNNA registration/device/consent/token records to `sql5838929`; it intentionally leaves audit records for review. It does not update existing installed TNNA devices. It does not test password-change races with active TNNA refresh; Group 0a Section 8 remains separate.

**Known limitation:** the native app's refresh token is returned in JSON; it is not an HttpOnly browser cookie. This test must not display credentials and must not run against a non-local URL.
