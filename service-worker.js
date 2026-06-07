// =========================
// CONFIG
// =========================

const DEV_MODE = false; // 🔥 true = dev / false = production
const CACHE_NAME = "financeplus-v34";

// fichiers à cacher (prod uniquement)
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",

  "./app.js",
  "./ui.js",

  "./revenus.js",
  "./depenses.js",
  "./epargne.js",

  "./manifest.json",

  "./iconapp-180.png",
  "./iconapp-512.png"
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

  event.respondWith(

    caches.match(event.request)
      .then(cachedResponse => {

        // ✅ cache trouvé
        if(cachedResponse){
          return cachedResponse;
        }

        // 🌐 sinon réseau
        return fetch(event.request)
          .then(networkResponse => {

            // copie réponse
            const responseClone = networkResponse.clone();

            // sauvegarde cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });

            return networkResponse;

          });

      })
      .catch(() => {

        // fallback offline minimal
        if(event.request.mode === "navigate"){
          return caches.match("./index.html");
        }

      })

  );

});
