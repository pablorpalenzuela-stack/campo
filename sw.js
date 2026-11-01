// Campo: caché para funcionar sin conexión
const CACHE = 'campo-v1.6.1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './nombres.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Los informes previos se guardan en la base de datos de la aplicación, no en la caché
  if (new URL(e.request.url).pathname.includes('/paquetes/')) return;
  e.respondWith(
    // «no-cache»: con conexión, preguntar siempre al servidor si hay versión nueva (GitHub deja 10 min de caché)
    fetch(e.request.url, { cache: 'no-cache' }).then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
