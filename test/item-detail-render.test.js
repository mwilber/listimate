import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('item detail does not render the redundant toolbar', async () => {
  const source = readFileSync(new URL('../src/render/itemDetail.js', import.meta.url), 'utf8')

  assert.equal(source.includes('detail-toolbar'), false)
  assert.equal(source.includes('aria-label="Add item from detail"'), false)
  assert.equal(source.includes('aria-label="Back to items"'), false)
  assert.equal(source.includes('‹'), false)
  assert.equal(source.includes('ChevronLeftIcon'), false)
})

test('item detail uses inline map pin svg for pinned action', () => {
  const source = readFileSync(new URL('../src/render/itemDetail.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.equal(source.includes('⌖'), false)
  assert.match(source, /MapPinIcon/)
  assert.match(icons, /data-icon="map-pin"/)
})

test('item detail uses inline trash svg for delete action', () => {
  const source = readFileSync(new URL('../src/render/itemDetail.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.equal(source.includes('🗑'), false)
  assert.match(source, /TrashIcon/)
  assert.match(icons, /data-icon="trash-alt"/)
  assert.match(icons, /viewBox="0 0 448 512"/)
})

test('item detail uses inline move-to-list svg for move action', () => {
  const source = readFileSync(new URL('../src/render/itemDetail.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.match(source, /MoveToListIcon/)
  assert.match(source, /aria-label="Move to list"/)
  assert.match(icons, /data-icon="move-to-list"/)
  assert.match(icons, /viewBox="0 0 512 512"/)
})

test('item detail uses inline check svg for save action', () => {
  const source = readFileSync(new URL('../src/render/itemDetail.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.equal(source.includes('✓'), false)
  assert.match(source, /CheckIcon/)
  assert.match(icons, /data-icon="check"/)
  assert.match(icons, /viewBox="0 0 512 512"/)
})
