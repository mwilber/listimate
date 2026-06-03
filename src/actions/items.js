import { createItem, toNumber } from '../model.js'
import { activeItem, activeList } from '../selectors.js'
import { commitData, state } from '../store.js'
import { rememberPrice } from './prices.js'

export function addItem() {
  const list = activeList(state)
  const name = state.ui.itemNameInput.trim()
  if (!list || !name) return
  list.items.push(createItem(name))
  state.ui.itemNameInput = ''
  state.ui.activeItemIndex = list.items.length - 1
  resetDetailDraft()
  commitData()
}

export function openItem(index) {
  state.ui.activeItemIndex = index
  state.ui.confirmDeleteItem = false
  resetDetailDraft()
}

export function closeItem() {
  state.ui.activeItemIndex = null
  state.ui.confirmDeleteItem = false
}

export function resetDetailDraft() {
  const item = activeItem(state)
  state.ui.detailDraft.price = String(item?.price ?? 0)
  state.ui.detailDraft.quantity = String(item?.quantity ?? 1)
}

export function saveItem() {
  const item = activeItem(state)
  if (!item) return
  item.price = toNumber(state.ui.detailDraft.price, 0)
  item.quantity = toNumber(state.ui.detailDraft.quantity, 0)
  if (item.price > 0) rememberPrice(item, item.price)
  state.ui.activeItemIndex = null
  commitData()
}

export function saveRememberedPriceOnly() {
  const item = activeItem(state)
  if (!item) return
  rememberPrice(item, state.ui.detailDraft.price)
  state.ui.activeItemIndex = null
}

export function togglePinned() {
  const item = activeItem(state)
  if (!item) return
  item.pinned = item.pinned === 'true' ? 'false' : 'true'
  commitData()
}

export function toggleDeferred() {
  const item = activeItem(state)
  if (!item) return
  item.defer = !item.defer
  state.ui.activeItemIndex = null
  commitData()
}

export function deleteItem() {
  const list = activeList(state)
  const item = activeItem(state)
  if (!list || !item) return

  if (!state.ui.confirmDeleteItem) {
    state.ui.confirmDeleteItem = true
    return
  }

  list.items.splice(state.ui.activeItemIndex, 1)
  state.ui.activeItemIndex = null
  state.ui.confirmDeleteItem = false
  commitData()
}

export function incrementQuantity(amount) {
  const current = toNumber(state.ui.detailDraft.quantity, 0)
  state.ui.detailDraft.quantity = String(Math.max(0, current + amount))
}

export function zeroFocus(event) {
  if (event.currentTarget.value === '0') {
    event.currentTarget.value = ''
  }
}

export function zeroBlur(field, event) {
  if (event.currentTarget.value === '') {
    state.ui.detailDraft[field] = '0'
  }
}
