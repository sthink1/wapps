# Wonderful Apps — Stage 6B-1 Authentication Inventory

**Date:** 2026-10-24  | **Baseline:** local `reviseLogIn` commit `d91d76b` (user-verified clean). **Sources:** current Google Drive WA project tree and inspected source snippets; module content where retrieved. **Read-only audit:** no modifications to WA or databases.

## Executive findings

- Multiple pages and shared JS modules read `localStorage.token` and attach `Authorization: Bearer ...` themselves. Automatic refresh and true server logout must be integrated across apps.
- Family Tree HTML often delegates authentication to JS modules: absence of a token in the HTML is **not** an indication that the feature is auth-free.
- Budget forms/reports duplicate `getToken()`/`apiFetch()` helpers extensively.
- Distinguish HTTP 401 (authentication recovery) from 403 (authorization/subscription denial). Do not blindly replay unsafe POSTs after ambiguous failures.
- Keep link/action tokens (email verification, network verification, privacy and unsubscribe) separate from the login JWT.
- Keep login unchecked mode nonpersistent; preserve 180-day sliding remembered cookie and 365-day absolute limit.
- Server-side logout and browser refresh-token-family replay handling are known open issues.
- TNNA device/offline flows and Render-hosted HTTPS are release gates; production untouched.

## Classification legend

**CHANGE** = strong indication a direct code change is needed, subject to precise integration design. **REVIEW** = inspect deeper before deciding. **REGRESSION** = no direct page-level auth change identified; test existing feature, and revisit if linked script changes require it. These are recommendations, not guarantees.

## File-by-file inventory

| File/path | Recommendation | Current evidence / action | Regression checks |
|---|---|---|---|
| `httpdocs/changePassword.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/home.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/login.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/forgotPassWord.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/track.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/unsubscribe.html` | **REVIEW** | Email/link-specific token flow; keep separate from WA login bearer token | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/weighIn.html` | **CHANGE** | Stored JWT used for activity tracking; prevent silent tracking errors affecting page | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/register.html` | **REVIEW** | Public registration and redirect; protect against premature token issuance | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/subscription.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/terms.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/networkVerification.html` | **REVIEW** | Email/link-specific token flow; keep separate from WA login bearer token | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/notificationPreferences.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/privacy.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/propertyInfo.html` | **CHANGE** | Stored JWT used for activity tracking; prevent silent tracking errors affecting page | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/index.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/etfSymbol.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/etfCompare.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/etfCategory.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/etfActivity.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/etfAPItest.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/etf.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/budget.html` | **CHANGE** | Stored JWT used for activity tracking; prevent silent tracking errors affecting page | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/bday.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/amortization.html` | **CHANGE** | Stored JWT used for activity tracking; prevent silent tracking errors affecting page | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/Weights.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/TownNotice.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/SubControl.html` | **CHANGE** | Direct local JWT/session use or account workflow; shared session integration and 401/403 semantics | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/InterestEarned.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FamilyTree2.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FamilyTree.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTUndoOneTreeMerge.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTPrivacyVerification.html` | **REVIEW** | Email/link-specific token flow; keep separate from WA login bearer token | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTPersonNew.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTPersonList.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTPersonDuplicate.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTPerson.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTOneTreeMerge.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTNetwork.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTEvent.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTEmailVerification.html` | **REVIEW** | Email/link-specific token flow; keep separate from WA login bearer token | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTContact.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTAncestorPartner.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTAncestorChild.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/FTAncestor.html` | **REGRESSION** | No direct auth fetch found in HTML source scan; linked JS or backend may authenticate separately | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/ContactUs.html` | **REVIEW** | Public form submission; inspect unauthenticated request policy | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BsubscriptionReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BsubscriptionForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/Breports.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BoutReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BoutForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BmonthDetailReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BmonthBudget.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BloanReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BloanForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BinReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BleaseRentForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BleaseRentReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BcardReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BestimateAllowanceForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BestimateAllowanceReport.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BinForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/Activities.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BcardForm.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/BMoney.html` | **CHANGE** | Direct localStorage Bearer/fetch patterns seen; migrate through shared authenticated fetch | Fetch/reload, expired JWT, revoked login; preserve UI and domain functions |
| `httpdocs/js/FTPerson.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTPets.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTPersonList.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTPrivacy.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTEvent.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTContact.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTAncestor.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTNetwork.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/usageTracking.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FamilyTreePage.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/BudgetPrintDetails.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTPersonNew.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTUndoOneTreeMerge.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTInstructions.js` | **REGRESSION** | No direct stored auth usage in source scan | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTOneTreeMerge.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTAncestorChild.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTAncestorPartner.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/FTPersonDuplicate.js` | **CHANGE** | Direct stored token / authenticated API use confirmed in source | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/inputSanitizer.js` | **REGRESSION** | No direct stored auth usage in source scan | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/holidays.js` | **REGRESSION** | No direct stored auth usage in source scan | Review linked HTML, expired/revoked session, feature functionality |
| `httpdocs/js/confetti.js` | **REGRESSION** | No direct stored auth usage in source scan | Review linked HTML, expired/revoked session, feature functionality |
| `routes/tnna.js` | **CHANGE** | Core web/TNNA auth endpoints; review replay revocation, rollback, migration safety | Authorization regression and correct HTTP statuses |
| `routes/users.js` | **CHANGE** | Core web/TNNA auth endpoints; review replay revocation, rollback, migration safety | Authorization regression and correct HTTP statuses |
| `routes/familyTree.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/ftPrivacy.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/subscriptions.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/track.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/notifications.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/interestEarned.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/budget.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/etf.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/weights.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/weightActivities.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `routes/geocode.js` | **REVIEW** | Inspect route access policy and middleware | Authorization regression and correct HTTP statuses |
| `routes/activities.js` | **REVIEW** | Protected route or data endpoint: verify middleware/session-version/security and 401/403 distinctions | Authorization regression and correct HTTP statuses |
| `services/credentialFence.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `services/browserSession.js` | **CHANGE** | Refresh-token consumed replay currently rejects without family revocation | Unit tests; security, rollback, hosted staging |
| `services/passwordResetLimiter.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `services/passwordResetRateCleanup.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `services/stage6Environment.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `services/verifyAccessToken.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `services/subscriptionService.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `services/notificationService.js` | **REVIEW** | Security/session/entitlement service; ensure consistent session checks and environment guards | Unit tests; security, rollback, hosted staging |
| `middleware/subscriptionAccess.js` | **REVIEW** | Cross-cutting request authorization or validation | Protected/unauthorized behavior and regression |
| `middleware/auth.js` | **REVIEW** | Cross-cutting request authorization or validation | Protected/unauthorized behavior and regression |
| `middleware/usageActivity.js` | **REVIEW** | Cross-cutting request authorization or validation | Protected/unauthorized behavior and regression |
| `middleware/handleValidationErrors.js` | **REVIEW** | Cross-cutting request authorization or validation | Protected/unauthorized behavior and regression |
| `server.js` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `dbConnection.js` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `send_email.js` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `httpdocs/sw.js` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `httpdocs/manifest.json` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `httpdocs/css/ (directory)` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `TNNA/public/index.html` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `TNNA/public/config.js` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `TNNA native background service` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `sql/Group0a_test_only_schema.sql` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `.env.test (values not collected)` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |
| `tests/ (directory)` | **REVIEW** | Deployment, caching, email, native or schema dependency; no unilateral modification | Environment-isolation and functional regression |

## Scope boundaries and source confidence

The HTML listings, web pages, shared JS scripts, routes and services were located in Google Drive. Broad source-pattern screening was completed for listed HTML files; detailed source-pattern checks were completed for mounted shared JS. API route and middleware classifications include architectural and named-role review requirements, **not** a full control-flow proof for every endpoint. The local HEAD was not independently checked byte-by-byte against Drive. CSS, static images, nested TNNA directories and SQL dumps require targeted follow-up; do not infer they are all unchanged.

## Implementation ordering

1. Baseline checksum comparison for security-critical Drive vs local HEAD.
2. Design shared `authenticatedFetch`, session restore, single-flight refresh, cross-tab coordination, failure semantics and logout (with tests).
3. Wire home/login/change password/subscription/admin, then Budget, Family Tree modules, ETF and activity/other pages in small groups.
4. Harden replay with race-aware behavior and session-family revocation; review migration SQL only for necessary schema changes.
5. Run browser, app, TNNA and hosted HTTPS regressions, then independent engineering review before merge/deploy.

