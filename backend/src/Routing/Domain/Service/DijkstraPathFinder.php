<?php

declare(strict_types=1);

namespace App\Routing\Domain\Service;

use App\Routing\Domain\Exception\NoRouteFoundException;
use App\Routing\Domain\Model\Network;
use App\Routing\Domain\Model\Path;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use SplPriorityQueue;

/**
 * Implémentation de l'algorithme de Dijkstra pour trouver le chemin le plus court.
 */
final class DijkstraPathFinder implements PathFinderInterface
{
    public function findPath(Network $network, StationId $from, StationId $to): Path
    {
        if ($from->equals($to)) {
            throw NoRouteFoundException::between($from, $to);
        }

        $distances = [];
        $previous = [];
        $visited = [];

        // Initialize distances to infinity
        foreach ($network->getAllStationIds() as $stationId) {
            $distances[$stationId->value()] = PHP_FLOAT_MAX;
            $previous[$stationId->value()] = null;
        }

        $distances[$from->value()] = 0.0;

        // Priority queue: [distance, stationId]
        $queue = new SplPriorityQueue();
        $queue->setExtractFlags(SplPriorityQueue::EXTR_BOTH);
        $queue->insert($from->value(), 0);

        while (!$queue->isEmpty()) {
            $current = $queue->extract();
            $currentId = $current['data'];
            $currentDistance = -$current['priority'];

            if (isset($visited[$currentId])) {
                continue;
            }

            $visited[$currentId] = true;

            if ($currentId === $to->value()) {
                break;
            }

            $neighbors = $network->getNeighbors(StationId::fromString($currentId));

            foreach ($neighbors as $neighbor) {
                $neighborId = $neighbor->stationId()->value();

                if (isset($visited[$neighborId])) {
                    continue;
                }

                $newDistance = $currentDistance + $neighbor->distance()->value();

                if ($newDistance < $distances[$neighborId]) {
                    $distances[$neighborId] = $newDistance;
                    $previous[$neighborId] = $currentId;
                    // Use negative priority for min-heap behavior
                    $queue->insert($neighborId, -$newDistance);
                }
            }
        }

        if ($previous[$to->value()] === null) {
            throw NoRouteFoundException::between($from, $to);
        }

        return $this->buildPath($network, $previous, $from, $to, Distance::fromKilometers($distances[$to->value()]));
    }

    /**
     * @param array<string, string|null> $previous
     */
    private function buildPath(
        Network $network,
        array $previous,
        StationId $from,
        StationId $to,
        Distance $totalDistance
    ): Path {
        $path = [];
        $current = $to->value();

        while ($current !== null) {
            array_unshift($path, StationId::fromString($current));
            $current = $previous[$current];
        }

        // Calculate segment distances
        $segmentDistances = [];
        for ($i = 0; $i < count($path) - 1; $i++) {
            $fromStation = $path[$i];
            $toStation = $path[$i + 1];
            $neighbors = $network->getNeighbors($fromStation);
            foreach ($neighbors as $neighbor) {
                if ($neighbor->stationId()->equals($toStation)) {
                    $segmentDistances[] = $neighbor->distance()->value();
                    break;
                }
            }
        }

        return Path::create($path, $totalDistance, $segmentDistances);
    }
}
