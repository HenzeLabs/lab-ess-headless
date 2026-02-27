self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.registration.unregister();

      const clientsList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      await Promise.all(
        clientsList.map((client) => {
          if ('navigate' in client) {
            return client.navigate(client.url);
          }
          return Promise.resolve();
        }),
      );
    })(),
  );
});
