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
