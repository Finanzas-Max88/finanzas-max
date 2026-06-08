const CACHE_NAME = "finanzas-max-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/app.css",
  "/js/app.js",
  "/js/auth.js",
  "/js/database.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});