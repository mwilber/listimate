import { listNamespace, normalizeItemName, toNumber } from '../model.js'
import { activeList } from '../selectors.js'
import { commitData, state } from '../store.js'

export function rememberPrice(item, value) {
  const list = activeList(state)
  const namespace = listNamespace(list)
  const key = normalizeItemName(item?.name)
  const price = toNumber(value, 0)

  if (!namespace || !key || price <= 0) return
  if (!state.data.prices[key]) state.data.prices[key] = { x: 'x' }
  state.data.prices[key][namespace] = price
  commitData()
}
