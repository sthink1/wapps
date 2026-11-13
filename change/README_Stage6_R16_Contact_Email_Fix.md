# Wonderful Apps — Stage 6 R16 Contact Email Fix

Prepared November 6, 2026. **Candidate files only — NOT installed or deployed.**

## Verified starting point
Source based on the fresh read-only `My Drive/wonderfulApp` `server.js` and `send_email.js` copy reviewed November 6, associated with user-reported `reviseLogIn` commit `ca45524`. Staging demonstrated HTTP 400 with `{"status":"error","message":"message.replace is not a function"}` for numeric contact message.

## Changes (narrowly scoped)
- `server.js`: before handling `/send-email`, reject missing/non-string/whitespace-only required form fields and non-string optional phone; preserve `{status, message}` response format and 400 status for validation. Replace raw caught exception text with a fixed public message. Log only a generic error marker. No change to other routes, middleware or startup.
- `send_email.js`: same type checks when called directly; HTML-escape the five interpolated Contact Us values (name, email, phone, subject, message), preserving newlines as `<br>` in the email HTML. Keep the existing plain-text email, successful response, and provider error handling. No changes to login, password-reset or notification email behavior.
- `tests/stage6.r16.contact-email.offline.test.js`: seven isolated Node test cases using mock Resend; no actual email, DB or network access.
- `REVIEW_Stage6_R16_Contact_Email.diff`: unified diff for inspection.

## Manual installation — user only
1. In `C:\AppProjectwDB\WonderfulAppsRender`, verify `reviseLogIn` at intended revision; review `git status --short` before replacing anything. Do not overwrite newer edits without comparing them to the ZIP diff.
2. Keep personal backup copies outside the tracked project as desired.
3. Copy `server.js` and `send_email.js` to project root; copy `tests/stage6.r16.contact-email.offline.test.js` to `tests/`.
4. Review the diff; execute local checks **before any push or staging auto-deploy**:

```powershell
node --check .\server.js
node --check .\send_email.js
node --check .\tests\stage6.r16.contact-email.offline.test.js
node --test .\tests\stage6.r16.contact-email.offline.test.js
git diff --check
git diff --stat
git status --short
```

5. If local checks pass, run the existing full Stage 6 offline suite to identify regressions. Share results before considering a commit, push, or hosted re-test. No automatic deployment is authorized by this package.

## Expected staging follow-up only after separately approved deployment
Repeat the numeric `message:12345` malformed-request test. Expect HTTP 400 and `{"status":"error","message":"All required fields must be filled."}` with no raw `message.replace` exception. A valid contact email should be tested only with an explicitly approved test recipient to avoid accidental email delivery.

## Limits / considerations
- Only the contact-email route and `sendEmail` helper are revised; this does not complete the broader R16 route-by-route audit, nor prove the deployed environment was changed.
- This deliberately preserves the pre-existing HTTP 400 status for provider delivery failures for UI compatibility; future design review can distinguish external delivery failure with HTTP 5xx.
- Existing validation does not add email-format, anti-spam, maximum-length, rate-limit or sender authorization policies; those require separate scope decisions.
- Isolated test harness executes the actual endpoint handler extracted from server source and actual helper with mocked dependencies, not a live Express server.
- Preserve all prior 130/130 regression successes and R08/R16 hosted evidence; this is a new fix plus focused tests, not a reset.
- No change to production, `main`, local project or authoritative Google Drive files by the assistant.
