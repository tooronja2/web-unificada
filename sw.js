// Service Worker para cache inteligente con compresión
const CACHE_NAME = 'web-unificada-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const IMAGE_CACHE = 'images-v2';
const FONT_CACHE = 'fonts-v2';

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
    static: 24 * 60 * 60 * 1000, // 24 hours
    dynamic: 60 * 60 * 1000,     // 1 hour
    images: 7 * 24 * 60 * 60 * 1000, // 7 days
    fonts: 30 * 24 * 60 * 60 * 1000  // 30 days
};

// Recursos críticos para cache inmediato
const CRITICAL_RESOURCES = [
    '/',
    '/css/pixel-hive.webflow.shared.6a98837a7.css',
    '/js/jquery-3.5.1.min.dc5e7f18c8.js',
    '/js/performance-optimizer.js',
    '/js/font-optimizer.js',
    '/js/asset-compressor.js'
];

// Recursos que se pueden cargar bajo demanda
const LAZY_RESOURCES = [
    '/css/growflix.webflow.6be85dae4.css',
    '/css/kitpro-juke.webflow.shared.12889bc9f.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(CRITICAL_RESOURCES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Cache strategy para diferentes tipos de recursos
    if (request.destination === 'image') {
        event.respondWith(handleImageRequest(request));
    } else if (request.destination === 'video') {
        event.respondWith(handleVideoRequest(request));
    } else if (request.url.includes('.css') || request.url.includes('.js')) {
        event.respondWith(handleStaticAssets(request));
    } else {
        event.respondWith(handleNavigationRequest(request));
    }
});

// Estrategia cache-first para imágenes
async function handleImageRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Fallback para imágenes
        return new Response('', { status: 200, statusText: 'Image unavailable' });
    }
}

// Estrategia network-first para videos (solo metadata en cache)
async function handleVideoRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        // Para videos, mejor no usar cache debido al tamaño
        return new Response('', { status: 204 });
    }
}

// Cache con versionado para assets estáticos
async function handleStaticAssets(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('', { status: 404 });
    }
}

// Estrategia network-first para navegación
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match('/');
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

// Compresión inteligente de respuestas
async function compressResponse(response) {
    if (!response.headers.get('content-encoding') && 
        response.headers.get('content-type')?.includes('text/')) {
        
        try {
            const text = await response.text();
            if (text.length > 1024) {
                // Simulación de compresión (en producción usarías una librería real)
                const compressedHeaders = new Headers(response.headers);
                compressedHeaders.set('x-sw-compressed', 'true');
                
                return new Response(text, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: compressedHeaders
                });
            }
        } catch (e) {
            console.warn('Compression failed:', e);
        }
    }
    
    return response;
}

// Optimización de imágenes
async function optimizeImageResponse(response, request) {
    const url = new URL(request.url);
    
    // Si es WebP y el navegador lo soporta, mantenerlo
    if (url.pathname.includes('.webp')) {
        return response;
    }
    
    // Para imágenes grandes, añadir headers de optimización
    if (response.headers.get('content-length') > 500000) { // > 500KB
        const optimizedHeaders = new Headers(response.headers);
        optimizedHeaders.set('x-sw-large-image', 'true');
        optimizedHeaders.set('cache-control', 'public, max-age=2592000'); // 30 days
        
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: optimizedHeaders
        });
    }
    
    return response;
}

// Limpieza periódica de cache
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const now = Date.now();
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const cacheDate = response.headers.get('x-cache-date');
            
            if (cacheDate) {
                const age = now - parseInt(cacheDate);
                let maxAge = CACHE_DURATIONS.dynamic; // default
                
                if (cacheName.includes('static')) maxAge = CACHE_DURATIONS.static;
                else if (cacheName.includes('images')) maxAge = CACHE_DURATIONS.images;
                else if (cacheName.includes('fonts')) maxAge = CACHE_DURATIONS.fonts;
                
                if (age > maxAge) {
                    await cache.delete(request);
                    console.log(`Cleaned up expired cache entry: ${request.url}`);
                }
            }
        }
    }
}

// Ejecutar limpieza cada hora
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEANUP_CACHE') {
        cleanupOldCaches();
    }
    
    if (event.data && event.data.type === 'COMPRESSION_SUPPORT') {
        self.compressionSupport = event.data.support;
    }
});

// Limpieza automática cada hora
setInterval(cleanupOldCaches, 60 * 60 * 1000);

// Limpiar cache automáticamente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        });
    }
});
