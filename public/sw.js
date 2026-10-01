// Bakers Rug Miami - Service Worker for Web Push & Notifications
const CACHE_NAME = 'bakersrug-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications (from backend or web push service)
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
