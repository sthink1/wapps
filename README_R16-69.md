# Wonderful Apps — R16-69 Tracking Provider Error Sanitization

**Source baseline:** `reviseLogIn` commit `d8c53b0ec99e4ada41dc6a54deb6d9da740f8605`, GitHub blob SHA `e5bb0889cfc840ded1f81ce5e2679401d4973ad0`. The Google Drive copy was byte-verified against that Git blob before editing.

## Purpose and scope

R16-68 isolated testing confirmed that three catch blocks in `routes/track.js` place unexpected exception messages into administrator-only dashboard response notes (four rows because Resend appears twice). R16-69 replaces only the three note expressions with fixed, useful messages. No other source edits are intended. HTTP routes, admin checks, counters, providers, SQL, response shape, and successful calculations are unchanged.

## Installation (user action only)

1. Back up the existing local `routes/track.js` yourself if desired; do not overwrite any unrelated changes without reviewing them.
2. Replace your local `routes/track.js` with `routes/track.js` from this ZIP.
3. Copy the new test into `tests/stage6.r16-69.track-provider-error-redaction.offline.test.js`.
4. Run the commands below using the **local** project in PowerShell. No database is required for these isolated tests.

```powershell
node --check routes/track.js
node --check tests/stage6.r16-69.track-provider-error-redaction.offline.test.js
node --test tests/stage6.r16-69.track-provider-error-redaction.offline.test.js
git diff --check
git diff --stat
git status --short
```

Expected: all six focused offline tests pass; source diff contains exactly three note substitutions. Informational CRLF warnings are not by themselves failures. The test has only sandboxed provider functions and performs no network or database access.

## Acceptance limitations and next step

Offline tests verify that synthetic unexpected exceptions do not enter provider-note response content. They do **not** demonstrate real credential leakage, nor do they prove hosted behavior. Retest one bounded authenticated administrator dashboard read on staging only after reviewing local results and a controlled `reviseLogIn` deployment. Do not touch production or `main`. Previous Stage 6 PASS results remain valid.

**Browser:** Not needed for offline tests. Default to Chrome Incognito for browser acceptance; Chrome Normal will be explicitly requested only when relevant.
