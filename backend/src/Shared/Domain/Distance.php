<?php

declare(strict_types=1);

namespace App\Shared\Domain;

use InvalidArgumentException;

/**
 * Value Object représentant une distance en kilomètres.
 * Immutable et auto-validant.
 */
final readonly class Distance
{
    private function __construct(
        private float $kilometers
    ) {
        if ($kilometers < 0) {
            throw new InvalidArgumentException(
                sprintf('Distance cannot be negative, got: %f', $kilometers)
            );
        }
    }

    public static function fromKilometers(float $kilometers): self
    {
        return new self($kilometers);
    }

    public static function zero(): self
    {
        return new self(0.0);
    }

    public function value(): float
    {
        return $this->kilometers;
    }

    public function add(Distance $other): self
    {
        return new self($this->kilometers + $other->kilometers);
    }

    public function isGreaterThan(Distance $other): bool
    {
        return $this->kilometers > $other->kilometers;
    }

    public function isLessThan(Distance $other): bool
    {
        return $this->kilometers < $other->kilometers;
    }

    public function equals(Distance $other): bool
    {
        return abs($this->kilometers - $other->kilometers) < 0.0001;
    }

    public function __toString(): string
    {
        return sprintf('%.2f km', $this->kilometers);
    }
}
