import test from 'node:test'
import assert from 'node:assert/strict'
import { listNamespace, normalizeData, normalizeItemName } from '../src/model.js'
import { exactTotal, missingCount, roundedTotal } from '../src/selectors.js'

test('normalizes legacy firebase list data', () => {
  const data = normalizeData({
    lists: [{ name: 'Publix', number: 0 }],
    prices: null,
    state: { activeList: 'lists[0]' }
  })

  assert.equal(data.lists[0].name, 'Publix')
  assert.deepEqual(data.lists[0].items, [])
  assert.deepEqual(data.prices, {})
})

test('preserves legacy item-name and namespace normalization', () => {
  assert.equal(normalizeItemName('Paper Towels'), 'PAPERTOWEL')
  assert.equal(normalizeItemName('Eggs'), 'EGG')
  assert.equal(listNamespace({ name: 'Weekly Groceries' }), 'Weekly_Groceries')
})

test('calculates totals and missing count with deferred parity', () => {
  const list = {
    items: [
      { name: 'Milk', price: 3.49, quantity: 2, defer: false },
      { name: 'Ranch', price: 0, quantity: 1, defer: true },
      { name: 'Battery', price: 0, quantity: 1, defer: false }
    ]
  }

  assert.equal(exactTotal(list), 6.98)
  assert.equal(roundedTotal(list), 8)
  assert.equal(missingCount(list), 1)
})
