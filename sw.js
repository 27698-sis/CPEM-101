// ─────────────────────────────────────────────
//  CPEM N° 99 — Service Worker
//  Estrategia: Cache First + Background Update
//  v1.2.3 — Footer, Licencia y Rutas Normalizadas
// ─────────────────────────────────────────────

const APP_VERSION   = 'v1.2.3'; 
const CACHE_SHELL   = `cpem99-shell-${APP_VERSION}`;
const CACHE_CONTENT = `cpem99-content-${APP_VERSION}`;
const MAX_CACHE_MB  = 150;

// Archivos del shell — rutas relativas para mayor compatibilidad
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png', // Ajustado a la raíz según tu index.html
  './icon-512.png'
];

// Archivos de contenido
const CONTENT_PREFETCH = [
  './CPEM-99/historia.html',
  './diccionario.html',
  './contenido/diccionario.json',
  './contenido/modulos.json',
  './contenido/lengua.json',
  './contenido/ciencias-sociales.json',
  './contenido/cultura-identidad.json',
  './contenido/territorio-comunidades.json'
];

// ─── DETECCIÓN DE CONECTIVIDAD ─────────────────
function esConexionEconomica() {
  const conn = navigator.connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  const slow = ['2g', 'slow-2g', '3g']; // Incluimos 3g para ser más conservadores con el plan de datos
  return !slow.includes(conn.effectiveType);
}

// ─── GESTIÓN DE ALMACENAMIENTO ─────────────────
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_CONTENT);
    const keys = await cache.keys();
    let totalBytes = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalBytes += blob.size;
      }
    }

    return {
      bytes: totalBytes,
      mb: (totalBytes / (1024 * 1024)).toFixed(1),
      archivos: keys.length
    };
  } catch (e) {
    return { bytes: 0, mb: 0, archivos: 0 };
  }
}

async function limpiarCacheViejo(espacioNecesarioMB = 20) {
  const cache = await caches.open(CACHE_CONTENT);
  const keys = await cache.keys();
  if (keys.length === 0) return 0;

  const archivosConFecha = [];
  for (const request of keys) {
    const response = await cache.match(request);
    // Intentamos obtener la fecha de la cabecera o usamos una estimada
    const dateHeader = response.headers.get('date');
    const fecha = dateHeader ? new Date(dateHeader).getTime() : Date.now();
    archivosConFecha.push({ request, fecha });
  }

  // Ordenar por más viejo primero
  archivosConFecha.sort((a, b) => a.fecha - b.fecha);

  let liberadoMB = 0;
  // Borramos máximo el 20% de los archivos por vez para no vaciar todo
  const maxABorrar = Math.ceil(archivosConFecha.length * 0.2);

  for (let i = 0; i < maxABorrar && liberadoMB < espacioNecesarioMB; i++) {
    const item = archivosConFecha[i];
    const response = await cache.match(item.request);
    if (response) {
      const blob = await response.blob();
      const mb = blob.size / (1024 * 1024);
      await cache.delete(item.request);
      liberadoMB += mb;
    }
  }
  return liberadoMB;
}

// ─── INSTALACIÓN ───────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_SHELL).then(cache => cache.addAll(SHELL_FILES)),
      caches.open(CACHE_CONTENT).then(cache =>
        Promise.allSettled(
          CONTENT_PREFETCH.map(url =>
            fetch(url).then(res => res.ok ? cache.put(url, res) : null)
          )
        )
      )
    ]).then(() => self.skipWaiting())
  );
});

// ─── ACTIVACIÓN ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_SHELL && key !== CACHE_CONTENT)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ─── ESTRATEGIA DE FETCH ────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // 1. Shell -> Cache First
  if (SHELL_FILES.some(file => url.pathname.endsWith(file.replace('./', '')))) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // 2. Contenido Dinámico -> Stale While Revalidate
  if (
    url.pathname.includes('/contenido/') ||
    url.pathname.includes('/CPEM-99/') ||
    url.pathname.endsWith('diccionario.html')
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // 3. Otros -> Network First
  event.respondWith(networkFirstWithFallback(event.request));
});

// ─── COMUNICACIÓN ──────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'FORCE_SYNC') {
    event.waitUntil(
      syncNewContent(true).then(() => {
        event.source.postMessage({ type: 'SYNC_COMPLETE', success: true });
      })
    );
  }

  if (event.data?.type === 'GET_STORAGE_STATUS') {
    event.waitUntil(
      getCacheSize().then(stats => {
        event.source.postMessage({
          type: 'STORAGE_STATUS',
          usadoMB: stats.mb,
          archivos: stats.archivos,
          maximoMB: MAX_CACHE_MB,
          porcentaje: Math.min(100, Math.round((parseFloat(stats.mb) / MAX_CACHE_MB) * 100))
        });
      })
    );
  }
});

// ─── FUNCIONES AUXILIARES ──────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_SHELL);
    cache.put(request, response.clone());
    return response;
  } catch {
    return offlineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request).then(async response => {
    if (response.ok) {
      const cache = await caches.open(CACHE_CONTENT);
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || await networkPromise || offlineFallback(request);
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_CONTENT);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return await caches.match(request) || offlineFallback(request);
  }
}

async function syncNewContent(force = false) {
  if (!force && !esConexionEconomica()) return;

  const stats = await getCacheSize();
  if (parseFloat(stats.mb) > MAX_CACHE_MB * 0.9) { // Limpia si llega al 90%
    await limpiarCacheViejo(25);
  }

  const cache = await caches.open(CACHE_CONTENT);
  await Promise.allSettled(
    CONTENT_PREFETCH.map(async url => {
      try {
        const res = await fetch(url, { cache: 'reload' });
        if (res.ok) await cache.put(url, res);
      } catch (e) { }
    })
  );
  
  // Notificar a clientes
  const nuevasStats = await getCacheSize();
  const clients = await self.clients.matchAll();
  clients.forEach(c => c.postMessage({ type: 'STORAGE_STATUS', ...nuevasStats }));
}

function offlineFallback(request) {
  if (request.headers.get('Accept')?.includes('text/html')) {
    return caches.match('./index.html'); // Intentamos mostrar la home si no hay nada
  }
  return new Response('', { status: 503 });
}
