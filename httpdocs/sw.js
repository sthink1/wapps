const CACHE_NAME = 'wonderful-apps-cache-v12';
const WA_CACHE_PREFIX = 'wonderful-apps-cache-v';

const HTML_PAGES = [
  "/index.html",
  "/home.html",
  "/login.html",
  "/register.html",
  "/Activities.html",
  "/Weights.html",
  "/InterestEarned.html",
  "/TownNotice.html",
  "/ContactUs.html",
  "/amortization.html",
  "/propertyInfo.html",
  "/track.html",
  "/etf.html",
  "/etfActivity.html",
  "/etfCategory.html",
  "/etfCompare.html",
  "/etfSymbol.html",
  "/budget.html",
  "/BmonthBudget.html",
  "/BmonthDetailReport.html",
  "/BinForm.html",
  "/BoutForm.html",
  "/BsubscriptionForm.html",
  "/BloanForm.html",
  "/BleaseRentForm.html",
  "/BestimateAllowanceForm.html",
  "/BcardForm.html",
  "/Breports.html",
  "/BinReport.html",
  "/BoutReport.html",
  "/BsubscriptionReport.html",
  "/BloanReport.html",
  "/BleaseRentReport.html",
  "/BcardReport.html",
  "/BestimateAllowanceReport.html"
];
const STATIC_ASSETS = [
  "/manifest.json",
  "/js/waPlatform.js",
  "/favicon.ico",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];
const urlsToCache = [
  "/",
  "/index.html",
  "/home.html",
  "/login.html",
  "/register.html",
  "/Activities.html",
  "/Weights.html",
  "/InterestEarned.html",
  "/TownNotice.html",
  "/ContactUs.html",
  "/amortization.html",
  "/propertyInfo.html",
  "/track.html",
  "/etf.html",
  "/etfActivity.html",
  "/etfCategory.html",
  "/etfCompare.html",
  "/etfSymbol.html",
  "/budget.html",
  "/BmonthBudget.html",
  "/BmonthDetailReport.html",
  "/BinForm.html",
  "/BoutForm.html",
  "/BsubscriptionForm.html",
  "/BloanForm.html",
  "/BleaseRentForm.html",
  "/BestimateAllowanceForm.html",
  "/BcardForm.html",
  "/Breports.html",
  "/BinReport.html",
  "/BoutReport.html",
  "/BsubscriptionReport.html",
  "/BloanReport.html",
  "/BleaseRentReport.html",
  "/BcardReport.html",
  "/BestimateAllowanceReport.html",
  "/manifest.json",
  "/js/waPlatform.js",
  "/favicon.ico",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

const HTML_PAGE_SET = new Set(HTML_PAGES);
const STATIC_ASSET_SET = new Set(STATIC_ASSETS);
const AUTH_MODULE_PATH = "/js/waPlatform.js";
const MANIFEST_PATH = "/manifest.json";

/*
  SECURITY RULES

  1. Requests containing an Authorization header are NEVER intercepted or cached.
  2. API/application-data requests are NEVER intercepted or cached.
  3. Only the explicitly listed HTML pages and static PWA assets are cacheable.
  4. HTML, the auth module, and manifest are network-first with HTTP revalidation.
  5. Other listed static PWA assets remain cache-first.
  6. Cache reads and cleanup are scoped to WA-owned caches.
*/
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(
        urlsToCache.map(path => new Request(path, { cache: 'reload' }))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Critical: private/authenticated requests bypass the service worker entirely.
  if (request.headers.has('Authorization')) {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  const pathname = requestUrl.pathname;
  const isKnownHtml = HTML_PAGE_SET.has(pathname) || (pathname === '/' && request.mode === 'navigate');
  const isKnownStaticAsset = STATIC_ASSET_SET.has(pathname);
  const isAuthModule = pathname === AUTH_MODULE_PATH;
  const isManifest = pathname === MANIFEST_PATH;

  // Anything not explicitly approved is network-only. This includes every API route.
  if (!isKnownHtml && !isKnownStaticAsset && !isAuthModule) {
    return;
  }

  if (isKnownHtml || isAuthModule || isManifest) {
    event.respondWith((async () => {
      const cacheKey = pathname;
      let response;
      try {
        response = await fetch(request, { cache: 'no-cache' });
      } catch (_) {
        // A network failure permits offline fallback, but never to a different
        // cache generation or an unrelated cache on the same origin.
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(cacheKey);
        return cachedResponse ||
          (isKnownHtml ? await cache.match('/home.html') || Response.error() : Response.error());
      }
      if (response && response.ok) {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(cacheKey, response.clone());
        } catch (_) {
          // Cache storage failure must not hide a valid network response.
        }
      }
      return response;
    })());
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => cache.match(pathname))
      .catch(() => undefined)
      .then(cachedResponse => cachedResponse || fetch(request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith(WA_CACHE_PREFIX) &&
              /^\d+$/.test(cacheName.slice(WA_CACHE_PREFIX.length))) {
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});
