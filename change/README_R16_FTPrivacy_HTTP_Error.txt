Wonderful Apps - Stage 6 R16 ftPrivacy HTTP Error Sanitization
Prepared 2026-11-05. Source: read-only Google Drive ftPrivacy.js.

ISSUE
The sendError function returned the raw exception message for any truthy status,
including server errors 500, 502, and 503.

CHANGES
Only sendError in routes/ftPrivacy.js changes. Valid integer HTTP status 400-599
is preserved. Intentional 400-499 messages remain visible. HTTP 500-599 and
malformed/missing error statuses return fixed "Privacy request failed.".
Unexpected server errors log only a fixed message with details omitted.
Privacy operations, redaction, routes, auth requirements and status codes remain
otherwise unchanged.

INSTALL (performed by user only)
1. Confirm you are on reviseLogIn. Do not alter main, production, or TNNA.
2. Compare REVIEW_ftPrivacy.diff with your current routes/ftPrivacy.js.
   If local changes diverge from the Google Drive source, DO NOT overwrite them.
3. Back up current routes/ftPrivacy.js yourself as appropriate, and copy the
   provided complete routes/ftPrivacy.js into your project.
4. Copy tests/stage6.r16.ftprivacy-http-error.offline.test.js to project tests/.
5. From project root, run:
   node --check .\routes\ftPrivacy.js
   node --test .\tests\stage6.r16.ftprivacy-http-error.offline.test.js
   git diff --check
6. Run your existing R08/R16 offline regressions. Review git diff and git status
   before selecting files for a commit. Exclude *_COPY.js and backup files.

LIMITATIONS
Offline tests exercise the real extracted sendError function with simulated
responses, inspect route registrations and hash-check the rest of the file.
They do not connect to the database, send email, exercise full Express
routing or verify hosted privacy flows. No intentional 500 error should be
triggered on staging. No SQL or schema modification is necessary.

ROLLBACK
Restore the prior routes/ftPrivacy.js from your own backup or Git history.
