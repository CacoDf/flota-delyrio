// Flota Delyrio: guarda la app para abrir sin señal.
// data.enc.json -> red primero, caché si no hay señal. Resto -> caché y se renueva en segundo plano.
const V = "flota-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.pathname.endsWith("/data.enc.json")) {
    e.respondWith((async () => {
      const cache = await caches.open(V);
      try {
        const r = await fetch(req, { cache: "no-store" });
        if (r.ok) await cache.put(url.pathname, r.clone());
        return r;
      } catch (err) {
        const c = await cache.match(url.pathname);
        if (!c) throw err;
        const h = new Headers(c.headers);
        h.set("X-Desde-Cache", "1");
        return new Response(await c.blob(), { status: 200, headers: h });
      }
    })());
    return;
  }

  const propio = url.origin === location.origin;
  const fuentes = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!propio && !fuentes) return;

  e.respondWith((async () => {
    const cache = await caches.open(V);
    const key = req.mode === "navigate" ? "index.html" : req;
    const c = await cache.match(key, { ignoreSearch: req.mode === "navigate" });
    const red = fetch(req).then(r => {
      if (r.ok || r.type === "opaque") cache.put(key, r.clone());
      return r;
    }).catch(() => c);
    if (c) { e.waitUntil(red); return c; }
    return red;
  })());
});
