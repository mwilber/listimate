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
    lists: normalizeListCollection(data.lists),
    prices: data.prices && typeof data.prices === 'object' ? clonePlainValue(data.prices) : {}
  }
}

export function normalizeList(list) {
  const misplacedMetadata = list?.items && typeof list.items === 'object' ? list.items : {}
  return {
    name: String(list?.name ?? misplacedMetadata.name ?? ''),
    number: Number(list?.number ?? misplacedMetadata.number ?? 0),
    stores: list?.stores && typeof list.stores === 'object'
      ? clonePlainValue(list.stores)
      : misplacedMetadata.stores && typeof misplacedMetadata.stores === 'object'
        ? clonePlainValue(misplacedMetadata.stores)
      : { WalMart: true, Aldi: false },
    items: normalizeItemCollection(list?.items)
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
  return normalizeData(clonePlainValue(data))
}

function clonePlainValue(value) {
  if (Array.isArray(value)) {
    return value.map(clonePlainValue)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, clonePlainValue(entry)])
    )
  }
  return value
}

function normalizeListCollection(lists) {
  if (Array.isArray(lists)) {
    return lists.map(normalizeList)
  }
  if (lists && typeof lists === 'object') {
    return Object.keys(lists)
      .filter((key) => isArrayIndexKey(key))
      .sort(compareArrayIndexKeys)
      .map((key) => normalizeList(lists[key]))
  }
  return []
}

function normalizeItemCollection(items) {
  if (Array.isArray(items)) {
    return items.map(normalizeItem)
  }
  if (items && typeof items === 'object') {
    return Object.keys(items)
      .filter((key) => isArrayIndexKey(key))
      .sort(compareArrayIndexKeys)
      .map((key) => normalizeItem(items[key]))
  }
  return []
}

function isArrayIndexKey(key) {
  return /^(0|[1-9]\d*)$/.test(key)
}

function compareArrayIndexKeys(left, right) {
  return Number(left) - Number(right)
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
