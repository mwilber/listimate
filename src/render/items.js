import { html } from '../../vendor/arrow-core.mjs'
import { addItem, openItem } from '../actions/items.js'
import { activeList, isChecked, missingCount, priceInfo, totalDisplay, visibleItems } from '../selectors.js'
import { state } from '../store.js'

export function ItemsPane() {
  return html`
    <section class="panel panel-items" aria-label="Items">
      <form class="entry-row" @submit="${(event) => { event.preventDefault(); addItem() }}">
        <label class="sr-only" for="item-name">Item name</label>
        <input
          id="item-name"
          class="entry-input"
          placeholder="Item Name"
          autocomplete="off"
          value="${() => state.ui.itemNameInput}"
          disabled="${() => !activeList(state)}"
          @input="${(event) => { state.ui.itemNameInput = event.currentTarget.value }}"
        >
        <button class="icon-button add-button" type="submit" aria-label="Add item" disabled="${() => !activeList(state)}">+</button>
      </form>

      ${() => activeList(state) ? html`
        <button
          class="total-bar"
          type="button"
          @click="${() => { state.ui.totalMode = state.ui.totalMode === 'rounded' ? 'actual' : 'rounded' }}"
          aria-label="Toggle estimated and actual totals"
        >
          <span class="total-value">
            <span class="total-currency">$</span>
            <span>${() => totalDisplay(state).replace(/^\$\s*/, '')}</span>
          </span>
          <span class="total-count">Items: ${() => missingCount(activeList(state))}</span>
        </button>

        <div class="rows item-rows">
          ${() => visibleItems(state).map((item) => {
            const list = activeList(state)
            const index = list.items.indexOf(item)
            const info = priceInfo(state, item)
            return html`
              <button
                class="${() => itemClass(item, index)}"
                type="button"
                @click="${() => openItem(index)}"
              >
                <span class="item-copy">
                  <span class="item-name">
                    <span class="pin" aria-hidden="true">${() => item.pinned === 'true' ? '⌖' : ''}</span>
                    ${() => item.name}
                  </span>
                  <span class="price-tags">
                    ${() => info.currentLabel ? html`
                      <span class="price-tag">
                        <span>${info.currentLabel}</span>
                        ${() => info.bestLabel ? html`<span>&gt; ${info.bestLabel}</span>` : ''}
                      </span>
                    ` : ''}
                  </span>
                </span>
                <span class="item-math">
                  ${() => Number(item.price || 0) > 0 ? html`<span class="row-price">$${Number(item.price).toFixed(2)}</span>` : ''}
                  <span>x${() => item.quantity ?? 1}</span>
                </span>
              </button>
            `
          })}
        </div>
      ` : html`
        <div class="empty-state">Select or add a list.</div>
      `}
    </section>
  `
}

function itemClass(item, index) {
  return [
    'row',
    'item-row',
    state.ui.activeItemIndex === index ? 'active' : '',
    isChecked(item) ? 'checked' : '',
    item.defer ? 'deferred' : ''
  ].filter(Boolean).join(' ')
}
