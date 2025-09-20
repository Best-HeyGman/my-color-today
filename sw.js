// SPDX-License-Identifier: AGPL-3.0-or-later
// © 2025 Stephan Hegemann

// Define the name of the cache.
const CACHE_NAME = 'my-pwa-cache-v1';

// Define the maximum number of items to cache
const MAX_ITEMS = 50;

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

// Function to limit the number of cached items
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const itemsToDelete = keys.length - maxItems;
    const deletePromises = keys.slice(0, itemsToDelete).map(key => cache.delete(key));
    await Promise.all(deletePromises);
  }
}

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
                limitCacheSize(CACHE_NAME, MAX_ITEMS); // Limit the cache size
              });
            }
            return response;
          })
          .catch(async () => {
            // If network fails, try to serve the exact request from cache
            const response = await caches.match(event.request);
            if (response) return response;
            const indexResponse = await caches.match('/index.html');
            if (indexResponse) return indexResponse;
            return new Response(
              '<!DOCTYPE html><html><body><h1>Offline</h1><p>This app requires an internet connection to load initially.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
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
                limitCacheSize(CACHE_NAME, MAX_ITEMS); // Limit the cache size
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