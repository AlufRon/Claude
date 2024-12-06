/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/play',
        '/tournament',
        '/offline.html'
      ])
    })
  )
})

sw.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/offline.html')
      })
    })
  )
})