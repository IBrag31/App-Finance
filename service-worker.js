// =========================
// CONFIG
// =========================

const DEV_MODE = false; // 🔥 true = dev / false = production
const CACHE_NAME = "financeplus-v2";

// fichiers à cacher (prod uniquement)
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./depenses.js",
  "./revenus.js",
  "./epargne.js",
  "./ui.js"
];

// =========================
// INSTALL
// =========================

self.addEventListener("install", event => {

  self.skipWaiting();

  if(DEV_MODE) return;

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// =========================
// ACTIVATE
// =========================

self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if(key !== CACHE_NAME){
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// =========================
// FETCH
// =========================

self.addEventListener("fetch", event => {

  // 🔥 MODE DEV → PAS DE CACHE
  if(DEV_MODE){
    event.respondWith(fetch(event.request));
    return;
  }

  // 🚀 MODE PROD → CACHE
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});