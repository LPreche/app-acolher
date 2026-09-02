// Service Worker - Sistema Acolher (Push Notifications)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Evento de recebimento de notificação Push
self.addEventListener('push', (event) => {
  let data = {
    title: '🔔 Lembrete de Acolhimento - IBI Chapecó',
    body: 'Você tem visitantes aguardando contato hoje!',
    icon: '/logo-acolher.jpg',
    badge: '/icone-vertical.png',
    url: '/painel/familia',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo-acolher.jpg',
    badge: data.badge || '/icone-vertical.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/painel/familia',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Evento ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlParaAbrir = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(urlParaAbrir);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlParaAbrir);
      }
    })
  );
});
