# Standalone Web MCP Server Technical Spec

This document describes how to implement a web-accessible Model Context Protocol
(MCP) server using the same architecture as the Ampache MCP server, but without
any dependency on Ampache or another host application.

The goal is a small, deployable server that can be copied to a web host, configured
with a local `config.php`, and called by an AI agent running on another server.

## Goals

- Expose one or more MCP tools over HTTPS.
- Use a simple file-based deployment shape.
- Keep public web entrypoints separate from private implementation code.
- Use a config file instead of environment variables.
- Require token authentication for all MCP tool calls.
- Support browser-accessible health and diagnostics endpoints.
- Return useful `content` text and machine-readable `structuredContent`.
- Avoid framework dependencies unless the project explicitly needs them.
- Keep the server portable across shared hosting, VPS, and container installs.

## Non-Goals

- Do not require a long-running process.
- Do not require Node, Composer, or a database unless a specific tool needs one.
- Do not expose unauthenticated business actions.
- Do not depend on another project's internal code.
- Do not assume the AI agent is running on the same host or domain.

## Recommended Directory Layout

Use a split layout with a public directory and a private implementation directory.

```text
standalone-mcp/
  config.php.dist
  config.php                  # ignored, server-local secrets
  README.md
  data/
    .gitignore                # ignores generated runtime data
  src/
    bootstrap.php
    functions.php
    McpHttpServer.php
    ToolRegistry.php
    ToolInterface.php
    ExampleTool.php
    JsonFileStore.php         # optional
    WebPushNotifier.php       # optional

public/
  ExampleMcp/
    .htaccess
    index.php
    mcp.php
```

If the web host's document root is already named `public`, copy only
`public/ExampleMcp/` into that document root and copy `standalone-mcp/` beside or
under the project root in a non-public location.

The public files should be tiny shims. They should not contain tool logic or
secrets.

Example public shim:

```php
<?php

declare(strict_types=1);

require __DIR__ . '/../../standalone-mcp/src/bootstrap.php';

\ExampleMcp\example_mcp_handle();
```

## Configuration

Use `config.php.dist` as the template and keep real `config.php` out of git.

```php
<?php

declare(strict_types=1);

return [
    // Shared token required by remote AI agents.
    'user_token' => 'change-me',

    // Human-readable MCP server name returned by initialize.
    'server_name' => 'example-mcp',

    // Optional writable runtime data path.
    'data_dir' => __DIR__ . '/data',

    // Optional PWA/Web Push settings.
    'vapid_subject' => '',
    'vapid_public_key' => '',
    'vapid_private_key' => '',
    'push_click_url' => '',
];
```

Configuration loader requirements:

- Load only `config.php`.
- Return an empty config if the file is missing.
- Normalize scalar values to strings when appropriate.
- Provide helper accessors with defaults.
- Never print secrets in diagnostics pages.
- Treat missing `user_token` as a server misconfiguration.

## HTTP Routes

Implement these routes:

```text
GET  /ExampleMcp/
GET  /ExampleMcp/health
POST /ExampleMcp/mcp.php
POST /ExampleMcp/
OPTIONS /*
```

Optional routes:

```text
GET  /ExampleMcp/push/public-key
GET  /ExampleMcp/push/check
POST /ExampleMcp/push/subscribe
POST /ExampleMcp/push/unsubscribe
POST /ExampleMcp/push/test
```

Route behavior:

- `GET /` returns a minimal HTML landing page.
- `GET /health` returns JSON such as `{"status":"ok","server":"example-mcp"}`.
- `POST /mcp.php` accepts MCP JSON-RPC requests.
- `OPTIONS` returns `204`.
- Push subscription and test endpoints require the same token as MCP calls.
- Public key and health endpoints may be public.

## CORS

Send CORS headers on every response:

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: content-type, authorization, x-user-token, mcp-session-id
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Expose-Headers: mcp-session-id
```

For stricter production deployments, replace `*` with a configured origin.

## Authentication

Require a shared user token for MCP tool calls and private auxiliary endpoints.

Accepted auth forms:

```text
x-user-token: TOKEN
Authorization: Bearer TOKEN
```

Validation rules:

- If `user_token` is empty, return HTTP `503`.
- If token is missing or incorrect, return HTTP `401`.
- Use `hash_equals()` for comparison.
- Do not put the token in URLs.

## MCP JSON-RPC Protocol

The server should handle:

```text
initialize
tools/list
tools/call
notifications/*
```

`initialize` response:

```json
{
  "protocolVersion": "2025-03-26",
  "capabilities": {
    "tools": {}
  },
  "serverInfo": {
    "name": "example-mcp",
    "version": "0.1.0"
  }
}
```

`tools/list` response:

```json
{
  "tools": [
    {
      "name": "example-search",
      "title": "Example: Search",
      "description": "Search records and return semantic candidates.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "minLength": 1
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 10
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

`tools/call` request shape:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "example-search",
    "arguments": {
      "query": "example",
      "limit": 10
    }
  }
}
```

Successful tool result:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Best match: ..."
    }
  ],
  "structuredContent": {
    "query": "example",
    "bestMatch": {},
    "results": []
  }
}
```

Errors:

- Invalid JSON: JSON-RPC error code `-32700`, HTTP `400`.
- Unknown method: JSON-RPC error code `-32601`.
- Unknown tool or invalid args: JSON-RPC error code `-32603`, HTTP `500` unless a stricter validation layer maps it to `400`.
- Method not allowed: HTTP `405`.

## Tool Output Design

Many AI agents read `content[0].text` first and may ignore or underuse
`structuredContent`. Therefore the first text item must contain the decision
context the agent needs.

Good text output:

```text
Best match: project "Apollo Migration". Confidence: high. Reason: query exactly matches project name.
Use projectId 123 for project-level actions.

Project candidates:
- projectId 123 | Apollo Migration | active | 12 tasks

Top tasks:
- taskId 991 | Review API contract | Apollo Migration
```

Bad text output:

```text
#991 | Review API contract | Apollo Migration
#992 | Update README | Apollo Migration
```

The bad output loses the higher-level interpretation and encourages the agent to
pick the first row.

Recommended `structuredContent` fields:

```json
{
  "query": "apollo",
  "bestMatch": {
    "type": "project",
    "projectId": 123,
    "name": "Apollo Migration",
    "confidence": "high",
    "ambiguous": false,
    "reason": "query exactly matches project name"
  },
  "projects": [],
  "tasks": [],
  "people": []
}
```

## Semantic Search Pattern

For search-like tools, do not return only flat rows. Group results into domain
entities and score likely intent.

Example candidate groups:

```text
project candidates
task candidates
person candidates
document candidates
```

Simple scoring model:

```text
Exact parent/entity name match: +100
Exact child/row title match:    +90
Exact person/owner match:       +80
Name starts with query:         +50 to +60
Name contains query:            +25 to +35
Multiple rows same parent:      +min(row_count * 3, 30)
```

Confidence:

```text
high: score >= 100
medium: score >= 60
low: otherwise
ambiguous: top two scores differ by less than 10
```

Always put the best interpretation at the top of `content`.

## Tool Registry

Keep tool definitions and execution separate.

Recommended interface:

```php
interface ToolInterface
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array;

    /**
     * @param array<string, mixed> $arguments
     * @return array{content: list<array{type: string, text: string}>, structuredContent: array<string, mixed>}
     */
    public function call(array $arguments): array;
}
```

`ToolRegistry` responsibilities:

- Store tools by name.
- Return tool definitions for `tools/list`.
- Dispatch `tools/call`.
- Throw a clear exception for unknown tools.

## Storage

For simple standalone servers, use JSON files under `data/`.

Rules:

- Keep generated JSON files ignored by git.
- Use `LOCK_EX` when writing.
- Store arrays of records, not a single object, even for personal/single-user use.
- Use stable IDs, usually `hash('sha256', endpoint_or_external_id)`.
- Provide a browser diagnostics page that checks the data directory and file
  writability without exposing data contents.

Example:

```text
data/
  .gitignore
  subscriptions.json
```

`data/.gitignore`:

```text
*
!.gitignore
```

## Optional Web Push Support

If the standalone server needs to notify a PWA:

- The PWA owns the service worker and browser subscription.
- The MCP server can store subscriptions and send Web Push messages.
- The push sender does not need to live on the PWA domain.
- The PWA must fetch the VAPID public key from the MCP server.
- The VAPID private key must remain server-side.

Routes:

```text
GET  /ExampleMcp/push/public-key
GET  /ExampleMcp/push/check
POST /ExampleMcp/push/subscribe
POST /ExampleMcp/push/unsubscribe
POST /ExampleMcp/push/test
```

Subscription storage record:

```json
{
  "id": "sha256-of-endpoint",
  "endpoint": "https://...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "createdAt": "2026-06-04T12:00:00+00:00",
  "updatedAt": "2026-06-04T12:00:00+00:00",
  "userAgent": "optional"
}
```

Push result metadata should be included in tool responses when a tool triggers
notifications:

```json
{
  "push": {
    "configured": true,
    "attempted": 1,
    "sent": 1,
    "failed": 0,
    "failures": []
  }
}
```

## Diagnostics

Provide at least:

```text
GET /health
GET /push/check     # if push/storage exists
```

Diagnostics pages should:

- Be safe to open in a browser.
- Avoid printing secrets.
- Avoid printing stored user data or push endpoints.
- Show file paths, directory existence, writability, and configured/not
  configured status.

## Deployment

Deployment steps:

1. Copy private implementation folder to the server.
2. Copy public folder to the web document root.
3. Copy `config.php.dist` to `config.php`.
4. Set `user_token`.
5. Configure tool-specific settings.
6. Ensure `data/` is writable by PHP if runtime storage is used.
7. Open `/health`.
8. Open diagnostics pages.
9. Test `initialize`.
10. Test `tools/list`.
11. Test each tool with `tools/call`.

Example curl:

```bash
curl -sS -X POST https://example.com/ExampleMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

```bash
curl -sS -X POST https://example.com/ExampleMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

## Security Checklist

- Use HTTPS.
- Require token auth for MCP calls.
- Compare tokens with `hash_equals()`.
- Keep `config.php` out of git.
- Keep data files out of git.
- Do not expose secrets in diagnostics.
- Set restrictive file permissions where possible.
- Do not let arbitrary browser users register push subscriptions unless that is
  intended.
- Consider replacing `Access-Control-Allow-Origin: *` with a configured origin
  for non-personal deployments.

## Implementation Checklist

- Create split public/private folders.
- Add config loader.
- Add JSON response helper.
- Add CORS helper.
- Add auth helper.
- Add `McpHttpServer`.
- Add route handling.
- Add JSON-RPC parsing and errors.
- Add tool interface and registry.
- Add first tool.
- Add semantic text plus structured output.
- Add health endpoint.
- Add diagnostics endpoint for storage if applicable.
- Add README with deploy and curl examples.
- Add tests or smoke-test scripts.
- Verify from a remote machine, not only localhost.

## Minimum Smoke Tests

Run these after deployment:

```bash
curl -i https://example.com/ExampleMcp/health
```

```bash
curl -sS -X POST https://example.com/ExampleMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'
```

```bash
curl -sS -X POST https://example.com/ExampleMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

```bash
curl -sS -X POST https://example.com/ExampleMcp/mcp.php \
  -H 'Content-Type: application/json' \
  -H 'x-user-token: YOUR_TOKEN' \
  --data '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"example-search","arguments":{"query":"test","limit":5}}}'
```

Expected results:

- Health returns HTTP 200.
- Initialize returns server info.
- Tools list returns all registered tools.
- Tool call returns both `content` and `structuredContent`.
- Bad token returns HTTP 401.
- Missing config token returns HTTP 503.
