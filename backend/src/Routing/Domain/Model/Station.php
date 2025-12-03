<?php

declare(strict_types=1);

namespace App\Routing\Domain\Model;

use App\Shared\Domain\StationId;

/**
 * Entity représentant une station de train.
 * Une station a un identifiant unique (shortName) et un nom complet.
 */
final readonly class Station
{
    public function __construct(
        private StationId $id,
        private string $name
    ) {
    }

    public static function create(StationId $id, string $name): self
    {
        return new self($id, $name);
    }

    public function id(): StationId
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function equals(Station $other): bool
    {
        return $this->id->equals($other->id);
    }
}
