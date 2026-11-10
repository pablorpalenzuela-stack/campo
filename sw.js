// Campo: caché para funcionar sin conexión
const CACHE = 'campo-v1.8.0';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './nombres.json', './pelagicas.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(async c => { await c.addAll(FILES);
    // las fotos de la lista de pelágicas, para verlas sin conexión
    try { const j = await (await fetch('./pelagicas.json', { cache: 'no-cache' })).json();
      await c.addAll(Object.values(j.especies).flat().filter(e => e.foto).map(e => './' + e.foto)); } catch (err) {} })); self.skipWaiting(); });
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
