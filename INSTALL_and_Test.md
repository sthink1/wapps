# Stage 6 Group 3B-1 — Preservation Revision

**Authoritative baseline:** Google Drive `Weights_COPY.html` (82,924 characters when read as normalized text). This file is kept unchanged in the ZIP for comparison.

## Installation safeguards
1. Discard all earlier Group 3B-1 ZIPs. Do not install without comparing the revised file to the actual local original.
2. Verify Git branch is `reviseLogIn` and test environment is connected to `sql5838929`.
3. Stop the local test server, save a backup outside Git of `httpdocs/Weights.html`, and install only the revised `httpdocs/Weights.html`. No shared JS or backend modifications.
4. Restart with `node --env-file=.env.test server.js`, confirm `WA_ENV=local; test DB verified`. Run `git diff --check`.
5. Run browser acceptance **one test at a time**. Do not commit or push pending acceptance.

## Narrow changes from baseline
- Add shared `js/waPlatform.js` script include.
- Replace the legacy `makeAuthenticatedRequest` body with an adapter to `WA.api.request`, preserving return values, 204 handling and JSON Content-Type on writes.
- Replace direct authenticated weight/activity fetch calls with same-origin WA API requests.
- Show a distinct 401 Login or 403 subscription denial rather than a generic network error for initial weight fetch.
- Use session restoration for page-view tracking and omit the access token from the time-spent JSON body. Keep `beforeunload` timing lifecycle unchanged, using the currently active access token for the final best-effort request. Tracking semantics must be tested.
- Fix only the observed undefined `closeResultsBtn` crash with a guarded lookup. No Search handler or Print block removed.

## Preservation checks
- Both preexisting `printResultsBtn.onclick` blocks retained, unchanged.
- Both `printWindow.print()` calls retained.
- All existing HTML/CSS/forms/charts/search-results output/weight formulas preserved; see included unified diff.
- No restructuring or removal of duplicate code.

## Browser acceptance
1. #16D repeat: Chrome Incognito, `sthink`, KMLI checked, clear access token on Home and navigate directly to Weights. Expect one successful refresh and authorized Weights records.
2. #16A logged-out direct Weights URL: no data; controlled 401 handling.
3. #16B `charter` Standard: HTTP 403, no weight records.
4. #16C `sthink` authorized: HTTP 200, records, chart and activity rows correct.
5. Search form: opens, filtering/search results, Cancel, Print output, two existing Print definitions preserved.
6. Date-range selectors, color settings and read-only Edit/Add/Delete dialog open/cancel.
7. With explicit test-data approval only: add/edit/delete mutations and exactly-once behavior; verify JSON Content-Type and no replay.
8. Confirm page-view and time-spent tracking on navigation, no token in Console/request body.
9. Test revoked session and 401/403/503 distinctions, no unauthorized data displayed.

**No production/main/Render/SQL changes.** Group 3B-1 remains pending browser verification.
