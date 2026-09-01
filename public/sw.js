// Hermes Remote — Service Worker (cache estático)
const CACHE = 'hermes-remote-v13';
const FILES = [
  '/', '/index.html',
  '/css/tokens.css', '/css/style.css', '/css/responsive.css',
  '/js/components.js', '/js/state.js', '/js/app.js', '/js/dashboard.js', '/js/sidebar.js', '/js/todos.js', '/js/markdown.js',
  '/manifest.json',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-512.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    fetch(e.request).catch(function () { return caches.match(e.request).then(function (r) { return r || new Response('Offline'); }); })
  );
});