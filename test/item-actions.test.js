import test from 'node:test'
import assert from 'node:assert/strict'

test('adding an item keeps the list view active', async () => {
  const storage = new Map()
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => { storage.set(key, String(value)) },
    removeItem: (key) => { storage.delete(key) }
  }
  globalThis.window = {
    LISTIMATE_CONFIG: {},
    matchMedia: () => ({ matches: false })
  }

  const [{ state }, { addItem }] = await Promise.all([
    import('../src/store.js'),
    import('../src/actions/items.js')
  ])

  state.data.lists = [{
    name: 'WalMart',
    number: 0,
    stores: { WalMart: true, Aldi: false },
    items: []
  }]
  state.data.prices = {}
  state.ui.activeListIndex = 0
  state.ui.activeItemIndex = null
  state.ui.itemNameInput = 'Milk'

  addItem()

  assert.deepEqual(state.data.lists[0].items, [
    { name: 'Milk', price: 0, quantity: 1 }
  ])
  assert.equal(state.ui.itemNameInput, '')
  assert.equal(state.ui.activeItemIndex, null)
})
