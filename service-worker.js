const APP_CACHE = 'learn-flood-app-v5-2';
const AUDIO_CACHE = 'learn-flood-audio-v3';
const IMAGE_CACHE = 'learn-flood-images-v5-1';

const APP_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const IMAGE_FILES = [
  './images/section1/1.1.B_Welcome.jpg',
  './images/section1/1.1.Welcome.png',
  './images/section1/1.2.Introduction.png',
  './images/section1/1.3.TribeHistory.png',
  './images/section1/1.4.TurbulentTimes.png',
  './images/section1/1.5.IceAge.jpg',
  './images/section1/1.6.Stories.jpg',
  './images/section1/1.6.StoriesB.png',
  './images/section1/1.6.Stories_Hindu.png',
  './images/section1/1.6.Stories_Judaculla_Rock.jpg',
  './images/section1/1.7.ExtinctAnimals.png',
  './images/section2/2.1.EveryAnimal.jpg',
  './images/section2/2.2.Tools-For-Work.png',
  './images/section2/2.3.Farming.png',
  './images/section2/2.4.TribalVillage.png',
  './images/section2/2.5.Old-World-To-New-World.png',
  './images/section2/2.6.True-Knowledge-Abundant.png',
  './images/section2/2.7.Ark-Size.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const appCache = await caches.open(APP_CACHE);
    await appCache.addAll(APP_FILES);

    const imageCache = await caches.open(IMAGE_CACHE);
    await imageCache.addAll(IMAGE_FILES);
  })());

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([APP_CACHE, AUDIO_CACHE, IMAGE_CACHE]);
    const names = await caches.keys();

    await Promise.all(
      names
        .filter(name => name.startsWith('learn-flood-') && !keep.has(name))
        .map(name => caches.delete(name))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  // IMPORTANT: Preserve the proven V4.3/V5.0 audio behavior unchanged.
  if (url.pathname.toLowerCase().endsWith('.mp3')) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const cached = await cache.match(url.href);

      if (cached && !event.request.headers.has('range')) {
        return cached;
      }

      try {
        return await fetch(event.request);
      } catch {
        return new Response('', {
          status: 503,
          statusText: 'Audio not available offline'
        });
      }
    })());

    return;
  }

  // Keep images in their own offline image cache.
  if (url.pathname.includes('/images/')) {
    event.respondWith((async () => {
      const imageCache = await caches.open(IMAGE_CACHE);
      const cached = await imageCache.match(event.request);

      if (cached) return cached;

      try {
        const response = await fetch(event.request);

        if (response && response.ok) {
          await imageCache.put(event.request, response.clone());
        }

        return response;
      } catch {
        return new Response('Image not available offline', { status: 503 });
      }
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
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }

      return new Response('Offline', { status: 503 });
    }
  })());
});
