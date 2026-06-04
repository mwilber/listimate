<?php

declare(strict_types=1);

namespace ListimateMcp;

interface ToolInterface
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array;

    /**
     * @param array<string, mixed> $arguments
     * @param array<string, mixed> $context
     * @return array{content: list<array{type: string, text: string}>, structuredContent: array<string, mixed>}
     */
    public function call(array $arguments, array $context): array;
}
