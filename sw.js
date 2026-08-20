/* ================================================================
   Tituplantus — Service Worker (version web / PWA)
   ----------------------------------------------------------------
   Rôle : mettre l'app en cache pour qu'elle fonctionne HORS-LIGNE
   et qu'elle soit installable sur téléphone / PC (écran d'accueil).

   Stratégie : « stale-while-revalidate »
   - On sert le cache immédiatement (rapide + hors-ligne)
   - Puis on met à jour le cache en arrière-plan quand on est en ligne

   ⚠️ Ne fonctionne QUE sur HTTPS (ou localhost).
      La version locale (file://) n'utilise PAS ce fichier.
   ================================================================ */

const CACHE = 'tituplantus-v1';

/* Tous les fichiers de l'app — à mettre à jour si on en ajoute */
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.json',
  './formats/models.js',
  './assets/xlsx.full.min.js',
  './assets/fonts/fonts.css',
  './assets/fonts/spacegrotesk.woff2',
  './assets/fonts/dmserifdisplay.woff2',
  './assets/fonts/ibmplexmono-400.woff2',
  './assets/fonts/ibmplexmono-600.woff2',
  './assets/fonts/tangerine-400.ttf',
  './assets/fonts/tangerine-700.ttf',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon.svg',
  './logo-LMDC-square1-1.png'
];

/* Installation : pré-cache de tous les fichiers */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activation : suppression des anciens caches (changement de version) */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* Interception des requêtes : cache d'abord, réseau en arrière-plan */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Ne pas intercepter les requêtes non-http(s) (extensions navigateur, etc.)
  const url = new URL(request.url);
  if (!/^https?:$/.test(url.protocol)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});