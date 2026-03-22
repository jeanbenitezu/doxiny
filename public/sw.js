/**
 * Service Worker Cleanup Script
 * This service worker removes all caches and unregisters itself
 * to ensure users always get the latest version without caching
 */

console.log('🧹 Cleanup Service Worker: Starting cleanup process...');

// Install event - skip waiting immediately
self.addEventListener('install', (event) => {
  console.log('🧹 Cleanup Service Worker: Installing and skipping waiting...');
  self.skipWaiting();
});

// Activate event - clean up all caches and unregister
self.addEventListener('activate', (event) => {
  console.log('🧹 Cleanup Service Worker: Activating cleanup...');
  
  event.waitUntil(
    Promise.all([
      // Delete ALL caches
      caches.keys().then((cacheNames) => {
        console.log('🗑️ Cleanup Service Worker: Found caches to delete:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('🗑️ Cleanup Service Worker: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
    .then(() => {
      console.log('✅ Cleanup Service Worker: All caches cleared');
      
      // Notify all clients to unregister this service worker
      return self.clients.matchAll();
    })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ 
          action: 'cleanup-complete',
          message: 'All caches cleared. Service worker will be unregistered.' 
        });
      });
    })
  );
});

// Fetch event - serve from cache with network fallback and dynamic caching
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache assets dynamically (JS, CSS, images)
            const url = new URL(event.request.url);
            if (url.pathname.includes('/assets/') || 
                url.pathname.endsWith('.js') || 
                url.pathname.endsWith('.css') ||
                url.pathname.endsWith('.png') ||
                url.pathname.endsWith('.svg')) {
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Network failed, serve offline page if available
            console.log('🌐 Service Worker: Network failed, serving from cache');
            return caches.match('./index.html');
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for game state (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Service Worker: Background sync triggered');
    // Could sync high scores, game stats, etc.
  }
});

console.log('🎮 Number Puzzle Service Worker loaded');
