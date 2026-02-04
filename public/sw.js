const CACHE_NAME = 'one-percent-better-v4';
const OFFLINE_URL = '/offline';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/landing',
    '/demo',
    '/privacy',
    '/terms',
    '/offline',
    '/quests',
    '/login',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/apple-touch-icon.png',
];

// API endpoints to cache with stale-while-revalidate
const SWR_PATTERNS = [
    /\/_next\/static\//,
    /\/fonts\//,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Helper: Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Start network fetch in background
    const networkPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);

    // Return cached immediately if available, otherwise wait for network
    return cachedResponse || networkPromise;
}

// Helper: Network first with cache fallback
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }
        return new Response('Offline', { status: 503 });
    }
}

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== location.origin) return;

    // Skip API routes and auth
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) {
        return;
    }

    // Static assets: stale-while-revalidate
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/_next/static/') ||
        SWR_PATTERNS.some(pattern => pattern.test(url.pathname))
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // App shell pages: stale-while-revalidate for faster perceived load
    if (
        url.pathname === '/landing' ||
        url.pathname === '/demo' ||
        url.pathname === '/quests' ||
        url.pathname === '/profile' ||
        url.pathname === '/tracker' ||
        url.pathname === '/battle'
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    // Other HTML pages: network first with offline fallback
    event.respondWith(networkFirst(request));
});

// Background sync for offline actions (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-checkins') {
        // Handle offline checkin sync
    }
});
