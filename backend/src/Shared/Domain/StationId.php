<?php

declare(strict_types=1);

namespace App\Shared\Domain;

use InvalidArgumentException;

/**
 * Value Object représentant l'identifiant unique d'une station.
 * Correspond au shortName dans stations.json (ex: "MX", "ZW", "CABY").
 */
final readonly class StationId
{
    private function __construct(
        private string $value
    ) {
        if (trim($value) === '') {
            throw new InvalidArgumentException('StationId cannot be empty');
        }

        if (!preg_match('/^[A-Z0-9]{1,10}$/i', $value)) {
            throw new InvalidArgumentException(
                sprintf('StationId must be alphanumeric (1-10 chars), got: %s', $value)
            );
        }
    }

    public static function fromString(string $value): self
    {
        return new self(strtoupper(trim($value)));
    }

    public function value(): string
    {
        return $this->value;
    }

    public function equals(StationId $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
