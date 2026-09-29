const CACHE_VERSION = 'truc-league-v7';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => !key.startsWith(CACHE_VERSION))
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackPath = './index.html') {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await caches.open(SHELL_CACHE)).then(c => c.match(fallbackPath));
  }
}

async function runtimeThirdParty(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (error) {
    return cached || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(networkFirst(request));
      return;
    }
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response && response.ok) caches.open(RUNTIME_CACHE).then(cache => cache.put(request, response.clone())).catch(() => {});
        return response;
      }))
    );
    return;
  }

  // React, Firebase y Tailwind son recursos de la propia aplicación.
  // Se cachean en runtime para que la UI pueda abrirse sin conexión tras la primera carga online.
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(runtimeThirdParty(request));
  }
});
