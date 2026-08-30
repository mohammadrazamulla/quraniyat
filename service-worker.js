// Quraniyat service worker — makes the app installable and lets the shell load offline.
// The Quran text/audio/translation logic already works offline on its own (it's embedded
// in the HTML); this just caches the app file itself so the *app* opens without a network
// connection too, and satisfies the PWA requirement Android's installer checks for.

const CACHE_NAME = 'quraniyat-cache-v1';
const FILES_TO_CACHE = [
  './quraniyat.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
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
  // Cache-first for the app shell; anything else (audio, prayer times, tafsir, geocoding)
  // just goes to the network as normal, since those already have their own online/offline
  // handling built into the app.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
