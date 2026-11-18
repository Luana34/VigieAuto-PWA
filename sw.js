/* VigieAuto : cache applicatif uniquement. Les données restent dans IndexedDB. */
const CACHE = "vigieauto-cache-v1.0";
// Préfixes nettoyés à l'activation : anciens caches CQ Auto / beta et caches VigieAuto précédents.
const PREFIXES = ["vigieauto-cache-", "cq-auto-app-"];
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./css/themes.css",
  "./js/app.js",
  "./js/precise-json.js",
  "./js/maintenance.js",
  "./js/expense-receipt.js",
  "./js/logo.js",
  "./js/db.js",
  "./js/vehicle-marker.js",
  "./js/vehicle-profile.js",
  "./js/vehicle-notes.js",
  "./js/odometer-history.js",
  "./js/gps.js",
  "./js/catalogue.js",
  "./data/brands_models_fr.json",
  "./js/calc.js",
  "./js/data.js",
  "./js/currency.js",
  "./assets/garage.jpg",
  "./assets/logo-vigieauto.svg",
  "./icons/icon-192.png?v=vigie-1.0.0",
  "./icons/icon-512.png?v=vigie-1.0.0",
  "./icons/maskable-512.png?v=vigie-1.0.0",
  "./icons/apple-touch-icon.png?v=vigie-1.0.0",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => PREFIXES.some((prefix) => k.startsWith(prefix)) && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches
        .match(new URL("./index.html", self.registration.scope))
        .then((hit) => hit || fetch(event.request)),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((hit) => hit || fetch(event.request)),
  );
});


