const APP_CACHE = 'learn-flood-app-v2';
const AUDIO_CACHE = 'learn-flood-audio-v2';
const APP_FILES = [
  './', './index.html', './style.css', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([APP_CACHE, AUDIO_CACHE]);
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith('learn-flood-') && !keep.has(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function rangeResponse(request, cached) {
  const range = request.headers.get('range');
  if (!range) return cached;

  const buffer = await cached.arrayBuffer();
  const size = buffer.byteLength;
  const match = /bytes=(\d+)-(\d*)/.exec(range);
  if (!match) return new Response(null, { status: 416 });
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : size - 1;
  if (start >= size || end >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  const chunk = buffer.slice(start, end + 1);
  const headers = new Headers(cached.headers);
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(chunk.byteLength));
  headers.set('Content-Type', cached.headers.get('Content-Type') || 'audio/mpeg');
  return new Response(chunk, { status: 206, statusText: 'Partial Content', headers });
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.toLowerCase().endsWith('.mp3')) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const fullRequest = new Request(url.href, { method: 'GET' });
      let cached = await cache.match(fullRequest);
      if (cached) return rangeResponse(event.request, cached);
      // Online: let the server handle Range requests normally.
      try { return await fetch(event.request); }
      catch { return new Response('', { status: 503, statusText: 'Audio not available offline' }); }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        const cache = await caches.open(APP_CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch {
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      return new Response('Offline', { status: 503 });
    }
  })());
});
