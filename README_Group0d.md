# Wonderful Apps — Stage 6, Group 0d: environment isolation

**Package state:** Draft for local installation and testing on `reviseLogIn`, based on Google Drive's October 18 source snapshot. It is **not** a production build or a production deployment package. No database schema or data changes.

## Scope and changed files

| Destination relative to `WonderfulAppsRender` | Operation | Purpose |
|---|---|---|
| `services/stage6Environment.js` | NEW | Mandatory test-only environment contract; validates origin/mode/database, exposes cookie policy, checks connected DB/UTC |
| `server.js` | REPLACE | Start guard before imports; CORS credentials only from configured browser origin; wait for DB verification before listen |
| `dbConnection.js` | REPLACE | Export startup `ready` Promise; keep existing UTC session configuration |
| `services/browserSession.js` | REPLACE | Secure cookie based on `WA_ENV`, exact configured origin; preserve remaining session logic |
| `services/passwordResetLimiter.js` | REPLACE | Replace NODE_ENV blocker with the shared strict test-only contract; keep limiter logic unchanged |
| `services/passwordResetRateCleanup.js` | REPLACE | Replace NODE_ENV blocker with the shared strict test-only contract; keep cleanup behavior unchanged |
| `tests/group0d.environment.test.js` | NEW | Offline no-DB, no-email environment-contract tests |

## Critical restrictions

- `WA_ENV=local` requires `DB_NAME=sql5838929`, `APP_PUBLIC_ORIGIN=http://localhost:8080`, `WA_ALLOWED_ORIGINS=http://localhost:8080`; `NODE_ENV` unset or `development`.
- `WA_ENV=staging` requires `NODE_ENV=production`, `DB_NAME=sql5838929`, a **single explicit HTTPS** staging origin in both `APP_PUBLIC_ORIGIN` and `WA_ALLOWED_ORIGINS`.
- `WA_ENV=production` **always fails startup**. Production enablement is not part of this deliverable.
- The actual connected MySQL DB and connection UTC zone are verified *before* opening the HTTP port. No SQL writes are performed by this verification.
- Existing native/public CORS allowlist is preserved for non-credentialed requests; it does **not** grant cookie credentials from those origins. `capacitor://localhost` native APIs continue using their existing bearer/body contracts. Hosted legacy-origin permissions should be reaudited before the production phase.
- Group 0d does not solve reset limiter proxy-IP, issuance races, refresh replay, CSRF custom header, password changes or TNNA compatibility. These are later groups. This package does not create a Render test service.

## Installation — after reviewing files

1. Confirm active branch with `git branch --show-current` and latest local baseline commit `ae8bd30` or its reviewed descendant. Confirm full project backup.
2. Copy complete package files to their paths above, keeping **a backup of the six current destination files**. Do not copy backups/_COPY into production folders.
3. In the **ignored** local `.env.test` only, add `WA_ENV=local` and `WA_ALLOWED_ORIGINS=http://localhost:8080`. Keep the existing `DB_NAME=sql5838929`, `APP_PUBLIC_ORIGIN=http://localhost:8080` and existing secrets unchanged. Do not paste secret values into chat or Git.
4. Run the offline test, from `WonderfulAppsRender`: `node --env-file=.env.test --test tests/group0d.environment.test.js`.
5. Run syntax checks with `node --check` on each changed `.js` file. No database operations occur during syntax checks.
6. Start only the test server: `node --env-file=.env.test server.js`. Confirm the console reports `test DB verified`; if the server refuses to start, stop and send **redacted** error text. Never run `node server.js` without the approved test environment.
7. Inspect `git diff --stat`, `git diff --check`, and `git status --short`. Do not commit Group 0d until local behavior is reviewed.

## Hosted staging parameters — future, not applied now

`WA_ENV=staging`, `NODE_ENV=production`, `DB_NAME=sql5838929`, `APP_PUBLIC_ORIGIN=https://<actual isolated Render hostname>`, `WA_ALLOWED_ORIGINS` set to the exact same origin. The service must have isolated secrets and email safety settings. **Do not invent a hostname or deploy without explicit approval.** Verify Render proxy/IP and HTTP-only cookie behavior at hosted acceptance.

## Boundary and cautions

- This package has no live Windows repository access and cannot assert it matches the `ae8bd30` local commit byte-for-byte. Review diffs carefully against your checked-out baseline before copying.
- The `dbConnection.js` bootstrap Promise now requires waiting for `ready` to avoid listening before its check; any other scripts that import `dbConnection.js` but ignore the promise may still operate under their existing model and are outside this group's service-start scope.
- Staging is HTTPS and Secure-cookie; local HTTP is non-Secure intentionally.
- The single-origin configured policy is intentionally strict for cookie-authorized routes. Existing cross-port local frontend development will not work for refresh until a reviewed design is approved.
- The existing `SameSite=Lax`, HttpOnly and `/users` cookie scope remain unchanged.
- Separate external final engineering review, hosted acceptance, staging creation and all production operations remain gated by approval.
