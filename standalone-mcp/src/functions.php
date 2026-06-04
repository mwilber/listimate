<?php

declare(strict_types=1);

namespace ListimateMcp;

/**
 * @return array<string, mixed>
 */
function load_config(): array
{
    $path = dirname(__DIR__) . '/config.php';
    if (!is_file($path)) {
        return [];
    }

    $config = require $path;
    if (!is_array($config)) {
        return [];
    }

    $normalized = [];
    foreach ($config as $key => $value) {
        $normalized[(string)$key] = is_scalar($value) ? (string)$value : $value;
    }

    return $normalized;
}

/**
 * @param array<string, mixed> $config
 */
function config_string(array $config, string $key, string $default = ''): string
{
    $value = $config[$key] ?? $default;
    return is_scalar($value) ? (string)$value : $default;
}

/**
 * @param array<string, mixed> $config
 * @return array<string, string>
 */
function firebase_credentials_from_request(array $config): array
{
    return [
        'apiKey' => header_value('x-firebase-api-key') ?: config_string($config, 'firebase_api_key'),
        'databaseURL' => header_value('x-firebase-database-url') ?: config_string($config, 'firebase_database_url'),
        'email' => header_value('x-firebase-email'),
        'password' => header_value('x-firebase-password'),
    ];
}

function header_value(string $name): string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    foreach ($headers as $key => $value) {
        if (strcasecmp((string)$key, $name) === 0) {
            return trim((string)$value);
        }
    }

    $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return trim((string)($_SERVER[$serverKey] ?? ''));
}

/**
 * @param array<string, mixed> $value
 * @return array{lists: list<array<string, mixed>>, prices: array<string, mixed>}
 */
function normalize_data(array $value): array
{
    $lists = [];
    if (isset($value['lists']) && is_array($value['lists'])) {
        foreach (array_index_values($value['lists']) as $list) {
            $lists[] = normalize_list($list);
        }
    }

    return [
        'lists' => $lists,
        'prices' => isset($value['prices']) && is_array($value['prices']) ? $value['prices'] : [],
    ];
}

/**
 * @param array<string, mixed> $list
 * @return array<string, mixed>
 */
function normalize_list(array $list): array
{
    $misplacedMetadata = isset($list['items']) && is_array($list['items']) ? $list['items'] : [];
    $items = [];
    if (isset($list['items']) && is_array($list['items'])) {
        foreach (array_index_values($list['items']) as $item) {
            $items[] = normalize_item($item);
        }
    }

    return [
        'name' => (string)($list['name'] ?? $misplacedMetadata['name'] ?? ''),
        'number' => (float)($list['number'] ?? $misplacedMetadata['number'] ?? 0),
        'stores' => isset($list['stores']) && is_array($list['stores'])
            ? $list['stores']
            : (isset($misplacedMetadata['stores']) && is_array($misplacedMetadata['stores'])
                ? $misplacedMetadata['stores']
                : ['WalMart' => true, 'Aldi' => false]),
        'items' => $items,
    ];
}

/**
 * @param array<string, mixed> $item
 * @return array<string, mixed>
 */
function normalize_item(array $item): array
{
    $normalized = [
        'name' => (string)($item['name'] ?? ''),
        'price' => is_numeric($item['price'] ?? null) ? (float)$item['price'] : 0,
        'quantity' => is_numeric($item['quantity'] ?? null) ? (float)$item['quantity'] : 1,
    ];

    if (array_key_exists('pinned', $item)) {
        $normalized['pinned'] = (string)$item['pinned'];
    }
    if (array_key_exists('defer', $item)) {
        $normalized['defer'] = (bool)$item['defer'];
    }

    return $normalized;
}

/**
 * @return array{name: string, price: int, quantity: int}
 */
function create_item(string $name): array
{
    return [
        'name' => trim($name),
        'price' => 0,
        'quantity' => 1,
    ];
}

/**
 * @param array<mixed> $values
 * @return list<array<string, mixed>>
 */
function array_index_values(array $values): array
{
    $indexed = [];
    foreach ($values as $key => $value) {
        if (is_int($key) || (is_string($key) && preg_match('/^(0|[1-9]\d*)$/', $key) === 1)) {
            $indexed[(int)$key] = is_array($value) ? $value : [];
        }
    }

    ksort($indexed, SORT_NUMERIC);
    return array_values($indexed);
}
