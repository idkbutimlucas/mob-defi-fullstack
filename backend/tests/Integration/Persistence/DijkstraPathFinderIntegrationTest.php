<?php

declare(strict_types=1);

namespace App\Tests\Integration\Persistence;

use App\Routing\Domain\Service\DijkstraPathFinder;
use App\Routing\Infrastructure\Persistence\JsonNetworkLoader;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\TestCase;

/**
 * Integration tests for DijkstraPathFinder with real network data.
 */
class DijkstraPathFinderIntegrationTest extends TestCase
{
    private DijkstraPathFinder $pathFinder;
    private JsonNetworkLoader $loader;

    protected function setUp(): void
    {
        $dataPath = dirname(__DIR__, 3) . '/../data';
        $this->loader = new JsonNetworkLoader(
            $dataPath . '/stations.json',
            $dataPath . '/distances.json'
        );
        $this->pathFinder = new DijkstraPathFinder();
    }

    public function testItFindsPathBetweenMontreuxAndZweisimmen(): void
    {
        $network = $this->loader->load();

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ZW')
        );

        $this->assertNotNull($path);
        $this->assertEquals('MX', $path->start()->value());
        $this->assertEquals('ZW', $path->end()->value());
        $this->assertGreaterThan(0, $path->totalDistance()->kilometers());
    }

    public function testItFindsPathInReverseDirection(): void
    {
        $network = $this->loader->load();

        $pathForward = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ZW')
        );

        $pathBackward = $this->pathFinder->findPath(
            $network,
            StationId::fromString('ZW'),
            StationId::fromString('MX')
        );

        // Distance should be the same in both directions
        $this->assertEquals(
            $pathForward->totalDistance()->kilometers(),
            $pathBackward->totalDistance()->kilometers()
        );
    }

    public function testItFindsShortPathBetweenAdjacentStations(): void
    {
        $network = $this->loader->load();

        // Find two adjacent stations from the network
        $stationIds = $network->getAllStationIds();
        $firstStation = $stationIds[0];
        $neighbors = $network->getNeighbors($firstStation);

        if (empty($neighbors)) {
            $this->markTestSkipped('No adjacent stations found');
        }

        $adjacentStationId = $neighbors[0]->stationId();

        $path = $this->pathFinder->findPath(
            $network,
            $firstStation,
            $adjacentStationId
        );

        $this->assertCount(2, $path->stations());
        $this->assertEquals(1, $path->segmentCount());
    }

    public function testItCalculatesReasonableDistanceForFullRoute(): void
    {
        $network = $this->loader->load();

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ZW')
        );

        // The MOB line from Montreux to Zweisimmen is approximately 60-70 km
        $distance = $path->totalDistance()->kilometers();
        $this->assertGreaterThan(50, $distance, 'Distance should be more than 50km');
        $this->assertLessThan(100, $distance, 'Distance should be less than 100km');
    }

    public function testPathSegmentsMatchStationCount(): void
    {
        $network = $this->loader->load();

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ZW')
        );

        // Number of segments should be one less than number of stations
        $this->assertEquals(
            $path->stationCount() - 1,
            $path->segmentCount()
        );
    }
}
