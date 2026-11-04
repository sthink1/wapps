/* Stage 6 Group 5D — read-only Render browser preflight.
 * No requests, token reads/changes, cookies, lock acquisition, or DB writes.
 * Paste into DevTools Console at the dedicated Stage 6 TEST origin.
 */
(() => {
  'use strict';
  const expected = 'https://wapps-stage6-test.onrender.com';
  const checks = {
    exactTestOrigin: location.origin === expected,
    secureContext: window.isSecureContext === true,
    platformInstalled: typeof window.WA?.session?.restore === 'function',
    logoutInstalled: typeof window.WA?.session?.logout === 'function',
    webLocks: typeof navigator.locks?.request === 'function' &&
              typeof navigator.locks?.query === 'function',
    broadcastChannel: typeof window.BroadcastChannel === 'function',
    localStorageAccessible: false
  };
  try { checks.localStorageAccessible = !!window.localStorage; }
  catch (_) { /* avoid reading any key */ }
  console.table(checks);
  console.log('[S6-5D] PREFLIGHT', Object.values(checks).every(Boolean) ? 'PASS' : 'NOT READY');
  console.log('[S6-5D] No network requests or storage mutations performed.');
})();
