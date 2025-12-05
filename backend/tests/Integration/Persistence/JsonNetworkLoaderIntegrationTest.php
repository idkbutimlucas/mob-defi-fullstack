<?php

declare(strict_types=1);

namespace App\Tests\Integration\Persistence;

use App\Routing\Infrastructure\Persistence\JsonNetworkLoader;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\TestCase;

/**
 * Integration tests for JsonNetworkLoader with real data files.
 */
class JsonNetworkLoaderIntegrationTest extends TestCase
{
    private JsonNetworkLoader $loader;
    private string $dataPath;

    protected function setUp(): void
    {
        $this->dataPath = dirname(__DIR__, 3) . '/../data';
        $this->loader = new JsonNetworkLoader(
            $this->dataPath . '/stations.json',
            $this->dataPath . '/distances.json'
        );
    }

    public function testItLoadsRealStationsFile(): void
    {
        $network = $this->loader->load();

        // Verify some known stations exist
        $this->assertTrue($network->hasStation(StationId::fromString('MX')), 'Montreux station should exist');
        $this->assertTrue($network->hasStation(StationId::fromString('ZW')), 'Zweisimmen station should exist');
        $this->assertTrue($network->hasStation(StationId::fromString('VV')), 'Vevey station should exist');
    }

    public function testItLoadsAllStationsFromFile(): void
    {
        $network = $this->loader->load();
        $stationIds = $network->getAllStationIds();

        // The network should have a reasonable number of stations
        $this->assertGreaterThan(10, count($stationIds), 'Network should have more than 10 stations');
    }

    public function testItLoadsStationNamesCorrectly(): void
    {
        $network = $this->loader->load();

        $montreux = $network->getStation(StationId::fromString('MX'));
        $this->assertStringContainsString('Montreux', $montreux->name());
    }

    public function testItCreatesBidirectionalConnections(): void
    {
        $network = $this->loader->load();

        // If A connects to B, B should connect to A
        $stationIds = $network->getAllStationIds();

        foreach ($stationIds as $stationId) {
            $neighbors = $network->getNeighbors($stationId);

            foreach ($neighbors as $neighbor) {
                $neighborStationId = $neighbor->stationId();
                $reverseNeighbors = $network->getNeighbors($neighborStationId);
                $reverseNeighborIds = array_map(
                    fn($n) => $n->stationId()->value(),
                    $reverseNeighbors
                );
                $this->assertContains(
                    $stationId->value(),
                    $reverseNeighborIds,
                    "If {$stationId->value()} connects to {$neighborStationId->value()}, it should connect back"
                );
            }
        }
    }

    public function testItLoadsDistancesAsPositiveValues(): void
    {
        $network = $this->loader->load();
        $stationIds = $network->getAllStationIds();

        foreach ($stationIds as $stationId) {
            $neighbors = $network->getNeighbors($stationId);

            foreach ($neighbors as $neighbor) {
                $distance = $network->getDirectDistance($stationId, $neighbor->stationId());
                $this->assertNotNull($distance);
                $this->assertGreaterThan(0, $distance->value());
            }
        }
    }

    public function testMobLineStationsAreConnected(): void
    {
        $network = $this->loader->load();

        // MOB line key stations should be connected
        $mobStations = ['MX', 'CL', 'LR', 'CD', 'GM', 'MSB', 'CH', 'RD', 'GD', 'ZW'];

        foreach ($mobStations as $station) {
            $stationId = StationId::fromString($station);
            if ($network->hasStation($stationId)) {
                $neighbors = $network->getNeighbors($stationId);
                $this->assertNotEmpty(
                    $neighbors,
                    "Station $station should have at least one neighbor"
                );
            }
        }
    }
}
