import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('item detail toolbar does not show an add item button', async () => {
  const source = readFileSync(new URL('../src/render/itemDetail.js', import.meta.url), 'utf8')

  assert.equal(source.includes('aria-label="Add item from detail"'), false)
  assert.equal(source.includes('aria-label="Back to items"'), true)
})
