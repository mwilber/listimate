import { formatMoney, listNamespace, normalizeItemName, trimMoney } from './model.js'

export function activeList(state) {
  return state.data.lists[state.ui.activeListIndex] || null
}

export function activeItem(state) {
  const list = activeList(state)
  return list?.items?.[state.ui.activeItemIndex] || null
}

export function visibleItems(state) {
  const list = activeList(state)
  if (!list?.items) return []
  if (state.ui.totalMode === 'actual') return list.items
  return list.items.filter((item) => !isChecked(item) && !item.defer)
}

export function isChecked(item) {
  return Number(item?.price || 0) > 0 && Number(item?.quantity || 0) > 0
}

export function exactTotal(list) {
  return (list?.items || []).reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 0)
  }, 0)
}

export function roundedTotal(list) {
  return (list?.items || []).reduce((sum, item) => {
    return sum + Math.ceil(Number(item.price || 0)) * Number(item.quantity || 0)
  }, 0)
}

export function missingCount(list) {
  return (list?.items || []).filter((item) => {
    return !item.defer && (Number(item.price || 0) === 0 || Number(item.quantity || 0) === 0)
  }).length
}

export function totalDisplay(state) {
  const list = activeList(state)
  if (!list) return '$ 0'
  if (state.ui.totalMode === 'actual') return `$ ${formatMoney(exactTotal(list))}`
  return `$ ${Math.trunc(roundedTotal(list))}`
}

export function priceInfo(state, item) {
  const list = activeList(state)
  const namespace = listNamespace(list)
  const prices = state.data.prices[normalizeItemName(item?.name)] || {}
  const current = numericPrice(prices[namespace])
  const candidates = Object.entries(prices)
    .filter(([key, value]) => key !== 'x' && numericPrice(value) > 0)
    .map(([key, value]) => ({ key, price: numericPrice(value) }))
    .sort((a, b) => a.price - b.price)

  const best = candidates[0] || null
  return {
    current,
    currentLabel: current > 0 ? `${namespace} $${trimMoney(current)}` : '',
    best,
    bestLabel: best && best.key !== namespace ? `${best.key} $${trimMoney(best.price)}` : ''
  }
}

function numericPrice(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
