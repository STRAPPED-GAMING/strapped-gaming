/* STRAPPED GAMING service worker.
   IMPORTANT: when you change any file, bump CACHE_VERSION so visitors get the update.
   When you add a game in /my-games, add its files to PRECACHE below. */
const CACHE_VERSION = "v1";
const CACHE = "strapped-gaming-" + CACHE_VERSION;
const PRECACHE = [
  "./", "index.html", "style.css", "app.js", "manifest.json",
  "games/catalog.js", "games/snake.js", "games/tictactoe.js", "games/memory.js", "games/game2048.js", "games/flappy.js",
  "my-games/click-rush/index.html",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("strapped-gaming-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Page loads: network first (fresh when online), cached page when offline
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put("index.html", r.clone())); return r; })
      .catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }
  // Everything else: cache first, then network (and remember it)
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
