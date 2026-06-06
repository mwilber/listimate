import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

test('active list selection is stored as local ui state', () => {
  const source = readFileSync(new URL('../src/store.js', import.meta.url), 'utf8')

  assert.match(source, /const UI_CACHE_KEY = 'listimateUi'/)
  assert.match(source, /export function saveActiveListSelection\(\)/)
  assert.match(source, /localStorage\.setItem\(UI_CACHE_KEY, JSON\.stringify\({[\s\S]*activeListName:[\s\S]*activeListIndex:/)
})

test('stored active list is restored by name before falling back to index', () => {
  const source = readFileSync(new URL('../src/store.js', import.meta.url), 'utf8')

  assert.match(source, /function loadStoredUiState\(\)/)
  assert.match(source, /activeListName:[\s\S]*typeof uiState\.activeListName === 'string'/)
  assert.match(source, /const namedIndex = state\.data\.lists\.findIndex\(\(list\) => list\.name === storedUiState\.activeListName\)/)
  assert.match(source, /storedUiState\.activeListIndex !== null && state\.data\.lists\[storedUiState\.activeListIndex\]/)
})

test('list actions persist active list selection when it changes', () => {
  const source = readFileSync(new URL('../src/actions/lists.js', import.meta.url), 'utf8')

  assert.match(source, /import \{ commitData, saveActiveListSelection, state \} from '..\/store\.js'/)
  assert.match(source, /export function addList\(\)[\s\S]*saveActiveListSelection\(\)[\s\S]*commitData\(\)/)
  assert.match(source, /export function selectList\(index\)[\s\S]*saveActiveListSelection\(\)/)
  assert.match(source, /export function deleteList\(index\)[\s\S]*saveActiveListSelection\(\)[\s\S]*commitData\(\)/)
})
