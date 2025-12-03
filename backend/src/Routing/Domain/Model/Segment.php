<?php

declare(strict_types=1);

namespace App\Routing\Domain\Model;

use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;

/**
 * Value Object représentant un segment de voie ferrée.
 * Un segment connecte deux stations adjacentes avec une distance.
 */
final readonly class Segment
{
    public function __construct(
        private StationId $from,
        private StationId $to,
        private Distance $distance
    ) {
    }

    public static function create(StationId $from, StationId $to, Distance $distance): self
    {
        return new self($from, $to, $distance);
    }

    public function from(): StationId
    {
        return $this->from;
    }

    public function to(): StationId
    {
        return $this->to;
    }

    public function distance(): Distance
    {
        return $this->distance;
    }

    /**
     * Vérifie si ce segment connecte la station donnée.
     */
    public function connectsStation(StationId $stationId): bool
    {
        return $this->from->equals($stationId) || $this->to->equals($stationId);
    }

    /**
     * Retourne l'autre extrémité du segment par rapport à la station donnée.
     */
    public function getOtherEnd(StationId $stationId): ?StationId
    {
        if ($this->from->equals($stationId)) {
            return $this->to;
        }

        if ($this->to->equals($stationId)) {
            return $this->from;
        }

        return null;
    }

    public function equals(Segment $other): bool
    {
        // Un segment est égal si les mêmes stations sont connectées (dans n'importe quel ordre)
        $sameDirection = $this->from->equals($other->from) && $this->to->equals($other->to);
        $reverseDirection = $this->from->equals($other->to) && $this->to->equals($other->from);

        return ($sameDirection || $reverseDirection) && $this->distance->equals($other->distance);
    }
}
