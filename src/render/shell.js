import { html } from '../../vendor/arrow-core.mjs'
import { checkout } from '../actions/checkout.js'
import { backFromItems, title, toggleMenu } from '../actions/lists.js'
import { activeItem, activeList } from '../selectors.js'
import { state } from '../store.js'
import { ItemDetailPane } from './itemDetail.js'
import { ItemsPane } from './items.js'
import { ListsPane } from './lists.js'

export function Shell() {
  return html`
    <div class="${() => appClass()}">
      <header class="app-header">
        <button
          class="header-button"
          type="button"
          aria-label="${() => activeItem(state) ? 'Back' : 'Menu'}"
          @click="${toggleMenu}"
        >
          ${() => activeItem(state) ? '‹' : '☰'}
        </button>
        <h1>${() => title()}</h1>
        ${() => activeList(state) ? html`
          <button class="header-button" type="button" aria-label="Checkout" @click="${checkout}">🛒</button>
        ` : html`<span class="header-spacer"></span>`}
      </header>

      ${() => state.sync.error ? html`
        <div class="sync-banner" role="status">${() => syncMessage()}</div>
      ` : ''}

      <main class="panes">
        ${ListsPane()}
        ${ItemsPane()}
        ${ItemDetailPane()}
      </main>

      ${() => activeList(state) && !activeItem(state) ? html`
        <button class="mobile-back" type="button" @click="${backFromItems}">Lists</button>
      ` : ''}
    </div>
  `
}

function appClass() {
  return [
    'app-shell',
    state.ui.menuOpen ? 'menu-open' : '',
    activeList(state) ? 'has-list' : 'no-list',
    activeItem(state) ? 'has-item' : 'no-item',
    state.sync.saving ? 'saving' : ''
  ].filter(Boolean).join(' ')
}

function syncMessage() {
  if (state.sync.mode === 'local') return `Local mode: ${state.sync.error}`
  return state.sync.error
}
