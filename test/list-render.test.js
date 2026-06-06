import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('list management uses inline trash svg for delete buttons', () => {
  const source = readFileSync(new URL('../src/render/lists.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.equal(source.includes('🗑'), false)
  assert.match(source, /TrashIcon/)
  assert.match(icons, /data-icon="trash-alt"/)
})
