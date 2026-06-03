import { reactive } from '../vendor/arrow-core.mjs'
import { getFirebaseServices } from './auth.js'
import { hasFirebaseConfig } from './firebase.js'
import { CACHE_KEY, cloneData, defaultData, normalizeData } from './model.js'

export const state = reactive({
  data: loadCachedData(),
  ui: {
    activeListIndex: null,
    activeItemIndex: null,
    menuOpen: false,
    manageLists: false,
    totalMode: 'rounded',
    listNameInput: '',
    itemNameInput: '',
    detailDraft: {
      price: '0',
      quantity: '1'
    },
    confirmDeleteItem: false,
    confirmDeleteList: null
  },
  sync: {
    mode: 'local',
    ready: false,
    saving: false,
    error: '',
    uid: ''
  }
})

let remoteRef = null
let remoteSet = null
let remoteLoaded = false
let suppressNextRemoteWrite = false

export async function initializeStore() {
  if (state.data.lists.length === 0) {
    await loadReferenceFallback()
  }
  ensureActiveList()

  if (!hasFirebaseConfig()) {
    state.sync.ready = true
    state.sync.mode = 'local'
    return
  }

  try {
    state.sync.mode = 'firebase'
    const services = await getFirebaseServices()
    remoteSet = services.sdk.set
    remoteRef = services.sdk.ref(services.database, services.uid)
    state.sync.uid = services.uid

    services.sdk.onValue(remoteRef, (snapshot) => {
      remoteLoaded = true
      if (!snapshot.exists()) {
        state.sync.ready = true
        return
      }
      suppressNextRemoteWrite = true
      replaceData(snapshot.val())
      ensureActiveList()
      cacheData(state.data)
      state.sync.ready = true
    }, (error) => {
      state.sync.error = error.message
      state.sync.ready = true
    })
  } catch (error) {
    state.sync.mode = 'local'
    state.sync.error = error.message
    state.sync.ready = true
  }
}

export function replaceData(data) {
  const normalized = normalizeData(data)
  state.data.lists = normalized.lists
  state.data.prices = normalized.prices
  clampActiveSelection()
}

export async function commitData() {
  state.data = normalizeData(state.data)
  cacheData(state.data)

  if (!remoteRef || !remoteSet || !remoteLoaded || suppressNextRemoteWrite) {
    suppressNextRemoteWrite = false
    return
  }

  try {
    state.sync.saving = true
    await remoteSet(remoteRef, cloneData(state.data))
  } catch (error) {
    state.sync.error = error.message
  } finally {
    state.sync.saving = false
  }
}

function loadCachedData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    return cached ? normalizeData(JSON.parse(cached)) : defaultData()
  } catch {
    return defaultData()
  }
}

function cacheData(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cloneData(data)))
}

async function loadReferenceFallback() {
  try {
    const response = await fetch('/reference/listimate-export.json', { cache: 'no-store' })
    if (!response.ok) return
    const exportRoot = await response.json()
    const firstUser = exportRoot[Object.keys(exportRoot)[0]]
    if (firstUser) {
      replaceData(firstUser)
      cacheData(state.data)
    }
  } catch {
    // The reference folder is development-only. Empty data is valid in production.
  }
}

function clampActiveSelection() {
  if (state.ui.activeListIndex !== null && !state.data.lists[state.ui.activeListIndex]) {
    state.ui.activeListIndex = state.data.lists.length ? 0 : null
    state.ui.activeItemIndex = null
  }
  const list = state.data.lists[state.ui.activeListIndex]
  if (state.ui.activeItemIndex !== null && !list?.items?.[state.ui.activeItemIndex]) {
    state.ui.activeItemIndex = null
  }
}

function ensureActiveList() {
  if (state.ui.activeListIndex === null && state.data.lists.length > 0) {
    state.ui.activeListIndex = 0
  }
}
