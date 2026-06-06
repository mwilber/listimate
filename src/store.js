import { reactive } from '../vendor/arrow-core.mjs'
import { signIn } from './auth.js'
import { hasFirebaseConfig } from './firebase.js'
import { CACHE_KEY, cloneData, defaultData, normalizeData } from './model.js'

const AUTH_CACHE_KEY = 'listimateAuth'
const storedCredentials = loadStoredCredentials()

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
    confirmDeleteList: null,
    loginEmail: storedCredentials.email,
    loginPassword: storedCredentials.password
  },
  auth: {
    status: 'checking',
    error: '',
    hasConfig: false
  },
  sync: {
    mode: 'local',
    ready: false,
    saving: false,
    error: '',
    dirty: false,
    uid: ''
  }
})

let remoteRef = null
let remoteSet = null
let remoteUnsubscribe = null
let remoteLoaded = false

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('online', () => {
    retryRemoteSync()
  })
}

export async function initializeStore() {
  if (!hasFirebaseConfig()) {
    state.auth.hasConfig = false
    state.auth.status = 'local'
    if (state.data.lists.length === 0) {
      await loadReferenceData()
    } else {
      ensureActiveList()
    }
    state.sync.ready = true
    state.sync.mode = 'local'
    return
  }

  state.auth.hasConfig = true
  state.sync.ready = true
  if (hasStoredCredentials()) {
    await loginWithFirebase({ silent: true })
    return
  }
  state.auth.status = 'login'
}

export async function loginWithFirebase(options = {}) {
  const email = state.ui.loginEmail.trim()
  const password = state.ui.loginPassword
  if (!email || !password) {
    state.auth.error = 'Enter your Firebase email and password.'
    return
  }

  try {
    resetRemoteConnection()
    if (!options.silent) {
      state.auth.status = 'signing-in'
    }
    state.auth.error = ''
    state.sync.mode = 'firebase'
    const services = await signIn(email, password)
    saveStoredCredentials(email, password)
    remoteSet = services.sdk.set
    remoteRef = services.sdk.ref(services.database, services.uid)
    state.sync.uid = services.uid

    remoteUnsubscribe = services.sdk.onValue(remoteRef, (snapshot) => {
      remoteLoaded = true
      if (state.sync.dirty) {
        ensureActiveList()
        cacheData(state.data)
        state.auth.status = 'authenticated'
        state.auth.error = ''
        state.sync.ready = true
        retryRemoteSync()
        return
      }
      if (!snapshot.exists()) {
        replaceData(defaultData())
        cacheData(state.data)
        state.auth.status = 'authenticated'
        state.auth.error = ''
        state.sync.error = ''
        state.sync.ready = true
        return
      }
      replaceData(snapshot.val())
      ensureActiveList()
      cacheData(state.data)
      state.auth.status = 'authenticated'
      state.auth.error = ''
      state.sync.error = ''
      state.sync.ready = true
    }, (error) => {
      state.sync.error = error.message
      state.auth.error = error.message
      state.auth.status = 'login'
      state.sync.ready = true
    })
  } catch (error) {
    resetRemoteConnection()
    if (options.silent && isOfflineError(error)) {
      state.auth.status = 'authenticated'
      state.auth.error = ''
      state.sync.mode = 'firebase'
      state.sync.error = error.message
      state.sync.ready = true
      ensureActiveList()
      return
    }
    state.auth.status = 'login'
    state.auth.error = error.message
    state.sync.ready = true
  }
}

export async function loadReferenceData() {
  resetRemoteConnection()
  state.auth.status = 'local'
  state.auth.error = ''
  state.sync.mode = 'reference'
  state.sync.error = ''
  state.sync.dirty = false
  state.sync.uid = ''
  state.ui.activeListIndex = null
  state.ui.activeItemIndex = null
  replaceData(defaultData())
  await loadReferenceFallback()
  ensureActiveList()
  state.sync.ready = true
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

  if (!remoteRef || !remoteSet || !remoteLoaded) {
    markRemoteDirty()
    return
  }

  state.sync.dirty = true
  await flushRemoteSave()
}

async function flushRemoteSave() {
  if (!remoteRef || !remoteSet || !remoteLoaded) {
    markRemoteDirty()
    return false
  }

  try {
    state.sync.saving = true
    await remoteSet(remoteRef, cloneData(state.data))
    state.sync.dirty = false
    state.sync.error = ''
    return true
  } catch (error) {
    markRemoteDirty(error.message)
    return false
  } finally {
    state.sync.saving = false
  }
}

async function retryRemoteSync() {
  if (state.sync.mode !== 'firebase' || !hasStoredCredentials() || state.sync.saving) {
    return
  }
  if (!remoteRef || !remoteSet || !remoteLoaded) {
    await loginWithFirebase({ silent: true })
    return
  }
  if (state.sync.dirty) {
    await flushRemoteSave()
  }
}

function markRemoteDirty(message = 'Offline changes pending sync.') {
  if (state.sync.mode !== 'firebase') {
    return
  }
  state.sync.dirty = true
  state.sync.error = message
}

function isOfflineError(error) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true
  }
  return /network|offline|unavailable/i.test(String(error?.message || error || ''))
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

function loadStoredCredentials() {
  try {
    const stored = localStorage.getItem(AUTH_CACHE_KEY)
    if (!stored) return { email: '', password: '' }
    const credentials = JSON.parse(stored)
    return {
      email: typeof credentials.email === 'string' ? credentials.email : '',
      password: typeof credentials.password === 'string' ? credentials.password : ''
    }
  } catch {
    return { email: '', password: '' }
  }
}

function saveStoredCredentials(email, password) {
  try {
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({ email, password }))
  } catch {
    // Login can still work even if the browser blocks localStorage writes.
  }
}

function hasStoredCredentials() {
  return Boolean(state.ui.loginEmail.trim() && state.ui.loginPassword)
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

function resetRemoteConnection() {
  if (remoteUnsubscribe) {
    remoteUnsubscribe()
  }
  remoteRef = null
  remoteSet = null
  remoteUnsubscribe = null
  remoteLoaded = false
}
