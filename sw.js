self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open('v2').then(function (cache) {
            return cache.addAll([
                '/repo1/',
                '/repo1/totaliseur.html',
                '/repo1/output.css',
                '/repo1/sprite.svg',
                '/repo1/totaliseur.js',
                '/repo1/onscreen-keyboard.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function (evt) {
    console.log(evt.request.url);
    evt.respondWith(
        caches.match(evt.request).then(function (response) {
            // always answering from cache
            return response || Promise.reject('No match');
        })
    );
});
