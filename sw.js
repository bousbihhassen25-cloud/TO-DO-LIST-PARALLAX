// Simple service worker for offline-first app shell
const CACHE_NAME = 'todo-parallax-v1';
const APP_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

// Cache-first for same-origin GET requests
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      // Optionally: put a copy into cache (ignore opaque/cross-origin images)
      if (fresh.ok && req.url.startsWith(self.location.origin)) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      // Offline fallback to app shell for navigation requests
      if (req.mode === 'navigate') {
        return cache.match('./index.html');
      }
      throw err;
    }
  })());
});
