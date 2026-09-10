const CACHE_NAME = 'truco-league-shell-v4';

const APP_SHELL = [
  './',
  './index.html',
  './sw.js'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of [...APP_SHELL, ...EXTERNAL_ASSETS]) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn('No se pudo cachear:', url, error);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  // Solo manejamos GET.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // INDEX.HTML: primero intenta Internet para obtener siempre
  // la versión más reciente. Si no hay conexión, usa caché.
  if (
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/')
  ) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put('./index.html', copy);
            });

            return response;
          }

          throw new Error('Respuesta de red no válida');
        })
        .catch(() => {
          return caches.match('./index.html');
        })
    );

    return;
  }

  // sw.js: siempre intenta actualizarlo desde Internet.
  if (url.pathname.endsWith('/sw.js')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put('./sw.js', copy);
            });
          }

          return response;
        })
        .catch(() => caches.match('./sw.js'))
    );

    return;
  }

  // Recursos externos: cache-first para permitir funcionamiento offline.
  if (
    url.origin === 'https://cdn.tailwindcss.com' ||
    url.origin === 'https://unpkg.com' ||
    url.origin === 'https://www.gstatic.com'
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, copy);
            });
          }

          return response;
        });
      })
    );

    return;
  }

  // Todo lo demás: red primero, caché como respaldo.
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(() => caches.match(request))
  );
});
