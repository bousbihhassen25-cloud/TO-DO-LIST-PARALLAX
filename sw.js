const CACHE_NAME = 'todo-parallax-v3-2';
const ASSETS = [
  '/TO-DO-LIST-PARALLAX/',
  '/TO-DO-LIST-PARALLAX/index.html',
  '/TO-DO-LIST-PARALLAX/manifest.webmanifest?v=3.2',
  '/TO-DO-LIST-PARALLAX/icons/icon-192.png',
  '/TO-DO-LIST-PARALLAX/icons/icon-512.png'
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
      if (req.mode === 'navigate') return cache.match('/TO-DO-LIST-PARALLAX/index.html');
      throw err;
    }
  })());
});
