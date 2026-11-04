Wonderful Apps Stage 6 R16 — Offline safe-fatal-logging test V2

Purpose: Correct the ordinary-logging test synchronization. The original test
called logger.end() and exited on the logger finish event, which can occur
before asynchronous file transports finish their writes. V2 waits until the
expected combined.log and error.log messages are actually present (up to 4s).
It does not weaken the three assertions or modify logger.js.

Install manually: Extract the tests/stage6.r16.safe-fatal-logging.offline.test.js
file and replace that test in your local WA project. Do not replace logger.js.

Run: node --test .\tests\stage6.r16.safe-fatal-logging.offline.test.js

Security: all test strings are synthetic; child processes use temporary
directories and log files, remove temporary files on completion, and do not
connect to a server or database. No WA project log files are modified.

If a test still fails, preserve and report its console output; do not commit
or deploy until the failure has been diagnosed.
