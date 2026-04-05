// =========================
// VERSION
// =========================
const CACHE_NAME = "financeplus-v10";

// =========================
// FILES TO CACHE
// =========================
const urlsToCache = [
  "./",
  "./index.html",
  "./app.js",
  "./revenus.js"
];

// =========================
// INSTALL
// =========================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// =========================
// ACTIVATE
// =========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

// =========================
// FETCH (CACHE FIRST + UPDATE)
// =========================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {

          // On met à jour le cache avec la nouvelle version
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });

          return networkResponse;
        })
        .catch(() => cachedResponse); // fallback offline

      // Si on a du cache → on renvoie direct (rapide ⚡)
      return cachedResponse || fetchPromise;
    })
  );
});