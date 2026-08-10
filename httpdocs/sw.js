const CACHE_NAME = 'wonderful-apps-cache-v7';

const urlsToCache = [
  '/',
  '/index.html',
  '/home.html',
  '/login.html',
  '/register.html',
  '/Activities.html',
  '/Weights.html',
  '/InterestEarned.html',
  '/TownNotice.html',
  '/ContactUs.html',
  '/amortization.html',
  '/propertyInfo.html',
  '/track.html',
  '/bday.html',
  '/etf.html',
  '/etfActivity.html',
  '/etfCategory.html',
  '/etfCompare.html',
  '/etfSymbol.html',
  '/budget.html',
  '/BmonthBudget.html',
  '/BmonthDetailReport.html',
  '/BinForm.html',
  '/BoutForm.html',
  '/BsubscriptionForm.html',
  '/BloanForm.html',
  '/BleaseRentForm.html',
  '/BestimateAllowanceForm.html',
  '/BcardForm.html',
  '/Breports.html',
  '/BsubscriptionReport.html',
  '/BloanReport.html',
  '/BleaseRentReport.html',
  '/BcardReport.html',
  '/BestimateAllowanceReport.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png'
];

/*
  Install:
  Pre-cache the normal user-facing WA pages and core PWA assets.
  etfAPItest.html is intentionally excluded because it is a development/test page.
*/
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

/*
  Fetch strategy:
  - Do not intercept cross-origin requests.
  - HTML/navigation requests are NETWORK-FIRST.
  - Successfully fetched HTML refreshes the cache for offline fallback.
  - Other same-origin static assets remain CACHE-FIRST.
*/
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    requestUrl.pathname.endsWith('.html');

  if (isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseCopy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request)
            .then(cachedResponse =>
              cachedResponse || caches.match('/home.html')
            )
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            if (
              response &&
              response.ok &&
              event.request.method === 'GET'
            ) {
              const responseCopy = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseCopy))
                .catch(() => {});
            }
            return response;
          });
      })
  );
});

/*
  Activate:
  Remove older WA caches and immediately control already-open WA pages.
*/
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});
