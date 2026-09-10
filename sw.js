const CACHE_NAME = 'truco-league-shell-v2';
const APP_SHELL = ['./'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      const url = request.url;
      const cacheableExternal =
        url.startsWith('https://unpkg.com/') ||
        url.startsWith('https://cdn.tailwindcss.com/') ||
        url.startsWith('https://www.gstatic.com/firebasejs/');

      if (cacheableExternal) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }

      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const fallback = await caches.match('./');
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
