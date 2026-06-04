# Listimate

Listimate is a small Progressive Web App for grocery shopping lists, price memory, and checkout. This repository is a ground-up replacement for an older production PWA while preserving the existing Firebase Realtime Database data shape.

The app uses:

- ArrowJS for reactive rendering.
- Plain ES modules, HTML, and CSS.
- Firebase Auth and Realtime Database for the production datastore.
- `localStorage` under the key `listimate` for offline startup cache compatibility.
- `localStorage` under the key `listimateAuth` for persisted Firebase login credentials.
- A service worker and web app manifest for installable PWA behavior.

There is no JavaScript build step.

## Project Structure

```text
config.example.js        Example runtime Firebase config
config.js                Local/runtime config placeholder
index.html               App entry point
manifest.webmanifest     PWA manifest
public/                  Icons
public/ListimateMcp/     Public PHP MCP entrypoints for LAMP deployment
reference/               Product spec, screenshots, Firebase export
server.js                Local static file server
standalone-mcp/          Private PHP MCP implementation and config template
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
- PHP 8.1 or newer for the optional LAMP MCP server.
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
  }
}
```

The app shows a login screen when complete Firebase config is present. Sign in with an Email/Password user from your Firebase project. After a successful sign-in, the email and password are stored in browser `localStorage` under `listimateAuth` so future app launches can sign in automatically.

After sign-in, the app reads/writes data under:

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

If `config.js` does not contain complete Firebase settings, the app runs in local mode:

- It loads cached data from `localStorage` when available.
- If no local cache exists, it loads the sample data from `reference/listimate-export.json`.
- It does not attempt Firebase authentication or remote writes.

This lets the app be tested immediately after cloning.

When Firebase config is present, the login screen also includes a **Cancel and Load Reference Data** button. Use it to bypass Firebase and load the reference export for local testing.

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

For production, provide `config.js` through your deployment process. Firebase browser config is not a true secret, so security must come from Firebase Auth and Realtime Database rules. User credentials are entered on the login screen and stored in browser `localStorage` for automatic future sign-in; only use this on trusted devices.

## LAMP MCP Server

The `standalone-mcp/` and `public/ListimateMcp/` directories provide a PHP MCP server that can run on a LAMP host without Node, Composer, or a long-running process. It follows `reference/STANDALONE_MCP_SERVER_SPEC.md`.

Configure the private server token:

```sh
cp standalone-mcp/config.php.dist standalone-mcp/config.php
```

Edit `standalone-mcp/config.php` and set `user_token`. You can also set `firebase_api_key` and `firebase_database_url` there, or pass those values from the MCP client.

Deploy `public/ListimateMcp/` under the web document root and keep `standalone-mcp/` outside the public document root. The public PHP files are tiny shims and contain no secrets.

MCP calls require `x-user-token: YOUR_TOKEN` or `Authorization: Bearer YOUR_TOKEN`. Firebase login credentials are supplied by the MCP client using headers:

```text
x-firebase-api-key: Firebase web API key
x-firebase-database-url: Firebase Realtime Database URL
x-firebase-email: Firebase Email/Password user email
x-firebase-password: Firebase Email/Password user password
```

The server provides two tools:

- `list_lists`: returns all existing list names for the signed-in Firebase user.
- `add_item_to_list`: accepts `listName` and `itemName`, and only writes when `listName` exactly matches an existing list name. Unknown lists return an error telling the client to use `list_lists`.

Useful checks:

```sh
curl -sS https://example.com/ListimateMcp/health

curl -sS -X POST https://example.com/ListimateMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

curl -sS -X POST https://example.com/ListimateMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  -H 'x-firebase-api-key: FIREBASE_API_KEY' \
  -H 'x-firebase-database-url: https://YOUR_DATABASE.firebaseio.com' \
  -H 'x-firebase-email: USER@example.com' \
  -H 'x-firebase-password: USER_PASSWORD' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_lists","arguments":{}}}'

curl -sS -X POST https://example.com/ListimateMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  -H 'x-firebase-api-key: FIREBASE_API_KEY' \
  -H 'x-firebase-database-url: https://YOUR_DATABASE.firebaseio.com' \
  -H 'x-firebase-email: USER@example.com' \
  -H 'x-firebase-password: USER_PASSWORD' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"add_item_to_list","arguments":{"listName":"WalMart","itemName":"Milk"}}}'
```

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
