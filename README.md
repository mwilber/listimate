# Listimate

Listimate is a small Progressive Web App for grocery shopping lists, price memory, and checkout. This repository is a ground-up replacement for an older production PWA while preserving the existing Firebase Realtime Database data shape.

The app uses:

- ArrowJS for reactive rendering.
- Plain ES modules, HTML, and CSS.
- Firebase Auth and Realtime Database for the production datastore.
- `localStorage` under the key `listimate` for offline startup cache compatibility.
- A service worker and web app manifest for installable PWA behavior.

There is no JavaScript build step.

## Project Structure

```text
config.example.js        Example runtime Firebase config
config.js                Local/runtime config placeholder
index.html               App entry point
manifest.webmanifest     PWA manifest
public/                  Icons
reference/               Product spec, screenshots, Firebase export
server.js                Local static file server
src/                     Application code
src/actions/             State mutations and workflow actions
src/render/              ArrowJS render templates
src/styles/              CSS
sw.js                    Service worker
test/                    Node test suite
vendor/                  Vendored ArrowJS runtime
```

## Requirements

- Node.js 20 or newer.
- A Firebase project with Email/Password Auth enabled.
- A Firebase Realtime Database.
- Realtime Database rules that allow the signed-in user to read and write their own UID root.

No npm dependencies are required for the current app. The `package.json` scripts use Node only.

## Local Installation

Clone the repository:

```sh
git clone git@github.com:mwilber/listimate.git
cd listimate
```

Run tests:

```sh
npm test
```

Start the local static server:

```sh
npm start
```

Open the app:

```text
http://localhost:4173/
```

If port `4173` is already in use, choose another port:

```sh
PORT=4174 npm start
```

## Firebase Setup

The app reads Firebase configuration from `window.LISTIMATE_CONFIG`, normally provided by `config.js`.

Copy the example config:

```sh
cp config.example.js config.js
```

Fill in `config.js`:

```js
window.LISTIMATE_CONFIG = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_DATABASE.firebaseio.com",
    projectId: "YOUR_PROJECT",
    appId: "YOUR_APP_ID"
  },
  auth: {
    email: "LISTIMATE_USER_EMAIL",
    password: "LISTIMATE_USER_PASSWORD"
  }
}
```

The app signs in with the configured email/password credentials and reads/writes data under:

```text
/{signedInUser.uid}
```

The expected Firebase data shape is:

```js
{
  lists: [
    {
      name: "WalMart",
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
      WalMart: 3.49,
      x: "x"
    }
  }
}
```

The legacy `state` object from the old app may exist in Firebase, but this replacement treats UI state as local-only and does not depend on it.

## Database Rules

Use Firebase Auth as the security boundary. A minimal single-user UID-scoped rule shape is:

```json
{
  "rules": {
    "$uid": {
      ".read": "auth != null && auth.uid == $uid",
      ".write": "auth != null && auth.uid == $uid"
    }
  }
}
```

Adjust the rules for your production requirements before deployment.

## Local-Only Mode

If `config.js` does not contain complete Firebase and auth settings, the app runs in local mode:

- It loads cached data from `localStorage` when available.
- If no local cache exists, it loads the sample data from `reference/listimate-export.json`.
- It does not attempt Firebase authentication or remote writes.

This lets the app be tested immediately after cloning.

## PWA Behavior

The app includes:

- `manifest.webmanifest`
- `sw.js`
- `192x192` and `512x512` icons
- Production service worker registration

The service worker is intentionally not registered on `localhost`, `127.0.0.1`, or `::1`. This avoids stale caches during local development. On a deployed non-localhost origin, the service worker precaches the app shell and avoids caching Firebase API responses.

## Deployment

Deploy the repository as static files. The server must serve:

- `index.html`
- `config.js`
- `manifest.webmanifest`
- `sw.js`
- `src/`
- `public/`
- `vendor/`

For production, provide `config.js` through your private deployment process rather than committing real credentials. Firebase browser config is not a true secret, but the configured email/password credential should be treated carefully. Security must come from Firebase Auth and Realtime Database rules.

## Development Notes

Run tests:

```sh
npm test
```

Run the local server:

```sh
npm start
```

Key behavior preserved from the previous app:

- Existing Firebase data loads without migration.
- Item-name price keys use the legacy normalization rule.
- List names act as store namespaces for price memory.
- Tapping the total toggles rounded and actual list views.
- Checkout keeps pinned or unpriced items, resets retained prices to `0`, and clears deferred state.

## Reference Materials

The `reference/` directory contains:

- `REPLACEMENT_APP_SPEC.md`: complete product and technical specification.
- `listimate-export.json`: Firebase export used for compatibility testing and local fallback.
- Two desktop screenshots showing rounded and actual total modes.
