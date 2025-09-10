const CACHE_NAME = 'todo-parallax-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=2',
  './app.js?v=2',
  './manifest.webmanifest?v=2',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh.ok && req.url.startsWith(self.location.origin)) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      if (req.mode === 'navigate') return cache.match('./index.html');
      throw err;
    }
  })());
});
