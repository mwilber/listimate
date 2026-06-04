<?php

declare(strict_types=1);

namespace ListimateMcp;

final class McpHttpServer
{
    public function __construct(
        private array $config,
        private ToolRegistry $registry
    ) {
    }

    public function handle(): void
    {
        $this->cors();

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if ($method === 'OPTIONS') {
            http_response_code(204);
            return;
        }

        $path = parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
        if ($method === 'GET' && str_ends_with($path, '/health')) {
            $this->json(200, [
                'status' => 'ok',
                'server' => $this->serverName(),
                'configured' => $this->userToken() !== '',
            ]);
            return;
        }

        if ($method === 'GET') {
            $this->html($this->landingPage());
            return;
        }

        if ($method !== 'POST') {
            $this->json(405, ['error' => 'Method not allowed']);
            return;
        }

        if ($this->userToken() === '') {
            $this->json(503, ['error' => 'MCP server is missing user_token configuration.']);
            return;
        }

        if (!$this->authorized()) {
            $this->json(401, ['error' => 'Unauthorized']);
            return;
        }

        $raw = file_get_contents('php://input') ?: '';
        $payload = json_decode($raw, true);
        if (!is_array($payload)) {
            $this->json(400, $this->rpcError(null, -32700, 'Invalid JSON.'));
            return;
        }

        try {
            $result = $this->handleRpc($payload);
            if ($result === null) {
                http_response_code(204);
                return;
            }
            $this->json(200, $result);
        } catch (\Throwable $error) {
            $this->json(500, $this->rpcError($payload['id'] ?? null, -32603, $error->getMessage()));
        }
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>|null
     */
    private function handleRpc(array $payload): ?array
    {
        $id = $payload['id'] ?? null;
        $method = (string)($payload['method'] ?? '');

        if ($method === '') {
            return $this->rpcError($id, -32600, 'Invalid JSON-RPC request.');
        }

        if (str_starts_with($method, 'notifications/')) {
            return null;
        }

        if ($method === 'initialize') {
            return $this->rpcResult($id, [
                'protocolVersion' => '2025-03-26',
                'capabilities' => ['tools' => (object)[]],
                'serverInfo' => [
                    'name' => $this->serverName(),
                    'version' => '0.1.0',
                ],
            ]);
        }

        if ($method === 'tools/list') {
            return $this->rpcResult($id, [
                'tools' => $this->registry->definitions(),
            ]);
        }

        if ($method === 'tools/call') {
            $params = isset($payload['params']) && is_array($payload['params']) ? $payload['params'] : [];
            $arguments = isset($params['arguments']) && is_array($params['arguments']) ? $params['arguments'] : [];
            $context = [
                'firebase_credentials' => firebase_credentials_from_request($this->config),
            ];

            return $this->rpcResult(
                $id,
                $this->registry->call((string)($params['name'] ?? ''), $arguments, $context)
            );
        }

        return $this->rpcError($id, -32601, "Unknown method: {$method}");
    }

    private function cors(): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: content-type, authorization, x-user-token, mcp-session-id, x-firebase-api-key, x-firebase-database-url, x-firebase-email, x-firebase-password');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Expose-Headers: mcp-session-id');
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function json(int $status, array $payload): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    }

    private function html(string $html): void
    {
        header('Content-Type: text/html; charset=utf-8');
        echo $html;
    }

    private function authorized(): bool
    {
        $token = header_value('x-user-token');
        if ($token === '') {
            $authorization = header_value('authorization');
            $token = str_starts_with($authorization, 'Bearer ') ? substr($authorization, 7) : '';
        }

        return $token !== '' && hash_equals($this->userToken(), $token);
    }

    private function userToken(): string
    {
        return config_string($this->config, 'user_token');
    }

    private function serverName(): string
    {
        return config_string($this->config, 'server_name', 'listimate-mcp');
    }

    /**
     * @param mixed $id
     * @param array<string, mixed> $result
     * @return array<string, mixed>
     */
    private function rpcResult($id, array $result): array
    {
        return [
            'jsonrpc' => '2.0',
            'id' => $id,
            'result' => $result,
        ];
    }

    /**
     * @param mixed $id
     * @return array<string, mixed>
     */
    private function rpcError($id, int $code, string $message): array
    {
        return [
            'jsonrpc' => '2.0',
            'id' => $id,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ];
    }

    private function landingPage(): string
    {
        $configured = $this->userToken() !== '' ? 'configured' : 'missing token configuration';
        $server = htmlspecialchars($this->serverName(), ENT_QUOTES, 'UTF-8');

        return <<<HTML
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>{$server}</title></head>
  <body>
    <h1>{$server}</h1>
    <p>Status: {$configured}</p>
    <p>POST MCP JSON-RPC requests to <code>mcp.php</code>.</p>
  </body>
</html>
HTML;
    }
}
