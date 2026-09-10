/* Truco League - Service Worker v6
   Objetivo: que index.html siempre se actualice correctamente.
   Las librerías externas (Tailwind / React / Firebase) NO son interceptadas
   mientras hay Internet, para evitar problemas de diseño o scripts viejos.
*/

const CACHE_NAME = 'truco-league-shell-v6';
const INDEX_URL = './index.html';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Guardamos una copia del index actual como respaldo offline.
    try {
      const response = await fetch(INDEX_URL, { cache: 'no-store' });
      if (response && response.ok) {
        await cache.put(INDEX_URL, response.clone());
      }
    } catch (error) {
      console.warn('[SW] No se pudo guardar index.html:', error);
    }

    // Activa la nueva versión inmediatamente.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    // Elimina versiones anteriores del Service Worker.
    await Promise.all(
      keys
        .filter(key => key.startsWith('truco-league-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    // Toma control inmediatamente de las pestañas abiertas.
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Solo interceptamos las navegaciones HTML de la aplicación.
  // Esto evita que el SW interfiera con Tailwind, React, Babel o Firebase.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // SIEMPRE intenta obtener la versión actual desde GitHub Pages.
        const response = await fetch(request, { cache: 'no-store' });

        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(INDEX_URL, response.clone());
        }

        return response;
      } catch (error) {
        // Sin conexión: usa la última versión guardada.
        const cached = await caches.match(INDEX_URL);
        if (cached) return cached;
        throw error;
      }
    })());

    return;
  }

  // index.html pedido directamente: también RED PRIMERO.
  if (url.pathname.endsWith('/index.html')) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });

        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(INDEX_URL, response.clone());
        }

        return response;
      } catch (error) {
        const cached = await caches.match(INDEX_URL);
        if (cached) return cached;
        throw error;
      }
    })());

    return;
  }

  // IMPORTANTE:
  // No interceptamos las librerías externas ni otros recursos.
  // El navegador los carga directamente desde su origen.
});