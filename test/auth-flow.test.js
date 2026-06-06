import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('stored credential startup logs in silently until user action is needed', () => {
  const source = readFileSync(new URL('../src/store.js', import.meta.url), 'utf8')

  assert.match(source, /loginWithFirebase\(\{\s*silent:\s*true\s*\}\)/)
  assert.match(source, /if \(!options\.silent\)\s*{[\s\S]*state\.auth\.status = 'signing-in'/)
})
