<?php

declare(strict_types=1);

namespace ListimateMcp;

require __DIR__ . '/functions.php';
require __DIR__ . '/ToolInterface.php';
require __DIR__ . '/ToolRegistry.php';
require __DIR__ . '/FirebaseClient.php';
require __DIR__ . '/ListListsTool.php';
require __DIR__ . '/AddItemToListTool.php';
require __DIR__ . '/McpHttpServer.php';

function handle(): void
{
    $config = load_config();
    $firebase = new FirebaseClient();
    $registry = new ToolRegistry();
    $registry->register(new ListListsTool($firebase));
    $registry->register(new AddItemToListTool($firebase));

    (new McpHttpServer($config, $registry))->handle();
}
