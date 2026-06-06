import { activeList } from '../selectors.js'
import { commitData, state } from '../store.js'

export function checkout() {
  const list = activeList(state)
  if (!list) return
  if (!window.confirm(`Checkout "${list.name}"?`)) return

  list.items = list.items
    .filter((item) => Number(item.price || 0) === 0 || item.pinned === 'true')
    .map((item) => ({
      ...item,
      price: 0,
      defer: false
    }))

  state.ui.activeItemIndex = null
  state.ui.totalMode = 'rounded'
  commitData()
}
