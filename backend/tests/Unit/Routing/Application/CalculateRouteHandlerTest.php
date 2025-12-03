<?php

declare(strict_types=1);

namespace App\Tests\Unit\Routing\Application;

use App\Routing\Application\Query\CalculateRouteHandler;
use App\Routing\Application\Query\CalculateRouteQuery;
use App\Routing\Domain\Exception\NoRouteFoundException;
use App\Routing\Domain\Exception\StationNotFoundException;
use App\Routing\Domain\Model\Network;
use App\Routing\Domain\Model\Path;
use App\Routing\Domain\Model\Segment;
use App\Routing\Domain\Model\Station;
use App\Routing\Domain\Service\NetworkLoaderInterface;
use App\Routing\Domain\Service\PathFinderInterface;
use App\Shared\Domain\Distance;
use App\Shared\Domain\StationId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class CalculateRouteHandlerTest extends TestCase
{
    #[Test]
    public function it_calculates_route_between_two_stations(): void
    {
        $network = $this->createTestNetwork();
        $expectedPath = Path::create(
            [StationId::fromString('MX'), StationId::fromString('CGE'), StationId::fromString('VUAR')],
            Distance::fromKilometers(1.0)
        );

        $networkLoader = $this->createMock(NetworkLoaderInterface::class);
        $networkLoader->method('load')->willReturn($network);

        $pathFinder = $this->createMock(PathFinderInterface::class);
        $pathFinder->method('findPath')->willReturn($expectedPath);

        $handler = new CalculateRouteHandler($networkLoader, $pathFinder);
        $query = new CalculateRouteQuery('MX', 'VUAR');

        $result = $handler->handle($query);

        $this->assertEquals(['MX', 'CGE', 'VUAR'], $result->stations);
        $this->assertEquals(1.0, $result->totalDistance);
        $this->assertEquals(2, $result->segmentCount);
    }

    #[Test]
    public function it_returns_station_names_in_result(): void
    {
        $network = $this->createTestNetwork();
        $expectedPath = Path::create(
            [StationId::fromString('MX'), StationId::fromString('CGE')],
            Distance::fromKilometers(0.65)
        );

        $networkLoader = $this->createMock(NetworkLoaderInterface::class);
        $networkLoader->method('load')->willReturn($network);

        $pathFinder = $this->createMock(PathFinderInterface::class);
        $pathFinder->method('findPath')->willReturn($expectedPath);

        $handler = new CalculateRouteHandler($networkLoader, $pathFinder);
        $query = new CalculateRouteQuery('MX', 'CGE');

        $result = $handler->handle($query);

        $this->assertEquals(['Montreux', 'College'], $result->stationNames);
    }

    #[Test]
    public function it_throws_exception_when_origin_station_not_found(): void
    {
        $network = $this->createTestNetwork();

        $networkLoader = $this->createMock(NetworkLoaderInterface::class);
        $networkLoader->method('load')->willReturn($network);

        $pathFinder = $this->createMock(PathFinderInterface::class);

        $handler = new CalculateRouteHandler($networkLoader, $pathFinder);
        $query = new CalculateRouteQuery('UNKNOWN', 'CGE');

        $this->expectException(StationNotFoundException::class);

        $handler->handle($query);
    }

    #[Test]
    public function it_throws_exception_when_destination_station_not_found(): void
    {
        $network = $this->createTestNetwork();

        $networkLoader = $this->createMock(NetworkLoaderInterface::class);
        $networkLoader->method('load')->willReturn($network);

        $pathFinder = $this->createMock(PathFinderInterface::class);

        $handler = new CalculateRouteHandler($networkLoader, $pathFinder);
        $query = new CalculateRouteQuery('MX', 'UNKNOWN');

        $this->expectException(StationNotFoundException::class);

        $handler->handle($query);
    }

    #[Test]
    public function it_throws_exception_when_no_route_found(): void
    {
        $network = $this->createTestNetwork();

        $networkLoader = $this->createMock(NetworkLoaderInterface::class);
        $networkLoader->method('load')->willReturn($network);

        $pathFinder = $this->createMock(PathFinderInterface::class);
        $pathFinder->method('findPath')->willThrowException(
            NoRouteFoundException::between(
                StationId::fromString('MX'),
                StationId::fromString('VUAR')
            )
        );

        $handler = new CalculateRouteHandler($networkLoader, $pathFinder);
        $query = new CalculateRouteQuery('MX', 'VUAR');

        $this->expectException(NoRouteFoundException::class);

        $handler->handle($query);
    }

    #[Test]
    public function it_normalizes_station_ids_to_uppercase(): void
    {
        $network = $this->createTestNetwork();
        $expectedPath = Path::create(
            [StationId::fromString('MX'), StationId::fromString('CGE')],
            Distance::fromKilometers(0.65)
        );

        $networkLoader = $this->createMock(NetworkLoaderInterface::class);
        $networkLoader->method('load')->willReturn($network);

        $pathFinder = $this->createMock(PathFinderInterface::class);
        $pathFinder->method('findPath')->willReturn($expectedPath);

        $handler = new CalculateRouteHandler($networkLoader, $pathFinder);
        $query = new CalculateRouteQuery('mx', 'cge');

        $result = $handler->handle($query);

        $this->assertEquals(['MX', 'CGE'], $result->stations);
    }

    private function createTestNetwork(): Network
    {
        $network = Network::create();

        $network->addStation(Station::create(StationId::fromString('MX'), 'Montreux'));
        $network->addStation(Station::create(StationId::fromString('CGE'), 'College'));
        $network->addStation(Station::create(StationId::fromString('VUAR'), 'Vuarennes'));

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

        return $network;
    }
}
