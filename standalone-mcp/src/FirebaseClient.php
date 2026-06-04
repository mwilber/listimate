<?php

declare(strict_types=1);

namespace ListimateMcp;

final class FirebaseClient
{
    private const AUTH_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

    /**
     * @param array<string, string> $credentials
     * @return array<string, mixed>
     */
    public function readUserData(array $credentials): array
    {
        $session = $this->signIn($credentials);
        $data = $this->requestJson('GET', $this->databaseUrl($credentials, $session), null);

        return normalize_data(is_array($data) ? $data : []);
    }

    /**
     * @param array<string, string> $credentials
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public function writeUserData(array $credentials, array $data): array
    {
        $session = $this->signIn($credentials);
        $saved = $this->requestJson('PUT', $this->databaseUrl($credentials, $session), normalize_data($data));

        return normalize_data(is_array($saved) ? $saved : []);
    }

    /**
     * @param array<string, string> $credentials
     * @return array{uid: string, idToken: string}
     */
    private function signIn(array $credentials): array
    {
        $this->validateCredentials($credentials);
        $url = self::AUTH_ENDPOINT . '?key=' . rawurlencode($credentials['apiKey']);
        $body = $this->requestJson('POST', $url, [
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'returnSecureToken' => true,
        ]);

        if (!is_array($body) || empty($body['localId']) || empty($body['idToken'])) {
            throw new \RuntimeException('Firebase sign-in response did not include a user id and token.');
        }

        return [
            'uid' => (string)$body['localId'],
            'idToken' => (string)$body['idToken'],
        ];
    }

    /**
     * @param array<string, string> $credentials
     */
    private function validateCredentials(array $credentials): void
    {
        $missing = [];
        foreach (['apiKey', 'databaseURL', 'email', 'password'] as $key) {
            if (($credentials[$key] ?? '') === '') {
                $missing[] = $key;
            }
        }

        if ($missing !== []) {
            throw new \RuntimeException('Missing Firebase credentials: ' . implode(', ', $missing) . '. Pass x-firebase-api-key, x-firebase-database-url, x-firebase-email, and x-firebase-password headers.');
        }
    }

    /**
     * @param array{uid: string, idToken: string} $session
     * @param array<string, string> $credentials
     */
    private function databaseUrl(array $credentials, array $session): string
    {
        return rtrim($credentials['databaseURL'], '/') . '/'
            . rawurlencode($session['uid'])
            . '.json?auth=' . rawurlencode($session['idToken']);
    }

    /**
     * @param array<string, mixed>|null $payload
     * @return mixed
     */
    private function requestJson(string $method, string $url, ?array $payload)
    {
        $headers = ['Content-Type: application/json'];
        $options = [
            'http' => [
                'method' => $method,
                'header' => implode("\n", $headers),
                'ignore_errors' => true,
                'timeout' => 20,
            ],
        ];

        if ($payload !== null) {
            $options['http']['content'] = json_encode($payload, JSON_UNESCAPED_SLASHES);
        }

        $httpResponseHeader = null;
        $response = @file_get_contents($url, false, stream_context_create($options));
        /** @var list<string>|null $http_response_header */
        if (isset($http_response_header)) {
            $httpResponseHeader = $http_response_header;
        }

        $status = $this->responseStatus($httpResponseHeader);
        $decoded = $response === false || $response === '' ? null : json_decode($response, true);

        if ($status < 200 || $status >= 300) {
            $message = is_array($decoded) && isset($decoded['error']['message'])
                ? (string)$decoded['error']['message']
                : "Firebase {$method} request failed with HTTP {$status}.";
            throw new \RuntimeException($message);
        }

        return $decoded;
    }

    /**
     * @param list<string>|null $headers
     */
    private function responseStatus(?array $headers): int
    {
        $line = $headers[0] ?? '';
        if (preg_match('/\s(\d{3})\s/', $line, $matches) === 1) {
            return (int)$matches[1];
        }

        return 0;
    }
}
