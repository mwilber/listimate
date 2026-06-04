const CACHE_NAME = 'listimate-v4'
const APP_SHELL = [
  '/',
  '/index.html',
  '/config.js',
  '/manifest.webmanifest',
  '/public/icon.svg',
  '/public/icon-192.png',
  '/public/icon-512.png',
  '/src/app.js',
  '/src/app.js?v=2',
  '/src/auth.js',
  '/src/firebase.js',
  '/src/model.js',
  '/src/selectors.js',
  '/src/store.js',
  '/src/actions/checkout.js',
  '/src/actions/items.js',
  '/src/actions/lists.js',
  '/src/actions/prices.js',
  '/src/render/itemDetail.js',
  '/src/render/items.js',
  '/src/render/lists.js',
  '/src/render/login.js',
  '/src/render/shell.js',
  '/src/styles/base.css',
  '/src/styles/layout.css',
  '/src/styles/components.css',
  '/vendor/arrow-core.mjs',
  '/vendor/arrow-core.bundle.mjs',
  '/vendor/arrow-internal.mjs'
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('firebasedatabase.app')) {
    return
  }

  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok || response.type === 'opaque') {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    })
  )
})
