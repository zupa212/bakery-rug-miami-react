// Bakers Rug Miami - Ultra-Speed Service Worker & Push Notifications
const CACHE_NAME = 'bakersrug-v2-speed';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/photos/logofront.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache error (non-fatal):', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    ])
  );
});

// ULTRA LIGHT SPEED FETCH CACHING: Stale-While-Revalidate & Cache-First
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER cache API requests or Supabase
  if (
    url.pathname.startsWith('/api/') || 
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('resend.com') ||
    event.request.method !== 'GET'
  ) {
    return; // Pass through to network
  }

  // 2. Cache-First for static media, photos, fonts (Lightning Fast Mobile & PC)
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|webm|mp4|woff2|woff|ttf)$/) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // 3. Stale-While-Revalidate for scripts, styles, and other assets
  if (url.pathname.match(/\.(js|css)$/) || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Handle incoming Web Push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: '🔥 New Lead - Bakers Rug Miami',
    body: 'A new consultation inquiry has been submitted.',
    url: '/admin'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/photos/logofront.png',
    badge: '/photos/logofront.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || `bakers-lead-${Date.now()}`,
    renotify: true,
    data: {
      url: data.url || '/admin',
      timestamp: Date.now()
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle Notification Clicks (focuses the admin tab or opens it)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Allow frontend to trigger local push via SW (especially for iOS PWA testing)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || '🔥 Bakers Rug Miami', {
      icon: '/photos/logofront.png',
      badge: '/photos/logofront.png',
      vibrate: [200, 100, 200],
      ...options
    });
  }
});
