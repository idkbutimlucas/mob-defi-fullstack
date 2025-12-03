<?php

declare(strict_types=1);

namespace App\Routing\Infrastructure\Persistence;

use App\Routing\Domain\Model\Network;
use App\Routing\Domain\Model\Segment;
use App\Routing\Domain\Model\Station;
use App\Routing\Domain\Service\NetworkLoaderInterface;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use RuntimeException;

/**
 * Charge le réseau ferroviaire depuis les fichiers JSON.
 */
final class JsonNetworkLoader implements NetworkLoaderInterface
{
    public function __construct(
        private readonly string $stationsPath,
        private readonly string $distancesPath
    ) {
    }

    public function load(): Network
    {
        $network = Network::create();

        $this->loadStations($network);
        $this->loadSegments($network);

        return $network;
    }

    private function loadStations(Network $network): void
    {
        $stationsData = $this->readJsonFile($this->stationsPath);

        foreach ($stationsData as $stationData) {
            $network->addStation(Station::create(
                StationId::fromString($stationData['shortName']),
                $stationData['longName']
            ));
        }
    }

    private function loadSegments(Network $network): void
    {
        $linesData = $this->readJsonFile($this->distancesPath);

        foreach ($linesData as $lineData) {
            foreach ($lineData['distances'] as $segmentData) {
                $network->addSegment(Segment::create(
                    StationId::fromString($segmentData['parent']),
                    StationId::fromString($segmentData['child']),
                    Distance::fromKilometers((float) $segmentData['distance'])
                ));
            }
        }
    }

    /**
     * @return array<mixed>
     */
    private function readJsonFile(string $path): array
    {
        if (!file_exists($path)) {
            throw new RuntimeException(sprintf('File not found: %s', $path));
        }

        $content = file_get_contents($path);

        if ($content === false) {
            throw new RuntimeException(sprintf('Unable to read file: %s', $path));
        }

        $data = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException(sprintf(
                'Invalid JSON in file %s: %s',
                $path,
                json_last_error_msg()
            ));
        }

        return $data;
    }
}
