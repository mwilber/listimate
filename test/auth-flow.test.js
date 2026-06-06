import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('stored credential startup logs in silently until user action is needed', () => {
  const source = readFileSync(new URL('../src/store.js', import.meta.url), 'utf8')

  assert.match(source, /loginWithFirebase\(\{\s*silent:\s*true\s*\}\)/)
  assert.match(source, /if \(!options\.silent\)\s*{[\s\S]*state\.auth\.status = 'signing-in'/)
})

test('offline firebase edits are marked dirty and retried online', () => {
  const source = readFileSync(new URL('../src/store.js', import.meta.url), 'utf8')

  assert.match(source, /dirty:\s*false/)
  assert.match(source, /window\.addEventListener\('online'[\s\S]*retryRemoteSync\(\)/)
  assert.match(source, /function markRemoteDirty[\s\S]*state\.sync\.mode !== 'firebase'[\s\S]*state\.sync\.dirty = true/)
  assert.match(source, /if \(!remoteRef \|\| !remoteSet \|\| !remoteLoaded\) {[\s\S]*markRemoteDirty\(\)/)
  assert.match(source, /await remoteSet\(remoteRef, cloneData\(state\.data\)\)[\s\S]*state\.sync\.dirty = false/)
})

test('silent network failures keep cached firebase data editable', () => {
  const source = readFileSync(new URL('../src/store.js', import.meta.url), 'utf8')

  assert.match(source, /if \(options\.silent && isOfflineError\(error\)\)/)
  assert.match(source, /state\.auth\.status = 'authenticated'[\s\S]*state\.sync\.mode = 'firebase'/)
  assert.match(source, /function isOfflineError[\s\S]*navigator\.onLine === false/)
})
