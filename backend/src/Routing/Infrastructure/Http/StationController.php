<?php

declare(strict_types=1);

namespace App\Routing\Infrastructure\Http;

use App\Routing\Domain\Service\NetworkLoaderInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1')]
final class StationController
{
    public function __construct(
        private readonly NetworkLoaderInterface $networkLoader
    ) {
    }

    #[Route('/stations', name: 'api_stations_list', methods: ['GET'])]
    public function listStations(): JsonResponse
    {
        $network = $this->networkLoader->load();
        $stations = [];

        foreach ($network->getAllStationIds() as $stationId) {
            $station = $network->getStation($stationId);
            $stations[] = [
                'id' => $stationId->value(),
                'name' => $station->name(),
            ];
        }

        // Sort by name
        usort($stations, fn($a, $b) => strcmp($a['name'], $b['name']));

        return new JsonResponse($stations);
    }
}
