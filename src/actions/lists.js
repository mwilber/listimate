import { createList } from '../model.js'
import { activeList } from '../selectors.js'
import { commitData, saveActiveListSelection, state } from '../store.js'

export function addList() {
  const name = state.ui.listNameInput.trim()
  if (!name) return
  state.data.lists.push(createList(name))
  state.ui.listNameInput = ''
  state.ui.activeListIndex = state.data.lists.length - 1
  state.ui.activeItemIndex = null
  state.ui.menuOpen = false
  saveActiveListSelection()
  commitData()
}

export function selectList(index) {
  state.ui.activeListIndex = index
  state.ui.activeItemIndex = null
  state.ui.menuOpen = false
  state.ui.confirmDeleteItem = false
  saveActiveListSelection()
}

export function toggleMenu() {
  if (state.ui.activeItemIndex !== null && isNarrow()) {
    state.ui.activeItemIndex = null
    return
  }
  state.ui.menuOpen = !state.ui.menuOpen
}

export function backFromItems() {
  state.ui.activeListIndex = null
  state.ui.activeItemIndex = null
  state.ui.menuOpen = true
  saveActiveListSelection()
}

export function deleteList(index) {
  const list = state.data.lists[index]
  if (!list) return
  const confirmed = window.confirm(`Delete "${list.name}" and its items?`)
  if (!confirmed) return

  state.data.lists.splice(index, 1)
  state.ui.confirmDeleteList = null
  if (state.ui.activeListIndex === index) {
    state.ui.activeListIndex = state.data.lists.length ? 0 : null
    state.ui.activeItemIndex = null
  } else if (state.ui.activeListIndex > index) {
    state.ui.activeListIndex -= 1
  }
  saveActiveListSelection()
  commitData()
}

export function title() {
  return activeList(state)?.name || 'Listimate'
}

function isNarrow() {
  return window.matchMedia('(max-width: 768px)').matches
}
