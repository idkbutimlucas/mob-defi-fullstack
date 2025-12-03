<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Domain;

use App\Routing\Domain\Exception\StationNotFoundException;
use App\Routing\Domain\Model\Network;
use App\Routing\Domain\Model\Segment;
use App\Routing\Domain\Model\Station;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class NetworkTest extends TestCase
{
    #[Test]
    public function it_can_be_created_empty(): void
    {
        $network = Network::create();

        $this->assertEquals(0, $network->stationCount());
        $this->assertEquals(0, $network->segmentCount());
    }

    #[Test]
    public function it_can_add_stations(): void
    {
        $network = Network::create();

        $network->addStation(Station::create(
            StationId::fromString('MX'),
            'Montreux'
        ));
        $network->addStation(Station::create(
            StationId::fromString('ZW'),
            'Zweisimmen'
        ));

        $this->assertEquals(2, $network->stationCount());
    }

    #[Test]
    public function it_can_check_if_station_exists(): void
    {
        $network = Network::create();
        $network->addStation(Station::create(
            StationId::fromString('MX'),
            'Montreux'
        ));

        $this->assertTrue($network->hasStation(StationId::fromString('MX')));
        $this->assertFalse($network->hasStation(StationId::fromString('ZW')));
    }

    #[Test]
    public function it_can_get_station_by_id(): void
    {
        $network = Network::create();
        $network->addStation(Station::create(
            StationId::fromString('MX'),
            'Montreux'
        ));

        $station = $network->getStation(StationId::fromString('MX'));

        $this->assertEquals('Montreux', $station->name());
    }

    #[Test]
    public function it_throws_exception_for_unknown_station(): void
    {
        $network = Network::create();

        $this->expectException(StationNotFoundException::class);
        $this->expectExceptionMessage('Station with id "UNKNOWN" not found');

        $network->getStation(StationId::fromString('UNKNOWN'));
    }

    #[Test]
    public function it_can_add_segments(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE', 'VUAR']);

        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));
        $network->addSegment(Segment::create(
            StationId::fromString('CGE'),
            StationId::fromString('VUAR'),
            Distance::fromKilometers(0.35)
        ));

        $this->assertEquals(2, $network->segmentCount());
    }

    #[Test]
    public function it_can_get_neighbors(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE', 'VUAR']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));
        $network->addSegment(Segment::create(
            StationId::fromString('CGE'),
            StationId::fromString('VUAR'),
            Distance::fromKilometers(0.35)
        ));

        $neighbors = $network->getNeighbors(StationId::fromString('CGE'));

        $this->assertCount(2, $neighbors);

        $neighborIds = array_map(fn($n) => $n->stationId()->value(), $neighbors);
        $this->assertContains('MX', $neighborIds);
        $this->assertContains('VUAR', $neighborIds);
    }

    #[Test]
    public function it_returns_correct_distance_to_neighbor(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));

        $neighbors = $network->getNeighbors(StationId::fromString('MX'));

        $this->assertCount(1, $neighbors);
        $this->assertEquals(0.65, $neighbors[0]->distance()->value());
    }

    #[Test]
    public function it_treats_segments_as_bidirectional(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));

        // Can go from MX to CGE
        $neighborsFromMx = $network->getNeighbors(StationId::fromString('MX'));
        $this->assertCount(1, $neighborsFromMx);
        $this->assertEquals('CGE', $neighborsFromMx[0]->stationId()->value());

        // Can also go from CGE to MX
        $neighborsFromCge = $network->getNeighbors(StationId::fromString('CGE'));
        $this->assertCount(1, $neighborsFromCge);
        $this->assertEquals('MX', $neighborsFromCge[0]->stationId()->value());
    }

    #[Test]
    public function it_can_get_direct_distance(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));

        $distance = $network->getDirectDistance(
            StationId::fromString('MX'),
            StationId::fromString('CGE')
        );

        $this->assertNotNull($distance);
        $this->assertEquals(0.65, $distance->value());
    }

    #[Test]
    public function it_returns_null_for_non_adjacent_stations(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE', 'VUAR']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));

        $distance = $network->getDirectDistance(
            StationId::fromString('MX'),
            StationId::fromString('VUAR')
        );

        $this->assertNull($distance);
    }

    #[Test]
    public function it_can_get_all_station_ids(): void
    {
        $network = $this->createNetworkWithStations(['MX', 'CGE', 'VUAR']);

        $stationIds = $network->getAllStationIds();

        $this->assertCount(3, $stationIds);
        $ids = array_map(fn($id) => $id->value(), $stationIds);
        $this->assertContains('MX', $ids);
        $this->assertContains('CGE', $ids);
        $this->assertContains('VUAR', $ids);
    }

    /**
     * @param string[] $codes
     */
    private function createNetworkWithStations(array $codes): Network
    {
        $network = Network::create();

        foreach ($codes as $code) {
            $network->addStation(Station::create(
                StationId::fromString($code),
                "Station $code"
            ));
        }

        return $network;
    }
}
