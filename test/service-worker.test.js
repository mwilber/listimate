import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('service worker uses network first with cache fallback', () => {
  const source = readFileSync(new URL('../sw.js', import.meta.url), 'utf8')

  assert.match(source, /event\.respondWith\(\s*fetch\(request\)/)
  assert.match(source, /\.catch\(\(\) => caches\.match\(request\)/)
  assert.match(source, /request\.mode === 'navigate'[\s\S]*caches\.match\('\/index\.html'\)/)
  assert.equal(source.includes('if (cached) return cached\n      return fetch(request)'), false)
})
