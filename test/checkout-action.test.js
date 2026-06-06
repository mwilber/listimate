import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('checkout asks for confirmation before mutating the active list', () => {
  const source = readFileSync(new URL('../src/actions/checkout.js', import.meta.url), 'utf8')

  assert.match(source, /if \(!window\.confirm\(`Checkout "\$\{list\.name\}"\?`\)\) return/)
  assert.ok(source.indexOf('window.confirm') < source.indexOf('list.items = list.items'))
})
