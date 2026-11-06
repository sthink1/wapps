# WA Stage 6 — R10-14 Offline Home Fail-Closed Revision

## Scope
Replaces only `httpdocs/home.html` and `httpdocs/sw.js` on branch `reviseLogIn`, after user review. Do not edit `main`, production, database records, or other project files.

## Findings addressed
* Nine Home restricted buttons are disabled by default in HTML, even when scripts fail to load.
* When the shared module is not available, the cached Home page displays `Offline — session cannot be verified` when a token is stored; it does not silently imply that the server revoked the session.
* When restoration returns `network`, `server_error`, or `restore_unavailable`, Home displays the unavailable state and leaves restricted buttons disabled.
* Subscription access may enable permitted application buttons only after successful server-backed validation. Contact Us, which has no app subscription key, is explicitly re-enabled after that validation.
* `sw.js` v10 explicitly caches `/js/waPlatform.js`. Its code uses network-first and cache fallback for the module; authenticated/API requests remain uncached. An older SW without the module is also handled safely by the Home fallback.

## Installation (user action only)
1. Make a backup in your normal workflow, and inspect the included `.diff` files.
2. Replace `httpdocs/home.html` and `httpdocs/sw.js` on the **reviseLogIn** staging branch only.
3. Commit/sync and deploy to **wapps-stage6-test** after confirming the separate staging target.
4. Test online first: logged-in charter Standard plan, five expected subscription-denied application buttons, Contact Us enabled, no errors.
5. Verify active service worker updated to `wonderful-apps-cache-v10` (using the Application → Service Workers panel); allow service-worker activation and refresh as necessary. Recheck current staging version before offline test.
6. Offline reload with DevTools Network Offline: user display should read `Offline — session cannot be verified`, subscription area `Application access unavailable while offline`; all nine `.restricted-btn` elements disabled, retained token true.
7. Restore network and reload. Verify normal application access and no errors.

## Safety and limitations
* No offline access to private API responses or authenticated app data is introduced.
* Offline fallback distinguishes unavailable verification from actual server-confirmed logout. It does not authenticate a stored token without a server response.
* This does not resolve all Stage 6 R10/R14 concerns or modify unrelated Interest Earned page behavior.
* Do not replace any generic project `README.md` — none is included in this package.
