import { html } from '../../vendor/arrow-core.mjs'
import { addList, deleteList, selectList } from '../actions/lists.js'
import { state } from '../store.js'

export function ListsPane() {
  return html`
    <section class="panel panel-lists" aria-label="Lists">
      <form class="entry-row" @submit="${(event) => { event.preventDefault(); addList() }}">
        <label class="sr-only" for="list-name">List name</label>
        <input
          id="list-name"
          class="entry-input"
          placeholder="List Name"
          autocomplete="off"
          value="${() => state.ui.listNameInput}"
          @input="${(event) => { state.ui.listNameInput = event.currentTarget.value }}"
        >
        <button class="icon-button add-button" type="submit" aria-label="Add list">+</button>
      </form>

      <div class="rows list-rows">
        ${() => state.data.lists.map((list, index) => html`
          <div class="${() => `row list-row ${state.ui.activeListIndex === index ? 'active' : ''}`}">
            <button
              class="row-main"
              type="button"
              @click="${() => selectList(index)}"
              aria-current="${() => state.ui.activeListIndex === index ? 'true' : 'false'}"
            >
              ${() => list.name}
            </button>
            ${() => state.ui.manageLists ? html`
              <button
                class="row-action danger-small"
                type="button"
                aria-label="${() => `Delete ${list.name}`}"
                @click="${() => deleteList(index)}"
              >
                🗑
              </button>
            ` : ''}
          </div>
        `)}
      </div>

      <button
        class="${() => `manage-button ${state.ui.manageLists ? 'active' : ''}`}"
        type="button"
        @click="${() => { state.ui.manageLists = !state.ui.manageLists }}"
      >
        ${() => state.ui.manageLists ? 'DONE' : 'MANAGE'}
      </button>
    </section>
  `
}
