<?php

declare(strict_types=1);

namespace ListimateMcp;

final class ListListsTool implements ToolInterface
{
    public function __construct(private FirebaseClient $firebase)
    {
    }

    public function definition(): array
    {
        return [
            'name' => 'list_lists',
            'title' => 'Listimate: List lists',
            'description' => 'List every existing Listimate list name for the signed-in Firebase user.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => (object)[],
                'additionalProperties' => false,
            ],
        ];
    }

    public function call(array $arguments, array $context): array
    {
        $data = $this->firebase->readUserData($context['firebase_credentials']);
        $names = [];
        foreach ($data['lists'] as $list) {
            if (($list['name'] ?? '') !== '') {
                $names[] = (string)$list['name'];
            }
        }

        return [
            'content' => [[
                'type' => 'text',
                'text' => $names === []
                    ? 'No Listimate lists exist for this Firebase user.'
                    : "Available Listimate lists:\n- " . implode("\n- ", $names),
            ]],
            'structuredContent' => [
                'count' => count($names),
                'lists' => $names,
            ],
        ];
    }
}
