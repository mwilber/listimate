import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('item total bar keeps fixed height when rows scroll', () => {
  const components = readFileSync(new URL('../src/styles/components.css', import.meta.url), 'utf8')
  const layout = readFileSync(new URL('../src/styles/layout.css', import.meta.url), 'utf8')

  assert.match(components, /\.total-bar\s*{[\s\S]*flex:\s*0 0 65px/)
  assert.match(components, /\.entry-row\s*{[\s\S]*flex:\s*0 0 49px/)
  assert.match(layout, /\.rows\s*{[\s\S]*flex:\s*1 1 auto/)
})
