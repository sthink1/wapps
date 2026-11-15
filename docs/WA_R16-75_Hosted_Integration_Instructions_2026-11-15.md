# Wonderful Apps — R16-75 Integration Follow-up

**Date:** 2026-11-15. **Staging only.** Test service `https://wapps-stage6-test.onrender.com` on branch `reviseLogIn`; the user-supplied Render deployment screenshot shows commit `f794eb7` Live at 8:39 AM, November 15. That screenshot does **not** independently prove database identity or runtime HTTP responses.

## 1. T06 / T11: User-run actual HTTP parser and cache tests

Extract `WA_R16-75_Hosted_Integration_Probe_2026-11-15.ps1` into an independent temporary folder, **not** into the WA source directory. In Windows PowerShell, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\<your-temporary-folder>\WA_R16-75_Hosted_Integration_Probe_2026-11-15.ps1"
```

This script sends exactly three deliberately malformed **unauthenticated POST** bodies to `/users/session-status` on the staging host. Body parsing runs before routing, so these requests should never invoke a successful write operation; no cookies, bearer tokens, or account data are supplied. It tests actual JSON parsing, excessive URL-encoded parameters, and incomplete multipart parsing. It verifies actual response status (4xx/5xx), nested JSON message, generic sanitization, absence of a synthetic marker, and `Cache-Control: no-store`. It prints only bounded results and writes `WA_R16-75_T06_T11_Probe_Results.json` next to the script. Send **that JSON file** back to ChatGPT.

If any response is HTML, has another error envelope, is a 2xx/3xx, omits no-store, or includes the synthetic marker, the script returns `REVIEW_REQUIRED`; do not assume a failure indicates leakage without inspecting evidence. For cases unable to reproduce a parser failure, revise only the test method after reviewing the result. No authentication or real data should be needed.

## 2. T09: Browser error presentation (manual observation)

In a separate browser session on staging, first verify the live page loads the corrected `/js/waPlatform.js` (the revised `readError` handles nested `error.message`), not a stale cached copy. With a **test account**, observe an existing safe validation error that uses `WA.api.json`. Record whether the UI shows readable error text rather than `[object Object]` and whether normal login/session behavior is unchanged. Do not deliberately trigger destructive transactions, account lockouts or other costly failures. A generic error displayed by a page that does not actually use `WA.api` does not verify T09; identify the page and call path in the evidence.

## 3. T10: Browser unsaved-form behavior (manual observation)

Using a test account and an ordinary, reversible data-entry form on staging, type a synthetic draft but do **not** submit while online. In Chrome DevTools Network tab switch to **Offline**. Attempt its ordinary Save once while offline, then check that the drafted field values remain in place, an appropriate failure is shown, and no queued/replayed mutation occurs on reconnection. Return Network to **Online** without clicking Save again; confirm no delayed POST/PUT/PATCH/DELETE is sent and the draft remains. Do not use production accounts or real financial/Family Tree records for this test. Record the page, action, result and whether it actually uses the `WA.api` client. If it does not, this only verifies the page's own behavior, not T10's shared-client contract.

## 4. T11: Hosted logs and cache header reconciliation

After the three malformed requests, inspect Render staging logs limited to that test window for any synthetic marker or raw parser exception details (do not paste logs containing credentials). Record the log time span, whether an HTTP error status is recorded and whether the private marker or request body appears. Use the above generated JSON to verify real `Cache-Control` headers. A log check cannot be completed via static code tests alone.

## 5. Remaining gate

Ensure staging startup evidence confirms the isolated Stage 6 **test database identity** and that only `wapps-stage6-test` was exercised. Do not infer DB identity from deployment's green Live badge. Preserve T01–T05 and T07–T12 bounded offline results; do not rerun R10/R14/R15 comprehensively. R16-75 remains OPEN pending actual evidence for T06/T09/T10/T11.
