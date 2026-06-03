# Listimate Replacement App Technical Specification

## 1. Purpose

Build a replacement for the current Listimate grocery-list PWA with functional and UX parity, while discarding the abandoned web-component framework experiment. The replacement should be a small, maintainable vanilla JavaScript PWA that preserves the current Firebase Realtime Database datastore and supports the existing weekly grocery-list workflow.

The rewrite should keep the app's practical behavior: create grocery lists, add items, record price and quantity during shopping, estimate the total, retain pinned items after checkout, defer items, and remember item prices per list/store key. In the replacement app, list name and store name are the same domain concept: each list represents a store context for shopping and price memory.

## 2. Goals

- Preserve compatibility with the existing Firebase data shape so current grocery-list data continues to load without migration.
- Keep the app installable and usable as a PWA on mobile, with a portrait-first layout.
- Use vanilla browser APIs only for the app runtime: ES modules, DOM APIs, CSS, Firebase SDK, service worker, localStorage/IndexedDB if needed.
- Avoid the old framework-like custom elements for conditional rendering and repeaters.
- Improve maintainability through explicit state, rendering, routing/view logic, and Firebase synchronization.
- Preserve the current UX flows and visual density closely enough that the replacement can be used immediately for the weekly shopping routine.

## 3. Non-Goals

- Do not rebuild the experimental Angular-like web-component abstraction.
- Do not change the primary datastore unless explicitly approved.
- Do not add multi-user collaboration features beyond whatever Firebase already provides for the signed-in account.
- Do not require a backend service beyond Firebase.
- Do not replace the shopping workflow with a recipe, meal-planning, barcode, or inventory-management app.

## 4. Current App Summary

The existing app is a Firebase-backed grocery-list PWA. It signs in with configured Firebase email/password credentials, reads the signed-in user's Realtime Database root, mirrors it to `localStorage` under `listimate`, and writes the full datastore back to Firebase on each update.

The current UI has three main panes:

- Lists pane: create, select, and manage/delete grocery lists.
- Items pane: add items, view estimated totals, view item price/quantity state, and open item detail.
- Item detail pane: edit price and quantity, save, pin, defer, update only remembered price, or delete.

Responsive behavior:

- Desktop/tablet: panes can appear side by side.
- Narrow screens: panes stack as full-screen views with back buttons.
- Header remains at top with menu, active list title, and checkout action.

## 5. Existing Data Model

The replacement must be able to read and write the existing data model.

```js
{
  lists: [
    {
      name: "Weekly Groceries",
      number: 0,
      stores: {
        WalMart: true,
        Aldi: false
      },
      items: [
        {
          name: "Milk",
          price: 3.49,
          quantity: 1,
          pinned: "true",
          defer: false
        }
      ]
    }
  ],
  prices: {
    MILK: {
      Weekly_Groceries: 3.49,
      Aldi: 2.99,
      WalMart: 3.49,
      x: "x"
    }
  },
  state: {
    activeList: "lists[0]",
    activeItem: "lists[0].items[2]",
    activeMenu: true
  }
}
```

### 5.1 Top-Level Fields

- `lists`: array of grocery lists.
- `prices`: object keyed by normalized item name. Some existing records may include a placeholder property `{ x: "x" }`.
- `state`: UI state used by the old app. The replacement should treat UI state as local-only and should not rely on persisted Firebase `state` for startup navigation.

### 5.2 List Fields

- `name`: display name and the effective store/price namespace used by item price memory.
- `number`: legacy numeric field; currently created as `0` and not visibly used.
- `stores`: legacy store toggle map. This should be retained only for compatibility with existing data; the replacement should codify the list name itself as the store context.
- `items`: array of grocery list items.

### 5.3 Item Fields

- `name`: item display name.
- `price`: numeric price entered during shopping. `0` means not yet priced/checked.
- `quantity`: numeric quantity multiplier. Current default is `1`.
- `pinned`: legacy string flag, `"true"` or `"false"`. Existing UI treats only string `"true"` as pinned.
- `defer`: boolean flag. Deferred items are excluded from rounded-mode active shopping display and checkout totals.

### 5.4 Price Memory Fields

The current app normalizes item names as:

```js
name.replace(/(\s+|s$|s\s+$)/g, "").toUpperCase()
```

Examples:

- `"Milk"` -> `"MILK"`
- `"Paper Towels"` -> likely `"PAPERTOWEL"`
- `"Eggs"` -> `"EGG"`

The replacement must preserve this normalization for backwards compatibility unless a migration is explicitly added.

Each normalized item key stores prices by list/store key:

```js
prices[normalizedItemName][storeOrListKey] = price
```

Current item-list rendering uses the active list name with spaces replaced by underscores as the price namespace. The replacement should keep this convention and formally treat each list as the store context:

```js
const storeName = list.name.replace(/ /g, "_")
```

The dormant location toggle uses `stores` keys such as `WalMart` and `Aldi`. The replacement should remove or ignore this legacy toggle unless there is a future need to support multiple store contexts inside one list.

## 6. Firebase Requirements

- Use the same Firebase project and Realtime Database.
- Authenticate through a small `auth.js` abstraction using configured Firebase email/password credentials. This is a single-user app and should stay simple.
- Read/write data under the signed-in user's UID root.
- Subscribe to the user's root value and keep local app state updated from remote changes.
- On local mutations, write compatible data back to Firebase.
- Preserve full offline startup using cached data when Firebase is unavailable.
- Avoid destructive overwrites during startup:
  - Load local cache immediately.
  - Subscribe to Firebase.
  - Treat the first remote snapshot as authoritative if it exists.
  - Do not write default empty data over an existing remote store.

### 6.1 Write Strategy

The current app writes the entire datastore on every mutation. The replacement may use either:

- Full-root writes for exact behavioral parity.
- Targeted `update()` calls for safer concurrency.

If targeted writes are used, the in-memory state and local cache must still reflect the full datastore after each mutation.

### 6.2 Authentication Options

This is a single-user app and should keep authentication as simple as possible. The replacement should use a small `auth.js` module that signs in with configured Firebase email/password credentials and exposes the authenticated user/UID to the Firebase data layer.

Selected approach: configured email/password credentials.

- Closest to the current app.
- Lowest implementation complexity.
- Appropriate for a private personal tool that is likely to remain single-user forever.
- No user-facing login screen.
- Credentials must not be committed directly in source. Use environment-specific config, build-time injection, Firebase hosting config, or another private deployment mechanism.
- Main risk: a deployed browser app cannot truly keep Firebase client credentials secret. Security must come from Firebase Auth and Realtime Database rules, not from hiding the config.
- Keep this behind `auth.js` so a sign-in UI could be added later without touching grocery-list logic.

Deferred option: user-facing Firebase email/password sign-in screen.

- Better long-term security posture.
- Allows the app to work for more than one user without rebuilding.
- Keeps each user's data under their Firebase UID.
- Requires login, logout, loading, and auth-error UI.
- Requires a local "remember signed-in user" flow using Firebase Auth persistence.
- More friction for a weekly personal grocery app, so it is not part of the initial replacement.

Deferred option: Google sign-in or another Firebase identity provider.

- Best user experience if the app is expanded beyond one person.
- Avoids managing a password dedicated to this app.
- Requires provider configuration in Firebase and sign-in UI.
- May require production domain configuration before deployment.

### 6.3 Local Cache

- Store the most recent full datastore locally.
- The current key is `listimate`; keep this key for compatibility.
- Use `localStorage` for parity, or IndexedDB for robustness with a compatibility bridge.
- If local cache JSON is invalid, ignore it and continue with a safe default.

## 7. Application State

Use explicit client state separate from persisted list data.

Recommended runtime state:

```js
{
  lists: [],
  prices: {},
  activeListIndex: null,
  activeItemIndex: null,
  menuOpen: false,
  totalMode: "rounded" // "rounded" or "actual"
}
```

Persist only list and price data. UI state should be local-only and should not be written to Firebase by the replacement.

## 8. Screens and Views

### 8.1 App Shell

The app shell contains:

- Fixed-height header.
- Menu button on the left.
- Centered title showing active list name, or app name when no list is selected.
- Checkout button on the right when a list is active.
- Main content area containing lists, items, and item-detail views.

Header visual parity:

- Green header.
- White title text.
- Menu icon on the left.
- Cart/checkout icon on the right.
- Compact mobile-first sizing.

### 8.2 Lists View

Capabilities:

- Display all saved lists.
- Add a new list by entering a list name and tapping/clicking add.
- Select a list.
- Toggle manage mode.
- In manage mode, show delete controls for lists.
- Delete a list after confirmation or with an undo affordance.

New-list default object:

```js
{
  name,
  number: 0,
  stores: {
    WalMart: true,
    Aldi: false
  },
  items: []
}
```

Behavioral parity:

- Selecting a list closes the side menu.
- Active list title appears in the header.
- Add list does nothing for empty input.
- Input clears after a successful add.

### 8.3 Items View

Capabilities:

- Add an item to the active list.
- Display active list items.
- Show item name, price, quantity, pinned indicator, deferred styling, and best-price tag.
- Tap/click an item to open detail view.
- Show total summary.
- Toggle between rounded total mode and actual total mode by tapping the total summary.

New-item default object:

```js
{
  name,
  price: 0,
  quantity: 1
}
```

Item state display:

- Items with `price > 0` and `quantity > 0` are considered checked and shown with line-through.
- Items with `defer === true` are shown in muted/deferred styling.
- Items with `pinned === "true"` show a pin icon.
- Items with `price === 0` hide the displayed price.
- Quantity displays as `x{quantity}`.

Rounded mode behavior:

- Hide checked items.
- Hide deferred items.
- Show rounded estimated total rather than exact total.

Actual mode behavior:

- Show all items.
- Show exact total with two decimals.

Totals:

- Exact total: sum of `price * quantity` for all items.
- Rounded total: sum of `ceil(price) * quantity`, displayed as an integer.
- Deferred items remain included in exact and rounded total calculation for parity. In normal use their price should be `0`.
- Missing count: count non-deferred items where `price == 0` or `quantity == 0`.

### 8.4 Item Detail View

Capabilities:

- Show item name as the page title.
- Edit price.
- Edit quantity.
- Increment quantity.
- Decrement quantity, clamped to `0`.
- Save price and quantity.
- Save remembered price only.
- Toggle pinned.
- Toggle deferred.
- Delete item.
- Back to items view without changing item.

Inputs:

- Price input should use `inputmode="decimal"`.
- Quantity input should use `inputmode="decimal"`.
- If an input value is exactly `"0"` when focused/clicked, clear it.
- If an input loses focus while empty, restore `"0"`.

Save behavior:

- Save updates the item with parsed numeric `price` and `quantity`.
- If a nonzero price exists and a price namespace exists, update `prices[normalizedName][namespace]`.
- Close detail view after save.

Price-only behavior:

- Update only `prices[normalizedName][namespace]`.
- Do not update the list item's `price` or `quantity`.
- Close detail view.

Pin behavior:

- Toggle `pinned` between string `"true"` and string `"false"` for compatibility.
- Current app does not automatically close detail view after pin toggle.

Defer behavior:

- Toggle `defer` boolean.
- Close detail view.

Delete behavior:

- Remove the item from the active list.
- Close detail view.
- Prefer confirmation or undo before destructive removal.

### 8.5 Checkout Flow

The checkout button appears when a list is active.

Current behavior:

1. Prompt with `confirm("Are you sure?")`.
2. Keep only items where:
   - `price == 0`, or
   - `pinned === "true"`.
3. For all retained items:
   - set `price = 0`
   - set `defer = false`
4. Replace the active list's `items` with this retained array.

Implications:

- Checked, unpinned items are removed.
- Pinned items survive checkout but their price resets to `0`.
- Unpriced items survive checkout.
- Deferred items only survive if unpriced or pinned; retained deferred items become non-deferred.

Replacement behavior must match this unless explicitly changed.

### 8.6 Price Memory and Best Price Tags

For each item row:

- Determine the active price namespace.
- Read `prices[normalizedItemName]`.
- Show the current namespace price, if available.
- Find the lowest available price among all namespaces, ignoring placeholder `x`.
- If the best price belongs to a different namespace, show it after a `>` indicator.

Example display:

```text
Weekly Groceries $3.49  >  Aldi $2.99
```

For item detail:

- Show an autofill price tag for the current namespace when available.
- Clicking the autofill price tag populates the price input.

Compatibility behavior:

- If `prices[normalizedItemName]` is undefined, create a placeholder `{ x: "x" }` before future price writes, or safely create the nested object during the write.

## 9. Navigation and Responsive UX

The replacement should not require URL routing, but it should have deterministic view state.

Recommended responsive behavior:

- `>= 769px`: show lists and items columns side by side; show detail as a third column when active.
- `481px - 768px`: side menu overlays from the left; items remain primary.
- `<= 480px`: show one primary view at a time:
  - no active list: lists view
  - active list, no active item: items view
  - active item: detail view

Back behavior:

- From detail: close active item and return to items.
- From items on narrow screens: clear active list and return to lists, or open lists menu. Current behavior clears active list.
- Menu button toggles list menu.

## 10. Visual Design Requirements

Match the current app's utilitarian grocery-list feel rather than introducing a marketing-style interface.

Core visual traits:

- Compact controls.
- High-contrast list rows.
- Green header.
- Light item/list panels.
- Pale yellow text-entry fields.
- Dark total bar.
- Large numeric price/quantity fields in detail.
- Big tappable action buttons for save/delete/pin/defer.
- Icons for menu, add, checkout, back, pin, save, delete.

CSS variables from current app that can be retained:

```css
:root {
  --header-background-color: #306e4f;
  --button-background-color: #e9ecef;
  --accent-background-color: #568f72;
  --alert-background-color: #cc6666;
  --input-background-color: #f8faf4;
  --input-color: #495057;
  --button-color: #495057;
  --logo-height: 50px;
  --col-background-color: #fff;
}
```

The current patterned green page background is optional behind the functional app surface, but the replacement should avoid reducing information density.

## 11. Accessibility Requirements

The existing app has mostly div-based click targets and inline SVGs. The replacement should improve accessibility while preserving UX.

Required:

- Use semantic `button` elements for all actions.
- Provide accessible names for icon-only buttons.
- Use real `label` elements or `aria-label` for inputs.
- Maintain visible focus states.
- Support keyboard activation for all actions.
- Keep touch targets large enough for mobile use.
- Announce destructive confirmations clearly.
- Ensure color is not the only indicator of pinned/deferred/checked state.

## 12. PWA Requirements

- Include a web app manifest with:
  - `name`: `Listimate`
  - `short_name`: `Listimate`
  - `display`: `standalone`
  - `orientation`: `portrait`
  - app icons, including at least `192x192` and `512x512`
  - theme color matching the green header
- Register a service worker in production.
- Precache app shell assets.
- Runtime-cache static assets.
- Do not cache Firebase API responses in a way that breaks live data.
- App must load to a usable cached state while offline.
- Firebase writes made while offline should be handled by Firebase's client persistence if enabled, or queued explicitly.

## 13. Suggested Architecture

Recommended file structure:

```text
src/
  app.js
  firebase.js
  store.js
  model.js
  selectors.js
  render/
    shell.js
    lists.js
    items.js
    itemDetail.js
  actions/
    lists.js
    items.js
    checkout.js
    prices.js
  styles/
    base.css
    layout.css
    components.css
public/
  manifest.json
  service-worker.js
```

### 13.1 State Store

Use a simple observable store:

- Holds current data and UI state.
- Provides `getState()`, `setState()`, and `subscribe()`.
- Mutations happen through named action functions.
- Each action updates memory, local cache, render subscribers, and Firebase.

### 13.2 Rendering

Use vanilla DOM rendering:

- Render from state.
- Prefer small render functions that return DOM nodes or update known containers.
- Use event delegation for list rows and buttons where practical.
- Avoid string-based path mutation like `lists[0].items[1]` as the main internal API, though helper functions can parse legacy paths if needed.

### 13.3 Data Actions

Required actions:

- `loadLocalData()`
- `connectFirebase()`
- `selectList(index)`
- `clearActiveList()`
- `selectItem(index)`
- `clearActiveItem()`
- `toggleMenu()`
- `addList(name)`
- `deleteList(index)`
- `addItem(listIndex, name)`
- `updateItem(listIndex, itemIndex, patch)`
- `deleteItem(listIndex, itemIndex)`
- `togglePinned(listIndex, itemIndex)`
- `toggleDeferred(listIndex, itemIndex)`
- `saveItemDetail(listIndex, itemIndex, price, quantity)`
- `saveRememberedPrice(normalizedName, namespace, price)`
- `checkoutList(listIndex)`
- `toggleTotalMode()`

## 14. Data Validation and Edge Cases

Handle these cases explicitly:

- Empty or missing `lists`.
- Missing `items` on an existing list.
- Missing `prices`.
- Missing price record for an item.
- Invalid persisted active list/item indices.
- Invalid numbers in price or quantity inputs.
- `pinned` as either string or boolean in existing data; write string for compatibility unless migration is approved.
- `defer` missing; treat as `false`.
- Price `0`, empty string, and `NaN`; normalize writes to numbers.
- Duplicate list names. Current app allows them, but price namespace by list name may collide.
- Duplicate item names. Current app allows them and shares price memory.

## 15. Testing Requirements

Automated tests should cover:

- Item normalization.
- Total calculation.
- Rounded-mode filtering.
- Checkout retention/removal rules.
- Price memory update and best-price selection.
- Add/delete list.
- Add/delete item.
- Pinned and deferred toggles.
- Firebase snapshot merge/replace behavior.
- Local cache fallback.

Manual QA should cover:

- Install/open as PWA on mobile.
- Offline app startup.
- Offline add/update followed by reconnect.
- Checkout on a real list.
- Mobile navigation between lists, items, and detail.
- Price autofill from remembered price.
- Best-price tag display when another namespace has a lower price.

## 16. Implementation Milestones

1. Create new vanilla JS app shell, styles, manifest, and service worker registration.
2. Implement datastore compatibility layer and local cache load.
3. Implement Firebase auth, subscribe, and write flow.
4. Implement lists view.
5. Implement items view, totals, and rounded/actual toggle.
6. Implement item detail view.
7. Implement checkout flow.
8. Implement price memory, autofill, and best-price display.
9. Add responsive behavior and accessibility polish.
10. Add tests for core data actions.
11. Run side-by-side QA against existing app with current Firebase data.

## 17. Clarification Questions

These should be answered before or during implementation:

1. Should duplicate list/store names remain allowed even though they collide in price-memory namespaces after spaces are converted to underscores?
2. Should deleting a list or item use the current immediate delete behavior, browser confirmation, or an undo pattern?
3. Should checkout keep the exact current rules, especially keeping unpriced items and pinned items while removing priced unpinned items?
4. Should pinned be migrated from string `"true"`/`"false"` to boolean, or preserved exactly for Firebase compatibility?
5. Should item names be editable in the replacement? The current app supports adding and deleting items but not renaming them.
6. Should lists/stores be renameable? The current app supports adding, selecting, deleting, but not renaming them.
7. Should the replacement keep the exact old app visual identity, or is a modest visual refresh acceptable as long as workflow density and layout parity remain?
