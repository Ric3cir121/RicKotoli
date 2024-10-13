self.addEventListener('install', event => {
    event.waitUntil((async ()=>{
        await caches.delete('availableOffline');
        (await caches.open('availableOffline')).addAll(['/', '/index.hmtl', '/kotoli.json', '/manifest.json', 'index.js', 'index.css']);
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith((async ()=>{
        const cache = await caches.open('availableOffline');

        // Try the cache first.
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse !== undefined) {
            return cachedResponse;
        } else {
            return fetch(event.request);
        }
    })())
})