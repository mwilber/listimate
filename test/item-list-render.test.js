import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('item row price comparison uses one shared price tag', () => {
  const source = readFileSync(new URL('../src/render/items.js', import.meta.url), 'utf8')

  assert.equal(source.includes('class="price-tag"> &gt;'), false)
  assert.match(source, /class="price-tag"[\s\S]*info\.currentLabel[\s\S]*info\.bestLabel/)
})

test('total currency is styled separately from the amount', () => {
  const source = readFileSync(new URL('../src/render/items.js', import.meta.url), 'utf8')

  assert.match(source, /class="total-currency"[\s\S]*\$/)
  assert.match(source, /totalDisplay\(state\)\.replace/)
})

test('total bar shows remaining item estimate under item count', () => {
  const source = readFileSync(new URL('../src/render/items.js', import.meta.url), 'utf8')

  assert.match(source, /class="total-summary"[\s\S]*Items:[\s\S]*class="total-estimate"[\s\S]*Est:/)
  assert.match(source, /missingEstimateDisplay\(state\)/)
})

test('item list uses inline map pin svg for pinned items', () => {
  const source = readFileSync(new URL('../src/render/items.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.equal(source.includes('⌖'), false)
  assert.match(source, /MapPinIcon/)
  assert.match(icons, /data-icon="map-pin"/)
  assert.match(icons, /viewBox="0 0 288 512"/)
})

test('pin svg is rotated', () => {
  const styles = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8')

  assert.match(styles, /transform:\s*rotate\(-20deg\)/)
})
