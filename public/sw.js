/**
 * Number Puzzle PWA - Service Worker
 * Provides offline functionality and caching with auto-updates
 */

// Generate cache version based on current timestamp for automatic updates
const CACHE_VERSION = '1.0.0';
const BUILD_TIMESTAMP = 1773899278904; // Built on: 2026-03-19T00:58:30.397Z
const CACHE_NAME = `number-puzzle-v${CACHE_VERSION}-${BUILD_TIMESTAMP}`;

const urlsToCache = [
  './',
  './index.html',
  './src/main.js',
  './src/game.js', 
  './src/operations.js',
  './src/exerciseGenerator.js',
  './src/style.css',
  './manifest.json'
];

// Install event - cache resources and skip waiting
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching app resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log('✅ Service Worker: Activation complete - Now controlling all pages');
    })
  );
});

// Fetch event - serve from cache with network fallback
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
            
            // Add to cache for future requests
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
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
