// ─────────────────────────────────────────────
//  CPEM N° 99 — Service Worker
//  Estrategia: Cache First + Background Update
//  Cada vez que hay señal, actualiza silencioso
// ─────────────────────────────────────────────

const APP_VERSION   = 'v1.1.0';
const CACHE_SHELL   = `cpem99-shell-${APP_VERSION}`;
const CACHE_CONTENT = `cpem99-content-${APP_VERSION}`;

// Archivos del shell — se cachean en la instalación y nunca expiran
const SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Archivos de contenido — se cachean al primer acceso y se actualizan en background
const CONTENT_PREFETCH = [
  '/CPEM-99/historia.html',
  '/contenido/modulos.json',
  '/contenido/lengua.json',
  '/contenido/ciencias-sociales.json',
  '/contenido/cultura-identidad.json',
  '/contenido/territorio-comunidades.json'
];

// ─── DETECCIÓN DE CONECTIVIDAD ─────────────────
// Para zonas rurales: proteger datos móviles preciosos
function esConexionEconomica() {
  const conn = navigator.connection;
  
  // Si el navegador no soporta Network Information API, asumimos que SÍ podemos sincronizar
  if (!conn) return true;
  
  // Si el usuario activó "Ahorro de datos" en Android Chrome → NO sincronizar
  if (conn.saveData) return false;
  
  // Si es 2G o conexión lenta → NO sincronizar automáticamente
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return false;
  
  // Si es WiFi o 4G/5G → SÍ podemos sincronizar
  return true;
}

// ─── INSTALACIÓN ───────────────────────────────
// Cachea el shell completo al instalar la PWA
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then(cache => {
      return cache.addAll(SHELL_FILES);
    }).then(() => {
      // Activa este SW inmediatamente sin esperar
      return self.skipWaiting();
    })
  );
});

// ─── ACTIVACIÓN ────────────────────────────────
// Elimina cachés viejos de versiones anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_SHELL && key !== CACHE_CONTENT)
          .map(key => {
            console.log(`[SW] Eliminando caché viejo: ${key}`);
            return caches.delete(key);
          })
      );
    }).then(() => {
      // Toma control de todas las pestañas abiertas
      return self.clients.claim();
    })
  );
});

// ─── ESTRATEGIA DE FETCH ────────────────────────
// Para el shell:    Cache First (instantáneo offline)
// Para contenido:  Stale-While-Revalidate (sirve del caché, actualiza en fondo)
// Para otros:      Network First con fallback

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Solo interceptar requests del mismo dominio
  if (url.origin !== self.location.origin) return;

  // Shell files → Cache First estricto
  if (isShellFile(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Archivos de contenido JSON/multimedia → Stale While Revalidate
  if (url.pathname.startsWith('/contenido/') || url.pathname.startsWith('/media/')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Todo lo demás → Network First con fallback al caché
  event.respondWith(networkFirstWithFallback(event.request));
});

// ─── BACKGROUND SYNC ───────────────────────────
// Se activa cuando el dispositivo recupera conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncNewContent());
  }
});

// ─── PERIODIC BACKGROUND SYNC ──────────────────
// En Android/Chrome: sincroniza cada 24 horas aunque la app esté cerrada
self.addEventListener('periodicsync', event => {
  if (event.tag === 'periodic-content-update') {
    event.waitUntil(syncNewContent());
  }
});

// ─── NOTIFICACIONES PUSH ───────────────────────
// Para cuando el profe quiera avisar "hay nuevo contenido"
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title   = data.title   || 'CPEM N° 99 — Nuevo contenido';
  const options = {
    body:    data.body    || 'Hay nuevo material disponible para descargar.',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/icon-192.png',
    tag:     'nuevo-contenido',
    renotify: false,
    data:    { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// ════════════════════════════════════════════════
//  FUNCIONES DE CACHÉ
// ════════════════════════════════════════════════

// Cache First: sirve del caché, si no existe va a la red
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
    // Sin red y sin caché: página de error offline
    return offlineFallback(request);
  }
}

// Stale While Revalidate: sirve del caché inmediatamente, actualiza en fondo
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

// Network First: intenta la red, si falla usa caché
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

// Sincroniza contenido nuevo del servidor en background
async function syncNewContent() {
  // PASO 1: Verificar si debemos sincronizar (proteger datos móviles)
  if (!esConexionEconomica()) {
    console.log('[SW] Sincronización pospuesta: protegiendo datos móviles del usuario');
    return; // Salimos sin hacer nada, no gastamos sus datos
  }
  
  const cache = await caches.open(CACHE_CONTENT);
  const updates = await Promise.allSettled(
    CONTENT_PREFETCH.map(async url => {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (response.ok) {
          await cache.put(url, response);
          console.log(`[SW] Contenido actualizado: ${url}`);
        }
      } catch {
        // Sin conexión: no pasa nada, se intentará la próxima vez
      }
    })
  );
  return updates;
}

// Determina si un path es parte del shell
function isShellFile(pathname) {
  return SHELL_FILES.some(file => {
    const normalized = file === '/' ? '/index.html' : file;
    return pathname === file || pathname === normalized;
  });
}

// Respuesta HTML de fallback cuando todo falla (sin red, sin caché)
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
