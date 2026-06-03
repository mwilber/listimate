export const CACHE_KEY = 'listimate'

export function defaultData() {
  return {
    lists: [],
    prices: {}
  }
}

export function normalizeData(value) {
  const data = value && typeof value === 'object' ? value : defaultData()
  return {
    lists: Array.isArray(data.lists) ? data.lists.map(normalizeList) : [],
    prices: data.prices && typeof data.prices === 'object' ? structuredClone(data.prices) : {}
  }
}

export function normalizeList(list) {
  return {
    name: String(list?.name || ''),
    number: Number(list?.number || 0),
    stores: list?.stores && typeof list.stores === 'object'
      ? structuredClone(list.stores)
      : { WalMart: true, Aldi: false },
    items: Array.isArray(list?.items) ? list.items.map(normalizeItem) : []
  }
}

export function normalizeItem(item) {
  return {
    name: String(item?.name || ''),
    price: toNumber(item?.price, 0),
    quantity: toNumber(item?.quantity, 1),
    ...(item?.pinned !== undefined ? { pinned: String(item.pinned) } : {}),
    ...(item?.defer !== undefined ? { defer: Boolean(item.defer) } : {})
  }
}

export function createList(name) {
  return {
    name: name.trim(),
    number: 0,
    stores: {
      WalMart: true,
      Aldi: false
    },
    items: []
  }
}

export function createItem(name) {
  return {
    name: name.trim(),
    price: 0,
    quantity: 1
  }
}

export function cloneData(data) {
  return normalizeData(structuredClone(data))
}

export function listNamespace(list) {
  return String(list?.name || '').replace(/ /g, '_')
}

export function normalizeItemName(name) {
  return String(name || '').replace(/(\s+|s$|s\s+$)/g, '').toUpperCase()
}

export function toNumber(value, fallback = 0) {
  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : fallback
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function trimMoney(value) {
  const number = Number(value || 0)
  return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0$/, '')
}
