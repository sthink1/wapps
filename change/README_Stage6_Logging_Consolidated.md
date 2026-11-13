# Stage 6 — Consolidated Server-Side Logging Security Revision

**Status:** Proposed change set, syntax-checked; NOT runtime-tested or deployed.

Source: authoritative Google Drive `wonderfulApp` project JavaScript files; reviseLogIn branch as provided by user.

## Scope

Change only server-side log messages, retaining routes, responses, persistence operations, validation and authentication flow. Replace raw exception text, stack trace, request bodies, PII and dynamic token-bearing data with stable diagnostic messages.

Files modified: `utils.js`, `send_email.js`, `users.js`, `passwordResetRateCleanup.js`, `usageActivity.js`, `geocode.js`, `ftPrivacy.js`, `familyTree.js`, `weights.js`, `dbConnection.js`, `track.js`, `interestEarned.js`, `weightActivities.js`, `etf.js`.

The previously committed `server.js`, `morgan.js`, and `logger.js` are intentionally NOT replaced by this revision.

## Known limitations and caveats

- This is a source-level scan of root-level and routes/services/middleware JavaScript, not a full dynamic audit of arbitrary dependencies, native runtime logs, client-side browser logs, or Render's inaccessible filesystem.
- The generic logging loses some diagnostic detail. HTTP status, event context and startup progress remain; error details should be retrieved only through separately controlled diagnostics if required.
- Other application route HTTP responses may still include raw error messages; this change does NOT alter browser-facing behavior. Review separately.
- Original historical logs are not rewritten or deleted.
- No SQL changes.

## Installation (AFTER examining file-by-file diffs)

1. Preserve a copy of the current reviseLogIn working tree and confirm it has no unrelated changes.
2. Place each revised file in its matching project directory: `routes/` for route files, `services/` for service files, root for `utils.js`, `send_email.js`, `dbConnection.js`.
3. Review `git diff --check` and `git diff -- <files>`; run `node --check` on every modified JS.
4. Test localhost with `.env.test` and HelioHost `wapps_test` only. Test representative error scenarios with fabricated input; verify logs have useful labels without raw details; ensure normal WA operations work.
5. Commit only after verification, then manually deploy to the test Render service and run targeted regressions. No production deployment or main merge.

## Do not confuse test status

The earlier targeted URL logging correction at commit `8fa035f` passed local logging tests and hosted H01–H04. **This new consolidation has NOT been tested** and is NOT included in `8fa035f`.
