# Wonderful Apps — Stage 6 Group 5G Hosted Credential-Lifecycle Acceptance Evidence

**Date:** November 3, 2026  
**Scope:** Stage 6 Group 5G only; web password-reset/change-password and TNNA API credential lifecycle  
**Disposition:** **PASS for the explicitly observed hosted scenarios; Stage 6 overall NOT released / NOT fully accepted**  
**Branch / hosted deployed commit:** `reviseLogIn` / `f023cc3` (user-confirmed successful Render startup and Live deployment)  
**Service:** `https://wapps-stage6-test.onrender.com`  
**Database:** HelioHost Morty2 MariaDB `wapps_test`, version `12.3.3-MariaDB-log`, staging identity and UTC verified in Render startup messages  
**Synthetic user:** `charter`, **UserID 64**. Previous `charter` UserID 62 was deleted and 14 identified user-reference tables checked as zero before new registration.  
**Evidence provenance:** User-supplied phpMyAdmin SQL results, Render logs/screenshots, Chrome observations, and PowerShell output from real staging HTTP requests in this conversation. No full secret-bearing HTTP traces, automated capture bundle, or Android device test was provided. Unless stated otherwise, PASS means the reported result was observed in the bounded test, not an exhaustive security certification.

## A. Deployment and scope verification

- The stage-only database hostname changed to `morty2.heliohost.org` in `services/stage6Environment.js` and `dbConnection.js`; `tests/group0d.environment.test.js` updated. On local branch `reviseLogIn`, `git diff --check` was clean aside from harmless LF/CRLF notices; all **16/16** group0d environment tests passed.
- Git commit **`f023cc3`** (`Stage 6: update HelioHost test endpoint to Morty2`) was pushed to `origin/reviseLogIn`, changing only the three reviewed files. Render startup then showed successful DB UTC connection, verified Stage 6 database identity and listening port 10000. No `main`, production Render service, or production database modification was authorized as part of Group 5G.
- A separate local credentialed/TLS MariaDB test reported `johnny.heliohost.org` access denied and `morty2.heliohost.org` connection successful to `wapps_test`. This supports the stage-only host change; it does not establish future production migration readiness.

## B. Hosted web password-reset lifecycle — PASS (observed)

1. Normal Chrome KMLI login for `charter` established remembered **WebSessionID 115**. Pre-reset DB: `UserID=64`, `IsRemembered=1`, `RevokedAt=NULL`, `CreatedAt=2026-11-03 15:38:51 UTC`, `ExpiresAt=2027-05-02 15:38:51 UTC`.
2. Separate Incognito browser: Forgot Password showed generic response; reset email delivered. Existing KMLI window was kept open.
3. Reset link submitted with a different password; page reported success. DB: WebSessionID 115 `RevokedAt=2026-11-03 15:47:38 UTC`.
4. Original Normal Chrome session returned to logged-out state on reload; old password rejected; new password accepted via subsequent login (KMLI unchecked).
5. Reopening same reset link was rejected. DB `PasswordResetT` record for UserID 64 showed `CreatedAt=2026-11-03 15:44:45 UTC`, `ExpiresAt=2026-11-03 16:14:45 UTC`, `UsedAt=2026-11-03 15:47:38 UTC`, `RevokedAt=NULL`. The used timestamp, not `RevokedAt`, prevents reuse.
6. `UserSecurityT.SecurityVersion` read **2** afterward. Its exact pre-reset value was **not recorded**, so the increment is consistent with expected behavior but not independently measured as a before/after pair.

## C. Hosted authenticated Change Password lifecycle — PASS (observed)

1. Re-established remembered Normal Chrome KMLI session **WebSessionID 117**: `UserID=64`, `IsRemembered=1`, `CreatedAt=2026-11-03 16:00:46 UTC`, `RevokedAt=NULL` before change.
2. Authenticated Change Password returned success. DB later showed session 117 `RevokedAt=2026-11-03 16:05:18 UTC`.
3. Original Normal Chrome browser became logged out on reload. Previous password rejected. Newly changed password accepted via normal login, KMLI unchecked.

## D. TNNA hosted HTTP and credential-revocation lifecycle — PASS (Windows API client)

**Device boundary:** Executed from Windows PowerShell using real `wapps-stage6-test` routes, a synthetic test-device identifier, and `charter` UserID 64. **Not an Android APK/device end-to-end test**. Samsung A15 TNNA installation remained signed in as `sthink` in offline mode and was not altered.

1. `POST /users/login` accepted test-only credentials and sent verification email; its temporary challenge was retained privately in the user's PowerShell session.
2. `POST /tnna/verify-code` succeeded, returning UserID 64 and actual access and refresh tokens. `GET /tnna/me` with issued access token succeeded and identified `charter`, UserID 64.
3. DB baseline **TNNA RefreshTokenID 28**, `CreatedAt=2026-11-03 16:24:23 UTC`, `ExpiresAt=2027-05-02 16:24:23 UTC`, `RevokedAt=NULL` (180-day lifetime).
4. `POST /tnna/refresh` with token 28 succeeded and returned new, different access/refresh credentials. DB then showed token **28 revoked at 2026-11-03 16:27:37 UTC**, and replacement **RefreshTokenID 29**, `CreatedAt=2026-11-03 16:27:37 UTC`, `ExpiresAt=2027-05-02 16:27:37 UTC`, `RevokedAt=NULL`.
5. Replaying token 28 against `/tnna/refresh` returned **HTTP 401** (PASS).
6. The user changed `charter` password through the hosted normal web interface while token 29 was active. DB showed token **29 revoked at 2026-11-03 16:31:10 UTC**.
7. Using the previously issued TNNA access token on `GET /tnna/me` returned **HTTP 401** (PASS). Using the previously issued TNNA refresh token 29 against `POST /tnna/refresh` also returned **HTTP 401** (PASS).

**Evidence limitation:** Token contents, verification codes, passwords, email addresses, and reset links were deliberately not captured or shared. We have user-reported HTTP outcomes and selected database states, not a separate signed/automated log bundle. The initial refresh rotation and replay protection are also covered by prior offline tests, but this Group 5G record establishes actual hosted HTTP behavior for the specific sequential scenario above. It does not prove concurrent replay behavior at the hosted network layer or other TNNA device flows.

## E. Group 5G disposition and outstanding gates

**Group 5G planned web and TNNA API credential lifecycle: completed / PASS for observed cases.** Neither Group 5G PASS nor successful Stage 6 staging connection authorizes a merge or production deploy.

Still outstanding or separately tracked:

- Native Samsung/Android TNNA app flow on a staging-connected installation (Windows API client is not a substitute for the Android UI, app lifecycle, or offline-to-online transition).
- Formal R01–R20 security matrix mapping and any cases not directly supported by these specific observations; broader origin/CSRF/cookie/header/caching controls, cross-browser/device behavior, concurrent failures, abnormal DB/rate limits, error-response/logging audit, access-control/entitlement negative cases.
- Existing **S6-039** Weights delete date-range dialog error (`earliestDate.toISOString is not a function`), deferred; **S6-041** incomplete sanitized error-response audit; additional UI observations H30/H33/H36/H41 require triage against the authoritative issue register.
- Production MariaDB migration planning, fresh production MySQL dump/import validation, operational rollback, exact source/database schema and environment diff; **not part of Group 5G**.
- **Mandatory independent design-engineer/security review after all Stage 6 work and testing, before any merge or production decision**.
- The distinct, proposed account-deletion SOP (in `docs/WA_Account_Deletion_SOP_Design_2026-11-02.md`) and unresolved retention/shared Family Tree/subscription policy choices remain a **future enhancement**, not installed in Stage 6.

## F. Documentation reconciliation

This is a **dated November 3 supplement** to the historical October 31 `Stage6_H05-H50_Hosted_Evidence_2026-10-31.md`, `Stage6_OpenItems_H05-H50_Append_2026-10-31.md`, and `Stage6_Render_TestPlan_H05-H50_Append_2026-10-31.md`. Their statements that hosted password completion, one-time use and TNNA credential revocation were *still untested as of October 31* are historically correct and **superseded for the bounded cases recorded here**; do not rewrite or silently change their original observations. Do not mark the entire Stage 6 project finished.

**Credentials and secrets:** None included. **Production/main/A15:** No change reported in the Group 5G test sequence.
