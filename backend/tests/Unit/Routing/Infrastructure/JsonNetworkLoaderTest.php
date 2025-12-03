<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Infrastructure;

use App\Routing\Infrastructure\Persistence\JsonNetworkLoader;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class JsonNetworkLoaderTest extends TestCase
{
    private string $fixturesPath;

    protected function setUp(): void
    {
        $this->fixturesPath = dirname(__DIR__, 3) . '/Fixtures';

        if (!is_dir($this->fixturesPath)) {
            mkdir($this->fixturesPath, 0755, true);
        }
    }

    #[Test]
    public function it_loads_stations_from_json(): void
    {
        $this->createStationsFixture([
            ['id' => 1, 'shortName' => 'MX', 'longName' => 'Montreux'],
            ['id' => 2, 'shortName' => 'ZW', 'longName' => 'Zweisimmen'],
        ]);
        $this->createDistancesFixture([]);

        $loader = new JsonNetworkLoader(
            $this->fixturesPath . '/stations.json',
            $this->fixturesPath . '/distances.json'
        );

        $network = $loader->load();

        $this->assertEquals(2, $network->stationCount());
        $this->assertTrue($network->hasStation(StationId::fromString('MX')));
        $this->assertTrue($network->hasStation(StationId::fromString('ZW')));
    }

    #[Test]
    public function it_loads_station_names_correctly(): void
    {
        $this->createStationsFixture([
            ['id' => 1, 'shortName' => 'MX', 'longName' => 'Montreux'],
        ]);
        $this->createDistancesFixture([]);

        $loader = new JsonNetworkLoader(
            $this->fixturesPath . '/stations.json',
            $this->fixturesPath . '/distances.json'
        );

        $network = $loader->load();
        $station = $network->getStation(StationId::fromString('MX'));

        $this->assertEquals('Montreux', $station->name());
    }

    #[Test]
    public function it_loads_segments_from_json(): void
    {
        $this->createStationsFixture([
            ['id' => 1, 'shortName' => 'MX', 'longName' => 'Montreux'],
            ['id' => 2, 'shortName' => 'CGE', 'longName' => 'Montreux-Collège'],
            ['id' => 3, 'shortName' => 'VUAR', 'longName' => 'Vuarennes'],
        ]);
        $this->createDistancesFixture([
            [
                'name' => 'MOB',
                'distances' => [
                    ['parent' => 'MX', 'child' => 'CGE', 'distance' => 0.65],
                    ['parent' => 'CGE', 'child' => 'VUAR', 'distance' => 0.35],
                ],
            ],
        ]);

        $loader = new JsonNetworkLoader(
            $this->fixturesPath . '/stations.json',
            $this->fixturesPath . '/distances.json'
        );

        $network = $loader->load();

        $this->assertEquals(2, $network->segmentCount());
    }

    #[Test]
    public function it_creates_bidirectional_connections(): void
    {
        $this->createStationsFixture([
            ['id' => 1, 'shortName' => 'MX', 'longName' => 'Montreux'],
            ['id' => 2, 'shortName' => 'CGE', 'longName' => 'Montreux-Collège'],
        ]);
        $this->createDistancesFixture([
            [
                'name' => 'MOB',
                'distances' => [
                    ['parent' => 'MX', 'child' => 'CGE', 'distance' => 0.65],
                ],
            ],
        ]);

        $loader = new JsonNetworkLoader(
            $this->fixturesPath . '/stations.json',
            $this->fixturesPath . '/distances.json'
        );

        $network = $loader->load();

        // Can get neighbors from both directions
        $neighborsFromMx = $network->getNeighbors(StationId::fromString('MX'));
        $neighborsFromCge = $network->getNeighbors(StationId::fromString('CGE'));

        $this->assertCount(1, $neighborsFromMx);
        $this->assertCount(1, $neighborsFromCge);
    }

    #[Test]
    public function it_loads_multiple_lines(): void
    {
        $this->createStationsFixture([
            ['id' => 1, 'shortName' => 'MX', 'longName' => 'Montreux'],
            ['id' => 2, 'shortName' => 'CGE', 'longName' => 'Montreux-Collège'],
            ['id' => 3, 'shortName' => 'VV', 'longName' => 'Vevey'],
            ['id' => 4, 'shortName' => 'BLON', 'longName' => 'Blonay'],
        ]);
        $this->createDistancesFixture([
            [
                'name' => 'MOB',
                'distances' => [
                    ['parent' => 'MX', 'child' => 'CGE', 'distance' => 0.65],
                ],
            ],
            [
                'name' => 'MVR-ce',
                'distances' => [
                    ['parent' => 'VV', 'child' => 'BLON', 'distance' => 5.0],
                ],
            ],
        ]);

        $loader = new JsonNetworkLoader(
            $this->fixturesPath . '/stations.json',
            $this->fixturesPath . '/distances.json'
        );

        $network = $loader->load();

        $this->assertEquals(4, $network->stationCount());
        $this->assertEquals(2, $network->segmentCount());
    }

    /**
     * @param array<array{id: int, shortName: string, longName: string}> $stations
     */
    private function createStationsFixture(array $stations): void
    {
        file_put_contents(
            $this->fixturesPath . '/stations.json',
            json_encode($stations, JSON_PRETTY_PRINT)
        );
    }

    /**
     * @param array<array{name: string, distances: array<array{parent: string, child: string, distance: float}>}> $lines
     */
    private function createDistancesFixture(array $lines): void
    {
        file_put_contents(
            $this->fixturesPath . '/distances.json',
            json_encode($lines, JSON_PRETTY_PRINT)
        );
    }

    protected function tearDown(): void
    {
        @unlink($this->fixturesPath . '/stations.json');
        @unlink($this->fixturesPath . '/distances.json');
    }
}
