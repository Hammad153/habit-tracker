// Replaced with a unique cache name by scripts/stamp-web-build.cjs.
const CACHE_NAME = "ember-web-55c28e83-a237-4edc-accc-a82d6b3926c7";
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ember-web-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-cache" }).catch(() => caches.match("/offline.html")),
    );
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isStaticAsset =
    requestUrl.pathname.startsWith("/_expo/") ||
    requestUrl.pathname.startsWith("/assets/") ||
    requestUrl.pathname === "/manifest.webmanifest" ||
    requestUrl.pathname === "/favicon.ico";
  if (!isStaticAsset) return;

  const responsePromise = (async () => {
    const cache = await caches.open(CACHE_NAME);
    // Expo fingerprints bundles; public assets can change at the same URL.
    const immutable = /\/_expo\/static\/.+-[a-f0-9]{32}\.(js|css)$/.test(requestUrl.pathname);
    if (immutable) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
    }
    try {
      const response = await fetch(event.request, { cache: "no-cache" });
      if (response.ok) {
        await cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw error;
    }
  })();
  event.respondWith(responsePromise);
  event.waitUntil(responsePromise.then(() => {}, () => {}));
});
