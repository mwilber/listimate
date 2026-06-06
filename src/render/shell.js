import { html } from '../../vendor/arrow-core.mjs'
import { checkout } from '../actions/checkout.js'
import { title, toggleMenu } from '../actions/lists.js'
import { activeItem, activeList } from '../selectors.js'
import { state } from '../store.js'
import { ChevronLeftIcon } from './icons.js'
import { ItemDetailPane } from './itemDetail.js'
import { ItemsPane } from './items.js'
import { ListsPane } from './lists.js'
import { LoginScreen } from './login.js'

export function Shell() {
  return html`
    ${() => state.auth.status === 'checking' ? StartupScreen() : shouldShowLogin() ? LoginScreen() : html`
    <div class="${() => appClass()}">
      <header class="app-header">
        <button
          class="header-button"
          type="button"
          aria-label="${() => activeItem(state) ? 'Back' : 'Menu'}"
          @click="${toggleMenu}"
        >
          ${() => activeItem(state) ? ChevronLeftIcon() : '☰'}
        </button>
        <h1>${() => title()}</h1>
        ${() => activeList(state) ? html`
          <button class="header-button" type="button" aria-label="Checkout" @click="${checkout}">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shopping-cart" class="cart-icon svg-inline--fa fa-shopping-cart fa-w-18" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"></path></svg>
          </button>
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
    </div>
    `}
  `
}

function StartupScreen() {
  return html`
    <main class="login-screen" aria-label="Loading Listimate">
      <section class="login-panel">
        <h1>Listimate</h1>
        <p>Loading...</p>
      </section>
    </main>
  `
}

function shouldShowLogin() {
  return state.auth.hasConfig && ['login', 'signing-in'].includes(state.auth.status)
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
