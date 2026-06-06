import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('shell does not render the mobile lists shortcut button', () => {
  const shell = readFileSync(new URL('../src/render/shell.js', import.meta.url), 'utf8')
  const layout = readFileSync(new URL('../src/styles/layout.css', import.meta.url), 'utf8')

  assert.equal(shell.includes('mobile-back'), false)
  assert.equal(shell.includes('backFromItems'), false)
  assert.equal(layout.includes('mobile-back'), false)
})

test('shell uses inline shopping cart svg for checkout', () => {
  const shell = readFileSync(new URL('../src/render/shell.js', import.meta.url), 'utf8')

  assert.equal(shell.includes('🛒'), false)
  assert.match(shell, /data-icon="shopping-cart"/)
  assert.match(shell, /viewBox="0 0 576 512"/)
})

test('shell uses inline chevron svg for back state', () => {
  const shell = readFileSync(new URL('../src/render/shell.js', import.meta.url), 'utf8')
  const icons = readFileSync(new URL('../src/render/icons.js', import.meta.url), 'utf8')

  assert.equal(shell.includes('‹'), false)
  assert.match(shell, /ChevronLeftIcon/)
  assert.match(icons, /data-icon="chevron-left"/)
  assert.match(icons, /viewBox="0 0 320 512"/)
})
