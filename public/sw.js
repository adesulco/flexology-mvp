self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let Next.js handle the standard network, but we intercept for offline baseline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Here we could return a cached offline page
        return new Response("You are offline. Reconnect to book a Jemari wellness session.", {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
  }
});
