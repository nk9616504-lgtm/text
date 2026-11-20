const CACHE_NAME = 'yuga-audio-studio-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html', { ignoreSearch: true }) || await caches.match('/', { ignoreSearch: true });
          return cached || new Response(
            '<!DOCTYPE html><html><body style="background:#070913;color:#f8fafc;font-family:sans-serif;text-align:center;padding:48px 20px;"><h2>Yugamugesh AI Audio Studio</h2><p>You are offline. Please check your internet connection and tap Retry.</p><button onclick="location.reload()" style="padding:12px 24px;border-radius:10px;border:none;background:#4f46e5;color:#fff;font-weight:700;">Retry</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
