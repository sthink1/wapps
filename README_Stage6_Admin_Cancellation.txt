# Wonderful Apps Stage 6 — Cancel Pending Administrator Transfer

Scope: revised files for installation by the user on `reviseLogIn` only. No production or Render changes. This package supplements (does not replace) the Stage 6 Dual Verification package.

## Complete replacement files

- `routes/adminManagement.js` — adds POST `/admin-management/cancel`, requires existing web authentication, same-origin request, unguessable transfer token, original initiating session, configured Render username matching the original administrator, and live DB administrator designation. Locks transfer row and appends a `CANCELLED` audit record in a transaction.
- `httpdocs/SubControl.html` — adds Cancel Pending Transfer button and displays current administrator status (`#adminCurrentStatus`). Cancel is available only while Render still identifies the original administrator. Browser removes the session-stored token on successful cancellation.
- `tests/stage6.admin.dual-verification.offline.test.js` — retains original 15 cases and adds 7 cancellation tests.

## Important behavior

To cancel: Prepare a transfer, but **before changing Render's ADMIN_USERNAME**, click Cancel Pending Transfer. If Render has already been changed, restore its ADMIN_USERNAME to the original administrator and wait for service restart **before** cancelling. Cancelling while Render still points at the target is rejected (409), to prevent leaving no matching administrator. Completed transfers cannot be cancelled. No SQL changes are needed: existing `AdminTransferStateT.CancelledAt` and `AdminTransferAuditT` are used.

## Install and test

1. Inspect `git diff -- httpdocs/SubControl.html routes/adminManagement.js` and save local backups as desired. The package's SubControl.html includes the `#adminCurrentStatus { display: block; }` fix already verified by the user.
2. Copy only the three full files to their matching paths in the local project. Other project files stay unchanged. Do not copy files into Google Drive or production.
3. Run `node --test tests/stage6.admin.dual-verification.offline.test.js`; expected **22 pass, 0 fail**.
4. With the existing safe `.env.test` and database configuration, run the local integration tests only after reviewing the file diff. Keep `ADMIN_USERNAME=sthink`. Avoid changing Render during cancellation checks.
5. If testing UI: Prepare target 42 while logged in as `sthink`, then Cancel Pending Transfer. Verify the pending state row has `CancelledAt` set, a new `CANCELLED` audit row exists, and `UsersT` flags remain unchanged. Use only the test DB.

## Offline test evidence

Node v22.16.0 in isolated working sandbox: 22 pass, 0 fail. Existing project regression suite and MySQL integration have **not** been executed with these revisions here. The user's project uses a different Node version; repeat tests there. No commit performed.
