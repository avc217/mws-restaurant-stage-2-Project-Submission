var resCaches = ["restaurant-info-v1", "restaurant-imgs-v1"];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("restaurant-info-v1").then(function(cache) {
      return cache.addAll([
        "/index.html",
        "/restaurant.html",
        "js/main.js",
        "js/idb.js",
        "js/dbhelper.js",
        "js/restaurant_info.js",
        "css/styles.css"
      ]);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheAll) {
      return Promise.all(
        cacheAll
          .filter(function(cachesAll) {
            return (
              cachesAll.startsWith("restaurant") &&
              !resCaches.includes(cachesAll)
            );
          })
          .map(function(cachesAll) {
            return caches.delete(cachesAll);
          })
      );
    })
  );
});

self.addEventListener("fetch", function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith("/images/")) {
      event.respondWith(addImages(event.request));

      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return fetch(event.request) || response;
    })
  );
});

function addImages(request) {
  var storeUrl = request.url;

  return caches.open("restaurant-imgs-v1").then(function(cache) {
    return cache
      .match(storeUrl, { ignoreSearch: true })
      .then(function(response) {
        if (response) return response;

        return fetch(request).then(function(netResponse) {
          cache.put(storeUrl, netResponse.clone());
          return netResponse;
        });
      });
  });
}
