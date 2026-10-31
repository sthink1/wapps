# Stage 6 Hosted Consolidated Test Evidence — H05 through H50

**Evidence cutoff:** October 31, 2026.  
**Project / branch:** Wonderful Apps / `reviseLogIn`.  
**Hosted staging service:** `wapps-stage6-test` (`https://wapps-stage6-test.onrender.com`).  
**Deployed candidate:** commit `09ece26` (user-confirmed staging deployment).  
**Database:** staging HelioHost test database `wapps_test`, with `WA_ENV=staging` identity guard reported verified at startup.  
**Production scope:** none; no authorized changes to production Render, database, `main`, or installed TNNA.  
**Evidence source:** user-reported browser behavior, Console/Network observations, selected Render logs, and follow-up clarifications in Stage 6 conversation. Where evidence is partial, dispositions are explicitly bounded. Individual test timestamps generally were not recorded.

**Important distinction:** H05-H50 are the sequential conversational hosted regression IDs, **not** formal R01-R20 test-plan IDs. Do not count them as completion of the full formal security matrix. Earlier H01-H04, local L01-L03, and separately numbered R tests retain their own original evidence.

## Hosted test ledger

| ID | Check | Context | Disposition | Observed evidence / limitation |
|---|---|---|---|---|
| H05 | Normal login; KMLI unchecked | charter / Incognito | Pass | Home signed in; email verification completed; no Console errors |
| H06 | KMLI login and F5 reload | charter / Incognito | Pass | Remained signed in; no Console errors |
| H07 | Explicit logout and F5 | charter / Incognito | Pass | Stayed signed out; no Console errors |
| H08 | Weights existing records | eg / Incognito | Pass | Records/chart displayed; no Console errors |
| H09 | Activities existing records | eg / Incognito | Pass | Records displayed; no Console errors |
| H10 | Interest Earned existing records | sthink / Incognito | Pass | Existing records displayed; no Console errors |
| H11 | ETF categories and symbols | sthink / Incognito | Pass | Existing configuration displayed; no Console errors |
| H12 | Family Tree existing authorized data | sthink / Incognito | Pass | Authorized information displayed; no Console errors |
| H13 | Tracking interface | sthink / Incognito | Pass | Statistics and usage information displayed; no Console errors |
| H14 | Family Tree privacy (read-only) | sthink / Incognito | Pass | Existing privacy information displayed; no Console errors |
| H15 | Town Notice page (read-only) | sthink / Incognito | Pass | Normal interface displayed; no Console errors |
| H16 | Budget existing views | sthink / Incognito | Pass | Budget view/calculations displayed; no Console errors |
| H17 | Notification Preferences (read-only) | sthink / Incognito | Pass | Existing preferences displayed; no Console errors |
| H18 | ETF 1Y comparison | sthink / Incognito | Pass | Comparison completed; no Console errors |
| H19 | Favorite Pets (read-only) | sthink / Incognito | Pass | Existing information displayed; no Console errors |
| H20 | Weights date-range delete dialog | eg / Incognito | Known limitation | earliestDate.toISOString is not a function; S6-039; no DELETE submitted; server DELETE log path untested |
| H21 | Scheduled reset rate cleanup | Render staging logs | Pass (normal path) | 2026-10-30 18:57:21: removed 0 expired records in 1 batch; failure path untested |
| H22 | Application error log search | Render staging logs | Pass (bounded search) | No matches for [ERROR] in selected window; not proof of absence of all errors |
| H23 | KMLI after Render service restart | charter / Chrome Normal | Pass | Remained logged in; no Console errors |
| H24 | KMLI after full Chrome restart | charter / Chrome Normal | Pass | Remained logged in; no Console errors |
| H25 | Logout then Chrome restart | charter / Chrome Normal | Pass | Remained logged out; no Console errors |
| H26 | Unremembered 8-hour session lifecycle | charter / Chrome Normal | Pass (behavior observed) | KMLI off; remained logged in after earlier Chrome restart, later reopened not logged in; JWT exp/network timing not independently inspected |
| H27 | Two-tab remembered logout | charter / Incognito | Pass | Both tabs signed in; logout first; second signed out on refresh; no Console errors |
| H28 | Independent session isolation on logout | charter / Normal + Incognito | Pass | Incognito logout did not revoke still-valid Normal session; no Console errors |
| H29 | Different-account browser isolation | charter Normal / eg Incognito | Pass | Account and plan status remained distinct; no Console errors |
| H30 | Unauthorized Weights API and save | charter / Incognito | Pass, UI observation | GET weights 403; activities 403; POST weights 403; Add form still accessible, repeated 403 Console messages; no write readback |
| H31 | Authorized Weights and Add form | eg / Incognito | Pass | Records/chart/activities displayed; Add form opened and cancelled; no Console errors |
| H32 | Unauthorized Activities direct navigation | charter / Incognito | Pass (403) | No Activities button on Home; direct page GET activities 403, subscription denied Console message |
| H33 | Unauthorized Interest Earned | charter / Incognito | Pass, UI observation | GET and save rejected 403; form allowed input; uncaught promise rejection; no DB readback |
| H34 | Authorized Interest Earned add/delete | eg / Incognito | Pass | Created and deleted test contract; no Console errors; eg entitled but previously had no saved records |
| H35 | Authorized Activities add/delete | eg / Incognito | Pass | Created and deleted temporary activity; no Console errors |
| H36 | Activities after logout | eg / Incognito signed out | Pass, UI observation | No data displayed; uncaught Please log in error; no server 401 independently verified |
| H37 | Weights after logout | Incognito signed out | Pass | No data; LOGIN_REQUIRED; Service Worker registered; no unexpected Console errors |
| H38 | Interest Earned after logout | Incognito signed out | Pass | Redirected to login.html; no Console errors |
| H39 | Family Tree after logout | Incognito signed out | Pass | Public instruction page displayed; FamilyTree2 Menu redirected to Login; no Console errors |
| H40 | Tracking after logout | Incognito signed out | Pass | Redirected to Login; no Console errors |
| H41 | Tracking as non-admin | eg / Incognito | Pass (UI gate) | track.html flashed briefly then redirected home; no Console errors |
| H42 | Tracking protected users API | eg / Incognito | Pass (specific request) | Network showed users 403; session-status 200; some page resources 304; other admin APIs not exhaustively verified |
| H43 | Tracking denial response | eg / Incognito | Pass (specific request) | users 403 response: {"error":"Administrator access required."}; no user records in that response |
| H44 | Tracking as administrator | sthink / Incognito | Pass | Tracking and statistics displayed, users API reported successful as expected; exact HTTP code not separately transcribed |
| H45 | Change Password interface | sthink / Incognito | Pass (UI only) | Fields displayed; no password changed; no Console errors |
| H46 | Forgot Password interface | Incognito signed out | Pass (UI only) | Form and navigation worked; no reset request in this test; no Console errors |
| H47 | Reset email request submission | charter / Incognito | Pass (observed) | Expected generic confirmation; no Console errors; equivalence for unknown email not compared |
| H48 | Reset email delivery and URL | charter inbox | Pass | Email received; link started https://wapps-stage6-test.onrender.com/forgotPassWord.html?; token never recorded |
| H49 | Reset form from email link | charter / Incognito | Pass (UI only) | Fields displayed; no change submitted; no Console errors |
| H50 | Expired reset link | charter / Incognito | Pass (observed) | After expiry window, message Reset password no longer valid; no server-side enforcement independently traced |

## Reconciliation and residual findings

1. **S6-039 remains deferred.** H20 reproduced the previously reported `earliestDate.toISOString is not a function` error in the Weights date-range dialog. Opening/canceling that dialog did not exercise the server-side DELETE route; prior controlled local delete evidence is separate. Do not classify H20 as clean/no-error.
2. **S6-041 remains open.** The fact that H43 returned a safe, limited administrator-denial JSON message does not establish that other route exception handlers avoid raw `e.message` disclosure (notably Family Tree Favorite Pets and other previously flagged routes). An endpoint-by-endpoint error-path review remains required.
3. **UI observations to triage (not server-side authorization bypasses):** H30 unauthorized Weights user could open Add before POST 403, with repeated Activities 403s; H33 unauthorized Interest Earned user could open Add before POST 403 and an uncaught promise rejection; H36 Activities page emitted an uncaught login-required exception; H41 `track.html` briefly appeared before redirect. Preserve in review queue; assigning a new S6 issue ID requires reconciling the latest local register first.
4. **H26 is behavioral, not timestamp-level proof.** Unchecked-KMLI session survived an early browser restart and was later signed out. Exact access-JWT `iat`/`exp`, 8-hour threshold and server response were not inspected, so precise expiry mechanism is unverified. No indication that this result failed the intended design.
5. **H50 is behavioral.** Previously emailed reset link was rejected with 'Reset password no longer valid.' The server-side expiry check and one-time-token reuse protection were not inspected in this hosted test. Actual reset completion, password-change and cross-session revocation remain required hosted cases.
6. **H22 was a bounded log check.** Zero matches for `[ERROR]` in the selected period; other severity formats, missing logs, error-path safety and PII/log leakage are not globally excluded. H21 validated normal cleanup only (0 expired records, 1 batch).
7. **H42-H44 are endpoint-specific.** H43 establishes the observed `users` 403 response body contains no user records. The 304 entries for cached resources do not establish safe cache headers for sensitive API data; broader admin route authorization and cache header inspection remain required.
8. **Tests H34/H35 made temporary changes to *staging/test* records only.** Users reported a test contract and test activity were created and deleted. No independent database reconciliation was conducted.
9. **Formal release gates remain open:** hosted password change/reset with revocation/one-use tests; HTTPS cookie / Secure / SameSite / Origin and CSRF; X-Forwarded-For/proxy and rate-limit safeguards; multi-tab simultaneous refresh; protected API caching; service-worker compatibility; other browsers/devices; TNNA compatibility; account/subscription negative scenarios beyond sampled routes; controlled rate/DB limits; sanitized logging audit; exact production diff / migration / rollback; and independent design-engineer review after all Stage 6 changes and tests. Map these to the current R01-R20 matrix and S6 IDs without automatically closing any.

## Summary counts and controls

- **46 tests recorded:** H05-H50 inclusive.
- **45 pass or qualified-pass observations** (including H26, with limited expiry evidence), and **1 known-limitation case H20**. This count is descriptive, not a formal release readiness score.
- Existing production service, production data, `main`, and TNNA clients remain out of scope.
- Passwords, JWTs, refresh cookies, reset tokens, full password-reset links, and personal data are intentionally absent.

## Update policy

This appendix is a **dated supplement**, not a replacement for older formal test-plan sections. Reconcile newer local copies of the three source documents before applying any update. Do not silently rewrite historical statements; add a 'superseded by October 31 staging evidence' note where old descriptions incorrectly refer to staging as not yet created. No production authorization is implied.
