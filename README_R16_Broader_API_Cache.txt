Wonderful Apps Stage 6 R16 — broader API cache protection candidate
Prepared: 2026-11-04. Staging/branch reviseLogIn only.

Package contents:
  server.js — complete replacement based on read-only Google Drive source fetched Nov 4.
  tests/stage6.r16.broader-api-cache.offline.test.js — permanent offline regression.

Change: add one early app.use middleware for 10 API mount paths immediately
before notificationsRoutes. Existing /users and /subscriptions no-store middleware
remain untouched. Static website assets, /send-email, /api/geocode, and the
catch-all are not covered by this new middleware. TNNA /version and public
Family Tree/notifications token endpoints are covered by no-store (response
headers only; no change to routing or authentication). No route handlers or
subscription policies are changed.

R16 baseline verified in STAGING Nov 4: unauthenticated GET /budget/health,
/track/users, /notifications/preferences all returned 401 without Cache-Control,
with Express weak ETags. This is a cache-policy gap, not confirmed data exposure.

INSTALLATION (USER ONLY):
1. Verify local branch reviseLogIn and clean/review working changes; back up
   current local server.js outside Git as appropriate.
2. Compare candidate server.js against CURRENT local server.js using git diff
   or editor; never replace a newer/divergent local file without reconciling.
3. Place server.js in project root; put test file under tests/.
4. Run node --check server.js; git diff --check; and:
   node --test tests/stage6.r16.broader-api-cache.offline.test.js
   node --test tests/stage6.r08.cache-policy.offline.test.js tests/stage6.r08.authenticated-origin.offline.test.js tests/stage6.r16.subscription-cache.offline.test.js
5. Review and commit ONLY intended source/test files; do not commit backups.
6. If approved for auto-deployed STAGING, verify hosted 200/401/403 cache
   headers on selected API routes; do not touch production/main/TNNA.

TEST LIMITATIONS: Offline test executes real extracted middleware callback but
mocks response objects. It does not start Express, verify route matching,
connect to DB, call Render, or verify hosted headers. Test 500 case is simulated.

ROLLBACK: Restore your original server.js from a verified backup or revert
only the new central API middleware block, after reviewing local differences.

Nothing was written into the local WA project or Google Drive by the assistant.
