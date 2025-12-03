<?php

declare(strict_types=1);

namespace App\Routing\Domain\Model;

use App\Routing\Domain\Exception\StationNotFoundException;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;

/**
 * Aggregate Root représentant le réseau ferroviaire.
 * Contient toutes les stations et les connexions (segments) entre elles.
 * Le réseau est modélisé comme un graphe non-orienté.
 */
final class Network
{
    /** @var array<string, Station> */
    private array $stations = [];

    /** @var array<string, array<string, Distance>> Adjacency list: stationId => [neighborId => distance] */
    private array $adjacencyList = [];

    private function __construct()
    {
    }

    public static function create(): self
    {
        return new self();
    }

    public function addStation(Station $station): void
    {
        $id = $station->id()->value();
        $this->stations[$id] = $station;

        if (!isset($this->adjacencyList[$id])) {
            $this->adjacencyList[$id] = [];
        }
    }

    public function addSegment(Segment $segment): void
    {
        $fromId = $segment->from()->value();
        $toId = $segment->to()->value();
        $distance = $segment->distance();

        // Le graphe est non-orienté, on ajoute les deux directions
        $this->adjacencyList[$fromId][$toId] = $distance;
        $this->adjacencyList[$toId][$fromId] = $distance;
    }

    public function hasStation(StationId $stationId): bool
    {
        return isset($this->stations[$stationId->value()]);
    }

    /**
     * @throws StationNotFoundException
     */
    public function getStation(StationId $stationId): Station
    {
        if (!$this->hasStation($stationId)) {
            throw StationNotFoundException::withId($stationId);
        }

        return $this->stations[$stationId->value()];
    }

    /**
     * @return Station[]
     */
    public function getAllStations(): array
    {
        return array_values($this->stations);
    }

    /**
     * @return StationId[]
     */
    public function getAllStationIds(): array
    {
        return array_map(
            fn(Station $station) => $station->id(),
            $this->getAllStations()
        );
    }

    /**
     * Retourne les voisins (stations adjacentes) d'une station donnée.
     *
     * @return Neighbor[]
     * @throws StationNotFoundException
     */
    public function getNeighbors(StationId $stationId): array
    {
        if (!$this->hasStation($stationId)) {
            throw StationNotFoundException::withId($stationId);
        }

        $neighbors = [];
        $adjacencies = $this->adjacencyList[$stationId->value()] ?? [];

        foreach ($adjacencies as $neighborId => $distance) {
            $neighbors[] = new Neighbor(
                StationId::fromString($neighborId),
                $distance
            );
        }

        return $neighbors;
    }

    /**
     * Retourne la distance entre deux stations adjacentes.
     * Retourne null si les stations ne sont pas directement connectées.
     */
    public function getDirectDistance(StationId $from, StationId $to): ?Distance
    {
        return $this->adjacencyList[$from->value()][$to->value()] ?? null;
    }

    public function stationCount(): int
    {
        return count($this->stations);
    }

    public function segmentCount(): int
    {
        // Chaque segment est compté deux fois (graphe non-orienté)
        $count = 0;
        foreach ($this->adjacencyList as $neighbors) {
            $count += count($neighbors);
        }
        return (int) ($count / 2);
    }
}
