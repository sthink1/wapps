# WA Stage 6 — Shared Usage Tracking: Pilot Integration Bundle

**Date:** November 8, 2026  
**Scope:** Read-only review of Google Drive `My Drive/wonderfulApp`; generated candidate files for user installation only.  
**Status:** NOT INSTALLED, NOT TESTED, NOT APPROVED FOR PRODUCTION. Do not merge or deploy to main. 

## What is included

Complete replacement HTML files (not snippets) for:
- Weights.html
- weighIn.html
- TownNotice.html
- budget.html
- amortization.html
- propertyInfo.html
- InterestEarned.html
- FamilyTree.html

And complete `httpdocs/js/usageTracking.js` and an unchanged reference copy of `httpdocs/js/waPlatform.js`.

**This is a pilot bundle, not full-project standardization.** Other WA HTML files (ETF subpages, other Budget and Family Tree pages, etc.) have not yet been migrated. Do not claim S6-025 is closed.

## What changed

- Replace old page-specific view/time tracking in six pages with one shared module; retain other page functionality.
- Keep Interest Earned's application-specific action logging; keep existing Family Tree behavior.
- Include shared Stage 6 `waPlatform.js` before the usage tracker where needed.
- Add tracking to Town Notice, whose current page had no direct tracker.
- Shared tracker uses Stage 6 session restoration and current-token handling for ordinary requests, with `fetch(keepalive:true)` and Bearer auth on exit.
- Track foreground-visible elapsed time in 30-second checkpoints, preserving fractional milliseconds. Existing reports sum TimeSpent event durations; multiple events per visit are normal after this change.
- Avoid duplicate time-spent submissions on multiple page lifecycle events by consuming each interval once before sending.
- Never automatically replay a tracking POST after a 401, timeout, or uncertain response.
- Do not include credentials in request JSON, console logs, or tracking data; only standard Authorization request headers.

## Important limitations and risks to review before installation

- Frontend tracking is best-effort. Network failure, revoked/expired access tokens during the final unload, and browser termination can still lose intervals. Exact-once server writes cannot be guaranteed without a database-level idempotency key.
- Checkpoint requests may still be in flight at navigation; sending marks intervals consumed. A failed request is not resent.
- New timing definition is **foreground-visible seconds**, not total time since initial page load; intentionally different from legacy wall-clock timing.
- `WA.session.restore()` causes authenticated session-status checks and may refresh credentials if appropriate. Test role restrictions, cross-tab behavior, expired session, and explicit logout. The shared facade must not be loaded twice.
- `waPlatform.js` in this bundle is copied unchanged from Google Drive. If your locally deployed revision differs, do not overwrite it without comparison; adapt the pilot to your authoritative installed version.
- The platform may track a page even if the page's own legacy authentication/UI logic is still loading. Confirm no unauthorized view or timing entries after denial.
- The old tracking module's pagehide + beforeunload guard was only page-local. This pilot adds visibility handling and checkpoints; broad browser/OS testing is still needed.
- The server currently stores duration directly in `TrackUsageT`; there are no server/API schema changes in this bundle.

## Recommended staging installation sequence (user-controlled)

1. Confirm `reviseLogIn`, isolated `wapps-stage6-test` and Morty2 `wapps_test` DB, **never production**.
2. Back up working local files and compare `waPlatform.js` in the bundle with your deployed file. Preserve the newer, verified version where it differs.
3. Install **only one pilot application first**, preferably Weights.html plus new usageTracking.js. The shared WA file is already referenced in Weights.html; deploy no other replacements yet.
4. Test login/role/expired-session; `GET`/POST access, restored session; page view POST 200; time-spent POST authenticated; correct duration and no duplicates in `TrackUsageT`; normal page functions; console and DevTools network.
5. If successful, introduce remaining included HTML pages one at a time. Avoid mixing two usageTracking.js versions across pages during transition. Recheck existing application actions and form functionality.
6. Test Chrome Normal/Incognito, tab refresh, alternate browsers, background-tab visibility, back/forward cache, explicit logout, and short visits; compare raw events with dashboard. Record failures by app.
7. Inventory and migrate remaining pages only after successful pilot and review. Obtain independent design-engineer review before any merge/production choice.

## Acceptance verification query (READ ONLY)

```sql
SELECT Page, Action, COUNT(*) AS Events,
       SUM(CASE WHEN Action = 'TimeSpent' THEN COALESCE(Duration,0) ELSE 0 END) AS TotalSeconds
FROM TrackUsageT
WHERE UserID = 64 AND Timestamp >= CURDATE()
GROUP BY Page, Action ORDER BY Page, Action;
```

## Known defect established before this bundle

November 8: `/Weights.html` POST `/track/log/time-spent` returned 401 Unauthorized for a 35-second interval. Its prior inline tracker did not include an Authorization header. Town Notice had no direct usage-tracking implementation. Budget used legacy beforeunload fetch and undercounted user-observed time.
