# Wonderful Apps — Stage 6 R16-28 startup-log sanitization

Date: 2026-11-09
Branch: `reviseLogIn` **only**. No production/main/TNNA deployment.

## Evidence

Nov 9 Render staging log inspection found six Nov 3 entries with the `Stage 6 startup refused:` prefix, exposing a database username and source hostname in driver-originated access-denied error messages. No actual password was shown. User also confirmed successful `test DB verified` startup messages during Nov 3–9.

## Source baseline and exact change

Source: authoritative Google Drive `My Drive / wonderfulApp / server.js` (Drive file ID `11gOV52FOw88yQZ5ZpRE9Ou9YfEjBlIHd`), downloaded read-only for review.
SHA256 of source copy before replacement: `950232855179a1d341d93da1bff1626afa1a0f0d33d5d2fb3e72dcbe3d1e3dcb`.

Only one behavior changes: inside `start().catch(err => { ... })`, the old line

    console.error(`Stage 6 startup refused: ${err.message}`);

is replaced by:

    // Never expose underlying database or startup exception details in hosted logs.
    console.error('Stage 6 startup refused (details omitted)');

The database-ready wait, connected-DB identity guard, listener ordering, pool cleanup and failed-startup `process.exitCode=1` are unchanged. This deliberately removes detailed startup errors from Render logs; troubleshoot with safe error categories in a separately reviewed future change if necessary.

## Files supplied

- `server.js`: complete proposed replacement file.
- `tests/stage6.r16.startup-log-sanitization.offline.test.js`: isolated tests using `vm` and inert fake dependencies, with synthetic markers only. This test does not require server credentials, access the DB or bind a port, or intentionally crash real WA services. The test must reside under WA's `tests` directory to resolve `../server.js`.

## Manual installation: review and test first

1. Confirm the local working branch is `reviseLogIn`. Inspect `git status --short` and check whether local `server.js` matches the source baseline. **Do not overwrite newer or conflicting local edits.**
2. Review `server.js` and compare with the local version. Back up according to your normal practices.
3. Manually copy supplied `server.js` into the WA project root and the supplied test file into the WA project's `tests` directory. These actions are performed by the user, not ChatGPT.
4. In PowerShell from the local WA project root, run:

   ```powershell
   node --check .\server.js
   node --check .\tests\stage6.r16.startup-log-sanitization.offline.test.js
   node --test .\tests\stage6.r16.startup-log-sanitization.offline.test.js
   git diff --check
   git diff -- server.js
   ```

5. Verify the only change to `server.js` is the single diagnostic replacement and comment. If all checks pass and you separately authorize normal staging workflow, test on **staging only**. Do not deliberately trigger database failures on hosted Render; use isolated test evidence and ordinary healthy staging startup observations.
6. **Do not** deploy to `main`, production `wapps`, the production database, or installed TNNA devices.

## Isolated validation performed by ChatGPT

- Node syntax check for both files: PASS.
- `node --test tests/stage6.r16.startup-log-sanitization.offline.test.js`: **4/4 PASS**, using Node v22.16.0 in the isolated generation environment.
- Test coverage: DB-ready rejection, DB identity rejection, pool-cleanup rejection, successful startup. Failures use synthetic fake secrets and assert the output does not contain them, `listen` is not called, and exit code remains 1. Successful startup checks DB identity guard before listening.
- This is not a full integration, hosting or production test. No existing WA project files, GitHub, or Google Drive content were modified.

## Rollback

If you manually installed the proposal and it fails verification, restore the previous reviewed `server.js` from your backup or the exact matching source commit. Do not overwrite unrelated changes.
