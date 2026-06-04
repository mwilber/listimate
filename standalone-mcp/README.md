# Listimate MCP Server

This is a standalone PHP MCP server for Listimate. It is intended for LAMP or shared-hosting deployments and does not require Node, Composer, or a long-running process.

## Layout

```text
standalone-mcp/          Private implementation and config
public/ListimateMcp/     Public web entrypoints
```

Keep `standalone-mcp/config.php` outside version control.

## Setup

```sh
cp standalone-mcp/config.php.dist standalone-mcp/config.php
```

Edit `standalone-mcp/config.php` and set `user_token`. You may also set `firebase_api_key` and `firebase_database_url`, or pass them from the MCP client.

Copy `public/ListimateMcp/` to the web document root and keep `standalone-mcp/` beside or above the public directory so the shim paths still resolve.

## Client Headers

MCP calls require one of:

```text
x-user-token: YOUR_TOKEN
Authorization: Bearer YOUR_TOKEN
```

Firebase login credentials are passed by the MCP client:

```text
x-firebase-api-key: Firebase web API key
x-firebase-database-url: Firebase Realtime Database URL
x-firebase-email: Firebase Email/Password user email
x-firebase-password: Firebase Email/Password user password
```

## Tools

- `list_lists`: returns all existing list names.
- `add_item_to_list`: accepts `listName` and `itemName`. `listName` must exactly match an existing list, or the server returns an error instructing the client to call `list_lists`.

## Checks

```sh
curl -sS https://example.com/ListimateMcp/health
curl -sS -X POST https://example.com/ListimateMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```
