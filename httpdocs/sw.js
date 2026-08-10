const CACHE_NAME = 'wonderful-apps-cache-v6';

const urlsToCache = [
  '/',
  '/home.html',
  '/TownNotice.html',
  '/Activities.html',
  '/amortization.html',
  '/ContactUs.html',
  '/index.html',
  '/InterestEarned.html', 
  '/login.html', 
  '/propertyInfo.html',
  '/register.html',
  '/track.html',
  '/Weights.html',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  /* =====================================================
     🔒 FIREFOX FIX:
     Do NOT intercept cross-origin requests
     (prevents CORS errors with Nominatim)
  ===================================================== */
  if (requestUrl.origin !== self.location.origin) {
    return; // Let the browser handle it normally
  }

  const isHtmlRequest =
    event.request.mode === 'navigate' ||
    requestUrl.pathname.endsWith('.html');

  if (isHtmlRequest) {
    // Network-first for HTML pages:
    // use the newest page from the server when available,
    // and fall back to the cached copy only if the network fails.
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseCopy))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first remains appropriate for ordinary static assets.
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});
