import { html } from '../vendor/arrow-core.mjs'
import { Shell } from './render/shell.js'
import { initializeStore } from './store.js'

const root = document.getElementById('app')

root.textContent = ''
html`${Shell()}`(root)
initializeStore()

const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname)

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !isLocalHost) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}
