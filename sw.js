// Define the name of the cache.
const CACHE_NAME = 'my-pwa-cache-v1';

// The install event
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
});

// The activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cache => cache !== CACHE_NAME)
                  .map(cache => caches.delete(cache))
      );
    })
  );
});

// The fetch event - network-first strategy with caching
self.addEventListener('fetch', event => {
  // Only handle requests from our own origin
  if (event.request.url.startsWith(self.location.origin)) {
    // Handle navigation requests (like the root URL) differently
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Cache the successful response
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // If network fails, try to serve the exact request from cache
            return caches.match(event.request).then(response => {
              if (response) return response;

              // If the exact request isn't in the cache, try to serve index.html
              return caches.match('/index.html').then(indexResponse => {
                if (indexResponse) return indexResponse;

                // If nothing is found in cache, return a basic offline page
                return new Response(
                  '<!DOCTYPE html><html><body><h1>Offline</h1><p>This app requires an internet connection to load initially.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
                );
              });
            });
          })
      );
    } else {
      // For non-navigation requests (like CSS, JS, images)
      event.respondWith(
        fetch(event.request)
          .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
    }
  } else {
    // For cross-origin requests, just fetch from the network
    event.respondWith(fetch(event.request));
  }
});