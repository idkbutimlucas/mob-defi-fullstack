<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Domain;

use App\Routing\Domain\Exception\NoRouteFoundException;
use App\Routing\Domain\Model\Network;
use App\Routing\Domain\Model\Segment;
use App\Routing\Domain\Model\Station;
use App\Routing\Domain\Service\DijkstraPathFinder;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class DijkstraPathFinderTest extends TestCase
{
    private DijkstraPathFinder $pathFinder;

    protected function setUp(): void
    {
        $this->pathFinder = new DijkstraPathFinder();
    }

    #[Test]
    public function it_finds_direct_path_between_adjacent_stations(): void
    {
        $network = $this->createNetwork(['MX', 'CGE']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('CGE')
        );

        $this->assertEquals(['MX', 'CGE'], $path->stationIds());
        $this->assertEquals(0.65, $path->totalDistance()->value());
    }

    #[Test]
    public function it_finds_path_through_intermediate_station(): void
    {
        $network = $this->createNetwork(['MX', 'CGE', 'VUAR']);
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

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('VUAR')
        );

        $this->assertEquals(['MX', 'CGE', 'VUAR'], $path->stationIds());
        $this->assertEquals(1.0, $path->totalDistance()->value());
    }

    #[Test]
    public function it_finds_shortest_path_when_multiple_routes_exist(): void
    {
        // Create a diamond-shaped network: MX -> A -> ZW (distance 3)
        //                                  MX -> B -> ZW (distance 10)
        $network = $this->createNetwork(['MX', 'A', 'B', 'ZW']);

        // Short path via A
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('A'),
            Distance::fromKilometers(1.0)
        ));
        $network->addSegment(Segment::create(
            StationId::fromString('A'),
            StationId::fromString('ZW'),
            Distance::fromKilometers(2.0)
        ));

        // Long path via B
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('B'),
            Distance::fromKilometers(5.0)
        ));
        $network->addSegment(Segment::create(
            StationId::fromString('B'),
            StationId::fromString('ZW'),
            Distance::fromKilometers(5.0)
        ));

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ZW')
        );

        $this->assertEquals(['MX', 'A', 'ZW'], $path->stationIds());
        $this->assertEquals(3.0, $path->totalDistance()->value());
    }

    #[Test]
    public function it_works_in_reverse_direction(): void
    {
        $network = $this->createNetwork(['MX', 'CGE', 'VUAR']);
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

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('VUAR'),
            StationId::fromString('MX')
        );

        $this->assertEquals(['VUAR', 'CGE', 'MX'], $path->stationIds());
        $this->assertEquals(1.0, $path->totalDistance()->value());
    }

    #[Test]
    public function it_throws_exception_when_no_path_exists(): void
    {
        $network = $this->createNetwork(['MX', 'CGE', 'ISOLATED']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));
        // ISOLATED has no connections

        $this->expectException(NoRouteFoundException::class);
        $this->expectExceptionMessage('No route found between station "MX" and station "ISOLATED"');

        $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ISOLATED')
        );
    }

    #[Test]
    public function it_finds_path_in_complex_network(): void
    {
        // Simulate a small MOB network
        $network = $this->createNetwork(['MX', 'CGE', 'VUAR', 'CH', 'LESAV', 'ZW']);

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
        $network->addSegment(Segment::create(
            StationId::fromString('VUAR'),
            StationId::fromString('CH'),
            Distance::fromKilometers(2.5)
        ));
        $network->addSegment(Segment::create(
            StationId::fromString('CH'),
            StationId::fromString('LESAV'),
            Distance::fromKilometers(10.0)
        ));
        $network->addSegment(Segment::create(
            StationId::fromString('LESAV'),
            StationId::fromString('ZW'),
            Distance::fromKilometers(20.0)
        ));

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('ZW')
        );

        $this->assertEquals(['MX', 'CGE', 'VUAR', 'CH', 'LESAV', 'ZW'], $path->stationIds());
        $this->assertEquals(33.5, $path->totalDistance()->value());
    }

    #[Test]
    public function it_returns_correct_segment_count(): void
    {
        $network = $this->createNetwork(['MX', 'CGE', 'VUAR']);
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

        $path = $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('VUAR')
        );

        $this->assertEquals(2, $path->segmentCount());
        $this->assertEquals(3, $path->stationCount());
    }

    #[Test]
    public function it_handles_same_start_and_end_station(): void
    {
        $network = $this->createNetwork(['MX', 'CGE']);
        $network->addSegment(Segment::create(
            StationId::fromString('MX'),
            StationId::fromString('CGE'),
            Distance::fromKilometers(0.65)
        ));

        $this->expectException(NoRouteFoundException::class);

        $this->pathFinder->findPath(
            $network,
            StationId::fromString('MX'),
            StationId::fromString('MX')
        );
    }

    /**
     * @param string[] $codes
     */
    private function createNetwork(array $codes): Network
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
