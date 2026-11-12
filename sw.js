// Leidžia atidaryti programėlę be ryšio (rodo paskutinę versiją)
const CACHE = 'lifeschedule-1.6.4';
const FILES = ['./', 'index.html', 'config.js', 'boot.js', 'releases.json', 'icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.includes('/console/') || e.request.method !== 'GET') return;
  // visada tikrinam, ar nėra naujesnės versijos (no-cache), be ryšio – iš atminties
  e.respondWith(fetch(e.request.url, {cache: 'no-cache'}).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});

// ===== Pranešimai iš serverio (Web Push) – ateina ir kai programėlė uždaryta =====
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = {body: e.data ? e.data.text() : ''}; }
  // tas pats „tag“ kaip programėlės priminimo – telefone nebus dviejų vienodų
  e.waitUntil(self.registration.showNotification(d.title || 'Life Schedule', {body: d.body || '', tag: d.tag || undefined, icon: 'icon.svg', badge: 'icon.svg', data: {url: d.url || './'}}));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(ws => { const w = ws.find(x => x.url.startsWith(self.registration.scope)); return w ? w.focus() : self.clients.openWindow(url); }));
});
