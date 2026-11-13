Wonderful Apps — Stage 6 R16 Safe Fatal Logging (November 4, 2026)

Contents:
  logger.js — COMPLETE revised file, based on current authoritative Drive copy.
  tests/stage6.r16.safe-fatal-logging.offline.test.js — isolated regression tests.

Purpose:
  Prevent raw uncaught exception and unhandled Promise rejection messages, stacks,
  and associated objects from reaching Winston fatal log files or process stderr.
  Write fixed details-omitted diagnostic lines to exceptions.log/rejections.log,
  plus fixed stderr messages. Preserve normal Winston error/combined/console logging.
  Fatal failures still terminate with exit code 1, consistent with Winston's
  default exitOnError behavior.

Scope and caveats:
  - This protects the two process-level fatal event paths only. Ordinary calls to
    logger.info/error and other direct console calls still require source auditing.
  - Non-Winston process handlers, Node runtime flags, operating-system diagnostics,
    or third-party instrumentation can behave differently; these tests do not
    certify every logging or error-response path.
  - Changing the fatal handler implementation is behaviorally significant. Review
    before installation; do not deploy to production.
  - Test temporary files are created under the operating-system temp directory,
    not the Wonderful Apps project, then removed.
  - Node tests use the installed Winston package from the project's node_modules.

Manual installation (user performs all changes):
  1. Verify branch reviseLogIn and review git status.
  2. Back up the current logger.js outside tracked project files, as preferred.
  3. Compare revised logger.js with current local version. Do not overwrite
     local changes that were not in the Drive copy used for this package.
  4. Copy logger.js into WA project root and the test file into tests/.
  5. Run:
     node --check .\logger.js
     node --check .\tests\stage6.r16.safe-fatal-logging.offline.test.js
     node --test .\tests\stage6.r16.safe-fatal-logging.offline.test.js
     git diff --check
  6. Run previous R08/R16 offline regressions; review git diff before commit.
  7. Commit/deploy ONLY after reviewing test results; staging only.

Rollback: Restore the previous logger.js from the version-control commit.
Do not merge into main, touch production, or change the TNNA app.

Test success means fabricated credentials are ABSENT, both fatal paths produce
fixed markers, fatal exit codes are retained, and normal Winston logging works.
