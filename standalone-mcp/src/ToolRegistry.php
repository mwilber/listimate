<?php

declare(strict_types=1);

namespace ListimateMcp;

final class ToolRegistry
{
    /** @var array<string, ToolInterface> */
    private array $tools = [];

    public function register(ToolInterface $tool): void
    {
        $definition = $tool->definition();
        $name = (string)($definition['name'] ?? '');
        if ($name === '') {
            throw new \RuntimeException('Tool definition is missing a name.');
        }
        $this->tools[$name] = $tool;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function definitions(): array
    {
        return array_values(array_map(
            static fn (ToolInterface $tool): array => $tool->definition(),
            $this->tools
        ));
    }

    /**
     * @param array<string, mixed> $arguments
     * @param array<string, mixed> $context
     * @return array<string, mixed>
     */
    public function call(string $name, array $arguments, array $context): array
    {
        if (!isset($this->tools[$name])) {
            throw new \RuntimeException("Unknown tool: {$name}");
        }

        return $this->tools[$name]->call($arguments, $context);
    }
}
