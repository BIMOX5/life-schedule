// Leidžia atidaryti programėlę be ryšio (rodo paskutinę versiją)
const CACHE = 'lifeschedule-v3';
const FILES = ['./', 'index.html', 'style.css', 'config.js', 'db.js', 'core.js', 'ui.js', 'icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/') || e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
