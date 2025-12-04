<?php

declare(strict_types=1);

namespace App\Routing\Application\Query;

use App\Routing\Domain\Service\NetworkLoaderInterface;
use App\Routing\Domain\Service\PathFinderInterface;
use App\Shared\Domain\StationId;

/**
 * Handler pour le calcul d'itinéraire.
 */
final readonly class CalculateRouteHandler
{
    public function __construct(
        private NetworkLoaderInterface $networkLoader,
        private PathFinderInterface $pathFinder
    ) {
    }

    public function handle(CalculateRouteQuery $query): CalculateRouteResult
    {
        $network = $this->networkLoader->load();

        $origin = StationId::fromString($query->origin);
        $destination = StationId::fromString($query->destination);

        // Validate stations exist before finding path
        $network->getStation($origin);
        $network->getStation($destination);

        $path = $this->pathFinder->findPath($network, $origin, $destination);

        $stationNames = array_map(
            fn(StationId $stationId) => $network->getStation($stationId)->name(),
            $path->stations()
        );

        return new CalculateRouteResult(
            stations: $path->stationIds(),
            stationNames: $stationNames,
            totalDistance: $path->totalDistance()->value(),
            segmentCount: $path->segmentCount(),
            segmentDistances: $path->segmentDistances()
        );
    }
}
