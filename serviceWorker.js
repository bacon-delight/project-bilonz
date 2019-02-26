const version = "0.1";
const cacheName = `Document Creator-${version}`;
const cacheFiles = [
    `/`,
    `index.html`,
    `login.html`
];


self.addEventListener('install', function(event)
{
    event.waitUntil(
        caches.open(cacheName).then(function(cache)
        {
            console.log("SW Caching Cache Files");
            return cache.addAll(cacheFiles);
        })
    );
    console.log("SW Installed");
});

self.addEventListener('activate', function(event)
{
    event.waitUntil(
        caches.keys().then(function(cacheNames)
        {
            return Promise.all(cacheNames.map(function(thisCacheName)
            {
                if (thisCacheName!== cacheName)
                {
                    console.log("SW Removing Old Caches");
                    return caches.delete(thisCacheName);
                }
            }))
        })
    );
    console.log("SW Activated");
});

self.addEventListener('fetch', function(event)
{
    console.log("SW Fetcing: ", event.request.url);
    event.respondWith(
        caches.match(event.request) //To match current request with cached request it
        .then(function(response) {
            //If response found return it, else fetch again.
            console.log("SW Found Cache Files: ",event.request.url);
            return response || fetch(event.request);
        })
        .catch(function(error) {
            //console.error("Error: ", event.error);
        })
  );
});