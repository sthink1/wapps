Wonderful Apps — Stage 6 R16 exception log diagnostic v2

This diagnostic replaces the earlier exception-log-isolation test; do not run both together as the old test is expected to fail in the observed environment.

Copy tests/stage6.r16.exception-log-diagnostic.offline.test.js to the project tests folder yourself. Do not overwrite or edit existing project files using ChatGPT.

Run:
node --test .\tests\stage6.r16.exception-log-diagnostic.offline.test.js

Only fabricated synthetic markers are used. Existing logger.js is read-only. Separate child processes simulate uncaught exception and unhandled rejection. Paths are redirected in memory to a temporary OS sandbox; all temporary output is cleaned after the test. No HTTP listener, DB, network, real credentials, or project-file mutations.

Reports log-file presence and size, marker presence in isolated file and child output, and exit status; it never prints actual exception text or secrets. A diagnostic PASS means the probe ran, not that the logging system is secure. The existing rejection disclosure has already been reproduced.
