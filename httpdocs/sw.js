const CACHE_NAME = 'wonderful-apps-cache-v8';

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
  "/bday.html",
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
  "/BsubscriptionReport.html",
  "/BloanReport.html",
  "/BleaseRentReport.html",
  "/BcardReport.html",
  "/BestimateAllowanceReport.html"
];
const STATIC_ASSETS = [
  "/manifest.json",
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
  "/bday.html",
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
  "/BsubscriptionReport.html",
  "/BloanReport.html",
  "/BleaseRentReport.html",
  "/BcardReport.html",
  "/BestimateAllowanceReport.html",
  "/manifest.json",
  "/favicon.ico",
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png"
];

const HTML_PAGE_SET = new Set(HTML_PAGES);
const STATIC_ASSET_SET = new Set(STATIC_ASSETS);

/*
  SECURITY RULES

  1. Requests containing an Authorization header are NEVER intercepted or cached.
  2. API/application-data requests are NEVER intercepted or cached.
  3. Only the explicitly listed HTML pages and static PWA assets are cacheable.
  4. HTML is network-first so current page changes appear on a normal refresh.
  5. Static PWA assets are cache-first.
*/
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
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

  // Anything not explicitly approved is network-only. This includes every API route.
  if (!isKnownHtml && !isKnownStaticAsset) {
    return;
  }

  if (isKnownHtml) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const cacheKey = pathname === '/' ? '/' : pathname;
            const responseCopy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(cacheKey, responseCopy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => {
          const cacheKey = pathname === '/' ? '/' : pathname;
          return caches.match(cacheKey)
            .then(cachedResponse => cachedResponse || caches.match('/home.html'));
        })
    );
    return;
  }

  event.respondWith(
    caches.match(pathname)
      .then(cachedResponse => cachedResponse || fetch(request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      ))
      .then(() => self.clients.claim())
  );
});
