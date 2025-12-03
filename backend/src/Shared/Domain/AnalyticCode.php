<?php

declare(strict_types=1);

namespace App\Shared\Domain;

use InvalidArgumentException;

/**
 * Value Object représentant un code analytique.
 * Utilisé pour catégoriser les trajets (fret, passager, maintenance, etc.).
 */
final readonly class AnalyticCode
{
    private const int MIN_LENGTH = 1;
    private const int MAX_LENGTH = 50;

    private function __construct(
        private string $value
    ) {
        $trimmed = trim($value);

        if (strlen($trimmed) < self::MIN_LENGTH) {
            throw new InvalidArgumentException('AnalyticCode cannot be empty');
        }

        if (strlen($trimmed) > self::MAX_LENGTH) {
            throw new InvalidArgumentException(
                sprintf('AnalyticCode cannot exceed %d characters', self::MAX_LENGTH)
            );
        }
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(AnalyticCode $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
