// ─────────────────────────────────────────────
//  CPEM N° 99 — Service Worker
//  Estrategia: Cache First + Background Update
//  v1.2.2 — FIX: rutas corregidas para /CPEM-99/
//  URL real: https://27698-sis.github.io/CPEM-99/
// ─────────────────────────────────────────────

const APP_VERSION   = 'v1.2.2';
const CACHE_SHELL   = `cpem99-shell-${APP_VERSION}`;
const CACHE_CONTENT = `cpem99-content-${APP_VERSION}`;
const MAX_CACHE_MB  = 150;

// Archivos del shell — rutas absolutas desde la raíz del dominio
const SHELL_FILES = [
  '/CPEM-99/',
  '/CPEM-99/index.html',
  '/CPEM-99/manifest.json',
  '/CPEM-99/icons/icon-192.png',
  '/CPEM-99/icons/icon-512.png'
];

// Archivos de contenido — se pre-cachean en install Y se actualizan en background
const CONTENT_PREFETCH = [
  '/CPEM-99/historia.html',
  '/CPEM-99/diccionario.html',
  '/CPEM-99/contenido/diccionario.json',
  '/CPEM-99/contenido/modulos.json',
  '/CPEM-99/contenido/lengua.json',
  '/CPEM-99/contenido/ciencias-sociales.json',
  '/CPEM-99/contenido/cultura-identidad.json',
  '/CPEM-99/contenido/territorio-comunidades.json'
];

// ─── DETECCIÓN DE CONECTIVIDAD ───────────────
function esConexionEconomica() {
  const conn = navigator.connection;
  if (!conn) return true;
  if (conn.saveData) return false;
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false;
  return true;
}

// ─── GESTIÓN DE ALMACENAMIENTO ───────────────
async function getCacheSize() {
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
}

async function limpiarCacheViejo(espacioNecesarioMB = 20) {
  const cache = await caches.open(CACHE_CONTENT);
  const keys = await cache.keys();
  if (keys.length === 0) return 0;

  const archivosConFecha = [];
  for (const request of keys) {
    const response = await cache.match(request);
    const fecha = response.headers.get('date')
      ? new Date(response.headers.get('date')).getTime()
      : Date.now() - (keys.indexOf(request) * 86400000);
    archivosConFecha.push({ request, fecha });
  }
  archivosConFecha.sort((a, b) => a.fecha - b.fecha);

  let liberadoMB = 0;
  const maxLiberar = Math.min(archivosConFecha.length, 5);
  for (let i = 0; i < maxLiberar && liberadoMB < espacioNecesarioMB; i++) {
    const item = archivosConFecha[i];
    const response = await cache.match(item.request);
    if (response) {
      const blob = await response.blob();
      const mb = blob.size / (1024 * 1024);
      await cache.delete(item.request);
      liberadoMB += mb;
      console.log(`[SW] Eliminado: ${item.request.url} (${mb.toFixed(1)} MB)`);
    }
  }
  return liberadoMB;
}

// ─── INSTALACIÓN ─────────────────────────────
// Shell: obligatorio. Contenido: opcional (fallas individuales no bloquean).
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_SHELL).then(cache => cache.addAll(SHELL_FILES)),
      caches.open(CACHE_CONTENT).then(cache =>
        Promise.allSettled(
          CONTENT_PREFETCH.map(url =>
            fetch(url)
              .then(res => {
                if (res.ok) {
                  cache.put(url, res);
                  console.log(`[SW] Pre-cacheado: ${url}`);
                }
              })
              .catch(err => console.warn(`[SW] No se pudo cachear ${url}: ${err.message}`))
          )
        )
      )
    ]).then(() => {
      console.log('[SW] Instalación completa v1.2.2');
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVACIÓN ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_SHELL && key !== CACHE_CONTENT)
          .map(key => {
            console.log(`[SW] Eliminando caché viejo: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ───────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Shell → Cache First estricto
  if (isShellFile(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Contenido HTML y JSON bajo /CPEM-99/ → Stale While Revalidate
  if (
    url.pathname.startsWith('/CPEM-99/contenido/') ||
    url.pathname.startsWith('/CPEM-99/media/')     ||
    url.pathname === '/CPEM-99/historia.html'       ||
    url.pathname === '/CPEM-99/diccionario.html'
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Todo lo demás → Network First con fallback al caché
  event.respondWith(networkFirstWithFallback(event.request));
});

// ─── BACKGROUND SYNC ─────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncNewContent());
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-content-update') {
    event.waitUntil(syncNewContent());
  }
});

// ─── PUSH ────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title   = data.title || 'CPEM N° 99 — Nuevo contenido';
  const options = {
    body:     data.body  || 'Hay nuevo material disponible.',
    icon:     '/CPEM-99/icons/icon-192.png',
    badge:    '/CPEM-99/icons/icon-192.png',
    tag:      'nuevo-contenido',
    renotify: false,
    data:     { url: data.url || '/CPEM-99/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/CPEM-99/'));
});

// ─── MENSAJES DESDE LA APP ───────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'FORCE_SYNC') {
    event.waitUntil(
      syncNewContent(true)
        .then(() => event.source.postMessage({ type: 'SYNC_COMPLETE', success: true }))
        .catch(error => event.source.postMessage({ type: 'SYNC_ERROR', error: error.message }))
    );
  }
  if (event.data && event.data.type === 'GET_STORAGE_STATUS') {
    event.waitUntil(
      getCacheSize().then(stats => {
        event.source.postMessage({
          type: 'STORAGE_STATUS',
          usadoMB: stats.mb,
          archivos: stats.archivos,
          maximoMB: MAX_CACHE_MB,
          porcentaje: Math.round((parseFloat(stats.mb) / MAX_CACHE_MB) * 100)
        });
      })
    );
  }
});

// ════════════════════════════════════════════════
//  FUNCIONES DE CACHÉ
// ════════════════════════════════════════════════

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_SHELL);
      cache.put(request, response.clone());
    }
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
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

async function syncNewContent(force = false) {
  if (!force && !esConexionEconomica()) {
    console.log('[SW] Sincronización pospuesta: protegiendo datos móviles');
    return { status: 'pospuesto', razon: 'datos' };
  }

  const stats = await getCacheSize();
  if (parseFloat(stats.mb) > MAX_CACHE_MB) {
    console.log(`[SW] Caché lleno (${stats.mb} MB). Limpiando...`);
    const liberado = await limpiarCacheViejo(30);
    if (liberado === 0) {
      console.warn('[SW] No se pudo liberar espacio.');
      return { status: 'error', razon: 'sin_espacio' };
    }
  }

  const cache = await caches.open(CACHE_CONTENT);
  const updates = await Promise.allSettled(
    CONTENT_PREFETCH.map(async url => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(url, response);
          console.log(`[SW] Actualizado: ${url}`);
        }
      } catch (err) {
        console.log(`[SW] No se pudo descargar ${url}: ${err.message}`);
      }
    })
  );

  const nuevasStats = await getCacheSize();
  const allClients = await self.clients.matchAll();
  allClients.forEach(client => {
    client.postMessage({
      type: 'STORAGE_STATUS',
      usadoMB: nuevasStats.mb,
      archivos: nuevasStats.archivos,
      maximoMB: MAX_CACHE_MB,
      porcentaje: Math.round((parseFloat(nuevasStats.mb) / MAX_CACHE_MB) * 100)
    });
  });

  return updates;
}

function isShellFile(pathname) {
  return SHELL_FILES.some(file => {
    const normalized = file === '/CPEM-99/' ? '/CPEM-99/index.html' : file;
    return pathname === file || pathname === normalized;
  });
}

function offlineFallback(request) {
  if (request.headers.get('Accept')?.includes('text/html')) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CPEM N° 99 — Sin conexión</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center;
                 justify-content: center; min-height: 100vh; margin: 0;
                 background: #3B1F14; color: #F5EFE0; text-align: center; padding: 32px; }
          h1 { font-size: 22px; margin-bottom: 12px; }
          p  { font-size: 14px; opacity: 0.7; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div>
          <h1>CPEM N° 99</h1>
          <p>No hay conexión en este momento.<br>
             Abrí la app cuando tengas señal para cargar el contenido.</p>
        </div>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  return new Response('', { status: 503 });
}
