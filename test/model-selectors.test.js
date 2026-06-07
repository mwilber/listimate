import test from 'node:test'
import assert from 'node:assert/strict'
import { hasFirebaseConfig } from '../src/firebase.js'
import { cloneData, listNamespace, normalizeData, normalizeItemName } from '../src/model.js'
import {
  DEFAULT_MISSING_ITEM_ESTIMATE,
  exactTotal,
  missingCount,
  missingEstimateDisplay,
  missingEstimateTotal,
  roundedTotal
} from '../src/selectors.js'

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

test('clones reactive-proxy-compatible data for cache and remote writes', () => {
  const data = new Proxy({
    lists: [
      new Proxy({
        name: 'Publix',
        number: 0,
        stores: new Proxy({ WalMart: true, Aldi: false }, {}),
        items: [
          new Proxy({ name: 'Milk', price: 3.49, quantity: 2 }, {})
        ]
      }, {})
    ],
    prices: new Proxy({ MILK: 3.49 }, {})
  }, {})

  const cloned = cloneData(data)

  assert.deepEqual(cloned, {
    lists: [
      {
        name: 'Publix',
        number: 0,
        stores: { WalMart: true, Aldi: false },
        items: [{ name: 'Milk', price: 3.49, quantity: 2 }]
      }
    ],
    prices: { MILK: 3.49 }
  })
  assert.notEqual(cloned.lists[0], data.lists[0])
  assert.notEqual(cloned.prices, data.prices)
})

test('repairs firebase lists with metadata misplaced under items', () => {
  const data = normalizeData({
    lists: {
      0: {
        items: {
          0: { name: 'Milk', price: 3.49, quantity: 2 },
          1: { name: 'Eggs', price: 0, quantity: 1 },
          name: 'WalMart',
          number: 4,
          stores: { WalMart: true, Aldi: false }
        }
      }
    },
    prices: {}
  })

  assert.deepEqual(data.lists, [
    {
      name: 'WalMart',
      number: 4,
      stores: { WalMart: true, Aldi: false },
      items: [
        { name: 'Milk', price: 3.49, quantity: 2 },
        { name: 'Eggs', price: 0, quantity: 1 }
      ]
    }
  ])
})

test('writes canonical lists with metadata outside items', () => {
  const cloned = cloneData({
    lists: {
      0: {
        items: {
          0: { name: 'Milk', price: 3.49, quantity: 2 },
          name: 'WalMart',
          number: 4
        }
      }
    },
    prices: {}
  })

  assert.equal(cloned.lists[0].name, 'WalMart')
  assert.equal(cloned.lists[0].number, 4)
  assert.deepEqual(Object.keys(cloned.lists[0].items), ['0'])
  assert.equal(cloned.lists[0].items.name, undefined)
  assert.equal(cloned.lists[0].items.number, undefined)
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

test('estimates remaining unchecked items from active list price history', () => {
  const state = {
    data: {
      lists: [{
        name: 'WalMart',
        items: [
          { name: 'Milk', price: 0, quantity: 2 },
          { name: 'Bread', price: 0, quantity: 1 },
          { name: 'Eggs', price: 3.5, quantity: 1 },
          { name: 'Ranch', price: 0, quantity: 1, defer: true }
        ]
      }],
      prices: {
        MILK: { WalMart: 3.25, Aldi: 2.5 },
        RANCH: { WalMart: 7 }
      }
    },
    ui: { activeListIndex: 0 }
  }

  assert.equal(DEFAULT_MISSING_ITEM_ESTIMATE, 4)
  assert.equal(missingEstimateTotal(state), 10.5)
  assert.equal(missingEstimateDisplay(state), '$10.50')
})

test('remaining estimate treats missing quantity as one item', () => {
  const state = {
    data: {
      lists: [{
        name: 'WalMart',
        items: [
          { name: 'Milk', price: 0, quantity: 0 }
        ]
      }],
      prices: {
        MILK: { WalMart: 3.25 }
      }
    },
    ui: { activeListIndex: 0 }
  }

  assert.equal(missingEstimateTotal(state), 3.25)
})

test('firebase config no longer requires stored auth credentials', () => {
  assert.equal(hasFirebaseConfig({
    firebase: {
      apiKey: 'key',
      authDomain: 'example.firebaseapp.com',
      databaseURL: 'https://example.firebaseio.com',
      projectId: 'example',
      appId: 'app'
    }
  }), true)
})
