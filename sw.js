// sw.js — Service Worker FIRE Dashboard
// Met en cache l'app pour un accès hors-ligne

const CACHE_NAME = 'fire-v4';
const BASE_URL = new URL(self.registration.scope);
const CACHE_NAME = 'fire-v3';
const BASE_URL = new URL(self.registration.scope);

// Fichiers à mettre en cache au démarrage.
// Les URL sont résolues depuis le scope du service worker pour fonctionner
// aussi bien sur /fire-dashboard/ que sur /.
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
].map(path => new URL(path, BASE_URL).toString());


// ── INSTALLATION : mise en cache initiale ──────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ── ACTIVATION : nettoyage des anciens caches ──────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH : stratégie Network-first, Cache fallback ────
// → Essaie d'abord le réseau (données fraîches)
// → Si offline, sert depuis le cache (dernières données vues)
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes Firebase/API (laisser passer)
  const url = new URL(event.request.url);
  const isExternal = url.hostname !== self.location.hostname;
  
  if (isExternal) {
    // Requêtes externes (Firebase, Binance, etc.) → réseau direct
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Fichiers locaux → Network-first avec fallback cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache avec la réponse fraîche
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Offline → servir depuis le cache
        return caches.match(event.request).then(cached => {
          return cached || new Response('<h1>Hors-ligne</h1><p>Reconnecte-toi pour synchroniser.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        });
      })
  );
});
