console.log("Hi i'm from the service-worker.js file!")

//variable to store an array of strings that represents what static files we want to cahce for our application
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/index.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
]

//variables to store the names of our cache
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

//install
self.addEventListener("install", function (evt) {

    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => { cache.addAll(FILES_TO_CACHE)})
    );

    self.skipWaiting();
})

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old chache data", key)
                        return caches.delete(key);
                    }
                })
            )
        })
    )
    self.clients.claim();
})

self.addEventListener('fetch', function (evt) {
    if(evt.request.url.includes('/api/')) {
        console.log('[Service Worker] fetch (data)', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(evt.request.url, response.clone())
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            })
        );
        return;
    }
    evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
            return response || fetch(evt.request)
        })
    })
)
})

