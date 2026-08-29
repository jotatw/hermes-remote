// Hermes Remote — Service Worker (cache estático)
const CACHE = 'hermes-remote-v1';
const FILES = ['/', '/index.html', '/css/style.css', '/js/app.js', '/js/dashboard.js', '/js/sidebar.js', '/js/todos.js', '/manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    fetch(e.request).catch(function () { return caches.match(e.request).then(function (r) { return r || new Response('Offline'); }); })
  );
});