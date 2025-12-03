<?php

declare(strict_types=1);

namespace App\Routing\Domain\Model;

use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;

/**
 * Value Object représentant une station voisine avec sa distance.
 * Utilisé par le Network pour retourner les adjacences.
 */
final readonly class Neighbor
{
    public function __construct(
        private StationId $stationId,
        private Distance $distance
    ) {
    }

    public function stationId(): StationId
    {
        return $this->stationId;
    }

    public function distance(): Distance
    {
        return $this->distance;
    }
}
