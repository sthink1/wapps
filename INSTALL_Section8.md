# WA Group 0a — Section 8 HTTP Concurrency Test (test only)

This is a **test-only candidate**. It has been checked for JavaScript syntax, **not executed against your local server**. It tests a batch of concurrent HTTP calls, rather than deterministically forcing a particular DB lock order. The earlier two-connection MySQL lock test complements it.

## Prerequisites and safety

- Branch `reviseLogIn`, local WA server listening at `http://localhost:8080`, connected to `sql5838929` through `.env.test`.
- Account `charter` must be UserID 62. Know its current password and have access to verification emails.
- **Backup the test database before running.** This script deliberately changes `charter`'s password to a temporary password and attempts to restore the original password after checks. This revokes all `charter` web sessions and TNNA refresh tokens and modifies test audit/device/verification rows.
- Do not use this on production, with another account, or against your installed TNNA phones.
- If the script fails after the password change, the temporary password may remain active. The script reports this clearly. Retain that password until you restore it in WA's normal change-password flow; do not rerun blindly.
- Test is intentionally **not** a release/security certification. It does not force all possible transaction schedules.

## Install

Extract this ZIP at `C:\AppProjectwDB\WonderfulAppsRender`, preserving `tests\group0a.http-concurrency.local.js`. No existing project code is replaced.

## Run

Terminal 1:

```powershell
node --env-file=.env.test server.js
```

Terminal 2:

```powershell
node --env-file=.env.test tests/group0a.http-concurrency.local.js
```

The test asks for an explicit consent phrase, current and temporary passwords (hidden), and four consecutive emailed six-digit verification codes (hidden). **Do not post passwords, codes, cookies, or tokens in ChatGPT.** Wait for each code; submit only its digits at the prompt. Run the script in an interactive Windows PowerShell terminal in VS Code; the hidden-input routine requires a TTY.

The script prepares a remembered web session, a TNNA refresh token, and pending web and TNNA challenges. It simultaneously dispatches five HTTP calls: web password change plus web/TNNA verification and web/TNNA refresh. After a successful password change, any JWT received before or during the race must fail authorization with 401 and every observed refresh credential must fail rotation with 401. A success response to a contender before the password change is **not automatically a failure**; *continued authorization after the change* is the failure.

The script then obtains an additional verification code with the temporary password and **attempts** to change it back to the original password. So you may receive **five** separate emails in total.

Report the `PASS`, `FAIL`, and `COMPLETE` lines only. If a `FAIL` occurs or password restoration does not succeed, stop and report it. Do not commit/push or deploy.
