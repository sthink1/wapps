# Wonderful Apps — Wave 0 Dependency Review

Date: November 15, 2026 (America/New_York).
Scope: local filesystem inventory and static dependency reconciliation only.
Source: `C:\AppProjectwDB\WonderfulAppsRender`.
Branch: `reviseLogIn`; HEAD: `1bc93d86a194cdcc57a7280de226f1bfee10f10c`.

All 320 inventory rows are **Not Audited**. A reference proves a source relationship, not successful execution, authorization correctness, standards compliance, or release readiness. No application, tests, builds, installers, database operations, hosted calls, or dependency installation were executed.

## Method and scope

The in-memory Python/PowerShell inspection recursively enumerated the entire local tree, including hidden and ignored files. It inspected static CommonJS/module imports, browser attributes and literal navigation/assets, PWA lists/manifests, package scripts, Gradle inputs, native class relationships, and boundary manifest members. File hashes are SHA-256 of exact local bytes. JavaScript document-relative URLs resolve against the consuming HTML document, not the JS source directory; no HTML base tags were found in the 66 non-copy browser/native pages examined.

HTML script order below was captured with Python's HTML parser, which ignores commented tags. The broader literal-reference scan is conservative: variable expressions, comments and generated routes require interpretation. Confirmed comment-only false positives are separated below. This is not a complete method/permission/consumer contract registry under Detailed Annex A.

## Server entrypoints and mounted routes

`package.json` declares `server.js` as main; `npm start` runs `node server.js` and `npm run dev` runs nodemon. Commands were inspected, never executed. `server.js` imports the Stage 6 environment guard before route/database loading, serves `httpdocs/` using Express static middleware, defines the root home response and public contact-email handler, and starts listening only after its declared DB readiness/identity checks.

| Mounted prefix | Current file | Observed wiring; not a permission audit |
| --- | --- | --- |
| `/users` | `routes/users.js` | Router-specific contracts; no authorization inference solely from prefix |
| `/subscriptions` | `routes/subscriptions.js` | Router-specific contracts; no authorization inference solely from prefix |
| `/admin-management` | `routes/adminManagement.js` | Router-specific contracts; no authorization inference solely from prefix |
| `/notifications` | `routes/notifications.js` | Router-specific contracts; no authorization inference solely from prefix |
| `/track` | `routes/track.js` | Router-specific contracts; no authorization inference solely from prefix |
| `/tnna` | `routes/tnna.js` | Router-specific contracts; no authorization inference solely from prefix |
| `/weights` | `routes/weights.js` | authenticateToken + requireAppAccess + usageActivity at mount |
| `/activities` | `routes/activities.js` | authenticateToken + requireAppAccess + usageActivity at mount |
| `/weightActivities` | `routes/weightActivities.js` | authenticateToken + requireAppAccess + usageActivity at mount |
| `/interestEarned` | `routes/interestEarned.js` | authenticateToken + requireAppAccess + usageActivity at mount |
| `/budget` | `routes/budget.js` | authenticateToken + requireAppAccess + usageActivity at mount |
| `/familytree/privacy` | `routes/ftPrivacy.js` | Separate public /familytree/privacy-verify and private /familytree/privacy routers |
| `/familytree` | `routes/familyTree.js` | Special GET/POST contact-email-verification token path; otherwise auth + entitlement + usage + privacy protection |
| `/etf` | `routes/etf.js` | authenticateToken + requireAppAccess + usageActivity at mount |
| `/api/geocode` | `routes/geocode.js` | Public geocode router; preserve existing controls, D11 deferral |
| `/send-email` | `server.js` | Direct POST handler in server.js |


Router order matters. The public Family Tree contact-verification bypass and privacy verification router are mounted before the general protected Family Tree route. No routing or permission behavior was changed.

## Backend modules and local dependencies

Imports below come from literal source references; browser consumers additionally appear on the inventory rows as prefix-level inferences.

| File | Local imported/invoked dependencies | External modules |
| --- | --- | --- |
| `dbConnection.js` | `logger.js` | `dotenv`, `mysql2/promise` |
| `logger.js` | None identified | `fs`, `path`, `winston` |
| `middleware/auth.js` | `dbConnection.js`, `services/verifyAccessToken.js` | None identified |
| `middleware/handleValidationErrors.js` | None identified | `express-validator` |
| `middleware/subscriptionAccess.js` | `middleware/auth.js`, `services/administratorAccess.js`, `services/subscriptionService.js` | `jsonwebtoken` |
| `middleware/usageActivity.js` | `services/subscriptionService.js` | None identified |
| `morgan.js` | None identified | `morgan`, `path`, `rotating-file-stream` |
| `r2Storage.js` | None identified | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `sharp` |
| `routes/activities.js` | `dbConnection.js`, `middleware/auth.js`, `middleware/handleValidationErrors.js`, `utils.js` | `express`, `express-validator` |
| `routes/adminManagement.js` | `dbConnection.js`, `middleware/auth.js`, `services/administratorAccess.js`, `services/browserSession.js` | `bcrypt`, `crypto`, `express` |
| `routes/budget.js` | `dbConnection.js`, `middleware/auth.js`, `utils.js` | `express`, `express-validator` |
| `routes/etf.js` | `dbConnection.js`, `logger.js`, `middleware/auth.js`, `utils.js` | `axios`, `express`, `express-validator` |
| `routes/familyTree.js` | `dbConnection.js`, `middleware/auth.js`, `r2Storage.js`, `services/administratorAccess.js`, `services/notificationService.js`, `services/stage6ExpectedClientError.js` | `crypto`, `express`, `multer` |
| `routes/ftPrivacy.js` | `dbConnection.js`, `services/administratorAccess.js`, `services/notificationService.js`, `services/stage6ExpectedClientError.js` | `crypto`, `express` |
| `routes/geocode.js` | None identified | `express` |
| `routes/interestEarned.js` | `dbConnection.js`, `middleware/auth.js`, `middleware/handleValidationErrors.js` | `express`, `express-validator` |
| `routes/notifications.js` | `dbConnection.js`, `middleware/auth.js`, `services/notificationService.js`, `services/stage6ExpectedClientError.js` | `crypto`, `express` |
| `routes/subscriptions.js` | `middleware/subscriptionAccess.js`, `services/stage6ExpectedClientError.js`, `services/subscriptionService.js` | `express` |
| `routes/tnna.js` | `dbConnection.js`, `middleware/auth.js`, `send_email.js`, `services/administratorAccess.js`, `services/browserSession.js`, `services/credentialFence.js`, `services/notificationService.js`, `utils.js` | `crypto`, `dotenv`, `express`, `jsonwebtoken` |
| `routes/track.js` | `dbConnection.js`, `middleware/auth.js`, `r2Storage.js`, `services/administratorAccess.js` | `express` |
| `routes/users.js` | `dbConnection.js`, `middleware/auth.js`, `send_email.js`, `services/administratorAccess.js`, `services/browserSession.js`, `services/credentialFence.js`, `services/notificationService.js`, `services/passwordResetClientIp.js`, `services/passwordResetLimiter.js`, `services/stage6ExpectedClientError.js`, `services/subscriptionService.js`, `utils.js` | `bcrypt`, `crypto`, `dotenv`, `express`, `express-validator`, `jsonwebtoken` |
| `routes/weightActivities.js` | `dbConnection.js`, `middleware/auth.js`, `middleware/handleValidationErrors.js` | `express`, `express-validator` |
| `routes/weights.js` | `dbConnection.js`, `logger.js`, `middleware/auth.js`, `utils.js` | `express`, `express-validator` |
| `send_email.js` | `logger.js` | `resend` |
| `server.js` | `dbConnection.js`, `logger.js`, `middleware/subscriptionAccess.js`, `middleware/usageActivity.js`, `morgan.js`, `routes/activities.js`, `routes/adminManagement.js`, `routes/budget.js`, `routes/etf.js`, `routes/familyTree.js`, `routes/ftPrivacy.js`, `routes/geocode.js`, `routes/interestEarned.js`, `routes/notifications.js`, `routes/subscriptions.js`, `routes/tnna.js`, `routes/track.js`, `routes/users.js`, `routes/weightActivities.js`, `routes/weights.js`, `send_email.js`, `services/passwordResetRateCleanup.js`, `services/stage6Environment.js`, `services/stage6ExpectedClientError.js` | `cors`, `dotenv`, `express`, `fs`, `multer`, `path` |
| `services/administratorAccess.js` | `dbConnection.js` | None identified |
| `services/browserSession.js` | `services/credentialFence.js`, `services/stage6Environment.js`, `services/stage6ExpectedClientError.js` | `crypto`, `jsonwebtoken` |
| `services/credentialFence.js` | None identified | None identified |
| `services/notificationService.js` | `dbConnection.js`, `send_email.js`, `services/stage6ExpectedClientError.js` | `crypto` |
| `services/passwordResetClientIp.js` | `services/stage6Environment.js` | `node:net` |
| `services/passwordResetLimiter.js` | `services/stage6Environment.js` | `crypto` |
| `services/passwordResetRateCleanup.js` | `services/stage6Environment.js` | None identified |
| `services/stage6Environment.js` | None identified | None identified |
| `services/stage6ExpectedClientError.js` | None identified | None identified |
| `services/subscriptionService.js` | `dbConnection.js`, `services/stage6ExpectedClientError.js` | None identified |
| `services/verifyAccessToken.js` | None identified | `jsonwebtoken` |
| `utils.js` | `dbConnection.js`, `logger.js` | None identified |


`middleware/auth.js` imports the DB pool and `services/verifyAccessToken.js`. `middleware/subscriptionAccess.js` depends on auth, subscription service and administrator verification. `services/browserSession.js` depends on environment settings, credential fence and expected-client-error provenance. These are observed imports, not findings about implementation conformance.

`dbConnection.js` owns pool creation and imports dotenv, mysql2/promise and logger; its source declares UTC timezone configuration. Database identity, contents, schema and connectivity were not inspected or tested. No SQL dump is elevated to present schema authority.

## Browser pages and script/style order

Scripts are shown in their HTML declaration order. Query versions are preserved. Inline scripts are present on many pages and remain part of their page's inventory row; their computed runtime behavior was not executed. Loading `waPlatform.js` does not establish use of `WA.api`.

| Page | External/local script declaration order | Stylesheets |
| --- | --- | --- |
| `httpdocs/Activities.html` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js` → `js/confetti.js` → `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/amortization.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BcardForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BcardReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/bday.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/BestimateAllowanceForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BestimateAllowanceReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BinForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BinReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BleaseRentForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BleaseRentReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BloanForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BloanReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BMoney.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BmonthBudget.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BmonthDetailReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BoutForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BoutReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/Breports.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BsubscriptionForm.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/BsubscriptionReport.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/budget.html` | `js/BudgetPrintDetails.js?v=20260926-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/changePassword.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/ContactUs.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` | `css/wa-buttons.css` |
| `httpdocs/etf.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/etfActivity.html` | `js/holidays.js` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/etfAPItest.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/holidays.js` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/etfCategory.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/etfCompare.html` | `js/holidays.js` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/etfSymbol.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/FamilyTree.html` | `js/FTInstructions.js?v=20260924-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FamilyTree2.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/FTInstructions.js?v=20260923-2` → `js/FamilyTreePage.js?v=20260927-network-person-search` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/forgotPassWord.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/FTAncestor.html` | `js/FTPrivacy.js?v=20261012-p2` → `js/FTAncestor.js?v=20260924-reviseft5` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTAncestorChild.html` | `js/FTAncestorChild.js?v=20260909-age1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTAncestorPartner.html` | `js/FTAncestorPartner.js?v=20260909-age1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTContact.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/FTContact.js?v=20261012-emailverify1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTEmailVerification.html` | No external script tags | Inline/no linked stylesheet |
| `httpdocs/FTEvent.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/FTEvent.js?v=20261010-history1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTNetwork.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/FTNetwork.js?v=20260928-network-jobs` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTOneTreeMerge.html` | `js/FTOneTreeMerge.js?v=20260923-reviseft1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTPerson.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/FTPets.js?v=20261011-1` → `js/FTPrivacy.js?v=20261012-entryfix1` → `js/FTPerson.js?v=20261010-events1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTPersonDuplicate.html` | `js/FTPersonDuplicate.js?v=20260902-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTPersonList.html` | `js/FTPrivacy.js?v=20261012-p2` → `js/FTPersonList.js?v=20261004-fullname-search` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTPersonNew.html` | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/FTPersonNew.js?v=20260923-reviseft1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/FTPrivacyVerification.html` | No external script tags | Inline/no linked stylesheet |
| `httpdocs/FTUndoOneTreeMerge.html` | `js/FTUndoOneTreeMerge.js?v=20260923-reviseft1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-ft1` | `css/wa-buttons.css` |
| `httpdocs/home.html` | `js/waPlatform.js` | Inline/no linked stylesheet |
| `httpdocs/index.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/InterestEarned.html` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js` → `js/confetti.js` → `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/login.html` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js` → `js/confetti.js` → `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` | `css/wa-buttons.css` |
| `httpdocs/networkVerification.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/notificationPreferences.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/privacy.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/propertyInfo.html` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js` → `js/confetti.js` → `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | Inline/no linked stylesheet |
| `httpdocs/register.html` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js` → `js/confetti.js` → `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` | `css/wa-buttons.css` |
| `httpdocs/SubControl.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/subscription.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/terms.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/TownNotice.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/track.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/unsubscribe.html` | No external script tags | `css/wa-buttons.css` |
| `httpdocs/weighIn.html` | `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `httpdocs/Weights.html` | `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js` → `js/confetti.js` → `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.4.14/purify.min.js` → `js/inputSanitizer.js?v=20260914-1` → `js/waPlatform.js` → `js/usageTracking.js?v=20261108-1` | `css/wa-buttons.css` |
| `TNNA/public/index.html` | `config.js` | Inline/no linked stylesheet |
| `TNNA/android/app/src/main/assets/public/index.html` | `config.js` | Inline/no linked stylesheet |


Shared components include `httpdocs/js/waPlatform.js`, `usageTracking.js`, `inputSanitizer.js`, DOMPurify CDN assets, Family Tree companion modules, and `httpdocs/css/wa-buttons.css`. Third-party CDN resources are external dependencies, not local missing files; availability, integrity and current upstream versions were not tested.

## Browser API consumers and dynamic references

The following are literal/templated call-site observations. Query values are omitted. Prefix-based caller links are included on route-file inventory rows where recognizable. Helper variables and multiline/computed transport patterns mean this table is not exhaustive of possible runtime requests.

| Consumer | Observed call references |
| --- | --- |
| `httpdocs/BcardForm.html` | `L42: ${BASE_URL}${path}`; `L48: /budget/cards`; `L48: /budget/cards/${id}`; `L48: /budget/cards/${selectedId}` |
| `httpdocs/BcardReport.html` | `L40: ${BASE_URL}${path}`; `L45: /budget/cards` |
| `httpdocs/BestimateAllowanceForm.html` | `L47: ${BASE_URL}${path}`; `L56: /budget/descriptions`; `L57: /budget/estimates`; `L58: /budget/estimates/${id}`; `L62: /budget/estimates/${selectedId}`; `L63: /budget/descriptions`; `L75: /budget/recurrence/preview` |
| `httpdocs/BestimateAllowanceReport.html` | `L40: ${BASE_URL}${path}`; `L45: /budget/estimates` |
| `httpdocs/BinForm.html` | `L500: ${BASE_URL}${path}`; `L544: /budget/descriptions`; `L567: /budget/in`; `L615: /budget/in/${id}`; `L692: /budget/in/${selectedId}`; `L732: /budget/descriptions`; `L1053: /budget/recurrence/preview` |
| `httpdocs/BinReport.html` | `L40: ${BASE_URL}${path}`; `L49: /budget/in` |
| `httpdocs/BleaseRentForm.html` | `L47: ${BASE_URL}${path}`; `L57: /budget/lease-rent`; `L58: /budget/lease-rent/${id}`; `L62: /budget/lease-rent/${selectedId}`; `L75: /budget/recurrence/preview` |
| `httpdocs/BleaseRentReport.html` | `L40: ${BASE_URL}${path}`; `L45: /budget/lease-rent` |
| `httpdocs/BloanForm.html` | `L47: ${BASE_URL}${path}`; `L57: /budget/loans`; `L58: /budget/loans/${id}`; `L62: /budget/loans/${selectedId}`; `L75: /budget/recurrence/preview` |
| `httpdocs/BloanReport.html` | `L40: ${BASE_URL}${path}`; `L45: /budget/loans` |
| `httpdocs/BMoney.html` | `L262: ${BASE_URL}${path}`; `L296: /budget/money`; `L308: /budget/money/${row.UserMoneyID}`; `L348: /budget/investments`; `L360: /budget/investments/${row.UserInvestmentID}`; `L405: /budget/monthly/summary` |
| `httpdocs/BmonthBudget.html` | `L434: ${BASE_URL}${path}`; `L497: /budget/monthly/summary` |
| `httpdocs/BmonthDetailReport.html` | `L418: ${BASE_URL}${path}`; `L553: /budget/monthly/detail/${year}/${month}` |
| `httpdocs/BoutForm.html` | `L505: ${BASE_URL}${path}`; `L544: /budget/descriptions`; `L567: /budget/out`; `L615: /budget/out/${id}`; `L692: /budget/out/${selectedId}`; `L732: /budget/descriptions`; `L1053: /budget/recurrence/preview` |
| `httpdocs/BoutReport.html` | `L40: ${BASE_URL}${path}`; `L49: /budget/out` |
| `httpdocs/Breports.html` | `L40: ${BASE_URL}${path}` |
| `httpdocs/BsubscriptionForm.html` | `L47: ${BASE_URL}${path}`; `L57: /budget/subscriptions`; `L58: /budget/subscriptions/${id}`; `L62: /budget/subscriptions/${selectedId}`; `L75: /budget/recurrence/preview` |
| `httpdocs/BsubscriptionReport.html` | `L40: ${BASE_URL}${path}`; `L45: /budget/subscriptions` |
| `httpdocs/changePassword.html` | `L60: /users/session-status`; `L80: /users/change-password` |
| `httpdocs/etfAPItest.html` | `L603: ${BASE_URL}/etf/symbol`; `L619: ${BASE_URL}/etf/tiingo-proxy`; `L642: ${BASE_URL}/etf/finnhub-quote` |
| `httpdocs/etfCategory.html` | `L168: /etf/category`; `L193: /etf/category`; `L240: /etf/category/${id}`; `L268: /etf/category/${id}` |
| `httpdocs/etfSymbol.html` | `L179: /etf/category`; `L233: /etf/symbol`; `L265: /etf/symbol`; `L342: /etf/symbol/${id}`; `L373: /etf/symbol/${id}` |
| `httpdocs/FamilyTree.html` | `L774: ${BASE_URL}/familytree/current-tree` |
| `httpdocs/forgotPassWord.html` | `L81: /users/validate-reset-token`; `L107: /users/forgot-password`; `L125: /users/reset-password` |
| `httpdocs/FTEmailVerification.html` | `L5: /familytree/contact-email-verification/`; `L8: /familytree/contact-email-verification/` |
| `httpdocs/FTPrivacyVerification.html` | `L3: /familytree/privacy-verify/`; `L4: /familytree/privacy-verify/` |
| `httpdocs/home.html` | `L848: ${BASE_URL}/users/is-admin`; `L1073: ${BASE_URL}/subscriptions/status`; `L1184: ${BASE_URL}/subscriptions/usage`; `L1478: ${BASE_URL}/track/log/page`; `L1548: ${BASE_URL}/track/log/time-spent` |
| `httpdocs/js/BudgetPrintDetails.js` | `L16: ${BASE_URL}${path}`; `L452: /budget/money`; `L453: /budget/investments`; `L454: /budget/monthly/summary` |
| `httpdocs/js/FamilyTreePage.js` | `L31: ${BASE_URL}/familytree/current-tree`; `L36: ${BASE_URL}/familytree/enter-code`; `L49: ${BASE_URL}/familytree/change-tree`; `L52: ${BASE_URL}/familytree/tree-search` |
| `httpdocs/js/FTAncestor.js` | `L227: ${BASE_URL}/familytree/persons/${personID}/ancestor` |
| `httpdocs/js/FTAncestorChild.js` | `L99: ${BASE_URL}/familytree/persons/${personID}/relationships`; `L118: ${BASE_URL}/familytree/persons/${personID}` |
| `httpdocs/js/FTAncestorPartner.js` | `L99: ${BASE_URL}/familytree/persons/${personID}/relationships`; `L118: ${BASE_URL}/familytree/persons/${personID}` |
| `httpdocs/js/FTContact.js` | `L79: ${BASE_URL}/familytree/persons/${personID}`; `L93: ${BASE_URL}/familytree/persons/${personID}/contacts`; `L121: ${BASE_URL}/familytree/persons/${personID}/contacts/${button.dataset.id}/resend-verification`; `L183: ${BASE_URL}/familytree/persons/${personID}/contacts/${contactID}` |
| `httpdocs/js/FTEvent.js` | `L116: ${BASE_URL}/familytree/persons/${personID}`; `L132: ${BASE_URL}/familytree/persons/${personID}/events`; `L223: ${BASE_URL}/familytree/persons/${personID}/events/${eventID}` |
| `httpdocs/js/FTNetwork.js` | `L77: ${BASE_URL}/familytree/persons/${personID}`; `L121: ${BASE_URL}/familytree/network/search` |
| `httpdocs/js/FTOneTreeMerge.js` | `L31: ${BASE_URL}/familytree/one-tree/review`; `L33: ${BASE_URL}/familytree/one-tree/merge` |
| `httpdocs/js/FTPerson.js` | `L200: ${BASE_URL}/familytree/persons/${personID}/contacts`; `L201: ${BASE_URL}/familytree/persons/${personID}/events`; `L211: ${BASE_URL}/familytree/persons/${personID}`; `L256: ${BASE_URL}/familytree/persons/${personID}/relationships`; `L341: ${BASE_URL}/familytree/persons/${personID}/profile-image`; `L367: ${BASE_URL}/familytree/persons/${personID}/life-images`; `L493: ${BASE_URL}/familytree/persons/${personID}`; `L544: ${BASE_URL}/familytree/persons/${personID}/pictures`; `L644: ${BASE_URL}/familytree/persons/${personID}/pictures`; `L684: ${BASE_URL}/familytree/persons/${personID}/pictures/${contextImageID}/make-profile`; `L826: ${BASE_URL}/familytree/persons/duplicates`; `L886: ${BASE_URL}/familytree/children/${childID}/partner-parent`; `L959: ${BASE_URL}/familytree/siblings/${siblingID}/shared-parents`; `L996: ${BASE_URL}/familytree/parents/${parentID}/shared-siblings`; `L1023: ${BASE_URL}/familytree/persons/${child.PersonID}/relationships`; `L1096: ${BASE_URL}/familytree/children/${childID}/partner-parent`; `L1145: ${BASE_URL}/familytree/use-existing-person`; `L1186: ${BASE_URL}/familytree/related-person`; `L1238: ${BASE_URL}/familytree/persons/${personID}`; `L1331: ${BASE_URL}/familytree/persons/${personID}/network`; `L1382: ${BASE_URL}/familytree/persons/${personID}/network`; `L1439: ${BASE_URL}/familytree/persons/${personID}/network`; `L1467: ${BASE_URL}/familytree/persons/${personID}/network` |
| `httpdocs/js/FTPersonDuplicate.js` | `L18: ${BASE_URL}/familytree/persons/${personID}/duplicate-view` |
| `httpdocs/js/FTPersonList.js` | `L94: ${BASE_URL}/familytree/enter-code`; `L241: ${BASE_URL}/familytree/split-view` |
| `httpdocs/js/FTPersonNew.js` | `L26: ${BASE_URL}/familytree/persons/duplicates`; `L27: ${BASE_URL}/familytree/use-existing-person`; `L28: ${BASE_URL}/familytree/persons/${personID}/relationships`; `L31: ${BASE_URL}/familytree/children/${childID}/partner-parent`; `L32: ${BASE_URL}/familytree/persons/${personID}/contacts`; `L33: ${BASE_URL}/familytree/persons/${personID}/contacts`; `L34: ${BASE_URL}/familytree/persons/${personID}/events`; `L35: ${BASE_URL}/familytree/related-person`; `L37: ${BASE_URL}/familytree/persons`; `L39: ${BASE_URL}/familytree/persons/${personID}/profile-image`; `L45: ${BASE_URL}/familytree/persons/${personID}/events` |
| `httpdocs/js/FTPets.js` | `L18: ${api}`; `L22: ${api}/${p.petID}`; `L23: ${api}/${p.petID}/picture`; `L24: ${api}/${p.petID}/picture` |
| `httpdocs/js/FTPrivacy.js` | `L23: ${base}/familytree/privacy/${path}` |
| `httpdocs/js/FTUndoOneTreeMerge.js` | `L27: ${BASE_URL}/familytree/current-tree`; `L42: ${BASE_URL}/familytree/one-tree/undo-options`; `L74: ${BASE_URL}/familytree/one-tree/undo-review/${treeMergeID}`; `L119: ${BASE_URL}/familytree/one-tree/undo` |
| `httpdocs/login.html` | `L135: ${BASE_URL}/users/login`; `L180: ${BASE_URL}/users/verify-code` |
| `httpdocs/networkVerification.html` | `L154: /notifications/network-verification/${encodeURIComponent(token)}`; `L184: /notifications/network-verification/${encodeURIComponent(token)}` |
| `httpdocs/notificationPreferences.html` | `L159: ${BASE_URL}/notifications/preferences`; `L182: ${BASE_URL}/notifications/preferences` |
| `httpdocs/register.html` | `L382: ${BASE_URL}/users/register` |
| `httpdocs/SubControl.html` | `L703: ${BASE_URL}/subscriptions/admin/promos`; `L721: ${BASE_URL}/users/is-admin`; `L847: ${BASE_URL}/subscriptions/admin/promo-redemptions`; `L882: ${BASE_URL}/subscriptions/admin/grants`; `L922: ${BASE_URL}/subscriptions/admin/grants/${grant.grantId}`; `L953: ${BASE_URL}/subscriptions/admin/grants/${grantId}`; `L988: ${BASE_URL}/subscriptions/admin/user/${encodeURIComponent(userId)}`; `L1043: ${BASE_URL}/subscriptions/admin/grant`; `L1087: ${BASE_URL}/admin-management/${path}` |
| `httpdocs/subscription.html` | `L457: ${BASE_URL}/subscriptions/status`; `L495: ${BASE_URL}/subscriptions/promo` |
| `httpdocs/track.html` | `L351: ${BASE_URL}${path}` |
| `httpdocs/unsubscribe.html` | `L46: ${BASE_URL}/notifications/unsubscribe/${encodeURIComponent(token)}`; `L62: ${BASE_URL}/notifications/unsubscribe/${encodeURIComponent(token)}` |


`routes/budget.js` registers source routes through `registerSource` and `Object.values(SOURCES).forEach(registerSource)`, plus `registerBalanceSource`; static route declarations include template parameters and variable bases. A later endpoint contract exercise must expand these configurations and resolve methods, middleware order and consumers. No router was imported or instantiated for this inventory.

`FTPrivacy.js` wraps `window.fetch` and supplies `X-FT-Page-Token`; `FTPerson.js` makes direct requests including image workflows. Shared transport capture, private-page tokens, multipart boundaries and usage keepalive remain existing cross-file review topics. No new compliance conclusion is made.

Public email navigation links are generated by `routes/ftPrivacy.js` → `FTPrivacyVerification.html`, `routes/familyTree.js` → `FTEmailVerification.html` / `networkVerification.html`, and `services/notificationService.js` → `unsubscribe.html`. All target pages exist. Capability token values were not collected.

## PWA and asset dependencies

`httpdocs/sw.js` declares cache `wonderful-apps-cache-v10`, explicit HTML/static asset lists, `/js/waPlatform.js`, manifest, favicon and two Android Chrome icons. Listed literal cache assets exist locally. Root / resolves through server/home handling. The source describes network-first HTML/auth-module behavior, cache-first static assets, and bypasses for Authorization/non-GET/unlisted paths; none was tested here.

`manifest.json` references launch/scope and icons. The inventory preserves script query strings separately from file identities. Mixed service-worker/client versions and rollback remain WA-CF-015 / S6-024 review topics; local presence does not establish cache deployment consistency.

Confirmed missing image files:

| Referencing source | Line | Absent local path | Disposition |
| --- | --- | --- | --- |
| `httpdocs/bday.html` | 63 | `httpdocs/images/22.png` | Literal img src exists; target absent from recursive local tree. Browser result not tested. |
| `httpdocs/bday.html` | 64 | `httpdocs/images/77.png` | Literal img src exists; target absent from recursive local tree. Browser result not tested. |


`httpdocs/ContactUs.html:9` contains a commented `Style.css` link; it is not an active stylesheet dependency. `routes/budget.js:3` contains a commented mounting example with `require('./routes/budget')`; it is not a missing relative module import. Remaining lexical expression captures were not promoted to missing-file findings.

## TNNA native and shared-backend relationships

`TNNA/capacitor.config.json` selects `public` as webDir. `TNNA/public/index.html` and `config.js` are native WebView sources. Capacitor packages counterparts into `TNNA/android/app/src/main/assets/public/`. Generated packaged runtime assets remain individual inventory rows; Android build outputs and dependency folders are summarized exclusions.

`MainActivity.java` registers `TownLocationPlugin` and `TnnaAccountPlugin`; the manifest declares MainActivity, TownLocationService, permissions, provider and resources. TownLocationPlugin controls TownLocationService; the service uses BoundaryIndex and Android location/TTS facilities. Android resources under `src/main/res/` are build-packaged inputs.

`BoundaryIndex.java` reads `public/data/us/manifest.json` through AssetManager and dynamically selects shard filenames from manifest entries. Both public-source and packaged manifests contain 51 state/DC shard entries, all locally present: 52 files per tree including each manifest. The 52 source dataset files match their packaged counterparts by SHA-256. No geographic accuracy, parsing execution or device/offline test was performed.

`TNNA/tools/build-us-boundaries.mjs` is referenced by `build:boundaries` and writes these datasets using the configured Census source. It was read, never run. Resource provenance strings are file declarations, not independently checked external facts.

Two source/packaged copy mismatches are verified:

| Public source | Source SHA-256 | Packaged counterpart SHA-256 |
| --- | --- | --- |
| `TNNA/public/config.js` | `ccb99c220981abba33a8d8716f74575c9650c95e7ef651d42d9346d27338ec2d` | `422eb4809347e59c9058c21625dfe15cc0e18d701de020d968d67116f9d61fcd` |
| `TNNA/public/index.html` | `0602c8336332e6058fa4d15d72025acd42ce3c30e7153ef830540f73e6f09d57` | `4b61693f3211b9b201c503e1dfbb08d9aa8d5f37351d541094f16ad9bb07b6e8` |


These mismatches require owner reconciliation before a native build/release claim. No sync, overwrite or correction was performed.

TNNA shares backend `/users/register`, `/users/login` and `/tnna/*` workflows; backend files are inventoried once, with caller relationships recorded. Native plugin/device state and server session records are distinct from browser storage. D10 native lifetime/offline policy and D08 browser modernization remain separate; this inventory does not assess whether implementation meets either policy.

## Build/runtime configuration

Root `.node-version` declares 24.22.1. Root package-lock v3 resolves Express 5.1.0, mysql2 3.14.1 and Axios 1.13.5. TNNA package engines declare Node >=24; its lock v3 resolves Capacitor core/android/cli 8.5.2. These are local declarations/resolutions, not verification of installed executables or successful builds.

Gradle wrapper declares 8.14.3; Android Gradle Plugin declares 8.13.0; generated Capacitor/Cordova build inputs declare Java 21 compatibility. Android variables declare minSdk 24, compileSdk 36 and targetSdk 36; app versionCode 2 / versionName 1.1. No toolchain command or build was run.

`settings.gradle` links app, generated Cordova project and capacitor.settings.gradle. The latter refers to the locally present package-managed `TNNA/node_modules/@capacitor/android/capacitor` project. Wrapper JAR/properties, launchers, generated Gradle files and manifests are retained as functional build inputs. Maven/Gradle network resolution is not verified. Optional google-services.json is guarded by existing source; absence is not treated as an unconditional startup dependency.

`.env`, `.env.test`, local.properties, keystore.properties and the referenced signing key are hashed metadata-only inventory rows. No values/passwords/private key bytes are reproduced. Environment selection and signing validity were not tested. Existing docs describe .env.test launch selection; this task did not start either environment.

## Exclusions, unresolved roles and evidence

All 80 filenames containing _COPY are excluded by the owner's explicit rule, including source-looking and patch copies. No _COPY reference was found in the scanned active browser/backend/native text. Because server.js serves httpdocs statically, exclusion is not proof these copies cannot be reached by URL; no reachability test or cleanup occurred.

The three Review Required rows are:

| Path | Reason |
| --- | --- |
| `httpdocs/downloads/tnna/TownNotification-v1.0-development.apk` | Role-based applicability scope, not a compliance assessment. Delivery artifact retained; build-directory outputs excluded; APK signature/build not examined. Publicly served deliverable, but no current literal download link found; confirm whether still supported. Generated origin retained. |
| `httpdocs/images/logo.png` | Role-based applicability scope, not a compliance assessment. No confirmed incoming reference; owner role decision required. |
| `TNNA/assets/icon/logoWA.jpg` | Role-based applicability scope, not a compliance assessment. No confirmed incoming reference; owner role decision required. |


Test-only SQL under sql/ and root preflight/reset scripts are not application startup dependencies. `docs/BudgetDescription_Global_List.sql` is documented as a manual SQL reference; no automatic runtime invocation was found. `routes/users.js:147` mentions absent `notification_schema.sql` in an error instruction. This is an unresolved historical/bootstrap provenance reference, not proof of a missing loaded module or permission to run SQL. Required future operational migrations must be explicitly identified against the intended schema.

Existing WA-CF/S6 links are carried from register v1.1 and dated Stage 6 records; no issue status or Compliance Register was modified. Preserve bounded R10/R14/R15 and R16 evidence. The November 15 handoff/register records later R16-75 installed/bounded evidence that postdates the older November 12 paused descriptions; browser T09/T10 and broader review remain unverified.

## Limits and next gate

Static extraction does not prove successful execution, complete runtime reachability, method-level authorization, absence of dynamically constructed dependencies, correct SQL/schema state, CDN availability, APK provenance, native compatibility, or byte identity with Drive/GitHub/Render. Drive remains authoritative; the owner expressly selected local files for Wave 0 because connector folder listings previously omitted known functional files.

Resolve the two missing images, three role decisions, native packaged/source mismatch and bootstrap-reference provenance before claiming dependency closure. Review these reports first; do not start Wave 1 or corrections without further owner instructions.
