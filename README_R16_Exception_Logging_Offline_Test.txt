Wonderful Apps — Stage 6 R16 — Diagnostic exception/rejection log probe
November 4, 2026

GOAL
Check whether the existing Winston logger.js persists a deliberately fabricated
secret in exception or rejection logs. This is a source-behavior diagnostic,
NOT a fix and NOT evidence that a real secret has leaked.

CONTENTS
tests/stage6.r16.exception-log-isolation.offline.test.js

INSTALLATION (user performs installation)
1. Inspect this ZIP.
2. Extract the test file into the existing WA project's tests folder on
   branch reviseLogIn. Do not modify logger.js.
3. In the project's PowerShell terminal, execute:

   node --test .\tests\stage6.r16.exception-log-isolation.offline.test.js

   Note: the test depends on the project's existing winston installation.

SAFETY
- Reads the original logger.js.
- Performs exact path substitution only in an in-memory copy; requires exactly
  four file-transport destinations. This prevents writes to WA/logs.
- Deliberately crashes child processes only, never the WA server.
- Creates isolated logging files only in OS temporary directories and removes
  them afterward. It does not alter the WA project, database, or Render.
- Fake markers only. No actual passwords, API keys, JWTs, or email addresses.
- The probe never prints marker values or log contents to the console.

INTERPRETATION
Expected with the current source: TWO PASS results, each printing
'YES — RISK REPRODUCED'. A PASS means the test detected that a fabricated
secret was written to an isolated log, NOT that the logger is secure.
If the test fails or says 'NOT REPRODUCED', review the full nonsecret test output;
do not infer safety from a changed behavior without inspecting the cause.

This does not inspect actual hosted logs. Do not intentionally crash Render.
No source-code correction is included in this ZIP.
