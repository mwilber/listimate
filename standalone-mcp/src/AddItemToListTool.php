<?php

declare(strict_types=1);

namespace ListimateMcp;

final class AddItemToListTool implements ToolInterface
{
    public function __construct(private FirebaseClient $firebase)
    {
    }

    public function definition(): array
    {
        return [
            'name' => 'add_item_to_list',
            'title' => 'Listimate: Add item to list',
            'description' => 'Add an item to an existing Listimate list. The listName must exactly match an existing list name from list_lists.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'listName' => [
                        'type' => 'string',
                        'minLength' => 1,
                    ],
                    'itemName' => [
                        'type' => 'string',
                        'minLength' => 1,
                    ],
                ],
                'required' => ['listName', 'itemName'],
                'additionalProperties' => false,
            ],
        ];
    }

    public function call(array $arguments, array $context): array
    {
        $listName = trim((string)($arguments['listName'] ?? ''));
        $itemName = trim((string)($arguments['itemName'] ?? ''));

        if ($listName === '') {
            throw new \RuntimeException('Invalid arguments for add_item_to_list: listName is required.');
        }
        if ($itemName === '') {
            throw new \RuntimeException('Invalid arguments for add_item_to_list: itemName is required.');
        }

        $data = $this->firebase->readUserData($context['firebase_credentials']);
        $matchIndex = null;
        foreach ($data['lists'] as $index => $list) {
            if (($list['name'] ?? '') === $listName) {
                $matchIndex = $index;
                break;
            }
        }

        if ($matchIndex === null) {
            throw new \RuntimeException("List \"{$listName}\" does not exist. Use the list_lists tool to get a valid list name.");
        }

        $data['lists'][$matchIndex]['items'][] = create_item($itemName);
        $saved = $this->firebase->writeUserData($context['firebase_credentials'], $data);
        $itemCount = count($saved['lists'][$matchIndex]['items'] ?? $data['lists'][$matchIndex]['items']);

        return [
            'content' => [[
                'type' => 'text',
                'text' => "Added \"{$itemName}\" to \"{$listName}\". The list now has {$itemCount} item(s).",
            ]],
            'structuredContent' => [
                'listName' => $listName,
                'itemName' => $itemName,
                'itemCount' => $itemCount,
            ],
        ];
    }
}
