<?php

declare(strict_types=1);

namespace App\Routing\Domain\Model;

use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use InvalidArgumentException;

/**
 * Value Object représentant un chemin calculé entre deux stations.
 * Contient la liste ordonnée des stations traversées et la distance totale.
 */
final readonly class Path
{
    /**
     * @param StationId[] $stations
     * @param float[] $segmentDistances Distances entre chaque paire de stations consécutives
     */
    private function __construct(
        private array $stations,
        private Distance $totalDistance,
        private array $segmentDistances = []
    ) {
        if (count($stations) < 2) {
            throw new InvalidArgumentException(
                'A path must contain at least 2 stations (start and end)'
            );
        }
    }

    /**
     * @param StationId[] $stations
     * @param float[] $segmentDistances
     */
    public static function create(array $stations, Distance $totalDistance, array $segmentDistances = []): self
    {
        return new self($stations, $totalDistance, $segmentDistances);
    }

    /**
     * @return StationId[]
     */
    public function stations(): array
    {
        return $this->stations;
    }

    /**
     * @return string[]
     */
    public function stationIds(): array
    {
        return array_map(
            fn(StationId $station) => $station->value(),
            $this->stations
        );
    }

    public function totalDistance(): Distance
    {
        return $this->totalDistance;
    }

    public function start(): StationId
    {
        return $this->stations[0];
    }

    public function end(): StationId
    {
        return $this->stations[count($this->stations) - 1];
    }

    public function stationCount(): int
    {
        return count($this->stations);
    }

    public function segmentCount(): int
    {
        return count($this->stations) - 1;
    }

    /**
     * @return float[]
     */
    public function segmentDistances(): array
    {
        return $this->segmentDistances;
    }
}
