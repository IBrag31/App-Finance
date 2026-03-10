const CACHE_NAME = "financeplus-v2.33";

const urlsToCache = [
"./",
"./index.html"
];

// INSTALL
self.addEventListener("install", event => {

self.skipWaiting();

event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => {
return cache.addAll(urlsToCache);
})
);

});

// ACTIVATE
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

// FETCH
self.addEventListener("fetch", event => {

event.respondWith(
caches.match(event.request)
.then(response => {
return response || fetch(event.request);
})
);

});
