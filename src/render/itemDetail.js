import { html } from '../../vendor/arrow-core.mjs'
import {
  closeItem,
  deleteItem,
  incrementQuantity,
  moveItemToList,
  saveItem,
  saveRememberedPriceOnly,
  toggleDeferred,
  toggleMoveList,
  togglePinned,
  zeroBlur,
  zeroFocus
} from '../actions/items.js'
import { activeItem, priceInfo } from '../selectors.js'
import { state } from '../store.js'
import { CheckIcon, MapPinIcon, MoveToListIcon, TrashIcon } from './icons.js'

export function ItemDetailPane() {
  return html`
    <section class="panel panel-detail" aria-label="Item detail">
      ${() => activeItem(state) ? detailTemplate() : html`
        <div class="detail-empty">Select an item.</div>
      `}
    </section>
  `
}

function detailTemplate() {
  const item = activeItem(state)
  const info = priceInfo(state, item)

  return html`
    <div class="detail-body">
      <h2>${() => activeItem(state)?.name}</h2>

      <div class="field-grid">
        <label class="price-label" for="item-price">$</label>
        <input
          id="item-price"
          class="number-field price-field"
          inputmode="decimal"
          value="${() => state.ui.detailDraft.price}"
          @focus="${zeroFocus}"
          @blur="${(event) => zeroBlur('price', event)}"
          @input="${(event) => { state.ui.detailDraft.price = event.currentTarget.value }}"
        >
        ${() => info.current > 0 ? html`
          <button
            class="autofill-tag"
            type="button"
            @click="${() => { state.ui.detailDraft.price = String(info.current) }}"
          >
            Use ${info.currentLabel}
          </button>
        ` : ''}

        <label class="qty-label" for="item-quantity">qty</label>
        <input
          id="item-quantity"
          class="number-field qty-field"
          inputmode="decimal"
          value="${() => state.ui.detailDraft.quantity}"
          @focus="${zeroFocus}"
          @blur="${(event) => zeroBlur('quantity', event)}"
          @input="${(event) => { state.ui.detailDraft.quantity = event.currentTarget.value }}"
        >
        <div class="qty-stepper" aria-label="Quantity controls">
          <button type="button" @click="${() => incrementQuantity(1)}" aria-label="Increase quantity">+</button>
          <button type="button" @click="${() => incrementQuantity(-1)}" aria-label="Decrease quantity">-</button>
        </div>
      </div>

      <button class="primary-action" type="button" @click="${saveItem}" aria-label="Save item">${CheckIcon()}</button>

      <div class="detail-actions">
        <button
          class="${() => `secondary-action ${activeItem(state)?.pinned === 'true' ? 'active' : ''}`}"
          type="button"
          @click="${togglePinned}"
          aria-pressed="${() => activeItem(state)?.pinned === 'true' ? 'true' : 'false'}"
          aria-label="Toggle pinned"
        >
          ${MapPinIcon()}
        </button>
        <button class="secondary-action" type="button" @click="${saveRememberedPriceOnly}" aria-label="Remember price only">$</button>
        <button
          class="${() => `secondary-action ${activeItem(state)?.defer ? 'active' : ''}`}"
          type="button"
          @click="${toggleDeferred}"
          aria-pressed="${() => activeItem(state)?.defer ? 'true' : 'false'}"
          aria-label="Toggle deferred"
        >
          D
        </button>
      </div>

      <div class="danger-actions">
        <div class="move-action-wrap">
          <button
            class="move-action"
            type="button"
            @click="${toggleMoveList}"
            aria-expanded="${() => state.ui.moveListOpen ? 'true' : 'false'}"
            aria-label="Move to list"
          >
            ${MoveToListIcon()}
          </button>
          ${() => state.ui.moveListOpen ? moveListPopup() : ''}
        </div>
        <button class="delete-action" type="button" @click="${deleteItem}" aria-label="Delete item">
          ${() => state.ui.confirmDeleteItem ? 'CONFIRM DELETE' : TrashIcon()}
        </button>
      </div>
    </div>
  `
}

function moveListPopup() {
  const activeIndex = state.ui.activeListIndex
  const targetLists = state.data.lists
    .map((list, index) => ({ list, index }))
    .filter(({ index }) => index !== activeIndex)

  return html`
    <div class="move-list-popup" role="menu" aria-label="Move item to list">
      ${targetLists.length ? targetLists.map(({ list, index }) => html`
        <button
          class="move-list-option"
          type="button"
          role="menuitem"
          @click="${() => moveItemToList(index)}"
          key="${index}"
        >
          ${list.name}
        </button>
      `) : html`
        <div class="move-list-empty">No other lists</div>
      `}
    </div>
  `
}
