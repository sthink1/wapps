const CACHE_NAME = 'wonderful-apps-cache-v1';

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
